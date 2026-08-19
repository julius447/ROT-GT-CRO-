// H. Feature-stöd i RIKTIG WebKit (Safari-motorn) vs Chromium.
// :has() · container queries · text-wrap balance/pretty · mask-image · font-variant-numeric
// · :focus-visible · clamp() · @font-face format("woff2-variations")
import { chromium, webkit } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

const SUPPORT = () => ({
  has: CSS.supports('selector(:has(*))'),
  containerType: CSS.supports('container-type: inline-size'),
  containerUnit: CSS.supports('width: 1cqw'),
  textWrapBalance: CSS.supports('text-wrap: balance'),
  textWrapPretty: CSS.supports('text-wrap: pretty'),
  maskImage: CSS.supports('mask-image: linear-gradient(#000,transparent)'),
  webkitMaskImage: CSS.supports('-webkit-mask-image: linear-gradient(#000,transparent)'),
  fvn: CSS.supports('font-variant-numeric: tabular-nums'),
  focusVisible: CSS.supports('selector(:focus-visible)'),
  clamp: CSS.supports('width: clamp(1px, 2vw, 3px)'),
  textDecoSkipInk: CSS.supports('text-decoration-skip-ink: none'),
  textUnderlineOffset: CSS.supports('text-underline-offset: 5px'),
  aspectRatio: CSS.supports('aspect-ratio: 1'),
  fitContent: CSS.supports('width: fit-content'),
  marginInline: CSS.supports('margin-inline: auto'),
  woff2var: (() => { try { return new FontFace('T', 'url(x.woff2) format("woff2-variations")') ? 'konstruerbar' : '?'; } catch (e) { return 'FEL: ' + e.message; } })(),
});

const RENDER = () => {
  const R = e => e ? e.getBoundingClientRect() : null;
  const q = s => document.querySelector(s);
  const panel = q('.panel'), block = q('.block');
  const over = [];
  const H = R(panel);
  panel.querySelectorAll('.r-row *, .r-total *, .fine, .cta, .cta *').forEach(e => {
    const r = R(e); if (!r.width && !r.height) return;
    if (r.right > H.right + 0.6 || r.left < H.left - 0.6) over.push((e.className.baseVal ?? e.className) + ' ' + Math.round(r.left - H.left) + '..' + Math.round(r.right - H.right));
  });
  const tnote = q('.r-total .t-note');
  const s0 = q('.step'), n = s0.querySelector('.n'), h3 = s0.querySelector('h3');
  const nr = R(n), hr = h3.getClientRects()[0];
  const w1 = q('.hero-w1');
  return {
    blockH: Math.round(R(block).height), blockW: Math.round(R(block).width),
    panelW: Math.round(R(panel).width),
    rowDisplay: getComputedStyle(q('.r-row')).display,
    dots: getComputedStyle(q('.r-row .dots')).display,
    tnote: tnote ? getComputedStyle(tnote).display + ' h=' + R(tnote).height.toFixed(1) : '(ingen)',
    optisk: +((nr.top + nr.height / 2) - (hr.top + hr.height / 2)).toFixed(2),
    maskUsed: getComputedStyle(w1).webkitMaskImage || getComputedStyle(w1).maskImage,
    h2Wrap: getComputedStyle(q('h2')).textWrap || getComputedStyle(q('h2')).textWrapStyle,
    ctaW: q('.cta') ? Math.round(R(q('.cta')).width) : null,
    totW: q('.r-total .amt') ? +R(q('.r-total .amt')).width.toFixed(1) : null,
    docScrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    overflow: over,
  };
};

for (const [name, engine] of [['CHROMIUM', chromium], ['WEBKIT (Safari)', webkit]]) {
  const b = await engine.launch();
  const p0 = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p0.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
  const sup = await p0.evaluate(SUPPORT);
  console.log('\n############ ' + name);
  console.log('  STÖD: ' + JSON.stringify(sup, null, 2).split('\n').join('\n  '));
  await p0.close();

  for (const f of FILES) {
    console.log('  --- ' + f);
    for (const w of [320, 390, 744, 834, 1024, 1180, 1440, 1920]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.goto(pathToFileURL(resolve(f + '.html')).href);
      await p.waitForTimeout(450);
      const m = await p.evaluate(RENDER);
      const flag = (m.docScrollW > m.clientW ? ' ⚠HORISONTELL-SCROLL' : '') + (m.overflow.length ? ' ⚠ÖVERFLÖD:' + JSON.stringify(m.overflow) : '');
      console.log('     @' + String(w).padEnd(5) + 'blockH=' + String(m.blockH).padEnd(5) + 'panel=' + String(m.panelW).padEnd(5) + 'row=' + m.rowDisplay.padEnd(5) + 'dots=' + m.dots.padEnd(6) + 'tnote=' + String(m.tnote).padEnd(16) + 'optisk=' + String(m.optisk).padEnd(7) + 'cta=' + m.ctaW + flag);
      await p.close();
    }
  }
  await b.close();
}
