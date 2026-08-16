// node shot-widths.mjs <file.html> <outprefix> — renders 1280 and 1600 fullpage
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const [,, file, prefix] = process.argv;
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();
for (const [name, w, h] of [['1280', 1280, 1000], ['1600', 1600, 1000]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${prefix}-${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log('saved', prefix);
