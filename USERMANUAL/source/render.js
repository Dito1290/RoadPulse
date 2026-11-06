// Cetak manual.html ke PDF dengan Chrome headless (mode CLI --print-to-pdf).
// Dua tahap: tahap 1 mencari halaman tiap judul untuk daftar isi, tahap 2 mencetak final.
// Pemakaian (dari folder ini): node render.js [../USERMANUAL_RoadPulse.pdf]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const DIR = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(DIR, '..', 'USERMANUAL_RoadPulse.pdf'));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Screenshot asli (PNG) di img/ → versi cetak JPEG ≤ 1600 px di img_print/ (pakai sips bawaan macOS)
function preparePrintImages() {
  const src = path.join(DIR, 'img'), dst = path.join(DIR, 'img_print');
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((n) => n.endsWith('.png'))) {
    const out = path.join(dst, f.replace(/\.png$/, '.jpg'));
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(path.join(src, f)).mtimeMs) continue;
    execFileSync('sips', ['-Z', '1600', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', path.join(src, f), '--out', out], { stdio: 'ignore' });
  }
}

function printPdf(file) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'roadpulse-manual-'));
  // --virtual-time-budget: tunggu semua gambar/font selesai; tanpa ini Chrome 156 bisa macet saat mencetak
  spawnSync(CHROME, ['--headless=new', `--user-data-dir=${profile}`, '--no-pdf-header-footer',
    '--virtual-time-budget=15000', `--print-to-pdf=${file}`, 'file://' + path.join(DIR, 'manual.html')],
  { timeout: 180000, stdio: 'ignore' });
  if (!fs.existsSync(file) || fs.statSync(file).size < 10000) throw new Error('PDF gagal dibuat: ' + file);
}

function pageTexts(file) {
  const out = execFileSync('osascript', ['-l', 'JavaScript', path.join(DIR, 'pdftext.js'), file], { maxBuffer: 64 * 1024 * 1024 }).toString();
  return out.split(/\n=== page \d+ ===\n/).slice(1);
}

preparePrintImages();
const tmp = OUT.replace(/\.pdf$/, '.pass1.pdf');
execFileSync('node', [path.join(DIR, 'build.js')], { stdio: 'inherit' });
printPdf(tmp);
const pages = pageTexts(tmp);
const toc = JSON.parse(fs.readFileSync(path.join(DIR, 'toc_entries.json')));
const tocIdx = pages.findIndex((t) => t.includes('Daftar Isi'));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const map = {};
let from = 1; // lewati cover
for (const [, id, title] of toc) {
  const needle = norm(title);
  for (let i = from; i < pages.length; i++) {
    if (i === tocIdx) continue;
    // judul harus berada di awal baris, agar rujukan di dalam paragraf tidak ikut cocok
    if (pages[i].split('\n').some((line) => norm(line).replace(/^ROADPULSE · USER MANUAL /i, '').startsWith(needle))) { map[id] = i + 1; from = i; break; }
  }
  if (!map[id]) console.warn('TOC: judul tidak ditemukan di PDF:', title);
}
fs.writeFileSync(path.join(DIR, 'toc_pages.json'), JSON.stringify(map));
execFileSync('node', [path.join(DIR, 'build.js'), path.join(DIR, 'toc_pages.json')], { stdio: 'inherit' });
printPdf(OUT);
fs.unlinkSync(tmp);
console.log('PDF:', OUT, '| halaman:', pageTexts(OUT).length);
