// Paritetssvep: jämför hemforsakring.html mot basen d2-kvittot-forst.html
// node measure-parity.mjs
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = {
  bas: 'd2-kvittot-forst.html',
  hem: 'hemforsakring.html',
};
const widths = [];
for (let w = 320; w <= 1440; w += (w < 1000 ? 40 : 10)) widths.push(w);
widths.push(1600);

const browser = await chromium.launch();
const out = {};
for (const [key, file] of Object.entries(files)) {
  const url = pathToFileURL(resolve(file)).href;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url);
  out[key] = {};
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.waitForTimeout(60);
    out[key][w] = await page.evaluate(() => {
      const lh = (el, base) => Math.round(el.getBoundingClientRect().height);
      const rows = [...document.querySelectorAll('.r-row')].map(r => Math.round(r.getBoundingClientRect().height));
      const cap = document.querySelector('.p-cap');
      const tot = document.querySelector('.r-total');
      const tl = tot.querySelector('.t-label');
      const ta = tot.querySelector('.amt');
      const h2 = document.querySelector('h2');
      const fine = document.querySelector('.fine');
      const block = document.querySelector('.block');
      const capLines = Math.round(cap.getBoundingClientRect().height / parseFloat(getComputedStyle(cap).lineHeight || 20));
      return {
        rows,
        cap: Math.round(cap.getBoundingClientRect().height),
        tLabel: Math.round(tl.getBoundingClientRect().height),
        tGap: Math.round(ta.getBoundingClientRect().left - tl.getBoundingClientRect().right),
        h2: Math.round(h2.getBoundingClientRect().height),
        fine: Math.round(fine.getBoundingClientRect().height),
        block: Math.round(block.getBoundingClientRect().height),
        scrollX: Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth),
      };
    });
  }
  await page.close();
}
await browser.close();

const bad = [];
console.log('bredd | rad1 bas/hem | rad2 bas/hem | tLabel bas/hem | tGap bas/hem | cap bas/hem | block bas/hem | scrollX');
for (const w of widths) {
  const b = out.bas[w], h = out.hem[w];
  const flag = [];
  if (b.rows[0] !== h.rows[0]) flag.push('RAD1');
  if (b.rows[1] !== h.rows[1]) flag.push('RAD2');
  if (b.tLabel !== h.tLabel) flag.push('TLABEL');
  if (b.cap !== h.cap) flag.push('CAP');
  if (h.scrollX > 0) flag.push('SCROLLX');
  if (flag.length) bad.push(`${w}: ${flag.join(',')}`);
  console.log(`${w} | ${b.rows[0]}/${h.rows[0]} | ${b.rows[1]}/${h.rows[1]} | ${b.tLabel}/${h.tLabel} | ${b.tGap}/${h.tGap} | ${b.cap}/${h.cap} | ${b.block}/${h.block} | ${h.scrollX}${flag.length ? '   <<< ' + flag.join(',') : ''}`);
}
console.log('\nAVVIKELSER:', bad.length ? bad.join(' · ') : 'INGA');
