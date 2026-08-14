// Render→see helper: node shot.mjs <file.html> <outprefix>
// Saves <outprefix>-desktop.png (1440) and <outprefix>-mobile.png (390).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [,, file, prefix] = process.argv;
if (!file || !prefix) { console.error('usage: node shot.mjs <file.html> <outprefix>'); process.exit(1); }
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();
for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${prefix}-${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log('saved', `${prefix}-desktop.png`, `${prefix}-mobile.png`);
