# Laporan Implementasi — Redesign Mobile RoadPulse Lampung Edition

Tanggal: 30 Oktober 2026 · Lingkup: hanya `mobile/` (+ dokumen di `docs/`).

## 1. Ringkasan
Aplikasi mobile didesain ulang ke gaya **Dark Enterprise Intelligence** dengan aksen emerald, tema **Gelap / Terang / Sistem** yang tersimpan di perangkat, dan identitas Lampung (foto Menara Siger berlisensi, ornamen Siger, garis Tapis). `App.js` 1.863 baris dipecah menjadi token tema, layanan API, komponen, dan layar. Seluruh fungsi lama dipertahankan; tidak ada perubahan backend, database, web, atau kontrak API.

## 2. Perubahan file (mobile)
| File | Perubahan |
|---|---|
| `App.js` | Ditulis ulang sebagai pengatur state & navigasi; logika fetch, fallback alamat, izin, kamera, upload dipindahkan apa adanya |
| `app.json` | `userInterfaceStyle`: `light` → `automatic` (wajib untuk mode Sistem) |
| `package.json`, `package-lock.json` | + `@react-native-async-storage/async-storage` 2.2.0 (via `npx expo install`, versi sesuai SDK 58) |
| `theme/tokens.js`, `theme/ThemeContext.js` | Design tokens & provider tema (baru) |
| `services/api.js` | `requestJson`, `uploadInspectionXHR`, `resolveLocationName` dipindah dari `App.js` (baru) |
| `components/ui.js`, `icons.js`, `lampung.js`, `inspection.js` | Komponen bersama (baru) |
| `screens/HomeScreen.js`, `SummaryScreen.js`, `HistoryScreen.js`, `CaptureScreen.js`, `ResultScreen.js`, `SettingsSheet.js` | Layar (baru) |
| `assets/menara-siger-bakauheni.jpg`, `assets/ATTRIBUTION.md` | Foto Wikimedia Commons CC BY 2.5 + atribusi (baru) |

Tidak diubah: `config.js`, `index.js`, `babel.config.js`, `screens/CameraScreen.js` (kode lama tak terpakai), `.env`, `.env.local`.

## 3. Dependency baru — alasan
`@react-native-async-storage/async-storage` 2.2.0: brief meminta pilihan tema tersimpan, sedangkan mobile belum punya penyimpanan lokal apa pun. Modul ini didukung Expo Go dan dipasang lewat `npx expo install`, sehingga versinya sesuai SDK 58. Lockfile ikut bertambah `is-plain-obj` (transitif). `npm ls`: tanpa error; manifest dan lockfile sinkron.

## 4. Fitur baru yang memakai API yang sama
| Fitur | Dasar |
|---|---|
| Detail inspeksi (sheet) | Data yang sudah dikirim `/dashboard/history/` (tidak ada request baru) |
| Muat lebih banyak di Riwayat | `/dashboard/history/?page=N` — parameter `page` sudah didukung backend |
| Filter kelas di Riwayat | Sisi klien atas data yang dimuat; diberi keterangan eksplisit |
| Pemilih tema | Lokal (AsyncStorage), tanpa endpoint |

## 5. Tidak diimplementasikan (sesuai aturan "tanpa fitur palsu")
Login, Profile/Logout, Map Screen, Welcome/Splash baru, dan form laporan terpisah tidak dibuat, karena tidak ada implementasinya di mobile dan pembuatannya memerlukan fitur, autentikasi, atau dependency baru (detail di `MOBILE_UI_AUDIT.md` §4). Rekomendasi lanjutan yang perlu persetujuan: layar peta mobile memakai `/dashboard/map/` + `react-native-maps`.

## 6. Pengujian — hasil jujur
| Pemeriksaan | Hasil |
|---|---|
| Bundling Metro Android & iOS (`npx expo export`) | ✅ Berhasil (651 / 653 modul) setelah perubahan terakhir |
| Foto Siger ikut di bundle | ✅ 1 aset JPG 145.081 byte di Android & iOS |
| `npx expo config` | ✅ SDK 58.0.0, `userInterfaceStyle: automatic`, versi 1.0.0 |
| Manifest ↔ lockfile, `npm ls` | ✅ Sinkron, tanpa error |
| Fungsi API dibandingkan versi lama | ✅ `requestJson`, `uploadInspectionXHR`, `resolveLocationName` **identik**; endpoint yang dipanggil sama (`/api/v1/`, `/classify/`, `/dashboard/stats/`, `/dashboard/history/`) |
| File di luar `mobile/` berubah selama redesign | ✅ Tidak ada (diperiksa dengan `find -newer` terhadap file pertama sesi) |
| Warna hardcoded di luar `tokens.js` | ✅ 0 |
| Kontras WCAG token utama | ✅ AA semua pasangan teks (lihat design system) |
| Automated test | ⚠️ Tidak tersedia di proyek (tidak ada Jest/test) |
| **Uji di perangkat/simulator** (login, navigasi, upload, tema, overflow) | ❌ **Belum dilakukan** — simulator iOS/Android tidak tersedia di Mac ini. Perlu diuji di HP melalui Expo Go. |

## 7. Checklist uji di perangkat (untuk penguji)
1. `cd mobile && npx expo start --clear`, buka di Expo Go.
2. Beranda: foto Siger tampil, kredit terbaca, KPI & status terisi, "Buka kamera" membuka kamera.
3. Ambil foto → hasil tampil; bila keyakinan < 50 % muncul peringatan dan tombol "Foto ulang".
4. Ringkasan: angka sama dengan dashboard web.
5. Riwayat: filter, "Muat lebih banyak" (perlu > 10 data), ketuk baris → detail → "Lihat di peta".
6. Pengaturan: ganti Terang/Gelap/Sistem → seluruh layar berubah; tutup-buka aplikasi → pilihan tetap. Ubah mode gelap perangkat saat "Sistem".
7. Matikan Django → banner offline & status "Offline"; ubah alamat server dari Pengaturan.
8. Periksa di layar kecil (mis. iPhone SE) dan Android dengan navigasi gestur: tidak ada teks terpotong/overflow.

## 8. Rollback
- Versi **tepat sebelum** redesign ini (desain marun-emas dengan kamera 3:4 & peringatan keyakinan) hanya tersimpan di folder sementara sesi Claude Code, yang akan hilang saat sesi berakhir. Jika perlu cadangan permanen, salin sebelum sesi ditutup.
- `git show :mobile/App.js` mengembalikan versi **staged yang lebih lama** (sebelum perbaikan kamera dan peringatan keyakinan).
- Untuk membatalkan redesign: kembalikan `App.js`, `app.json`, `package.json`, `package-lock.json` dari cadangan, lalu hapus folder baru `theme/`, `services/`, `components/` dan layar baru di `screens/` (jangan hapus `screens/CameraScreen.js`). Tidak ada perubahan backend yang perlu dibatalkan.
