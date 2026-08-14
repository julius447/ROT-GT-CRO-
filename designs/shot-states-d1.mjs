// Interactive-state renders for d1: answers ja/ja (reveal) + ja/nej (hm) + 1-of-2 (wait)
import { chromium } from './node_modules/playwright/index.mjs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const file = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d1-kollen-forst.html';
const out = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens';
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();

const scenarios = [
  ['ok',   [['own','ja'],['tax','ja']]],
  ['hm',   [['own','ja'],['tax','nej']]],
  ['wait', [['own','ja']]],
];
const prefix = process.argv[2] || 'd1-states';

for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  for (const [tag, clicks] of scenarios) {
    if (tag !== 'ok' && name === 'mobile' && tag === 'wait') continue;
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url);
    for (const [q, v] of clicks) await page.click(`.seg[data-q="${q}"] button[data-v="${v}"]`);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${prefix}-${tag}-${name}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log('done');
