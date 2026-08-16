import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const browser = await chromium.launch();
const variants = [
  ['A-current', ''],
  ['B-noskip-8px', 'h2 .accent{text-decoration-skip-ink:none;text-underline-offset:8px;}'],
  ['C-noskip-5px', 'h2 .accent{text-decoration-skip-ink:none;}'],
];
for (const [name, css] of variants) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 600 }, deviceScaleFactor: 3 });
  await page.goto(pathToFileURL(resolve('gt-produkt.html')).href);
  await page.waitForTimeout(300);
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(100);
  const box = await page.locator('h2').boundingBox();
  await page.screenshot({ path: `screens/TYP6-fix-${name}.png`, clip: { x: box.x-8, y: box.y-8, width: Math.min(560, box.width+16), height: box.height+24 } });
  await page.close();
}
await browser.close();
console.log('done');
