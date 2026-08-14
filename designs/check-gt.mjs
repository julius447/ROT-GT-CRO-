// Radbrytnings-, slot- och overflow-mätning för gt-produkt.html
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const file = process.argv[2] || 'gt-produkt.html';
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();

const lineDump = (sel) => `(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  if (!el) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const lines = []; let cur = null;
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent;
    for (let i = 0; i < t.length; i++) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
      const rect = r.getBoundingClientRect();
      if (!rect.height) continue;
      const top = Math.round(rect.top);
      if (!cur || Math.abs(cur.top - top) > 3) { cur = { top, s: '' }; lines.push(cur); }
      cur.s += t[i];
    }
  }
  return lines.map(l => l.s);
})()`;

for (const [name, w] of [['1440', 1440], ['390', 390], ['345', 345], ['320', 320]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url);
  await page.waitForTimeout(400);
  console.log(`\n===== ${name}px =====`);
  for (const sel of ['.r-total .t-note', '.fine', 'h2', '.cta']) {
    const lines = await page.evaluate(lineDump(sel));
    console.log(`  ${sel}: ${lines ? lines.length : 'n/a'} rad(er)`);
    (lines || []).forEach((l, i) => console.log(`    ${i + 1}| ${l}`));
  }
  const m = await page.evaluate(() => {
    const cta = document.querySelector('.cta');
    const doc = document.documentElement;
    return {
      ctaW: Math.round(cta.getBoundingClientRect().width),
      ctaScrollW: cta.scrollWidth,
      ctaH: Math.round(cta.getBoundingClientRect().height),
      hOverflow: doc.scrollWidth > doc.clientWidth ? `${doc.scrollWidth} > ${doc.clientWidth}` : 'nej',
      doubleSpace: /  /.test(document.querySelector('.r-total .t-note').textContent.replace(/\n/g, ' ').replace(/\s{2,}/g, m => m)) ,
      noteRaw: JSON.stringify(document.querySelector('.r-total .t-note').textContent),
      fineRaw: JSON.stringify(document.querySelector('.fine').textContent.slice(-60)),
      emdashUI: (document.body.innerText.match(/—/g) || []).length,
    };
  });
  console.log('  mät:', JSON.stringify(m));
  await page.close();
}
await browser.close();
