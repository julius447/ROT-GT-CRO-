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
  const r = await p.evaluate(() => {
    const panel = document.querySelector('.av-panel');
    const out = [];
    const walk = (el, d) => {
      const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      out.push(`${'  '.repeat(d)}${el.className||el.tagName} h=${rc.height.toFixed(2)} pt=${cs.paddingTop} pb=${cs.paddingBottom} mt=${cs.marginTop} mb=${cs.marginBottom} fs=${cs.fontSize} lh=${cs.lineHeight} gap=${cs.rowGap}`);
      if (d < 2) for (const c of el.children) walk(c, d+1);
    };
    walk(panel, 0);
    return out.join('\n');
  });
  console.log('=== ' + label + '\n' + r);
  await p.close();
}
await b.close();
