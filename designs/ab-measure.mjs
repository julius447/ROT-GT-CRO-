// A/B-paritetsmätning: dumpar den MOBILA vänsterspaltens beräknade typografi/geometri.
// usage: node ab-measure.mjs <file.html> [frameSelector]
// Utan selector mäts dokumentets egen vänsterspalt (referens = d2 vid 390px viewport).
// Med selector mäts vänsterspalten INUTI en .frame (jämförelsesidan, valfri viewport).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [, , file, scope = '', vw = '390'] = process.argv;
if (!file) { console.error('usage: node ab-measure.mjs <file.html> [scopeSelector] [viewportWidth]'); process.exit(1); }
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +vw, height: 1600 } });
await page.goto(url);
await page.waitForTimeout(600);

const out = await page.evaluate((scope) => {
  const root = scope ? document.querySelector(scope) : document;
  const g = (el, ...props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs[p];
    return o;
  };
  const h2 = root.querySelector('h2, .h2');
  const steps = root.querySelector('.steps');
  const step = root.querySelector('.step');
  const h3 = root.querySelector('.step h3');
  const p = root.querySelector('.step p');
  const n = root.querySelector('.step .n');
  const accent = root.querySelector('.accent');
  const block = root.querySelector('.block');
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(2), h: +r.height.toFixed(2), x: +r.x.toFixed(2) }; };
  const geo = [...root.querySelectorAll('.step')].map((s, i) => {
    const nb = s.querySelector('.n').getBoundingClientRect();
    const hh = s.querySelector('h3');
    const r = document.createRange(); r.selectNodeContents(hh);
    const first = r.getClientRects()[0];
    return {
      step: i + 1,
      circleC: +(nb.top + nb.height / 2).toFixed(2),
      lineC: +(first.top + first.height / 2).toFixed(2),
      delta: +((nb.top + nb.height / 2) - (first.top + first.height / 2)).toFixed(2),
    };
  });
  return {
    h2: { ...g(h2, 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'marginBottom', 'textAlign', 'maxWidth'), rect: rectOf(h2) },
    accent: g(accent, 'fontSize', 'fontWeight', 'color', 'textDecorationLine'),
    steps: g(steps, 'rowGap', 'gap'),
    step: g(step, 'gap', 'gridTemplateColumns'),
    h3: { ...g(h3, 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'textAlign'), rect: rectOf(h3) },
    p: { ...g(p, 'fontSize', 'fontWeight', 'lineHeight', 'color', 'marginTop', 'textAlign'), rect: rectOf(p) },
    n: { ...g(n, 'width', 'height', 'fontSize', 'fontWeight', 'backgroundColor', 'color', 'marginTop'), rect: rectOf(n) },
    block: g(block, 'paddingLeft', 'paddingTop', 'borderRadius'),
    stepsRect: rectOf(steps),
    leftColH: +(root.querySelector('.left') ? root.querySelector('.left').getBoundingClientRect().height.toFixed(2) : 0),
    geo,
  };
}, scope);

console.log(JSON.stringify(out, null, 2));
await browser.close();
