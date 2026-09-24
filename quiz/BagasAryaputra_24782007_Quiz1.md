## Quiz

## Disusun untuk memenuhi tugas mata kuliah: Internet Programming II

## Kelas : TRI 4A Nama : Bagas Aryaputra NPM : 24782007 Disusun oleh:

## Ir. Nurul Qomariyah, M.Kom. Dian Ayu Afifah, S.Si., M.Sc. Dosen pengampu:

## TEKNOLOGI REKAYASA INTERNET JURUSAN TEKNOLOGI INFORMASI POLITEKNIK NEGERI LAMPUNG 2025/2026


## Bagian 1. Identitas dan Topik Proyek Aplikasi

- Nama Aplikasi : Roadpulse

- Deskripsi singkat : Sistem klasifikasi jalan berbasis Artificial Intelligence yang memanfaatkan model deep learning (CNN) untuk mengenali kondisi permukaan jalan dari foto apakah jalan tersebut mengalami retak (crack), berlubang (pothole), erosi permukaan (surface erosion), atau dalam kondisi normal/mulus. Hasil klasifikasi ditampilkan melalui dashboard web yang juga menyajikan rekap statistik deteksi dari waktu ke waktu.

- Tujuan Utama Aplikasi : membantu mempercepat proses identifikasi jenis kerusakan jalan, yang selama ini dilakukan secara manual lewat survei visual proses yang lambat, cukup memotret permukaan jalan dan sistem langsung mengklasifikasikan jenis kondisinya secara otomatis.

- Target pengguna : petugas/surveyor dinas pekerjaan umum dan pengelola infrastruktur jalan yang membutuhkan alat bantu untuk mengidentifikasi kondisi jalan secara cepat dari foto lapangan.

## Bagian 2. Resume Modul Digital Awareness

- 1. Modul 1: There’s a whole new world out there!

Dulu, dunia kita itu serba analog (fisik), seperti jam dinding jarum, kaset pita, atau termometer. Masalahnya, sistem analog itu rentan banget terkena gangguan (noise), gampang rusak, dan susah disimpan. Lalu, kita transisi ke dunia digital yang ngeliat segala sesuatunya lewat kode biner (0 dan 1). Nah, perubahan ini bikin hidup kita jauh lebih efisien karena data digital itu stabil, gampang diproses cepat, dan nggak makan tempat.

- ADC (Analog-to-Digital Converter): Tugasnya nerjemahin dunia nyata ke bahasa komputer. Contohnya pas mikrofon HP nangkep suara kita terus diubah jadi kode biner.

- DAC (Digital-to-Analog Converter): Tugasnya balikin kode komputer ke bentuk yang bisa dirasain indra kita. Contohnya pas HP ngubah kode biner foto jadi pendaran cahaya di layar biar bisa kita liat.

Jadi intinya, teknologi modern itu bukan membuang analog, tapi menggabungkan analog dan digital biar tugas harian kita jadi lebih cepat, presisi, dan praktis.

- 2. Modul 2: You’ll Need Some Basic Tools

Pada modul ini menjelaskan tentang mendalami aspek teknis dan membiasakan diri dengan alat

(tools) yang akan digunakan :

- Dasar Perangkat & Sistem Operasi (OS): Aplikasi butuh OS (seperti Windows, Android, macOS, iOS, atau Linux) biar bisa jalan. OS nyediain tampilan grafis (GUI) buat ngatur perangkat, ngejalanin program, dan ngubah pengaturan.


- Perangkat Input/Output & Konektivitas: Komputer butuh perangkat input (keyboard/mouse) dan output (monitor/speaker). Perangkat ini terhubung lewat kabel (USB untuk aksesoris, HDMI untuk layar) atau nirkabel (Bluetooth dan dongle USB).

- Navigasi & Manajemen File: Di Windows, pusat kendali ada di taskbar buat akses cepat ke aplikasi, jaringan, baterai, dan File Explorer untuk ngecek kapasitas ruang penyimpanan serta lokasi folder. Di Android, pengaturan dan notifikasi diakses lewat usapan (swipe) layar ke atas/bawah.

- Keamanan Kata Sandi: Penggunaan kata sandi yang kuat dan unik di setiap akun merupakan fondasi utama perlindungan data pribadi agar terhindar dari akses ilegal dan pembobolan akun.

- 3. Modul 3: This is how you get around and find what you’re looking for

- Fungsi Browser : Browser seperti Chrome berfungsi sebagai media untuk mengakses situs web, sedangkan mesin pencari digunakan untuk menemukan konten relevan berdasarkan kata kunci yang dimasukkan

- Teknik pencarian informasi di file vs web : Teknik pencarian file dilakukan secara lokal di dalam penyimpanan perangkat. Teknik penacarian di web di lakukan secara online melalui mesin pencari di internet. mencari dua kata/lebih (frasa) yang tepat, menempatkan informasi kita di dalam tanda kutip memberi tahu mesin pencari untuk mengambil halaman dengan susunan kata yang persis sama. tanda minus (-) untuk mengecualikan kata, operator site: untuk membatasi pencarian di satu domain, filetype untuk mencari format file spesifik (PDF, PPT, Doc), serta fitur Tools/Search Tools untuk memfilter rentang waktu.

- Perbedaan utama antara Copyright (Hak Cipta) dan Public Domain (Domain Publik) terletak pada kepemilikan hak eksklusif dan izin penggunaannya. Hak cipta memberikan proteksi hukum penuh kepada pencipta, sedangkan public domain berarti karya tersebut sudah bebas dari segala batasan hukum sehingga bisa digunakan oleh siapa saja tanpa izin maupun royalty.

- 4. Modul 4: It just keeps getting better

Kemajuan kecerdasan buatan (Artificial Intelligence atau AI) membawa dampak ganda yang besar.

Dampak positif dari AI adalah bidang ilmu komputer yang menciptakan mesin dan perangkat lunak

yang dapat meniru kemampuan manusia, seperti belajar dan memecahkan masalah. Namu ada


dampak dan Risiko AI yaitu Penurunan Berpikir Kritis Ketergantungan berlebihan dapat

melunturkan kreativitas dan kemampuan analisis, memicu fenomena ahli dadakan tanpa proses

belajar mendalam.

- 5. Modul 5: Even Though It’s Digital, It is Real, With Real Consequences

Navigasi di dunia digital memerlukan benteng pertahanan yang kuat.

- Manajemen Data Pribadi Sensitif / PII (Personally Identifiable Information) : Personally Identifiable Information (PII) dan identitas digital terbagi menjadi tiga persona utama: Personal (media sosial), Professional (LinkedIn/karier), dan Consumer (aktivitas belanja). Penting untuk membatasi pembagian PII sensitif, mengontrol pengaturan privasi di tiap platform, serta rutin memeriksa jejak digital agar tidak disalahgunakan untuk pencurian identitas.

- Keabadian Jejak Digital & Komunikasi Negatif: Setiap interaksi, foto, atau komentar meninggalkan jejak digital (digital footprint) yang permanen di internet. Pengguna harus bijak mengelola komunikasi, menghindari unggahan impulsif, serta rutin membersihkan profil sosial untuk menjaga reputasi pribadi dan profesional.

- Penanganan Fraud & Kejahatan Siber: Penipuan internet makin kompleks dan dijalankan oleh organisasi kriminal melalui berbagai modus:

- o Phishing & Spear Phishing: Email massal atau terarah yang menyamar sebagai pihak tepercaya untuk mencuri informasi pribadi/keuangan.

- o Catfishing: Profil kencan palsu yang memanipulasi emosi korban untuk menguras uang.

- Keamanan Akun & Pencegahan Pembajakan: Mencegah peretasan kata sandi oleh algoritma canggih dengan menggunakan kata sandi yang kuat/unik, mengaktifkan Two Factor Authentication (2FA), bertransaksi hanya di situs HTTPS, serta berhati-hati terhadap unduhan ilegal/pembajakan (piracy) yang kerap menyisipkan perangkat perusak (malware).

- 6. Modul 6: Learn About Anything and Everything

- Troubleshooting Teknis Dasar:

- o Daya & Sistem: Atasi perangkat mati atau freeze dengan memeriksa charger/stopkontak serta melakukan hard restart (tahan tombol daya 10–20 detik)


- o Performa & Memori: Percepat perangkat lambat dengan mengosongkan penyimpanan, menutup aplikasi latar belakang, dan melakukan restart berkala.

- o Jaringan & Aplikasi: Atasi masalah Wi-Fi dengan restart router 30 detik. Untuk aplikasi yang error atau file tidak bisa dibuka, perbarui/instal ulang aplikasi, gunakan fitur Forgot Password jika lupa akses, atau gunakan konverter format file.

- Kesenjangan Keterampilan & Pembelajaran Daring:

- o Identifikasi Kesenjangan: Atasi keterbatasan pemahaman teknologi secara metodis menggunakan menu Help/Support atau bertanya ke komunitas/teman.

- o Platform Pembelajaran: Manfaatkan platform seperti Cisco Networking Academy atau Edube untuk belajar mandiri (self-paced), terbimbing (instructor-led), atau hybrid.

- o Sertifikasi & Karier: Ikuti pelatihan dan ujian sertifikasi resmi untuk memperkuat resume/CV serta menjawab kebutuhan dunia kerja digital.

## Bagian 3. Hubungan dan Implementasi pada Topik Proyek

- 1. Bagaimana rancangan aplikasi dapat mempermudah tugas sehari-hari pengguna? Apa proses “analog/tradisional” dari topik proyekmu yang berhasil disederhanakan menjadi digital?

Proses tradisional yang disederhanakan adalah survei kondisi jalan secara manual, di mana petugas

dinas PU harus turun ke lapangan, mengamati kondisi jalan secara visual, lalu mencatat hasilnya

secara manual untuk menentukan jenis kerusakan. Proses ini lambat,dan rawan human error.

RoadPulse mendigitalkan proses ini petugas cukup memotret permukaan jalan menggunakan HP,

lalu model CNN akan otomatis mengklasifikasikan kondisi jalan (retak, berlubang, erosi

permukaan, atau normal) dan hasilnya langsung tersimpan serta direkap dalam dashboard web. Ini

memangkas waktu identifikasi, menstandarkan kriteria penilaian (karena berdasarkan model, bukan

opini individu), dan menghasilkan data historis yang bisa dianalisis dari waktu ke waktu.

- 2. Jika aplikasimu memiliki fitur penyimpanan file atau pendaftaran akun, bagaimana kamu merancang struktur penyimpanan file yang intuitif bagi pengguna awam? Bagaimana kamu membantu pengguna membuat kata sandi yang aman?

Karena RoadPulse berbasis akun (petugas/surveyor login untuk mengunggah foto), struktur

penyimpanan dirancang berbasis folder logis per konteks, misalnya:

media/uploads/<user_id>/<tanggal>/<nama_file>.jpg, sehingga setiap foto otomatis terkait dengan

siapa yang mengunggah dan kapan, tanpa pengguna perlu mengatur folder secara manual. Nama


file di-generate otomatis oleh sistem (misalnya menggunakan UUID + timestamp) agar pengguna

awam tidak perlu memikirkan penamaan file yang unik. Untuk keamanan kata sandi saat

pendaftaran akun, form registrasi dilengkapi validasi real-time (misalnya menggunakan

django.contrib.auth.password_validation) yang mensyaratkan panjang minimum, kombinasi huruf-

angka, dan menolak password yang terlalu umum. Ditambahkan juga indikator kekuatan password

(lemah/sedang/kuat) secara visual di frontend agar pengguna langsung mendapat feedback saat

mengetik, bukan hanya pesan error setelah submit.

- 3. Bagaimana kamu mendesain fitur pencarian (search bar) di dalam aplikasi agar pengguna dapat mencari informasi dengan mudah? Selain itu, sebutkan asset eksternal yang digunakan dalam aplikasi (library, API, gambar, icon). Apakah asset-aset tersebut berlisensi open-source, public domain, atau memiliki hak cipta khusus yang wajib dicantumkan?

Fitur pencarian di dashboard RoadPulse dirancang untuk memudahkan surveyor menelusuri

riwayat deteksi, dengan filter berdasarkan jenis kerusakan (crack/pothole/surface erosion/normal),

rentang tanggal, dan lokasi/nama ruas jalan (jika data GPS/lokasi disertakan). Search bar

menggunakan pendekatan debounced live search (hasil muncul otomatis saat mengetik, dengan

jeda singkat) agar terasa responsif tanpa membebani server dengan query berlebihan

Asset eksternal yang digunakan antara lain:

- Django dan Django REST Framework open-source, lisensi BSD.

- Library deep learning (misalnya TensorFlow/PyTorch untuk model CNN) open-source (Apache 2.0/BSD-style).

- Icon UI (misalnya dari Lucide Icons atau Font Awesome free tier) open-source/free untuk penggunaan komersial dengan atribusi sesuai lisensinya.

- Dataset foto jalan untuk training jika bersumber dari dataset publik (mis. Kaggle), perlu dicek lisensinya (biasanya CC atau untuk riset), dan wajib dicantumkan sumbernya di dokumentasi proyek.

Semua asset ini perlu dicantumkan sumber dan lisensinya di halaman "Tentang"/dokumentasi

aplikasi agar transparan dan tidak melanggar hak cipta.

- 4. Jika aplikasimu memiliki fitur interaksi social, bagaimana kamu mencegah pelanggaran etika digital di dalamnya? Jika aplikasi menggunakan fitur pintar berbasis AI, bagaimana kamu memastikan AI tersebut bekerja secara etis dan bertanggung jawab bagi pengguna?


RoadPulse pada dasarnya tidak memiliki fitur interaksi sosial antar-pengguna (bukan platform

publik), sehingga risiko pelanggaran etika seperti bullying atau penyalahgunaan komentar minim.

Namun jika ke depan ditambahkan fitur komentar/anotasi antar-petugas pada suatu titik jalan, perlu

diterapkan moderasi dasar (filter kata kasar) dan pembatasan akses hanya untuk akun terverifikasi

(petugas resmi), bukan publik umum. Untuk memastikan AI bekerja etis dan bertanggung jawab,

prediksi model tidak diperlakukan sebagai keputusan final absolut, melainkan sebagai rekomendasi

yang menampilkan tingkat keyakinan (confidence score). Jika confidence rendah, sistem menandai

hasil sebagai "perlu verifikasi manual" alih-alih memaksakan salah satu dari 4 kelas. Ini penting

mengingat model RoadPulse memang dirancang dengan kelas "normal" agar tidak salah

mengklasifikasikan jalan mulus sebagai rusak hanya karena softmax memaksa memilih salah satu

kelas.

- 5. Data pribadi sensitive (PII) apa saja yang dikumpulkan oleh aplikasimu? Bagaimana cara kamu melindungi data tersebut agar tidak bocor atau disalahgunakan? Bagaimana aplikasi meminimalkan Risiko pengguna menjadi korban penipuan siber di platform mu?

PII yang dikumpulkan RoadPulse relatif minim, umumnya berupa nama, email, dan nomor akun/ID

petugas untuk keperluan login, serta data lokasi/GPS pada foto jalan (jika diaktifkan) yang

tergolong sensitif karena bisa mengungkap pola pergerakan petugas. Perlindungannya meliputi:

password disimpan dalam bentuk hash (bukan plaintext, menggunakan mekanisme bawaan

Django), komunikasi data via HTTPS, serta pembatasan akses data lokasi hanya untuk admin/role

tertentu (role-based access control). Untuk meminimalkan risiko penipuan siber, sistem

menerapkan autentikasi berbasis token/session yang expired otomatis, rate-limiting pada endpoint

login untuk mencegah brute-force, serta tidak pernah meminta password lewat email/notifikasi

(mengurangi celah phishing yang menyamar sebagai RoadPulse).

- 6. Ketika aplikasi mengalami masalah teknis (misalnya kehilangan koneksi internet atau kegagalan memuat data), bagaimana aplikasi mengomunikasikannya kepada pengguna? Tuliskan contoh rancangan pesan error ramah pengguna yang memandu pengguna melakukan troubleshooting mandiri secara mudah.

Ketika terjadi gangguan (misalnya koneksi internet putus saat upload foto, atau server gagal

memproses gambar), aplikasi tidak menampilkan pesan error teknis mentah (seperti kode HTTP

atau stack trace), melainkan pesan yang jelas dan actionable. Contoh rancangannya:


- Gagal upload karena koneksi: "Koneksi internet terputus. Foto belum berhasil diunggah - periksa koneksi Anda lalu tekan tombol Coba Lagi."

- Gagal proses klasifikasi di server: "Sistem sedang mengalami gangguan saat menganalisis foto. Foto Anda sudah tersimpan dan akan diproses ulang secara otomatis dalam beberapa menit."

- Format foto tidak didukung: "Format file tidak dikenali. Silakan unggah foto dalam format JPG atau PNG."

Setiap pesan disertai tombol aksi konkret (Coba Lagi/Unggah Ulang) agar pengguna tidak buntu,

bukan sekadar pemberitahuan bahwa "terjadi kesalahan".
