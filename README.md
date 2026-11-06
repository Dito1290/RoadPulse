# 🛣️ RoadPulse - AI-Powered Road Damage Classification System

RoadPulse adalah sistem AI untuk mendeteksi dan mengklasifikasikan kerusakan jalan di Bandar Lampung menggunakan computer vision. Sistem terdiri dari Django REST API backend (dengan model MobileNetV2 PyTorch), proxy API Node.js, web dashboard, dan aplikasi mobile Expo untuk inspeksi lapangan.

## 🎯 Fitur Utama

- **Klasifikasi AI**: Mendeteksi 4 jenis kondisi jalan:
  - 🔴 **Crack** - Retakan linear di permukaan
  - 🔴 **Pothole** - Lubang pada permukaan jalan
  - 🟡 **Surface Erosion** - Pengikisan permukaan jalan
  - 🟢 **Normal** - Tidak ada kerusakan terlihat
- **Web Dashboard**: Upload gambar (GPS & waktu dibaca dari EXIF), statistik Chart.js, riwayat, dan peta Leaflet
- **Mobile App**: Ambil foto dengan kamera + koordinat GPS di lapangan, ringkasan dan riwayat inspeksi
- **Dokumentasi API**: Swagger UI / ReDoc / OpenAPI (drf-spectacular)
- **User Manual**: panduan lengkap pengguna & admin di [`USERMANUAL/USERMANUAL_RoadPulse.pdf`](USERMANUAL/USERMANUAL_RoadPulse.pdf) (versi Word: `.docx`)

## 🏗️ Arsitektur & Port

```
 HP (Expo Go) ──┐
                ├──>  proxy.js  0.0.0.0:8000  ──>  Django  127.0.0.1:8001  ──>  PostgreSQL :5432
 Browser ───────┘     (LAN, CORS)                  (API + model AI)            (atau SQLite)

 Frontend statis  http://localhost:3000   (memanggil API di http://<host-halaman>:8000)
 Metro / Expo     port 8081
```

| Service | Alamat | Keterangan |
|---|---|---|
| Django (`runserver`) | `127.0.0.1:8001` | Hanya lokal; jangan diakses langsung oleh client |
| Proxy API (`backend/proxy.js`) | `0.0.0.0:8000` | **Satu-satunya alamat API untuk semua client** (frontend & mobile) |
| Frontend | `http://localhost:3000` | `python3 -m http.server 3000` |
| Expo dev server | `8081` | `npx expo start` |

Port proxy bisa diubah lewat env `PROXY_PORT`, `DJANGO_PORT`, `DJANGO_HOST` (default 8000 → 127.0.0.1:8001).

```
RoadPulse/
├── backend/
│   ├── ai_model/       # model_loader.py, preprocessor.py, train.py, mobilenetv2_road_damage.pt
│   ├── api/            # REST endpoints, serializers, model InspectionRecord
│   ├── roadpulse/      # settings.py, urls.py
│   ├── media/uploads/  # gambar hasil upload (data lokal, tidak di-commit)
│   ├── proxy.js        # proxy API Node.js (8000 -> 8001)
│   ├── requirements.txt
│   ├── .env.example    # contoh konfigurasi; salin ke .env (tidak di-commit)
│   └── venv311/        # virtualenv Python 3.11 (dipakai proyek)
├── frontend/           # index.html, login.html, js/config.js (alamat API), js/app.js, js/dashboard.js
├── mobile/             # App.js, config.js, screens/, components/, theme/, services/
├── USERMANUAL/         # User Manual (.docx & .pdf) + source/ untuk membangun ulang
├── docs/               # dokumen desain & audit aplikasi mobile
├── dataset/            # Crack/, Normal/, Pothole/, Surface Erosion/ (untuk training)
├── deploy/             # paket produksi: docker-compose.yml, Caddyfile, .env.example, README.md
└── start.sh            # menjalankan semua layanan dengan satu perintah (development)
```

## 🛠️ Tech Stack (sesuai file proyek)

**Backend** (`backend/requirements.txt`): Python 3.11, Django 4.2.7, Django REST Framework 3.14.0, drf-spectacular 0.28.0, django-cors-headers 4.3.1, python-dotenv 1.0.1, psycopg2-binary 2.9.10, Pillow 10.1.0, NumPy 1.24.3, PyTorch 2.2.2, torchvision 0.17.2
**Database**: PostgreSQL (default), opsional SQLite (`DB_ENGINE=sqlite`)
**Proxy**: Node.js (modul bawaan `http`, tanpa dependency)
**Frontend**: HTML/CSS/JavaScript, Chart.js 4.4.0, Leaflet 1.9.4, exifr 7.1.3 (via CDN)
**Mobile** (`mobile/package.json`): Expo SDK 58 (`expo` 58.0.x), React Native 0.88.0, React 19.3.0, expo-camera, expo-location, expo-status-bar, react-native-safe-area-context

## ✅ Prasyarat (macOS)

- Python 3.11 (virtualenv `backend/venv311` sudah berisi PyTorch; folder `backend/venv` memakai Python 3.14 tanpa PyTorch, **jangan dipakai**)
- PostgreSQL berjalan di `127.0.0.1:5432` (mis. PostgreSQL 18 installer EDB atau Postgres.app) — atau pakai SQLite
- Node.js LTS (≥ 20) dan npm
- HP dengan aplikasi **Expo Go** versi yang mendukung SDK 58, terhubung ke **Wi-Fi yang sama** dengan Mac

## 📦 Instalasi (sekali saja)

### 1. Backend

```bash
cd backend
# Jika venv311 belum ada: python3.11 -m venv venv311
source venv311/bin/activate
pip install -r requirements.txt
```

Buat file konfigurasi dari contoh, lalu sesuaikan `DB_PASSWORD` dengan kata sandi PostgreSQL Anda (proyek ini memakai `roadpulse`):

```bash
cp .env.example .env
```

Buat database (PostgreSQL 18 installer EDB; masukkan password user `postgres` saat diminta):

```bash
/Library/PostgreSQL/18/bin/createdb -U postgres -h localhost Roadpulse_db
```

Migrasi dan akun admin:

```bash
python manage.py migrate
python manage.py createsuperuser   # untuk /admin/ dan login dashboard
```

> **Database tidak ikut di repo.** Data (akun & inspeksi) hanya ada di database lokal masing-masing, jadi setiap anggota tim menjalankan `migrate` dan `createsuperuser` sendiri. Model AI `backend/ai_model/mobilenetv2_road_damage.pt` juga tidak di-commit (`*.pt` di `.gitignore`): minta file-nya ke tim atau latih ulang (lihat [AI Model](#-ai-model)), tanpa file ini endpoint classify mengembalikan 503.

> **Memakai SQLite saja** (tanpa PostgreSQL): tambahkan `DB_ENGINE=sqlite` di depan perintah atau di `backend/.env`, mis. `DB_ENGINE=sqlite python manage.py migrate`. File default: `backend/db.sqlite3` (bisa diganti dengan `SQLITE_PATH`).

### Membuka database PostgreSQL

| Isian | Nilai |
|---|---|
| Host / Port | `localhost` / `5432` |
| Username / Password | `postgres` / `roadpulse` |
| Database | `Roadpulse_db` |

- **pgAdmin 4**: Servers → PostgreSQL 18 (password `roadpulse`) → Databases → Roadpulse_db → Schemas → public → Tables → klik kanan tabel → View/Edit Data → All Rows.
- **Terminal**: `/Library/PostgreSQL/18/bin/psql -U postgres -h localhost -d Roadpulse_db`, lalu `\dt` (daftar tabel), `select * from api_inspectionrecord limit 5;`, `\q` (keluar).

Password `roadpulse` hanya untuk pengembangan lokal; gunakan password kuat di server.

### 2. Mobile

```bash
cd mobile
npm install
cp .env.example .env.local
```

Isi `mobile/.env.local` dengan **IP LAN Mac** (bukan `localhost`):

```bash
ipconfig getifaddr en0          # Wi-Fi; contoh hasil: 192.168.1.10
# mobile/.env.local
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

Saat dijalankan lewat Expo Go, aplikasi **otomatis** memakai IP Mac yang menjalankan `npx expo start` (port 8000), jadi tetap jalan walau pindah Wi-Fi/hotspot. `EXPO_PUBLIC_API_URL` dipakai jika IP itu tidak bisa dideteksi (mis. `--tunnel`) atau tidak bisa dijangkau. Nilai `EXPO_PUBLIC_*` dibaca Expo saat bundling: setelah mengubahnya, jalankan `npx expo start --clear`. Alamat juga bisa diganti langsung di aplikasi lewat tombol status server (pojok kanan atas).

## 🚀 Menjalankan (satu perintah)

```bash
./start.sh              # Django :8001 + proxy :8000 + web :3000 + Expo (QR)
./start.sh --no-mobile  # tanpa Expo
```

`start.sh` membebaskan port lama, memakai PostgreSQL (pakai SQLite dengan `DB_ENGINE=sqlite ./start.sh`), menulis IP LAN ke `mobile/.env.local`, dan menyimpan log di `.logs/`. Ctrl+C mematikan semuanya.

### Manual (4 terminal terpisah)

**Terminal 1 — Django API (port 8001)**
```bash
cd backend
source venv311/bin/activate
python manage.py runserver 127.0.0.1:8001
```

**Terminal 2 — Proxy API (port 8000, bisa diakses dari LAN)**
```bash
cd backend
node proxy.js
# RoadPulse API Proxy listening on 0.0.0.0:8000 -> 127.0.0.1:8001
```

**Terminal 3 — Web dashboard (port 3000)**
```bash
cd frontend
python3 -m http.server 3000
```

**Terminal 4 — Mobile (Expo)**
```bash
cd mobile
npx expo start
```
Scan QR code dengan Expo Go (Android) atau aplikasi Kamera (iOS).

### URL lokal

| Halaman | URL |
|---|---|
| Web dashboard | http://localhost:3000 |
| Login dashboard (wajib sebelum membuka data) | http://localhost:3000/login.html |
| API root | http://localhost:8000/api/v1/ |
| Swagger UI | http://localhost:8000/api/docs/ |
| ReDoc | http://localhost:8000/api/redoc/ |
| OpenAPI schema | http://localhost:8000/api/schema/ |
| Django admin | http://localhost:8000/admin/ |
| Dari HP / perangkat lain | `http://<IP-LAN-Mac>:8000/api/v1/` dan `http://<IP-LAN-Mac>:3000` |

Frontend otomatis memanggil API di `http://<hostname halaman>:8000`, jadi dashboard yang dibuka dari `http://<IP-LAN-Mac>:3000` juga berfungsi. Override manual (di console browser): `localStorage.setItem('rp_api_origin', 'http://192.168.1.10:8000')`.

## ⚙️ Konfigurasi env

`backend/.env` (dibaca oleh `settings.py` via python-dotenv). Variabel yang dikenali:

| Variabel | Default | Fungsi |
|---|---|---|
| `SECRET_KEY` | kunci dev | Kunci Django |
| `DEBUG` | `True` | Mode debug (`True`/`False`) |
| `ALLOWED_HOSTS` | `*` | Dipisah koma. Saat `DEBUG=True`, IP LAN komputer otomatis diizinkan dan dibaca ulang tiap request (matikan dengan `ALLOW_LAN_HOSTS=False`) |
| `DB_ENGINE` | `postgresql` | `postgresql` atau `sqlite` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | `roadpulse_db`, `postgres`, kosong, `127.0.0.1`, `5432` | Koneksi PostgreSQL (nilai proyek ada di `backend/.env.example`) |
| `SQLITE_PATH` | `backend/db.sqlite3` | Lokasi file SQLite bila `DB_ENGINE=sqlite` |
| `THROTTLE_LOGIN`, `THROTTLE_REGISTER`, `THROTTLE_CLASSIFY` | `10/min`, `5/hour`, `120/hour` | Batas percobaan login/daftar per IP dan unggah foto per akun |
| `CORS_ALLOWED_ORIGINS` | kosong | Produksi: domain lain yang boleh memanggil API (dipisah koma) |
| `CSRF_TRUSTED_ORIGINS` | kosong | Produksi: mis. `https://roadpulse.contoh.id` untuk login Django Admin |
| `PRIVACY_CONTACT_EMAIL` | kosong | Email kontak di halaman `/privacy/` |
| `NUM_PROXIES` | `1` | Jumlah reverse proxy di depan Django (proxy.js atau Caddy) |

`mobile/.env.local` / `mobile/.env`: `EXPO_PUBLIC_API_URL` (alamat proxy, mis. `http://192.168.1.10:8000`). Tanpa variabel ini aplikasi memakai `http://10.0.2.2:8000` (emulator Android) atau `http://localhost:8000` (simulator iOS) yang **tidak** berfungsi di HP fisik.

File `.env` berisi konfigurasi/rahasia lokal dan tidak boleh di-commit (sudah ada di `.gitignore`). Salin dari `backend/.env.example` untuk memulai.

## 📡 API Endpoints

Endpoint data **wajib login**: kirim header `Authorization: Token <token>` (token dari login/daftar). Tanpa token → `401`.

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/v1/` | Publik | Daftar endpoint |
| POST | `/api/v1/auth/login/` | Publik | `{username, password}` → `{token, username}` (maks. 10/menit per IP) |
| POST | `/api/v1/auth/register/` | Publik | `{username, password, password_confirm}` → `{token, username}` (201, maks. 5/jam per IP) |
| POST | `/api/v1/auth/logout/` | Token | Mencabut token di server (204) |
| POST | `/api/v1/classify/` | Token | Upload gambar (multipart) → klasifikasi (maks. 120/jam per akun) |
| GET | `/api/v1/dashboard/stats/` | Token | Total, distribusi kelas, 5 inspeksi terbaru |
| GET | `/api/v1/dashboard/history/?page=N` | Token | Riwayat, 10 per halaman |
| GET | `/api/v1/dashboard/map/` | Token | Titik inspeksi ber-GPS (maks. 1000) |
| GET | `/privacy/` | Publik | Kebijakan Privasi |
| GET | `/healthz/` | Publik | Cek kesehatan server & database |

### POST `/api/v1/classify/`
```bash
curl -X POST http://localhost:8000/api/v1/classify/ \
  -H "Authorization: Token <token>" \
  -F "image=@road.jpg" \
  -F "latitude=-5.4292" \
  -F "longitude=105.2610" \
  -F "location_name=Tanjung Karang, Bandar Lampung" \
  -F "captured_at=2026-10-30T08:00:00+07:00"
```
Hanya JPEG/PNG, maksimal 10 MB. `latitude`, `longitude`, `location_name`, `captured_at` opsional.

**Response 201:**
```json
{
  "id": 1,
  "class_label": "Pothole",
  "confidence_score": 0.89,
  "image_url": "/media/uploads/road.jpg",
  "latitude": -5.4292,
  "longitude": 105.261,
  "location_name": "Tanjung Karang, Bandar Lampung",
  "captured_at": "2026-10-30T08:00:00+07:00",
  "created_at": "2026-10-30T08:00:02+07:00"
}
```
Error: `400` (data/gambar tidak valid), `503` (model tidak tersedia), `500` (prediksi gagal). Pada `503`/`500` record inspeksi tidak disimpan.

### GET `/api/v1/dashboard/stats/`
```json
{
  "total_inspections": 127,
  "class_distribution": { "Crack": 35, "Pothole": 42, "Surface Erosion": 28, "Normal": 22 },
  "recent_inspections": [ ... ]
}
```

## 🤖 AI Model

- **Arsitektur**: MobileNetV2 (torchvision) dengan classifier `Dropout(0.3) → Linear(1280, 4)`, inferensi dengan PyTorch di MPS (Apple Silicon) / CUDA / CPU.
- **File model**: `backend/ai_model/mobilenetv2_road_damage.pt` — checkpoint PyTorch (dict berisi `model_state_dict`, `classes`, `val_acc`). Bukan file Keras/`.h5`.
- **Urutan kelas**: diambil dari `classes` di checkpoint (urutan alfabetis ImageFolder: `Crack, Normal, Pothole, Surface Erosion`). Checkpoint saat ini mencatat `val_acc` ≈ 0.85.
- **Preprocessing** (`preprocessor.py`): rotasi EXIF diterapkan, resize 224×224, normalisasi mean/std ImageNet.
- **Heuristik tambahan**: bila model memprediksi `Normal`, `_is_pothole_like()` memeriksa area gelap memanjang (genangan/lubang basah); jika cocok label diubah ke `Pothole` dengan confidence minimal 0.65.
- **Bila model tidak tersedia** (file `.pt` tidak ada, PyTorch/torchvision belum terpasang, atau checkpoint tidak valid): endpoint classify mengembalikan **HTTP 503** dengan pesan error. Tidak ada prediksi mock/random.

**Melatih ulang:**
```bash
cd backend
source venv311/bin/activate
python ai_model/train.py     # membaca ../dataset/<kelas>/*.jpg, menyimpan mobilenetv2_road_damage.pt
```
Training: 8 epoch classifier head + 3 epoch fine-tuning, split 80/20 (seed 42). Checkpoint terbaik (val accuracy) disimpan otomatis. Restart Django setelah training agar model baru dimuat.

## 🧪 Test

```bash
cd backend
venv311/bin/python manage.py test api      # 23 test: classify, validasi, dashboard, login, daftar, logout, wajib login, batas percobaan
venv311/bin/python ai_model/train.py --eval ai_model/mobilenetv2_road_damage.pt   # akurasi model per kelas
```

Login dibatasi 10 percobaan/menit dan pendaftaran 5/jam per IP (ubah lewat `THROTTLE_LOGIN` / `THROTTLE_REGISTER` di `.env`).

## 🐛 Troubleshooting

- **`password authentication failed for user "postgres"`**: `DB_PASSWORD` di `backend/.env` tidak sama dengan password PostgreSQL lokal. Sesuaikan `.env` (cek dengan perintah psql di atas) atau jalankan sementara dengan `DB_ENGINE=sqlite ./start.sh`.
- **`DisallowedHost: Invalid HTTP_HOST header`**: host tidak ada di `ALLOWED_HOSTS`. Dengan `DEBUG=True` IP LAN komputer otomatis diizinkan; untuk host lain tambahkan ke `ALLOWED_HOSTS` di `.env`.
- **`ModuleNotFoundError: drf_spectacular` / `dotenv` / `psycopg2` / `torch`**: venv salah atau belum install. Aktifkan `venv311` lalu `pip install -r requirements.txt`.
- **Proxy menampilkan `Backend server unavailable` (502)**: Django belum berjalan di `127.0.0.1:8001`.
- **`EADDRINUSE` / port terpakai**: cek dengan `lsof -nP -iTCP:8000 -sTCP:LISTEN` (ganti 8001/3000/8081), hentikan proses lama.
- **Mobile "Server belum terhubung"**: pastikan `EXPO_PUBLIC_API_URL` memakai IP LAN Mac + port 8000, HP satu Wi-Fi dengan Mac, Django & proxy berjalan, lalu restart `npx expo start`. Uji dari browser HP: `http://<IP-LAN-Mac>:8000/api/v1/`. Izinkan koneksi masuk untuk `node` bila macOS Firewall bertanya. Jaringan kampus/hotspot dengan *client isolation* bisa memblokir; gunakan hotspot HP atau `npx expo start --tunnel` (tunnel hanya untuk Metro, API tetap butuh IP yang terjangkau).
- **IP Mac berubah** (ganti Wi-Fi/hotspot): backend otomatis menerima IP baru tanpa restart, dan Expo Go memakai IP komputer yang menjalankan Expo. Bila aplikasi masih memakai alamat lama, tekan **r** di terminal Expo atau ubah alamat dari aplikasi; `./start.sh` berikutnya memperbarui `mobile/.env.local`.
- **Klasifikasi 503**: file `backend/ai_model/mobilenetv2_road_damage.pt` tidak ada atau PyTorch tidak terpasang di venv aktif.
- **Expo memperingatkan versi paket**: jalankan `npx expo install --check` untuk melihat versi yang direkomendasikan SDK 58.

## 🚦 Production Deployment

Paket siap pakai ada di folder [`deploy/`](deploy/README.md): **Docker Compose** berisi PostgreSQL, Django + Gunicorn, dan **Caddy** (HTTPS Let's Encrypt otomatis, dashboard web, `/media/`, `/static/`) di satu domain. Ringkasnya:

```bash
cd deploy
cp .env.example .env      # isi DOMAIN, ACME_EMAIL, SECRET_KEY, DB_PASSWORD, PRIVACY_CONTACT_EMAIL
docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
```

Langkah lengkap (VPS, file model, pindah data, backup, build APK) ada di [`deploy/README.md`](deploy/README.md).

- **Keamanan produksi** (`DEBUG=False`): server menolak start bila `SECRET_KEY` lemah; HTTPS redirect, HSTS, cookie aman, `X-Frame-Options: DENY`; CORS hanya untuk `CORS_ALLOWED_ORIGINS`; `manage.py check --deploy` bersih.
- **Dashboard web** otomatis memakai domain yang sama untuk API (tidak perlu mengubah `config.js`).
- **Mobile**: ganti domain di `mobile/eas.json`, lalu `eas build -p android --profile preview` (APK) atau `--profile production` (Play Store).

## 📝 License

MIT License

## 👥 Contributors

Kelompok 5 - Internet Programming 2

---

Built with ❤️ for better road infrastructure monitoring
