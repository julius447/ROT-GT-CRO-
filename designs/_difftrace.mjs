import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const LEV = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview';
const b = await chromium.launch();
for (const w of [1280, 1920]) {
  console.log('--- ' + w);
  for (const [label, url] of [['design', resolve('gt-generisk.html')], ['leverans', resolve(LEV, 'gt-generisk.html')]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(url).href);
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const g = (sel, props) => {
        const e = document.querySelector(sel); if (!e) return null;
        const c = getComputedStyle(e); const o = {};
        for (const p of props) o[p] = c[p];
        return o;
      };
      return {
        h2: g('.av-h2', ['maxWidth', 'fontSize', 'width']),
        cta: g('.av-cta', ['paddingLeft', 'paddingRight', 'gap', 'fontSize', 'width']),
        total: g('.av-r-total', ['paddingTop', 'paddingBottom', 'height']),
      };
    });
    console.log('  ' + label.padEnd(9), JSON.stringify(r));
    await p.close();
  }
}
await b.close();
