// ============================================================================
//  _s6resp.mjs — STEG 6, DEL 1: responsivsvepet.
//
//  41 bredder 320-2560 x 4 filer x 2 harnesser (preview + produktion) x 2
//  viewporthojder (900 = "portratt", 390 = "landskap"). Hojdparet AR
//  orienteringsprovet: blocken har varken vh/svh/dvh eller @media orientation,
//  och pastaendet "orientering spelar ingen roll" ska MATAS, inte grepas.
//
//  Kontroller per bredd:
//    1  horisontell overflow      dokument + blockets egen scrollWidth
//    2  spill ur container        BLACK (Range-rects) utanfor blockets/panelens border-box
//    3  overlappande element      BLACK mot BLACK, icke-nastlade par
//    4  tryckytor < 44 px         varje a/button i blocket
//    5  textrader < 25 / > 90 tecken   exakta tecken per RENDERAD rad
//    6  CTA-blacket mot knappkanten    (P0-1-mattet, over alla 41 bredder)
//
//    node _s6resp.mjs                     bada harnesser, bada hojder
//    node _s6resp.mjs --harness=preview   bara previewn
//    node _s6resp.mjs --json=ut.json
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const SCRATCH = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = [320, 344, 345, 360, 375, 390, 393, 402, 412, 414, 430, 480, 540, 600, 640, 700, 744,
  768, 800, 820, 834, 900, 912, 1024, 1080, 1112, 1180, 1280, 1366, 1440, 1512, 1536, 1600, 1728,
  1792, 1920, 2048, 2160, 2304, 2400, 2560];
const HEIGHTS = [900, 390];                       // portratt / landskap
const HARNESS = arg('harness', 'both');

// ---------------------------------------------------------------------------
//  Matfunktionen — kors i sidan. Sjalvbarande.
// ---------------------------------------------------------------------------
function probe() {
  const n2 = v => (typeof v === 'number' && isFinite(v)) ? +v.toFixed(2) : null;
  const BLK = document.querySelector('.av-block');
  const PAN = document.querySelector('.av-panel');
  if (!BLK) throw new Error('hittar inte .av-block');
  const bb = BLK.getBoundingClientRect();

  // ---- blackrects: en rect per radbox, per textnod ------------------------
  const inkRects = (el) => {
    const out = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim()) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const rr of r.getClientRects()) {
        if (rr.width < 0.5 || rr.height < 0.5) continue;
        out.push({ l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, node: n });
      }
    }
    return out;
  };

  // ---- VERKLIGA GLYFBAND -------------------------------------------------
  // Range.getClientRects() ger FONTBOXEN (ascent+descent), inte radhojden.
  // Uppmatt i .av-h2: fontbox 43,00 px mot line-height 40,72 -> tva grannrader
  // "overlappar" 2,28 px rent aritmetiskt utan att en enda glyf tar i.
  // Darfor mats overlapp mot glyfernas FAKTISKA band (canvas actualBoundingBox),
  // med hela nodens strang = konservativ overskattning (gommer inget).
  const _cv = document.createElement('canvas').getContext('2d');
  const _cache = new Map();
  const glyphBand = (node) => {
    const el = node.parentElement, cs = getComputedStyle(el);
    const font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    const key = font + '||' + node.textContent;
    let v = _cache.get(key);
    if (!v) {
      _cv.font = font;
      const m = _cv.measureText(node.textContent);
      v = { fbAsc: m.fontBoundingBoxAscent, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
      _cache.set(key, v);
    }
    return v;
  };
  // Kramper en radrect till glyfernas verkliga vertikala utstrackning.
  const toGlyph = (r) => {
    const g = glyphBand(r.node);
    const baseline = r.t + g.fbAsc;
    return { l: r.l, r: r.r, t: baseline - g.asc, b: baseline + g.desc, node: r.node };
  };

  // ---- exakta tecken per RENDERAD rad ------------------------------------
  // Mats per ELEMENT, inte per textnod: ett stycke med inline-<span data-slot>
  // bestar av flera textnoder, och nod-for-nod-rakning styckar EN renderad rad
  // i flera falska "rader" (uppmatt: gt-produkt @1920 gav [15,9,65,5] dar den
  // faktiska renderingen har tva rader). Tecknen grupperas darfor pa radboxens
  // y-lage over HELA elementet. Avslutande blanksteg raknas inte.
  const lineChars = (el) => {
    const lines = new Map();                 // top -> antal tecken
    const rg = document.createRange();
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = w.nextNode())) {
      const s = node.textContent;
      if (!s) continue;
      for (let i = 0; i < s.length; i++) {
        rg.setStart(node, i); rg.setEnd(node, i + 1);
        const b = rg.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;   // kollapsad whitespace
        const t = Math.round(b.top * 2) / 2;
        const blank = !s[i].trim();
        let o = lines.get(t);
        if (!o) { o = { n: 0, svans: 0 }; lines.set(t, o); }
        // blanksteg raknas, men en SVANS av blanksteg i radslut dras bort igen
        o.n++;
        o.svans = blank ? o.svans + 1 : 0;
      }
    }
    return [...lines.keys()].sort((a, b) => a - b).map(t => lines.get(t).n - lines.get(t).svans);
  };

  const inside = (r, box, tol) => r.l >= box.left - tol && r.r <= box.right + tol &&
    r.t >= box.top - tol && r.b <= box.bottom + tol;

  // =========================================================== 1 overflow
  const doc = document.documentElement;
  const O = {
    docScrollW: doc.scrollWidth, docClientW: doc.clientWidth,
    docOverflow: doc.scrollWidth - doc.clientWidth,
    blkScrollW: BLK.scrollWidth, blkClientW: BLK.clientWidth,
    blkOverflow: BLK.scrollWidth - BLK.clientWidth,
    blkW: n2(bb.width), blkH: n2(bb.height)
  };

  // =========================================================== 2 blackspill
  // Allt black i blocket ska ligga innanfor blockets border-box; panelens black
  // dessutom innanfor panelens. Dekor-SVG:erna ar avsiktligt storre och klipps
  // av overflow:hidden — de bar inget black och ingar inte.
  const spill = [];
  for (const r of inkRects(BLK)) {
    if (!inside(r, bb, 0.5)) {
      const host = r.node.parentElement;
      spill.push({
        vad: 'block', el: host.tagName.toLowerCase() + '.' + (host.className || ''),
        txt: r.node.textContent.trim().slice(0, 28),
        dL: n2(r.l - bb.left), dR: n2(bb.right - r.r), dT: n2(r.t - bb.top), dB: n2(bb.bottom - r.b)
      });
    }
  }
  if (PAN) {
    const pb = PAN.getBoundingClientRect();
    for (const r of inkRects(PAN)) {
      if (!inside(r, pb, 0.5)) {
        const host = r.node.parentElement;
        spill.push({
          vad: 'panel', el: host.tagName.toLowerCase() + '.' + (host.className || ''),
          txt: r.node.textContent.trim().slice(0, 28),
          dL: n2(r.l - pb.left), dR: n2(pb.right - r.r), dT: n2(r.t - pb.top), dB: n2(pb.bottom - r.b)
        });
      }
    }
  }

  // =========================================================== 3 overlapp
  // BLACK mot BLACK. Tva rader far rora vid varandra (radavstand), men deras
  // black far inte overlappa mer an 0,5 px i BADA led samtidigt.
  const SEL = 'h2,h3,p,span,a,li,div';
  const els = [...BLK.querySelectorAll(SEL)].filter(e => {
    if (e.closest('svg')) return false;
    // bara element vars EGNA barn ar text (blad-textbarare)
    return [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
  });
  const packs = els.map(e => ({ e, rects: inkRects(e).filter(r => r.node.parentElement === e).map(toGlyph) }));
  const overlaps = [];
  for (let i = 0; i < packs.length; i++) {
    for (let j = i + 1; j < packs.length; j++) {
      const A = packs[i], B = packs[j];
      if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
      for (const a of A.rects) for (const b of B.rects) {
        const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        const oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        if (ox > 0.5 && oy > 0.5) {
          overlaps.push({
            a: A.e.tagName.toLowerCase() + '.' + (A.e.className || ''),
            b: B.e.tagName.toLowerCase() + '.' + (B.e.className || ''),
            ox: n2(ox), oy: n2(oy),
            ta: a.node.textContent.trim().slice(0, 20), tb: b.node.textContent.trim().slice(0, 20)
          });
        }
      }
    }
  }
  // Minsta VERTIKALA luft mellan tva glyfband som overlappar horisontellt
  // (= hur nara en verklig kollision blocket nagonsin kommer).
  let minLuft = Infinity, luftEx = null;
  for (let i = 0; i < packs.length; i++) {
    for (let j = i + 1; j < packs.length; j++) {
      const A = packs[i], B = packs[j];
      if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
      for (const a of A.rects) for (const b of B.rects) {
        if (Math.min(a.r, b.r) - Math.max(a.l, b.l) <= 0.5) continue;
        const luft = a.t < b.t ? b.t - a.b : a.t - b.b;
        if (luft < minLuft) {
          minLuft = luft;
          luftEx = { a: A.e.className || A.e.tagName, b: B.e.className || B.e.tagName, luft: n2(luft) };
        }
      }
    }
  }

  // =========================================================== 4 tryckytor
  const touch = [...BLK.querySelectorAll('a,button,[role="button"],input,select')].map(e => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return {
      el: e.tagName.toLowerCase() + '.' + (e.className || ''),
      txt: (e.textContent || '').trim().slice(0, 24),
      w: n2(r.width), h: n2(r.height), display: cs.display,
      liten: r.width < 44 || r.height < 44
    };
  });

  // =========================================================== 5 radlangder
  const BODY_SEL = ['.av-step p', '.av-fine', '.av-t-note', '.av-lead', '.av-p-note'];
  const LABEL_SEL = ['.av-h2', '.av-step h3', '.av-steps-cap', '.av-p-cap', '.av-lbl',
    '.av-amt', '.av-t-label', '.av-cta', '.av-offert-pill'];
  const rader = { body: [], label: [] };
  const collect = (sels, bucket) => {
    for (const sel of sels) {
      for (const el of BLK.querySelectorAll(sel)) {
        if (!(el.textContent || '').trim()) continue;
        const per = lineChars(el);
        if (!per.length) continue;
        bucket.push({ sel, txt: (el.textContent || '').trim().slice(0, 34), rader: per });
      }
    }
  };
  collect(BODY_SEL, rader.body);
  collect(LABEL_SEL, rader.label);

  // =========================================================== 6 CTA-blacket
  const ctaM = [...BLK.querySelectorAll('.av-cta')].map(cta => {
    const eb = cta.getBoundingClientRect();
    let minL = Infinity, maxR = -Infinity, tops = new Set();
    for (const r of inkRects(cta)) { minL = Math.min(minL, r.l); maxR = Math.max(maxR, r.r); tops.add(Math.round(r.t * 2) / 2); }
    for (const s of cta.querySelectorAll('svg')) {
      const r = s.getBoundingClientRect();
      if (r.width || r.height) { minL = Math.min(minL, r.left); maxR = Math.max(maxR, r.right); }
    }
    return {
      klass: cta.className, w: n2(eb.width), h: n2(eb.height),
      inkL: isFinite(minL) ? n2(minL - eb.left) : null,
      inkR: isFinite(maxR) ? n2(eb.right - maxR) : null,
      rader: tops.size
    };
  });

  // ---- radlangdens FYSISKA TAK: kolumnbredd / medelteckenbredd -----------
  const tak = {};
  for (const [k, sel] of [['p', '.av-step p'], ['fine', '.av-fine']]) {
    const el = BLK.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    _cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    const mw = _cv.measureText('abcdefghijklmnopqrstuvwxyzåäö ').width / 30;
    const cw = el.getBoundingClientRect().width;
    tak[k] = { kolW: n2(cw), medelTkn: n2(mw), takTkn: Math.floor(cw / mw) };
  }

  return { O, spill, overlaps, minLuft: isFinite(minLuft) ? n2(minLuft) : null, luftEx, touch, rader, ctaM, tak };
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();
const resultat = [];
const t0 = Date.now();

const harnesser = [];
if (HARNESS === 'both' || HARNESS === 'preview') harnesser.push({ namn: 'preview', url: f => pathToFileURL(resolve(f + '.html')).href });
if (HARNESS === 'both' || HARNESS === 'produktion') harnesser.push({ namn: 'produktion', url: f => pathToFileURL(SCRATCH + 'ns2-' + f + '.html').href });

for (const H of harnesser) {
  for (const f of FILES) {
    const page = await browser.newPage({ viewport: { width: 2560, height: 900 } });
    await page.goto(H.url(f), { waitUntil: 'load' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
    await page.waitForTimeout(500);
    for (const h of HEIGHTS) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(90);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const r = await page.evaluate(probe);
        resultat.push({ harness: H.namn, fil: f, w, h, ...r });
      }
    }
    await page.close();
    process.stderr.write('.');
  }
}
await browser.close();
process.stderr.write('\n');

// ---------------------------------------------------------------------------
//  Utvardering
// ---------------------------------------------------------------------------
const jsonPath = arg('json', null);
if (jsonPath) writeFileSync(jsonPath, JSON.stringify(resultat));

const P = s => console.log(s);
const pad = (s, n) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

P('');
P('  STEG 6 / DEL 1 — RESPONSIVSVEPET');
P('  ' + WIDTHS.length + ' bredder x ' + FILES.length + ' filer x ' + harnesser.length + ' harnesser x ' +
  HEIGHTS.length + ' hojder = ' + resultat.length + ' matpunkter   (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
P('');

// --- orienteringsprovet: h=900 mot h=390, samma bredd -----------------------
let orientAvvik = 0; const orientEx = [];
for (const a of resultat.filter(r => r.h === 900)) {
  const b = resultat.find(r => r.h === 390 && r.harness === a.harness && r.fil === a.fil && r.w === a.w);
  if (!b) continue;
  const ka = JSON.stringify([a.O.blkW, a.O.blkH, a.O.blkOverflow, a.ctaM, a.rader]);
  const kb = JSON.stringify([b.O.blkW, b.O.blkH, b.O.blkOverflow, b.ctaM, b.rader]);
  if (ka !== kb) { orientAvvik++; if (orientEx.length < 5) orientEx.push(a.harness + '/' + a.fil + '@' + a.w); }
}
P('  ORIENTERING (viewporthojd 900 mot 390, samma bredd)');
P('    avvikelser: ' + orientAvvik + (orientAvvik ? '   ' + orientEx.join(' ') : '   ✅ hojden paverkar ingenting — orienteringen ar bevisat irrelevant'));
P('');

// --- 1 overflow -------------------------------------------------------------
const ovBlk = resultat.filter(r => r.O.blkOverflow > 0.5);
const ovDoc = resultat.filter(r => r.harness === 'preview' && r.O.docOverflow > 0.5);
P('  1 HORISONTELL OVERFLOW');
P('    blockets egen scrollWidth > clientWidth : ' + ovBlk.length + ' av ' + resultat.length +
  (ovBlk.length ? '  ⛔' : '  ✅'));
for (const r of ovBlk.slice(0, 8)) P('      ' + r.harness + '/' + r.fil + ' @' + r.w + 'x' + r.h + '  +' + r.O.blkOverflow + ' px');
P('    previewsidans dokument-overflow        : ' + ovDoc.length + ' av ' +
  resultat.filter(r => r.harness === 'preview').length + (ovDoc.length ? '  ⛔' : '  ✅'));
for (const r of ovDoc.slice(0, 8)) P('      ' + r.fil + ' @' + r.w + 'x' + r.h + '  ' + r.O.docScrollW + ' > ' + r.O.docClientW);
P('');

// --- 2 spill ---------------------------------------------------------------
const sp = resultat.filter(r => r.spill.length);
P('  2 BLACKSPILL UR CONTAINER (black utanfor block-/panel-border-box)');
P('    matpunkter med spill: ' + sp.length + ' av ' + resultat.length + (sp.length ? '  ⛔' : '  ✅'));
for (const r of sp.slice(0, 10)) {
  const s = r.spill[0];
  P('      ' + r.harness + '/' + r.fil + ' @' + r.w + 'x' + r.h + '  ' + s.vad + ' ' + s.el + ' "' + s.txt + '"  dL=' + s.dL + ' dR=' + s.dR + ' dT=' + s.dT + ' dB=' + s.dB);
}
P('');

// --- 3 overlapp ------------------------------------------------------------
const ov = resultat.filter(r => r.overlaps.length);
P('  3 OVERLAPPANDE BLACK (verkliga glyfband, canvas actualBoundingBox)');
P('    matpunkter med overlapp: ' + ov.length + ' av ' + resultat.length + (ov.length ? '  ⛔' : '  ✅'));
{
  let mn = Infinity, at = null;
  for (const r of resultat) if (r.minLuft !== null && r.minLuft < mn) { mn = r.minLuft; at = r; }
  if (at) P('    minsta vertikala luft mellan tva glyfband nagonstans i svepet: ' + mn.toFixed(2) +
    ' px   (' + at.harness + '/' + at.fil + ' @' + at.w + 'x' + at.h + '  ' + at.luftEx.a + ' / ' + at.luftEx.b + ')');
}
const ovAgg = {};
for (const r of ov) for (const o of r.overlaps) {
  const k = o.a + ' | ' + o.b;
  (ovAgg[k] ||= { n: 0, max: 0, ex: '' });
  ovAgg[k].n++;
  const area = o.ox * o.oy;
  if (area > ovAgg[k].max) { ovAgg[k].max = area; ovAgg[k].ex = r.harness + '/' + r.fil + '@' + r.w + 'x' + r.h + ' ' + o.ox + 'x' + o.oy + ' "' + o.ta + '" / "' + o.tb + '"'; }
}
for (const [k, v] of Object.entries(ovAgg).sort((a, b) => b[1].n - a[1].n).slice(0, 10))
  P('      ' + pad(k, 56) + padL(v.n, 5) + '  ' + v.ex);
P('');

// --- 4 tryckytor ------------------------------------------------------------
P('  4 TRYCKYTOR < 44 px');
const tAgg = {};
for (const r of resultat) for (const t of r.touch) {
  const k = t.el + ' :: ' + t.txt;
  (tAgg[k] ||= { n: 0, liten: 0, minW: 1e9, minH: 1e9, exW: '', exH: '' });
  const a = tAgg[k]; a.n++;
  if (t.liten) a.liten++;
  if (t.w < a.minW) { a.minW = t.w; a.exW = r.harness + '/' + r.fil + '@' + r.w; }
  if (t.h < a.minH) { a.minH = t.h; a.exH = r.harness + '/' + r.fil + '@' + r.w + 'x' + r.h; }
}
P('    ' + pad('ELEMENT', 46) + padL('MATPKT', 8) + padL('<44', 6) + padL('minW', 9) + padL('minH', 9) + '   varst');
for (const [k, v] of Object.entries(tAgg))
  P('    ' + pad(k, 46) + padL(v.n, 8) + padL(v.liten, 6) + padL(v.minW.toFixed(1), 9) + padL(v.minH.toFixed(1), 9) + '   ' + v.exH);
const tSmall = Object.values(tAgg).reduce((n, v) => n + v.liten, 0);
P('    summa matpunkter under 44 px: ' + tSmall + (tSmall ? '  ⛔' : '  ✅'));
P('');

// --- 5 radlangder -----------------------------------------------------------
P('  5 RADLANGDER (exakta tecken per renderad rad)');
let langa = 0, korta = 0, orphan = 0;
const langaEx = [], kortaEx = [], orphanEx = [];
for (const r of resultat) {
  for (const b of r.rader.body) {
    const n = b.rader.length;
    b.rader.forEach((c, i) => {
      const sista = i === n - 1;
      if (c > 90) { langa++; if (langaEx.length < 8) langaEx.push(r.harness + '/' + r.fil + '@' + r.w + 'x' + r.h + ' ' + b.sel + ' rad' + (i + 1) + ' = ' + c + ' tkn'); }
      if (!sista && c < 25) { korta++; if (kortaEx.length < 8) kortaEx.push(r.harness + '/' + r.fil + '@' + r.w + 'x' + r.h + ' ' + b.sel + ' rad' + (i + 1) + '/' + n + ' = ' + c + ' tkn  "' + b.txt + '"'); }
      if (sista && n > 1 && c <= 12) { orphan++; if (orphanEx.length < 8) orphanEx.push(r.harness + '/' + r.fil + '@' + r.w + 'x' + r.h + ' ' + b.sel + ' sista rad = ' + c + ' tkn  "' + b.txt + '"'); }
    });
  }
}
P('    BRODTEXT (.av-step p / .av-fine / .av-t-note)');
P('      rader > 90 tecken                    : ' + langa + (langa ? '  ⛔' : '  ✅'));
for (const e of langaEx) P('        ' + e);
P('      icke-sista rader < 25 tecken         : ' + korta + (korta ? '  ⛔' : '  ✅'));
for (const e of kortaEx.slice(0, 4)) P('        ' + e);
{
  // Vid VILKA bredder intraffar de korta raderna? Ar det ett fysiskt golv eller
  // ett fel? Golvet = kolumnbredd / medelteckenbredd.
  const perW = {};
  for (const r of resultat) for (const b of r.rader.body) {
    const n = b.rader.length;
    b.rader.forEach((c, i) => { if (i < n - 1 && c < 25) (perW[r.w] ||= { n: 0, min: 99 }), perW[r.w].n++, perW[r.w].min = Math.min(perW[r.w].min, c); });
  }
  const ws = Object.keys(perW).map(Number).sort((a, b) => a - b);
  P('        forekommer vid bredderna: ' + (ws.length ? ws.join(', ') : 'inga') +
    (ws.length ? '   (storsta bredd med kort rad: ' + ws[ws.length - 1] + ' px)' : ''));
  P('        ' + pad('bredd', 8) + padL('korta', 7) + padL('kortast', 9) + padL('kolumn', 9) + padL('medeltkn', 10) + padL('FYSISKT TAK', 13) + '   dom');
  for (const w of ws) {
    const t = resultat.find(r => r.w === w && r.tak.p);
    const tak = t ? t.tak.p : null;
    P('        ' + pad('@' + w, 8) + padL(perW[w].n, 7) + padL(perW[w].min, 9) +
      padL(tak ? tak.kolW : '?', 9) + padL(tak ? tak.medelTkn : '?', 10) + padL(tak ? tak.takTkn : '?', 13) +
      '   ' + (tak && tak.takTkn < 32 ? 'GOLV — 25 tkn ar omojligt har' : 'undersok'));
  }
}
P('      sista rad <= 12 tecken (anka/orphan) : ' + orphan + (orphan ? '  (polish)' : '  ✅'));
for (const e of orphanEx.slice(0, 4)) P('        ' + e);
// max/min per selektor
const sAgg = {};
for (const r of resultat) for (const b of r.rader.body) {
  (sAgg[b.sel] ||= { max: 0, min: 1e9, exMax: '', exMin: '' });
  for (const c of b.rader) {
    if (c > sAgg[b.sel].max) { sAgg[b.sel].max = c; sAgg[b.sel].exMax = r.harness + '/' + r.fil + '@' + r.w; }
    if (c < sAgg[b.sel].min) { sAgg[b.sel].min = c; sAgg[b.sel].exMin = r.harness + '/' + r.fil + '@' + r.w; }
  }
}
P('      ' + pad('SELEKTOR', 20) + padL('MAX', 6) + '  ' + pad('vid', 30) + padL('MIN', 6) + '  vid');
for (const [k, v] of Object.entries(sAgg))
  P('      ' + pad(k, 20) + padL(v.max, 6) + '  ' + pad(v.exMax, 30) + padL(v.min, 6) + '  ' + v.exMin);
// etiketter (informativt)
let labLang = 0; const labEx = [];
for (const r of resultat) for (const b of r.rader.label) for (const c of b.rader)
  if (c > 90) { labLang++; if (labEx.length < 4) labEx.push(r.harness + '/' + r.fil + '@' + r.w + ' ' + b.sel + ' = ' + c); }
P('    RUBRIK/ETIKETT: rader > 90 tecken: ' + labLang + (labLang ? '' : '  ✅') );
for (const e of labEx) P('        ' + e);
P('');

// --- 6 CTA -----------------------------------------------------------------
P('  6 CTA-BLACKET MOT KNAPPKANTEN (negativt = etiketten utanfor knappen)');
P('    ' + pad('HARNESS/FIL', 34) + padL('minInkL', 9) + padL('minInkR', 9) + padL('vid', 8) + padL('maxRader', 9) + padL('minH', 8));
let ctaNeg = 0, ctaTight = 0;
for (const H of harnesser) for (const f of FILES) {
  const rs = resultat.filter(r => r.harness === H.namn && r.fil === f);
  let mL = 1e9, mR = 1e9, at = '', maxRad = 0, minH = 1e9;
  for (const r of rs) for (const c of r.ctaM) {
    if (c.inkL !== null && c.inkL < mL) { mL = c.inkL; at = r.w + 'x' + r.h; }
    if (c.inkR !== null && c.inkR < mR) mR = c.inkR;
    if (c.rader > maxRad) maxRad = c.rader;
    if (c.h < minH) minH = c.h;
  }
  const worst = Math.min(mL, mR);
  if (worst < 0) ctaNeg++; else if (worst < 8) ctaTight++;
  P('    ' + pad(H.namn + '/' + f, 34) + padL(mL.toFixed(2), 9) + padL(mR.toFixed(2), 9) + padL(at, 8) +
    padL(maxRad, 9) + padL(minH.toFixed(1), 8) + (worst < 0 ? '  ⛔' : worst < 8 ? '  ⚠' : '  ✅'));
}
P('    filer med black UTANFOR knappen: ' + ctaNeg + (ctaNeg ? '  ⛔' : '  ✅'));
P('');

const fel = ovBlk.length + ovDoc.length + sp.length + ov.length + tSmall + langa + ctaNeg + orientAvvik;
P('  DEL 1 GRINDANDE AVVIKELSER: ' + fel +
  '   (overflow ' + (ovBlk.length + ovDoc.length) + ' · spill ' + sp.length + ' · overlapp ' + ov.length +
  ' · tryckyta ' + tSmall + ' · >90tkn ' + langa + ' · CTA-spill ' + ctaNeg + ' · orientering ' + orientAvvik + ')');
P('  DEL 1 OBSERVATIONER (ej grindande): korta rader ' + korta + ' · ankor ' + orphan);
P(fel === 0 ? '  ✅ DEL 1 GRON' : '  ⛔ DEL 1 HAR AVVIKELSER — se ovan');
P('');
process.exit(fel === 0 ? 0 : 1);
