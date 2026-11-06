import io
import shutil
import tempfile
from unittest import mock

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import DatabaseError
from django.test import override_settings
from PIL import Image
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from ai_model.model_loader import ModelUnavailableError
from .models import InspectionRecord

MEDIA = tempfile.mkdtemp(prefix='roadpulse-test-media-')
FAKE_PREDICTION = {'class_label': 'Pothole', 'confidence_score': 0.87}


def image_file(name='jalan.png', fmt='PNG', size=(64, 48), mode='RGB'):
    buf = io.BytesIO()
    Image.new(mode, size, (90, 90, 90)).save(buf, format=fmt)
    content_type = 'image/png' if fmt == 'PNG' else 'image/jpeg'
    return SimpleUploadedFile(name, buf.getvalue(), content_type=content_type)


class BaseTest(APITestCase):
    def setUp(self):
        cache.clear()  # reset penghitung throttle antar test

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA, ignore_errors=True)


@override_settings(MEDIA_ROOT=MEDIA)
class ClassifyTests(BaseTest):
    url = '/api/v1/classify/'

    @mock.patch('api.views.predict_image', return_value=FAKE_PREDICTION)
    def test_classify_saves_record(self, _pred):
        res = self.client.post(self.url, {
            'image': image_file(), 'latitude': -5.39, 'longitude': 105.26, 'location_name': 'Jl. Teuku Umar',
        }, format='multipart')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.json()['class_label'], 'Pothole')
        rec = InspectionRecord.objects.get()
        self.assertEqual(rec.location_name, 'Jl. Teuku Umar')
        self.assertAlmostEqual(rec.confidence_score, 0.87)

    @mock.patch('api.views.predict_image', return_value=FAKE_PREDICTION)
    def test_classify_accepts_jpeg(self, _pred):
        res = self.client.post(self.url, {'image': image_file('a.jpg', 'JPEG')}, format='multipart')
        self.assertEqual(res.status_code, 201, res.content)

    def test_classify_requires_image(self):
        res = self.client.post(self.url, {}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.json())

    def test_classify_rejects_non_image(self):
        bad = SimpleUploadedFile('catatan.txt', b'bukan gambar', content_type='text/plain')
        res = self.client.post(self.url, {'image': bad}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(InspectionRecord.objects.count(), 0)

    @mock.patch('api.views.predict_image', side_effect=ModelUnavailableError('Model tidak ada'))
    def test_model_unavailable_returns_503_and_cleans_up(self, _pred):
        res = self.client.post(self.url, {'image': image_file()}, format='multipart')
        self.assertEqual(res.status_code, 503)
        self.assertEqual(res.json()['error'], 'Model tidak ada')
        self.assertEqual(InspectionRecord.objects.count(), 0)

    @mock.patch('api.views.predict_image', side_effect=RuntimeError('boom'))
    def test_prediction_failure_returns_json_500(self, _pred):
        res = self.client.post(self.url, {'image': image_file()}, format='multipart')
        self.assertEqual(res.status_code, 500)
        self.assertEqual(res['Content-Type'], 'application/json')
        self.assertEqual(InspectionRecord.objects.count(), 0)

    def test_database_failure_returns_json_not_html(self):
        with mock.patch('api.views.InspectionRecord.save', side_effect=DatabaseError('db down')):
            res = self.client.post(self.url, {'image': image_file()}, format='multipart')
        self.assertEqual(res.status_code, 503)
        self.assertEqual(res['Content-Type'], 'application/json')
        self.assertIn('database', res.json()['error'])


@override_settings(MEDIA_ROOT=MEDIA)
class DashboardTests(BaseTest):
    def setUp(self):
        super().setUp()
        for i, label in enumerate(['Crack', 'Pothole', 'Normal'] * 4):
            InspectionRecord.objects.create(image=f'uploads/t{i}.jpg', class_label=label, confidence_score=0.9,
                                            latitude=-5.4 if i % 2 else None, longitude=105.2 if i % 2 else None)

    def test_stats(self):
        data = self.client.get('/api/v1/dashboard/stats/').json()
        self.assertEqual(data['total_inspections'], 12)
        self.assertEqual(data['class_distribution']['Surface Erosion'], 0)
        self.assertEqual(data['class_distribution']['Crack'], 4)

    def test_history_paginates_10(self):
        p1 = self.client.get('/api/v1/dashboard/history/?page=1').json()
        p2 = self.client.get('/api/v1/dashboard/history/?page=2').json()
        self.assertEqual(len(p1['results']), 10)
        self.assertEqual(len(p2['results']), 2)
        self.assertEqual(p1['total_records'], 12)

    def test_map_only_points_with_gps(self):
        points = self.client.get('/api/v1/dashboard/map/').json()
        self.assertEqual(len(points), 6)


class AuthTests(BaseTest):
    def test_register_then_login(self):
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'petugas_kedaton', 'password': 'JalanRusak#2026', 'password_confirm': 'JalanRusak#2026',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertTrue(Token.objects.filter(key=res.json()['token']).exists())
        self.assertFalse(User.objects.get(username='petugas_kedaton').is_staff)

        res = self.client.post('/api/v1/auth/login/', {'username': 'petugas_kedaton', 'password': 'JalanRusak#2026'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['username'], 'petugas_kedaton')

    def test_register_rejects_duplicate_username_case_insensitive(self):
        User.objects.create_user('Budi', password='x')
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'budi', 'password': 'JalanRusak#2026', 'password_confirm': 'JalanRusak#2026',
        }, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('username', res.json()['fields'])

    def test_register_rejects_mismatch_and_weak_password(self):
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'andi', 'password': 'JalanRusak#2026', 'password_confirm': 'beda',
        }, format='json')
        self.assertIn('password_confirm', res.json()['fields'])
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'andi', 'password': '12345678', 'password_confirm': '12345678',
        }, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('password', res.json()['fields'])

    def test_register_rejects_invalid_username(self):
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'a b', 'password': 'JalanRusak#2026', 'password_confirm': 'JalanRusak#2026',
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_login_wrong_password(self):
        User.objects.create_user('siti', password='JalanRusak#2026')
        res = self.client.post('/api/v1/auth/login/', {'username': 'siti', 'password': 'salah'}, format='json')
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()['error'], 'Username atau kata sandi salah')


class ThrottleTests(BaseTest):
    def test_login_is_rate_limited(self):
        codes = [self.client.post('/api/v1/auth/login/', {'username': 'x', 'password': 'y'}, format='json').status_code
                 for _ in range(11)]
        self.assertEqual(codes[:10], [401] * 10)
        self.assertEqual(codes[10], 429)
        res = self.client.post('/api/v1/auth/login/', {'username': 'x', 'password': 'y'}, format='json')
        self.assertIn('Terlalu banyak percobaan', res.json()['error'])

    def test_register_is_rate_limited(self):
        codes = []
        for i in range(6):
            codes.append(self.client.post('/api/v1/auth/register/', {
                'username': f'user{i}', 'password': 'JalanRusak#2026', 'password_confirm': 'JalanRusak#2026',
            }, format='json').status_code)
        self.assertEqual(codes, [201] * 5 + [429])

    def test_limit_is_per_client_ip_behind_proxy(self):
        for _ in range(10):
            self.client.post('/api/v1/auth/login/', {'username': 'x', 'password': 'y'}, format='json',
                             HTTP_X_FORWARDED_FOR='192.168.1.13')
        blocked = self.client.post('/api/v1/auth/login/', {'username': 'x', 'password': 'y'}, format='json',
                                   HTTP_X_FORWARDED_FOR='192.168.1.13')
        other = self.client.post('/api/v1/auth/login/', {'username': 'x', 'password': 'y'}, format='json',
                                 HTTP_X_FORWARDED_FOR='192.168.1.50')
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(other.status_code, 401)
