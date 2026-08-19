// J. (1) forced-colors / Windows HCM
//    (2) --nmt hårdkodar 1.25 = kopia av .step h3 line-height -> desync om värden vinner
//    (3) :root-tokennamn kolliderar med tema/plugin
//    (4) print
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b = await chromium.launch();
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

console.log('### (1) forced-colors: reduce (Windows High Contrast)');
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(300);
  const m = await p.evaluate(() => {
    const g = (s, ...ps) => { const e = document.querySelector(s); if (!e) return '(saknas)'; const c = getComputedStyle(e); return ps.map(x => c[x]).join(' | '); };
    return {
      cta: g('.cta', 'backgroundColor', 'backgroundImage', 'color', 'forcedColorAdjust'),
      chip: g('.r-row.deduct .amt', 'backgroundColor', 'color'),
      plate: g('.r-total', 'backgroundColor'),
      pill: g('.offert-pill', 'backgroundColor', 'color', 'borderColor'),
      panel: g('.panel', 'backgroundColor'),
      arcStroke: g('.step .n .mark .arc', 'stroke'),
      wave: g('.hero-w1', 'opacity', 'display'),
    };
  });
  console.log('  ' + f + ':');
  for (const [k, v] of Object.entries(m)) console.log('     ' + k.padEnd(10) + v);
  await p.close();
}

console.log('\n### (2) --nmt hårdkodar 1.25; vad händer om h3 line-height vinner utifrån?');
for (const [label, css] of [
  ['ingen', ''],
  ['#main h3{line-height:1.6} (id-selektor, tema/Bricks)', '#wrap h3{line-height:1.6}'],
  ['h3{line-height:1.5!important} (plugin)', 'h3{line-height:1.5!important}'],
  ['.left h3{line-height:1.4} (samma spec, senare)', '.left h3{line-height:1.4}'],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
  if (css) await p.evaluate(c => {
    document.body.innerHTML = '<div id="wrap">' + document.body.innerHTML + '</div>';
    const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s);
  }, css);
  await p.waitForTimeout(250);
  const m = await p.evaluate(() => {
    const s = document.querySelector('.step'), n = s.querySelector('.n'), h3 = s.querySelector('h3');
    const r = document.createRange(); r.selectNodeContents(h3);
    const first = [...r.getClientRects()][0], nr = n.getBoundingClientRect();
    return { lh: getComputedStyle(h3).lineHeight, nmt: getComputedStyle(s).getPropertyValue('--nmt'), d: +((nr.top + nr.height / 2) - (first.top + first.height / 2)).toFixed(2) };
  });
  console.log('  ' + label.padEnd(52) + JSON.stringify(m));
  await p.close();
}

console.log('\n### (3) :root-tokennamn — kolliderar de? (tema definierar samma namn EFTER blocket)');
const COLLIDE = ':root{--line:#ff0000;--ring:0 0 0 2px red;--navy:#ff00ff;--muted:#00ff00;--edge:200px;--ink:#ff0000;--teal:#ff0000;--fast:5s}';
for (const f of ['d2-kvittot-forst']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(200);
  const before = await p.evaluate(() => ({ bodyPad: getComputedStyle(document.body).paddingLeft, capColor: getComputedStyle(document.querySelector('.p-cap')).color, rowBorder: getComputedStyle(document.querySelectorAll('.r-row')[1]).borderTopColor, blockBorder: getComputedStyle(document.querySelector('.block')).borderTopColor }));
  await p.evaluate(c => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }, COLLIDE);
  await p.waitForTimeout(200);
  const after = await p.evaluate(() => ({ bodyPad: getComputedStyle(document.body).paddingLeft, capColor: getComputedStyle(document.querySelector('.p-cap')).color, rowBorder: getComputedStyle(document.querySelectorAll('.r-row')[1]).borderTopColor, blockBorder: getComputedStyle(document.querySelector('.block')).borderTopColor }));
  console.log('  före :', JSON.stringify(before));
  console.log('  efter:', JSON.stringify(after));
  await p.close();
}
console.log('  generiska :root-namn i filerna: --navy --teal --ink --muted --faint --line --line-strong --subtle --edge --ring --fast --normal --ease --ease-out --pad-x --pad-y --offwhite');

console.log('\n### (4) print-media');
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(250);
  const m = await p.evaluate(() => ({
    panelBg: getComputedStyle(document.querySelector('.panel')).backgroundColor,
    ctaBg: document.querySelector('.cta') ? getComputedStyle(document.querySelector('.cta')).backgroundImage.slice(0, 40) : null,
    capColor: getComputedStyle(document.querySelector('.p-cap')).color,
    blockH: Math.round(document.querySelector('.block').getBoundingClientRect().height),
  }));
  console.log('  ' + f.padEnd(20) + JSON.stringify(m));
  await p.close();
}
await b.close();
