// User Manual RoadPulse versi Word (format laporan kampus).
// Pemakaian: node manual_word.js [../USERMANUAL_RoadPulse.docx]
// Gambar diambil dari img_word/ (screenshot web terbaru + ilustrasi HP) dan img/ (screenshot Django Admin).
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
  AlignmentType, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents, PageBreak, NumberFormat, VerticalAlign,
  SectionType,
} = require('docx');

const DIR = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(DIR, '..', 'USERMANUAL_RoadPulse.docx'));
const IMG = (f) => path.join(DIR, f.startsWith('b0') ? 'img' : 'img_word', f);

// Hasil evaluasi model yang dipakai server (377 foto validasi)
const MODEL = { akurasi: '85,1', benar: '321', lubang: '76,5' };

const FONT = 'Times New Roman';
const CM = 567;
const PAGE = { w: 11906, h: 16838, left: 4 * CM, right: 3 * CM, top: 3 * CM, bottom: 3 * CM };
const CONTENT = PAGE.w - PAGE.left - PAGE.right;
const PX = Math.floor(CONTENT / 15);

// ── Penomoran gambar & tabel per bab ────────────────────────
let bab = 0, nGbr = 0, nTbl = 0;
const romawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// ── Helper paragraf ─────────────────────────────────────────
const runs = (text, base = {}) => String(text).split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g).filter(Boolean).map((p) => {
  if (p.startsWith('**')) return new TextRun({ text: p.slice(2, -2), bold: true, ...base });
  if (p.startsWith('_') && p.endsWith('_') && p.length > 2) return new TextRun({ text: p.slice(1, -1), italics: true, ...base });
  if (p.startsWith('`')) return new TextRun({ text: p.slice(1, -1), font: 'Courier New', size: 21, ...base });
  return new TextRun({ text: p, ...base });
});
const P = (text, opt = {}) => new Paragraph({
  children: runs(text), alignment: AlignmentType.JUSTIFIED,
  indent: opt.noIndent ? undefined : { firstLine: 720 },
  spacing: { after: 120, line: 360 }, ...opt.p,
});
const P0 = (text, opt = {}) => P(text, { ...opt, noIndent: true });

function BAB(judul) {
  bab += 1; nGbr = 0; nTbl = 0;
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, pageBreakBefore: bab > 1,
    children: [new TextRun(`BAB ${romawi[bab]} ${judul.toUpperCase()}`)],
  });
}
const SUB = (no, judul) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`${no} ${judul}`)] });
const SUBSUB = (judul) => new Paragraph({ children: [new TextRun({ text: judul, bold: true })], spacing: { before: 160, after: 80, line: 360 }, keepNext: true });

let listId = 0;
const numbering = [{
  reference: 'bullet',
  levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
}];
function LANGKAH(items) {
  const ref = `l${++listId}`;
  numbering.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
  return items.flatMap((t) => (typeof t === 'object' && t.cmd ? PERINTAH(t.cmd)
    : [new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 360 } })]));
}
function HURUF(items) {
  const ref = `h${++listId}`;
  numbering.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
  return items.map((t) => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 360 } }));
}
const POIN = (items) => items.map((t) => new Paragraph({ numbering: { reference: 'bullet', level: 0 }, children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 360 } }));

function PERINTAH(lines) {
  const ls = [].concat(lines);
  return ls.map((l, i) => new Paragraph({
    children: [new TextRun({ text: l, font: 'Courier New', size: 20 })],
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F2F2F2' },
    indent: { left: 720, right: 240 }, keepNext: i < ls.length - 1,
    spacing: { before: i === 0 ? 80 : 0, after: i === ls.length - 1 ? 160 : 0, line: 260 },
  }));
}

function imageRun(file, cm) {
  const data = fs.readFileSync(file);
  const { width, height } = sizeOf(data);
  const w = Math.round(Math.min((cm * CM) / 15, PX));
  return new ImageRun({ type: 'png', data, transformation: { width: w, height: Math.round((w * height) / width) } });
}
const keterangan = (teks) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240, line: 276 },
  children: [new TextRun({ text: `Gambar ${bab}.${++nGbr} `, bold: true }), new TextRun(teks)],
});
function GAMBAR(file, teks, cm = 14) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 0 }, children: [imageRun(IMG(file), cm)] }),
    keterangan(teks),
  ];
}
// Dua tampilan HP berdampingan
function GAMBAR_HP(pairs) {
  const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const w = Math.floor(CONTENT / pairs.length);
  return [new Table({
    width: { size: CONTENT, type: WidthType.DXA }, columnWidths: pairs.map(() => w),
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ cantSplit: true, children: pairs.map(([file, teks]) => new TableCell({
      width: { size: w, type: WidthType.DXA }, borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(IMG(file), 6.3)] }),
        keterangan(teks),
      ],
    })) })],
  }), new Paragraph({ children: [], spacing: { after: 60 } })];
}

function TABEL(judul, header, rows, ratios) {
  const widths = ratios.map((r) => Math.floor(CONTENT * r));
  widths[widths.length - 1] = CONTENT - widths.slice(0, -1).reduce((a, b) => a + b, 0);
  const b = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
  const cell = (t, i, head) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: head ? AlignmentType.CENTER : AlignmentType.LEFT, children: runs(t, { size: 22, bold: head || undefined }), spacing: { after: 0, line: 276 } })],
  });
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 80, line: 276 },
      children: [new TextRun({ text: `Tabel ${bab}.${++nTbl} `, bold: true }), new TextRun(judul)] }),
    new Table({
      width: { size: CONTENT, type: WidthType.DXA }, columnWidths: widths,
      borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b },
      rows: [new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, i, true)) }),
        ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, i, false)) }))],
    }),
    new Paragraph({ children: [], spacing: { after: 120 } }),
  ];
}

// Masalah dan penyelesaian (Bab VI)
function MASALAH(no, judul, gejala, penyebab, solusi) {
  return [
    SUB(no, judul),
    P0(`**Gejala:** ${gejala}`),
    P0(`**Penyebab:** ${penyebab}`),
    P0('**Cara mengatasi:**'),
    ...(Array.isArray(solusi) ? LANGKAH(solusi) : [P0(solusi)]),
  ];
}

// ════════════════════════════════════════════════════════════
// HALAMAN DEPAN
// ════════════════════════════════════════════════════════════
const C = (text, size = 24, bold = false, after = 0) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after, line: 300 }, children: [new TextRun({ text, size, bold })] });
const sampul = [
  C('USER MANUAL', 32, true, 120),
  C('APLIKASI ROADPULSE', 32, true, 240),
  C('Sistem Klasifikasi Kerusakan Jalan Berbasis Kecerdasan Buatan', 26, false, 0),
  C('di Kota Bandar Lampung', 26, false, 1400),
  C('Disusun untuk memenuhi tugas mata kuliah Pemrograman Internet', 24, false, 1200),
  C('Disusun oleh:', 24, true, 120),
  C('Kelompok 5', 24, false, 80),
  C('Bagas Aryaputra', 24), C('Dito Gilan Permadi', 24), C('Laika Apriyadi', 24), C('M. Davin Rahadian', 24, false, 600),
  C('Dosen Pengampu:', 24, true, 120),
  C('Ir. Nurul Qomariyah, S.Kom., M.Kom.', 24), C('Dian Ayu Afifah, S.Si., M.Sc.', 24, false, 1600),
  C('PROGRAM STUDI TEKNOLOGI REKAYASA INTERNET', 24, true),
  C('JURUSAN TEKNOLOGI INFORMASI', 24, true),
  C('POLITEKNIK NEGERI LAMPUNG', 24, true),
  C('2026', 24, true),
];

const judulDepan = (t) => new Paragraph({ alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { after: 360 }, children: [new TextRun({ text: t, bold: true, size: 28 })] });

const kataPengantar = [
  judulDepan('KATA PENGANTAR'),
  P('Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa karena atas rahmat-Nya kami dapat menyelesaikan User Manual Aplikasi RoadPulse ini. Buku panduan ini disusun sebagai bagian dari tugas mata kuliah Pemrograman Internet di Program Studi Teknologi Rekayasa Internet, Politeknik Negeri Lampung.'),
  P('RoadPulse adalah aplikasi yang kami buat untuk membantu memantau kondisi permukaan jalan di Kota Bandar Lampung. Pengguna cukup memotret atau mengunggah foto jalan, lalu sistem akan mengenali apakah jalan tersebut retak, berlubang, mengalami erosi permukaan, atau masih dalam kondisi normal. Manual ini menjelaskan cara menjalankan aplikasi, cara memakai dashboard web dan aplikasi mobile, cara mengelola data sebagai administrator, serta cara mengatasi masalah yang sering muncul.'),
  P('Kami mengucapkan terima kasih kepada Ibu Ir. Nurul Qomariyah, S.Kom., M.Kom. dan Ibu Dian Ayu Afifah, S.Si., M.Sc. selaku dosen pengampu yang telah membimbing kami selama pengerjaan proyek ini, serta kepada semua pihak yang telah membantu.'),
  P('Kami menyadari bahwa aplikasi dan manual ini masih memiliki kekurangan. Oleh karena itu, kritik dan saran yang membangun sangat kami harapkan untuk perbaikan ke depannya. Semoga manual ini bermanfaat bagi siapa pun yang menggunakan RoadPulse.'),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 480, after: 0, line: 360 }, children: [new TextRun('Bandar Lampung, November 2026')] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 960, line: 360 }, children: [new TextRun('Kelompok 5')] }),
];

const daftarIsi = [
  judulDepan('DAFTAR ISI'),
  new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-2' }),
];

// ════════════════════════════════════════════════════════════
// ISI
// ════════════════════════════════════════════════════════════
const isi = [];
const add = (...xs) => xs.flat().forEach((x) => isi.push(x));

// ── BAB I ──
add(
  BAB('Pendahuluan'),
  SUB('1.1', 'Latar Belakang'),
  P('Jalan yang rusak dapat membahayakan pengendara dan memperlambat aktivitas masyarakat. Selama ini pendataan kerusakan jalan umumnya masih dilakukan secara manual, yaitu petugas datang ke lokasi, mencatat jenis kerusakan, lalu merekapnya. Cara ini memakan waktu dan hasilnya sering tidak seragam karena bergantung pada penilaian masing-masing petugas.'),
  P('Berdasarkan masalah tersebut, kami membuat RoadPulse, yaitu aplikasi yang dapat mengenali jenis kerusakan jalan secara otomatis dari sebuah foto. Petugas cukup memotret permukaan jalan, kemudian sistem akan menentukan jenis kerusakannya dan menyimpan hasilnya beserta waktu dan lokasi pengambilan foto. Data yang terkumpul dapat dilihat dalam bentuk statistik, peta, dan riwayat inspeksi.'),
  SUB('1.2', 'Tujuan Penulisan'),
  P('Manual ini disusun dengan tujuan sebagai berikut:'),
  ...HURUF([
    'Menjelaskan cara menjalankan aplikasi RoadPulse di komputer.',
    'Memandu pengguna dalam memakai dashboard web dan aplikasi mobile RoadPulse.',
    'Memandu administrator dalam mengelola data inspeksi dan akun pengguna.',
    'Memberikan cara mengatasi masalah yang sering terjadi saat aplikasi digunakan.',
  ]),
  SUB('1.3', 'Gambaran Umum Aplikasi'),
  P('RoadPulse terdiri dari tiga bagian yang saling terhubung. Bagian pertama adalah **server** (backend) yang dibuat dengan Django. Server ini menerima foto, menjalankan model kecerdasan buatan, dan menyimpan hasilnya ke database. Bagian kedua adalah **dashboard web** yang dibuka melalui browser di komputer. Bagian ketiga adalah **aplikasi mobile** yang dipasang di HP dan dipakai petugas saat berada di lapangan.'),
  P('Setiap foto yang dikirim akan dikelompokkan ke dalam salah satu dari empat kelas berikut.'),
  ...TABEL('Kelas kerusakan jalan pada RoadPulse', ['Kelas', 'Nama di aplikasi', 'Keterangan'], [
    ['Crack', 'Retakan', 'Permukaan jalan retak memanjang atau bercabang. Perlu perbaikan.'],
    ['Pothole', 'Lubang', 'Terdapat lubang pada permukaan jalan. Perlu perbaikan.'],
    ['Surface Erosion', 'Erosi permukaan', 'Lapisan atas jalan terkikis atau mengelupas. Perlu dipantau.'],
    ['Normal', 'Normal', 'Permukaan jalan dalam kondisi baik.'],
  ], [0.22, 0.25, 0.53]),
  P(`Untuk mengenali kelas tersebut, RoadPulse memakai model MobileNetV2 yang dilatih dengan 1.882 foto jalan. Pada pengujian dengan 377 foto yang tidak dipakai saat pelatihan, model menebak dengan benar ${MODEL.benar} foto atau sekitar ${MODEL.akurasi}%. Karena hasilnya tidak selalu tepat, aplikasi juga menampilkan **tingkat keyakinan** untuk setiap hasil. Jika tingkat keyakinan di bawah 50%, aplikasi akan menyarankan agar foto diambil ulang.`),
  SUB('1.4', 'Pengguna Aplikasi'),
  P('Pengguna RoadPulse dibagi menjadi tiga jenis sesuai hak aksesnya. Seluruh data inspeksi hanya dapat dilihat dan dikirim setelah pengguna masuk dengan akunnya.'),
  ...TABEL('Jenis pengguna RoadPulse', ['Pengguna', 'Hak akses'], [
    ['Pengunjung', 'Belum masuk. Hanya dapat membuka halaman masuk, membuat akun melalui menu Daftar, dan membaca Kebijakan Privasi.'],
    ['Pengguna terdaftar', 'Memiliki akun dan dapat masuk ke dashboard web maupun aplikasi mobile untuk mengunggah foto serta melihat statistik, peta, dan riwayat. Akun dapat dibuat sendiri melalui menu Daftar.'],
    ['Administrator', 'Memiliki semua hak pengguna terdaftar, ditambah akses ke halaman admin untuk mengubah atau menghapus data inspeksi dan mengelola akun.'],
  ], [0.28, 0.72]),
);

// ── BAB II ──
add(
  BAB('Kebutuhan dan Cara Menjalankan Aplikasi'),
  SUB('2.1', 'Kebutuhan Perangkat'),
  P('Sebelum menggunakan RoadPulse, pastikan perangkat yang dipakai memenuhi kebutuhan pada tabel berikut.'),
  ...TABEL('Kebutuhan perangkat', ['Perangkat', 'Kebutuhan'], [
    ['Komputer server', 'Laptop atau komputer (panduan ini memakai macOS) dengan Python 3.11, Node.js versi 20 atau lebih baru, dan PostgreSQL 18. Komputer ini menjalankan server, database, dan dashboard web.'],
    ['Browser', 'Google Chrome atau browser modern lain untuk membuka dashboard web.'],
    ['HP', 'HP Android atau iPhone yang sudah terpasang aplikasi Expo Go, memiliki kamera, dan GPS.'],
    ['Jaringan', 'Komputer dan HP harus terhubung ke jaringan Wi-Fi yang sama. Koneksi internet dibutuhkan untuk menampilkan peta dan nama jalan.'],
  ], [0.25, 0.75]),
  SUB('2.2', 'Menjalankan Aplikasi'),
  P('Semua bagian RoadPulse dijalankan sekaligus dengan satu perintah. Langkah-langkahnya sebagai berikut.'),
  ...LANGKAH([
    'Buka aplikasi **Terminal** di komputer.',
    'Masuk ke folder proyek RoadPulse dengan perintah berikut.',
    { cmd: 'cd ~/RoadPulse' },
    'Jalankan perintah berikut.',
    { cmd: './start.sh' },
    'Tunggu sampai muncul tulisan **RoadPulse berjalan** beserta daftar alamat halaman, kemudian muncul kode QR di bagian bawah terminal. Kode QR ini dipindai menggunakan Expo Go di HP (lihat Bab IV).',
    'Biarkan jendela terminal tetap terbuka selama aplikasi dipakai. Jika terminal ditutup, seluruh layanan RoadPulse ikut berhenti.',
    'Untuk mematikan aplikasi, tekan tombol **Ctrl + C** pada terminal tersebut.',
  ]),
  P('Perintah `./start.sh` akan menyalakan server, dashboard web, dan aplikasi mobile secara otomatis. Data disimpan di database **PostgreSQL**. Perintah ini juga menghentikan sisa layanan lama yang masih berjalan dan mencatat alamat IP komputer saat ini. Server juga membaca ulang alamat IP komputer setiap kali menerima permintaan, sehingga aplikasi mobile dan dashboard tetap dapat terhubung walaupun komputer berpindah jaringan Wi-Fi atau hotspot tanpa perlu menjalankan ulang `./start.sh`.'),
  P('Jika aplikasi baru pertama kali dijalankan di komputer tersebut, lakukan dahulu langkah persiapan berikut. Langkah ini cukup dilakukan satu kali.'),
  ...LANGKAH([
    'Pasang **PostgreSQL 18** dari situs resmi PostgreSQL (installer EDB). Saat pemasangan, buat kata sandi untuk pengguna `postgres`. RoadPulse memakai kata sandi `roadpulse`.',
    'Buat database `Roadpulse_db` dengan perintah berikut, lalu masukkan kata sandi `roadpulse` saat diminta.',
    { cmd: '/Library/PostgreSQL/18/bin/createdb -U postgres -h localhost Roadpulse_db' },
    'Pastikan file `backend/.env` berisi pengaturan database berikut.',
    { cmd: ['DB_NAME=Roadpulse_db', 'DB_USER=postgres', 'DB_PASSWORD=roadpulse', 'DB_HOST=127.0.0.1', 'DB_PORT=5432'] },
    'Pasang paket server dan aplikasi mobile, lalu buat tabel database dengan perintah berikut.',
  ]),
  ...PERINTAH([
    'cd ~/RoadPulse/backend',
    'python3.11 -m venv venv311',
    'venv311/bin/pip install -r requirements.txt',
    'venv311/bin/python manage.py migrate',
    'cd ../mobile && npm install',
  ]),
  P('Database SQLite masih dapat dipakai sebagai cadangan, misalnya bila PostgreSQL belum terpasang. Caranya, jalankan aplikasi dengan perintah `DB_ENGINE=sqlite ./start.sh`. Data SQLite tersimpan terpisah di file `backend/db.sqlite3` dan tidak ikut berubah saat aplikasi memakai PostgreSQL.'),
  SUB('2.3', 'Alamat Halaman'),
  P('Setelah aplikasi berjalan, halaman-halaman RoadPulse dapat dibuka melalui alamat berikut.'),
  ...TABEL('Alamat halaman RoadPulse', ['Halaman', 'Alamat'], [
    ['Dashboard web', '`http://localhost:3000`'],
    ['Halaman masuk dan daftar', '`http://localhost:3000/login.html`'],
    ['Halaman admin', '`http://localhost:8000/admin/`'],
    ['Dokumentasi API', '`http://localhost:8000/api/docs/`'],
  ], [0.4, 0.6]),
  P('Dari perangkat lain dalam jaringan yang sama, ganti kata `localhost` dengan alamat IP komputer server, misalnya `http://192.168.1.22:3000`. Alamat IP ini ditampilkan oleh terminal saat `./start.sh` dijalankan.'),
  SUB('2.4', 'Membuka Database PostgreSQL'),
  P('Seluruh data RoadPulse, yaitu akun pengguna, token login, dan hasil inspeksi, disimpan di database PostgreSQL. Database ini dapat dibuka langsung untuk melihat isi data. Data untuk masuk ke database dapat dilihat pada tabel berikut.'),
  ...TABEL('Data masuk database PostgreSQL', ['Isian', 'Nilai'], [
    ['Host', '`localhost`'],
    ['Port', '`5432`'],
    ['Username', '`postgres`'],
    ['Kata sandi', '`roadpulse`'],
    ['Nama database', '`Roadpulse_db`'],
  ], [0.4, 0.6]),
  P('Kata sandi `roadpulse` hanya untuk pemakaian di laptop sendiri. Jika aplikasi dipasang di server yang dapat diakses dari internet, gunakan kata sandi lain yang lebih kuat dan ubah juga isian `DB_PASSWORD` di file `backend/.env`.'),
  P('**Cara pertama: melalui pgAdmin 4.** Cara ini menampilkan data dalam bentuk tabel sehingga lebih mudah dipakai.'),
  ...LANGKAH([
    'Tekan **Cmd + Spasi**, ketik **pgAdmin 4**, lalu tekan **Enter**.',
    'Jika diminta _master password_, buat kata sandi bebas. Kata sandi ini hanya untuk membuka aplikasi pgAdmin dan berbeda dengan kata sandi database.',
    'Pada panel kiri, buka **Servers**, lalu klik **PostgreSQL 18**.',
    'Isi kata sandi `roadpulse`, centang **Save Password**, lalu klik **OK**.',
    'Buka **Databases**, lalu **Roadpulse_db**, **Schemas**, **public**, dan **Tables**.',
    'Klik kanan tabel yang ingin dilihat, lalu pilih **View/Edit Data** dan **All Rows**. Data akan tampil di bagian bawah layar.',
  ]),
  P('Jika muncul pesan "password authentication failed", klik kanan **PostgreSQL 18**, pilih **Clear Saved Password**, lalu masukkan kembali kata sandi `roadpulse`.'),
  P('**Cara kedua: melalui Terminal.** Buka aplikasi Terminal, lalu jalankan perintah berikut. Masukkan kata sandi `roadpulse` saat muncul tulisan "Password for user postgres". Kata sandi memang tidak terlihat saat diketik.'),
  ...PERINTAH('/Library/PostgreSQL/18/bin/psql -U postgres -h localhost -d Roadpulse_db'),
  P('Setelah tanda `Roadpulse_db=#` muncul, perintah pada tabel berikut dapat dipakai.'),
  ...TABEL('Perintah dasar psql', ['Perintah', 'Kegunaan'], [
    ['`\\dt`', 'Menampilkan daftar tabel.'],
    ['`select * from api_inspectionrecord limit 5;`', 'Menampilkan lima data inspeksi.'],
    ['`select username from auth_user;`', 'Menampilkan daftar akun pengguna.'],
    ['`\\q`', 'Keluar dari psql.'],
  ], [0.55, 0.45]),
  P('Perubahan atau penghapusan data melalui pgAdmin maupun psql langsung terlihat di dashboard web dan aplikasi mobile. Untuk mengoreksi data inspeksi, sebaiknya gunakan halaman admin seperti dijelaskan pada Bab V.'),
);

// ── BAB III ──
add(
  BAB('Panduan Dashboard Web'),
  P('Dashboard web dipakai untuk mengunggah foto dari komputer dan untuk memantau seluruh data inspeksi. Bab ini menjelaskan setiap fitur dashboard secara berurutan.'),
  SUB('3.1', 'Membuat Akun'),
  P('Pengguna yang belum memiliki akun dapat mendaftar sendiri dengan langkah berikut.'),
  ...LANGKAH([
    'Buka alamat `http://localhost:3000/login.html`.',
    'Klik tab **Daftar** di bagian atas formulir.',
    'Isi **Username** dengan 3 sampai 30 karakter. Username hanya boleh berisi huruf, angka, titik, dan garis bawah.',
    'Isi **Kata sandi** minimal 8 karakter. Sebaiknya gabungkan huruf besar, huruf kecil, dan angka. Kata sandi yang terlalu umum atau hanya berisi angka akan ditolak.',
    'Ketik ulang kata sandi pada kolom **Ulangi kata sandi** sampai muncul tulisan "Kata sandi cocok".',
    'Klik tombol **Daftar & masuk**. Jika berhasil, akun langsung dibuat dan halaman berpindah ke dashboard.',
  ]),
  ...GAMBAR('web_daftar.png', 'Formulir daftar akun baru', 9),
  P('Jika username sudah dipakai orang lain, akan muncul pesan "Username sudah dipakai. Coba yang lain." di bawah kolom username. Pendaftaran juga dibatasi paling banyak 5 kali dalam satu jam dari perangkat yang sama untuk mencegah pembuatan akun palsu secara massal.'),
  SUB('3.2', 'Masuk ke Dashboard'),
  ...LANGKAH([
    'Buka alamat `http://localhost:3000/login.html`.',
    'Isi **Username** dan **Kata sandi**. Klik ikon mata untuk menampilkan atau menyembunyikan kata sandi.',
    'Klik tombol **Masuk**. Selama proses berlangsung, tombol berubah menjadi "Memproses...".',
    'Jika berhasil, halaman akan berpindah ke dashboard.',
  ]),
  ...GAMBAR('web_masuk.png', 'Halaman masuk dashboard web'),
  P('Jika username atau kata sandi salah, akan muncul pesan "Username atau kata sandi salah". Setelah 10 kali gagal dalam satu menit, server akan menolak percobaan berikutnya untuk sementara dengan pesan "Terlalu banyak percobaan. Coba lagi dalam ... detik."'),
  SUB('3.3', 'Halaman Utama'),
  P('Halaman utama dashboard menampilkan judul besar dengan latar video lalu lintas kota. Di bagian atas terdapat menu **Ringkasan**, **Deteksi jalan**, **Peta**, dan **Riwayat** untuk berpindah ke setiap bagian halaman. Di sebelah kanan terdapat penanda status server, tombol **Admin**, tombol **Unduh CSV**, dan tombol **Keluar**.'),
  ...GAMBAR('web_beranda.png', 'Halaman utama dashboard web'),
  P('Penanda "API terhubung" berarti dashboard berhasil terhubung ke server. Jika yang muncul adalah "API tidak terhubung", berarti server belum berjalan. Penyelesaiannya dapat dilihat pada Bab VI.'),
  SUB('3.4', 'Mengunggah dan Menganalisis Foto'),
  ...LANGKAH([
    'Klik tombol **Mulai deteksi** atau menu **Deteksi jalan**.',
    'Klik area unggah untuk memilih foto, atau seret foto ke area tersebut. Foto harus berformat JPEG atau PNG dengan ukuran paling besar 10 MB.',
    'Setelah foto dipilih, pratinjau foto akan tampil bersama **Waktu foto** dan **Lokasi foto**. Waktu dan lokasi dibaca dari data foto jika tersedia.',
    'Jika lokasi belum terbaca, klik tombol **Ambil lokasi GPS**. Izinkan browser mengakses lokasi saat diminta. Nama jalan akan dicari otomatis.',
    'Klik tombol **Analisis foto** dan tunggu beberapa saat sampai proses selesai.',
  ]),
  ...GAMBAR('web_unggah.png', 'Foto jalan yang siap dianalisis beserta lokasinya'),
  SUB('3.5', 'Membaca Hasil Analisis'),
  P('Setelah analisis selesai, hasil akan tampil pada bagian **Hasil klasifikasi**. Bagian ini berisi nama kelas kerusakan, tingkat keyakinan, waktu foto, waktu analisis, dan lokasi foto. Klik **Lihat peta** untuk membuka lokasi foto di OpenStreetMap.'),
  ...GAMBAR('web_hasil.png', 'Contoh hasil klasifikasi foto berlubang'),
  P('Tingkat keyakinan menunjukkan seberapa yakin sistem terhadap hasil tebakannya. Jika nilainya di bawah 50%, akan muncul peringatan "Hasil kurang yakin, sebaiknya foto ulang". Dalam kondisi ini, ambil foto lebih dekat ke permukaan jalan, pastikan cahaya cukup terang, foto tidak buram, dan bagian yang rusak berada di tengah foto. Setiap hasil analisis otomatis tersimpan dan langsung masuk ke statistik, peta, dan riwayat.'),
  SUB('3.6', 'Melihat Statistik'),
  P('Bagian **Statistik inspeksi** menampilkan jumlah seluruh inspeksi dan jumlah foto untuk setiap kelas. Di bawahnya terdapat grafik batang yang membandingkan jumlah setiap kelas sehingga jenis kerusakan yang paling banyak dapat terlihat dengan cepat.'),
  ...GAMBAR('web_statistik.png', 'Statistik dan grafik jumlah inspeksi per kelas'),
  SUB('3.7', 'Melihat Peta Lokasi'),
  P('Bagian **Lokasi foto jalan** menampilkan peta yang berisi titik-titik lokasi foto. Titik berwarna merah menandakan jalan yang rusak, sedangkan titik hijau menandakan jalan normal. Klik salah satu titik untuk melihat kelas, lokasi, dan waktu foto. Foto yang tidak memiliki data lokasi tidak akan muncul di peta.'),
  ...GAMBAR('web_peta.png', 'Peta lokasi foto inspeksi'),
  SUB('3.8', 'Melihat Riwayat dan Mengunduh Laporan'),
  P('Bagian **Riwayat unggahan** menampilkan daftar seluruh inspeksi, sepuluh data per halaman. Gunakan tombol **Sebelumnya** dan **Berikutnya** untuk berpindah halaman. Setiap baris berisi tautan **Buka foto**, kelas, tingkat keyakinan, waktu, dan lokasi jalan. Tingkat keyakinan di bawah 50% ditandai dengan warna kuning.'),
  ...GAMBAR('web_riwayat.png', 'Riwayat inspeksi'),
  P('Untuk menyimpan seluruh riwayat ke dalam file, klik tombol **Unduh CSV** di bagian atas halaman. File `roadpulse-riwayat.csv` akan terunduh dan dapat dibuka menggunakan Microsoft Excel.'),
  SUB('3.9', 'Keluar'),
  P('Klik tombol **Keluar** di pojok kanan atas. Sesi login dicabut di server dan halaman kembali ke halaman masuk. Jika sesi berakhir, misalnya karena akun keluar dari perangkat lain, dashboard juga otomatis kembali ke halaman masuk.'),
);

// ── BAB IV ──
add(
  BAB('Panduan Aplikasi Mobile'),
  P('Aplikasi mobile dipakai petugas di lapangan untuk memotret jalan secara langsung. Hasil foto dari HP akan tersimpan di server yang sama, sehingga langsung terlihat juga di dashboard web. Gambar tampilan pada bab ini dibuat berdasarkan desain aplikasi, sehingga angka dan nama jalan yang terlihat hanya contoh.'),
  SUB('4.1', 'Membuka Aplikasi'),
  ...LANGKAH([
    'Pasang aplikasi **Expo Go** dari Play Store (Android) atau App Store (iPhone).',
    'Pastikan HP terhubung ke Wi-Fi yang sama dengan komputer server.',
    'Jalankan `./start.sh` di komputer seperti pada Bab II sampai kode QR muncul.',
    'Pada Android, buka Expo Go lalu pilih **Scan QR code**. Pada iPhone, pindai kode QR menggunakan aplikasi Kamera.',
    'Tunggu proses memuat aplikasi selesai. Pada pemakaian pertama, proses ini dapat memakan waktu sekitar satu menit.',
  ]),
  SUB('4.2', 'Daftar dan Masuk'),
  P('Saat pertama kali dibuka, aplikasi akan menampilkan halaman **Masuk** dengan latar video lalu lintas kota. Di pojok kanan atas terdapat penanda status server (Online atau Offline) dan tombol pengaturan.'),
  ...LANGKAH([
    'Jika sudah memiliki akun, isi **Username** dan **Kata sandi**, lalu ketuk **Masuk**.',
    'Jika belum memiliki akun, ketuk tab **Daftar** atau tulisan **Daftar sekarang**. Isi username, kata sandi, dan ulangi kata sandi, lalu ketuk **Daftar & masuk**. Aturan pengisiannya sama dengan pendaftaran di web (subbab 3.1).',
    'Setelah berhasil masuk, aplikasi akan menampilkan halaman Beranda. Aplikasi akan mengingat akun tersebut, sehingga tidak perlu masuk lagi setiap kali aplikasi dibuka.',
  ]),
  ...GAMBAR_HP([['hp_0.png', 'Halaman masuk'], ['hp_1.png', 'Halaman daftar akun']]),
  SUB('4.3', 'Beranda'),
  P('Halaman Beranda berisi sapaan dengan nama pengguna, kartu **Status sistem**, dan ringkasan kondisi jalan. Kartu Status sistem menunjukkan apakah server terhubung, apakah GPS sudah aktif, dan kapan data terakhir diperbarui. Ringkasan kondisi jalan menampilkan jumlah seluruh laporan, jumlah jalan yang perlu diperbaiki, jumlah yang perlu dipantau, dan jumlah jalan normal.'),
  P('Jika halaman digulir ke bawah, akan terlihat peta kerusakan jalan dan tiga laporan terbaru. Tarik layar ke bawah untuk memperbarui data.'),
  ...GAMBAR_HP([['hp_2.png', 'Beranda bagian atas'], ['hp_3.png', 'Peta dan laporan terbaru']]),
  SUB('4.4', 'Memotret Jalan'),
  ...LANGKAH([
    'Pada Beranda, ketuk tombol **Foto & analisis jalan**.',
    'Jika diminta, izinkan aplikasi mengakses kamera dan lokasi.',
    'Arahkan kamera ke permukaan jalan. Pastikan bagian yang rusak berada di dalam bingkai dan penanda di pojok kanan atas sudah menunjukkan **GPS terkunci**.',
    'Ketuk tombol bulat di bagian bawah untuk mengambil foto.',
    'Tunggu tulisan "Menganalisis gambar..." sampai hasil muncul.',
  ]),
  ...GAMBAR_HP([['hp_4.png', 'Tampilan kamera'], ['hp_5.png', 'Hasil analisis']]),
  SUB('4.5', 'Hasil Analisis'),
  P('Halaman Hasil Analisis menampilkan jenis kerusakan, status (perlu perbaikan, perlu dipantau, atau kondisi baik), tingkat keyakinan, lokasi, koordinat, dan waktu foto. Ketuk **Lihat di peta** untuk membuka lokasi di peta. Jika tingkat keyakinan di bawah 50%, akan muncul peringatan dan tombol **Foto ulang** untuk mengambil foto kembali. Ketuk **Tutup** untuk kembali ke Beranda.'),
  SUB('4.6', 'Ringkasan dan Riwayat'),
  P('Menu **Ringkasan** di bagian bawah layar menampilkan total inspeksi, jumlah jalan rusak dan normal, serta persentase setiap kelas. Menu **Riwayat** menampilkan daftar seluruh inspeksi. Daftar ini dapat disaring berdasarkan kelas dengan mengetuk pilihan Semua, Retakan, Lubang, Erosi permukaan, atau Normal. Ketuk **Muat lebih banyak** untuk menampilkan data berikutnya, dan ketuk salah satu baris untuk melihat detail inspeksi beserta fotonya.'),
  ...GAMBAR_HP([['hp_6.png', 'Menu Ringkasan'], ['hp_7.png', 'Menu Riwayat']]),
  SUB('4.7', 'Pengaturan'),
  P('Ketuk ikon roda gigi di pojok kanan atas untuk membuka **Pengaturan**. Halaman ini berisi beberapa bagian berikut.'),
  ...POIN([
    '**Akun**, menampilkan username yang sedang dipakai dan tombol **Keluar** untuk keluar dari akun.',
    '**Tampilan**, untuk memilih tema Sistem, Terang, atau Gelap.',
    '**Server backend**, untuk mengisi alamat server secara manual, misalnya `http://192.168.1.22:8000`, lalu ketuk **Simpan & hubungkan**. Alamat ini tersimpan di HP. Bagian ini biasanya tidak perlu diubah karena aplikasi sudah mencari alamat server secara otomatis.',
    '**Tentang**, berisi versi aplikasi, sumber foto yang dipakai, dan tombol **Kebijakan Privasi**.',
  ]),
  ...GAMBAR_HP([['hp_9.png', 'Halaman Pengaturan'], ['hp_10.png', 'Beranda dengan tema Terang']]),
);

// ── BAB V ──
add(
  BAB('Panduan Administrator'),
  P('Administrator mengelola data melalui halaman admin bawaan Django. Halaman ini hanya dapat dibuka oleh akun yang memiliki status staff atau superuser. Akun biasa yang dibuat melalui menu Daftar tidak dapat masuk ke halaman ini.'),
  SUB('5.1', 'Membuat Akun Administrator'),
  P('Akun administrator pertama dibuat melalui terminal dengan perintah berikut. Isi username, email (boleh dikosongkan), dan kata sandi saat diminta.'),
  ...PERINTAH(['cd ~/RoadPulse/backend', 'venv311/bin/python manage.py createsuperuser']),
  SUB('5.2', 'Masuk ke Halaman Admin'),
  ...LANGKAH([
    'Buka alamat `http://localhost:8000/admin/`, atau klik tombol **Admin** pada dashboard web.',
    'Isi username dan kata sandi akun administrator, lalu klik **Log in**.',
    'Halaman utama admin akan menampilkan menu **Inspection records** untuk data inspeksi, **Tokens** untuk token login, serta **Users** dan **Groups** untuk akun pengguna.',
  ]),
  ...GAMBAR('b05_admin_index.png', 'Halaman utama admin', 12),
  SUB('5.3', 'Mengubah atau Menghapus Data Inspeksi'),
  P('Halaman admin merupakan satu-satunya tempat untuk mengoreksi hasil analisis yang salah. Langkah-langkahnya sebagai berikut.'),
  ...LANGKAH([
    'Klik menu **Inspection records**. Daftar seluruh inspeksi akan tampil.',
    'Klik data yang ingin diubah.',
    'Ubah isian yang diperlukan, misalnya **Class label** jika jenis kerusakan yang ditebak sistem tidak sesuai.',
    'Klik **Save** untuk menyimpan perubahan, atau klik **Delete** untuk menghapus data tersebut.',
  ]),
  ...GAMBAR('b06_admin_records.png', 'Daftar data inspeksi pada halaman admin', 14),
  ...GAMBAR('b07_admin_edit.png', 'Formulir ubah data inspeksi', 14),
  SUB('5.4', 'Mengelola Akun Pengguna'),
  P('Melalui menu **Users**, administrator dapat melihat daftar akun, mengganti kata sandi pengguna yang lupa, menonaktifkan akun, atau memberikan status staff kepada pengguna lain. Untuk memberikan akses admin, buka akun yang dimaksud, centang pilihan **Staff status**, lalu klik **Save**.'),
);

// ── BAB VI ──
add(
  BAB('Masalah yang Sering Terjadi'),
  P('Bab ini berisi beberapa masalah yang kami temui selama aplikasi diuji, beserta cara mengatasinya.'),
  ...MASALAH('6.1', 'Aplikasi Tidak Terhubung ke Server',
    'Aplikasi mobile menampilkan status Offline, atau dashboard web menampilkan "API tidak terhubung". Pada terminal Expo muncul tulisan "Backend connection error ... Gagal terhubung ke server."',
    'Server belum berjalan, terminal `./start.sh` sudah ditutup, atau HP tidak berada di jaringan Wi-Fi yang sama dengan komputer.',
    [
      'Pastikan terminal yang menjalankan `./start.sh` masih terbuka. Jika sudah tertutup, jalankan kembali.',
      'Pastikan HP dan komputer terhubung ke Wi-Fi yang sama.',
      'Pada terminal Expo, tekan tombol **r** untuk memuat ulang aplikasi di HP.',
      'Jangan memakai alamat dengan port 8001 di aplikasi. Alamat yang benar selalu memakai port 8000.',
    ]),
  ...MASALAH('6.2', 'HP Menampilkan "Could not connect to development server"',
    'Layar merah muncul di HP dengan tulisan "Could not connect to development server".',
    'Expo di komputer sedang mati, misalnya karena terminal ditutup atau sempat dihentikan dengan Ctrl + C, sementara aplikasi di HP masih terbuka dari sesi sebelumnya.',
    [
      'Jalankan kembali `./start.sh` di komputer.',
      'Tutup Expo Go sepenuhnya di HP, lalu buka kembali dan pindai ulang kode QR.',
      'Pada iPhone, pastikan izin **Jaringan Lokal** untuk Expo Go sudah aktif di menu Pengaturan, Privasi & Keamanan.',
    ]),
  ...MASALAH('6.3', 'Muncul "address already in use"',
    'Saat menjalankan server secara manual muncul pesan "EADDRINUSE: address already in use".',
    'Port yang dibutuhkan masih dipakai oleh server lama yang belum dimatikan.',
    'Gunakan `./start.sh` karena perintah ini otomatis menghentikan server lama sebelum menyalakan server baru. Jika tetap terjadi, tutup terminal lain yang masih menjalankan server RoadPulse.'),
  ...MASALAH('6.4', 'Tidak Bisa Masuk',
    'Muncul pesan "Username atau kata sandi salah" atau "Terlalu banyak percobaan. Coba lagi dalam ... detik."',
    'Username atau kata sandi tidak sesuai, atau sudah terlalu sering gagal masuk dalam waktu singkat.',
    'Periksa kembali penulisan username dan kata sandi, termasuk huruf besar dan kecil. Jika muncul pesan terlalu banyak percobaan, tunggu sesuai waktu yang disebutkan. Jika lupa kata sandi, minta administrator menggantinya melalui halaman admin.'),
  ...MASALAH('6.5', 'Foto Ditolak',
    'Muncul pesan "Pilih file gambar JPEG atau PNG." atau "Ukuran foto maksimal 10 MB."',
    'Format atau ukuran foto tidak sesuai ketentuan.',
    'Gunakan foto berformat JPEG atau PNG dengan ukuran tidak lebih dari 10 MB. Foto dengan ukuran terlalu besar dapat diperkecil terlebih dahulu.'),
  ...MASALAH('6.6', 'Peta atau Lokasi Tidak Muncul',
    'Peta kosong, atau lokasi foto tertulis "GPS belum tersedia".',
    'Perangkat tidak terhubung ke internet, atau izin lokasi tidak diberikan.',
    'Pastikan perangkat terhubung ke internet karena peta diambil dari OpenStreetMap. Izinkan akses lokasi pada browser atau HP. Foto tetap dapat dianalisis tanpa lokasi, tetapi tidak akan muncul di peta.'),
  ...MASALAH('6.7', 'Pemasangan Paket Gagal karena Penyimpanan Penuh',
    'Saat menjalankan `npm install` atau `npx expo install` muncul pesan "ENOSPC: no space left on device".',
    'Ruang penyimpanan komputer habis, sehingga paket tidak dapat dipasang sampai selesai.',
    [
      'Kosongkan ruang penyimpanan, misalnya dengan membersihkan cache npm menggunakan perintah `npm cache clean --force` dan mengosongkan Trash.',
      'Pasang ulang paket aplikasi mobile dengan perintah `cd ~/RoadPulse/mobile && rm -rf node_modules && npm install`.',
      'Periksa kembali dengan perintah `npx expo install --check` sampai muncul tulisan "Dependencies are up to date".',
    ]),
  ...MASALAH('6.8', 'Server Tidak Dapat Terhubung ke Database',
    'Saat `./start.sh` dijalankan muncul tulisan "API tidak merespons", dan log Django menampilkan pesan "password authentication failed for user postgres" atau "connection refused".',
    'Kata sandi PostgreSQL tidak sama dengan isian `DB_PASSWORD` di file `backend/.env`, atau layanan PostgreSQL belum berjalan.',
    [
      'Buka file `backend/.env` dan pastikan isian `DB_PASSWORD=roadpulse` sesuai dengan kata sandi PostgreSQL.',
      'Coba masuk ke database dengan perintah psql pada subbab 2.4. Jika gagal, berarti kata sandi atau layanan PostgreSQL yang bermasalah.',
      'Jika PostgreSQL belum berjalan, nyalakan ulang komputer. Layanan PostgreSQL berjalan otomatis setiap kali komputer menyala.',
      'Sementara masalah diperbaiki, aplikasi tetap dapat dijalankan dengan SQLite memakai perintah `DB_ENGINE=sqlite ./start.sh`.',
    ]),
);

// ── BAB VII ──
add(
  BAB('Penutup'),
  SUB('7.1', 'Kesimpulan'),
  P('RoadPulse dapat membantu pendataan kondisi jalan di Kota Bandar Lampung dengan cara yang lebih cepat. Pengguna cukup memotret atau mengunggah foto jalan, kemudian sistem akan mengenali jenis kerusakannya dan menyimpan hasilnya beserta waktu dan lokasi. Data yang terkumpul dapat dipantau melalui statistik, peta, riwayat, dan file CSV, baik dari dashboard web maupun dari aplikasi mobile.'),
  SUB('7.2', 'Saran'),
  P('Beberapa hal yang dapat dikembangkan pada RoadPulse ke depannya adalah sebagai berikut.'),
  ...HURUF([
    'Menambah jumlah foto jalan berlubang dalam berbagai kondisi, seperti saat basah, berlumpur, atau malam hari, agar ketepatan model meningkat.',
    'Memasang aplikasi di server agar dapat diakses tanpa harus menyalakan laptop. Paket deploy sudah tersedia di folder `deploy/` beserta panduannya di `deploy/README.md`.',
    'Membuat build aplikasi mobile (APK atau AAB) dengan EAS Build agar dapat dipasang tanpa Expo Go dan diterbitkan di Play Store.',
    'Menambahkan status tindak lanjut laporan, misalnya baru, sudah diperiksa, dan sudah diperbaiki.',
    'Menguji aplikasi mobile secara langsung di lapangan dengan beberapa jenis HP.',
  ]),
);

// ════════════════════════════════════════════════════════════
const footer = (fmt) => new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] });
const pageProps = (fmt, start) => ({
  page: {
    size: { width: PAGE.w, height: PAGE.h },
    margin: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right },
    pageNumbers: { start, formatType: fmt },
  },
});

const doc = new Document({
  creator: 'Kelompok 5', title: 'User Manual Aplikasi RoadPulse',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 24 }, paragraph: { spacing: { line: 360 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 28, bold: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { before: 240, after: 120, line: 360 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: numbering },
  sections: [
    { properties: { ...pageProps(NumberFormat.LOWER_ROMAN, 1), titlePage: true }, footers: { default: footer(), first: new Footer({ children: [] }) },
      children: [...sampul, ...kataPengantar, ...daftarIsi] },
    { properties: { ...pageProps(NumberFormat.DECIMAL, 1), type: SectionType.NEXT_PAGE }, footers: { default: footer() }, children: isi },
  ],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log('DOCX:', OUT); });
