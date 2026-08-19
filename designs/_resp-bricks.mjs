import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();

// Simulera Bricks: temat lägger blocket i en container med max-width.
// Blocket självt är oförändrat — bara omslaget läggs till (som i WP).
const WRAP = (maxw) => `
  body{padding-left:0!important;padding-right:0!important;}
  .brx-container{max-width:${maxw}px;margin:0 auto;padding:0 20px;box-sizing:border-box;}
`;
const wrapJs = () => {
  const c = document.createElement('div'); c.className = 'brx-container';
  const blk = document.querySelector('.block'); blk.parentNode.insertBefore(c, blk); c.appendChild(blk);
};
const probe = () => {
  const q = s => document.querySelector(s);
  const R = e => e.getBoundingClientRect();
  const grid = q('.grid'), left = q('.left'), panel = q('.panel'), block = q('.block');
  const cs = getComputedStyle(panel);
  const inner = R(panel).width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
  // spill av element utanför blockets innerkant
  const bc = getComputedStyle(block), br = R(block);
  const innerL = br.left + parseFloat(bc.paddingLeft), innerR = br.right - parseFloat(bc.paddingRight);
  let worst = 0, who = '';
  for (const e of document.querySelectorAll('.grid *')) {
    if (e.tagName === 'svg' || e.closest('svg')) continue;
    const r = R(e); if (!r.width) continue;
    const o = Math.max(innerL - r.left, r.right - innerR);
    if (o > worst) { worst = o; who = e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className : ''); }
  }
  // h2 rader
  const h2 = q('h2'); const h2lines = new Set(Array.from(h2.getClientRects()).map(r => Math.round(r.top))).size;
  return {
    docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    blockW: +R(block).width.toFixed(1), gridW: +R(grid).width.toFixed(1),
    leftW: +R(left).width.toFixed(1), panelW: +R(panel).width.toFixed(1), inner: +inner.toFixed(1),
    cols: getComputedStyle(grid).gridTemplateColumns,
    gap: getComputedStyle(grid).columnGap,
    rowMode: getComputedStyle(q('.r-row')).display,
    worstSpill: +worst.toFixed(1), who, h2lines,
    ctaW: +R(q('.cta')).width.toFixed(1)
  };
};

console.log('===== BRICKS-SIMULERING: blocket i en tema-container (viewport × container) =====');
console.log('vp    cont   blockW gridW  leftW  panelW inner  gap   rowMode  spill  h2rader  docOver');
for (const vp of [1920, 1600, 1440, 1280]) {
  for (const cont of [1600, 1400, 1280, 1200, 1100, 1000, 900, 800]) {
    if (cont > vp) continue;
    const p = await b.newPage({ viewport: { width: vp, height: 1000 } });
    await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
    await p.addStyleTag({ content: WRAP(cont) });
    await p.evaluate(wrapJs);
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(probe);
    const flag = (r.leftW < 300 ? ' <<< VÄNSTERSPALT KROSSAD' : '') + (r.worstSpill > 1 ? ' <<< SPILL ' + r.who : '') + (r.docOver > 0 ? ' <<< DOC-OVERFLOW' : '') + (r.rowMode === 'grid' ? ' <<< KVITTO KOLLAPSAT' : '');
    console.log(String(vp).padEnd(5), String(cont).padEnd(6), String(r.blockW).padEnd(6), String(r.gridW).padEnd(6), String(r.leftW).padEnd(6), String(r.panelW).padEnd(6), String(r.inner).padEnd(6), String(r.gap).padEnd(5), r.rowMode.padEnd(8), String(r.worstSpill).padEnd(6), String(r.h2lines).padEnd(8), String(r.docOver) + flag);
    await p.close();
  }
}

console.log('\n===== SAMMA TEST, alla fyra filer @1920 vp / 1100px container (Bricks-default-ish) =====');
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  await p.addStyleTag({ content: WRAP(1100) });
  await p.evaluate(wrapJs);
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(probe);
  console.log(f.padEnd(18), JSON.stringify(r));
  await p.close();
}

console.log('\n===== KONTROLL: samma container-bredder men BLOCKET ENSAMT (ingen wrapper) =====');
console.log('(visar att defekten kommer av vw-beroendet, inte av wrappen i sig)');
for (const vp of [1100, 1000, 900]) {
  const p = await b.newPage({ viewport: { width: vp, height: 1000 } });
  await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(probe);
  console.log('vp', vp, JSON.stringify({ leftW: r.leftW, panelW: r.panelW, cols: r.cols, rowMode: r.rowMode }));
  await p.close();
}
await b.close();
