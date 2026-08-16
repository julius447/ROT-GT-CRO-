// TYP6 slutpanel: mät typografin i alla fyra blocken vid 1440 / 1120 / 390 / 320.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst.html', 'gt-produkt.html', 'gt-generisk.html', 'hemforsakring.html'];
const widths = [1440, 1120, 390, 320];
const browser = await chromium.launch();

const probe = () => {
  const g = (el, props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = cs[p];
    const r = el.getBoundingClientRect();
    out.rect = { w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    out.text = el.textContent.trim().slice(0, 40);
    return out;
  };
  const T = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'];
  return {
    h2: g(document.querySelector('h2'), [...T, 'textAlign']),
    accent: g(document.querySelector('h2 .accent'), [...T, 'textDecorationLine', 'textDecorationThickness', 'textUnderlineOffset', 'textDecorationColor', 'whiteSpace']),
    h3: g(document.querySelector('.step h3'), T),
    stepP: g(document.querySelector('.step p'), T),
    pcap: g(document.querySelector('.p-cap'), T),
    lbl: g(document.querySelector('.r-row .lbl'), T),
    amt: g(document.querySelector('.r-row .amt'), T),
    pill: g(document.querySelector('.offert-pill'), T),
    deductAmt: g(document.querySelector('.r-row.deduct .amt'), T),
    tLabel: g(document.querySelector('.r-total .t-label'), T),
    totalAmt: g(document.querySelector('.r-total .amt'), T),
    tNote: g(document.querySelector('.r-total .t-note'), T),
    fine: g(document.querySelector('.fine'), T),
    cta: g(document.querySelector('.cta'), T),
    tel: g(document.querySelector('.tel a, .sec-link a'), T),
    fontLoaded: document.fonts.check('450 16px "Outfit"'),
    rTotalH: (() => { const e = document.querySelector('.r-total'); return e ? +e.getBoundingClientRect().height.toFixed(1) : null; })(),
    h2Lines: (() => {
      const h = document.querySelector('h2');
      if (!h) return null;
      const range = document.createRange(); range.selectNodeContents(h);
      const rects = [...range.getClientRects()].filter(r => r.width > 1);
      const ys = [...new Set(rects.map(r => Math.round(r.top)))];
      return ys.length;
    })(),
  };
};

for (const w of widths) {
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(400);
    const data = await page.evaluate(probe);
    console.log(`\n===== ${f} @ ${w} =====`);
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && v.fontSize) {
        console.log(`  ${k}: ${v.fontSize}/${v.fontWeight} lh:${v.lineHeight} ls:${v.letterSpacing} ${v.color} ${v.textDecorationThickness ? 'deco:' + v.textDecorationLine + ' ' + v.textDecorationThickness + '/' + v.textUnderlineOffset + ' ws:' + v.whiteSpace : ''} rect:${v.rect.w}x${v.rect.h} "${v.text}"`);
      } else {
        console.log(`  ${k}: ${JSON.stringify(v)}`);
      }
    }
    await page.close();
  }
}
await browser.close();
