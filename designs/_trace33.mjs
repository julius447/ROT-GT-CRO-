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
  console.log('=== '+label);
  console.log(await p.evaluate(() => {
    const r = document.querySelector('.av-r-row');
    const o = [ 'ROW html: ' + r.outerHTML.replace(/\s+/g,' ').slice(0,400) ];
    for (const c of r.children) {
      const cs = getComputedStyle(c);
      o.push(`  ${c.className}: w=${c.getBoundingClientRect().width.toFixed(2)} flex=${cs.flexGrow}/${cs.flexShrink}/${cs.flexBasis} minW=${cs.minWidth} maxW=${cs.maxWidth} display=${cs.display} bg=${cs.backgroundImage.slice(0,60)} bs=${cs.backgroundSize}`);
    }
    return o.join('\n');
  }));
  await p.close();
}
await b.close();
