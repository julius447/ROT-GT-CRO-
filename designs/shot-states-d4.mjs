import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const url = pathToFileURL(resolve('d4-ett-kort.html')).href;
const browser = await chromium.launch();

const states = [
  ['q2', async p => { await p.click('#f1 .btn-row button:first-child'); await p.waitForTimeout(500); }],
  ['ok', async p => {
    await p.click('#f1 .btn-row button:first-child'); await p.waitForTimeout(400);
    await p.click('#f2 .btn-row button:first-child'); await p.waitForTimeout(700);
  }],
  ['nej1', async p => { await p.click('#f1 .btn-row button:nth-child(2)'); await p.waitForTimeout(400);
    await p.click('#f2 .btn-row button:first-child'); await p.waitForTimeout(700); }],
  ['nej2', async p => { await p.click('#f1 .btn-row button:first-child'); await p.waitForTimeout(400);
    await p.click('#f2 .btn-row button:nth-child(2)'); await p.waitForTimeout(700); }],
];

for (const [w, h, dev] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
  for (const [name, act] of states) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url); await page.waitForTimeout(400);
    await act(page);
    await page.screenshot({ path: `screens/d4-state-${name}-${dev}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log('done');
