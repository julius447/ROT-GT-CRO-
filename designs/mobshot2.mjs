// Varv 2: kantbanden 331-345 (nowrap-CTA) + 481-900-staplat + overflowkontroll
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const widths = [332, 340, 345, 346, 480, 700];
const browser = await chromium.launch();
for (const f of files) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(pathToFileURL(resolve(`${f}.html`)).href);
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      const cta = document.querySelector('.cta');
      const panel = document.querySelector('.panel');
      const r = cta.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(cta);
      const lines = new Set([...range.getClientRects()].filter(x=>x.width>1&&x.height>8).map(x=>Math.round(x.top))).size;
      return {
        hscroll: doc.scrollWidth - doc.clientWidth,
        ctaOverflow: Math.round((cta.scrollWidth - cta.clientWidth)*10)/10,
        ctaVsPanel: Math.round((r.right - (pr.right - parseFloat(getComputedStyle(panel).paddingRight)))*10)/10,
        ctaW: Math.round(r.width), ctaH: Math.round(r.height), lines,
        fs: getComputedStyle(cta).fontSize, nowrap: getComputedStyle(cta).whiteSpace
      };
    });
    if (w === 340 || w === 345) await page.locator('.panel').screenshot({ path: `screens/MOB2-${f}-${w}.png` });
    console.log(f, w, JSON.stringify(m));
    await page.close();
  }
}
await browser.close();
