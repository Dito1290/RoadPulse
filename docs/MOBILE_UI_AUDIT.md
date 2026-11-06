# Audit Arsitektur & UI Mobile — RoadPulse

Tanggal audit: 30 Oktober 2026 · Lingkup: folder `mobile/` saja.

## 1. Kondisi repository saat audit

- Commit HEAD: `397c370`. Working tree **belum bersih**: ada perubahan staged dan belum di-commit dari pekerjaan sebelumnya (perbaikan settings, alamat API, desain mobile "maroon-emas"), serta konflik `backend/db.sqlite3` hasil `git stash pop`.
- Semua perubahan lokal tersebut **dipertahankan**. Tidak ada `git reset`, `git checkout`, `git stash pop`, commit, atau push.
- Salinan `mobile/App.js`, `app.json`, `package.json`, `package-lock.json`, `config.js` sebelum redesign disimpan di luar repo (folder sementara sesi) sebagai cadangan; versi staged `App.js` juga masih ada di index Git.

## 2. Arsitektur mobile

| Aspek | Temuan |
|---|---|
| Framework | Expo SDK 58 (`expo` 58.0.19), React Native 0.88.0, React 19.3.0 |
| Entry point | `index.js` → `registerRootComponent(App)` |
| Navigasi | **Tidak ada library navigasi.** Navigasi berbasis state di `App.js`: tab `detect / stats / history`, layar kamera dan layar hasil dirender kondisional, sheet pengaturan memakai `Modal`. |
| State management | `useState`/`useEffect` lokal di `App.js` (tanpa Redux/Context sebelum redesign). |
| API client | `XMLHttpRequest` (`requestJson`, `uploadInspectionXHR`) — sengaja tidak memakai `fetch` (komentar: bug expo/fetch di iOS). Alamat dari `config.js` (`EXPO_PUBLIC_API_URL`, IP dev server Expo, fallback emulator). |
| Autentikasi | **Tidak ada di mobile.** Endpoint yang dipakai bersifat publik (`AllowAny`). |
| Upload gambar | `expo-camera` `takePictureAsync({quality: 0.7})` → `POST /api/v1/classify/` multipart (`image`, `latitude`, `longitude`, `location_name`, `captured_at`). |
| Lokasi | `expo-location`: izin foreground, posisi saat ini, last known, `reverseGeocodeAsync` (batas 3 s). |
| Peta | **Tidak ada peta di mobile.** Hanya tombol "Lihat di peta" yang membuka OpenStreetMap di browser. |
| Penyimpanan lokal | **Tidak ada** (tidak ada AsyncStorage/SecureStore). Alamat server yang diubah manual hilang saat aplikasi ditutup. |
| Tema | Hanya terang; `app.json` `userInterfaceStyle: "light"`; warna di objek `C` dalam `App.js`. |
| Aset | `icon.png`, `splash-icon.png`, `android-icon-*.png`, `favicon.png` — semuanya **ikon bawaan Expo**; tidak ada foto Lampung. |
| Dependency | axios, expo, expo-camera, expo-constants, expo-location, expo-status-bar, react, react-native, react-native-safe-area-context |
| File lain | `screens/CameraScreen.js` — layar lama berbasis axios, **tidak di-import** oleh `App.js` (kode mati, tidak diubah). |
| Test | Tidak ada test, linter, atau konfigurasi Jest di `mobile/`. |

## 3. Peta halaman yang benar-benar ada

| Halaman/elemen (sebelum) | Fungsi & API | Status di redesign |
|---|---|---|
| Tab **Deteksi** (beranda) | Hero + tombol "Buka kamera", total inspeksi, status GPS, 3 inspeksi terbaru (`GET /dashboard/stats/`, `GET /dashboard/history/?page=1`) | Didesain ulang → **Beranda** |
| **Kamera** | Preview 3:4, tombol rana, status GPS | Didesain ulang |
| **Hasil analisis** | Foto, kelas, keyakinan, peringatan < 50 %, lokasi, koordinat, waktu, "Lihat di peta", "Foto lagi/ulang" | Didesain ulang |
| Tab **Ringkasan** | Total, rusak/normal, tingkat rusak, distribusi 4 kelas | Didesain ulang |
| Tab **Riwayat** | 10 inspeksi halaman 1 | Didesain ulang + detail & muat lebih banyak |
| Sheet **Server backend** | Ubah alamat API | Didesain ulang → **Pengaturan** (server + tema + tentang) |
| Banner offline | Ajakan mengatur server | Didesain ulang |

## 4. Halaman pada brief yang TIDAK tersedia di implementasi

| Halaman brief | Temuan | Keputusan |
|---|---|---|
| Welcome / Splash | Hanya splash bawaan Expo (ikon default) | Tidak membuat layar baru; identitas Lampung ditaruh di kartu sambutan Beranda. |
| Login | Mobile tidak punya autentikasi | **Tidak dibuat** — akan menjadi fitur palsu dan mengubah alur autentikasi. |
| Map Screen | Tidak ada peta di mobile; tidak ada library peta | **Tidak dibuat** — butuh dependency peta baru & fitur baru. Endpoint `/dashboard/map/` ada di backend, bisa menjadi pengembangan berikutnya atas persetujuan. |
| Report form terpisah | Pelaporan = alur kamera → upload | Alur kamera yang didesain ulang; field & payload tetap. |
| Profile | Tidak ada akun/pengguna di mobile | **Tidak dibuat**; pengaturan dipusatkan di sheet Pengaturan. Logout tidak relevan (tidak ada login). |
| Search riwayat | API tidak punya parameter pencarian/filter | Filter **kelas di sisi klien** atas data yang sudah dimuat, diberi keterangan eksplisit. |

## 5. Daftar file yang diubah/dibuat (mobile saja)

Diubah: `App.js`, `app.json` (`userInterfaceStyle` → `automatic`), `package.json`, `package-lock.json` (+ AsyncStorage).

Dibuat: `theme/tokens.js`, `theme/ThemeContext.js`, `services/api.js`, `components/{ui,icons,lampung,inspection}.js`, `screens/{HomeScreen,SummaryScreen,HistoryScreen,CaptureScreen,ResultScreen,SettingsSheet}.js`, `assets/menara-siger-bakauheni.jpg`, `assets/ATTRIBUTION.md`.

Tidak diubah: `config.js`, `index.js`, `babel.config.js`, `screens/CameraScreen.js`, `.env*`, seluruh `backend/`, `frontend/`, database.
