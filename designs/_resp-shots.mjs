import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { mkdirSync } from 'fs';
mkdirSync('screens/resp', { recursive: true });
const b = await chromium.launch();
const jobs = [
  ['d2-kvittot-forst', 320, 900, 'd2-320'],
  ['gt-generisk', 320, 900, 'gtg-320'],
  ['hemforsakring', 320, 900, 'hf-320'],
  ['hemforsakring', 360, 900, 'hf-360'],
  ['d2-kvittot-forst', 375, 900, 'd2-375'],
  ['d2-kvittot-forst', 744, 1133, 'd2-744'],
  ['d2-kvittot-forst', 768, 1024, 'd2-768'],
  ['hemforsakring', 834, 1194, 'hf-834'],
  ['gt-produkt', 810, 1080, 'gtp-810'],
  ['gt-produkt', 1001, 900, 'gtp-1001'],
  ['gt-generisk', 1001, 900, 'gtg-1001'],
  ['hemforsakring', 1024, 768, 'hf-1024L'],
  ['d2-kvittot-forst', 1412, 900, 'd2-1412'],
  ['d2-kvittot-forst', 1920, 1000, 'd2-1920'],
];
for (const [f, w, h, name] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `screens/resp/${name}.png`, fullPage: true });
  await p.close();
}
// Bricks-container-varianten
for (const [cont, vp, name] of [[1100, 1920, 'bricks-1100'], [800, 1920, 'bricks-800']]) {
  const p = await b.newPage({ viewport: { width: vp, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
  await p.addStyleTag({ content: `body{padding-left:0!important;padding-right:0!important}.brx-container{max-width:${cont}px;margin:0 auto;padding:0 20px;box-sizing:border-box}` });
  await p.evaluate(() => { const c = document.createElement('div'); c.className = 'brx-container'; const bl = document.querySelector('.block'); bl.parentNode.insertBefore(c, bl); c.appendChild(bl); });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `screens/resp/${name}.png`, fullPage: true });
  await p.close();
}
await b.close();
console.log('ok');
