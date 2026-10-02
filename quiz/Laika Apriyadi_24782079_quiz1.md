## Quiz

## Disusun untuk memenuhi tugas mata kuliah:

## Internet Programming II

## Kelas : TRI 5C Nama : Laika Apriyadi NPM : 24782079 Disusun oleh:

## Ir. Nurul Qomariyah, M.Kom. Dian Ayu Afifah, S.Si., M.Sc. Dosen pengampu:

## TEKNOLOGI REKAYASA INTERNET JURUSAN TEKNOLOGI INFORMASI POLITEKNIK NEGERI LAMPUNG 2025/2026


## Bagian 1. Identitas dan Topik Proyek Aplikasi

- 1. Nama Aplikasi

- RoadPulse (Sistem Klasifikasi Kerusakan Infrastruktur Jalan Berbasis Artificial Intelligence).

- 2. Deskripsi Singkat dan Tujuan Utama Aplikasi

- Selama ini, proses pengecekan dan pemetaan kerusakan jalan (seperti jalan retak, berlubang, atau erosi permukaan) masih sering dilakukan secara manual. Cara lama ini memakan waktu cukup lama, hasilnya bergantung pada penilaian visual masing-masing petugas/surveyor (jadi kurang konsisten), dan susah kalau harus diterapkan ke cakupan wilayah jalan yang sangat luas.

- RoadPulse hadir sebagai solusi digital untuk mengatasi masalah tersebut. Aplikasi web ini memanfaatkan teknologi deep learning (AI berbasis model CNN/MobileNetV2) yang bisa mengenali dan mengelompokkan jenis kerusakan jalan secara otomatis hanya dari foto permukaan jalan. Aplikasi ini juga bisa membedakan mana jalan yang rusak dan mana jalan yang kondisinya masih bagus/normal, serta dilengkapi dashboard web untuk melihat statistik dan rekap datanya.

## 3. Target Pengguna Utama

- Petugas atau surveyor dari Dinas Pekerjaan Umum (PU), pengelola infrastruktur jalan, serta pihak terkait yang butuh alat bantu cepat untuk mengidentifikasi kondisi dan jenis kerusakan jalan langsung dari foto lapangan.

## Bagian 2. Resume Modul Digital Awareness

- 1. Modul 1: There's a whole new world out there!

- Zaman sekarang hampir semua hal berpindah dari cara manual (analog) ke digital. Hadirnya teknologi bikin urusan harian jadi lebih cepat dan gampang, misalnya dari yang dulu harus serba ketemu langsung sekarang bisa lewat aplikasi. Tapi ya ada dampaknya juga, kalau kebanyakan di depan layar bisa bikin capek fisik dan pikiran, jadi tetap harus seimbang pakenya.

## 2. Modul 2: You'll Need Some Basic Tools

- Biar bisa lancar di dunia digital, kita butuh alat dasarnya dulu kayak HP/laptop, sistem operasi (OS), sama aplikasi. Biar data gak berantakan, kita harus pinter-pinter ngerapihin file ke dalam folder. Terus yang gak kalah penting itu bikin password—harus kuat dan gak gampang ditebak biar akun kita gak gampang dibobol orang.

## 3. Modul 3: This is how you get around and find what you're looking for

- Browser itu ibarat gerbang utama kita pas nyari apa aja di internet. Di sini dipelajari bedanya nyari file di penyimpanan HP/laptop sendiri sama nyari data di web luas. Modul ini juga ngingetin soal hak cipta (copyright): gak bisa asal ambil atau ngaku-ngaku karya orang lain, kecuali kalau asetnya emang open-source atau public domain yang bebas dipakai.


## 4. Modul 4: It just keeps getting better

- Teknologi makin canggih, apalagi sekarang ada AI yang bikin kerjaan makin praktis. Tapi makin canggih alatnya, makin butuh etika (netiquette). Kita tetap harus sopan di internet, gak boleh cyberbullying, dan kalau pake AI juga harus jujur dan bijak, gak asal lepas tanggung jawab gitu aja.

- 5. Modul 5: Even Though It's Digital, It is Real, With Real Consequences

- Apa yang kita lakuin di internet itu efeknya nyata. Kita harus ekstra hati-hati sama data pribadi (PII) kayak KTP atau nomor telp biar gak bocor. Ingat juga kalau jejak digital itu jeleknya susah dihapus. Selain itu, modul ini ngajarin cara ngindarin penipuan (phishing), gak pakai aplikasi bajakan, dan gimana bersikap kalau ketemu respon/komentar negatif di medsos.

## 6. Modul 6: Learn About Anything and Everything

- Dunia digital itu jalannya cepat banget, jadi pasti bakal ada skill baru yang belum kita kuasai (skills gaps), makanya harus mau belajar terus. Modul ini juga ngebahas kemampuan dasar troubleshooting—alias jangan langsung panik kalau misal aplikasi error atau koneksi putus, tapi coba cek dan benerin sendiri dulu langkah-langkah dasarnya.

## Bagian 3. Hubungan dan Implementasi pada Topik Proyek

- 1. Mempermudah Tugas Hari-hari & Transisi Analog ke Digital

- Kemudahan: Petugas survei lapangan tidak perlu lagi mencatat atau mengira-ngira jenis kerusakan jalan secara manual di lembaran kertas. Cukup ambil foto kondisi jalan lewat HP lalu unggah ke aplikasi, dan sistem AI akan langsung memberi tahu jenis kerusakannya beserta persentase keyakinannya (confidence score).

Proses Tradisional yang Disederhanakan:

- Proses Analog: Surveyor datang ke lokasi, melihat kerusakan jalan secara kasat mata, mencatatnya di formulir kertas, lalu merekap data satu per satu di kantor.

- Proses Digital di RoadPulse: Petugas mengunggah foto via dashboard web/aplikasi. Sistem backend (Django REST API) dan model AI (CNN) langsung memproses foto tersebut secara real-time, menentukan kriteria kerusakannya (retak/berlubang/erosi/normal), lalu otomatis menyimpan dan merekap hasilnya ke grafik dashboard.

## 2. Struktur Penyimpanan File & Keamanan Kata Sandi

Penyimpanan File yang Intuitif:

- Pengguna tidak perlu pusing memikirkan nama file atau letak folder penyimpanan. Saat foto jalan diunggah melalui formulir, sistem backend akan mengelola penamaan file secara terstruktur (misalnya menyertakan stempel waktu upload dan id unik).

- Pada tampilan antarmuka (dashboard), hasil unggahan disajikan dalam bentuk riwayat berupa galeri foto sederhana atau tabel yang dilengkapi dengan tag/label status (misal: Crack, Pothole, Surface Erosion, atau Normal).


Membantu Buat Kata Sandi yang Aman:

- Saat pendaftaran akun (registrasi), sistem memberikan panduan langsung (real-time password indicator).

- Memberikan batasan minimal panjang kata sandi (misalnya minimal 8 karakter) serta kombinasi wajib (huruf besar, huruf kecil, angka, dan simbol).

- Menampilkan pesan edukatif atau peringatan jika pengguna menggunakan kata sandi yang terlalu umum atau mudah ditebak.

## 3. Fitur Pencarian (Search Bar) & Lisensi Aset Eksternal

Desain Fitur Pencarian:

- Kolom pencarian (search bar) diletakkan di bagian atas dashboard agar gampang ditemukan.

- Pengguna bisa memfilter riwayat deteksi berdasarkan kata kunci seperti nama kategori (Pothole, Crack, dll), rentang tanggal pengunggahan, atau status kondisi jalan.

- Dilengkapi fitur autocomplete atau drop-down filter sederhana agar pengguna awam tidak bingung saat hendak mencari data lama.

Aset Eksternal dan Lisensinya:

- Dataset Citra: Menggunakan dataset publik dari Mendeley Data (Daffodil International University) dan Kaggle Data (Atulya Kumar). Aset ini digunakan khusus untuk kebutuhan akademik/pelatihan model dan dicantumkan sumbernya secara jelas di laporan.

- Framework & Library: Python, Django, Django REST Framework, dan Chart.js yang tergolong dalam lisensi open-source (seperti MIT License) sehingga bebas digunakan dan dikembangkan untuk proyek ini.

- Ikon & Elemen Visual: Menggunakan ikon berlisensi open-source (seperti FontAwesome atau Google Material Icons).

## 4. Prevention Etika Digital & Etika Penggunaan AI

Pencegahan Pelanggaran Etika Digital:

- Jika aplikasi dikembangkan dengan fitur interaksi atau kolaborasi antar petugas/pengguna, diterapkan sistem moderasi input dasar.

- Menambahkan ketentuan penggunaan (Terms of Service) dan pedoman komunitas sederhana agar pengguna tidak mengunggah gambar yang tidak relevan (bukan foto jalan) atau menyalahgunakan platform.


Penerapan AI yang Etis dan Bertanggung Jawab:

- Transparansi Hasil: AI tidak hanya memberikan hasil klasifikasi, tetapi juga menampilkan confidence score (tingkat keyakinan model). Jika skor keyakinan terlalu rendah, sistem akan memberikan saran agar pengguna mengambil foto ulang dengan pencahayaan yang lebih jelas.

- Pemberitahuan Keterbatasan (Limitasi): Pengguna diberi pemahaman bahwa AI berfungsi sebagai alat bantu keputusan (bukan keputusan mutlak). Petugas manusia tetap memegang keputusan akhir jika terjadi kejanggalan pada hasil identifikasi.

## 5. Perlindungan Data Pribadi (PII) & Pencegahan Penipuan Siber

Data Pribadi Sensitive (PII) yang Dikumpulkan:

- Data diri pengguna terbatas pada informasi akun dasar seperti Nama Lengkap, Email, Password (yang di-hash), dan Peran/Role (misal: Surveyor atau Admin).

- Metadata lokasi atau waktu saat foto diunggah.

Cara Melindungi Data:

- Kata sandi disimpan dalam basis data menggunakan enkripsi/hashing yang aman (bawaan dari keamanan Django backend).

- Pengiriman data antara client dan server berjalan di atas protokol aman HTTPS / SSL.

Meminimalkan Risiko Penipuan Siber:

- Menerapkan validasi ketat pada API backend (multipart form-data validation) agar berkas yang diunggah benar-benar berupa format gambar (JPG/PNG), sehingga mencegah masuknya berkas berbahaya/malware.

- Menerapkan batasan akses berbasis sesi/token (JWT atau Django Session) sehingga hanya pengguna terautentikasi yang bisa mengakses dashboard dan melakukan unggah data.

## 6. Pesan Error Ramah Pengguna & Troubleshooting Mandiri

Komunikasi Masalah Teknis:

- Jika sistem mengalami kendala (misalnya koneksi terputus, server gagal merespons, atau format foto salah), aplikasi tidak akan menampilkan kode error rumit (stack trace/HTTP 500 error) yang membingungkan pengguna.

- Tampilan akan dialihkan ke pemberitahuan berupa pop-up (toast/alert) sederhana dengan bahasa sehari-hari yang persuasif.


Contoh Rancangan Pesan Error Ramah Pengguna:

Kasus 1: Gagal Terhubung ke Internet/Server

"Waduh, koneksi internetmu terputus nih. Pastikan Wi-Fi atau paket datamu aktif, lalu coba muat ulang halaman ya!"

## Kasus 2: Berkas yang Diunggah Tidak Sesuai

"Format foto tidak didukung. Harap unggah foto dengan format JPG atau PNG dengan ukuran maksimal 5 MB."

## Kasus 3: Model AI Gagal Memproses Gambar

"Sistem gagal membaca foto ini. Pastikan foto kondisi jalan terlihat jelas (tidak buram), lalu coba unggah kembali."
