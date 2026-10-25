from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.db.models import Count
from django.core.paginator import Paginator
from .models import InspectionRecord
from .serializers import InspectionRecordSerializer, ClassifyRequestSerializer
from ai_model.model_loader import ModelUnavailableError, predict_image
from ai_model.preprocessor import validate_image
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from .serializers import (
    DashboardStatsResponseSerializer,
    ErrorResponseSerializer,
    InspectionHistoryResponseSerializer,
    InspectionMapPointSerializer,
    LoginRequestSerializer,
    LoginResponseSerializer,
)


def api_v1_root(_request):
    return JsonResponse({
        'message': 'RoadPulse API is running',
        'endpoints': {
            'classify': '/api/v1/classify/',
            'dashboard_stats': '/api/v1/dashboard/stats/',
            'dashboard_history': '/api/v1/dashboard/history/',
            'dashboard_map': '/api/v1/dashboard/map/',
            'login': '/api/v1/auth/login/',
            'openapi_schema': '/api/schema/',
            'swagger_ui': '/api/docs/',
            'redoc': '/api/redoc/',
        },
    })


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='login',
        summary='Masuk dan memperoleh token API',
        request=LoginRequestSerializer,
        responses={
            200: LoginResponseSerializer,
            401: OpenApiResponse(response=ErrorResponseSerializer, description='Username atau kata sandi salah.'),
        },
    )
    def post(self, request):
        user = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password'),
        )
        if not user:
            return Response({'error': 'Username atau kata sandi salah'},
                            status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})

class ClassifyView(APIView):
    """
    API endpoint for image classification
    POST /api/v1/classify/
    """
    
    @extend_schema(
        operation_id='classifyImage',
        summary='Klasifikasikan gambar kondisi jalan',
        description='Unggah gambar JPEG/PNG (maksimal 10 MB). Data GPS dan waktu foto bersifat opsional.',
        request={
            'multipart/form-data': ClassifyRequestSerializer,
        },
        responses={
            201: InspectionRecordSerializer,
            400: OpenApiResponse(response=ErrorResponseSerializer, description='Data atau gambar tidak valid.'),
            503: OpenApiResponse(response=ErrorResponseSerializer, description='Model klasifikasi belum tersedia.'),
            500: OpenApiResponse(description='Terjadi kesalahan saat melakukan prediksi.'),
        },
    )
    def post(self, request):
        # Validate request data
        serializer = ClassifyRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = serializer.validated_data['image']
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        location_name = serializer.validated_data.get('location_name', '')
        captured_at = serializer.validated_data.get('captured_at')
        
        # Validate image
        is_valid, error_msg = validate_image(image_file)
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create inspection record (save image first)
        inspection = InspectionRecord(
            image=image_file,
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            captured_at=captured_at,
            class_label='Processing',  # Temporary
            confidence_score=0.0
        )
        inspection.save()
        
        try:
            # Get prediction from AI model
            prediction = predict_image(inspection.image.path)
            
            # Update inspection record with prediction
            inspection.class_label = prediction['class_label']
            inspection.confidence_score = prediction['confidence_score']
            inspection.save()
            
            # Return response
            response_serializer = InspectionRecordSerializer(inspection)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except ModelUnavailableError as e:
            inspection.delete()
            return Response(
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            # Clean up if prediction fails
            inspection.delete()
            return Response(
                {'error': 'Prediction failed', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardStatsView(APIView):
    """
    API endpoint for dashboard statistics
    GET /api/v1/dashboard/stats/
    """
    
    @extend_schema(
        operation_id='getDashboardStats',
        summary='Ambil statistik dashboard',
        responses=DashboardStatsResponseSerializer,
    )
    def get(self, request):
        # Get total inspections
        total_inspections = InspectionRecord.objects.count()
        
        # Get class distribution
        class_distribution = {}
        class_counts = InspectionRecord.objects.values('class_label').annotate(
            count=Count('id')
        )
        
        for item in class_counts:
            class_distribution[item['class_label']] = item['count']
        
        # Ensure all classes are present (even with 0 count)
        for class_name in ['Crack', 'Pothole', 'Surface Erosion', 'Normal']:
            if class_name not in class_distribution:
                class_distribution[class_name] = 0
        
        # Get recent inspections
        recent_inspections = InspectionRecord.objects.all()[:5]
        recent_serializer = InspectionRecordSerializer(recent_inspections, many=True)
        
        return Response({
            'total_inspections': total_inspections,
            'class_distribution': class_distribution,
            'recent_inspections': recent_serializer.data
        })


class InspectionHistoryView(APIView):
    """Return a page of saved inspections for the dashboard history table."""

    @extend_schema(
        operation_id='getInspectionHistory',
        summary='Ambil riwayat inspeksi',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Nomor halaman.'),
        ],
        responses=InspectionHistoryResponseSerializer,
    )
    def get(self, request):
        page = Paginator(InspectionRecord.objects.all(), 10).get_page(
            request.query_params.get('page', 1)
        )
        serializer = InspectionRecordSerializer(
            page.object_list, many=True, context={'request': request}
        )
        return Response({
            'results': serializer.data,
            'page': page.number,
            'total_pages': page.paginator.num_pages,
            'total_records': page.paginator.count,
        })


class InspectionMapView(APIView):
    """Return recent geotagged inspections for the dashboard map."""

    @extend_schema(
        operation_id='getInspectionMap',
        summary='Ambil titik inspeksi untuk peta',
        responses={200: InspectionMapPointSerializer(many=True)},
    )
    def get(self, request):
        points = InspectionRecord.objects.exclude(
            latitude__isnull=True
        ).exclude(
            longitude__isnull=True
        ).values(
            'id', 'class_label', 'confidence_score', 'latitude', 'longitude',
            'location_name', 'captured_at', 'created_at'
        )[:1000]
        return Response(list(points))
