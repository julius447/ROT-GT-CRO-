// KONSOLIDERING pass 8 — fixbevis injicerade i BLOCKETS EGEN <style> (rätt kaskadposition).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const out = {};

const inject = css => { const s = document.getElementById('ampy-block-css'); s.textContent += '\n' + css; };

const ink = () => {
  const cta = document.querySelector('.cta'); const cb = cta.getBoundingClientRect();
  let minL = Infinity, maxR = -Infinity;
  const w = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const rr of r.getClientRects()) { minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); } }
  for (const e of cta.querySelectorAll('svg')) { const rr = e.getBoundingClientRect(); minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); }
  return [+(minL - cb.left).toFixed(2), +cb.height.toFixed(1), +cb.width.toFixed(1)];
};

const CTAFIX = `@media (max-width:430px){
  .cta{ width:100%; max-width:100%; padding:11px 14px; gap:10px;
        white-space:normal; text-wrap:balance; line-height:1.25; }
}`;

out.ctaFix = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 320, height: 900 } });
  await p.goto(u('font404-' + f + '.html')); await p.waitForTimeout(500);
  const WS = [320, 344, 360, 375, 390, 412, 430];
  const fore = {}; for (const w of WS) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80); fore[w] = await p.evaluate(ink); }
  await p.evaluate(inject, CTAFIX); await p.waitForTimeout(150);
  const efter = {}; for (const w of WS) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80); efter[w] = await p.evaluate(ink); }
  out.ctaFix[f] = { fore, efter };
  await p.close();
}

// container-query-fix, omkalibrerad mot den RIKTIGA 1280-containern
const CQ_RESP = `.block{ container-type:inline-size; container-name:rotblk; }
.block{ padding: clamp(44px,5.4cqi,100px) clamp(24px,4.4cqi,80px); }
.block .grid{ grid-template-columns: minmax(0,1fr) clamp(466px,33cqi,530px); gap: clamp(48px,5.5cqi,96px); }
.panel{ --panel-pad-x: clamp(24px,2.2cqi,32px); }
@container rotblk (max-width:1064px){ .block .grid{ grid-template-columns:minmax(0,1fr) clamp(456px,42cqi,500px); gap:44px } }
@container rotblk (max-width:944px){ .block .grid{ grid-template-columns:1fr; gap:56px; max-width:700px; margin-inline:auto } }`;

const CQ_TUNED = `.block{ container-type:inline-size; container-name:rotblk; }
.block{ padding: clamp(44px,5.4cqi,100px) clamp(24px,4.4cqi,80px); }
.block .grid{ grid-template-columns: minmax(0,1fr) clamp(466px,37cqi,530px); gap: clamp(48px,6cqi,96px); }
.panel{ --panel-pad-x: clamp(24px,2.4cqi,32px); }
@container rotblk (max-width:1180px){ .block .grid{ grid-template-columns:minmax(0,1fr) 456px; gap:44px } }
@container rotblk (max-width:1000px){ .block .grid{ grid-template-columns:1fr; gap:56px; max-width:700px; margin-inline:auto } }`;

const geo = () => { const q = s => document.querySelector(s); const pa = q('.panel'), cs = getComputedStyle(pa); return { block: +q('.block').getBoundingClientRect().width.toFixed(1), left: +q('.left').getBoundingClientRect().width.toFixed(1), panel: +pa.getBoundingClientRect().width.toFixed(1), inner: +(pa.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(2), row: getComputedStyle(q('.r-row')).display, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth }; };
const WS2 = [390, 744, 768, 834, 1024, 1112, 1180, 1280, 1366, 1412, 1440, 1600, 1920, 2560];

out.cq = {};
for (const [tag, css] of [['ingen', null], ['RESPONSIV-forslag', CQ_RESP], ['omkalibrerad', CQ_TUNED]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(u('font404-d2-kvittot-forst.html')); await p.waitForTimeout(500);
  if (css) { await p.evaluate(inject, css); await p.waitForTimeout(150); }
  const r = {}; for (const w of WS2) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(100); r[w] = await p.evaluate(geo); }
  out.cq[tag] = r;
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
