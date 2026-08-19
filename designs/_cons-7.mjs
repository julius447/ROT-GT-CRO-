// KONSOLIDERING pass 7 — fixbevis för CTA + container-blindhet, i PRODUKTION.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const out = {};

const CTAFIX = `@media (max-width:430px){
  .cta{ width:100%; max-width:100%; padding:11px 14px; gap:10px;
        white-space:normal; text-wrap:balance; line-height:1.25; }
}`;
const CQFIX = `.block{ container-type: inline-size; container-name: rotblk; }
.block{ padding: clamp(44px,5.4cqi,100px) clamp(24px,4.4cqi,80px); }
.block .grid{ grid-template-columns: minmax(0,1fr) clamp(466px,33cqi,530px); gap: clamp(48px,5.5cqi,96px); }
.panel{ --panel-pad-x: clamp(24px,2.2cqi,32px); }
@container rotblk (max-width:1064px){ .block .grid{ grid-template-columns:minmax(0,1fr) clamp(456px,42cqi,500px); gap:44px } }
@container rotblk (max-width:944px){ .block .grid{ grid-template-columns:1fr; gap:56px; max-width:700px; margin-inline:auto } }`;

const ink = () => {
  const cta = document.querySelector('.cta'); const cb = cta.getBoundingClientRect();
  let minL = Infinity, maxR = -Infinity;
  const w = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const rr of r.getClientRects()) { minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); } }
  for (const e of cta.querySelectorAll('svg')) { const rr = e.getBoundingClientRect(); minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); }
  return [+(minL - cb.left).toFixed(2), +(cb.right - maxR).toFixed(2), +cb.height.toFixed(1), +cb.width.toFixed(1)];
};

out.ctaFix = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 320, height: 900 } });
  await p.goto(u('font404-' + f + '.html')); await p.waitForTimeout(500);
  const before = {}, after = {};
  for (const w of [320, 344, 360, 375, 390, 412, 430]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80); before[w] = await p.evaluate(ink); }
  await p.addStyleTag({ content: CTAFIX });
  for (const w of [320, 344, 360, 375, 390, 412, 430]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80); after[w] = await p.evaluate(ink); }
  out.ctaFix[f] = { fore: before, efter: after };
  await p.close();
}

// container-fix i produktion
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(u('font404-d2-kvittot-forst.html')); await p.waitForTimeout(500);
  const g = () => { const q = s => document.querySelector(s); const pa = q('.panel'), cs = getComputedStyle(pa); return { blockW: +q('.block').getBoundingClientRect().width.toFixed(1), leftW: +q('.left').getBoundingClientRect().width.toFixed(1), panelW: +pa.getBoundingClientRect().width.toFixed(1), inner: +(pa.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(2), row: getComputedStyle(q('.r-row')).display }; };
  out.cqFix = { fore: {}, efter: {} };
  for (const w of [768, 834, 1024, 1112, 1180, 1280, 1366, 1412, 1440, 1600, 1920, 2560]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(90); out.cqFix.fore[w] = await p.evaluate(g); }
  await p.addStyleTag({ content: CQFIX });
  for (const w of [768, 834, 1024, 1112, 1180, 1280, 1366, 1412, 1440, 1600, 1920, 2560]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(90); out.cqFix.efter[w] = await p.evaluate(g); }
  await p.close();
}

// skärmdumpar som bevis
{
  const shots = [['font404-d2-kvittot-forst.html', 320, 'BEVIS-cta-320-produktion.png'],
  ['font404-d2-kvittot-forst.html', 375, 'BEVIS-cta-375-produktion.png'],
  ['host-d2-lazy.html', 1440, 'BEVIS-lazyload-klasskrasch.png'],
  ['font404-d2-kvittot-forst.html', 1024, 'BEVIS-1024-vansterspalt-krossad.png']];
  for (const [f, w, name] of shots) {
    const p = await b.newPage({ viewport: { width: w, height: 1200 } });
    await p.goto(u(f)); await p.waitForTimeout(600);
    const el = await p.$('.block');
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(200);
    try { await el.screenshot({ path: S + name }); }
    catch (e) { await p.screenshot({ path: S + name }); }
    await p.close();
  }
}

await b.close();
console.log(JSON.stringify(out, null, 1));
