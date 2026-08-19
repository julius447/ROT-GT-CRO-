import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b = await chromium.launch();
for (const w of [1440, 390]) {
  console.log('--- ' + w + 'px');
  for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(220);
    const m = await p.evaluate(() => {
      const t = document.querySelector('.r-total'), l = t.querySelector('.t-label'), a = t.querySelector('.amt');
      const cs = getComputedStyle(t), T = t.getBoundingClientRect(), L = l.getBoundingClientRect(), A = a.getBoundingClientRect();
      const note = t.querySelector('.t-note');
      return { amt: getComputedStyle(a).fontSize, lbl: getComputedStyle(l).fontSize,
        pad: cs.paddingTop + '/' + cs.paddingBottom, plateH: Math.round(T.height),
        baselineDelta: +( (L.top + L.height/2) - (A.top + A.height/2) ).toFixed(1),
        note: note ? note.textContent.trim().slice(0,22) : '(ingen)' };
    });
    console.log(f.padEnd(18), JSON.stringify(m)); await p.close();
  }
}
await b.close();
