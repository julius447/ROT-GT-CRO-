// Review probe for d2: interaction states + a11y checks
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const url = pathToFileURL(resolve('d2-kvittot-forst.html')).href;
const browser = await chromium.launch();

// Desktop ja/ja
let page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url);
await page.click('.seg[data-q="own"] button[data-v="ja"]');
await page.click('.seg[data-q="tax"] button[data-v="ja"]');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screens/d2-review-jaja-desktop.png', fullPage: true });

// checks
const qBorder = await page.evaluate(() => {
  const qs = document.querySelectorAll('.q');
  const last = qs[qs.length - 1];
  return getComputedStyle(last).borderBottomWidth;
});
console.log('last .q border-bottom-width (should be 0px if selector works):', qBorder);

// focus ring on CTA
await page.evaluate(() => document.querySelector('.cta').focus());
const ctaShadow = await page.evaluate(() => {
  const el = document.querySelector('.cta');
  el.classList.add('force-fv'); // can't force :focus-visible; instead compare
  return getComputedStyle(el).boxShadow;
});
console.log('CTA box-shadow while focused (mouse-focus, informational):', ctaShadow);
// keyboard focus-visible test
await page.keyboard.press('Escape');
await page.evaluate(() => document.activeElement.blur());
// Tab until CTA focused
let focused = '';
for (let i = 0; i < 20; i++) {
  await page.keyboard.press('Tab');
  focused = await page.evaluate(() => document.activeElement.className || document.activeElement.tagName);
  if (focused.includes('cta')) break;
}
const ctaFvShadow = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
console.log('CTA box-shadow under keyboard focus-visible:', ctaFvShadow);
await page.screenshot({ path: 'screens/d2-review-cta-focus.png', clip: { x: 780, y: 560, width: 660, height: 260 } });

// keyboard focus-visible on a selected Nej button
await page.click('.seg[data-q="tax"] button[data-v="nej"]');
await page.evaluate(() => document.querySelector('.seg[data-q="tax"] button[data-v="nej"]').blur());
// tab to it
await page.evaluate(() => document.querySelector('.seg[data-q="tax"] button[data-v="ja"]').focus());
await page.keyboard.press('Tab');
const nejFocusShadow = await page.evaluate(() => [document.activeElement.textContent.trim(), getComputedStyle(document.activeElement).boxShadow]);
console.log('focused selected Nej button [text, box-shadow]:', nejFocusShadow);
await page.close();

// Desktop ja/nej (stale hint?)
page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url);
await page.click('.seg[data-q="own"] button[data-v="ja"]');
await page.click('.seg[data-q="tax"] button[data-v="nej"]');
await page.waitForTimeout(400);
const hintVisible = await page.evaluate(() => getComputedStyle(document.querySelector('.unlock-hint')).display);
console.log('unlock-hint display after ja/nej answered (stale if not none):', hintVisible);
await page.screenshot({ path: 'screens/d2-review-janej-desktop.png', fullPage: true });
await page.close();

// Mobile ja/ja
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url);
await page.click('.seg[data-q="own"] button[data-v="ja"]');
await page.click('.seg[data-q="tax"] button[data-v="ja"]');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screens/d2-review-jaja-mobile.png', fullPage: true });
await page.close();

await browser.close();
console.log('done');
