// G. (a) Vilken TEMAREGEL orsakar vilken skada? En regel i taget.
//    (b) OMVÄNT: vad gör blockets egna GLOBALA selektorer med resten av WP-sidan?
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();

const RULES = {
  'p{margin-bottom:1.5em}': 'p{margin-bottom:1.5em}',
  'h2,h3{margin-block:.5em}': 'h2,h3{margin-block:.5em}',
  'h2,h3{line-height:1.4}': 'h2,h3{line-height:1.4}',
  'h2,h3{font-family:Georgia}': 'h2,h3{font-family:Georgia,serif}',
  'ol,ul{margin-left:1.5em;padding-left:1em}': 'ol,ul{margin-left:1.5em;padding-left:1em;margin-bottom:1.5em}',
  'li{margin-bottom:.5em;list-style:decimal}': 'li{margin-bottom:.5em;list-style:decimal}',
  'a{color:#0073aa;text-decoration:underline}': 'a{color:#0073aa;text-decoration:underline}',
  'section{margin-bottom:4rem}': 'section{margin-bottom:4rem}',
  'img,svg{max-width:100%;height:auto}': 'img,svg{max-width:100%;height:auto}',
  'body{line-height:1.6;font-family:Georgia}': 'body{line-height:1.6;font-family:Georgia,serif}',
  '*{box-sizing:content-box}': '*{box-sizing:content-box}',
  'button,a{padding:...}': 'a{padding:.5em 1em}',
};

const PROBE = () => {
  const R = e => e.getBoundingClientRect();
  const block = document.querySelector('.block');
  const st = document.querySelectorAll('.step');
  // optisk linjering: cirkelns mitt vs H3:ns första radmitt
  const s0 = st[0], n = s0.querySelector('.n'), h3 = s0.querySelector('h3');
  const nr = R(n), hr = h3.getClientRects()[0];
  // connector-linjens ändar
  const cs = getComputedStyle(s0, '::before');
  return {
    blockH: Math.round(R(block).height),
    optisk: +((nr.top + nr.height / 2) - (hr.top + hr.height / 2)).toFixed(2),
    stepGap: Math.round(R(st[1]).top - R(st[0]).bottom),
    h3Mt: getComputedStyle(h3).marginTop, h3Mb: getComputedStyle(h3).marginBottom,
    pMb: getComputedStyle(s0.querySelector('p')).marginBottom,
    olMl: getComputedStyle(document.querySelector('.steps')).marginLeft,
    olPl: getComputedStyle(document.querySelector('.steps')).paddingLeft,
    liMb: getComputedStyle(document.querySelector('li.step')).marginBottom,
    liMarker: getComputedStyle(document.querySelector('li.step')).listStyleType,
    ctaColor: (() => { const c = document.querySelector('.cta'); return c ? getComputedStyle(c).color + '|' + getComputedStyle(c).textDecorationLine : null; })(),
    svgH: (() => { const s = document.querySelector('.hero-w1'); return Math.round(R(s).width) + 'x' + Math.round(R(s).height); })(),
    markH: (() => { const s = document.querySelector('.step .n .mark'); return Math.round(R(s).width) + 'x' + Math.round(R(s).height); })(),
    docScrollW: document.documentElement.scrollWidth,
  };
};

console.log('### (a) TEMAREGEL-ATTRIBUTION @1440 (Δ blockhöjd + skador)\n');
for (const f of FILES) {
  const p0 = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p0.goto(pathToFileURL(resolve(f + '.html')).href); await p0.waitForTimeout(300);
  const base = await p0.evaluate(PROBE); await p0.close();
  console.log('--- ' + f + '  BAS: ' + JSON.stringify(base));
  for (const [label, css] of Object.entries(RULES)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    await p.evaluate(c => { const s = document.createElement('style'); s.textContent = c; document.head.insertBefore(s, document.head.firstChild); }, css);
    await p.waitForTimeout(250);
    const m = await p.evaluate(PROBE); await p.close();
    const diff = Object.keys(base).filter(k => JSON.stringify(base[k]) !== JSON.stringify(m[k])).map(k => k + ' ' + base[k] + '→' + m[k]);
    if (diff.length) console.log('    ' + label.padEnd(42) + diff.join('  '));
  }
}

console.log('\n### (b) OMVÄND SKADA: blockets <style> klistrad i en WP-sida\n');
const css = (f) => { const h = readFileSync(resolve(f + '.html'), 'utf8'); return h.slice(h.indexOf('<style>') + 7, h.indexOf('</style>')); };
const HOST = `<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style id="theme">
body{margin:0;font-family:Georgia,serif;background:#ffffff;color:#222;line-height:1.6}
.site-header{background:#090b32;color:#fff;padding:20px 40px;display:flex;gap:24px}
.site-header a{color:#fff;text-decoration:none}
.entry{max-width:800px;margin:0 auto;padding:40px}
.entry h2{font-size:32px;margin:0 0 16px;color:#111}
.entry p{margin:0 0 20px}
.entry ul{margin:0 0 20px;padding-left:24px}
.entry li{margin-bottom:8px;list-style:disc}
.cta-strip{background:#00a991;padding:32px;text-align:center}
.faq h3{font-size:22px;margin:24px 0 8px}
.spinner{width:24px;height:24px;border:3px solid #ccc;border-top-color:#00a991;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body>
<header class="site-header"><a href="#">Ampy</a><a href="#">Tjänster</a><a href="#">Kontakt</a></header>
<main class="entry">
  <h2>Byta elcentral i villa</h2>
  <p>En gammal elcentral utan jordfelsbrytare är den vanligaste anmärkningen vid besiktning.</p>
  <ul><li>Jordfelsbrytare</li><li>Automatsäkringar</li><li>Märkning</li></ul>
  <div class="faq"><h3>Vad kostar det?</h3><p>Priset beror på antal grupper.</p></div>
  <div class="spinner"></div>
</main>
<div class="cta-strip">Ring oss</div>
<div id="slot"></div>
</body></html>`;

const HOSTPROBE = () => {
  const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.top); };
  const CS = (s, p) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[p] : null; };
  return {
    bodyBg: CS('body', 'backgroundColor'), bodyPad: CS('body', 'padding'), bodyFont: CS('body', 'fontFamily').split(',')[0],
    bodyLh: CS('body', 'lineHeight'), bodyColor: CS('body', 'color'),
    entryH2: R('.entry h2'), entryH2size: CS('.entry h2', 'fontSize'), entryH2weight: CS('.entry h2', 'fontWeight'),
    entryH2color: CS('.entry h2', 'color'), entryH2mb: CS('.entry h2', 'marginBottom'), entryH2maxw: CS('.entry h2', 'maxWidth'),
    entryP: R('.entry p'), entryPmb: CS('.entry p', 'marginBottom'),
    entryUlPl: CS('.entry ul', 'paddingLeft'), entryLiMb: CS('.entry li', 'marginBottom'),
    faqH3: R('.faq h3'), faqH3size: CS('.faq h3', 'fontSize'), faqH3lh: CS('.faq h3', 'lineHeight'),
    headerPad: CS('.site-header', 'padding'), headerH: R('.site-header'),
    spinnerAnim: CS('.spinner', 'animationName'),
    ctaStripPad: CS('.cta-strip', 'padding'),
    docH: document.documentElement.scrollHeight,
  };
};

for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.setContent(HOST); await p.waitForTimeout(150);
  const before = await p.evaluate(HOSTPROBE);
  await p.evaluate(c => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }, css(f));
  await p.waitForTimeout(250);
  const after = await p.evaluate(HOSTPROBE);
  await p.close();
  const diff = Object.keys(before).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  console.log('--- ' + f + ': ' + diff.length + ' egenskaper på VÄRDSIDAN ändrade');
  for (const k of diff) console.log('      ' + k.padEnd(16) + before[k] + '   →   ' + after[k]);
}

// prefers-reduced-motion-testet separat (kräver emulering)
console.log('\n### (c) @media (prefers-reduced-motion:reduce) { * { animation:none !important } } mot värdsidan');
for (const f of ['d2-kvittot-forst']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.setContent(HOST); await p.waitForTimeout(150);
  const b1 = await p.evaluate(() => getComputedStyle(document.querySelector('.spinner')).animationName + ' / dur=' + getComputedStyle(document.querySelector('.spinner')).animationDuration);
  await p.evaluate(c => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }, css(f));
  await p.waitForTimeout(200);
  const a1 = await p.evaluate(() => getComputedStyle(document.querySelector('.spinner')).animationName + ' / dur=' + getComputedStyle(document.querySelector('.spinner')).animationDuration);
  console.log('   värdsidans .spinner före: ' + b1 + '   efter: ' + a1);
  await p.close();
}
await b.close();
