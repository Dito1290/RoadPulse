// Membuat USERMANUAL_RoadPulse.docx dari manual.html (isi sama dengan PDF).
// Pemakaian (dari folder ini): node docx.js [../USERMANUAL_RoadPulse.docx]
// Butuh: npm install docx@9 node-html-parser@6 image-size@1  (lihat package.json di folder ini)
// Diagram SVG & ilustrasi HP diubah menjadi PNG lewat Chrome headless (cdp.js).
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const sizeOf = require('image-size');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
  AlignmentType, LevelFormat, BorderStyle, Footer, Header, PageNumber, TableOfContents, PageBreak, VerticalAlign,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
} = require('docx');
const { launch } = require('./cdp');

const DIR = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(DIR, '..', 'USERMANUAL_RoadPulse.docx'));
const RASTER = path.join(DIR, 'img_docx');
const FONT = 'Calibri', MONO = 'Consolas';
const C = { ink: '17262B', soft: '5D6B72', green: '1E6B5A', head: '1E3A33', line: 'D3DBDF', code: 'F2F4F6', zebra: 'F7F9FA' };
const NOTE = { info: ['E6F2EE', '1E6B5A'], warn: ['FFF4DC', 'C9971C'], danger: ['FBE9E7', 'A33A3A'] };
const BADGE = { ok: ['DDF3E6', '1D6B3F'], warn: ['FFF0CC', '8A5A00'], no: ['FBE3E1', '9E2F2F'], pend: ['E3ECFA', '2F4F8F'] };
const PAGE_W = 11906, MARGIN = 1134, CONTENT = PAGE_W - 2 * MARGIN; // A4, margin 2 cm
const PX = CONTENT / 15; // lebar isi dalam piksel (1 px = 15 DXA)

// ── 1. Diagram SVG & ilustrasi HP → PNG ─────────────────────
async function rasterize() {
  fs.mkdirSync(RASTER, { recursive: true });
  const prof = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rp-docx-'));
  const b = await launch(prof, 9355);
  const p = await b.newPage(await b.newContext(), { width: 820, height: 1200, scale: 2.5 });
  await p.goto('file://' + path.join(DIR, 'manual.html'), 3000);
  const n = await p.eval(`(() => { const els = [...document.querySelectorAll('figure.diagram > svg, div.phones')];
    els.forEach((e, i) => e.setAttribute('data-rx', i)); return els.length; })()`);
  for (let i = 0; i < n; i++) await p.shot(path.join(RASTER, `r${i}.png`), `[data-rx="${i}"]`, 4);
  await b.close();
  return n;
}

// ── 2. Helper docx ─────────────────────────────────────────
let numSeq = 0;
const numbering = [{
  reference: 'bullets',
  levels: [0, 1].map((level) => ({ level, format: LevelFormat.BULLET, text: level ? '–' : '•', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 + level * 360, hanging: 240 } } } })),
}];
const newList = () => {
  const ref = `ol${++numSeq}`;
  numbering.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 380, hanging: 280 } } } }] });
  return ref;
};
const RTAB = () => new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.NONE });
const border = (color = C.line, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

function imageRun(file, widthPx) {
  const data = fs.readFileSync(file);
  const { width, height } = sizeOf(data);
  const w = Math.round(Math.min(widthPx, PX));
  return new ImageRun({ type: path.extname(file).slice(1).replace('jpeg', 'jpg'), data, transformation: { width: w, height: Math.round((w * height) / width) } });
}

// ── 3. Inline: teks, tebal, miring, kode, badge ─────────────
const isBlock = (n) => n.nodeType === 1 && /^(p|div|ol|ul|table|pre|figure|figcaption|h1|h2|h3|section|caption)$/i.test(n.rawTagName || '');
function inline(node, st = {}) {
  if (node.nodeType === 3) {
    const t = node.text.replace(/\s+/g, ' ');
    return t ? [new TextRun({ text: t, ...st })] : [];
  }
  if (node.nodeType !== 1) return [];
  const tag = (node.rawTagName || '').toLowerCase();
  const cls = node.getAttribute('class') || '';
  const kids = (s) => node.childNodes.flatMap((c) => inline(c, s));
  if (tag === 'br') return [new TextRun({ break: 1 })];
  if (tag === 'b' || tag === 'strong') return kids({ ...st, bold: true });
  if (tag === 'i' || tag === 'em') return kids({ ...st, italics: true });
  if (tag === 'code') return kids({ ...st, font: MONO, size: (st.size || 20) - 2, color: st.color || '0B4F6C' });
  if (tag === 'span' && cls.startsWith('badge')) {
    const [fill, color] = BADGE[cls.split(' ')[1]] || BADGE.pend;
    return kids({ ...st, bold: true, size: 16, color, shading: { type: ShadingType.CLEAR, color: 'auto', fill } });
  }
  if (tag === 'span' && cls.startsWith('dot')) return [new TextRun({ text: '●', color: cls.includes('g') ? '398B70' : 'CE665D', ...st })];
  if (tag === 'svg' || tag === 'img') return [];
  return kids(st);
}

// ── 4. Blok ─────────────────────────────────────────────────
const ctx = { raster: 0, firstH1: true };
const para = (children, opt = {}) => new Paragraph({ children, spacing: { after: 110, line: 276 }, ...opt });

function blocks(node, opt = {}) {
  const out = [];
  let buf = [];
  const flush = () => {
    const text = buf.map((n) => n.text).join('').trim();
    if (text) out.push(para(buf.flatMap((n) => inline(n, opt.run || {})), opt.para || {}));
    buf = [];
  };
  for (const n of node.childNodes) {
    if (!isBlock(n)) { buf.push(n); continue; }
    flush();
    out.push(...block(n, opt));
  }
  flush();
  return out;
}

function caption(node, prefixStyle = {}) {
  return para(inline(node, { size: 18, color: C.soft, ...prefixStyle }), { alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, keepLines: true });
}

function figureBlock(node, widthPx = PX) {
  const out = [];
  const cls = node.getAttribute('class') || '';
  const img = node.querySelector('img');
  let w = widthPx;
  if (img) {
    const m = /width:\s*(\d+)%/.exec(img.getAttribute('style') || '');
    if (m) w = (widthPx * Number(m[1])) / 100;
    const src = path.join(DIR, img.getAttribute('src'));
    out.push(para([imageRun(src, w)], { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 } }));
  } else if (cls.includes('diagram')) {
    if (cls.includes('half')) w = widthPx * 0.62;
    out.push(para([imageRun(path.join(RASTER, `r${ctx.raster++}.png`), w)], { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 } }));
  }
  const cap = node.querySelector('figcaption');
  if (cap) out.push(caption(cap));
  return out;
}

function tableBlock(node, widthDxa = CONTENT) {
  const out = [];
  const cap = node.querySelector('caption');
  if (cap) out.push(para(inline(cap, { size: 19, color: C.soft }), { keepNext: true, spacing: { before: 160, after: 60 } }));
  const cols = node.querySelectorAll('col').map((c) => parseFloat((/width:\s*([\d.]+)%/.exec(c.getAttribute('style') || '') || [])[1]));
  const rowsEl = node.querySelectorAll('tr').filter((tr) => tr.closest('table') === node);
  const ncol = Math.max(...rowsEl.map((r) => r.childNodes.filter((c) => /^(td|th)$/i.test(c.rawTagName || '')).length));
  let ratios = cols.length === ncol && cols.every((x) => x > 0) ? cols : Array(ncol).fill(100 / ncol);
  const sum = ratios.reduce((a, b) => a + b, 0);
  const widths = ratios.map((r) => Math.floor((widthDxa * r) / sum));
  widths[widths.length - 1] = widthDxa - widths.slice(0, -1).reduce((a, b) => a + b, 0);
  const kv = (node.getAttribute('class') || '').includes('kv');
  let bodyRow = 0;
  const rows = rowsEl.map((tr) => {
    const cells = tr.childNodes.filter((c) => /^(td|th)$/i.test(c.rawTagName || ''));
    const isHead = cells.every((c) => c.rawTagName.toLowerCase() === 'th');
    const zebra = !isHead && bodyRow++ % 2 === 1;
    return new TableRow({
      tableHeader: isHead, cantSplit: false,
      children: cells.map((c, i) => {
        const first = kv && i === 0 && !isHead;
        const content = blocks(c, {
          run: isHead ? { bold: true, color: 'FFFFFF', size: 18 } : first ? { bold: true, size: 18, color: C.head } : { size: 18 },
          para: { spacing: { after: 40, line: 252 } },
        });
        return new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 60, bottom: 60, left: 90, right: 90 },
          shading: isHead ? { type: ShadingType.CLEAR, color: 'auto', fill: C.head }
            : first ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF4F2' }
              : zebra ? { type: ShadingType.CLEAR, color: 'auto', fill: C.zebra } : undefined,
          children: content.length ? content : [new Paragraph({ children: [] })],
        });
      }),
    });
  });
  out.push(new Table({
    width: { size: widthDxa, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: border(), bottom: border(), left: border(), right: border(), insideHorizontal: border(), insideVertical: border() },
    rows,
  }));
  out.push(new Paragraph({ children: [], spacing: { after: 80 } }));
  return out;
}

function block(n, opt = {}) {
  const tag = (n.rawTagName || '').toLowerCase();
  const cls = n.getAttribute('class') || '';
  switch (tag) {
    case 'h1': {
      const text = n.text.replace(/\s+/g, ' ').trim();
      const first = ctx.firstH1; ctx.firstH1 = false;
      return [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], pageBreakBefore: !first })];
    }
    case 'h2': case 'h3':
      return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(n.text.replace(/\s+/g, ' ').trim())] })];
    case 'p':
      if (cls.includes('figcap')) return [caption(n)];
      return [para(inline(n, opt.run || {}), opt.para || {})];
    case 'pre': {
      const lines = n.text.replace(/^\n/, '').replace(/\n$/, '').split('\n');
      return lines.map((l, i) => new Paragraph({
        children: [new TextRun({ text: l || ' ', font: MONO, size: 17 })],
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.code },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: '9FB7C2', space: 6 } },
        indent: { left: 120, right: 120 }, keepNext: i < lines.length - 1, keepLines: true,
        spacing: { before: i === 0 ? 60 : 0, after: i === lines.length - 1 ? 160 : 0, line: 240 },
      }));
    }
    case 'ol': case 'ul': {
      const ref = tag === 'ol' ? newList() : 'bullets';
      return n.childNodes.filter((li) => (li.rawTagName || '').toLowerCase() === 'li').map((li) =>
        new Paragraph({ numbering: { reference: ref, level: 0 }, children: inline(li, opt.run || {}), spacing: { after: 70, line: 264 } }));
    }
    case 'table': return tableBlock(n, opt.width);
    case 'figure': return figureBlock(n, opt.widthPx);
    case 'caption': case 'figcaption': return [];
    case 'section':
      return blocks(n, opt);
    case 'div': {
      if (cls.startsWith('note')) {
        const [fill, bar] = NOTE[cls.split(' ')[1]] || NOTE.info;
        return [para(inline(n, { size: 19 }), {
          shading: { type: ShadingType.CLEAR, color: 'auto', fill },
          border: { left: { style: BorderStyle.SINGLE, size: 24, color: bar, space: 8 } },
          indent: { left: 160, right: 120 }, spacing: { before: 100, after: 160, line: 264 },
        })];
      }
      if (cls === 'uh-title') return [para(inline(n, { bold: true, color: 'A33A3A', size: 22 }), { keepNext: true, spacing: { before: 200, after: 60 } })];
      if (cls.startsWith('phones')) {
        return [para([imageRun(path.join(RASTER, `r${ctx.raster++}.png`), PX)], { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 } })];
      }
      if (cls.startsWith('two')) {
        const kids = n.childNodes.filter((c) => c.nodeType === 1);
        const narrow = cls.includes('narrow-left');
        const ws = narrow ? [Math.round(CONTENT * 0.42), CONTENT - Math.round(CONTENT * 0.42)] : [Math.floor(CONTENT / 2), CONTENT - Math.floor(CONTENT / 2)];
        const cellsContent = kids.map((k, i) => {
          const wpx = ws[i] / 15 - 12;
          return (k.rawTagName || '').toLowerCase() === 'figure' ? figureBlock(k, wpx) : blocks(k, { widthPx: wpx, width: ws[i] - 180 });
        });
        return [new Table({
          width: { size: CONTENT, type: WidthType.DXA }, columnWidths: ws,
          borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
          rows: [new TableRow({ children: cellsContent.map((c, i) => new TableCell({
            width: { size: ws[i], type: WidthType.DXA }, borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
            margins: { left: 90, right: 90 }, children: c.length ? c : [new Paragraph({ children: [] })],
          })) })],
        }), new Paragraph({ children: [], spacing: { after: 60 } })];
      }
      return blocks(n, opt);
    }
    default: return blocks(n, opt);
  }
}

// ── 5. Sampul & daftar isi ─────────────────────────────────
function cover(sec) {
  const q = (s) => sec.querySelector(s);
  const out = [
    para([new TextRun({ text: 'RoadPulse', bold: true, size: 30, color: C.green }), new TextRun({ text: '   ' + q('.cover-city').text, size: 16, color: C.soft, characterSpacing: 30 })], { spacing: { before: 600, after: 1600 } }),
    para([new TextRun({ text: q('.cover-kicker').text.toUpperCase(), size: 20, bold: true, color: C.green, characterSpacing: 40 })], { spacing: { after: 120 } }),
    para([new TextRun({ text: q('.cover-title').text, bold: true, size: 72, color: C.ink })], { spacing: { after: 120 } }),
    para([new TextRun({ text: q('.cover-sub').text, size: 30, color: C.ink })], { spacing: { after: 300 } }),
    para(inline(q('.cover-desc'), { size: 21, color: C.soft }), { spacing: { after: 1400, line: 300 } }),
  ];
  const metas = sec.querySelectorAll('.cover-meta > div');
  const w = Math.floor(CONTENT / 3);
  out.push(new Table({
    width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [w, w, CONTENT - 2 * w],
    borders: { top: border(C.green, 12), bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ children: metas.map((m, i) => {
      const parts = [];
      let cur = [];
      for (const c of m.childNodes) {
        if (c.nodeType === 1 && (c.getAttribute('class') || '') === 'cm-h') {
          if (cur.length) parts.push(para(cur, { spacing: { after: 120 } }));
          parts.push(para([new TextRun({ text: c.text.toUpperCase(), bold: true, size: 15, color: C.green })], { spacing: { before: 120, after: 40 } }));
          cur = [];
        } else cur.push(...inline(c, { size: 18 }));
      }
      if (cur.length) parts.push(para(cur, { spacing: { after: 60 } }));
      return new TableCell({ width: { size: i < 2 ? w : CONTENT - 2 * w, type: WidthType.DXA }, borders: { top: border(C.green, 12), bottom: NONE, left: NONE, right: NONE }, margins: { top: 120, right: 120 }, children: parts });
    }) })],
  }));
  out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

async function main() {
  const n = await rasterize();
  const root = parse(fs.readFileSync(path.join(DIR, 'manual.html'), 'utf8'));
  const body = [];
  for (const sec of root.querySelector('body').childNodes.filter((c) => c.nodeType === 1)) {
    const cls = sec.getAttribute('class') || '';
    if (cls.includes('cover')) { body.push(...cover(sec)); continue; }
    if (sec.getAttribute('id') === 'toc-page') {
      body.push(para([new TextRun({ text: 'Daftar Isi', bold: true, size: 34, color: C.green })], { spacing: { after: 200 } }));
      body.push(new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-2' }));
      body.push(para([new TextRun({ text: 'Bila nomor halaman belum muncul: klik kanan pada daftar isi → Update Field → Update entire table.', italics: true, size: 17, color: C.soft })]));
      continue;
    }
    body.push(...block(sec));
  }
  if (ctx.raster !== n) throw new Error(`Jumlah gambar raster tidak cocok: ${ctx.raster} dipakai, ${n} dibuat`);

  const doc = new Document({
    creator: 'Kelompok 5 RoadPulse', title: 'User Manual RoadPulse', description: 'Dibangun dari manual.html',
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: FONT, size: 20, color: C.ink } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 36, bold: true, color: C.green }, paragraph: { spacing: { before: 0, after: 220 }, keepNext: true, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.green, space: 4 } } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 26, bold: true, color: C.ink }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, outlineLevel: 1 } },
      ],
    },
    numbering: { config: numbering },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 1134, bottom: 1134, left: MARGIN, right: MARGIN } }, titlePage: true },
      headers: { default: new Header({ children: [para([new TextRun({ text: 'ROADPULSE · USER MANUAL', bold: true, size: 15, color: C.soft }), new TextRun({ children: [RTAB(), 'Versi 1.2 · November 2026'], size: 15, color: C.soft })])] }) },
      footers: { default: new Footer({ children: [para([new TextRun({ text: 'Kelompok 5 · Pemrograman Internet · Politeknik Negeri Lampung', size: 15, color: C.soft }), new TextRun({ children: [RTAB(), 'Halaman ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], size: 15, color: C.green, bold: true })])] }) },
      children: body,
    }],
  });
  fs.writeFileSync(OUT, await Packer.toBuffer(doc));
  console.log('DOCX:', OUT, '| gambar raster:', n);
}

main().catch((e) => { console.error(e); process.exit(1); });
