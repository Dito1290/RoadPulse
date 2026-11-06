# Spesifikasi Desain Mobile — RoadPulse Lampung Edition

**Brand:** ROADPULSE · **Wilayah:** Lampung, Indonesia · **Deskriptor:** Smart Mobility Intelligence
**Konsep:** Dark Enterprise + identitas regional Lampung — produk smart city, bukan aplikasi wisata.

## 1. Prinsip
1. **Data dulu.** Halaman operasional (ringkasan, riwayat, kamera, hasil) bersih; ornamen Lampung hanya aksen.
2. **Identitas Lampung yang jujur.** Foto asli Menara Siger (Bakauheni, Lampung Selatan) dengan kredit dan lokasi yang benar; Siger & Tapis digambar sebagai garis/watermark beropasitas rendah.
3. **Tidak ada fitur palsu.** Setiap tombol memanggil aksi yang sudah ada; tidak ada data contoh di layar produksi.
4. **Kontrak API tetap.** Semua layar memakai fungsi request lama tanpa perubahan.

## 2. Elemen regional
| Elemen | Tempat | Perlakuan |
|---|---|---|
| Foto Menara Siger | Kartu sambutan Beranda | Overlay gelap + gradasi bawah, kredit "Menara Siger, Bakauheni · Foto: Sakurai Midori (CC BY 2.5)" |
| Siger (vektor) | Logo app bar, watermark kartu Ringkasan, ilustrasi state kosong | Warna `onAccent`/`heritageSoft` |
| Motif Tapis | Garis tipis di bawah app bar, penutup Beranda, sheet Pengaturan | Emas 35–40 % opasitas |
| Sapaan "Tabik Pun!" | Kartu sambutan | Bersama salam sesuai jam (pagi/siang/sore/malam) |

Panorama Teluk Lampung / Gunung Betung **tidak dipakai**: belum ada aset berlisensi jelas yang terverifikasi lokasinya dalam sesi ini.

## 3. Struktur navigasi
```
App bar: [Siger] ROADPULSE · Smart Mobility Intelligence · Lampung   [● Online] [⚙]
         ◇ ◆ ◇ ◆ ◇ (garis Tapis)
Tab: Beranda | Ringkasan | Riwayat           (navigasi state yang sama, tanpa library baru)
Layar penuh: Kamera → Hasil Analisis
Sheet: Pengaturan (tema, server, tentang) · Detail inspeksi
```
Pill status dan ikon gerigi membuka sheet Pengaturan.

## 4. Spesifikasi layar

### Beranda
- Kartu sambutan (min. 268 pt): foto Siger, overline "LAMPUNG · INDONESIA", salam + "Tabik Pun!", judul, deskripsi, tombol emerald **Buka kamera**. Animasi fade + geser 8 pt (450 ms).
- Banner merah "Server belum terhubung" bila API gagal → membuka Pengaturan.
- KPI: Total, Rusak (= total − Normal), Normal — dari `/dashboard/stats/`. Skeleton saat memuat.
- Status: Server (Online/Offline/Memeriksa) dan GPS (aktif/ditolak/mencari).
- Akses cepat: Ringkasan, Riwayat, Pengaturan.
- Aktivitas terbaru: 3 inspeksi; ketuk → detail.

### Ringkasan
- Kartu total (angka 46 pt) dengan watermark Siger; Rusak, Normal, Tingkat rusak.
- Distribusi 4 kelas: nama Indonesia, status, jumlah, persentase, bar berwarna semantik.

### Riwayat
- Chip filter: Semua, Retakan, Lubang, Erosi permukaan, Normal (filter lokal + teks "Menampilkan X dari Y yang dimuat · total N di server").
- Baris: thumbnail, badge kelas, keyakinan (kuning tebal bila < 50 %), lokasi, waktu, chevron.
- **Muat lebih banyak** memanggil `/dashboard/history/?page=N+1` (endpoint yang sama, parameter yang sudah didukung).
- Detail (sheet): foto, kelas, status, keyakinan + bar, peringatan < 50 %, lokasi, koordinat, waktu foto, waktu analisis, "Lihat di peta" (OpenStreetMap, perilaku lama).

### Kamera
- Selalu gelap. Preview 3:4 sesuai rasio foto, bingkai sudut emerald, pill GPS, rana bercincin emerald yang aktif setelah `onCameraReady`.

### Hasil analisis
- Foto sesuai rasio asli, overlay "Menganalisis gambar…", skeleton.
- Kartu kelas dengan aksen kiri semantik, chip status, bar keyakinan, kotak kuning bila < 50 % dan tombol berubah "Foto ulang".
- Kartu gagal (danger soft) dengan pesan server & alamat server.

### Pengaturan
- Tema: segmented **Sistem / Terang / Gelap**.
- Server: status koneksi, input URL (keyboard menyesuaikan tema), **Simpan & hubungkan**.
- Tentang: nama aplikasi, versi dari `app.json`, wilayah, kredit foto.

## 5. State yang ditangani
Loading (skeleton, spinner pada tombol), kosong (Siger + teks), error koneksi (banner, kartu gagal, pesan muat-lebih), izin kamera/lokasi ditolak (alert lama & status GPS), keyboard (KeyboardAvoidingView), safe area atas/bawah, gesture tarik-untuk-segarkan.

## 6. Aksesibilitas
Target sentuh ≥ 44 pt; `accessibilityRole`/`Label`/`State` untuk tombol, tab, radio tema, baris riwayat; kontras AA (lihat design system); teks tidak memakai warna emerald murni di tema terang.
