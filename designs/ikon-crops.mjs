// Detaljcrops för ikonstudien: node ikon-crops.mjs <outprefix> [width]
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [,, prefix, wArg] = process.argv;
const W = Number(wArg) || 1440;
const url = pathToFileURL(resolve('ikon-varianter.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(url);
await page.waitForTimeout(700);

await page.locator('.strip').screenshot({ path: `${prefix}-strip.png` });
for (const k of ['a','b','c','d','e','f']) {
  await page.locator(`section.v-${k} .vcard`).screenshot({ path: `${prefix}-${k}.png` });
}
await browser.close();
console.log('cropped', prefix, W);
