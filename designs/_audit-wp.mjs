// F. WordPress/Bricks-verklighet. Tre prov:
//   1) FONT-FALLBACK: blockera woff2 (= det som händer när ../assets/-relativpathen inte finns i WP)
//   2) REM-BASEN: temat sätter html{font-size:62.5%} (=10px) — vad ändras?
//   3) VÄRDSTEMA: typiska WP/Bricks-defaults laddade FÖRE blockets CSS — vad tappar blocket,
//      och vad förstör blockets egna globala selektorer på sidan?
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = [320, 360, 390, 430, 744, 768, 834, 1024, 1180, 1280, 1440, 1920];

const PROBE = () => {
  const R = e => e ? e.getBoundingClientRect() : null;
  const lines = el => { const r = document.createRange(); r.selectNodeContents(el); return r.getClientRects().length; };
  const block = document.querySelector('.block');
  const panel = document.querySelector('.panel');
  const h2 = document.querySelector('h2');
  const cta = document.querySelector('.cta');
  const tot = document.querySelector('.r-total .amt');
  const rows = [...document.querySelectorAll('.r-row')];
  // överflöd: något barn som sticker ut ur panelen/blocket?
  const overflow = [];
  const chk = (host, sel) => {
    const H = R(host); if (!H) return;
    host.querySelectorAll(sel).forEach(e => {
      const r = R(e); if (!r.width && !r.height) return;
      if (r.right > H.right + 0.6 || r.left < H.left - 0.6) overflow.push((e.className.baseVal ?? e.className) + ':' + Math.round(r.left - H.left) + '..' + Math.round(r.right - H.right));
    });
  };
  chk(panel, '.r-row *, .r-total *, .fine, .cta, .cta *');
  chk(block, '.left *');
  return {
    docScrollW: document.documentElement.scrollWidth, docClientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
    blockH: Math.round(R(block).height), blockW: Math.round(R(block).width),
    panelW: Math.round(R(panel).width), panelInnerW: Math.round(panel.clientWidth - parseFloat(getComputedStyle(panel).paddingLeft) * 2),
    h2Lines: lines(h2), h2Size: getComputedStyle(h2).fontSize, h2Family: getComputedStyle(h2).fontFamily.split(',')[0],
    h2W: Math.round(R(h2).width),
    ctaW: cta ? Math.round(R(cta).width) : null, ctaH: cta ? Math.round(R(cta).height) : null,
    totW: tot ? +R(tot).width.toFixed(1) : null, totSize: tot ? getComputedStyle(tot).fontSize : null,
    rowH: rows.map(r => Math.round(R(r).height)).join('/'),
    stepP: getComputedStyle(document.querySelector('.step p')).fontSize,
    overflow,
  };
};

const b = await chromium.launch();

async function run(f, w, opt = {}) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  if (opt.blockFont) await p.route('**/*.woff2', r => r.abort());
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  if (opt.css) await p.addStyleTag({ content: opt.css });
  await p.waitForTimeout(opt.blockFont ? 400 : 350);
  const m = await p.evaluate(PROBE);
  await p.close();
  return m;
}

const REM62 = 'html { font-size: 62.5%; }';
// Typiska WordPress/Bricks/temaregler (Bricks sätter dessa på frontend)
const THEME = `
html{font-size:62.5%}
body{font-size:1.6rem;line-height:1.6;font-family:Georgia,serif;color:#222}
h2,h3{font-family:Georgia,serif;line-height:1.4;margin-block:0.5em;font-weight:700}
p{margin-bottom:1.5em;line-height:1.7}
ol,ul{margin-left:1.5em;padding-left:1em;margin-bottom:1.5em}
li{margin-bottom:.5em;list-style:decimal}
a{color:#0073aa;text-decoration:underline}
section{margin-bottom:4rem}
img,svg{max-width:100%;height:auto}
*{box-sizing:content-box}
`;

console.log('### PROV 1+2: FONTBORTFALL och REM-BAS 62.5% (Δ mot baslinje)\n');
for (const f of FILES) {
  console.log('--- ' + f);
  for (const w of [320, 390, 768, 1024, 1440]) {
    const base = await run(f, w);
    const nofont = await run(f, w, { blockFont: true });
    const rem = await run(f, w, { css: REM62 });
    const d = (a, x) => {
      const out = [];
      for (const k of ['blockH', 'h2Lines', 'h2W', 'ctaW', 'totW', 'rowH', 'panelW', 'docScrollW']) if (JSON.stringify(a[k]) !== JSON.stringify(x[k])) out.push(k + ' ' + a[k] + '→' + x[k]);
      if (x.overflow.length) out.push('ÖVERFLÖD:' + JSON.stringify(x.overflow));
      return out.join('  ');
    };
    console.log('  @' + String(w).padEnd(5) + 'bas: h2=' + base.h2Lines + 'rad blockH=' + base.blockH + ' cta=' + base.ctaW + ' tot=' + base.totW + (base.overflow.length ? ' ÖVERFLÖD:' + JSON.stringify(base.overflow) : ''));
    console.log('          utan woff2: ' + (d(base, nofont) || 'ingen skillnad') + '  [family=' + nofont.h2Family + ']');
    console.log('          62.5%-rem : ' + (d(base, rem) || 'ingen skillnad'));
  }
}

console.log('\n### PROV 3: VÄRDSTEMA laddat FÖRE blockets CSS (temat vinner där blocket inte deklarerar)\n');
for (const f of FILES) {
  console.log('--- ' + f);
  for (const w of [390, 768, 1440]) {
    const base = await run(f, w);
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    // injicera temat som FÖRSTA stylesheet (som ett tema gör)
    await p.evaluate((css) => {
      const s = document.createElement('style'); s.textContent = css;
      document.head.insertBefore(s, document.head.firstChild);
    }, THEME);
    await p.waitForTimeout(300);
    const m = await p.evaluate(PROBE);
    await p.close();
    const diff = [];
    for (const k of ['blockH', 'h2Lines', 'h2W', 'ctaW', 'totW', 'rowH', 'panelW', 'docScrollW', 'stepP']) if (JSON.stringify(base[k]) !== JSON.stringify(m[k])) diff.push(k + ' ' + base[k] + '→' + m[k]);
    if (m.overflow.length) diff.push('ÖVERFLÖD:' + JSON.stringify(m.overflow));
    console.log('  @' + String(w).padEnd(5) + (diff.join('  ') || 'ingen skillnad'));
  }
}
await b.close();
