// ============================================================================
//  _s4probe.mjs — STEG 4:s MÄTNING AV DE NYA TILLSTÅNDEN.
//  Mäter fyra tillstånd per fil och skriver EN json:
//    (1) print          — emulateMedia({media:'print'})
//    (2) forced-colors  — newContext({forcedColors:'active'})
//    (3) reduced-motion — newContext({reducedMotion:'reduce'})
//    (4) a11y-roller    — ol/li exponerade roller (P1-13)
//  Kör:  node _s4probe.mjs --ut=/nån/fil.json [--dir=.]
//  Samma skript körs FÖRE och EFTER; jämförelsen görs av _s4cmp.mjs.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { writeFileSync } from 'fs';
import { FILES } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const DIR = resolve(arg('dir', '.'));
const UT = resolve(arg('ut', '_s4probe.json'));

// Elementen vars färg/yta avgör om tillståndet är LÄSBART.
const NODER = [
  ['block', '.av-block'],
  ['panel', '.av-panel'],
  ['pcap', '.av-p-cap'],
  ['rad1', '.av-r-row'],
  ['lbl1', '.av-r-row .av-lbl'],
  ['amt1', '.av-r-row .av-amt'],
  ['pill', '.av-offert-pill'],
  ['dots', '.av-r-row .av-dots'],
  ['deduct', '.av-r-row.av-deduct .av-amt'],
  ['total', '.av-r-total'],
  ['tlabel', '.av-r-total .av-t-label'],
  ['tamt', '.av-r-total .av-amt'],
  ['fine', '.av-fine'],
  ['cta', '.av-cta'],
  ['ctawrap', '.av-cta-wrap'],
  ['h2', '.av-h2'],
  ['h3', '.av-step h3'],
  ['stegp', '.av-step p'],
  ['n', '.av-step .av-n'],
  ['trk', '.av-step .av-n .av-mark .av-trk'],
  ['arc', '.av-step .av-n .av-mark .av-arc'],
  ['wave1', 'svg.av-wave.av-hero-w1'],
  ['blob1', 'svg.av-blob.av-blob-a'],
  ['wave1p', 'svg.av-wave.av-hero-w1 path'],
  ['blob1p', 'svg.av-blob.av-blob-a path'],
  ['ring', '.av-cta .av-cta-ring'],
];

function plocka(noder) {
  const ut = {};
  for (const [namn, sel] of noder) {
    const el = document.querySelector(sel);
    if (!el) { ut[namn] = null; continue; }
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    ut[namn] = {
      display: c.display,
      color: c.color,
      bg: c.backgroundColor,
      bgImg: (c.backgroundImage || '').slice(0, 40),
      border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor,
      borderL: c.borderLeftWidth + ' ' + c.borderLeftStyle + ' ' + c.borderLeftColor,
      borderB: c.borderBottomWidth + ' ' + c.borderBottomStyle + ' ' + c.borderBottomColor,
      shadow: (c.boxShadow || '').slice(0, 60),
      fill: c.fill || null,
      stroke: c.stroke || null,
      breakInside: c.breakInside,
      w: +r.width.toFixed(2), h: +r.height.toFixed(2),
      vis: c.visibility,
      anim: c.animationName,
      fca: c.forcedColorAdjust || null,
      pca: c.printColorAdjust || c.webkitPrintColorAdjust || null,
    };
  }
  // ::after på CTA:n (print-URL:en) + pulsen
  const cta = document.querySelector('.av-cta');
  if (cta) {
    const a = getComputedStyle(cta, '::after');
    ut['cta_after'] = { content: a.content, display: a.display, fs: a.fontSize, color: a.color };
  }
  const rw = document.querySelector('.av-cta-ringwrap');
  if (rw) {
    const a = getComputedStyle(rw, '::after');
    ut['ringwrap_after'] = { content: a.content, bg: a.backgroundColor, anim: a.animationName, tf: a.transform, op: a.opacity, z: a.zIndex };
  }
  const cw = document.querySelector('.av-cta-wrap');
  if (cw) {
    const b = getComputedStyle(cw, '::before');
    ut['ctawrap_before'] = { bg: b.backgroundColor, h: b.height, display: b.display };
  }
  return ut;
}

// Kontrastberäkning — svart/vit-testet som avgör "vit text på vitt papper".
function kontrastData() {
  const par = [
    ['pcap', '.av-p-cap', '.av-panel'],
    ['lbl', '.av-r-row .av-lbl', '.av-panel'],
    ['tamt', '.av-r-total .av-amt', '.av-r-total'],
    ['fine', '.av-fine', '.av-panel'],
    ['cta', '.av-cta', '.av-cta'],
  ];
  const rgb = s => { const m = String(s).match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
  const L = c => { const f = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
  const ut = {};
  for (const [namn, fg, bgsel] of par) {
    const e = document.querySelector(fg), b = document.querySelector(bgsel);
    if (!e || !b) { ut[namn] = null; continue; }
    const f = rgb(getComputedStyle(e).color);
    let bb = rgb(getComputedStyle(b).backgroundColor);
    const al = parseFloat((String(getComputedStyle(b).backgroundColor).match(/[\d.]+/g) || [])[3] ?? '1');
    if (!f || !bb) { ut[namn] = null; continue; }
    if (al < 1) bb = bb.map(v => Math.round(v * al + 255 * (1 - al)));   // mot vitt papper
    const l1 = L(f), l2 = L(bb);
    ut[namn] = +(((Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05))).toFixed(2);
  }
  return ut;
}

function regelinventering() {
  const ut = { print: 0, forced: 0, rm: 0, has: 0, roller: null, ids: [] };
  for (const s of document.styleSheets) {
    let rl; try { rl = s.cssRules; } catch { continue; }
    const gå = rules => { for (const r of rules) {
      if (r.conditionText || r.media) {
        const t = String(r.conditionText || r.media.mediaText || '');
        if (/\bprint\b/.test(t)) ut.print++;
        if (/forced-colors/.test(t)) ut.forced++;
        if (/prefers-reduced-motion/.test(t)) ut.rm++;
      }
      if (r.selectorText && r.selectorText.includes(':has(')) ut.has++;
      if (r.cssRules) gå(r.cssRules);
    } };
    gå(rl);
  }
  const ol = document.querySelector('.av-steps'), li = document.querySelector('.av-step');
  ut.roller = { olRole: ol ? ol.getAttribute('role') : null, liRole: li ? li.getAttribute('role') : null, olLS: ol ? getComputedStyle(ol).listStyleType : null };
  ut.tnote = !!document.querySelector('.av-r-total .av-t-note');
  ut.tnoteHTML = (document.querySelector('.av-r-total') || {}).innerHTML ? document.querySelector('.av-r-total').children.length : null;
  return ut;
}

const browser = await chromium.launch();
const res = {};

for (const f of FILES) {
  const url = pathToFileURL(join(DIR, f + '.html')).href;
  const rad = {};

  // --- normalläge + print ---------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
    await page.waitForTimeout(500);
    rad.normal = await page.evaluate(plocka, NODER);
    rad.inv = await page.evaluate(regelinventering);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(120);
    rad.print = await page.evaluate(plocka, NODER);
    rad.printKontrast = await page.evaluate(kontrastData);
    // fullhöjd i printläge (sidbrytningsunderlag)
    rad.printHojd = await page.evaluate(() => ({
      block: +document.querySelector('.av-block').getBoundingClientRect().height.toFixed(2),
      body: +document.body.scrollHeight.toFixed(2)
    }));
    await ctx.close();
  }

  // --- forced-colors ---------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: 'active', colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
    await page.waitForTimeout(400);
    rad.forced = await page.evaluate(plocka, NODER);
    rad.forcedAktiv = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    await ctx.close();
  }

  // --- reduced motion ---------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
    await page.waitForTimeout(400);
    rad.rm = await page.evaluate(plocka, NODER);
    await ctx.close();
  }

  res[f] = rad;
}

await browser.close();
writeFileSync(UT, JSON.stringify(res, null, 1));
console.log('skrev ' + UT);
