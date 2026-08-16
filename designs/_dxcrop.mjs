import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const browser = await chromium.launch();
const jobs = [
  ['d2-kvittot-forst.html', 1600, {x:60,y:100,width:800,height:140}, 'screens/dxcrop-d2-h2-1600.png'],
  ['gt-produkt.html', 1280, {x:740,y:410,width:480,height:180}, 'screens/dxcrop-gtp-fine-1280.png'],
  ['hemforsakring.html', 1440, {x:820,y:340,width:560,height:120}, 'screens/dxcrop-hf-total-1440.png'],
  ['d2-kvittot-forst.html', 1440, {x:820,y:340,width:560,height:120}, 'screens/dxcrop-d2-total-1440.png'],
];
for (const [f, w, clip, out] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(f)).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, clip });
  await page.close();
}
await browser.close();
console.log('ok');
