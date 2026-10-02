# 🛣️ RoadPulse - AI-Powered Road Damage Classification System

RoadPulse adalah sistem AI lengkap untuk mendeteksi dan mengklasifikasikan kerusakan jalan menggunakan computer vision. Sistem terdiri dari Django REST API backend, web dashboard, dan mobile application untuk inspeksi lapangan.

## 🎯 Fitur Utama

- **Klasifikasi AI**: Mendeteksi 4 jenis kondisi jalan:
  - 🔴 **Crack** - Retakan linear di permukaan
  - 🔴 **Pothole** - Lubang pada permukaan jalan
  - 🟡 **Surface Erosion** - Pengikisan permukaan jalan
  - 🟢 **Normal** - Tidak ada kerusakan terlihat

- **Web Dashboard**: Upload gambar dan lihat statistik dengan grafik interaktif
- **Mobile App**: Ambil foto dengan koordinat GPS di lapangan
- **Analisis Real-time**: Klasifikasi instan dengan skor confidence
- **Location Tracking**: Koordinat GPS untuk pemetaan kerusakan

## 🏗️ Arsitektur

```
RoadPulse/
├── backend/           # Django REST API + AI Model
│   ├── api/          # REST endpoints
│   ├── ai_model/     # MobileNetV2 integration
│   ├── roadpulse/    # Django project settings
│   └── media/        # Uploaded images
├── frontend/         # Web Dashboard
│   ├── index.html
│   ├── css/style.css
│   └── js/           # Vanilla JS + Chart.js
└── mobile/           # React Native Expo App
    ├── App.js
    └── screens/      # Camera screen
```

## 🛠️ Tech Stack

**Backend:** Python 3.14, Django 6.1, DRF, Pillow, NumPy, Mock MobileNetV2
**Frontend:** HTML5/CSS3/JavaScript ES6+, Chart.js 4.4
**Mobile:** React Native 0.86, Expo 57, expo-camera, expo-location, Axios

## 📦 Instalasi

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend: **http://localhost:8000**

### 2. Frontend Setup
```bash
cd frontend
open index.html  # atau: python -m http.server 3000
```
Frontend: **http://localhost:3000**

### 3. Mobile Setup
```bash
cd mobile
npm install
npx expo install expo-camera expo-location axios
npx expo start
```
Scan QR code dengan **Expo Go** app (iOS/Android).

**Penting:** Update `API_BASE_URL` di `mobile/screens/CameraScreen.js` dengan IP lokal Anda (bukan localhost).

## 📡 API Endpoints

### POST `/api/v1/classify/`
```bash
curl -X POST http://localhost:8000/api/v1/classify/ \
  -F "image=@road.jpg" \
  -F "latitude=-6.2088" \
  -F "longitude=106.8456"
```

**Response:**
```json
{
  "id": 1,
  "class_label": "Pothole",
  "confidence_score": 0.89,
  "image_url": "/media/uploads/road.jpg",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "created_at": "2026-09-25T03:15:00Z"
}
```

### GET `/api/v1/dashboard/stats/`
```json
{
  "total_inspections": 127,
  "class_distribution": {
    "Crack": 35,
    "Pothole": 42,
    "Surface Erosion": 28,
    "Normal": 22
  },
  "recent_inspections": [...]
}
```

## 🤖 AI Model

Saat ini menggunakan **mock MobileNetV2** yang menghasilkan prediksi random untuk demonstrasi.

**Untuk model terlatih:**
1. Train MobileNetV2 pada dataset kerusakan jalan
2. Simpan weights ke `backend/ai_model/mobilenetv2_road_damage.h5`
3. Update `backend/ai_model/model_loader.py` dengan TensorFlow/Keras

## 🚦 Production Deployment

**Backend:** Set DEBUG=False, gunakan PostgreSQL, nginx, Gunicorn, HTTPS
**Frontend:** Deploy ke Vercel/Netlify dengan CDN
**Mobile:** Build APK/IPA via Expo EAS, publish ke Play Store/App Store

## 🐛 Troubleshooting

- **Backend error:** Pastikan Python 3.10+, venv aktif, run migrations
- **Frontend can't connect:** Cek backend running, CORS enabled
- **Mobile error:** Update API_BASE_URL dengan IP lokal, pastikan WiFi sama

## 📝 License

MIT License

## 👥 Contributors

Kelompok 5 - Internet Programming 2

---

Built with ❤️ for better road infrastructure monitoring
