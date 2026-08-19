import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const SIZES = [[744,1133,'iPad mini P'],[768,1024,'iPad P'],[810,1080,'iPad 10 P'],[834,1194,'iPad Air P'],
               [1024,768,'iPad L'],[1080,810,'iPad 10 L'],[1112,834,'iPad Pro 10.5 L'],[1180,820,'iPad Air L'],[1366,1024,'iPad Pro 12.9 L']];
const FILES = ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const b = await chromium.launch();
for (const [w,h,name] of SIZES) {
  const out = [];
  for (const f of FILES) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(220);
    const r = await p.evaluate(() => {
      const doc = document.documentElement;
      const blk = document.querySelector('.block').getBoundingClientRect();
      const panel = document.querySelector('.panel').getBoundingClientRect();
      const grid = getComputedStyle(document.querySelector('.grid')).gridTemplateColumns;
      const stacked = grid.split(' ').length === 1;
      // spill: något barn utanför sin panel?
      const spill = [...document.querySelectorAll('.panel *')].some(e => {
        const q = e.getBoundingClientRect();
        return q.width > 0 && (q.right > panel.right + 1 || q.left < panel.left - 1);
      });
      return { o: doc.scrollWidth > doc.clientWidth, stacked, spill,
               panelW: Math.round(panel.width), blockH: Math.round(blk.height) };
    });
    out.push(`${f.slice(0,6)}:${r.o?'OVERFLOW ':''}${r.spill?'SPILL ':''}${r.stacked?'stack':'2sp'}/${r.panelW}`);
    await p.close();
  }
  console.log(`${name.padEnd(16)} ${w}x${h}  ` + out.join('  '));
}
await b.close();
