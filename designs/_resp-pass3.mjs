import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const at = async (f, w, fn, h = 900) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(fn); await p.close(); return r;
};

// ---- 1. .steps-cap margin-bottom: dubblerad regel i ≤900-blocket?
console.log('===== 1. .steps-cap margin-bottom (avsedd 22px på mobil) =====');
const capProbe = () => {
  const c = document.querySelector('.steps-cap');
  const ol = document.querySelector('.steps');
  return {
    mb: getComputedStyle(c).marginBottom,
    visuelltAvstand: +(ol.getBoundingClientRect().top - c.getBoundingClientRect().bottom).toFixed(1),
    stepsGap: getComputedStyle(ol).rowGap,
    h2mb: getComputedStyle(document.querySelector('h2')).marginBottom
  };
};
for (const w of [320, 390, 430, 600, 744, 900, 901, 1024, 1440]) {
  console.log(String(w).padEnd(6), JSON.stringify(await at('d2-kvittot-forst', w, capProbe)));
}

// ---- 2. brytpunktsgränser: hopp i mått
console.log('\n===== 2. BRYTPUNKTSGRÄNSER (hopp i blockbredd/höjd/typografi) =====');
const bpProbe = () => {
  const q = s => document.querySelector(s), R = e => e.getBoundingClientRect();
  const cs = e => getComputedStyle(e);
  return {
    blockW: +R(q('.block')).width.toFixed(1), blockH: +R(q('.block')).height.toFixed(1),
    pad: cs(q('.block')).padding,
    edge: cs(document.body).paddingLeft,
    h2fs: cs(q('h2')).fontSize, h2align: cs(q('h2')).textAlign,
    accentWS: cs(q('h2 .accent')).whiteSpace,
    nsz: cs(q('.step .n')).width, sgap: cs(q('.steps')).rowGap,
    panelW: +R(q('.panel')).width.toFixed(1), panelPad: cs(q('.panel')).padding,
    ctaPad: cs(q('.cta')).padding, ctaW: +R(q('.cta')).width.toFixed(1),
    cols: cs(q('.grid')).gridTemplateColumns
  };
};
for (const trip of [[899, 900, 901], [999, 1000, 1001], [1119, 1120, 1121], [344, 345, 346], [479, 480, 481], [1699, 1700, 1701]]) {
  console.log('--- gräns', trip.join('/'));
  for (const w of trip) console.log('  ', String(w).padEnd(5), JSON.stringify(await at('d2-kvittot-forst', w, bpProbe)));
}

// ---- 3. tomyta i grid-spåret (panelen centrerad mot högre vänsterspalt)
console.log('\n===== 3. TOMYTA i grid-spåret (align-items:center) =====');
const deadProbe = () => {
  const g = document.querySelector('.grid').getBoundingClientRect();
  const p = document.querySelector('.panel').getBoundingClientRect();
  const l = document.querySelector('.left').getBoundingClientRect();
  return { over: +(p.top - g.top).toFixed(1), under: +(g.bottom - p.bottom).toFixed(1), leftOver: +(l.top - g.top).toFixed(1), leftUnder: +(g.bottom - l.bottom).toFixed(1) };
};
for (const w of [1001, 1024, 1112, 1180, 1280, 1366, 1440, 1920]) {
  const row = [];
  for (const f of FILES) { const r = await at(f, w, deadProbe); row.push(`${f.slice(0, 4)} panel↑${r.over}/↓${r.under} vä↑${r.leftOver}/↓${r.leftUnder}`); }
  console.log(String(w).padEnd(6), row.join('  '));
}

// ---- 4. FIX-PROV: flytta .cta-regeln ur @supports-not
console.log('\n===== 4. FIX-PROV: .cta{width:100%;padding:11px 16px;gap:10px;white-space:normal} @≤430 =====');
const FIX = `@media (max-width:430px){.cta{width:100%;padding:11px 16px;gap:10px;white-space:normal;line-height:1.25;text-align:center;}}`;
const ctaFit = () => {
  const c = document.querySelector('.cta'), r = c.getBoundingClientRect();
  const cl = c.cloneNode(true); cl.style.cssText += ';position:absolute;left:-9999px;width:max-content;max-width:none;';
  document.body.appendChild(cl); const want = cl.getBoundingClientRect().width; cl.remove();
  const panel = document.querySelector('.panel'), pcs = getComputedStyle(panel);
  const avail = panel.getBoundingClientRect().width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
  return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), want: +want.toFixed(1), over: +(want - r.width).toFixed(1), avail: +avail.toFixed(1) };
};
for (const w of [320, 344, 360, 375, 390, 414, 430]) {
  const out = [];
  for (const f of FILES) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    await p.addStyleTag({ content: FIX });
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(ctaFit); await p.close();
    out.push(`${f.slice(0, 4)}:w${r.w}h${r.h}${r.over > 0.5 ? ' ÖVER+' + r.over : ' OK'}`);
  }
  console.log(String(w).padEnd(5), out.join('  '));
}

// ---- 5. CSS-parsefel + dubbletter
console.log('\n===== 5. CSS: parsefel + dubblettregler =====');
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  const r = await p.evaluate(() => {
    const sheet = document.styleSheets[0];
    const rules = Array.from(sheet.cssRules);
    const flat = [];
    const walk = (rs, ctx) => rs.forEach(r => {
      if (r.cssRules) walk(Array.from(r.cssRules), ctx + ' > ' + (r.conditionText || r.name || r.type));
      else if (r.selectorText) flat.push(ctx + ' || ' + r.selectorText);
    });
    walk(rules, '');
    const counts = {};
    for (const k of flat) counts[k] = (counts[k] || 0) + 1;
    return { total: rules.length, dupes: Object.entries(counts).filter(([, v]) => v > 1) };
  });
  console.log(f.padEnd(18), 'toppregler:', r.total, 'konsolfel:', errs.length);
  for (const [sel, n] of r.dupes) console.log('    DUBBLETT ×' + n + ':', sel);
  await p.close();
}
await b.close();
