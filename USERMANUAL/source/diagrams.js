// Diagram SVG untuk User Manual RoadPulse (dibangkitkan, bukan tangkapan layar).
const T = {
  ink: '#13202B', soft: '#4A5A66', line: '#9AA8B2', teal: '#1F6F63', tealSoft: '#E3F1EE',
  sky: '#2D6CDF', skySoft: '#E6EEFC', amber: '#B7791F', amberSoft: '#FBF0DC',
  red: '#B5443B', redSoft: '#FBE6E3', grey: '#F3F5F7', maroon: '#7A1E2C', maroonSoft: '#F6E4E4',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function defs() {
  return `<defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${T.soft}"/></marker>
    <marker id="arR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${T.red}"/></marker>
  </defs>`;
}

function text(x, y, lines, { size = 12, weight = 400, fill = T.ink, anchor = 'middle', lh = 1.25 } = {}) {
  const arr = Array.isArray(lines) ? lines : [lines];
  const start = y - ((arr.length - 1) * size * lh) / 2;
  return arr.map((l, i) => `<text x="${x}" y="${start + i * size * lh}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="middle">${esc(l)}</text>`).join('');
}

function box(x, y, w, h, title, sub, { fill = T.grey, stroke = T.line, tcol = T.ink, r = 8, dash = false } = {}) {
  const lines = sub ? (Array.isArray(sub) ? sub : [sub]) : [];
  const th = 13, sh = 10.5;
  const total = th * 1.3 + lines.length * sh * 1.3;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`;
  const top = y + h / 2 - total / 2 + th * 0.65;
  out += text(x + w / 2, top, title, { size: th, weight: 700, fill: tcol });
  lines.forEach((l, i) => { out += text(x + w / 2, top + th * 1.05 + (i + 0.6) * sh * 1.3, l, { size: sh, fill: T.soft }); });
  return out;
}

function arrow(x1, y1, x2, y2, label, { dash = false, color = T.soft, lx, ly, marker = 'ar', both = false } = {}) {
  let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.4" ${dash ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#${marker})" ${both ? `marker-start="url(#${marker})"` : ''}/>`;
  if (label) {
    const mx = lx ?? (x1 + x2) / 2, my = ly ?? (y1 + y2) / 2 - 8;
    const w = Math.max(...[].concat(label).map((l) => l.length)) * 5.6 + 10;
    const n = [].concat(label).length;
    out += `<rect x="${mx - w / 2}" y="${my - 7 * n - 1}" width="${w}" height="${14 * n + 2}" rx="4" fill="#fff" opacity="0.92"/>`;
    out += text(mx, my, label, { size: 9.5, fill: T.soft });
  }
  return out;
}

function poly(points, label, { color = T.soft, dash = false, lx, ly, marker = 'ar' } = {}) {
  let out = `<polyline points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.4" ${dash ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#${marker})"/>`;
  if (label) {
    const w = label.length * 5.6 + 10;
    out += `<rect x="${lx - w / 2}" y="${ly - 8}" width="${w}" height="16" rx="4" fill="#fff" opacity="0.92"/>` + text(lx, ly, label, { size: 9.5, fill: color === T.soft ? T.soft : color });
  }
  return out;
}

const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">${defs()}${body}</svg>`;

// ── D1: Arsitektur ────────────────────────────────────────────
function architecture() {
  let b = '';
  b += box(10, 30, 150, 64, 'Browser (Web)', ['Dashboard :3000', 'HTML/CSS/JS'], { fill: T.skySoft, stroke: T.sky });
  b += box(10, 130, 150, 64, 'HP (Expo Go)', ['Aplikasi mobile', 'React Native'], { fill: T.maroonSoft, stroke: T.maroon });
  b += box(225, 78, 140, 68, 'Proxy API', ['backend/proxy.js', '0.0.0.0:8000 · CORS'], { fill: T.amberSoft, stroke: T.amber });
  b += box(430, 58, 170, 108, 'Django :8001', ['DRF API /api/v1/', 'Django Admin /admin/', 'Swagger /api/docs/', 'Validasi & serializer'], { fill: T.tealSoft, stroke: T.teal });
  b += box(665, 18, 140, 58, 'Model AI', ['MobileNetV2 (.pt)', 'PyTorch · 4 kelas'], { fill: T.grey });
  b += box(665, 90, 140, 52, 'Database', ['PostgreSQL / SQLite'], { fill: T.grey });
  b += box(665, 156, 140, 52, 'Media', ['backend/media/uploads'], { fill: T.grey });
  b += arrow(160, 62, 225, 100, 'HTTP JSON');
  b += arrow(160, 162, 225, 126, 'HTTP (IP LAN)');
  b += arrow(365, 112, 430, 112, 'teruskan');
  b += arrow(600, 80, 665, 50, 'inferensi');
  b += arrow(600, 112, 665, 116, 'simpan record');
  b += arrow(600, 140, 665, 180, 'simpan foto');
  b += box(10, 236, 330, 58, 'Layanan internet (dipanggil browser & HP)', ['CDN Chart.js · Leaflet · exifr · Google Fonts', 'Peta OpenStreetMap · Nominatim (nama jalan)'], { fill: '#fff', dash: true });
  b += arrow(85, 94, 85, 236, null, { dash: true });
  b += box(430, 236, 375, 58, 'Akses administrator', ['Django Admin lewat proxy :8000/admin/', 'atau langsung 127.0.0.1:8001/admin/'], { fill: '#fff', dash: true, stroke: T.teal });
  b += arrow(515, 236, 515, 166, null, { dash: true, color: T.red, marker: 'arR' });
  return svg(815, 302, b);
}

// ── D2: Aktor & hak akses ─────────────────────────────────────
function actors() {
  const person = (cx, cy, color) => `<circle cx="${cx}" cy="${cy - 16}" r="9" fill="none" stroke="${color}" stroke-width="2"/>
    <path d="M${cx - 15},${cy + 14} Q${cx},${cy - 10} ${cx + 15},${cy + 14}" fill="none" stroke="${color}" stroke-width="2"/>`;
  let b = '';
  const A = [
    { y: 60, c: T.sky, t: 'Pengguna umum', s: ['tanpa login (web)'] },
    { y: 175, c: T.teal, t: 'Pengguna terdaftar', s: ['akun Django non-staff', '(login web/mobile → token)'] },
    { y: 300, c: T.maroon, t: 'Administrator', s: ['akun is_staff / superuser'] },
  ];
  A.forEach((a) => { b += person(55, a.y, a.c) + text(55, a.y + 32, a.t, { size: 12, weight: 700 }) + a.s.map((l, i) => text(55, a.y + 47 + i * 13, l, { size: 9.5, fill: T.soft })).join(''); });
  const U = [
    [20, 'Klasifikasi foto jalan (web & mobile)'],
    [62, 'Lihat statistik, peta, riwayat'],
    [104, 'Unduh CSV riwayat (web)'],
    [146, 'Login web/mobile, daftar (mobile)'],
    [188, 'Logout (hapus token di browser)'],
    [230, 'Login Django Admin'],
    [272, 'Ubah / hapus record inspeksi'],
    [314, 'Kelola akun, grup, token'],
  ];
  U.forEach(([y, t]) => { b += `<rect x="330" y="${y}" width="270" height="32" rx="16" fill="${T.grey}" stroke="${T.line}"/>` + text(465, y + 16, t, { size: 11 }); });
  const link = (ay, uy, c) => `<line x1="120" y1="${ay}" x2="330" y2="${uy + 16}" stroke="${c}" stroke-width="1.3"/>`;
  [0, 1, 2].forEach((i) => { b += link(60, U[i][0], T.sky); });
  [0, 1, 2, 3, 4].forEach((i) => { b += link(175, U[i][0], T.teal); });
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => { b += link(300, U[i][0], T.maroon); });
  b += `<rect x="640" y="20" width="170" height="326" rx="8" fill="#fff" stroke="${T.red}" stroke-dasharray="5 4"/>`;
  b += text(725, 40, 'Tidak ditemukan di kode', { size: 11, weight: 700, fill: T.red });
  ['Role pelapor / verifikator', 'Verifikasi laporan', 'Status laporan', 'Pembatasan akses API', '(semua endpoint AllowAny)'].forEach((t, i) => { b += text(725, 75 + i * 22, t, { size: 10.5, fill: T.soft }); });
  b += text(725, 225, ['Catatan: login web tidak', 'diwajibkan untuk membuka', 'dashboard; token tidak', 'dikirim ke API mana pun.'], { size: 10, fill: T.soft });
  return svg(815, 350, b);
}

// ── Flowchart helpers ─────────────────────────────────────────
const pill = (cx, y, w, t, f = T.ink) => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="30" rx="15" fill="${f}"/>` + text(cx, y + 15, t, { size: 11, weight: 700, fill: '#fff' });
const proc = (cx, y, w, t, o = {}) => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${o.h || 36}" rx="6" fill="${o.fill || T.grey}" stroke="${o.stroke || T.line}"/>` + text(cx, y + (o.h || 36) / 2, t, { size: 10.5 });
const dec = (cx, y, w, h, t) => `<polygon points="${cx},${y} ${cx + w / 2},${y + h / 2} ${cx},${y + h} ${cx - w / 2},${y + h / 2}" fill="${T.amberSoft}" stroke="${T.amber}"/>` + text(cx, y + h / 2, t, { size: 10 });
const io = (cx, y, w, t) => `<polygon points="${cx - w / 2 + 10},${y} ${cx + w / 2 + 10},${y} ${cx + w / 2 - 10},${y + 36} ${cx - w / 2 - 10},${y + 36}" fill="${T.skySoft}" stroke="${T.sky}"/>` + text(cx, y + 18, t, { size: 10.5 });
const err = (cx, y, w, t, h = 36) => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="6" fill="${T.redSoft}" stroke="${T.red}"/>` + text(cx, y + h / 2, t, { size: 10 });

// ── D3: Login ─────────────────────────────────────────────────
function loginFlow() {
  let b = '';
  b += pill(200, 10, 170, 'Buka login.html');
  b += dec(200, 58, 200, 62, ['Token rp_token', 'sudah ada?']);
  b += arrow(200, 40, 200, 58);
  b += io(200, 145, 210, 'Isi username & kata sandi');
  b += arrow(200, 120, 200, 145, 'tidak', { lx: 222, ly: 133 });
  b += poly([[300, 89], [520, 89], [520, 470]], 'ya → langsung ke index.html', { lx: 420, ly: 78 });
  b += dec(200, 205, 200, 62, ['Kedua field', 'terisi?']);
  b += arrow(200, 181, 200, 205);
  b += err(470, 215, 150, ['"Username dan kata sandi', 'wajib diisi."'], 42);
  b += arrow(300, 236, 395, 236, 'tidak');
  b += proc(200, 292, 220, ['POST /api/v1/auth/login/', '(JSON)']);
  b += arrow(200, 267, 200, 292, 'ya', { lx: 215, ly: 280 });
  b += dec(200, 350, 200, 62, ['Server merespons?']);
  b += arrow(200, 328, 200, 350);
  b += err(470, 330, 150, ['"Tidak bisa terhubung ke', 'server. Pastikan backend', 'sudah berjalan."'], 52);
  b += arrow(300, 381, 395, 360, 'tidak');
  b += dec(200, 432, 200, 62, ['Kredensial benar?', '(HTTP 200)']);
  b += arrow(200, 412, 200, 432, 'ya', { lx: 215, ly: 422 });
  b += err(470, 405, 150, ['HTTP 401 "Username atau', 'kata sandi salah"'], 42);
  b += arrow(300, 463, 395, 426, 'tidak');
  b += proc(200, 518, 220, ['Simpan token ke localStorage', '(rp_token)'], { fill: T.tealSoft, stroke: T.teal });
  b += arrow(200, 494, 200, 518, 'ya', { lx: 215, ly: 506 });
  b += pill(200, 578, 170, 'Buka index.html', T.teal);
  b += arrow(200, 554, 200, 578);
  b += arrow(520, 470, 300, 593);
  return svg(560, 620, b);
}

// ── D4: Alur laporan / klasifikasi ────────────────────────────
function reportFlow() {
  let b = '';
  const lanes = [['Pengguna', T.skySoft], ['Antarmuka (web / mobile)', T.maroonSoft], ['Backend Django', T.tealSoft], ['Model AI & penyimpanan', T.grey]];
  lanes.forEach(([t, f], i) => { b += `<rect x="${10 + i * 200}" y="10" width="196" height="610" rx="8" fill="${f}" opacity="0.55"/>` + text(108 + i * 200, 28, t, { size: 11.5, weight: 700 }); });
  const c = (i) => 108 + i * 200;
  b += pill(c(0), 50, 160, 'Mulai deteksi');
  b += io(c(0), 100, 150, ['Pilih / potret', 'foto jalan']);
  b += arrow(c(0), 80, c(0), 100);
  b += proc(c(1), 100, 170, ['Cek format & ukuran', '(web) · preview'], { h: 40 });
  b += arrow(c(0) + 80, 118, c(1) - 85, 120);
  b += proc(c(1), 165, 170, ['Ambil GPS + nama jalan', '(jika diizinkan)'], { h: 40 });
  b += arrow(c(1), 140, c(1), 165);
  b += proc(c(1), 230, 170, ['POST /api/v1/classify/', 'multipart: image, lat, lng,', 'location_name, captured_at'], { h: 50 });
  b += arrow(c(1), 205, c(1), 230);
  b += dec(c(2), 220, 170, 70, ['Serializer & validasi', 'gambar valid?']);
  b += arrow(c(1) + 85, 255, c(2) - 85, 255);
  b += err(c(2), 310, 170, ['400 + pesan error', '→ ditampilkan ke pengguna'], 40);
  b += arrow(c(2), 290, c(2), 310, 'tidak', { lx: c(2) + 22, ly: 300 });
  b += proc(c(3), 230, 170, ['Simpan record sementara', '+ file ke media/uploads'], { h: 44 });
  b += arrow(c(2) + 85, 255, c(3) - 85, 252, 'ya', { lx: c(2) + 100, ly: 243 });
  b += proc(c(3), 300, 170, ['MobileNetV2: resize 224,', 'normalisasi, softmax'], { h: 44 });
  b += arrow(c(3), 274, c(3), 300);
  b += dec(c(3), 370, 170, 70, ['Model tersedia &', 'prediksi berhasil?']);
  b += arrow(c(3), 344, c(3), 370);
  b += err(c(3), 465, 170, ['Hapus record →', '503 / 500 + pesan'], 40);
  b += arrow(c(3), 440, c(3), 465, 'tidak', { lx: c(3) + 22, ly: 452 });
  b += proc(c(2), 390, 170, ['Update class_label &', 'confidence_score'], { h: 40 });
  b += arrow(c(3) - 85, 405, c(2) + 85, 410, 'ya', { lx: c(3) - 100, ly: 396 });
  b += proc(c(2), 455, 170, ['201 Created + JSON', 'InspectionRecord'], { h: 40, fill: T.tealSoft, stroke: T.teal });
  b += arrow(c(2), 430, c(2), 455);
  b += proc(c(1), 455, 170, ['Tampilkan hasil, keyakinan,', 'lokasi; muat ulang dashboard'], { h: 40 });
  b += arrow(c(2) - 85, 475, c(1) + 85, 475);
  b += pill(c(0), 555, 160, 'Hasil tersimpan', T.teal);
  b += poly([[c(1), 495], [c(1), 570], [c(0) + 80, 570]]);
  return svg(815, 630, b);
}

// ── D5: Koreksi data oleh admin ───────────────────────────────
function adminFlow() {
  let b = '';
  b += pill(150, 10, 230, 'Buka http://localhost:8000/admin/');
  b += dec(150, 58, 200, 62, ['Akun is_staff &', 'kata sandi benar?']);
  b += arrow(150, 40, 150, 58);
  b += err(420, 66, 200, ['"Please enter the correct username', 'and password for a staff account..."'], 46);
  b += arrow(250, 89, 320, 89, 'tidak');
  b += proc(150, 148, 230, ['Pilih Api › Inspection records'], { h: 34 });
  b += arrow(150, 120, 150, 148, 'ya', { lx: 165, ly: 134 });
  b += proc(150, 206, 230, ['Buka record → ubah Class label,', 'lokasi, koordinat, dll.'], { h: 42 });
  b += arrow(150, 182, 150, 206);
  b += dec(150, 272, 200, 62, ['Simpan atau', 'Hapus?']);
  b += arrow(150, 248, 150, 272);
  b += proc(150, 360, 200, ['Save → data diperbarui'], { h: 34, fill: T.tealSoft, stroke: T.teal });
  b += arrow(150, 334, 150, 360, 'Save', { lx: 172, ly: 347 });
  b += proc(420, 286, 200, ['Delete → konfirmasi →', 'record dihapus'], { h: 40, fill: T.redSoft, stroke: T.red });
  b += arrow(250, 303, 320, 303, 'Delete');
  b += text(420, 375, ['Bukan fitur verifikasi: tidak ada status', 'laporan maupun jejak siapa yang mengoreksi', 'di model InspectionRecord.'], { size: 10, fill: T.red });
  return svg(560, 410, b);
}

// ── D6: Penanganan error ──────────────────────────────────────
function errorFlow() {
  let b = '';
  b += pill(400, 8, 200, 'Pengguna mengirim foto');
  const row = (y, q, e, code, lab = 'tidak') => {
    let s = dec(250, y, 230, 58, q) + err(600, y + 9, 300, e, 40);
    s += arrow(365, y + 29, 450, y + 29, lab);
    return s;
  };
  b += arrow(400, 38, 250, 52);
  b += row(52, ['Browser: tipe image/* &', 'ukuran ≤ 10 MB?'], ['alert: "Please select a valid image file…"', '/ "File size must be less than 10MB"']);
  b += arrow(250, 110, 250, 128, 'ya', { lx: 268, ly: 119 });
  b += row(128, ['Server dapat', 'dijangkau?'], ['Web: "API tidak terhubung" · Mobile: "Gagal', 'terhubung ke server." · Proxy: 502']);
  b += arrow(250, 186, 250, 204, 'ya', { lx: 268, ly: 195 });
  b += row(204, ['Serializer valid?', '(image, lat, lng, waktu)'], ['400 "Invalid request data"', '+ details per field']);
  b += arrow(250, 262, 250, 280, 'ya', { lx: 268, ly: 271 });
  b += row(280, ['≤ 10 MB, .jpg/.jpeg/.png,', 'gambar dapat dibuka?'], ['400 "File size exceeds 10MB limit" /', '"Only JPEG and PNG images are allowed"']);
  b += arrow(250, 338, 250, 356, 'ya', { lx: 268, ly: 347 });
  b += row(356, ['Model AI', 'tersedia?'], ['503 "Trained model not found…" /', '"PyTorch and torchvision are required…"']);
  b += arrow(250, 414, 250, 432, 'ya', { lx: 268, ly: 423 });
  b += row(432, ['Prediksi', 'berhasil?'], ['500 "Prediction failed" + details', '(record dihapus)']);
  b += arrow(250, 490, 250, 508, 'ya', { lx: 268, ly: 499 });
  b += pill(250, 508, 200, '201 · hasil ditampilkan', T.teal);
  b += text(600, 523, ['Mobile: keyakinan < 50% → peringatan', '"Hasil kurang yakin, sebaiknya foto ulang"'], { size: 10, fill: T.amber });
  return svg(800, 548, b);
}

// ── Ilustrasi layar mobile (bukan screenshot) ─────────────────
// Digambar ulang dari mobile/App.js, mobile/screens/*, mobile/components/* dan mobile/theme/tokens.js
// (desain "Lampung Edition": navy gelap + emerald, aksen emas Siger/Tapis). Skala ±0,5 dari ukuran pt asli.
const PAL = {
  dark: {
    bg: '#101827', surface: '#1C293B', elevated: '#243247', text: '#F8FAFC', sec: '#94A3B8', border: '#334155',
    accent: '#20C997', accentText: '#20C997', accentSoft: 'rgba(32,201,151,0.14)', onAccent: '#04241C',
    heritage: '#D4A537', heritageSoft: 'rgba(212,165,55,0.16)', scrim: 'rgba(5,9,18,0.62)',
    danger: '#EF4444', dangerText: '#F87171', dangerSoft: 'rgba(239,68,68,0.16)',
    warning: '#F59E0B', warningText: '#F59E0B', warningSoft: 'rgba(245,158,11,0.16)',
    success: '#22C55E', successText: '#22C55E', successSoft: 'rgba(34,197,94,0.16)',
    info: '#3B82F6', infoSoft: 'rgba(59,130,246,0.16)', road: '#2E3D53', road2: '#26354A', frame: '#05080F',
  },
  light: {
    bg: '#F5F7FA', surface: '#FFFFFF', elevated: '#EEF2F7', text: '#172033', sec: '#64748B', border: '#E2E8F0',
    accent: '#20C997', accentText: '#087A5B', accentSoft: 'rgba(32,201,151,0.12)', onAccent: '#04241C',
    heritage: '#A97C14', heritageSoft: 'rgba(212,165,55,0.14)', scrim: 'rgba(15,23,42,0.45)',
    danger: '#EF4444', dangerText: '#DC2626', dangerSoft: 'rgba(239,68,68,0.10)',
    warning: '#F59E0B', warningText: '#B45309', warningSoft: 'rgba(245,158,11,0.14)',
    success: '#22C55E', successText: '#15803D', successSoft: 'rgba(34,197,94,0.12)',
    info: '#3B82F6', infoSoft: 'rgba(59,130,246,0.10)', road: '#FFFFFF', road2: '#DDE3EA', frame: '#1F2937',
  },
};
const CLS = (p) => ({
  Crack: { name: 'Retakan', status: 'Perlu perbaikan', c: p.danger, t: p.dangerText, s: p.dangerSoft },
  Pothole: { name: 'Lubang', status: 'Perlu perbaikan', c: p.danger, t: p.dangerText, s: p.dangerSoft },
  Erosion: { name: 'Erosi permukaan', status: 'Perlu dipantau', c: p.warning, t: p.warningText, s: p.warningSoft },
  Normal: { name: 'Normal', status: 'Kondisi baik', c: p.success, t: p.successText, s: p.successSoft },
});

let phoneId = 0;
function phone(title, inner, p) {
  const id = `ph${++phoneId}`;
  return `<div class="phone"><svg viewBox="0 0 200 400" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <defs><clipPath id="${id}"><rect x="2" y="2" width="196" height="396" rx="21"/></clipPath></defs>
    <rect x="1" y="1" width="198" height="398" rx="22" fill="${p.bg}"/>
    <g clip-path="url(#${id})">${inner}</g>
    <rect x="1" y="1" width="198" height="398" rx="22" fill="none" stroke="${p.frame}" stroke-width="2"/></svg><div class="phone-cap">${esc(title)}</div></div>`;
}
const t = (x, y, s, { size = 6, w = 400, fill, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`;
const rect = (x, y, w, h, fill, { r = 0, stroke, sw = 0.6 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
const card = (p, x, y, w, h, extra = {}) => rect(x, y, w, h, extra.fill || p.surface, { r: extra.r ?? 10, stroke: p.border, sw: 0.5 });
const dot = (x, y, c, r = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const bar = (x, y, w, pct, p, c) => rect(x, y, w, 4, p.elevated, { r: 2 }) + rect(x, y, Math.max(0, w * pct / 100), 4, c, { r: 2 });
const overline = (x, y, s, p) => t(x, y, s.toUpperCase(), { size: 5, w: 700, fill: p.sec, ls: 0.6 });

// Siger: mahkota adat Lampung (sama dengan components/lampung.js)
function siger(x, y, w, color, opacity = 1) {
  const peaks = [0.45, 0.65, 0.85, 1, 0.85, 0.65, 0.45];
  const pw = w / peaks.length, maxH = w * 0.42, bead = Math.max(1.2, pw * 0.3);
  const base = y + maxH + bead + 1;
  let s = '';
  peaks.forEach((h, i) => {
    const cx = x + pw * i + pw / 2, top = base - maxH * h;
    s += `<polygon points="${cx},${top} ${cx + pw / 2},${base} ${cx - pw / 2},${base}" fill="${color}"/>` + dot(cx, top - bead / 2 - 0.3, color, bead / 2);
  });
  s += rect(x - w * 0.02, base, w * 1.04, Math.max(1.2, w * 0.07), color, { r: w * 0.035 });
  s += rect(x + w * 0.07, base + w * 0.095, w * 0.86, Math.max(0.8, w * 0.035), color, { r: w * 0.02 });
  return `<g opacity="${opacity}">${s}</g>`;
}
// Garis motif belah ketupat ala kain Tapis
const tapis = (x, y, count, size, gap, color, opacity) => `<g opacity="${opacity}">` + Array.from({ length: count }).map((_, i) => {
  const cx = x + i * (size + gap) + size / 2;
  return `<rect x="${cx - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" transform="rotate(45 ${cx} ${y})" fill="${i % 2 ? 'none' : color}" stroke="${color}" stroke-width="${i % 2 ? 0.5 : 0}"/>`;
}).join('') + '</g>';

const gear = (cx, cy, c) => `<circle cx="${cx}" cy="${cy}" r="3.2" fill="none" stroke="${c}" stroke-width="1.3"/>` +
  [0, 45, 90, 135].map((a) => `<rect x="${cx - 0.8}" y="${cy - 5.2}" width="1.6" height="10.4" rx="0.6" fill="${c}" transform="rotate(${a} ${cx} ${cy})"/>`).join('') + `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${c}"/>`;
const camIcon = (x, y, c) => `<rect x="${x}" y="${y + 2}" width="10" height="7" rx="2" fill="none" stroke="${c}" stroke-width="1.1"/><rect x="${x + 3.2}" y="${y}" width="3.6" height="2" rx="0.8" fill="${c}"/><circle cx="${x + 5}" cy="${y + 5.5}" r="1.7" fill="none" stroke="${c}" stroke-width="1.1"/>`;
const pinIcon = (cx, y, c) => `<path d="M${cx},${y + 10} C${cx - 4},${y + 5} ${cx - 4},${y + 1} ${cx},${y + 1} C${cx + 4},${y + 1} ${cx + 4},${y + 5} ${cx},${y + 10} z" fill="none" stroke="${c}" stroke-width="1.1"/><circle cx="${cx}" cy="${y + 4.3}" r="1.2" fill="${c}"/>`;
const chevron = (x, y, c) => `<path d="M${x},${y - 2.5} L${x + 2.5},${y} L${x},${y + 2.5}" fill="none" stroke="${c}" stroke-width="1"/>`;

// Bar aplikasi + garis Tapis (App.js)
const appBar = (p) => rect(10, 16, 20, 20, p.accent, { r: 6 }) + siger(13.5, 20.5, 13, p.onAccent) +
  t(35, 25, 'RoadPulse', { size: 9, w: 700, fill: p.text }) + t(35, 33, 'Smart Mobility · Lampung', { size: 5.8, w: 500, fill: p.sec }) +
  `<circle cx="179" cy="26" r="11" fill="${p.elevated}" stroke="${p.border}" stroke-width="0.5"/>` + gear(179, 26, p.text) +
  tapis(12, 45, 26, 2, 5, p.heritage, 0.35);
const titleBlock = (p, title, sub) => t(10, 66, title, { size: 14, w: 800, fill: p.text, ls: -0.3 }) + t(10, 77, sub, { size: 7, fill: p.sec });

const TAB_NAMES = ['Beranda', 'Ringkasan', 'Riwayat'];
function tabIcon(i, cx, cy, c) {
  if (i === 0) return `<path d="M${cx - 5},${cy} L${cx},${cy - 4.5} L${cx + 5},${cy}" fill="none" stroke="${c}" stroke-width="1.1"/><path d="M${cx - 3.6},${cy - 1} v4.8 h7.2 v-4.8" fill="none" stroke="${c}" stroke-width="1.1"/>`;
  if (i === 1) return [[-4, 2.5], [-0.9, 4.5], [2.2, 3.4]].map(([dx, h]) => rect(cx + dx, cy + 4 - h * 1.6, 2, h * 1.6, c, { r: 0.6 })).join('');
  return [-3, 0, 3].map((dy) => dot(cx - 4, cy + dy, c, 0.9) + rect(cx - 2.4, cy + dy - 0.5, 7, 1, c, { r: 0.5 })).join('');
}
const tabbar = (p, active) => rect(0, 360, 200, 40, p.surface) + `<line x1="0" y1="360" x2="200" y2="360" stroke="${p.border}" stroke-width="0.5"/>` +
  TAB_NAMES.map((name, i) => {
    const cx = 36 + i * 64, on = i === active, c = on ? p.accentText : p.sec;
    return (on ? rect(cx - 16, 365, 32, 15, p.accentSoft, { r: 7.5 }) : '') + tabIcon(i, cx, 372, c) +
      t(cx, 389, name, { size: 6, w: on ? 800 : 600, fill: c, anchor: 'middle' });
  }).join('');

const thumb = (p, x, y, s, tone) => rect(x, y, s, s, p.elevated, { r: 5 }) +
  `<path d="M${x},${y + s * 0.62} Q${x + s * 0.5},${y + s * 0.45} ${x + s},${y + s * 0.6} L${x + s},${y + s} L${x},${y + s} z" fill="${tone}" opacity="0.35"/>`;
// Baris inspeksi (components/inspection.js: InspectionRow)
function inspRow(p, x, y, w, key, conf, loc, date, last) {
  const m = CLS(p)[key], low = conf < 50, bw = m.name.length * 3.3 + 12;
  return thumb(p, x, y + 4, 22, m.c) +
    rect(x + 28, y + 4, bw, 10, m.s, { r: 3 }) + dot(x + 33, y + 9, m.c, 1.5) + t(x + 37, y + 11.3, m.name, { size: 5.5, w: 700, fill: m.t }) +
    t(x + w - 10, y + 11.3, `${conf}%`, { size: 6, w: low ? 800 : 600, fill: low ? p.warningText : p.sec, anchor: 'end' }) +
    t(x + 28, y + 20.5, loc, { size: 6.5, w: 600, fill: p.text }) + t(x + 28, y + 27.5, date, { size: 5.3, w: 500, fill: p.sec }) +
    chevron(x + w - 4, y + 15, p.sec) + (last ? '' : `<line x1="${x}" y1="${y + 31}" x2="${x + w}" y2="${y + 31}" stroke="${p.border}" stroke-width="0.5"/>`);
}
const button = (p, x, y, w, h, label, { variant = 'primary', icon } = {}) => {
  const fill = variant === 'primary' ? p.accent : variant === 'ghost' ? 'none' : p.elevated;
  const col = variant === 'primary' ? p.onAccent : variant === 'ghost' ? p.sec : p.text;
  const lw = label.length * 3.6 + (icon ? 14 : 0), sx = x + w / 2 - lw / 2;
  return rect(x, y, w, h, fill, { r: 8, stroke: variant === 'secondary' ? p.border : undefined, sw: 0.5 }) +
    (icon === 'cam' ? camIcon(sx, y + h / 2 - 4.5, col) : icon === 'pin' ? pinIcon(sx + 4, y + h / 2 - 5.5, col) : '') +
    t(sx + (icon ? 14 : 0), y + h / 2 + 2.6, label, { size: 7.5, w: 600, fill: col });
};
const photoFill = (x, y, w, h, r, dark = true) => rect(x, y, w, h, dark ? '#3B4250' : '#8D8A84', { r }) +
  `<path d="M${x},${y + h * 0.35} L${x + w},${y + h * 0.28} L${x + w},${y + h} L${x},${y + h} z" fill="${dark ? '#535B68' : '#A19C94'}"/>` +
  `<ellipse cx="${x + w * 0.52}" cy="${y + h * 0.68}" rx="${w * 0.2}" ry="${h * 0.11}" fill="#262A31"/><ellipse cx="${x + w * 0.52}" cy="${y + h * 0.66}" rx="${w * 0.15}" ry="${h * 0.07}" fill="#1A1D22"/>` +
  `<path d="M${x + w * 0.1},${y + h * 0.55} l${w * 0.12},${h * 0.06} l${w * 0.06},-${h * 0.04} l${w * 0.1},${h * 0.07}" fill="none" stroke="#2A2E35" stroke-width="0.8"/>`;

// Peta Leaflet + OpenStreetMap (components/RoadMap.js); tile digelapkan pada tema gelap
function mapBox(p, x, y, w, h, markers) {
  let s = rect(x, y, w, h, p.elevated, { r: 10, stroke: p.border, sw: 0.5 });
  s += `<path d="M${x + w * 0.62},${y} Q${x + w * 0.75},${y + h * 0.4} ${x + w},${y + h * 0.45} L${x + w},${y} z" fill="${p === PAL.dark ? '#1A2B3E' : '#CFE3F2'}"/>`;
  const roads = [[0, 0.3, 1, 0.42, 3], [0.15, 0, 0.35, 1, 3], [0, 0.75, 1, 0.62, 2.4], [0.55, 0, 0.72, 1, 2.4], [0, 0.52, 0.6, 0.98, 1.4], [0.3, 0.2, 0.95, 0.9, 1.4]];
  roads.forEach(([x1, y1, x2, y2, sw]) => { s += `<line x1="${x + w * x1}" y1="${y + h * y1}" x2="${x + w * x2}" y2="${y + h * y2}" stroke="${sw > 2 ? p.road : p.road2}" stroke-width="${sw}"/>`; });
  markers.forEach(([mx, my, c]) => { s += `<circle cx="${x + w * mx}" cy="${y + h * my}" r="4.2" fill="${c}" stroke="#FFFFFF" stroke-width="1"/>`; });
  s += rect(x + w - 16, y + h - 30, 11, 22, p.surface, { r: 2, stroke: p.border, sw: 0.5 }) + t(x + w - 10.5, y + h - 21.5, '+', { size: 7, w: 700, fill: p.text, anchor: 'middle' }) +
    t(x + w - 10.5, y + h - 11, '−', { size: 7, w: 700, fill: p.text, anchor: 'middle' });
  s += rect(x + 4, y + h - 9, 44, 7, p.surface, { r: 1 }) + t(x + 6, y + h - 4, '© OpenStreetMap', { size: 4.3, fill: p.sec });
  return s;
}

// Data contoh yang dipakai konsisten di semua ilustrasi: 15 inspeksi = Retakan 4, Lubang 4, Erosi 3, Normal 4
function homeTop(p) {
  const C = CLS(p);
  let s = appBar(p);
  s += t(10, 62, 'Selamat pagi, petugas_kedaton · Tabik Pun!', { size: 6.5, w: 600, fill: p.sec }) + t(10, 75, 'Kondisi jalan Lampung hari ini', { size: 11, w: 800, fill: p.text, ls: -0.2 });
  s += overline(10, 89, 'Status sistem', p) + card(p, 10, 93, 180, 66);
  [['Server', 'Online · 192.168.1.10:8000', p.success], ['GPS', 'Aktif', p.success], ['Diperbarui', 'Pukul 09.12 · tarik untuk segarkan', p.info]].forEach(([l, v, c], i) => {
    const yy = 93 + i * 22;
    s += dot(20, yy + 11, c) + t(27, yy + 13.2, l, { size: 6.5, w: 600, fill: p.text }) + t(182, yy + 13, v, { size: 5.6, w: 500, fill: p.sec, anchor: 'end' });
    if (i < 2) s += `<line x1="18" y1="${yy + 22}" x2="182" y2="${yy + 22}" stroke="${p.border}" stroke-width="0.5"/>`;
  });
  s += t(10, 174, 'Ringkasan kondisi jalan', { size: 8.5, w: 700, fill: p.text }) + t(190, 174, 'Detail', { size: 6.5, w: 600, fill: p.accentText, anchor: 'end' });
  const tiles = [['Total laporan', '15', p.text, 'Semua inspeksi'], ['Perlu perbaikan', '8', C.Pothole.t, 'Retakan & lubang'], ['Perlu dipantau', '3', C.Erosion.t, 'Erosi permukaan'], ['Normal', '4', C.Normal.t, 'Kondisi baik']];
  tiles.forEach(([l, v, c, h], i) => {
    const x = 10 + (i % 2) * 92, y = 180 + Math.floor(i / 2) * 50;
    s += card(p, x, y, 88, 46) + overline(x + 8, y + 11, l, p) + t(x + 8, y + 29, v, { size: 14, w: 800, fill: c }) + t(x + 8, y + 39, h, { size: 5.3, w: 500, fill: p.sec });
  });
  s += card(p, 10, 281, 180, 25) + t(18, 291, 'Tingkat kerusakan', { size: 6.5, w: 600, fill: p.text }) + t(182, 291, '73%', { size: 8.5, w: 700, fill: p.text, anchor: 'end' }) + bar(18, 296, 164, 73, p, p.danger);
  s += rect(10, 310, 180, 22, p.infoSoft, { r: 6 }) + dot(17, 316, p.info) + t(23, 318, 'Data lalu lintas dan titik kemacetan belum tersedia dari server', { size: 4.6, w: 500, fill: p.text }) +
    t(23, 325, 'RoadPulse. Aplikasi memantau permukaan jalan dari foto lapangan.', { size: 4.6, w: 500, fill: p.text });
  s += button(p, 10, 336, 180, 20, 'Foto & analisis jalan', { icon: 'cam' });
  return s + tabbar(p, 0);
}

function homeLower(p) {
  const C = CLS(p);
  let s = appBar(p);
  s += t(10, 66, 'Peta kerusakan jalan', { size: 8.5, w: 700, fill: p.text }) + t(10, 75, '12 titik ber-GPS dari server · ketuk titik untuk melihat detail', { size: 5.2, w: 500, fill: p.sec });
  s += mapBox(p, 10, 80, 180, 126, [[0.22, 0.32, p.danger], [0.42, 0.5, p.danger], [0.6, 0.38, p.warning], [0.3, 0.7, p.success], [0.72, 0.66, p.danger], [0.5, 0.22, p.success], [0.83, 0.5, p.warning], [0.18, 0.55, p.danger]]);
  [[C.Pothole.c, 'Retakan/lubang'], [C.Erosion.c, 'Erosi permukaan'], [C.Normal.c, 'Normal']].forEach(([c, l], i) => { s += dot(14 + i * 60, 217, c) + t(19 + i * 60, 219.2, l, { size: 5.6, w: 500, fill: p.sec }); });
  s += t(10, 238, 'Laporan terbaru', { size: 8.5, w: 700, fill: p.text }) + t(190, 238, 'Lihat semua', { size: 6.5, w: 600, fill: p.accentText, anchor: 'end' });
  s += card(p, 10, 244, 180, 100);
  s += inspRow(p, 18, 246, 164, 'Pothole', 80, 'Jl. Teuku Umar, Kedaton', '3 Nov 2026, 09.10', false);
  s += inspRow(p, 18, 278, 164, 'Erosion', 48, 'Jl. Pagar Alam, Kedaton', '3 Nov 2026, 08.52', false);
  s += inspRow(p, 18, 310, 164, 'Normal', 95, 'Jl. Z.A. Pagar Alam, Rajabasa', '2 Nov 2026, 16.40', true);
  s += card(p, 10, 348, 180, 40);
  return s + tabbar(p, 0);
}

function camera() {
  const p = PAL.dark;
  let s = rect(0, 0, 200, 400, '#05080F');
  s += `<circle cx="24" cy="30" r="11" fill="rgba(255,255,255,0.14)"/><path d="M20,26 L28,34 M28,26 L20,34" stroke="#F8FAFC" stroke-width="1.4"/>`;
  s += rect(118, 21, 70, 18, 'rgba(255,255,255,0.14)', { r: 9 }) + dot(128, 30, p.success) + t(134, 32.2, 'GPS terkunci', { size: 6.5, w: 600, fill: '#F8FAFC' });
  s += photoFill(25, 48, 150, 200, 10);
  s += `<g stroke="${p.accent}" stroke-width="2" fill="none">
    <path d="M40,104 v-12 a6,6 0 0 1 6,-6 h12"/><path d="M142,86 h12 a6,6 0 0 1 6,6 v12"/>
    <path d="M160,194 v12 a6,6 0 0 1 -6,6 h-12"/><path d="M58,212 h-12 a6,6 0 0 1 -6,-6 v-12"/></g>`;
  s += t(100, 284, 'Arahkan ke permukaan jalan, pastikan cukup cahaya', { size: 6.2, fill: 'rgba(248,250,252,0.8)', anchor: 'middle' });
  s += `<circle cx="100" cy="326" r="19.5" fill="none" stroke="${p.accent}" stroke-width="2.5"/><circle cx="100" cy="326" r="15.5" fill="#FFFFFF"/>`;
  return s;
}

function result(p) {
  const m = CLS(p).Pothole;
  let s = t(14, 30, 'Tutup', { size: 7.5, w: 600, fill: p.accentText }) + t(100, 30, 'Hasil Analisis', { size: 8.5, w: 700, fill: p.text, anchor: 'middle' });
  s += photoFill(10, 42, 180, 104, 10);
  s += card(p, 10, 152, 180, 106) + rect(10, 152, 2.5, 106, m.c, { r: 1 });
  s += overline(20, 165, 'Klasifikasi', p) + t(20, 182, m.name, { size: 14, w: 800, fill: m.t }) + rect(126, 173, 56, 11, m.s, { r: 3 }) + t(154, 180.5, m.status, { size: 5.3, w: 700, fill: m.t, anchor: 'middle' });
  s += t(20, 199, 'Tingkat keyakinan model', { size: 6, w: 600, fill: p.sec }) + t(182, 199, '42.0%', { size: 6.2, w: 600, fill: p.text, anchor: 'end' }) + bar(20, 203, 162, 42, p, m.c);
  s += rect(20, 214, 162, 38, p.warningSoft, { r: 6 }) + t(26, 224, 'Hasil kurang yakin, sebaiknya foto ulang', { size: 6, w: 700, fill: p.warningText }) +
    t(26, 233, 'Keyakinan model di bawah 50%. Ambil foto lebih dekat ke', { size: 5, fill: p.text }) +
    t(26, 240, 'permukaan jalan, cukup terang, tidak buram, dan kerusakan', { size: 5, fill: p.text }) + t(26, 247, 'berada di tengah bingkai.', { size: 5, fill: p.text });
  s += card(p, 10, 263, 180, 64);
  [['Lokasi', 'Jl. Teuku Umar, Kedaton, Bandar Lampung'], ['Koordinat', '-5.392145, 105.256310'], ['Waktu', '3 Nov 2026, 09.10']].forEach(([l, v], i) => {
    const y = 263 + i * 21;
    s += t(18, y + 9, l, { size: 5.3, w: 500, fill: p.sec }) + t(18, y + 17, v, { size: 6.6, fill: p.text });
    if (i < 2) s += `<line x1="18" y1="${y + 21}" x2="182" y2="${y + 21}" stroke="${p.border}" stroke-width="0.5"/>`;
  });
  s += button(p, 10, 332, 180, 20, 'Lihat di peta', { variant: 'secondary', icon: 'pin' });
  s += rect(0, 358, 200, 42, p.bg) + `<line x1="0" y1="358" x2="200" y2="358" stroke="${p.border}" stroke-width="0.5"/>` + button(p, 10, 364, 180, 22, 'Foto ulang', { icon: 'cam' });
  return s;
}

function summary(p) {
  const C = CLS(p);
  let s = appBar(p) + titleBlock(p, 'Ringkasan', 'Statistik seluruh inspeksi');
  s += card(p, 10, 88, 180, 84, { fill: p.elevated }) + siger(146, 96, 40, p.heritageSoft);
  s += overline(20, 101, 'Total inspeksi', p) + t(20, 126, '15', { size: 23, w: 800, fill: p.text, ls: -0.4 });
  s += `<line x1="20" y1="136" x2="180" y2="136" stroke="${p.border}" stroke-width="0.5"/>`;
  [['11', 'Rusak', p.dangerText], ['4', 'Normal', p.successText], ['73%', 'Tingkat rusak', p.text]].forEach(([v, l, c], i) => {
    s += t(20 + i * 54, 152, v, { size: 10, w: 700, fill: c }) + t(20 + i * 54, 162, l, { size: 5.5, w: 500, fill: p.sec });
  });
  s += t(10, 190, 'Distribusi kondisi', { size: 8.5, w: 700, fill: p.text }) + card(p, 10, 196, 180, 132);
  [['Crack', 4], ['Pothole', 4], ['Erosion', 3], ['Normal', 4]].forEach(([k, n], i) => {
    const m = C[k], y = 206 + i * 31, pct = Math.round((n / 15) * 100);
    s += dot(21, y + 5, m.c) + t(27, y + 6.5, m.name, { size: 7, w: 600, fill: p.text }) + t(27, y + 13.5, m.status, { size: 5.3, w: 500, fill: p.sec }) +
      t(182, y + 7, `${n}  ${pct}%`, { size: 6.8, w: 600, fill: p.text, anchor: 'end' }) + bar(19, y + 18, 163, pct, p, m.c);
  });
  s += t(10, 339, 'Angka dihitung server dari seluruh inspeksi yang tersimpan.', { size: 5.2, w: 500, fill: p.sec }) + t(10, 346, 'Tarik layar ke bawah untuk memperbarui.', { size: 5.2, w: 500, fill: p.sec });
  return s + tabbar(p, 1);
}

function history(p) {
  let s = appBar(p) + titleBlock(p, 'Riwayat', 'Inspeksi dari lapangan');
  let cx = 10;
  ['Semua', 'Retakan', 'Lubang', 'Erosi permukaan', 'Normal'].forEach((l, i) => {
    const w = l.length * 3.6 + 14, on = i === 0;
    s += rect(cx, 88, w, 18, on ? p.accentSoft : p.surface, { r: 9, stroke: on ? p.accent : p.border, sw: on ? 0.8 : 0.5 }) + t(cx + w / 2, 99.5, l, { size: 6.3, w: 600, fill: on ? p.accentText : p.sec, anchor: 'middle' });
    cx += w + 4;
  });
  s += t(10, 118, 'Menampilkan 10 dari 10 inspeksi yang dimuat · total 15 di server', { size: 5.2, w: 500, fill: p.sec });
  s += card(p, 10, 123, 180, 228);
  const rows = [['Pothole', 80, 'Jl. Teuku Umar, Kedaton', '3 Nov 2026, 09.10'], ['Erosion', 48, 'Jl. Pagar Alam, Kedaton', '3 Nov 2026, 08.52'],
    ['Normal', 95, 'Jl. Z.A. Pagar Alam, Rajabasa', '2 Nov 2026, 16.40'], ['Crack', 79, 'Jl. Kartini, Tanjung Karang', '2 Nov 2026, 15.05'],
    ['Pothole', 76, 'Jl. Sultan Agung, Way Halim', '2 Nov 2026, 14.31'], ['Crack', 42, 'Jl. Ratu Dibalau, Way Kandis', '2 Nov 2026, 11.18'],
    ['Normal', 98, 'Jl. Raden Intan, Enggal', '1 Nov 2026, 10.02']];
  rows.forEach((r, i) => { s += inspRow(p, 18, 125 + i * 32, 164, r[0], r[1], r[2], r[3], i === rows.length - 1); });
  return s + tabbar(p, 2);
}

function detailSheet(p) {
  const m = CLS(p).Erosion;
  let s = history(p) + rect(0, 0, 200, 400, p.scrim);
  s += `<path d="M2,82 Q2,66 18,66 L182,66 Q198,66 198,82 L198,400 L2,400 z" fill="${p.surface}" stroke="${p.border}" stroke-width="0.5"/>` + rect(90, 71, 20, 2.5, p.border, { r: 1.2 });
  s += photoFill(10, 80, 180, 96, 8);
  s += t(10, 194, m.name, { size: 11, w: 800, fill: m.t }) + rect(10, 199, 54, 11, m.s, { r: 3 }) + dot(16, 204.5, m.c, 1.5) + t(20, 206.8, m.status, { size: 5.5, w: 700, fill: m.t });
  s += t(10, 224, 'Tingkat keyakinan model', { size: 6, w: 600, fill: p.sec }) + t(190, 224, '48.3%', { size: 6.2, w: 600, fill: p.text, anchor: 'end' }) + bar(10, 228, 180, 48.3, p, m.c);
  s += rect(10, 237, 180, 15, p.warningSoft, { r: 6 }) + t(16, 246.6, 'Keyakinan model di bawah 50%, hasil ini sebaiknya dicek ulang.', { size: 5, fill: p.text });
  [['Lokasi', 'Jl. Pagar Alam, Kedaton, Bandar Lampung'], ['Koordinat', '-5.381920, 105.244870'], ['Waktu foto', '3 Nov 2026, 08.52'], ['Waktu analisis', '3 Nov 2026, 08.52']].forEach(([l, v], i) => {
    const y = 256 + i * 21;
    s += t(10, y + 9, l, { size: 5.3, w: 500, fill: p.sec }) + t(10, y + 17, v, { size: 6.6, fill: p.text });
    if (i < 3) s += `<line x1="10" y1="${y + 21}" x2="190" y2="${y + 21}" stroke="${p.border}" stroke-width="0.5"/>`;
  });
  s += button(p, 10, 345, 180, 20, 'Lihat di peta', { variant: 'secondary', icon: 'pin' }) + button(p, 10, 369, 180, 18, 'Tutup', { variant: 'ghost' });
  return s;
}

function settings(p) {
  let s = homeTop(p) + rect(0, 0, 200, 400, p.scrim);
  s += `<path d="M2,72 Q2,56 18,56 L182,56 Q198,56 198,72 L198,400 L2,400 z" fill="${p.surface}" stroke="${p.border}" stroke-width="0.5"/>` + rect(90, 61, 20, 2.5, p.border, { r: 1.2 });
  s += t(12, 84, 'Pengaturan', { size: 11, w: 800, fill: p.text });
  s += overline(12, 101, 'Akun', p) + `<circle cx="22" cy="117" r="9" fill="${p.accentSoft}"/>` + t(22, 120, 'P', { size: 8, w: 800, fill: p.accentText, anchor: 'middle' }) +
    t(36, 115, 'petugas_kedaton', { size: 8, w: 700, fill: p.text }) + t(36, 123, 'Masuk dengan token RoadPulse', { size: 5, w: 500, fill: p.sec });
  s += rect(12, 131, 176, 20, p.elevated, { r: 8, stroke: p.border, sw: 0.5 }) + t(100, 143.6, 'Keluar', { size: 7.5, w: 600, fill: p.dangerText, anchor: 'middle' });
  s += '<g transform="translate(0,62)">';
  s += overline(12, 101, 'Tampilan', p) + t(12, 111, 'Tema aplikasi', { size: 8, w: 700, fill: p.text }) +
    t(12, 119, '"Sistem" mengikuti mode terang/gelap perangkat.', { size: 4.8, w: 500, fill: p.sec }) + t(12, 122.5 + 2, 'Pilihan disimpan di perangkat ini.', { size: 4.8, w: 500, fill: p.sec });
  s += rect(12, 128, 176, 22, p.elevated, { r: 6 });
  ['Sistem', 'Terang', 'Gelap'].forEach((l, i) => {
    const on = i === 0, x = 13.5 + i * 58;
    if (on) s += rect(x, 129.5, 57, 19, p.surface, { r: 4, stroke: p.border, sw: 0.5 });
    s += t(x + 28.5, 141.5, l, { size: 6.5, w: 600, fill: on ? p.text : p.sec, anchor: 'middle' });
  });
  s += overline(12, 164, 'Koneksi', p) + t(12, 174, 'Server backend', { size: 8, w: 700, fill: p.text }) +
    t(12, 183, 'Isi dengan IP LAN komputer yang menjalankan proxy RoadPulse (port 8000).', { size: 4.8, w: 500, fill: p.sec }) +
    t(12, 190, 'Di HP fisik jangan pakai localhost; HP dan komputer harus satu jaringan Wi-Fi.', { size: 4.8, w: 500, fill: p.sec });
  s += dot(15, 200, p.success) + t(20, 202, 'Terhubung ke http://192.168.1.10:8000', { size: 6.2, w: 600, fill: p.text });
  s += rect(12, 208, 176, 24, p.elevated, { r: 6, stroke: p.border, sw: 0.5 }) + t(20, 223, 'http://192.168.1.10:8000', { size: 7.5, fill: p.text });
  s += button(p, 12, 237, 176, 22, 'Simpan & hubungkan');
  s += overline(12, 277, 'Tentang', p);
  [['Aplikasi', 'RoadPulse · Smart Mobility Intelligence'], ['Versi', '1.0.0'], ['Wilayah', 'Lampung, Indonesia']].forEach(([l, v], i) => {
    s += t(12, 290 + i * 11, l, { size: 5.6, w: 500, fill: p.sec }) + t(188, 290 + i * 11, v, { size: 5.6, w: 500, fill: p.text, anchor: 'end' });
  });
  s += t(12, 326, 'Foto Menara Siger, Bakauheni, Lampung Selatan: Sakurai Midori,', { size: 4.8, w: 500, fill: p.sec }) +
    t(12, 333, 'Wikimedia Commons, CC BY 2.5 (dipotong). Ornamen Siger & motif', { size: 4.8, w: 500, fill: p.sec }) +
    t(12, 340, 'Tapis digambar ulang untuk aplikasi ini.', { size: 4.8, w: 500, fill: p.sec });
  s += tapis(46, 352, 18, 2.2, 3.8, p.heritage, 0.4) + t(100, 377, 'Tutup', { size: 7.5, w: 600, fill: p.sec, anchor: 'middle' });
  return s + '</g>';
}


// Layar masuk/daftar: video lalu lintas kota (cadangan foto Menara Siger) + overlay hijau gelap
const HERO = { bg: '#0A1E1A', text: '#EDF3F7', sec: 'rgba(226,234,244,0.8)', word: '#9FD8C6', eyebrow: '#A8C0C8' };
function heroBackdrop(id) {
  let s = rect(0, 0, 200, 400, '#1D3A35');
  // siluet jalan & kendaraan dari video udara
  s += `<path d="M-10,250 L210,150 L210,190 L-10,300 z" fill="#2B4A44"/><path d="M60,-10 L120,-10 L80,410 L20,410 z" fill="#284540"/>`;
  [[30, 262, '#E9C46A'], [70, 244, '#E76F51'], [130, 214, '#F4F1DE'], [168, 196, '#E9C46A'], [92, 120, '#F4F1DE'], [70, 300, '#E76F51']].forEach(([x, y, c]) => { s += rect(x, y, 6, 3.4, c, { r: 1 }); });
  s += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(10,30,26)" stop-opacity="0.5"/><stop offset="1" stop-color="rgb(10,30,26)" stop-opacity="0.92"/></linearGradient></defs>`;
  return s + rect(0, 0, 200, 400, `url(#${id})`);
}
function field(p, x, y, w, label, value, { placeholder = false, focus = false, eye = false, err = '', help = '' } = {}) {
  let s = overline(x, y, label, p) + rect(x, y + 4, w, 22, focus ? p.surface : p.elevated, { r: 7, stroke: err ? p.danger : focus ? p.accent : undefined, sw: 0.9 });
  s += dot(x + 9, y + 15, placeholder ? p.sec : p.accentText, 2.2) + t(x + 17, y + 17.5, value, { size: 6.5, w: placeholder ? 400 : 600, fill: placeholder ? p.sec : p.text });
  if (eye) s += `<ellipse cx="${x + w - 10}" cy="${y + 15}" rx="4.5" ry="2.8" fill="none" stroke="${p.sec}" stroke-width="0.8"/>` + dot(x + w - 10, y + 15, p.sec, 1.1);
  if (err) s += t(x, y + 33, err, { size: 5, w: 600, fill: p.dangerText });
  else if (help) s += t(x, y + 33, help, { size: 5, w: 500, fill: p.sec });
  return s;
}
function authTabs(p, x, y, w, reg) {
  return rect(x, y, w, 20, p.elevated, { r: 7 }) + rect(reg ? x + w / 2 : x + 2, y + 2, w / 2 - 2, 16, p.accent, { r: 6 }) +
    t(x + w / 4, y + 12.8, 'Masuk', { size: 7, w: 700, fill: reg ? p.sec : p.onAccent, anchor: 'middle' }) +
    t(x + w * 3 / 4, y + 12.8, 'Daftar', { size: 7, w: 700, fill: reg ? p.onAccent : p.sec, anchor: 'middle' });
}
function loginScreen(p) {
  let s = heroBackdrop('hg1');
  s += rect(10, 14, 21, 21, '#EDF8F3', { r: 6 }) + siger(13.5, 19, 14, '#234D44') +
    t(36, 23, 'RoadPulse', { size: 9, w: 800, fill: HERO.text }) + t(36, 30.5, 'BANDAR LAMPUNG', { size: 4.6, w: 600, fill: HERO.eyebrow, ls: 0.8 });
  s += rect(128, 16, 40, 17, 'rgba(255,255,255,0.12)', { r: 8.5, stroke: 'rgba(255,255,255,0.25)', sw: 0.5 }) + dot(136, 24.5, p.success) + t(141, 26.8, 'Online', { size: 6, w: 700, fill: HERO.text });
  s += `<circle cx="181" cy="24.5" r="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>` + gear(181, 24.5, HERO.text);
  s += t(12, 56, 'KOTA BANDAR LAMPUNG', { size: 5, w: 700, fill: HERO.eyebrow, ls: 1.2 });
  s += t(12, 77, 'Kondisi', { size: 20, w: 900, fill: HERO.text, ls: -1 }) + t(12, 97, 'jalan rusak', { size: 20, w: 900, fill: HERO.word, ls: -1 }) +
    `<circle cx="133" cy="91" r="5" fill="rgba(170,187,198,0.6)" stroke="rgba(170,187,198,0.15)" stroke-width="3"/>` +
    t(12, 117, 'di Bandar Lampung.', { size: 20, w: 900, fill: HERO.text, ls: -1 });
  s += rect(12, 125, 112, 14, 'rgba(255,255,255,0.12)', { r: 7, stroke: 'rgba(255,255,255,0.2)', sw: 0.5 }) + t(19, 134.3, 'Lampung • Smart Road Monitoring', { size: 5.6, w: 500, fill: '#FFFFFF' });
  s += t(12, 151, 'Deteksi retakan, lubang, dan erosi permukaan jalan secara', { size: 5.6, fill: HERO.sec }) + t(12, 159, 'otomatis dari foto lapangan.', { size: 5.6, fill: HERO.sec });
  s += rect(8, 168, 184, 196, p.surface, { r: 14, stroke: p.border, sw: 0.5 }) + authTabs(p, 18, 178, 164, false);
  s += t(18, 214, 'Tabik Pun! 👋', { size: 12, w: 800, fill: p.text }) + t(18, 224, 'Masuk untuk mulai memantau kondisi jalan Lampung.', { size: 5.6, fill: p.sec });
  s += field(p, 18, 238, 164, 'Username', 'petugas_kedaton', { focus: true });
  s += field(p, 18, 272, 164, 'Kata sandi', '••••••••••', { eye: true });
  s += button(p, 18, 308, 164, 24, 'Masuk');
  s += t(100, 348, 'Belum punya akun?', { size: 6, fill: p.sec, anchor: 'end' }) + t(102, 348, 'Daftar sekarang', { size: 6, w: 700, fill: p.accentText });
  s += tapis(56, 375, 14, 2.2, 4, '#D4A537', 0.45) + t(100, 391, 'Footage: Marc Espejo / Pexels · Foto Menara Siger: Sakurai Midori, CC BY 2.5', { size: 3.9, fill: 'rgba(255,255,255,0.65)', anchor: 'middle' });
  return s;
}
function registerScreen(p) {
  // posisi setelah digulir: kartu daftar penuh
  let s = heroBackdrop('hg2');
  s += t(12, 22, 'di Bandar Lampung.', { size: 20, w: 900, fill: HERO.text, ls: -1 }) +
    t(12, 40, 'Deteksi retakan, lubang, dan erosi permukaan jalan secara', { size: 5.6, fill: HERO.sec }) + t(12, 48, 'otomatis dari foto lapangan.', { size: 5.6, fill: HERO.sec });
  s += rect(8, 58, 184, 330, p.surface, { r: 14, stroke: p.border, sw: 0.5 }) + authTabs(p, 18, 68, 164, true);
  s += t(18, 104, 'Buat akun baru', { size: 12, w: 800, fill: p.text }) + t(18, 114, 'Gratis untuk petugas & warga yang ingin melaporkan jalan rusak.', { size: 5.2, fill: p.sec });
  s += field(p, 18, 128, 164, 'Username', 'petugas_kedaton', { help: '3–30 karakter: huruf, angka, titik, atau garis bawah.' });
  s += field(p, 18, 172, 164, 'Kata sandi', '••••••••••••', { eye: true });
  [1, 2, 3, 4].forEach((i) => { s += rect(18 + (i - 1) * 41.5, 204, 39, 2.5, i <= 3 ? p.success : p.elevated, { r: 1.2 }); });
  s += t(18, 214, 'Kekuatan: ', { size: 5, fill: p.sec }) + t(43, 214, 'Kuat', { size: 5, w: 700, fill: p.successText });
  s += field(p, 18, 224, 164, 'Ulangi kata sandi', '••••••••••••', { focus: true, help: '✓ Kata sandi cocok' });
  s += button(p, 18, 268, 164, 24, 'Daftar & masuk');
  s += t(100, 308, 'Sudah punya akun?', { size: 6, fill: p.sec, anchor: 'end' }) + t(102, 308, 'Masuk di sini', { size: 6, w: 700, fill: p.accentText });
  s += rect(18, 322, 164, 30, p.dangerSoft, { r: 6 }) + dot(25, 331, p.danger) + t(31, 333, 'Contoh pesan dari server bila gagal:', { size: 5, w: 700, fill: p.text }) +
    t(31, 342, '"Username sudah dipakai. Coba yang lain."', { size: 5, fill: p.text });
  return s;
}

function mobileScreens() {
  const D = PAL.dark, L = PAL.light;
  return [
    phone('M1 · Beranda (status & ringkasan)', homeTop(D), D),
    phone('M2 · Beranda (peta & laporan terbaru)', homeLower(D), D),
    phone('M3 · Kamera', camera(), D),
    phone('M4 · Hasil Analisis (keyakinan rendah)', result(D), D),
    phone('M5 · Tab Ringkasan', summary(D), D),
    phone('M6 · Tab Riwayat (filter kelas)', history(D), D),
    phone('M7 · Detail inspeksi', detailSheet(D), D),
    phone('M8 · Pengaturan (akun, tema & server)', settings(D), D),
    phone('M9 · Beranda, tema Terang', homeTop(L), L),
  ];
}

function authScreens() {
  const D = PAL.dark;
  return [phone('M0a · Masuk', loginScreen(D), D), phone('M0b · Daftar akun baru', registerScreen(D), D)];
}

module.exports = { architecture, actors, loginFlow, reportFlow, adminFlow, errorFlow, mobileScreens, authScreens };
