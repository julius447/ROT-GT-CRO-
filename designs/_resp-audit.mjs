// Responsivitets-auditör: mäter alla fyra block vid alla målbredder.
// node _resp-audit.mjs > ../_resp-out.json
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { writeFileSync } from 'fs';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const PORTRAIT = [320, 344, 345, 346, 360, 375, 390, 414, 430, 480, 481, 540, 600, 744, 768, 810, 834,
  899, 900, 901, 999, 1000, 1001, 1024, 1112, 1119, 1120, 1121, 1180, 1280, 1366, 1440, 1600, 1699, 1700, 1920, 2560];
const LANDSCAPE = [[1024, 768], [1180, 820], [1366, 1024], [1112, 834], [810, 1080]];

const PROBE = () => {
  const out = { overflow: null, spill: [], lines: [], overlaps: [], gaps: [], cta: null, tap: [], mode: null, misc: {} };
  const de = document.documentElement;
  out.overflow = {
    scrollW: de.scrollWidth, clientW: de.clientWidth,
    bodyScrollW: document.body.scrollWidth,
    delta: de.scrollWidth - de.clientWidth
  };
  const R = (e) => e.getBoundingClientRect();
  const sel = (s) => Array.from(document.querySelectorAll(s));

  // ---- layout mode
  const grid = document.querySelector('.grid');
  const gcs = getComputedStyle(grid);
  const panel = document.querySelector('.panel');
  out.mode = {
    cols: gcs.gridTemplateColumns,
    nCols: gcs.gridTemplateColumns.trim().split(/\s+/).length,
    gap: gcs.gap,
    gridW: +R(grid).width.toFixed(1),
    blockW: +R(document.querySelector('.block')).width.toFixed(1),
    panelW: +R(panel).width.toFixed(1),
    panelInnerW: +(R(panel).width - parseFloat(getComputedStyle(panel).paddingLeft) - parseFloat(getComputedStyle(panel).paddingRight) - 2).toFixed(1),
    rowStacked: getComputedStyle(document.querySelector('.r-row')).display,
    leftW: +R(document.querySelector('.left')).width.toFixed(1)
  };

  // ---- spill: every element vs its offsetParent-ish container (skip decorative absolute svg)
  const all = sel('.block *').filter(e => {
    if (e.tagName === 'svg' || e.closest('svg')) return false;
    return true;
  });
  for (const e of all) {
    const p = e.parentElement;
    if (!p) continue;
    const pcs = getComputedStyle(p);
    if (pcs.overflow !== 'visible' && pcs.overflow !== '') { /* still measure */ }
    const a = R(e), b = R(p);
    const padL = parseFloat(pcs.paddingLeft) || 0, padR = parseFloat(pcs.paddingRight) || 0;
    const innerL = b.left + padL, innerR = b.right - padR;
    const overL = innerL - a.left, overR = a.right - innerR;
    if (a.width === 0 && a.height === 0) continue;
    if (overL > 0.7 || overR > 0.7) {
      out.spill.push({
        el: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''),
        parent: p.tagName.toLowerCase() + (p.className && typeof p.className === 'string' ? '.' + p.className.trim().split(/\s+/).join('.') : ''),
        overL: +overL.toFixed(1), overR: +overR.toFixed(1),
        w: +a.width.toFixed(1), pw: +b.width.toFixed(1),
        clipped: pcs.overflow !== 'visible',
        txt: (e.textContent || '').trim().slice(0, 30)
      });
    }
  }

  // ---- per-line character counts via Range walking
  function lineRuns(node) {
    const t = node.textContent;
    const r = document.createRange();
    const runs = [];
    let cur = null;
    for (let i = 0; i < t.length; i++) {
      r.setStart(node, i); r.setEnd(node, i + 1);
      const rect = r.getClientRects()[0];
      if (!rect) continue;
      const key = Math.round(rect.top);
      if (!cur || Math.abs(cur.top - key) > 2) {
        cur = { top: key, chars: 0, l: rect.left, r: rect.right, txt: '' };
        runs.push(cur);
      }
      cur.chars++; cur.r = Math.max(cur.r, rect.right); cur.l = Math.min(cur.l, rect.left);
      cur.txt += t[i];
    }
    return runs;
  }
  const textSels = ['h2', '.steps-cap', '.step h3', '.step p', '.p-cap', '.r-row .lbl', '.r-row .amt',
    '.r-total .t-label', '.r-total .amt', '.r-total .t-note', '.fine', '.cta', '.tel', '.sec-link'];
  for (const s of textSels) {
    for (const el of sel(s)) {
      // merge all text nodes in element into logical lines
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const byTop = new Map();
      let n;
      while ((n = walker.nextNode())) {
        if (!n.textContent.trim()) continue;
        for (const run of lineRuns(n)) {
          let k = null;
          for (const key of byTop.keys()) if (Math.abs(key - run.top) <= 3) k = key;
          if (k === null) { k = run.top; byTop.set(k, { chars: 0, l: run.l, r: run.r, txt: '' }); }
          const e2 = byTop.get(k);
          e2.chars += run.chars; e2.l = Math.min(e2.l, run.l); e2.r = Math.max(e2.r, run.r); e2.txt += run.txt;
        }
      }
      const lines = Array.from(byTop.entries()).sort((a, b) => a[0] - b[0])
        .map(([top, v]) => ({ top, chars: v.chars, w: +(v.r - v.l).toFixed(1), txt: v.txt.trim().slice(0, 60) }));
      if (lines.length) out.lines.push({ sel: s, n: lines.length, lines });
    }
  }

  // ---- overlaps between leaf-ish boxes that are not ancestor/descendant
  const cands = sel('.block h2, .block .steps-cap, .step h3, .step p, .step .n, .p-cap, .r-row, .r-total, .fine, .cta-wrap, .cta, .tel, .sec-link, .offert-pill, .r-row .amt, .r-row .lbl');
  for (let i = 0; i < cands.length; i++) for (let j = i + 1; j < cands.length; j++) {
    const A = cands[i], B = cands[j];
    if (A.contains(B) || B.contains(A)) continue;
    const a = R(A), b = R(B);
    if (a.width === 0 || b.width === 0) continue;
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > 1 && oy > 1) {
      out.overlaps.push({
        a: A.tagName.toLowerCase() + '.' + (A.className || ''), b: B.tagName.toLowerCase() + '.' + (B.className || ''),
        ox: +ox.toFixed(1), oy: +oy.toFixed(1),
        atxt: (A.textContent || '').trim().slice(0, 24), btxt: (B.textContent || '').trim().slice(0, 24)
      });
    }
  }

  // ---- vertical gaps > 120px inside .block (dead space)
  function gapsIn(container, label) {
    const kids = Array.from(container.children).filter(e => e.tagName !== 'svg' && R(e).height > 0);
    for (let i = 0; i < kids.length - 1; i++) {
      const g = R(kids[i + 1]).top - R(kids[i]).bottom;
      if (g > 120) out.gaps.push({ where: label, after: kids[i].tagName + '.' + (kids[i].className || ''), before: kids[i + 1].tagName + '.' + (kids[i + 1].className || ''), gap: +g.toFixed(1) });
    }
    // trailing slack inside container
    if (kids.length) {
      const cs = getComputedStyle(container);
      const tail = R(container).bottom - parseFloat(cs.paddingBottom) - R(kids[kids.length - 1]).bottom;
      if (tail > 120) out.gaps.push({ where: label + ':tail', after: kids[kids.length - 1].tagName + '.' + (kids[kids.length - 1].className || ''), gap: +tail.toFixed(1) });
    }
  }
  gapsIn(document.querySelector('.left'), 'left');
  gapsIn(document.querySelector('.panel'), 'panel');
  // left column vs panel height diff (two-col mode dead space)
  const L = R(document.querySelector('.left')), P = R(document.querySelector('.panel'));
  out.misc.colHeights = { left: +L.height.toFixed(1), panel: +P.height.toFixed(1), diff: +(L.height - P.height).toFixed(1) };
  out.misc.blockH = +R(document.querySelector('.block')).height.toFixed(1);
  // gap between grid columns (visual)
  if (out.mode.nCols === 2) out.misc.colGapPx = +(P.left - L.right).toFixed(1);

  // ---- CTA + tap targets
  const cta = document.querySelector('.cta');
  if (cta) {
    const c = R(cta), pcs = getComputedStyle(document.querySelector('.panel'));
    const availW = R(document.querySelector('.panel')).width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
    out.cta = { w: +c.width.toFixed(1), h: +c.height.toFixed(1), availW: +availW.toFixed(1), pct: +(c.width / availW * 100).toFixed(1), ws: getComputedStyle(cta).whiteSpace, cssW: getComputedStyle(cta).width, pad: getComputedStyle(cta).padding };
  }
  for (const a of sel('a, button')) {
    const r = R(a);
    if (r.width === 0 && r.height === 0) continue;
    if (getComputedStyle(a).display === 'none') continue;
    if (r.height < 44 || r.width < 44) out.tap.push({ el: a.className || a.tagName, w: +r.width.toFixed(1), h: +r.height.toFixed(1), txt: (a.textContent || '').trim().slice(0, 28) });
  }
  return out;
};

const b = await chromium.launch();
const results = {};
for (const f of FILES) {
  results[f] = {};
  const url = pathToFileURL(resolve(f + '.html')).href;
  const cases = [...PORTRAIT.map(w => [w, 900, `${w}`]), ...LANDSCAPE.map(([w, h]) => [w, h, `${w}x${h}L`])];
  for (const [w, h, key] of cases) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(url);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    results[f][key] = await p.evaluate(PROBE);
    await p.close();
  }
  process.stderr.write('done ' + f + '\n');
}
await b.close();
writeFileSync(resolve('_resp-out.json'), JSON.stringify(results));
console.log('written');
