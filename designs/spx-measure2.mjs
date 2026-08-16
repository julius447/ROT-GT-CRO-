// Runda 2: textbotten-luft, 1024-fönstret, CTA-bredd vs panelbredd, pad-y-hypotesprov.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst.html', 'gt-produkt.html', 'gt-generisk.html', 'hemforsakring.html'];
const vps = [[1440,1000],[1280,900],[1120,900],[1024,900]];
const browser = await chromium.launch();
const page = await browser.newPage();

for (const f of files) {
  for (const [w,h] of vps) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const panel = q('.panel').getBoundingClientRect();
      const lastP = q('.left .step:last-child p').getBoundingClientRect();
      const h2r = q('h2').getBoundingClientRect();
      const cta = q('.cta').getBoundingClientRect();
      const fine = q('.fine').getBoundingClientRect();
      const ctaw = q('.cta-wrap').getBoundingClientRect();
      const block = q('.block').getBoundingClientRect();
      return {
        leftTextDead: +(panel.bottom - lastP.bottom).toFixed(1),
        h2TopAir: +(h2r.top - block.top).toFixed(1),
        ctaW: +cta.width.toFixed(1),
        panelInner: +(panel.width - 2*parseFloat(getComputedStyle(q('.panel')).paddingLeft)).toFixed(1),
        fineToCtaw: +(ctaw.top - fine.bottom).toFixed(1),
        blockH: +block.height.toFixed(1),
      };
    });
    console.log(f.padEnd(24), w, JSON.stringify(m));
  }
}

// Hypotesprov: pad-y höjs till pad-x-nivå på d2 — före/efter-skott @1440
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
await page.waitForTimeout(300);
await page.screenshot({ path: 'screens/SPX-hypo-before.png', fullPage: false });
await page.addStyleTag({ content: ':root{--pad-y: clamp(36px, 4.4vw, 80px);}' });
await page.waitForTimeout(150);
const hb = await page.evaluate(() => document.querySelector('.block').getBoundingClientRect().height.toFixed(1));
console.log('d2 @1440 med pad-y=pad-x: blockH', hb);
await page.screenshot({ path: 'screens/SPX-hypo-after.png', fullPage: false });
await browser.close();
