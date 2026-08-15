import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const files = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const b = await chromium.launch();
const widths = [320,330,345,360,375,390,414,480,600,768,900,1000,1120,1280,1440,1600];
for (const f of files) {
  console.log('\n=== ' + f);
  for (const w of widths) {
    const page = await b.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const d = document.documentElement;
      const cta = document.querySelector('.cta');
      const ctaR = cta.getBoundingClientRect();
      const inner = cta.scrollWidth;
      const h2 = document.querySelector('h2');
      const acc = document.querySelector('h2 .accent');
      const rows = [...document.querySelectorAll('.r-row')].map(r=>{
        const range=document.createRange(); range.selectNodeContents(r); return [...range.getClientRects()].length;
      });
      const lines = e => { const r=document.createRange(); r.selectNodeContents(e); return [...r.getClientRects()].length; };
      let overflow = [];
      document.querySelectorAll('*').forEach(e=>{ const b=e.getBoundingClientRect(); if (b.right > d.clientWidth+0.5) overflow.push(e.className||e.tagName); });
      return { scrollW: d.scrollWidth, client: d.clientWidth,
        ctaW: +ctaR.width.toFixed(1), ctaH: +ctaR.height.toFixed(1), ctaOverflow: inner > Math.ceil(ctaR.width),
        h2h: +h2.getBoundingClientRect().height.toFixed(1), accW: +(acc?acc.getBoundingClientRect().width:0).toFixed(1),
        totalH: +document.querySelector('.r-total').getBoundingClientRect().height.toFixed(1),
        fineH: +document.querySelector('.fine').getBoundingClientRect().height.toFixed(1),
        noteLines: lines(document.querySelector('.t-note')),
        blockH: +document.querySelector('.block').getBoundingClientRect().height.toFixed(1),
        overflow: [...new Set(overflow)].slice(0,4) };
    });
    const bad = (r.scrollW > r.client) || r.ctaOverflow || r.overflow.length;
    console.log(` ${String(w).padStart(4)}: scrollW=${r.scrollW}/${r.client} ctaW=${r.ctaW} h2h=${r.h2h} accW=${r.accW} totalH=${r.totalH} fineH=${r.fineH} noteL=${r.noteLines} blockH=${r.blockH}` + (bad?'  <<< '+JSON.stringify(r.overflow)+' ctaOv='+r.ctaOverflow:''));
    await page.close();
  }
}
await b.close();
