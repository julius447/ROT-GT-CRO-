// Mobil-expert slutpanel: render alla fyra @320/360/390/430 + mät nyckelmetrik
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const widths = [320, 360, 390, 430];
const browser = await chromium.launch();
const out = {};
for (const f of files) {
  out[f] = {};
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(pathToFileURL(resolve(`${f}.html`)).href);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screens/MOB-${f}-${w}.png`, fullPage: true });
    const m = await page.evaluate(() => {
      const g = s => document.querySelector(s);
      const cs = el => el ? getComputedStyle(el) : null;
      const r = el => el ? el.getBoundingClientRect() : null;
      const px = v => v ? Math.round(parseFloat(v) * 10) / 10 : null;
      const h2 = g('h2'); const step1h3 = g('.step h3'); const n1 = g('.step .n');
      const cta = g('.cta'); const tel = g('.tel a, .sec-link a');
      const total = g('.r-total .amt'); const tlabel = g('.r-total .t-label');
      const lbl1 = g('.r-row .lbl'); const amt1 = g('.r-row .amt');
      const deductAmt = g('.r-row.deduct .amt');
      const doc = document.documentElement;
      // h2 line count
      const h2r = h2.getClientRects();
      const h2range = document.createRange(); h2range.selectNodeContents(h2);
      const h2lines = [...h2range.getClientRects()].filter(x=>x.width>1);
      // cta text lines
      const ctaRange = document.createRange(); ctaRange.selectNodeContents(cta);
      return {
        hscroll: doc.scrollWidth - doc.clientWidth,
        h2: { fs: px(cs(h2).fontSize), align: cs(h2).textAlign, lines: new Set(h2lines.map(x=>Math.round(x.top))).size, width: Math.round(r(h2).width), mb: px(cs(h2).marginBottom) },
        step: { h3fs: px(cs(step1h3).fontSize), nsz: Math.round(r(n1).width), nfs: px(cs(n1).fontSize) },
        row: { lblfs: px(cs(lbl1).fontSize), amtfs: px(cs(amt1).fontSize), stacked: cs(lbl1.parentElement).display === 'grid', deductfs: deductAmt ? px(cs(deductAmt).fontSize) : null, deductH: deductAmt ? Math.round(r(deductAmt).height) : null },
        total: { fs: px(cs(total).fontSize), labelfs: px(cs(tlabel).fontSize), h: Math.round(r(total).height) },
        cta: { w: Math.round(r(cta).width), h: Math.round(r(cta).height), fs: px(cs(cta).fontSize), textLines: new Set([...ctaRange.getClientRects()].filter(x=>x.width>1&&x.height>8).map(x=>Math.round(x.top))).size, padL: px(cs(cta).paddingLeft), padR: px(cs(cta).paddingRight) },
        tel: tel ? { h: Math.round(r(tel).height), fs: px(cs(tel).fontSize) } : null,
        panelPad: px(cs(g('.panel')).paddingLeft),
        blockPad: px(cs(g('.block')).paddingLeft),
        totalPageH: Math.round(document.body.scrollHeight)
      };
    });
    out[f][w] = m;
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
