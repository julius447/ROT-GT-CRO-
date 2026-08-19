// ============================================================================
//  _s3.mjs — STEG 3:s FÖRE/EFTER-MÄTNING. En körning = ett komplett facit för
//  varje punkt i steg 3, i BÅDA harnessen:
//     preview     = filerna som de ligger (den pixelgodkända renderingen)
//     produktion  = ampy.se:s riktiga CSS + riktig Bricks-container (1280px)
//
//     node _s3.mjs --tag=fore    (läser scratchpad/s3fore-*.html)
//     node _s3.mjs --tag=efter   (läser scratchpad/s3efter-*.html)
//
//  Skriver scratchpad/s3-<tag>.json. Jämför med _s3diff.mjs.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const TAG = arg('tag', 'fore');
const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const prod = f => pathToFileURL(S + 's3' + TAG + '-' + f + '.html').href;
const prev = f => pathToFileURL(resolve(f + '.html')).href;

// ---------------------------------------------------------------------------
//  Mätfunktionerna (körs i sidan). CTA-bläcket mäts EXAKT som auditens _cons-3:
//  textnoder + inline-SVG, ytterkanterna, mot knappens border-box.
// ---------------------------------------------------------------------------
const CTA = () => {
  const cta = document.querySelector('.av-cta'); if (!cta) return null;
  const cb = cta.getBoundingClientRect();
  let minL = Infinity, maxR = -Infinity; const tops = {};
  const w = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const rr of r.getClientRects()) {
      if (!rr.width && !rr.height) continue;
      minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right);
      tops[Math.round(rr.top * 2) / 2] = 1;
    }
  }
  for (const e of cta.querySelectorAll('svg')) {
    const rr = e.getBoundingClientRect(); if (!rr.width && !rr.height) continue;
    minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right);
  }
  const c = getComputedStyle(cta);
  const r2 = v => +v.toFixed(2);
  return {
    dL: r2(minL - cb.left), dR: r2(cb.right - maxR),
    h: r2(cb.height), w: r2(cb.width),
    rader: Object.keys(tops).length,
    pad: c.padding, gap: c.columnGap, ws: c.whiteSpace, lh: c.lineHeight, bredddekl: c.width
  };
};

const GEO = () => {
  const q = s => document.querySelector(s);
  const r2 = v => v === null ? null : +v.toFixed(2);
  const blk = q('.av-block'), left = q('.av-left'), pa = q('.av-panel'), gr = q('.av-grid');
  const cb = getComputedStyle(blk), cp = getComputedStyle(pa), cg = getComputedStyle(gr);
  // MÅSTE scopas: produktionsharnesset har värdsidans EGNA h2 tidigare i DOM:en.
  const h2 = document.querySelector('.ampy-avdrag h2'), acc = q('.av-accent');
  const sp = q('.av-step p'), fine = q('.av-fine'), cap = q('.av-steps-cap');
  return {
    block_w: r2(blk.getBoundingClientRect().width),
    block_h: r2(blk.getBoundingClientRect().height),
    block_padL: r2(parseFloat(cb.paddingLeft)), block_padT: r2(parseFloat(cb.paddingTop)),
    block_ctype: cb.containerType,
    left_w: r2(left.getBoundingClientRect().width),
    panel_w: r2(pa.getBoundingClientRect().width),
    panel_padL: r2(parseFloat(cp.paddingLeft)),
    panel_inner: r2(pa.clientWidth - parseFloat(cp.paddingLeft) - parseFloat(cp.paddingRight)),
    grid_cols: cg.gridTemplateColumns, grid_colGap: r2(parseFloat(cg.columnGap)),
    row_display: getComputedStyle(q('.av-r-row')).display,
    capMB: r2(parseFloat(getComputedStyle(cap).marginBottom)),
    h2_maxWpx: r2(parseFloat(getComputedStyle(h2).maxWidth)) || getComputedStyle(h2).maxWidth,
    h2_box_w: r2(h2.getBoundingClientRect().width),
    h2_h: r2(h2.getBoundingClientRect().height),
    accent_spill: acc ? r2(acc.getBoundingClientRect().right - h2.getBoundingClientRect().right) : null,
    accent_ws: acc ? getComputedStyle(acc).whiteSpace : null,
    stepP_maxW: getComputedStyle(sp).maxWidth,
    stepP_w: r2(sp.getBoundingClientRect().width),
    fine_maxW: fine ? getComputedStyle(fine).maxWidth : null,
    fine_w: fine ? r2(fine.getBoundingClientRect().width) : null,
    docScrollW: document.documentElement.scrollWidth,
    docClientW: document.documentElement.clientWidth
  };
};

// Strukturmätning ur CSSOM: var .av-cta-reglerna bor och vad de deklarerar.
const CSSOM = () => {
  const sh = [...document.styleSheets].find(s => s.ownerNode && s.ownerNode.id &&
    /ampy-(avdrag|block)-css/.test(s.ownerNode.id));
  const rader = [];
  const walk = (rules, path) => {
    for (const r of rules) {
      if (r.type === CSSRule.STYLE_RULE) {
        if (/\.av-cta(\b|[:{,\s])/.test(r.selectorText) || /focus-visible/.test(r.selectorText))
          rader.push({ path, sel: r.selectorText, css: r.style.cssText.slice(0, 220) });
      } else if (r.cssRules) {
        walk(r.cssRules, path + (r.conditionText ? '@' + (r.constructor.name.includes('Supports') ? 'supports' : 'media') + '(' + r.conditionText + ')/' : (r.name ? '@container ' + r.name + '/' : '@?/')));
      }
    }
  };
  if (sh) try { walk(sh.cssRules, ''); } catch (e) { }
  return { supportsCQ: CSS.supports('container-type', 'inline-size'), rader };
};

// ---------------------------------------------------------------------------
const CTA_W = [320, 330, 344, 345, 346, 360, 375, 390, 400, 412, 430, 440];
const GEO_W = [320, 345, 346, 360, 390, 430, 480, 600, 744, 768, 834, 900, 1000, 1024, 1112,
  1180, 1280, 1366, 1412, 1413, 1440, 1600, 1700, 1920, 2560];
const SPILL_W = []; for (let w = 990; w <= 1040; w++) SPILL_W.push(w);
const PANEL_W = []; for (let w = 1121; w <= 1470; w += 1) PANEL_W.push(w);

const b = await chromium.launch();
const out = { tag: TAG, when: new Date().toISOString(), preview: {}, produktion: {} };

async function kor(url, rec, tung) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
  await p.waitForTimeout(600);

  rec.cta = {};
  for (const w of CTA_W) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(90); rec.cta[w] = await p.evaluate(CTA); }
  rec.geo = {};
  for (const w of GEO_W) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(90); rec.geo[w] = await p.evaluate(GEO); }
  if (tung) {
    rec.spill = {};
    for (const w of SPILL_W) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(35); rec.spill[w] = await p.evaluate(() => { const h2 = document.querySelector('.ampy-avdrag h2'), a = document.querySelector('.av-accent'); return a ? +(a.getBoundingClientRect().right - h2.getBoundingClientRect().right).toFixed(2) : null; }); }
    rec.panelSvep = {};
    for (const w of PANEL_W) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(30); rec.panelSvep[w] = await p.evaluate(() => { const pa = document.querySelector('.av-panel'), c = getComputedStyle(pa); return +(pa.clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight)).toFixed(2); }); }
  }
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(80);
  rec.cssom = await p.evaluate(CSSOM);
  await p.close();
}

for (const f of FILES) {
  out.preview[f] = {}; await kor(prev(f), out.preview[f], true);
  out.produktion[f] = {}; await kor(prod(f), out.produktion[f], true);
  console.error('klar: ' + f);
}
await b.close();

writeFileSync(S + 's3-' + TAG + '.json', JSON.stringify(out, null, 1));
console.log('skrev ' + S + 's3-' + TAG + '.json');
