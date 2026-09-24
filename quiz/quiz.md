## LAPORAN PRAKTIKUM MATA KULIAH Pemrograman Internet II

## QUIZ

## KELAS : TRI C NPM NAMA : Dito Gilang Permadi : 24782073 Oleh:

## Ir. Nurul Qomariyah, M.Kom. Dian Ayu Afifah, S.Si., M.Sc. Dosen:

## TEKNOLOGI REKAYASA INTERNET JURUSAN TEKNOLOGI INFORMASI POLITEKNIK NEGERI LAMPUNG 2025/2026


## Bagian 1. Identitas dan Topik Proyek Aplikasi

| Nama aplikasi | RoadPulse |
| --- | --- |
| Judul lengkap proyek | Sistem Pemantauan dan Klasifikasi Kerusakan Infrastruktur Jalan Real- Time Berbasis Artificial Intelligence |
| Deskripsi singkat | RoadPulse adalah aplikasi web yang menerima foto permukaan jalan lalu menilainya dengan model deep learning (CNN dengan transfer learning MobileNetV2). Setiap foto digolongkan ke salah satu dari empat kelas: Crack (retak), Pothole (lubang), Surface Erosion (erosi permukaan), atau Normal (tidak rusak). Hasil beserta skor keyakinan (confidence score) disimpan di basis data dan ditampilkan pada dashboard berupa kartu hasil, tabel riwayat, dan grafik statistik. |
| Masalah yang ingin diselesaikan | Pendataan kondisi permukaan jalan masih banyak dilakukan lewat survei visual secara manual. Cara ini lambat, hasilnya bisa berbeda antar-surveyor karena penilaiannya subjektif, dan sulit diperluas ke jaringan jalan yang panjang. |
| Tujuan utama | Membantu petugas mengenali jenis kerusakan jalan dari foto lapangan dengan cepat dan seragam, serta menyajikan rekap hasilnya agar mudah dibaca dan dijadikan bahan penentuan prioritas perbaikan. |
| Target pengguna utama | Petugas atau surveyor dinas pekerjaan umum dan pengelola infrastruktur jalan yang membutuhkan alat bantu identifikasi cepat dari foto lapangan. Sebagian besar dari mereka ahli di bidang jalan, bukan ahli komputer. |

## Bagian 2. Resume Modul Digital Awareness

## Modul 1: There’s a whole new world out there!

Modul ini menunjukkan bahwa teknologi digital sudah menyatu dengan rutinitas harian: kita berkirim pesan lewat aplikasi, belajar lewat platform daring, membayar tagihan dari ponsel, dan mencari arah dengan peta digital. Intinya adalah peralihan dari cara analog ke digital, misalnya surat menjadi email, catatan kertas menjadi aplikasi, dan peta lipat menjadi GPS. Peralihan ini membuat banyak pekerjaan lebih cepat, lebih murah, dan bisa dilakukan dari mana saja. Meski begitu, manfaatnya baru terasa jika penggunanya paham cara memakai alat digital dengan benar.

## Modul 2: You’ll Need Some Basic Tools

Modul ini membahas perangkat yang menjadi pintu masuk ke dunia digital, yaitu komputer, laptop, tablet, dan ponsel, beserta pembagian antara perangkat keras dan perangkat lunak. Sistem operasi berperan sebagai perantara yang mengatur hubungan antara pengguna, aplikasi, dan perangkat keras. Modul ini juga menekankan pengelolaan file dan folder: memberi nama yang jelas, menyusun folder berjenjang, dan membuat cadangan supaya berkas mudah ditemukan dan tidak hilang. Terakhir, tentang kata sandi: sandi yang kuat itu panjang, berbeda untuk setiap


akun, tidak memakai data yang mudah ditebak seperti tanggal lahir, dan sebaiknya diperkuat dengan verifikasi dua langkah.

## Modul 3: This is how you get around and find what you’re looking for

Browser adalah aplikasi untuk membuka dan menjelajah halaman web. Modul ini memperkenalkan fungsi dasarnya, seperti kolom alamat (URL), tab, bookmark, dan riwayat penjelajahan. Modul ini juga membedakan pencarian di dalam perangkat (berdasarkan nama file, jenis, atau tanggal ubah) dengan pencarian di web (berdasarkan kata kunci yang harus dipilih dengan cermat, lalu hasilnya dinilai keandalannya). Selain itu, ada pembahasan hak cipta: karya yang dilindungi hak cipta tidak boleh digunakan sembarangan, sedangkan karya berstatus public domain atau berlisensi terbuka dapat dipakai dengan syarat tertentu, misalnya mencantumkan sumbernya.

## Modul 4: It just keeps getting better

Modul ini melihat perkembangan teknologi, terutama kecerdasan buatan (AI), yang kini mampu menjawab pertanyaan, membuat teks dan gambar, serta memberi rekomendasi. Di balik manfaatnya ada risiko, misalnya jawaban yang keliru, bias, dan penyalahgunaan data, sehingga hasil AI perlu diperiksa ulang oleh manusia. Modul ini juga memperkenalkan netiquette, yaitu etika berkomunikasi di internet: bersikap sopan, menghargai pendapat dan privasi orang lain, serta berpikir sebelum mengirim atau memposting sesuatu. Pengguna bertanggung jawab atas apa yang ia lakukan di ruang digital.

## Modul 5: Even Though It’s Digital, It is Real, With Real Consequences

Modul ini mengingatkan bahwa aktivitas digital membawa akibat nyata. Data pribadi yang sensitif (PII), seperti nama lengkap, alamat, nomor identitas, nomor telepon, dan lokasi, harus dijaga karena penyalahgunaannya dapat merugikan pemiliknya. Apa pun yang diunggah membentuk jejak digital yang sulit dihapus sepenuhnya. Jika menerima komunikasi bernada negatif seperti perundungan siber, langkah yang dianjurkan adalah tidak membalas dengan emosi, menyimpan bukti, memblokir, dan melaporkannya. Modul ini juga mengenalkan bentuk penipuan (fraud) seperti phishing dan pembajakan (piracy) atas perangkat lunak atau karya orang lain, beserta cara menghindarinya.

## Modul 6: Learn About Anything and Everything

Modul ini terdiri dari dua bagian. Pertama, langkah dasar troubleshooting ketika perangkat atau aplikasi bermasalah: pahami gejalanya, cek hal sederhana (koneksi, daya, kabel), mulai ulang, perbarui, lalu cari solusi atau minta bantuan bila belum teratasi. Kedua, kesenjangan keterampilan (skills gap) digital, yaitu jarak antara kemampuan yang dimiliki seseorang dan yang dibutuhkan dunia kerja atau kehidupan modern. Kesenjangan ini dapat dipersempit dengan belajar sepanjang hayat, misalnya lewat kursus daring dan latihan mandiri.


## Bagian 3. Hubungan dan Implementasi pada Topik Proyek

Bagian ini menghubungkan hasil pemahaman saya dengan alur kerja RoadPulse. Sebagian fitur sudah ada pada rancangan sistem kelompok (unggah foto, klasifikasi, penyimpanan hasil, dashboard). Fitur lain, seperti akun pengguna dan pencarian riwayat, belum tercantum pada dokumen arsitektur, sehingga saya tandai sebagai rancangan usulan agar tidak menimbulkan kesan bahwa fitur itu sudah jadi.

## 3.1 Mempermudah tugas sehari-hari pengguna

Proses tradisional yang disederhanakan RoadPulse adalah survei kondisi jalan secara manual. Surveyor turun ke lapangan, mengamati kerusakan dengan mata, menuliskannya di formulir kertas atau lembar kerja, lalu merekapnya kemudian menjadi laporan. Dengan RoadPulse, pengguna cukup memotret permukaan jalan, mengunggah foto lewat form di dashboard, dan membaca hasilnya. Perbandingannya adalah sebagai berikut.

| Tahap |   | Cara tradisional |   | Dengan RoadPulse |   |
| --- | --- | --- | --- | --- | --- |
| Penilaian |   | Berdasarkan pengamatan dan pengalaman masing-masing surveyor. |   | Model CNN menentukan kelas (Crack, Pothole, Surface Erosion, Normal) beserta skor keyakinan dalam hitungan detik. |   |
| Pencatatan |   | Ditulis di formulir kertas atau diketik ulang ke spreadsheet. |   | Hasil tersimpan otomatis di basis data bersama waktu unggah. |   |
| Rekap |   | Dihitung manual, biasanya menunggu akhir periode survei. |   | Dashboard menampilkan grafik jumlah deteksi per kelas dan tabel riwayat secara langsung. |   |
| Konsistensi |   | Dapat berbeda antar-surveyor. |   | Semua foto dinilai oleh model yang sama dengan kriteria yang sama. |   |

Agar mudah dipakai, alur utamanya dibuat hanya tiga langkah: pilih foto, unggah, lalu baca hasil. Perlu saya tegaskan bahwa RoadPulse berfungsi sebagai alat bantu identifikasi awal. Keputusan akhir tentang perbaikan tetap berada di tangan petugas, apalagi model belum diuji secara menyeluruh setelah kelas Normal ditambahkan.

## 3.2 Penyimpanan file, pendaftaran akun, dan kata sandi

Struktur penyimpanan. Pengguna awam tidak seharusnya diminta menyusun folder sendiri. Karena itu, penataan dilakukan oleh sistem dan yang dilihat pengguna adalah riwayat unggahan:

- Di sisi server, foto disimpan berjenjang berdasarkan tanggal (misalnya uploads/2026/09/24/), dan diberi nama otomatis yang seragam seperti roadpulse_20260924_101530_a1b2.jpg. Nama bawaan kamera seperti IMG_2034 tidak dipakai supaya tidak bentrok dan mudah ditelusuri. Kelas hasil


- klasifikasi disimpan di basis data, bukan di nama file, sehingga hasil koreksi label tidak mengharuskan file diganti namanya. • Di sisi pengguna, riwayat ditampilkan sebagai tabel yang dapat difilter berdasarkan kelas dan tanggal, lengkap dengan gambar mini (thumbnail) agar foto mudah dikenali. • Validasi unggahan: hanya JPG/PNG dengan batas ukuran tertentu, dan pesan penolakan ditulis dengan bahasa yang jelas (lihat 3.6). Pendaftaran akun dan kata sandi. Untuk membatasi siapa yang boleh mengunggah dan melihat data, akun petugas diusulkan menjadi tahap berikutnya. Bantuan

pembuatan kata sandi yang saya rancang:

- Panjang minimal 12 karakter, dengan anjuran memakai frasa sandi (beberapa kata acak) yang mudah diingat tetapi sulit ditebak. • Indikator kekuatan sandi yang berubah secara langsung disertai saran singkat, misalnya “tambahkan beberapa kata lagi”. • Penolakan sandi yang terlalu umum, hanya berisi angka, atau mirip dengan nama pengguna atau email. Django sudah menyediakan validator bawaan untuk hal-hal ini. • Tombol “tampilkan/sembunyikan sandi” dan dukungan untuk password manager (kolom tidak memblokir tempel/paste). • Sandi tidak pernah disimpan sebagai teks biasa; Django menyimpannya dalam bentuk hash. Verifikasi dua langkah ditawarkan sebagai opsi tambahan.

3.3 Fitur pencarian dan aset eksternal

## Desain pencarian. Pencarian dirancang untuk halaman riwayat deteksi, karena di situlah data akan menumpuk seiring waktu (rancangan usulan). Prinsipnya:

- Satu kolom pencarian yang terlihat jelas di bagian atas tabel, dengan teks petunjuk berisi contoh, misalnya “Cari kelas atau tanggal, mis. pothole atau 24 Sep”. • Hasil tersaring saat pengguna mengetik (dengan jeda singkat agar server tidak dibebani), tidak peka huruf besar/kecil, dan memahami istilah Indonesia maupun Inggris (“lubang” dan “pothole”). • Tombol filter cepat untuk keempat kelas (Crack, Pothole, Surface Erosion, Normal), pilihan rentang tanggal, dan urutan berdasarkan waktu atau skor keyakinan, agar pengguna tidak perlu mengetik apa pun. • Jika tidak ada hasil, tampilkan pesan yang membantu seperti “Tidak ada data yang cocok. Coba kata kunci lain atau hapus filter”, bukan halaman kosong.


Aset eksternal. Berikut daftar aset yang digunakan atau direncanakan, beserta status lisensinya.

| Aset |   | Fungsi |   | Lisensi / status |   | Kewajiban |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Django dan Django REST Framework |   | Backend dan REST API |   | Open-source, BSD 3- Clause |   | Menyertakan pemberitahuan hak cipta dan teks lisensi. |   |
| Chart.js |   | Grafik dashboard |   | Open-source, MIT |   | Menyertakan teks lisensi MIT. |   |
| MobileNetV2 (arsitektur dan bobot pralatih ImageNet) melalui framework deep learning, mis. TensorFlow/Keras |   | Model klasifikasi (transfer learning) |   | Kode framework Apache 2.0; penggunaan bobot pralatih di proyek ini bersifat akademik/non- komersial |   | Mencantumkan sumber framework dan makalah MobileNetV2 (Sandler dkk., 2018). |   |
| Dataset Crack, Pothole, Surface Erosion (Multiclass Road Surface Damage Classification Dataset, Mendeley Data, Daffodil International University) |   | Data latih 3 kelas kerusakan |   | Lisensi ditetapkan pemilik dataset di halaman Mendeley Data. Dataset di platform ini umumnya berlisensi Creative Commons, sehingga atribusi tetap wajib. Lisensi persisnya akan saya verifikasi. |   | Mencantumkan sitasi dataset (judul, penyedia, tahun, tautan). |   |
| Foto kelas Normal (352 gambar, dikumpulkan kelompok) |   | Data latih kelas Normal |   | Belum terdokumentasi. Sumber dan status hak ciptanya perlu ditelusuri: foto sendiri, public domain, atau berlisensi terbuka. |   | Mencatat sumber tiap foto; membuang foto yang lisensinya tidak jelas. |   |
| Docker dan Docker Compose |   | Menjalankan backend dan dashboard |   | Open-source, Apache 2.0 |   | Menyertakan lisensi bila didistribusikan. |   |
| React/Expo atau Flutter (versi mobile, bila jadi dipakai) |   | Antarmuka mobile |   | React dan Expo: MIT; Flutter: BSD 3-Clause |   | Menyertakan teks lisensi. |   |
| Ikon dan font antarmuka |   | Tampilan |   | Belum ditentukan. Bila dipakai, pilih yang berlisensi terbuka (mis. ikon Lucide, ISC; font Google Fonts, SIL OFL) |   | Mencantumkan atribusi sesuai lisensi. |   |


Seluruh atribusi ini akan dikumpulkan pada satu halaman “Kredit dan Lisensi” di dashboard serta pada berkas README di repositori, sehingga pengguna dan

pengembang lain dapat melihat asal setiap aset.

- 3.4 Etika digital dan AI yang bertanggung jawab

Jika ada fitur interaksi sosial, bagaimana mencegah pelanggaran etika digital? Jika ada fitur AI, bagaimana memastikannya bekerja secara etis dan bertanggung jawab?

## Interaksi sosial. RoadPulse pada rancangannya saat ini tidak memiliki fitur sosial seperti komentar, obrolan, atau profil publik, sehingga risiko perundungan dan ujaran kasar memang kecil. Bila di kemudian hari ditambahkan kolom catatan atau komentar pada suatu hasil deteksi, langkah pencegahannya: catatan hanya terlihat oleh anggota instansi yang sama, panjang teks dibatasi, ada penyaring kata kasar, setiap catatan mencatat nama pengirimnya, dan tersedia tombol lapor. Aturan penggunaan singkat juga ditampilkan di form unggah: hanya foto permukaan jalan, tanpa wajah orang atau pelat kendaraan yang dapat dikenali.

## AI yang etis dan bertanggung jawab. Fitur pintar RoadPulse adalah klasifikasi citra dengan CNN. Cara saya memastikannya adil dan bertanggung jawab:

- Transparan. Setiap hasil diberi label “prediksi AI” dan disertai skor keyakinan, bukan disajikan seolah-olah pasti benar. • Mengakui ketidakpastian. Bila skor di bawah ambang tertentu (mis. 60%), tampilan menyatakan “belum yakin, mohon verifikasi manual” dan tidak memaksakan satu label. • Manusia tetap memutuskan. Hasil model dipakai sebagai masukan, sedangkan keputusan perbaikan ada pada petugas. Pengguna dapat mengoreksi label yang

- dinilai keliru. • Menyadari bias data. Tiga kelas kerusakan berasal dari satu dataset asal Bangladesh, jumlah gambar antar-kelas timpang (Surface Erosion 651 dibanding Normal 352), dan kelas Normal dikumpulkan dari sumber berbeda dengan resolusi bervariasi. Mitigasinya: class weighting, augmentasi, evaluasi per kelas (precision, recall, F1) dan confusion matrix, serta pernyataan keterbatasan ini

- pada halaman “Tentang Model”. • Menghormati data pengguna. Foto yang diunggah pengguna tidak dipakai untuk melatih ulang model tanpa persetujuan yang jelas.


## 3.5 Data pribadi sensitif (PII) dan pencegahan penipuan

Prinsip yang saya pakai adalah data minimization: hanya mengumpulkan yang benar-benar dibutuhkan. Saat ini data yang tersimpan hanyalah foto, kelas hasil, skor keyakinan, dan waktu unggah. Tetap ada beberapa titik yang perlu diwaspadai:

| Data |   | Mengapa perlu |   | Perlindungan |   |
| --- | --- | --- | --- | --- | --- |
|   |   | diwaspadai |   |   |   |
| Foto lapangan |   | Dapat tanpa sengaja memuat wajah orang atau pelat nomor kendaraan. |   | Aturan unggah di form; opsi mengaburkan area sensitif (rancangan); akses hanya untuk pengguna berwenang. |   |
| Metadata foto (EXIF), terutama koordinat GPS dan tipe perangkat |   | Membuka lokasi dan kebiasaan pemotret. |   | Metadata dibuang saat foto disimpan, kecuali lokasi memang dibutuhkan untuk pemetaan kerusakan dan pengguna menyetujuinya. |   |
| Data akun (nama, email, sandi), jika modul akun dibuat |   | Bila bocor, akun dapat diambil alih. |   | Sandi disimpan dalam bentuk hash, hanya data yang perlu yang diminta, dan akses dibatasi menurut peran (petugas dan admin). |   |

Perlindungan teknis: koneksi HTTPS, konfigurasi rahasia (kunci dan kredensial) disimpan di environment variable dan berkas .env yang tidak diunggah ke GitHub, proteksi CSRF dan pembatasan CORS pada API, pembatasan jumlah permintaan (rate limiting), validasi jenis dan ukuran file unggahan, pencadangan basis data, serta batas waktu penyimpanan data.

Pencegahan penipuan siber. RoadPulse tidak memproses pembayaran, sehingga risiko penipuan finansial rendah. Ancaman yang tetap mungkin adalah phishing berupa halaman tiruan RoadPulse atau pesan yang meminta kata sandi. Langkah pencegahannya:

- Menggunakan domain resmi dengan HTTPS, dan menampilkan peringatan di halaman masuk bahwa admin tidak pernah meminta sandi lewat pesan atau email.

- Akun dibuat atau disetujui oleh admin instansi sehingga akun palsu sulit terdaftar.

- Tidak menampilkan iklan atau tautan pihak ketiga di dalam aplikasi.

- Menyediakan verifikasi dua langkah dan pemberitahuan bila ada login dari perangkat baru.

## 3.6 Komunikasi masalah teknis dan pesan error ramah pengguna

Pesan error dirancang dengan empat prinsip: (1) memakai bahasa sehari-hari tanpa istilah mentah seperti “500 Internal Server Error”, (2) menjelaskan apa yang terjadi tanpa menyalahkan pengguna, (3) menenangkan bahwa data aman bila memang demikian, dan (4) memberi langkah konkret serta tombol aksi. Kode kesalahan singkat


tetap ditampilkan kecil di bagian bawah agar admin mudah melacak masalahnya. Ini sejalan dengan rencana kelompok untuk menangani kondisi backend mati dan respons lambat pada sambungan frontend ke API.

| Situasi |   | Contoh pesan untuk pengguna |   | Panduan troubleshooting |   |
| --- | --- | --- | --- | --- | --- |
|   |   |   |   | mandiri |   |
| Koneksi internet terputus |   | Koneksi terputus Foto belum bisa dikirim karena perangkat Anda tampaknya sedang offline. Foto Anda masih aman di layar ini. |   | 1. Periksa Wi-Fi atau data seluler. 2. Coba buka situs lain untuk memastikan internet berjalan. 3. Tekan tombol Coba Lagi. |   |
| Data gagal dimuat (server bermasalah) |   | Data belum bisa ditampilkan Server sedang sibuk atau dalam perawatan. Data yang sudah Anda unggah tidak hilang. |   | 1. Tunggu beberapa menit, lalu tekan Muat Ulang. 2. Jika masih gagal setelah 5 menit, hubungi admin dan sebutkan kode E503. |   |
| Analisis berjalan lambat |   | Analisis memakan waktu lebih lama dari biasanya Mohon tunggu, foto Anda sedang diproses. |   | 1. Jangan menutup halaman ini. 2. Bila lebih dari 1 menit, tekan Batalkan, lalu unggah ulang dengan foto berukuran lebih kecil. |   |
| File tidak didukung atau terlalu besar |   | File tidak dapat diproses RoadPulse menerima foto berformat JPG atau PNG dengan ukuran maksimal 10 MB. |   | 1. Pilih foto lain dari galeri. 2. Kecilkan ukuran foto lewat pengaturan kamera atau aplikasi galeri, lalu unggah lagi. |   |
| Hasil kurang meyakinkan (skor rendah) |   | Hasil belum meyakinkan AI belum cukup yakin menilai foto ini, jadi mohon dicek manual. |   | 1. Foto ulang di tempat yang cukup terang. 2. Ambil dari sekitar 1–2 meter, menghadap lurus ke permukaan jalan, tanpa bayangan besar. |   |

## Daftar Sumber

- Cisco Networking Academy. Digital Awareness (modul 1–6).

- Daffodil International University. Multiclass Road Surface Damage Classification Dataset. Mendeley Data (2026).

- Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L.-C. (2018). MobileNetV2: Inverted Residuals and Linear Bottlenecks. CVPR 2018.

- Repositori proyek: https://github.com/Dito1290/RoadPulse
