# Design System Mobile — RoadPulse Lampung Edition

Sumber kebenaran: `mobile/theme/tokens.js`. Layar dan komponen **tidak** menulis kode warna sendiri (diverifikasi dengan pencarian `#hex`/`rgba(` di luar `tokens.js`: 0 hasil).

## 1. Warna

### Brand & semantik
| Token | Nilai | Pemakaian |
|---|---|---|
| `accent` (Emerald) | `#20C997` | Tombol utama, tab aktif, bingkai kamera, indikator |
| `onAccent` | `#04241C` | Teks/ikon di atas emerald (7,74:1) |
| `accentText` | gelap `#20C997` · terang `#087A5B` | Teks/ikon aksen di atas permukaan |
| `heritage` | gelap `#D4A537` · terang `#A97C14` | Ornamen Siger & motif Tapis (opasitas rendah) |
| `success` / `warning` / `danger` / `info` | `#22C55E` / `#F59E0B` / `#EF4444` / `#3B82F6` | Titik status, bar distribusi, aksen kartu |
| `*Text` (semantik) | gelap: success/warning asli, danger `#F87171` · terang: `#15803D` / `#B45309` / `#DC2626` | Teks semantik agar lolos kontras |
| `*Soft` | rgba semantik 10–16 % | Latar badge & kotak peringatan |

### Tema
| Token | Gelap | Terang |
|---|---|---|
| `bg` | `#101827` | `#F5F7FA` |
| `surface` | `#1C293B` | `#FFFFFF` |
| `elevated` | `#243247` | `#EEF2F7` |
| `text` | `#F8FAFC` | `#172033` |
| `textSecondary` | `#94A3B8` | `#64748B` |
| `border` | `#334155` | `#E2E8F0` |

Token khusus foto/kamera (sama di kedua tema karena latarnya selalu gelap): `heroText`, `heroTextSecondary`, `heroAccent`, `heroChip`, `cameraChip`, `camera`.

### Kontras (WCAG 2.1, dihitung)
| Pasangan | Rasio |
|---|---|
| Gelap: text/bg | 16,98:1 |
| Gelap: textSecondary/surface | 5,73:1 |
| Gelap: accent/surface | 6,90:1 |
| Gelap: dangerText / warning / success di surface | 5,31 / 6,84 / 6,45 |
| Terang: text/bg | 15,16:1 |
| Terang: textSecondary/surface | 4,76:1 |
| Terang: accentText `#087A5B` di surface / bg / elevated | 5,32 / 4,96 / 4,73 |
| Terang: danger / warning / success text di surface | 4,83 / 5,02 / 5,02 |

`#20C997` di atas putih hanya 2,13:1, sehingga di tema terang tidak dipakai untuk teks — hanya untuk isian tombol (dengan teks `onAccent`).

## 2. Tipografi (font sistem: SF Pro / Roboto)
| Token | Ukuran/berat | Contoh |
|---|---|---|
| `display` | 28 / 800 | Judul tab, nama kelas hasil |
| `title` | 22 / 800 | Judul kartu sambutan, sheet |
| `heading` | 17 / 700 | Judul seksi |
| `body` / `bodyStrong` | 15 / 400–600 | Teks isi |
| `label` | 13 / 600 | Tombol kecil, status |
| `caption` | 12 / 500 | Metadata, waktu |
| `overline` | 11 / 700, huruf kapital, spasi 1,2 | Label kategori |
| `metric` | 30 / 800, angka tabular | KPI |

## 3. Ruang, radius, sentuh
- Spacing: 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32.
- Radius: 8 · 12 · 16 · 20 · 28 · pill.
- Target sentuh minimum 44 pt (`touch.min`); tombol utama tinggi 52.

## 4. Komponen (`components/`)
| Komponen | Fungsi |
|---|---|
| `Card` | Permukaan dengan border tipis |
| `Button` (primary/secondary/ghost) | Tombol dengan status loading/disabled & label aksesibilitas |
| `IconButton` | Tombol ikon 44 pt |
| `ClassBadge`, `Badge`, `StatusDot` | Label kelas/status |
| `SectionHeader`, `Overline` | Hierarki teks |
| `ProgressBar`, `Skeleton`, `EmptyState` | Data, loading, kosong |
| `Segmented` | Pemilih tema (radiogroup) |
| `DetailRow` | Pasangan label-nilai |
| `InspectionRow`, `InspectionDetailSheet` | Baris & detail inspeksi |
| `SigerCrown`, `TapisLine` | Ornamen Lampung (digambar dengan View) |
| Ikon | Kamera, grafik, daftar, rumah, tutup, gerigi, pin, chevron — tanpa library ikon |

## 5. Pemetaan kelas
| API | Label | Status | Warna |
|---|---|---|---|
| Crack | Retakan | Perlu perbaikan | danger |
| Pothole | Lubang | Perlu perbaikan | danger |
| Surface Erosion | Erosi permukaan | Perlu dipantau | warning |
| Normal | Normal | Kondisi baik | success |

## 6. Tema adaptif
- Preferensi `system | light | dark` di `ThemeContext`, disimpan di AsyncStorage (`roadpulse:theme-preference`).
- "Sistem" memakai `useColorScheme()`; `app.json` `userInterfaceStyle: "automatic"` agar perangkat melaporkan mode gelap/terang.
- Status bar, keyboard (`keyboardAppearance`), RefreshControl, modal, dan badge mengikuti tema. Kamera selalu gelap.
