// ============================================================================
//  _s4pxdiff.mjs — VAR skiljer sig två PNG:er, och HUR MYCKET?
//  Avkodar med chromium (ingen ny beroendekedja), returnerar antal ändrade
//  pixlar, max kanaldelta och den ändrade ytans bounding box.
//    node _s4pxdiff.mjs a.png b.png [...]
// ============================================================================
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const par = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');

for (let i = 0; i < par.length; i += 2) {
  const A = resolve(par[i]), B = resolve(par[i + 1]);
  const a = readFileSync(A).toString('base64'), b = readFileSync(B).toString('base64');
  const r = await page.evaluate(async ([a, b]) => {
    const ld = s => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/png;base64,' + s; });
    const ia = await ld(a), ib = await ld(b);
    if (ia.width !== ib.width || ia.height !== ib.height) return { olikaStorlek: [ia.width, ia.height, ib.width, ib.height] };
    const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
    x.clearRect(0, 0, c.width, c.height);
    x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0, max = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, sum = 0;
    for (let p = 0; p < da.length; p += 4) {
      let d = 0;
      for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(da[p + k] - db[p + k]));
      if (d) {
        n++; sum += d; if (d > max) max = d;
        const px = (p / 4) % c.width, py = Math.floor((p / 4) / c.width);
        if (px < x0) x0 = px; if (px > x1) x1 = px;
        if (py < y0) y0 = py; if (py > y1) y1 = py;
      }
    }
    // histogram over |delta|: hur manga pixlar ar bara 1 niva fel, hur manga ar synliga?
    const hist = { d1: 0, d2_4: 0, d5_9: 0, d10_19: 0, d20p: 0 };
    for (let p = 0; p < da.length; p += 4) {
      let d = 0; for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(da[p + k] - db[p + k]));
      if (!d) continue;
      if (d === 1) hist.d1++; else if (d < 5) hist.d2_4++; else if (d < 10) hist.d5_9++; else if (d < 20) hist.d10_19++; else hist.d20p++;
    }
    return { w: c.width, h: c.height, andrade: n, andel: +(100 * n / (c.width * c.height)).toFixed(4), maxDelta: max, medelDelta: n ? +(sum / n).toFixed(2) : 0, hist, box: n ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null };
  }, [a, b]);
  console.log(A.split('/').pop() + '  vs  ' + B.split('/').pop());
  console.log('   ' + JSON.stringify(r));
}
await browser.close();
