import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const jobs = [
  ['d2-kvittot-forst.html', 1440, 'h2', 'screens/TYP6-crop-d2-h2.png'],
  ['gt-produkt.html', 1440, 'h2', 'screens/TYP6-crop-gtp-h2.png'],
  ['gt-generisk.html', 1440, 'h2', 'screens/TYP6-crop-gtg-h2.png'],
  ['hemforsakring.html', 1440, 'h2', 'screens/TYP6-crop-hf-h2.png'],
  ['gt-produkt.html', 1440, '.r-total', 'screens/TYP6-crop-gtp-total.png'],
  ['hemforsakring.html', 1440, '.r-total', 'screens/TYP6-crop-hf-total.png'],
  ['gt-produkt.html', 390, 'h2', 'screens/TYP6-crop-gtp-h2-390.png'],
  ['gt-generisk.html', 390, 'h2', 'screens/TYP6-crop-gtg-h2-390.png'],
  ['hemforsakring.html', 390, 'h2', 'screens/TYP6-crop-hf-h2-390.png'],
  ['d2-kvittot-forst.html', 390, 'h2', 'screens/TYP6-crop-d2-h2-390.png'],
];
const browser = await chromium.launch();
for (const [file, w, sel, out] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(file)).href);
  await page.waitForTimeout(400);
  const el = page.locator(sel).first();
  const box = await el.boundingBox();
  await page.screenshot({ path: out, clip: { x: Math.max(0, box.x - 12), y: Math.max(0, box.y - 12), width: Math.min(w, box.width + 24), height: box.height + 24 } });
  await page.close();
}
await browser.close();
console.log('crops done');
