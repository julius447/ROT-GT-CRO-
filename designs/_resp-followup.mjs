import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const P = async (f, w, h = 900, fn, css = null) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  if (css) await p.addStyleTag({ content: css });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(fn);
  await p.close(); return r;
};

// ---------- A: container-query marginal (panel inner vs 400px-tröskeln) ----------
const probeCQ = () => {
  const panel = document.querySelector('.panel'), cs = getComputedStyle(panel);
  const inner = panel.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
  return {
    inner: +inner.toFixed(2),
    rowMode: getComputedStyle(document.querySelector('.r-row')).display,
    cols: getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length,
    padx: cs.paddingLeft
  };
};
console.log('===== A. PANEL INNER-BREDD vs 400px CONTAINER-TRÖSKELN (d2, 1121-1700) =====');
let min = { inner: 1e9 };
for (let w = 1121; w <= 1700; w += 1) {
  const r = await P('d2-kvittot-forst', w, 900, probeCQ);
  if (r.inner < min.inner) min = { ...r, w };
  if (w % 40 === 1 || Math.abs(r.inner - 400) < 6) console.log(`  ${w}px inner=${r.inner} pad=${r.padx} mode=${r.rowMode}`);
}
console.log('  *** MINIMUM i tvåspaltsbandet:', JSON.stringify(min), ' marginal till 400 =', (min.inner - 400).toFixed(2), 'px');

// ---------- B: hur mycket extern CSS tål blocket innan kvittot kollapsar? ----------
console.log('\n===== B. ROBUSTHET: extern container-padding (Bricks/tema) vid 1440 =====');
for (const pad of [0, 2, 4, 8, 12, 16, 20, 24, 32, 40]) {
  const r = await P('d2-kvittot-forst', 1440, 900, probeCQ, `body{padding-left:${pad + 28}px;padding-right:${pad + 28}px}`);
  console.log(`  +${pad}px extern padding → panel inner ${r.inner} → r-row ${r.rowMode}${r.rowMode === 'grid' ? '   <<< KOLLAPS' : ''}`);
}
console.log('   samma test @1412 (bandets värsta punkt):');
for (const pad of [0, 1, 2, 4, 8]) {
  const r = await P('d2-kvittot-forst', 1412, 900, probeCQ, `body{padding-left:${pad + 28}px;padding-right:${pad + 28}px}`);
  console.log(`  +${pad}px → inner ${r.inner} → ${r.rowMode}${r.rowMode === 'grid' ? '   <<< KOLLAPS' : ''}`);
}
console.log('   Bricks typiskt: .block ärver ingen padding, men temats box-sizing/font-size påverkar. font-size 17px på html:');
for (const fs of [16, 17, 18, 20]) {
  const r = await P('d2-kvittot-forst', 1440, 900, probeCQ, `html{font-size:${fs}px}`);
  console.log(`  html font-size ${fs}px → inner ${r.inner} → ${r.rowMode}`);
}

// ---------- C: CTA-textens overflow (nowrap + max-width:100%) ----------
console.log('\n===== C. CTA: text-overflow (scrollWidth vs clientWidth) =====');
const probeCTA = () => {
  const c = document.querySelector('.cta'); const cs = getComputedStyle(c);
  const r = c.getBoundingClientRect();
  // bredd som innehållet VILL ha
  const clone = c.cloneNode(true); clone.style.cssText += ';position:absolute;left:-9999px;width:max-content;max-width:none;';
  document.body.appendChild(clone); const want = clone.getBoundingClientRect().width; clone.remove();
  return { w: +r.width.toFixed(1), want: +want.toFixed(1), over: +(want - r.width).toFixed(1), scroll: c.scrollWidth, client: c.clientWidth, ws: cs.whiteSpace, maxw: cs.maxWidth, cssw: cs.width };
};
for (const w of [320, 330, 344, 346, 360, 375, 390, 400, 414, 430, 460, 480]) {
  const row = [];
  for (const f of FILES) { const r = await P(f, w, 900, probeCTA); row.push(`${f.slice(0, 4)}:w${r.w}/vill${r.want}${r.over > 0.5 ? ' ÖVER+' + r.over : ''}`); }
  console.log(String(w).padEnd(5), row.join('  '));
}

// ---------- D: h2 .accent nowrap-överskott i tvåspaltsbandet ----------
console.log('\n===== D. h2 .accent (nowrap >900) bredare än h2-boxen =====');
const probeAcc = () => {
  const h2 = document.querySelector('h2'), a = h2.querySelector('.accent');
  if (!a) return null;
  const H = h2.getBoundingClientRect(), A = a.getBoundingClientRect();
  const left = document.querySelector('.left').getBoundingClientRect();
  const panel = document.querySelector('.panel').getBoundingClientRect();
  return { h2w: +H.width.toFixed(1), accW: +A.width.toFixed(1), over: +(A.right - H.right).toFixed(1),
    leftW: +left.width.toFixed(1), accRight: +A.right.toFixed(1), panelLeft: +panel.left.toFixed(1),
    clearance: +(panel.left - A.right).toFixed(1), ws: getComputedStyle(a).whiteSpace };
};
for (const f of FILES) {
  const bad = [];
  for (let w = 901; w <= 1200; w += 1) {
    const r = await P(f, w, 900, probeAcc);
    if (r && r.over > 0.5) bad.push({ w, ...r });
  }
  if (bad.length) console.log(` ${f}: ÖVERSPILL vid ${bad[0].w}-${bad[bad.length - 1].w}px  (max ${Math.max(...bad.map(x => x.over)).toFixed(1)}px, minsta luft till panelen ${Math.min(...bad.map(x => x.clearance)).toFixed(1)}px)`);
  else console.log(` ${f}: inget överspill 901-1200`);
}

// ---------- E: container-query flip-punkt (400px) på mobil/surfplatta ----------
console.log('\n===== E. Container-query flip-punkt (r-row grid→flex) 400-620px =====');
for (const f of FILES.slice(0, 1)) {
  let prev = null;
  for (let w = 400; w <= 620; w++) {
    const r = await P(f, w, 900, probeCQ);
    if (prev && prev !== r.rowMode) console.log(`  flip vid ${w}px (inner ${r.inner}) ${prev} → ${r.rowMode}`);
    prev = r.rowMode;
  }
}
// vad händer precis ÖVER flip: får raden plats?
console.log('  radbredder precis över flip:');
const probeRow = () => Array.from(document.querySelectorAll('.r-row')).map(r => {
  const l = r.querySelector('.lbl'), a = r.querySelector('.amt'), d = r.querySelector('.dots');
  const R = e => e ? +e.getBoundingClientRect().width.toFixed(1) : null;
  const lines = l ? new Set(Array.from(l.getClientRects()).map(x => Math.round(x.top))).size : 0;
  return { lbl: R(l), dots: R(d), amt: R(a), lblLines: lines, rowH: +r.getBoundingClientRect().height.toFixed(1) };
});
for (const w of [510, 512, 514, 520, 540, 600]) {
  const r = await P('gt-produkt', w, 900, probeRow);
  console.log(`  ${w}px`, JSON.stringify(r));
}

await b.close();
