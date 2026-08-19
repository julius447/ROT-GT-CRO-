import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const LEV = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview/fran-php';
const b = await chromium.launch();
for (const [label, url] of [['design', resolve('d2-kvittot-forst.html')], ['php', resolve(LEV, 'rot.html')]]) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
  await p.goto(pathToFileURL(url).href);
  await p.evaluate(async()=>{await document.fonts.ready});
  await p.waitForTimeout(400);
  console.log('=== '+label, await p.evaluate(() => {
    const r = document.querySelector('.av-r-row');
    const l = r.querySelector('.av-lbl'), a = r.querySelector('.av-amt'), d = r.querySelector('.av-dots');
    return JSON.stringify({
      rowW: r.getBoundingClientRect().width,
      lbl: JSON.stringify(l.textContent), lblW: l.getBoundingClientRect().width,
      lblWS: getComputedStyle(l).whiteSpace,
      amt: JSON.stringify(a.textContent), amtW: a.getBoundingClientRect().width,
      dotsW: d.getBoundingClientRect().width, wrap: getComputedStyle(r).flexWrap,
    }, null, 1);
  }));
  await p.close();
}
await b.close();
