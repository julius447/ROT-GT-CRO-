// State-render helper for d3: clicks Ja+Ja (or Ja+Nej) and screenshots the flow-on state.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const url = pathToFileURL(resolve('d3-processen-som-verktyg.html')).href;
const browser = await chromium.launch();
for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url);
  // Ja + Ja → flow-on
  await page.click('.seg[data-q="own"] button[data-v="ja"]');
  await page.click('.seg[data-q="tax"] button[data-v="ja"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `screens/d3-state-ok-${name}.png`, fullPage: true });
  // Ja + Nej → hm verdict
  await page.click('.seg[data-q="tax"] button[data-v="nej"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `screens/d3-state-hm-${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log('saved state shots');
