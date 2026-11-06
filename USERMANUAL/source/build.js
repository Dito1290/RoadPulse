// Membangun manual.html untuk User Manual RoadPulse. Jalankan: node build.js [toc.json]
const fs = require('fs');
const path = require('path');
const D = require('./diagrams');

const tocPages = fs.existsSync(process.argv[2] || '') ? JSON.parse(fs.readFileSync(process.argv[2])) : {};
let fig = 0, tab = 0;
const toc = [];

const h1 = (id, t) => { toc.push([1, id, t]); return `<h1 id="${id}"><span class="h-mark">${t.split(' ')[0]}</span> ${t.split(' ').slice(1).join(' ')}</h1>`; };
const h2 = (id, t) => { toc.push([2, id, t]); return `<h2 id="${id}">${t}</h2>`; };
const figure = (src, cap, { w = '100%', cls = '' } = {}) => `<figure class="${cls}"><img src="img_print/${src.replace(/\.png$/, '.jpg')}" style="width:${w}"><figcaption><b>Gambar ${++fig}.</b> ${cap}</figcaption></figure>`;
const diagram = (svg, cap, { cls = '' } = {}) => `<figure class="diagram ${cls}">${svg}<figcaption><b>Gambar ${++fig}.</b> ${cap}</figcaption></figure>`;
const table = (cap, head, rows, { cls = '', widths } = {}) => `<table class="${cls}"><caption><b>Tabel ${++tab}.</b> ${cap}</caption>
  ${widths ? `<colgroup>${widths.map((w) => `<col style="width:${w}">`).join('')}</colgroup>` : ''}
  <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const kv = (cap, rows) => table(cap, ['Komponen', 'Informasi'], rows, { cls: 'kv', widths: ['26%', '74%'] });
const steps = (arr) => `<ol class="steps">${arr.map((s) => `<li>${s}</li>`).join('')}</ol>`;
const note = (t, kind = 'info') => `<div class="note ${kind}">${t}</div>`;
const code = (t) => `<code>${t}</code>`;
const badge = (t, k) => `<span class="badge ${k}">${t}</span>`;

// ── Happy path card (10 komponen wajib) ──
function happy(id, name, o) {
  toc.push([2, id, `${o.code} · ${name}`]);
  return `<section class="hp" id="${id}"><h2>${o.code} · ${name}</h2>
  <table class="kv hp-table"><colgroup><col style="width:22%"><col style="width:78%"></colgroup><tbody>
  <tr><td>1. Nama fitur</td><td>${name}</td></tr>
  <tr><td>2. Tujuan</td><td>${o.goal}</td></tr>
  <tr><td>3. Pra-syarat</td><td>${o.pre}</td></tr>
  <tr><td>4. Aktor</td><td>${o.actor}</td></tr>
  <tr><td>5. Langkah</td><td>${steps(o.steps)}</td></tr>
  <tr><td>6. Input</td><td>${o.input}</td></tr>
  <tr><td>7. Proses sistem</td><td>${o.process}</td></tr>
  <tr><td>8. Output</td><td>${o.output}</td></tr>
  <tr><td>9. Kondisi berhasil</td><td>${o.success}</td></tr>
  <tr><td>10. Bukti</td><td>${o.proof}</td></tr>
  </tbody></table></section>`;
}

// ── Unhappy path card (6 komponen wajib) ──
function unhappy(code, title, o) {
  return `<div class="uh"><div class="uh-title">${code} · ${title}</div>
  <table class="kv uh-table"><colgroup><col style="width:22%"><col style="width:78%"></colgroup><tbody>
  <tr><td>Kondisi pemicu</td><td>${o.trigger}</td></tr>
  <tr><td>Penyebab</td><td>${o.cause}</td></tr>
  <tr><td>Validasi</td><td>${o.check}</td></tr>
  <tr><td>Respons sistem</td><td>${o.response}</td></tr>
  <tr><td>Pesan error</td><td>${o.message}</td></tr>
  <tr><td>Solusi pengguna</td><td>${o.fix}</td></tr></tbody></table></div>`;
}

// ── Tester note row ──
const tn = (feat, status, proof, impact, notes, scen) => [`<b>${feat}</b>`, status, proof, impact, notes, scen];
const tnTable = (cap, rows) => table(cap, ['Fitur', 'Status', 'Bukti teknis', 'Dampak bagi pengguna', 'Catatan tester', 'Skenario uji'], rows, { cls: 'tn', widths: ['13%', '9%', '22%', '17%', '20%', '19%'] });

const S = {
  ok: badge('Complete', 'ok'), part: badge('Partial', 'warn'), no: badge('Not implemented', 'no'),
  pend: badge('Integration pending', 'pend'), issue: badge('Known issue', 'no'),
};

const body = [];

// ═══════════ COVER ═══════════
body.push(`<section class="cover">
  <div class="cover-grid"></div>
  <div class="cover-top"><div class="rp">RP</div><div><div class="cover-brand">RoadPulse</div><div class="cover-city">BANDAR LAMPUNG · SMART ROAD MONITORING</div></div></div>
  <div class="cover-main">
    <div class="cover-kicker">Dokumentasi Pengguna</div>
    <div class="cover-title">USER MANUAL</div>
    <div class="cover-sub">Sistem Klasifikasi Kerusakan Jalan Berbasis Artificial Intelligence</div>
    <p class="cover-desc">RoadPulse menerima foto permukaan jalan dari dashboard web atau aplikasi mobile, mengklasifikasikannya ke dalam empat kelas (<i>Crack, Pothole, Surface Erosion, Normal</i>) dengan model MobileNetV2, lalu menyimpan hasil beserta lokasi GPS untuk ditampilkan sebagai statistik, peta, dan riwayat inspeksi.</p>
  </div>
  <div class="cover-meta">
    <div><div class="cm-h">Disusun oleh · Kelompok 5</div>Bagas Aryaputra<br>Dito Gilan Permadi<br>Laika Apriyadi<br>M. Davin Rahadian</div>
    <div><div class="cm-h">Dosen pengampu</div>Ir. Nurul Qomariyah, S.Kom., M.Kom.<br>Dian Ayu Afifah, S.Si., M.Sc.<div class="cm-h" style="margin-top:10px">Mata kuliah</div>Pemrograman Internet</div>
    <div><div class="cm-h">Institusi</div>Teknologi Rekayasa Internet<br>Jurusan Teknologi Informasi<br>Politeknik Negeri Lampung<div class="cm-h" style="margin-top:10px">Dokumen</div>Versi 1.2 · 3 November 2026</div>
  </div>
</section>`);

// ═══════════ INFORMASI DOKUMEN ═══════════
body.push(`<section class="page">${h1('info', 'Informasi Dokumen')}
${table('Identitas dokumen', ['Atribut', 'Keterangan'], [
  ['Nama aplikasi', 'RoadPulse – Sistem Klasifikasi Kerusakan Jalan Berbasis AI'],
  ['Jenis dokumen', 'User Manual (panduan pengguna, alur sistem, penanganan error, catatan pengujian)'],
  ['Versi dokumen', '1.2 — 3 November 2026 (layar Masuk/Daftar dan bagian Akun di aplikasi mobile, endpoint pendaftaran, cara menjalankan dengan <code>./start.sh</code>). Versi 1.1 — 3 November 2026 (desain baru aplikasi mobile). Versi 1.0 — 30 Oktober 2026.'],
  ['Versi aplikasi', `Tidak ada nomor rilis resmi. ${code('mobile/app.json')} dan ${code('mobile/package.json')} mencatat <b>1.0.0</b>; API Swagger mencatat <b>1.0.0</b>. Backend & web tidak memiliki nomor versi tersendiri.`],
  ['Basis kode yang diaudit', `Repository lokal <b>Dito1290/RoadPulse</b>, commit <b>397c370</b> ("Vidio Demo Web Road Pulse", 25 Okt 2026) <b>ditambah perubahan lokal yang belum di-commit</b> (lihat catatan di bawah).`],
  ['Tujuan dokumen', 'Menjelaskan cara memakai RoadPulse sesuai implementasi yang benar-benar ada: aktor dan hak akses, alur utama, pesan error, serta status fitur untuk penguji.'],
  ['Target pembaca', 'Petugas/surveyor lapangan, operator dashboard, administrator sistem, dosen penilai, dan tester.'],
  ['Sumber bukti', 'Kode sumber (backend, frontend, mobile), respons API nyata, dan tangkapan layar dari aplikasi yang dijalankan secara lokal pada 30 Oktober 2026.'],
], { widths: ['24%', '76%'] })}
${note(`<b>Kondisi kode yang didokumentasikan.</b> Konflik hasil <i>git stash pop</i> pada ${code('backend/db.sqlite3')} dan ${code('settings.py')} sudah diselesaikan (3 November 2026: kedua versi data digabung menjadi 23 record), tetapi masih ada perubahan yang belum di-commit, antara lain perbaikan ${code('settings.py')}, pemetaan label model AI, ${code('backend/proxy.js')}, ${code('frontend/js/config.js')}, ${code('mobile/config.js')}, dan desain ulang aplikasi mobile (${code('mobile/App.js')}, ${code('mobile/screens/')}, ${code('mobile/components/')}, ${code('mobile/theme/')}). Seluruh perilaku dalam dokumen ini mengacu pada kondisi lokal tersebut. Jika tim memakai kode commit 397c370 murni, beberapa perilaku (terutama mobile dan alamat API) akan berbeda.`, 'warn')}
<h3>Konvensi penulisan</h3>
${table('Konvensi', ['Penanda', 'Arti'], [
  [code('teks monospace'), 'Nama file, endpoint, perintah, atau nilai yang diketik persis.'],
  ['<b>Tombol</b>', 'Label tombol/menu sebagaimana tertulis di aplikasi.'],
  ['"Pesan"', 'Pesan error/sukses yang dikutip langsung dari kode atau respons server.'],
  ['Gambar berlabel <i>Ilustrasi</i>', 'Gambar buatan berdasarkan kode, <b>bukan</b> tangkapan layar asli.'],
  ['Data uji', 'Data contoh untuk tangkapan layar: 14 gambar dari folder <code>dataset/</code> diklasifikasi lewat API pada database terpisah. Nama lokasi "Titik uji NN" dan koordinatnya adalah titik contoh, bukan laporan lapangan nyata.'],
], { widths: ['28%', '72%'] })}
</section>`);

// ═══════════ DAFTAR ISI (diisi build) ═══════════
body.push('<section class="page" id="toc-page"><h1 class="toc-title">Daftar Isi</h1><div id="toc-list">__TOC__</div></section>');

// ═══════════ BAB 1 PENGENALAN ═══════════
body.push(`<section class="page">${h1('bab1', '1. Pengenalan Aplikasi')}
<p>RoadPulse adalah sistem pemantauan kondisi permukaan jalan untuk wilayah Bandar Lampung. Petugas memotret jalan, sistem mengklasifikasikan foto dengan model <i>deep learning</i>, lalu hasilnya tersimpan bersama waktu dan lokasi sehingga dapat direkap pada dashboard.</p>
${h2('b1-tujuan', '1.1 Tujuan')}
<p>Laporan kelompok menyebut masalah utama: pemetaan kerusakan jalan masih manual, lambat, dan tidak konsisten antarsurveyor. RoadPulse menjawabnya dengan identifikasi otomatis jenis kerusakan dari foto lapangan dan rekap statistik dalam satu dashboard.</p>
${h2('b1-fungsi', '1.2 Fungsi utama yang terbukti di kode')}
${table('Fungsi utama dan lokasi implementasinya', ['Fungsi', 'Kanal', 'Bukti di kode'], [
  ['Klasifikasi foto ke 4 kelas: <i>Crack, Pothole, Surface Erosion, Normal</i>', 'Web, mobile, API', `${code('POST /api/v1/classify/')} → ${code('api/views.py: ClassifyView')} → ${code('ai_model/model_loader.py')}`],
  ['Penyimpanan hasil + foto + GPS + waktu foto', 'Backend', `${code('api/models.py: InspectionRecord')}, file ke ${code('media/uploads/')}`],
  ['Statistik jumlah per kelas & 5 inspeksi terbaru', 'Web, mobile', `${code('GET /api/v1/dashboard/stats/')}`],
  ['Riwayat inspeksi, 10 per halaman', 'Web, mobile (halaman 1)', `${code('GET /api/v1/dashboard/history/?page=N')}`],
  ['Peta titik inspeksi ber-GPS (maks. 1000)', 'Web', `${code('GET /api/v1/dashboard/map/')} + Leaflet/OpenStreetMap`],
  ['Ekspor riwayat ke CSV', 'Web', `${code('frontend/js/dashboard.js: downloadReport()')}`],
  ['Login berbasis token', 'Web, mobile', `${code('POST /api/v1/auth/login/')} (DRF Token)`],
  ['Pendaftaran akun mandiri', 'Mobile', `${code('POST /api/v1/auth/register/')} → ${code('api/views.py: RegisterView')}`],
  ['Pengelolaan data (ubah/hapus record, akun, token)', 'Django Admin', `${code('api/admin.py')} mendaftarkan semua model`],
  ['Dokumentasi API interaktif', 'Browser', `${code('/api/docs/')} (Swagger), ${code('/api/redoc/')}, ${code('/api/schema/')}`],
], { widths: ['36%', '18%', '46%'] })}
${h2('b1-arsitektur', '1.3 Gambaran arsitektur')}
${diagram(D.architecture(), 'Arsitektur RoadPulse. Client web dan mobile memanggil API melalui proxy Node.js di port 8000, yang meneruskan ke Django di port 8001. Django menyimpan data, file foto, dan menjalankan model AI.')}
${table('Komponen dan port', ['Komponen', 'Teknologi (sesuai file proyek)', 'Alamat']
, [
  ['Backend API', 'Python 3.11, Django 4.2.7, Django REST Framework 3.14.0, drf-spectacular 0.28.0', `${code('127.0.0.1:8001')}`],
  ['Proxy API', 'Node.js, modul bawaan <code>http</code> (tanpa dependency)', `${code('0.0.0.0:8000')}`],
  ['Model AI', 'PyTorch 2.2.2, torchvision 0.17.2, MobileNetV2, file <code>mobilenetv2_road_damage.pt</code>', 'dimuat oleh Django'],
  ['Database', 'PostgreSQL (default) atau SQLite (<code>DB_ENGINE=sqlite</code>)', `${code('127.0.0.1:5432')} / file`],
  ['Dashboard web', 'HTML/CSS/JS, Chart.js 4.4.0, Leaflet 1.9.4, exifr 7.1.3', `${code('http://localhost:3000')}`],
  ['Aplikasi mobile', 'Expo SDK 58, React Native 0.88.0, React 19.3.0, expo-camera, expo-location, react-native-webview 14.0.1 (peta Leaflet), AsyncStorage 2.2.0 (preferensi tema)', 'Expo Go, port Metro 8081'],
], { widths: ['18%', '56%', '26%'] })}
</section>`);

// ═══════════ BAB 2 PERSYARATAN ═══════════
body.push(`<section class="page">${h1('bab2', '2. Persyaratan Penggunaan')}
${table('Persyaratan per peran', ['Kebutuhan', 'Pengguna web', 'Pengguna mobile', 'Penyelenggara server'], [
  ['Perangkat', 'Komputer/laptop atau ponsel', 'Ponsel Android/iOS dengan kamera & GPS', 'Komputer (dokumentasi ditulis untuk macOS)'],
  ['Platform', 'Browser modern yang mendukung <code>fetch</code>, <code>FileReader</code>, Geolocation (diuji dengan Google Chrome)', 'Aplikasi <b>Expo Go</b> yang mendukung SDK 58', 'Python 3.11 (venv <code>backend/venv311</code>), Node.js ≥ 20, PostgreSQL atau SQLite'],
  ['Jaringan', 'Akses ke server (port 8000) dan <b>internet</b> untuk CDN Chart.js/Leaflet/exifr, Google Fonts, peta OpenStreetMap, dan Nominatim', 'Satu jaringan Wi-Fi/hotspot dengan komputer server; internet untuk peta (Leaflet dari unpkg + tile OpenStreetMap) dan nama jalan (geocoder perangkat)', 'Port 8000 harus dapat dijangkau dari LAN'],
  ['Izin perangkat', 'Izin lokasi browser (opsional, untuk GPS)', 'Izin kamera (wajib) dan lokasi (opsional)', '—'],
  ['Akun', 'Tidak wajib. Akun hanya untuk halaman login (dibuat oleh admin)', '<b>Wajib</b>. Masuk dengan akun yang ada, atau buat akun sendiri lewat tab <b>Daftar</b>', 'Akun <b>staff/superuser</b> untuk Django Admin'],
], { widths: ['15%', '28%', '28%', '29%'] })}
${note('<b>Registrasi mandiri</b> tersedia di aplikasi mobile dan di halaman login web (tab <b>Daftar</b>), keduanya memakai <code>POST /api/v1/auth/register/</code>. Akun yang dibuat selalu akun biasa (bukan staff) dan dapat dipakai di web maupun mobile. Akun admin dibuat dengan <code>python manage.py createsuperuser</code>. Untuk mencegah spam dan tebak kata sandi, server membatasi <b>10 percobaan login per menit</b> dan <b>5 pendaftaran per jam</b> untuk setiap alamat IP.')}
${h2('b2-jalankan', '2.1 Menjalankan layanan (untuk penyelenggara)')}
<p>Seluruh layanan (Django, proxy, dashboard web, dan Expo) dijalankan dengan <b>satu perintah</b> dari folder proyek:</p>
<pre>
cd RoadPulse
./start.sh                 # pindai QR yang muncul dengan Expo Go
</pre>
<p>Skrip ${code('start.sh')} otomatis: (1) menghentikan sisa layanan lama di port 8000/8001/3000 sehingga tidak muncul error <code>EADDRINUSE</code>, (2) menjalankan Django ${code('127.0.0.1:8001')} memakai PostgreSQL, proxy ${code('0.0.0.0:8000')}, dan dashboard web ${code(':3000')} di latar belakang, (3) menunggu sampai API benar-benar menjawab, (4) menulis IP Wi-Fi komputer saat ini ke ${code('mobile/.env.local')}, lalu (5) menjalankan ${code('npx expo start --clear')}. Tekan <b>Ctrl+C</b> sekali untuk mematikan semuanya.</p>
${table('Variasi perintah', ['Perintah', 'Kegunaan'], [
  ['<code>./start.sh</code>', 'Semua layanan + Expo (pemakaian normal)'],
  ['<code>./start.sh --no-mobile</code>', 'Hanya backend, proxy, dan dashboard web (tanpa Expo)'],
  ['<code>DB_ENGINE=sqlite ./start.sh</code>', 'Memakai SQLite (<code>backend/db.sqlite3</code>) sebagai cadangan, bukan PostgreSQL'],
  ['<code>tail -f .logs/django.log</code>', 'Melihat log Django; tersedia juga <code>.logs/proxy.log</code> dan <code>.logs/frontend.log</code>'],
], { widths: ['40%', '60%'] })}
${note('<b>Persiapan sekali saja</b> (sebelum <code>./start.sh</code> pertama kali): pasang PostgreSQL 18 (installer EDB), buat database dengan <code>/Library/PostgreSQL/18/bin/createdb -U postgres -h localhost Roadpulse_db</code>, pastikan <code>backend/.env</code> berisi <code>DB_NAME=Roadpulse_db</code>, <code>DB_USER=postgres</code>, <code>DB_PASSWORD=roadpulse</code>, <code>DB_HOST=127.0.0.1</code>, <code>DB_PORT=5432</code>, lalu <code>cd backend &amp;&amp; python3.11 -m venv venv311 &amp;&amp; venv311/bin/pip install -r requirements.txt &amp;&amp; venv311/bin/python manage.py migrate</code> dan <code>cd ../mobile &amp;&amp; npm install</code>. Bila skrip menulis "✗ API tidak merespons", isi log Django dan proxy langsung ditampilkan.')}
${table('Akses database PostgreSQL', ['Isian', 'Nilai'], [
  ['Host / Port', '<code>localhost</code> / <code>5432</code>'],
  ['Username / Kata sandi', '<code>postgres</code> / <code>roadpulse</code>'],
  ['Database', '<code>Roadpulse_db</code>'],
  ['pgAdmin 4', 'Cmd+Spasi → <b>pgAdmin 4</b> → Servers → PostgreSQL 18 (kata sandi <code>roadpulse</code>) → Databases → Roadpulse_db → Schemas → public → Tables → klik kanan tabel → View/Edit Data → All Rows'],
  ['Terminal (psql)', '<code>/Library/PostgreSQL/18/bin/psql -U postgres -h localhost -d Roadpulse_db</code>, lalu <code>\\dt</code> (daftar tabel), <code>select * from api_inspectionrecord limit 5;</code>, <code>\\q</code> (keluar)'],
], { widths: ['28%', '72%'] })}
${note('Kata sandi <code>roadpulse</code> hanya untuk pemakaian lokal. Bila log Django menampilkan <code>password authentication failed for user "postgres"</code>, samakan <code>DB_PASSWORD</code> di <code>backend/.env</code> dengan kata sandi PostgreSQL, atau jalankan sementara dengan <code>DB_ENGINE=sqlite ./start.sh</code>.', 'warn')}
${note('<b>Jangan memakai port 8001 di aplikasi mobile atau dashboard.</b> Django sengaja hanya mendengarkan <code>127.0.0.1</code>. Bila log Expo menampilkan <code>Backend connection error (http://&lt;IP&gt;:8000): Gagal terhubung ke server.</code>, pastikan <code>./start.sh</code> masih berjalan dan ponsel satu Wi-Fi dengan komputer, lalu tekan <b>r</b> di terminal Expo untuk memuat ulang aplikasi.', 'warn')}
${table('Alamat penting', ['Halaman', 'URL'], [
  ['Dashboard web', '<code>http://localhost:3000</code> (dari perangkat lain: <code>http://&lt;IP-LAN&gt;:3000</code>)'],
  ['Halaman login web', '<code>http://localhost:3000/login.html</code>'],
  ['Portal API & dokumentasi', '<code>http://localhost:8000/</code>, <code>/api/docs/</code>, <code>/api/redoc/</code>'],
  ['Django Admin', '<code>http://localhost:8000/admin/</code> (atau <code>http://127.0.0.1:8001/admin/</code>)'],
], { widths: ['30%', '70%'] })}
${note('Aplikasi mobile otomatis memakai IP komputer yang menjalankan Expo (port 8000). Alamat dapat diganti dari aplikasi melalui tombol <b>Pengaturan</b> (ikon roda gigi) di pojok kanan atas, atau lewat <code>EXPO_PUBLIC_API_URL</code> di <code>mobile/.env.local</code>.')}
</section>`);

// ═══════════ BAB 3 AKTOR ═══════════
body.push(`<section class="page">${h1('bab3', '3. Peta Interaksi dan Aktor')}
<p>Audit dilakukan pada ${code('settings.py')} (REST_FRAMEWORK), ${code('api/views.py')}, ${code('api/admin.py')}, ${code('frontend/js/*.js')}, dan kode mobile (${code('mobile/App.js')}, ${code('mobile/screens/*')}). Hasilnya: <b>tidak ada sistem role khusus aplikasi</b>. Pembedaan akses hanya berasal dari mekanisme bawaan Django: pengguna anonim, akun biasa, dan akun <i>staff/superuser</i>.</p>
${diagram(D.actors(), 'Diagram aktor dan hak akses. Garis menunjukkan fitur yang dapat digunakan setiap aktor. Kotak merah berisi role/fitur yang dicari tetapi tidak ditemukan dalam implementasi.')}
${table('Bukti implementasi otorisasi', ['Temuan', 'Bukti'], [
  ['Semua endpoint API publik', `${code("DEFAULT_PERMISSION_CLASSES = ['rest_framework.permissions.AllowAny']")} dan ${code('permission_classes = [AllowAny]')} pada ClassifyView, DashboardStatsView, InspectionHistoryView, InspectionMapView, LoginView, RegisterView.`],
  ['Dashboard web tidak mewajibkan login', `Fungsi ${code('authFetch()')} di ${code('frontend/js/app.js')} didefinisikan tetapi <b>tidak pernah dipanggil</b>. Diuji: setelah logout, ${code('index.html')} tetap terbuka dengan status "API terhubung".`],
  ['Token tidak dipakai untuk akses', `Token disimpan di ${code("localStorage['rp_token']")} (web) atau AsyncStorage ${code('roadpulse:session')} (mobile) saat login, tetapi tidak dikirim pada request dashboard maupun upload. Login mobile hanya menjadi gerbang di sisi aplikasi; API tetap publik.`],
  ['Admin dibatasi akun staff', `Django Admin menolak akun non-staff: "Please enter the correct username and password for a staff account…" (diuji).`],
  ['Tidak ada field status/role', `${code('InspectionRecord')} hanya memiliki image, class_label, confidence_score, latitude, longitude, location_name, captured_at, created_at.`],
], { widths: ['30%', '70%'] })}
</section>
<section class="page">
${h2('b3-detail', '3.1 Rincian setiap aktor')}
${table('Profil aktor', ['Aspek', 'Pengguna umum', 'Pengguna terdaftar', 'Administrator'], [
  ['Identitas & fungsi', 'Petugas lapangan/operator yang memotret atau mengunggah foto jalan dan melihat rekap', 'Pemilik akun Django biasa (is_staff = false)', 'Pemilik akun Django dengan is_staff/is_superuser'],
  ['Cara akses', 'Buka dashboard web tanpa login. Aplikasi mobile kini mewajibkan login, sehingga pemakai mobile termasuk pengguna terdaftar', 'Web: login di <code>login.html</code>. Mobile: layar <b>Masuk</b>, atau buat akun di tab <b>Daftar</b>', 'Login di <code>http://127.0.0.1:8001/admin/</code>'],
  ['Hak akses', 'Klasifikasi foto, statistik, peta, riwayat, unduh CSV (web)', 'Sama dengan pengguna umum; token tersimpan di browser/perangkat', 'Semua hak pengguna + CRUD record inspeksi, akun, grup, token'],
  ['Fitur', 'Web: upload, GPS, hasil, statistik, peta, riwayat, CSV', 'Login/logout web; aplikasi mobile lengkap (kamera, hasil, ringkasan, peta, riwayat, pengaturan, keluar), daftar akun', 'Django Admin, Swagger/ReDoc, portal API'],
  ['Batasan', 'Tidak dapat mengubah/menghapus data; tidak ada akses admin', 'Tidak dapat masuk Django Admin; token tidak memberi hak tambahan', '—'],
  ['Tidak diperbolehkan', 'Mengunggah file selain JPEG/PNG atau &gt; 10 MB (ditolak)', 'Mengakses Django Admin', '— (tidak ada pembatasan tambahan di kode)'],
  ['Hubungan dengan sistem', 'Sumber data inspeksi', 'Pengguna dashboard yang teridentifikasi di browser', 'Pengelola dan pengoreksi data'],
], { widths: ['16%', '28%', '28%', '28%'] })}
${table('Matriks hak akses fitur', ['Fitur', 'Umum', 'Terdaftar', 'Admin'], [
  ['Klasifikasi foto (web & mobile)', '✓', '✓', '✓'], ['Statistik, peta, riwayat', '✓', '✓', '✓'], ['Unduh CSV', '✓', '✓', '✓'],
  ['Login/logout web', '—', '✓', '✓'], ['Aplikasi mobile (perlu login)', '—', '✓', '✓'], ['Daftar akun mandiri (mobile)', '✓', '—', '—'], ['Django Admin: ubah/hapus record', '✗', '✗', '✓'], ['Kelola akun & token', '✗', '✗', '✓'],
], { cls: 'matrix', widths: ['55%', '15%', '15%', '15%'] })}
${note('<b>Role yang belum dapat diverifikasi:</b> pelapor terpisah, verifikator laporan, dan petugas dinas. Tidak ada model, permission, grup, atau UI yang mendukungnya, sehingga tidak didokumentasikan sebagai aktor.', 'warn')}
</section>`);

// ═══════════ BAB 4 WEB ═══════════
body.push(`<section class="page">${h1('bab4', '4. Panduan Dashboard Web')}
${h2('b4-login', '4.1 Masuk ke aplikasi')}
<p>Buka ${code('http://localhost:3000/login.html')}. Halaman login bersifat opsional karena dashboard (${code('index.html')}) juga dapat dibuka langsung.</p>
${figure('w01_login.png', 'Halaman login web (tangkapan layar asli).')}
${steps(['Isi <b>Username</b> dan <b>Kata sandi</b>. Ikon mata menampilkan/menyembunyikan kata sandi. Belum punya akun? Klik tab <b>Daftar</b> atau tautan <b>Daftar sekarang</b> (bagian 4.1a).', 'Klik <b>Masuk</b>. Tombol berubah menjadi "Memproses..." selama permintaan berlangsung.', 'Jika berhasil, token disimpan di browser dan halaman berpindah ke dashboard. Jika token sudah ada, halaman login langsung mengarahkan ke dashboard.'])}
<div class="two">${figure('w02_login_kosong.png', 'Validasi form kosong: pesan tampil di bawah setiap kolom.')}${figure('w03_login_salah.png', 'Kredensial salah (HTTP 401).')}</div>
${h2('b4-daftar', '4.1a Membuat akun baru (web)')}
${steps(['Pada halaman login, klik tab <b>Daftar</b> (atau buka <code>login.html#daftar</code>).', 'Isi <b>Username</b> (3–30 karakter: huruf, angka, titik, garis bawah), <b>Kata sandi</b> (minimal 8 karakter, tidak boleh terlalu umum, seluruhnya angka, atau mirip username), dan <b>Ulangi kata sandi</b> sampai muncul "✓ Kata sandi cocok".', 'Klik <b>Daftar &amp; masuk</b>. Akun dibuat sebagai pengguna biasa dan dashboard langsung terbuka. Kesalahan dari server (mis. "Username sudah dipakai. Coba yang lain.") tampil di bawah kolom terkait.'])}
<div class="two">${figure('w16_daftar.png', 'Form daftar akun baru di web.')}${figure('w17_daftar_error.png', 'Validasi: kata sandi tidak sama.')}</div>
</section>
<section class="page">
${h2('b4-navigasi', '4.2 Navigasi dashboard')}
${figure('w04_dashboard_hero.png', 'Halaman utama dashboard (tangkapan layar asli) setelah login.')}
${table('Elemen header', ['Elemen', 'Fungsi'], [
  ['Menu <b>Ringkasan · Deteksi jalan · Peta · Riwayat</b>', 'Menggulir ke bagian terkait pada halaman yang sama.'],
  ['Status <b>API terhubung / API tidak terhubung</b>', 'Hasil pemanggilan statistik & riwayat saat halaman dimuat.'],
  ['<b>Admin</b>', `Membuka ${code('/admin/')} pada alamat API (port 8000).`],
  ['<b>Unduh CSV</b>', 'Mengunduh seluruh riwayat; nonaktif bila belum ada data.'],
  ['<b>Keluar</b>', 'Menghapus token dari browser dan membuka halaman login.'],
  ['<b>Mulai deteksi</b>', 'Menggulir ke bagian unggah foto.'],
], { widths: ['38%', '62%'] })}
</section>
<section class="page">
${h2('b4-upload', '4.3 Mengunggah dan mengklasifikasikan foto')}
${steps(['Pada bagian <b>Unggah foto jalan</b>, klik area unggah atau seret foto ke dalamnya. Pemilih file dibatasi <code>image/jpeg, image/png</code>.', 'Pratinjau muncul bersama <b>Waktu foto</b> (dari EXIF <i>DateTimeOriginal/CreateDate</i>, atau waktu modifikasi file bila EXIF tidak ada) dan <b>Lokasi foto</b> (dari GPS EXIF bila ada).', 'Opsional: klik <b>Ambil lokasi GPS</b> untuk memakai lokasi perangkat; nama jalan dicari melalui Nominatim (OpenStreetMap).', 'Klik <b>Analisis foto</b>. Jika GPS belum ada, sistem mencoba mengambilnya otomatis; bila gagal, analisis tetap dilanjutkan tanpa titik peta.', 'Hasil tampil pada <b>Hasil klasifikasi</b> dengan label Bahasa Indonesia (Retakan, Lubang, Erosi permukaan, Normal). Bila keyakinan &lt; 50 %, muncul peringatan "Hasil kurang yakin, sebaiknya foto ulang" dan angka keyakinan di riwayat diberi warna kuning. Statistik, peta, serta riwayat dimuat ulang.'])}
<div class="two">${figure('w08_upload_preview.png', 'Pratinjau foto sebelum lokasi diambil.')}${figure('w09_upload_gps.png', 'Setelah <b>Ambil lokasi GPS</b>: "Lokasi GPS berhasil diperoleh."')}</div>
${figure('w11_hasil.png', 'Hasil klasifikasi: kelas, keyakinan, waktu foto & analisis, lokasi, dan tautan <b>Lihat peta</b>.')}
</section>
<section class="page">
${h2('b4-statistik', '4.4 Statistik')}
${figure('w05_statistik.png', 'Kartu jumlah per kelas dan grafik batang distribusi (Chart.js). Data uji sebelum unggahan baru.')}
${h2('b4-peta', '4.5 Peta lokasi')}
<p>Setiap record yang memiliki latitude dan longitude ditampilkan sebagai titik: <span class="dot g"></span> hijau untuk <i>Normal</i>, <span class="dot r"></span> merah untuk kelas kerusakan. Klik titik untuk melihat kelas, lokasi, waktu, dan tautan <b>Buka peta</b>. Record tanpa GPS tidak tampil di peta.</p>
${figure('w06_peta.png', 'Peta inspeksi: 12 dari 14 record data uji memiliki koordinat.')}
</section>
<section class="page">
${h2('b4-riwayat', '4.6 Riwayat dan ekspor CSV')}
${figure('w07_riwayat.png', 'Tabel riwayat (10 per halaman) dengan tombol <b>Sebelumnya</b>/<b>Berikutnya</b>.')}
<p>Kolom: tautan <b>Buka foto</b>, kelas, keyakinan, waktu foto/analisis, dan lokasi (nama jalan, koordinat bertaut ke OpenStreetMap, atau "Lokasi tidak tersedia").</p>
<p>Tombol <b>Unduh CSV</b> mengambil semua halaman riwayat lalu mengunduh ${code('roadpulse-riwayat.csv')} (UTF-8 dengan BOM) berkolom ${code('kelas, confidence, waktu_foto, waktu_analisis, lokasi_jalan, latitude, longitude, image_url')}. Diuji: file berisi header + 15 record dari dua halaman riwayat.</p>
${h2('b4-logout', '4.7 Keluar (logout)')}
<p>Klik <b>Keluar</b>. Token dihapus dari browser dan halaman berpindah ke login. Token di server <b>tidak</b> dihapus dan dashboard tetap dapat dibuka tanpa login (lihat Notes for Tester).</p>
${h2('b4-ponsel', '4.8 Tampilan pada layar kecil')}
<div class="two narrow-left">${figure('w15_web_ponsel.png', 'Dashboard web pada lebar 390 px.', { w: '70%' })}<div>${note('Dashboard bersifat responsif: menu dan tombol tersusun ulang pada layar sempit. Untuk pemakaian lapangan tersedia aplikasi mobile terpisah (Bab 5).')}</div></div>
</section>`);

// ═══════════ BAB 5 MOBILE ═══════════
body.push(`<section class="page">${h1('bab5', '5. Panduan Aplikasi Mobile')}
${note('<b>Ilustrasi — bukan tangkapan layar.</b> Simulator iOS/Android tidak tersedia pada komputer penyusun, sehingga tampilan di bawah digambar ulang dari kode mobile terbaru (<code>mobile/App.js</code>, <code>mobile/screens/*</code>, <code>mobile/components/*</code>) memakai warna, teks, dan susunan dari <code>mobile/theme/tokens.js</code>. Kode telah lolos <i>bundling</i> Android & iOS (<code>npx expo export</code>, 3 November 2026), tetapi pengujian langsung di perangkat belum dapat diverifikasi.', 'warn')}
<p>Aplikasi memakai desain <b>RoadPulse · Lampung Edition</b>: tema gelap navy sebagai bawaan dengan aksen hijau emerald, ornamen mahkota <b>Siger</b> dan garis motif <b>Tapis</b> sebagai aksen regional. Aplikasi dibuka dengan layar <b>Masuk/Daftar</b> berlatar video lalu lintas kota (sama dengan hero dashboard web); setelah masuk, navigasi utama berupa tiga tab di bawah layar: <b>Beranda</b>, <b>Ringkasan</b>, <b>Riwayat</b>.</p>
<div class="phones">${D.authScreens().join('')}</div>
<p class="figcap"><b>Gambar ${++fig}.</b> Ilustrasi layar Masuk (M0a) dan Daftar akun baru (M0b). Latar pada aplikasi berupa video bergerak; nama akun hanya contoh.</p>
<div class="phones">${D.mobileScreens().slice(0, 3).join('')}</div>
<p class="figcap"><b>Gambar ${++fig}.</b> Ilustrasi Beranda (M1–M2) dan layar kamera (M3), tema gelap. Angka, nama jalan, dan koordinat hanya contoh.</p>
${h2('b5-langkah', '5.1 Langkah penggunaan')}
${steps([
  'Pastikan ponsel satu jaringan dengan komputer server, lalu buka proyek di <b>Expo Go</b> dengan memindai QR dari <code>./start.sh</code>.',
  '<b>Masuk</b> (M0a): chip di kanan atas menunjukkan status server (<b>Online</b>/<b>Offline</b>/<b>Memeriksa</b>; ketuk untuk membuka Pengaturan alamat server). Isi <b>Username</b> dan <b>Kata sandi</b> lalu ketuk <b>Masuk</b> (tombol menampilkan "Memeriksa akun…"). Sesi disimpan di perangkat, jadi aplikasi tidak meminta login lagi saat dibuka ulang.',
  '<b>Belum punya akun?</b> Ketuk tab <b>Daftar</b> atau tautan <b>Daftar sekarang</b> (M0b). Username 3–30 karakter (huruf, angka, titik, garis bawah); kata sandi minimal 8 karakter dengan indikator kekuatan <b>Lemah/Cukup/Kuat/Sangat kuat</b>; isi <b>Ulangi kata sandi</b> sampai muncul "✓ Kata sandi cocok". Ketuk <b>Daftar &amp; masuk</b>: akun dibuat dan aplikasi langsung masuk.',
  'Setelah masuk, Beranda menyapa dengan nama akun (contoh "Selamat pagi, petugas_kedaton · Tabik Pun!"). Aplikasi meminta izin <b>lokasi</b> sekali. Kartu <b>Status sistem</b> di Beranda (M1) menampilkan <b>Server</b> (Memeriksa… → Online/Offline beserta alamat), <b>GPS</b> (Mencari sinyal… → Aktif/Izin ditolak), dan waktu <b>Diperbarui</b>.',
  'Beranda (M1) menampilkan ringkasan: <b>Total laporan</b>, <b>Perlu perbaikan</b> (retakan & lubang), <b>Perlu dipantau</b> (erosi), <b>Normal</b>, serta bilah <b>Tingkat kerusakan</b>. Ketuk <b>Detail</b> untuk membuka tab Ringkasan.',
  'Gulir Beranda (M2): <b>Peta kerusakan jalan</b> (Leaflet + OpenStreetMap, sama dengan dashboard web) menampilkan titik ber-GPS berwarna sesuai kelas; ketuk titik untuk membuka detail. Di bawahnya <b>Laporan terbaru</b> (3 inspeksi) dengan tautan <b>Lihat semua</b>.',
  'Ketuk <b>Foto & analisis jalan</b>. Izin kamera diminta bila belum diberikan. Layar kamera (M3): preview 3:4 sesuai rasio foto, penanda <b>GPS terkunci/Mencari GPS</b>, tombol rana aktif setelah kamera siap. Ketuk tombol rana.',
  'Aplikasi mengirim foto (kualitas 0,7), koordinat, nama lokasi hasil geocoder perangkat (batas 3 detik, cadangan "Bandar Lampung, Lampung"), dan waktu ambil ke <code>/api/v1/classify/</code>. Selama proses tampil "Menganalisis gambar…".',
  'Layar <b>Hasil Analisis</b> (M4) menampilkan kelas dalam Bahasa Indonesia, status, tingkat keyakinan, lokasi, koordinat, waktu, dan tombol <b>Lihat di peta</b> (membuka OpenStreetMap). Jika keyakinan &lt; 50 %, muncul peringatan dan tombol bawah berubah dari <b>Foto lagi</b> menjadi <b>Foto ulang</b>. Ketuk <b>Tutup</b> untuk kembali.',
  'Tab <b>Ringkasan</b> (M5): total inspeksi, jumlah rusak vs normal, tingkat rusak, dan distribusi empat kelas beserta persentasenya.',
  'Tab <b>Riwayat</b> (M6): daftar inspeksi dengan filter <b>Semua / Retakan / Lubang / Erosi permukaan / Normal</b> (filter bekerja pada data yang sudah dimuat), keyakinan &lt; 50 % ditandai kuning, dan tombol <b>Muat lebih banyak</b> untuk halaman berikutnya (10 per halaman). Ketuk satu baris untuk membuka <b>detail inspeksi</b> (M7). Tarik layar ke bawah untuk menyegarkan data.',
  '<b>Pengaturan</b> (M8): ketuk ikon roda gigi di kanan atas. Bagian <b>Akun</b> menampilkan username dan tombol <b>Keluar</b> (konfirmasi "Keluar dari akun?", lalu kembali ke layar Masuk). Pilih <b>Tema aplikasi</b> (Sistem/Terang/Gelap, disimpan di perangkat; contoh tema Terang pada M9). Pada <b>Server backend</b>, isi IP LAN komputer (contoh <code>http://192.168.1.10:8000</code>) lalu ketuk <b>Simpan &amp; hubungkan</b>. Bagian <b>Tentang</b> memuat versi aplikasi dan kredit foto Menara Siger.',
])}
${table('Pemetaan label kelas di aplikasi mobile', ['Kelas API', 'Label mobile', 'Status', 'Warna'], [
  ['Crack', 'Retakan', 'Perlu perbaikan', 'Merah'], ['Pothole', 'Lubang', 'Perlu perbaikan', 'Merah'],
  ['Surface Erosion', 'Erosi permukaan', 'Perlu dipantau', 'Kuning/oranye'], ['Normal', 'Normal', 'Kondisi baik', 'Hijau'],
], { widths: ['25%', '25%', '25%', '25%'] })}
${note('Login mobile memakai endpoint yang sama dengan login web; token disimpan di perangkat tetapi belum dikirim ke API (API tetap publik). Preferensi tema dan alamat server yang diisi manual disimpan di perangkat; bila alamat tersimpan tidak terjangkau (mis. pindah Wi-Fi), aplikasi otomatis mencoba IP komputer Expo. Kartu "Data lalu lintas dan titik kemacetan belum tersedia" di Beranda hanya informasi: fitur tersebut tidak ada di server.')}
</section>
<section class="page">
<div class="phones">${D.mobileScreens().slice(3).join('')}</div>
<p class="figcap"><b>Gambar ${++fig}.</b> Ilustrasi Hasil Analisis (M4), tab Ringkasan (M5), tab Riwayat (M6), detail inspeksi (M7), sheet Pengaturan dengan bagian Akun (M8), dan Beranda dengan tema Terang (M9). Data hanya contoh.</p>
</section>`);

// ═══════════ BAB 6 ADMIN ═══════════
body.push(`<section class="page">${h1('bab6', '6. Panduan Administrator')}
${h2('b6-portal', '6.1 Portal API dan dokumentasi')}
<div class="two">${figure('b01_portal_api.png', 'Portal API (<code>/</code>) berisi tautan Swagger, ReDoc, API JSON, Admin, dan daftar endpoint.')}${figure('b02_swagger.png', 'Swagger UI (<code>/api/docs/</code>) untuk mencoba setiap endpoint.')}</div>
${h2('b6-admin', '6.2 Masuk Django Admin')}
${steps(['Buka <code>http://localhost:8000/admin/</code> (dari perangkat lain: <code>http://&lt;IP-LAN&gt;:8000/admin/</code>), atau langsung <code>http://127.0.0.1:8001/admin/</code>.', 'Masuk dengan akun <i>staff/superuser</i>. Akun biasa ditolak.', 'Halaman utama menampilkan grup <b>Api › Inspection records</b>, <b>Auth Token › Tokens</b>, dan <b>Authentication and Authorization › Groups, Users</b>.'])}
<div class="two">${figure('b04_admin_nonstaff.png', 'Akun non-staff ditolak.')}${figure('b05_admin_index.png', 'Halaman utama Django Admin.')}</div>
</section>
<section class="page">
${h2('b6-record', '6.3 Mengelola record inspeksi')}
${figure('b06_admin_records.png', 'Daftar <b>Inspection records</b> (data uji).')}
${figure('b07_admin_edit.png', 'Form ubah record: Image, Class label (Crack/Pothole/Surface Erosion/Normal), Confidence score, Latitude, Longitude, Location name, Captured at. Tombol Save, Save and add another, Save and continue editing, Delete.', { w: '92%' })}
${note('Mengubah <b>Class label</b> di admin adalah satu-satunya cara mengoreksi hasil AI. Ini bukan fitur verifikasi: tidak ada status laporan, dan model tidak mencatat siapa yang mengoreksi. Riwayat perubahan hanya tersedia dari log bawaan Django Admin.', 'warn')}
</section>`);

// ═══════════ BAB 7 HAPPY PATH ═══════════
body.push(`<section class="page">${h1('bab7', '7. Skenario Jalur Utama (Happy Path)')}
<p>Setiap skenario di bawah dijalankan pada instans lokal terpisah (database dan folder media sementara), memakai kode yang sama dengan aplikasi.</p>
${diagram(D.reportFlow(), 'Flowchart alur laporan kerusakan (klasifikasi foto) dari pengguna hingga hasil tersimpan, berlaku untuk web dan mobile.')}
</section>
<section class="page">
${happy('hp1', 'Login dashboard web', {
  code: 'HP-01', goal: 'Mendapatkan token API dan membuka dashboard sebagai pengguna terdaftar.',
  pre: 'Django dan proxy berjalan; akun dibuat oleh admin; frontend dibuka di <code>login.html</code>.', actor: 'Pengguna terdaftar, Administrator',
  steps: ['Isi username dan kata sandi.', 'Klik <b>Masuk</b>.', 'Tunggu pengalihan ke dashboard.'],
  input: 'Username (teks), kata sandi (teks tersembunyi).',
  process: `Browser mengirim ${code('POST /api/v1/auth/login/')} (JSON). <code>LoginView</code> memanggil <code>authenticate()</code>, lalu <code>Token.objects.get_or_create()</code>.`,
  output: `HTTP 200 ${code('{"token": "…", "username": "…"}')}; token disimpan sebagai <code>rp_token</code>.`,
  success: 'Halaman berpindah ke <code>index.html</code> dan status "API terhubung" (diuji).', proof: 'Bagian 4.1 (tangkapan layar asli) dan flowchart login di bawah.',
})}
${diagram(D.loginFlow(), 'Flowchart login web sesuai <code>frontend/js/login.js</code> dan <code>LoginView</code>.', { cls: 'half' })}
</section>
<section class="page">
${happy('hp2', 'Klasifikasi foto jalan melalui web', {
  code: 'HP-02', goal: 'Mengetahui kelas kerusakan jalan dari sebuah foto dan menyimpannya beserta lokasi.',
  pre: 'Backend & proxy berjalan, file model <code>mobilenetv2_road_damage.pt</code> tersedia, foto JPEG/PNG ≤ 10 MB.', actor: 'Semua aktor (tanpa login)',
  steps: ['Klik <b>Mulai deteksi</b> atau menu <b>Deteksi jalan</b>.', 'Pilih/seret foto.', 'Klik <b>Ambil lokasi GPS</b> (opsional).', 'Klik <b>Analisis foto</b>.'],
  input: 'File foto; opsional latitude, longitude, nama lokasi, waktu foto (otomatis dari EXIF/GPS).',
  process: 'Validasi serializer → validasi ukuran/ekstensi/isi gambar → simpan record & file → koreksi orientasi EXIF, resize 224×224, normalisasi → MobileNetV2 + softmax → simpan kelas & keyakinan.',
  output: 'HTTP 201 berisi id, class_label, confidence_score, image_url, latitude, longitude, location_name, captured_at, created_at.',
  success: 'Pesan "Analisis selesai dan hasil tersimpan." dan kartu hasil tampil. Diuji: <code>Pothole/106.jpg</code> → Pothole 79,7 %, lokasi "Jalan Dokter Susilo, Bandar Lampung".',
  proof: 'Bagian 4.3 (tangkapan layar asli).',
})}
${happy('hp3', 'Melihat statistik, peta, dan riwayat', {
  code: 'HP-03', goal: 'Memantau rekap seluruh inspeksi.', pre: 'Backend berjalan; koneksi internet untuk grafik dan peta.', actor: 'Semua aktor',
  steps: ['Buka dashboard.', 'Gulir ke <b>Ringkasan</b>, <b>Peta</b>, dan <b>Riwayat</b>.', 'Pakai <b>Sebelumnya/Berikutnya</b> untuk halaman riwayat.'],
  input: 'Nomor halaman riwayat (otomatis).', process: 'Tiga request paralel: <code>/dashboard/stats/</code>, <code>/dashboard/history/?page=N</code>, <code>/dashboard/map/</code>.',
  output: 'Kartu & grafik per kelas, titik peta, tabel riwayat 10 baris.', success: 'Diuji: "14 inspeksi tersimpan", "12 titik foto berlokasi ditampilkan."', proof: 'Bagian 4.4–4.6 (tangkapan layar asli).',
})}
</section>
<section class="page">
${happy('hp4', 'Mengunduh riwayat CSV', {
  code: 'HP-04', goal: 'Mengambil seluruh data inspeksi untuk diolah di spreadsheet.', pre: 'Minimal satu record tersimpan.', actor: 'Semua aktor',
  steps: ['Klik <b>Unduh CSV</b> di header.'], input: '—', process: 'Mengambil halaman riwayat 1 hingga <code>total_pages</code>, menyusun CSV di browser.',
  output: '<code>roadpulse-riwayat.csv</code>.', success: 'Diuji: header + 15 record dari 2 halaman.', proof: 'Bagian 4.6.',
})}
${happy('hp5', 'Deteksi jalan dari aplikasi mobile', {
  code: 'HP-05', goal: 'Memotret jalan di lapangan dan langsung memperoleh klasifikasi.', pre: 'Expo Go, ponsel satu jaringan dengan server, izin kamera (dan lokasi).', actor: 'Pengguna umum (tanpa login)',
  steps: ['Di tab <b>Beranda</b>, ketuk <b>Foto & analisis jalan</b>.', 'Arahkan ke permukaan jalan, ketuk tombol rana.', 'Tunggu "Menganalisis gambar…".', 'Baca hasil; ketuk <b>Foto lagi/Foto ulang</b> atau <b>Tutup</b>.'],
  input: 'Foto kamera, GPS perangkat.', process: 'Sama dengan HP-02 (endpoint yang sama), dikirim via XMLHttpRequest dengan batas waktu 35 detik.',
  output: 'Layar Hasil Analisis (M4); ringkasan, peta, & riwayat dimuat ulang.', success: 'Kelas, keyakinan, dan lokasi tampil tanpa pesan error.',
  proof: 'Ilustrasi M1, M3, M4. <b>Belum diverifikasi di perangkat</b> dalam audit ini; endpoint yang sama telah diuji pada HP-02.',
})}
${happy('hp6', 'Koreksi data oleh administrator', {
  code: 'HP-06', goal: 'Memperbaiki atau menghapus record inspeksi yang salah.', pre: 'Akun staff/superuser; akses langsung ke port 8001.', actor: 'Administrator',
  steps: ['Login di <code>http://localhost:8000/admin/</code>.', 'Buka <b>Inspection records</b> → pilih record.', 'Ubah field lalu <b>Save</b>, atau <b>Delete</b>.'],
  input: 'Nilai field record.', process: 'Form Django Admin memvalidasi dan menyimpan model <code>InspectionRecord</code>.', output: 'Pesan sukses Django Admin; data dashboard ikut berubah.',
  success: 'Halaman daftar & form ubah terbuka (diuji). Penyimpanan perubahan tidak dijalankan agar data uji tetap konsisten.', proof: 'Bagian 6.2–6.3 dan flowchart koreksi data pada akhir bab ini.',
})}
</section>
<section class="page">
${happy('hp7', 'Logout', {
  code: 'HP-07', goal: 'Mengakhiri sesi di browser.', pre: 'Sudah login.', actor: 'Pengguna terdaftar, Administrator',
  steps: ['Klik <b>Keluar</b>.'], input: '—', process: '<code>localStorage.removeItem(\'rp_token\')</code>, lalu pindah ke <code>login.html</code>.',
  output: 'Halaman login.', success: 'Diuji: URL menjadi <code>/login.html</code> dan token kosong.', proof: 'Bagian 4.7.',
})}
${diagram(D.adminFlow(), 'Flowchart koreksi data oleh administrator. Verifikasi laporan tidak tersedia di aplikasi.', { cls: 'half' })}
</section>`);

// ═══════════ BAB 8 UNHAPPY ═══════════
body.push(`<section class="page">${h1('bab8', '8. Penanganan Error (Unhappy Path)')}
${table('Batas validasi yang ditemukan di kode', ['Aturan', 'Nilai', 'Lokasi'], [
  ['Ukuran file maksimum', '<b>10 MB</b> (10 × 1024 × 1024 byte)', '<code>preprocessor.py: validate_image(max_size_mb=10)</code>; web: <code>app.js</code> <code>10 * 1024 * 1024</code>'],
  ['Ekstensi diizinkan (server)', '<code>.jpg</code>, <code>.jpeg</code>, <code>.png</code>', '<code>validate_image()</code>'],
  ['MIME di pemilih file web', '<code>image/jpeg, image/png</code>; validasi JS hanya <code>image.*</code>', '<code>index.html</code>, <code>app.js</code>'],
  ['Isi gambar', 'Harus dapat dibuka Pillow (<code>ImageField</code> + <code>img.verify()</code>)', 'serializer & <code>validate_image()</code>'],
  ['Field wajib API', '<code>image</code>; opsional: latitude, longitude (angka), location_name (≤ 255), captured_at (ISO 8601)', '<code>ClassifyRequestSerializer</code>'],
  ['Batas waktu mobile', 'Data dashboard & peta 6 s, upload 35 s, uji alamat 3 s, nama lokasi 3 s, pemuatan peta 15 s', '<code>mobile/App.js</code>, <code>services/api.js</code>, <code>components/RoadMap.js</code>'],
], { widths: ['24%', '38%', '38%'] })}
${diagram(D.errorFlow(), 'Flowchart penanganan error saat mengirim foto, dari validasi browser hingga model AI.')}
</section>
<section class="page">
${h2('b8-form', '8.1 Form dan autentikasi')}
${unhappy('UH-01', 'Form login kosong', { trigger: 'Klik <b>Masuk</b> dengan username atau kata sandi kosong.', cause: 'Field wajib tidak diisi.', check: '<code>login.js</code>: <code>if (!username || !password)</code>', response: 'Request tidak dikirim; kotak error tampil.', message: '"Username dan kata sandi wajib diisi."', fix: 'Isi kedua field.' })}
${unhappy('UH-02', 'Username atau kata sandi salah', { trigger: 'Kredensial tidak cocok.', cause: '<code>authenticate()</code> mengembalikan <code>None</code>.', check: '<code>LoginView.post</code>', response: 'HTTP 401.', message: '"Username atau kata sandi salah"', fix: 'Periksa huruf besar/kecil; minta admin mengatur ulang kata sandi lewat Django Admin.' })}
${unhappy('UH-02b', 'Terlalu banyak percobaan login/daftar', { trigger: 'Lebih dari 10 login per menit atau 5 pendaftaran per jam dari IP yang sama.', cause: 'DRF <code>ScopedRateThrottle</code> (scope <code>login</code>/<code>register</code>).', check: '<code>LoginView</code>/<code>RegisterView</code>, <code>api/exceptions.py</code>', response: 'HTTP 429 + header <code>Retry-After</code>.', message: '"Terlalu banyak percobaan. Coba lagi dalam N detik."', fix: 'Tunggu sesuai waktu yang disebutkan. Batas dapat diubah lewat <code>THROTTLE_LOGIN</code>/<code>THROTTLE_REGISTER</code> di <code>.env</code>.' })}
${unhappy('UH-03', 'Server tidak terjangkau saat login', { trigger: 'Backend/proxy mati atau alamat salah.', cause: '<code>fetch</code> gagal (network error).', check: '<code>login.js</code> blok <code>catch</code>', response: 'Tombol aktif kembali, pesan tampil.', message: '"Tidak bisa terhubung ke server. Pastikan backend sudah berjalan."', fix: 'Jalankan <code>./start.sh</code> (Django 8001 + proxy 8000).' })}
${unhappy('UH-04', 'Akses Django Admin tanpa hak', { trigger: 'Login admin dengan akun non-staff.', cause: 'Akun tidak memiliki <code>is_staff</code>.', check: 'Form login bawaan Django Admin', response: 'Tetap di halaman login.', message: '"Please enter the correct username and password for a staff account. Note that both fields may be case-sensitive."', fix: 'Minta admin mengaktifkan status staff.' })}
${unhappy('UH-05', 'Header token tidak valid', { trigger: 'Request API membawa <code>Authorization: Token &lt;salah&gt;</code>.', cause: 'TokenAuthentication memeriksa header sebelum AllowAny.', check: 'DRF <code>TokenAuthentication</code>', response: 'HTTP 401 walaupun endpoint publik.', message: '<code>{"error":"Invalid token."}</code>', fix: 'Hapus header atau login ulang. Client web/mobile saat ini tidak mengirim header ini.' })}
</section>
<section class="page">
${h2('b8-upload', '8.2 Validasi unggahan')}
${unhappy('UH-06', 'File bukan gambar (web)', { trigger: 'Memilih/menyeret file non-gambar.', cause: 'MIME tidak cocok <code>image.*</code>.', check: '<code>app.js: handleFileSelect()</code>', response: 'Pesan di bawah tombol <b>Analisis foto</b>; file tidak dipakai.', message: '"Pilih file gambar JPEG atau PNG."', fix: 'Pilih foto JPEG atau PNG.' })}
${unhappy('UH-07', 'File lebih dari 10 MB (web)', { trigger: 'Memilih foto &gt; 10 MB.', cause: 'Batas ukuran klien.', check: '<code>file.size &gt; 10 * 1024 * 1024</code>', response: 'Pesan di bawah tombol <b>Analisis foto</b>.', message: '"Ukuran foto maksimal 10 MB."', fix: 'Kompres atau perkecil foto.' })}
${unhappy('UH-08', 'Format GIF/WebP (lolos browser, ditolak server)', { trigger: 'Mengunggah gambar selain JPEG/PNG.', cause: 'Filter browser hanya <code>image.*</code>; server membatasi ekstensi.', check: '<code>validate_image()</code>', response: 'HTTP 400; pesan tampil di bawah tombol.', message: '"Only JPEG and PNG images are allowed"', fix: 'Konversi ke JPEG/PNG.' })}
${figure('w12_error_format.png', 'Pesan error format pada dashboard (tangkapan layar asli).', { w: '82%' })}
${unhappy('UH-09', 'File lebih dari 10 MB (API/mobile)', { trigger: 'Request ke API dengan file &gt; 10 MB.', cause: 'Batas server.', check: '<code>validate_image(max_size_mb=10)</code>', response: 'HTTP 400.', message: '"File size exceeds 10MB limit"', fix: 'Perkecil foto.' })}
</section>
<section class="page">
${unhappy('UH-10', 'Tanpa gambar atau gambar rusak', { trigger: 'Field <code>image</code> kosong, atau file berekstensi .jpg tetapi isinya bukan gambar.', cause: 'Validasi <code>ImageField</code> gagal.', check: '<code>ClassifyRequestSerializer</code>', response: 'HTTP 400 dengan rincian per field.', message: '"Invalid request data" + <code>"No file was submitted."</code> / <code>"Upload a valid image. The file you uploaded was either not an image or a corrupted image."</code>', fix: 'Unggah ulang foto yang valid.' })}
${unhappy('UH-11', 'Koordinat atau waktu tidak valid', { trigger: 'latitude/longitude bukan angka, atau captured_at bukan ISO 8601.', cause: 'Validasi tipe data.', check: '<code>FloatField</code>, <code>DateTimeField</code>', response: 'HTTP 400.', message: '"Invalid request data" + <code>"A valid number is required."</code> / <code>"Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."</code>', fix: 'Biarkan client mengisi otomatis; untuk API kirim angka desimal dan waktu ISO 8601.' })}
${unhappy('UH-12', 'GPS tidak tersedia (web)', { trigger: 'Izin lokasi ditolak atau perangkat tanpa GPS.', cause: 'Geolocation gagal (batas 15 s).', check: '<code>app.js: getCurrentPosition()</code>', response: 'Analisis tetap berjalan tanpa titik peta.', message: '"Izin/lokasi GPS tidak tersedia. Aktifkan lokasi perangkat lalu coba lagi." (+ " Analisis dilanjutkan tanpa titik peta.") / "Browser ini tidak mendukung akses GPS."', fix: 'Izinkan lokasi pada browser bila ingin tampil di peta.' })}
${h2('b8-ai', '8.3 Proses AI dan server')}
${unhappy('UH-13', 'Model AI tidak tersedia', { trigger: 'File <code>.pt</code> tidak ada, PyTorch tidak terpasang, atau checkpoint rusak.', cause: '<code>ModelUnavailableError</code>.', check: '<code>model_loader.load_model()</code>', response: 'Record dihapus; HTTP 503.', message: '"Trained model not found at …/mobilenetv2_road_damage.pt. Run python ai_model/train.py first." / "PyTorch and torchvision are required. Install backend/requirements.txt." / "Could not load trained model: …"', fix: 'Penyelenggara memasang dependensi atau melatih ulang model.' })}
</section>
<section class="page">
${unhappy('UH-14', 'Prediksi gagal', { trigger: 'Exception lain saat inferensi.', cause: 'Kesalahan tak terduga di pipeline AI.', check: '<code>ClassifyView</code> blok <code>except Exception</code>', response: 'Record dihapus; HTTP 500.', message: '<code>{"error": "Prediction failed", "details": "…"}</code>; web: pesan error dari server, atau "Klasifikasi gagal. Periksa server dan model."', fix: 'Coba foto lain; laporkan ke penyelenggara.' })}
${unhappy('UH-15', 'Database gagal menyimpan', { trigger: 'Database mati atau kredensial salah.', cause: 'Koneksi DB gagal.', check: '<code>ClassifyView</code>: <code>inspection.save()</code> dibungkus <code>try/except DatabaseError</code>; error lain ditangkap <code>api/exceptions.py</code>.', response: 'HTTP 503 (gagal simpan) atau 500, selalu dalam format JSON; detail dicatat di log server.', message: '"Gagal menyimpan data inspeksi ke database. Coba lagi nanti." / "Terjadi kesalahan di server. Coba lagi nanti."', fix: 'Penyelenggara memperbaiki konfigurasi database (lihat Integration Pending).' })}
${unhappy('UH-16', 'API tidak terhubung (dashboard)', { trigger: 'Proxy/Django mati atau alamat API salah.', cause: 'Request statistik/riwayat gagal.', check: '<code>dashboard.js: loadDashboard()</code>', response: 'Status merah, tabel kosong.', message: '"API tidak terhubung" dan "Riwayat tidak dapat dimuat. Jalankan backend Django di port 8000."', fix: 'Jalankan <code>./start.sh</code>, lalu muat ulang halaman.' })}
<div class="two">${figure('w13_api_offline_header.png', 'Status API tidak terhubung.')}${figure('w14_api_offline_riwayat.png', 'Riwayat saat API mati.')}</div>
${unhappy('UH-17', 'Proxy aktif, Django mati', { trigger: 'Hanya <code>node proxy.js</code> yang berjalan.', cause: 'Port 8001 tidak menerima koneksi.', check: '<code>proxy.js</code> <code>proxyReq.on(\'error\')</code>', response: 'HTTP 502.', message: '<code>{"error":"Backend server unavailable","details":"connect ECONNREFUSED 127.0.0.1:8001"}</code>', fix: 'Jalankan <code>python manage.py runserver 127.0.0.1:8001</code>.' })}
</section>
<section class="page">
${h2('b8-mobile', '8.4 Aplikasi mobile')}
${table('Pesan error aplikasi mobile (dari mobile/App.js, screens/, components/)', ['Kondisi pemicu', 'Respons & pesan', 'Solusi'], [
  ['Login: username/kata sandi salah', 'Kolom kata sandi bergaris merah + "Username atau kata sandi salah"', 'Periksa ejaan, atau daftar akun baru.'],
  ['Login/daftar: kolom kosong atau tidak valid', '"Username wajib diisi." / "Kata sandi wajib diisi." / "Username 3–30 karakter." / "Hanya huruf, angka, titik, dan garis bawah." / "Minimal 8 karakter." / "Kata sandi tidak sama."', 'Perbaiki kolom yang ditandai merah.'],
  ['Daftar: ditolak server', '"Username sudah dipakai. Coba yang lain." atau pesan validator kata sandi Django (mis. terlalu umum / seluruhnya angka / mirip username)', 'Pilih username lain atau kata sandi yang lebih kuat.'],
  ['Login/daftar: server tidak terjangkau', '"Gagal terhubung ke server. Pastikan HP dan komputer satu Wi-Fi." / "Server tidak merespons. Periksa koneksi lalu coba lagi." / "Server belum mendukung pendaftaran. Perbarui backend." (HTTP 404)', 'Jalankan <code>./start.sh</code>, samakan Wi-Fi, atau atur alamat lewat chip status.'],
  ['Izin kamera ditolak', 'Alert "Izin Kamera Dibutuhkan" — "Mohon izinkan akses kamera untuk mendeteksi jalan."', 'Izinkan kamera di pengaturan ponsel.'],
  ['Kamera gagal dibuka', 'Alert "Kamera tidak tersedia" — pesan sistem atau "Gagal membuka kamera."', 'Tutup aplikasi lain yang memakai kamera, buka ulang.'],
  ['Foto gagal diambil', 'Alert "Gagal Mengambil Foto" — pesan sistem atau "Coba arahkan ulang kamera lalu ambil foto lagi."', 'Ulangi pengambilan.'],
  ['Server tidak terjangkau (dashboard)', 'Status sistem <b>Server: Offline</b> dan tautan "Server tidak terjangkau — atur alamat server ›"; log "Koneksi timeout." / "Gagal terhubung ke server."', 'Samakan Wi-Fi, periksa IP & proxy, atau ketuk tautan untuk membuka Pengaturan.'],
  ['Upload gagal/timeout', 'Kartu "Analisis gagal" berisi "Upload timeout." / "Gagal mengirim gambar ke server." / pesan <code>error</code> dari server + alamat server', 'Periksa koneksi, ulangi foto.'],
  ['Respons bukan JSON', '"Respon tidak valid (&lt;kode HTTP&gt;)"', 'Pastikan alamat mengarah ke proxy RoadPulse.'],
  ['Alamat server kosong', 'Alert "Alamat kosong" — "Isi dengan IP LAN komputer, contoh http://192.168.1.10:8000"', 'Isi IP LAN komputer.'],
  ['Izin lokasi ditolak', 'Status sistem <b>GPS: Izin ditolak</b>; di kamera "Mencari GPS"; koordinat "GPS belum tersedia" dan lokasi "Bandar Lampung, Lampung"', 'Izinkan lokasi agar titik muncul di peta.'],
  ['Peta tidak termuat (tanpa internet/timeout 15 s)', '"Peta tidak dapat dimuat" — "Peta tidak merespons. Periksa koneksi internet HP." / "Tile peta OpenStreetMap gagal dimuat." / "Pustaka peta tidak dapat diunduh." + tombol <b>Coba lagi</b>', 'Aktifkan internet HP, ketuk Coba lagi.'],
  ['Titik peta gagal diambil dari server', '"Titik peta gagal dimuat: &lt;pesan&gt;" di bawah peta', 'Periksa koneksi server, tarik untuk segarkan.'],
  ['Halaman riwayat berikutnya gagal', '"Gagal memuat halaman berikutnya: &lt;pesan&gt;"', 'Ketuk Muat lebih banyak lagi.'],
  ['Keyakinan model &lt; 50 %', 'Kotak "Hasil kurang yakin, sebaiknya foto ulang" + tombol <b>Foto ulang</b> (hasil tetap tersimpan); di riwayat & detail angka keyakinan berwarna kuning dan "hasil ini sebaiknya dicek ulang"', 'Foto lebih dekat, terang, tidak buram.'],
], { widths: ['24%', '48%', '28%'] })}
${h2('b8-lain', '8.5 Kondisi lain')}
${table('Perilaku data tidak ditemukan dan request tidak valid', ['Kondisi', 'Respons nyata', 'Keterangan'], [
  ['Endpoint tidak ada (mis. <code>/api/v1/laporan/</code>)', 'HTTP 404', 'Halaman 404 bawaan Django.'],
  ['<code>GET /api/v1/classify/</code>', 'HTTP 405 <code>{"detail":"Method \\"GET\\" not allowed."}</code>', 'Klasifikasi hanya menerima POST.'],
  ['Riwayat <code>?page=999</code> atau <code>?page=abc</code>', 'HTTP 200, mengembalikan halaman terakhir/pertama', '<code>Paginator.get_page()</code> tidak mengembalikan 404.'],
  ['Login API dengan body kosong', 'HTTP 401 "Username atau kata sandi salah"', 'Validasi kosong hanya di frontend.'],
  ['Peta tanpa internet', '"Peta tidak dapat dimuat. Periksa koneksi internet."', 'Leaflet dimuat dari CDN.'],
  ['Belum ada data', '"Belum ada hasil klasifikasi." / "Belum ada foto dengan data GPS…" / mobile "Belum ada laporan" (Beranda), "Belum ada inspeksi" (Riwayat), "Tidak ada yang cocok" (filter), "Belum ada inspeksi dengan koordinat GPS…" (peta)', 'Kondisi kosong normal.'],
], { widths: ['30%', '40%', '30%'] })}
</section>`);

// ═══════════ BAB 9 NOTES FOR TESTER ═══════════
body.push(`<section class="page landscape-ish">${h1('bab9', '9. Notes for Tester')}
<p>Status ditentukan dari pemeriksaan kode <b>dan</b> pengujian nyata pada 30 Oktober 2026. Sejak 3 November 2026 proyek memiliki <b>18 automated test</b> (<code>cd backend &amp;&amp; venv311/bin/python manage.py test api</code>, lolos juga di PostgreSQL pada 6 November 2026 → "Ran 18 tests … OK") yang menguji klasifikasi (model ditiru), validasi unggahan, error database/model dalam format JSON, statistik, riwayat, peta, login, daftar, dan pembatasan percobaan. Pengujian lain di bawah dilakukan secara manual/skrip oleh penyusun.</p>
${table('Ringkasan pengujian yang benar-benar dijalankan', ['Pengujian', 'Hasil'], [
  ['Django system check (PostgreSQL & SQLite)', 'Lolos, 0 isu'],
  ['Akurasi AI pada 377 gambar validasi (split 80/20, seed 42 seperti <code>train.py</code>)', '<b>84,1 %</b> (317/377), 0 error; per kelas: Normal 100 %, Crack 84,6 %, Surface Erosion 82,9 %, Pothole 72,1 %'],
  ['Latensi inferensi (CPU)', 'Median 58 ms, maksimum ±1,05 s per gambar'],
  ['Endpoint classify: JPEG, PNG RGBA, grayscale, EXIF terputar, 4000×3000', 'HTTP 201 untuk semua'],
  ['Endpoint classify: rusak, GIF, &gt; 10 MB, tanpa gambar, model hilang', '400, 400, 400, 400, 503 (tanpa record tersisa)'],
  ['Alur web end-to-end di Chrome (login, upload, hasil, statistik, peta, riwayat, CSV, logout)', 'Berhasil; tangkapan layar pada Bab 4'],
  ['Bundling aplikasi mobile desain baru (Android & iOS, <code>npx expo export</code>, 3 Nov 2026)', 'Berhasil; <b>tidak diuji di perangkat</b>'],
], { widths: ['62%', '38%'] })}
${h2('b9-complete', '9.1 Complete / siap diuji')}
${tnTable('Fitur complete', [
  tn('Klasifikasi foto (web/API)', S.ok, 'ClassifyView + model_loader; diuji 201', 'Hasil instan & tersimpan', 'Akurasi model ±84 %', 'Unggah 1 foto per kelas dari <code>dataset/</code>; bandingkan label'),
  tn('Statistik, peta, riwayat', S.ok, '3 endpoint dashboard; diuji di Chrome', 'Rekap data terkini', 'Peta perlu internet', 'Tambah 11 record → cek pagination ke halaman 2'),
  tn('Unduh CSV', S.ok, 'downloadReport(); file 15 record', 'Data dapat diolah di Excel', 'Mengambil semua halaman', 'Bandingkan jumlah baris CSV dengan total di dashboard'),
  tn('Validasi unggahan', S.ok, 'validate_image + serializer; diuji', 'Pesan jelas', 'Pesan server berbahasa Inggris', 'UH-06 s.d. UH-11'),
  tn('Django Admin', S.ok, 'admin.py; daftar & form diuji via 8000 (proxy) dan 8001', 'Koreksi data', 'Hanya akun staff/superuser', 'Ubah class_label → cek dashboard'),
  tn('Dokumentasi API', S.ok, '/api/docs/, /api/redoc/, /api/schema/ (schema valid)', 'Uji API mandiri', '—', 'Jalankan POST classify dari Swagger'),
])}
</section>
<section class="page">
${h2('b9-partial', '9.2 Partially complete / memiliki keterbatasan')}
${tnTable('Fitur parsial', [
  tn('Login & logout web', S.part, 'authFetch() tidak dipakai; logout hanya hapus localStorage', 'Login tidak melindungi data apa pun', 'Token server tetap valid setelah logout', 'Logout → buka index.html langsung (masih terbuka)'),
  tn('Aplikasi mobile', S.part, 'Bundle Android/iOS lolos; tanpa uji perangkat', 'Perilaku di ponsel belum terbukti', 'Butuh satu jaringan dengan server', 'HP-05 di Android & iOS; uji ganti Wi-Fi, tema Terang/Gelap, peta, filter riwayat'),
  tn('Akurasi kelas Pothole', S.part, 'Recall 72,1 %; 17/68 terbaca Surface Erosion', 'Lubang dapat terlewat', 'Heuristik "pothole basah" tidak pernah aktif pada data validasi', 'Uji foto lubang basah/berlumpur'),
  tn('Waktu foto (web)', S.part, 'EXIF, cadangan <code>file.lastModified</code>', 'Waktu bisa tidak sesuai saat pemotretan', 'Foto hasil kirim ulang kehilangan EXIF', 'Unggah foto tanpa EXIF; bandingkan waktu'),
  tn('Bahasa antarmuka web', S.ok, 'Diseragamkan ke Bahasa Indonesia (3 Nov 2026): judul, tombol, label kelas, pesan unggah', 'Pesan validasi dari server (mis. "Only JPEG and PNG images are allowed") masih berbahasa Inggris', '—', 'Telusuri semua teks UI'),
])}
${h2('b9-not', '9.3 Not implemented / belum tersedia')}
${tnTable('Fitur yang tidak ditemukan', [
  tn('Registrasi akun', S.ok, '<code>RegisterView</code> + tab Daftar di web &amp; mobile; dibatasi 5/jam per IP', 'Siapa pun dapat membuat akun biasa', 'Akun baru bukan staff', 'Daftar di web → login di mobile; username kembar; percobaan ke-6 dalam satu jam → HTTP 429'),
  tn('Verifikasi & status laporan', S.no, 'Tidak ada field status di model', 'Tidak bisa melacak tindak lanjut', 'Koreksi hanya via admin', '—'),
  tn('Role pelapor/verifikator', S.no, 'Tidak ada grup/permission khusus', '—', '—', '—'),
  tn('Edit/hapus dari dashboard', S.no, 'Tidak ada endpoint PUT/DELETE', 'Harus lewat admin', '—', '—'),
  tn('Filter & pencarian riwayat', S.no, 'API history hanya parameter page; filter kelas di mobile hanya pada data yang sudah dimuat', 'Sulit mencari data lama', '—', 'Filter mobile → bandingkan dengan total server'),
  tn('Login & daftar di mobile', S.part, '<code>LoginScreen.js</code>, <code>RegisterView</code>; sesi di AsyncStorage; token belum dikirim ke API', 'Login hanya gerbang di aplikasi, data tetap publik lewat API', 'Akun mobile juga bisa login web', 'Daftar akun baru → keluar → masuk lagi; username kembar; kata sandi lemah'),
  tn('Reset kata sandi; notifikasi', S.no, 'Tidak ada kode terkait', '—', '—', '—'),
  tn('Automated tests', S.ok, '18 test backend (<code>api/tests.py</code>), semua lulus', 'Belum ada test frontend/mobile', 'Jalankan sebelum commit', '<code>manage.py test api</code>'),
])}
</section>
<section class="page">
${h2('b9-pending', '9.4 Integration pending / integrasi belum selesai')}
${tnTable('Integrasi yang belum selesai', [
  tn('Database', S.ok, '<b>Selesai 6 Nov 2026</b>: PostgreSQL 18 (<code>Roadpulse_db</code>) aktif dan dipakai <code>./start.sh</code>. Data SQLite (3 akun, 3 token, 24 record) dipindahkan dengan <code>dumpdata</code>/<code>loaddata</code>; 18 test lolos', '—', 'SQLite tetap tersedia: <code>DB_ENGINE=sqlite ./start.sh</code>; backup di <code>backend/db_backups/</code>', 'HP-02 lalu cek record baru di pgAdmin'),
  tn('Konfigurasi sensitif', S.pend, '<code>backend/.env</code> ter-track di Git', 'Risiko kebocoran kredensial', 'Isi tidak dibuka dalam audit ini', 'Pastikan <code>.env</code> tidak lagi di-commit'),
  tn('Ikon aplikasi mobile', S.ok, 'Ikon mahkota Siger di atas emerald (<code>icon.png</code>, adaptive icon Android + monokrom, favicon); <code>app.json</code> memakai <code>#20C997</code>', '—', '—', 'Lihat ikon di layar utama HP setelah build'),
  tn('Perubahan lokal', S.pend, 'Perbaikan belum di-commit (lihat Informasi Dokumen)', 'Tim lain belum memperoleh perbaikan', '—', 'Uji ulang setelah commit'),
])}
${h2('b9-issues', '9.5 Known issues / masalah yang diketahui')}
${tnTable('Masalah yang diketahui', [
  tn('KI-01 Admin lewat proxy', S.ok, '<b>Diperbaiki 3 Nov 2026</b>: proxy meneruskan header Host asli; IP LAN otomatis diizinkan saat DEBUG dan sejak 6 Nov 2026 dibaca ulang tiap request, sehingga pindah Wi-Fi/hotspot tidak memerlukan restart. Login via 8000 tidak lagi 403', '—', '—', 'Login admin via <code>http://&lt;IP-LAN&gt;:8000/admin/</code>'),
  tn('KI-02 Token tidak valid', S.issue, 'Header token salah → 401 "Invalid token." di endpoint publik', 'Client yang menyimpan token lama akan gagal', 'Client sekarang tidak mengirim token', 'UH-05'),
  tn('KI-03 Gagal simpan DB', S.ok, '<b>Diperbaiki 3 Nov 2026</b>: <code>save()</code> dalam <code>try</code> + <code>api/exceptions.py</code>; diuji di <code>api/tests.py</code>', 'HTTP 503 JSON dengan pesan jelas', '—', 'Matikan DB → unggah foto'),
  tn('KI-04 Hasil keyakinan rendah', S.issue, 'Contoh data uji: Crack/1002.jpg → Surface Erosion 43 %', 'Klasifikasi bisa keliru', 'Mobile memperingatkan &lt; 50 %; web tidak', 'Bandingkan label asli vs hasil'),
  tn('KI-05 Pagination', S.issue, 'page di luar rentang → 200 halaman terakhir', 'Tidak ada pesan "tidak ditemukan"', 'Perilaku Django Paginator', '<code>?page=999</code>'),
])}
</section>`);

// ═══════════ BAB 10 PENUTUP ═══════════
body.push(`<section class="page">${h1('bab10', '10. Penutup')}
${h2('b10-ringkas', '10.1 Ringkasan penggunaan')}
${steps(['Penyelenggara menjalankan semua layanan dengan <code>./start.sh</code> (Django 8001, proxy 8000, web 3000, Expo).', 'Petugas memotret jalan dengan aplikasi mobile atau mengunggah foto di dashboard web; lokasi diambil dari GPS.', 'Sistem mengklasifikasikan foto ke Crack, Pothole, Surface Erosion, atau Normal beserta tingkat keyakinan.', 'Hasil dapat dipantau lewat statistik, peta, riwayat, dan file CSV.', 'Administrator mengoreksi atau menghapus data lewat Django Admin (<code>/admin/</code> di port 8000).'])}
${h2('b10-dev', '10.2 Catatan pengembangan')}
<ul class="dev">
<li><b>Prioritas tinggi:</b> database aktif sudah PostgreSQL (kata sandi lokal <code>roadpulse</code>, ganti dengan yang kuat di server); keluarkan <code>backend/.env</code> dan <code>db.sqlite3</code> dari Git dan ganti kredensialnya; ikuti dokumen <b>Panduan Deploy &amp; Hosting</b> sebelum memasang di server.</li>
<li><b>Keamanan & akses:</b> wajibkan autentikasi bila data tidak boleh publik (pakai <code>authFetch</code> dan permission <code>IsAuthenticated</code>); hapus token di server saat logout.</li>
<li><b>Fitur laporan:</b> tambahkan field status dan alur verifikasi bila dibutuhkan dinas; tambahkan filter riwayat dan endpoint detail.</li>
<li><b>Kualitas AI:</b> tambah foto lubang basah/berlumpur/malam dari lapangan, lalu latih ulang dengan <code>ai_model/train.py</code> dan bandingkan memakai <code>--eval</code>.</li>
<li><b>Kualitas perangkat lunak:</b> tambah test untuk frontend/mobile dan uji aplikasi di HP Android &amp; iPhone sungguhan.</li>
</ul>
${h2('b10-lampiran', 'Lampiran A · Daftar endpoint API')}
${table('Endpoint API', ['Method', 'Endpoint', 'Fungsi', 'Akses'], [
  ['GET', '<code>/api/v1/</code>', 'Daftar endpoint', 'Publik'],
  ['POST', '<code>/api/v1/classify/</code>', 'Klasifikasi foto (multipart)', 'Publik'],
  ['GET', '<code>/api/v1/dashboard/stats/</code>', 'Total, distribusi, 5 terbaru', 'Publik'],
  ['GET', '<code>/api/v1/dashboard/history/?page=N</code>', 'Riwayat 10 per halaman', 'Publik'],
  ['GET', '<code>/api/v1/dashboard/map/</code>', 'Titik ber-GPS (maks. 1000)', 'Publik'],
  ['POST', '<code>/api/v1/auth/login/</code>', 'Token login', 'Publik'],
  ['POST', '<code>/api/v1/auth/register/</code>', 'Daftar akun biasa + token (HTTP 201)', 'Publik'],
  ['GET', '<code>/api/docs/</code>, <code>/api/redoc/</code>, <code>/api/schema/</code>', 'Dokumentasi OpenAPI', 'Publik'],
  ['—', '<code>/admin/</code>', 'Django Admin', 'Staff'],
], { widths: ['10%', '42%', '33%', '15%'] })}
${h2('b10-glos', 'Lampiran B · Istilah')}
${table('Glosarium', ['Istilah', 'Arti'], [
  ['API', 'Antarmuka yang dipakai web dan mobile untuk bertukar data dengan server.'],
  ['Proxy', 'Program perantara (<code>proxy.js</code>) yang membuka port 8000 ke jaringan dan meneruskan ke Django.'],
  ['Confidence / keyakinan', 'Probabilitas softmax kelas terpilih (0–100 %), bukan jaminan kebenaran.'],
  ['EXIF', 'Metadata foto (waktu, GPS, orientasi) yang disimpan kamera.'],
  ['Token', 'Kode akses yang diberikan saat login dan disimpan di browser.'],
  ['IP LAN', 'Alamat komputer di jaringan lokal (mis. 192.168.x.x) yang dipakai ponsel untuk menjangkau server.'],
], { widths: ['24%', '76%'] })}
</section>`);

// ═══════════ TOC & CSS ═══════════
const tocHtml = toc.filter(([lvl]) => lvl <= 2).map(([lvl, id, t]) =>
  `<div class="toc-row l${lvl}"><a href="#${id}">${t}</a><span class="dots"></span><span class="pg">${tocPages[id] || ''}</span></div>`).join('');

const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>User Manual RoadPulse</title><style>${css}</style></head>
<body>${body.join('\n').replace('__TOC__', tocHtml)}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'manual.html'), html);
fs.writeFileSync(path.join(__dirname, 'toc_entries.json'), JSON.stringify(toc));
console.log('manual.html written:', fig, 'figures,', tab, 'tables,', toc.length, 'toc entries');
