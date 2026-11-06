// Design tokens RoadPulse — Lampung Edition (Dark Enterprise Intelligence).
// Semua warna, jarak, radius, dan tipografi diambil dari sini; layar tidak boleh menulis hex sendiri.

const brand = {
  emerald: '#20C997', // aksen utama
  emeraldStrong: '#087A5B', // varian teks/ikon di tema terang (kontras ≥ 4.5:1 terhadap putih)
  onEmerald: '#04241C', // teks di atas latar emerald
  siger: '#D4A537', // emas Siger/Tapis — aksen regional, dipakai sangat terbatas
};

const semantic = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const dark = {
  bg: '#101827',
  surface: '#1C293B',
  elevated: '#243247',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  accent: brand.emerald,
  accentText: brand.emerald,
  accentSoft: alpha(brand.emerald, 0.14),
  onAccent: brand.onEmerald,
  heritage: brand.siger,
  heritageSoft: alpha(brand.siger, 0.16),
  scrim: 'rgba(5, 9, 18, 0.62)',
  heroOverlay: 'rgba(16, 24, 39, 0.55)',
  heroFade: 'rgba(16, 24, 39, 0.92)',
  skeleton: '#2A3A52',
  successText: semantic.success,
  warningText: semantic.warning,
  dangerText: '#F87171',
  infoText: '#60A5FA',
  // Tile OpenStreetMap digelapkan dengan filter CSS (provider tetap sama)
  mapTileFilter: 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.55)',
};

const light = {
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  elevated: '#EEF2F7',
  text: '#172033',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  accent: brand.emerald,
  accentText: brand.emeraldStrong,
  accentSoft: alpha(brand.emerald, 0.12),
  onAccent: brand.onEmerald,
  heritage: '#A97C14',
  heritageSoft: alpha(brand.siger, 0.14),
  scrim: 'rgba(15, 23, 42, 0.45)',
  heroOverlay: 'rgba(16, 24, 39, 0.45)',
  heroFade: 'rgba(16, 24, 39, 0.88)',
  skeleton: '#E2E8F0',
  successText: '#15803D',
  warningText: '#B45309',
  dangerText: '#DC2626',
  infoText: '#2563EB',
  mapTileFilter: 'none',
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999 };

export const type = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  heading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  overline: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  metric: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
};

// Ukuran sentuh minimum (iOS HIG 44pt, Material 48dp)
export const touch = { min: 44 };

export function buildTheme(scheme) {
  const c = scheme === 'light' ? light : dark;
  return {
    scheme,
    dark: scheme !== 'light',
    colors: {
      ...c,
      ...semantic,
      successSoft: alpha(semantic.success, scheme === 'light' ? 0.12 : 0.16),
      warningSoft: alpha(semantic.warning, scheme === 'light' ? 0.14 : 0.16),
      dangerSoft: alpha(semantic.danger, scheme === 'light' ? 0.1 : 0.16),
      infoSoft: alpha(semantic.info, scheme === 'light' ? 0.1 : 0.16),
      white: '#FFFFFF',
      black: '#000000',
      camera: '#05080F',
      // Teks di atas foto (kartu hero selalu bernuansa gelap karena overlay)
      heroText: '#F8FAFC',
      heroTextSecondary: 'rgba(248, 250, 252, 0.8)',
      heroAccent: '#F2D27A',
      heroChip: 'rgba(0, 0, 0, 0.38)',
      cameraChip: 'rgba(255, 255, 255, 0.14)',
    },
    spacing,
    radius,
    type,
    touch,
  };
}

// Label & tingkat keparahan per kelas API (kontrak API tetap memakai nama Inggris)
export const CLASS_KEYS = ['Crack', 'Pothole', 'Surface Erosion', 'Normal'];

export function classMeta(label, theme) {
  const c = theme.colors;
  const table = {
    Crack: { name: 'Retakan', status: 'Perlu perbaikan', color: c.danger, text: c.dangerText, soft: c.dangerSoft },
    Pothole: { name: 'Lubang', status: 'Perlu perbaikan', color: c.danger, text: c.dangerText, soft: c.dangerSoft },
    'Surface Erosion': { name: 'Erosi permukaan', status: 'Perlu dipantau', color: c.warning, text: c.warningText, soft: c.warningSoft },
    Normal: { name: 'Normal', status: 'Kondisi baik', color: c.success, text: c.successText, soft: c.successSoft },
  };
  if (table[label]) return table[label];
  const l = (label || '').toLowerCase();
  if (l.includes('pothole')) return table.Pothole;
  if (l.includes('crack')) return table.Crack;
  if (l.includes('erosion') || l.includes('surface')) return table['Surface Erosion'];
  if (l.includes('normal')) return table.Normal;
  return { name: label || '-', status: '', color: c.textSecondary, text: c.textSecondary, soft: c.elevated };
}
