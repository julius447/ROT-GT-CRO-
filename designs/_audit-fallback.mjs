// D. Är @supports-fallbacken (Safari <16 / motorer utan container queries) verkligen nåbar?
// Bevis: vänd villkoret "@supports not (container-type: inline-size)" -> "@supports (container-type: inline-size)"
// så grenen AKTIVERAS i Chromium. Om .cta-reglerna i grenen ändå inte syns är de överskuggade av
// senare regler = död kod i exakt den motor de skrevs för.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();

for (const f of FILES) {
  const orig = readFileSync(resolve(f + '.html'), 'utf8');
  const flipped = orig.replace('@supports not (container-type: inline-size)', '@supports (container-type: inline-size)');
  if (flipped === orig) { console.log(f + ': INGEN @supports-gren hittad'); continue; }
  // Neutralisera container-query-grenen så vi ser fallbackens EGEN effekt
  const flippedNoCQ = flipped.replace('@container (max-width: 400px)', '@container (max-width: 1px)');

  console.log('\n===================== ' + f);
  for (const [label, html] of [['NORMAL (CQ aktiv)', orig], ['FALLBACK-GRENEN AKTIVERAD', flippedNoCQ]]) {
    for (const w of [390, 430]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.setContent(html.replace(/\.\.\/assets\//g, 'file://' + resolve('../assets') + '/'), { waitUntil: 'load' });
      await p.waitForTimeout(200);
      const m = await p.evaluate(() => {
        const cta = document.querySelector('.cta'), row = document.querySelector('.r-row');
        const c = getComputedStyle(cta), r = getComputedStyle(row);
        const lbl = getComputedStyle(row.querySelector('.lbl'));
        return {
          ctaWidth: Math.round(cta.getBoundingClientRect().width),
          ctaPad: c.paddingLeft + '/' + c.paddingRight, ctaGap: c.gap, ctaW: c.width,
          rowDisplay: r.display, dots: getComputedStyle(row.querySelector('.dots')).display,
          lblTransform: lbl.textTransform, lblSize: lbl.fontSize,
        };
      });
      console.log('  ' + label.padEnd(28) + '@' + w + ' ' + JSON.stringify(m));
      await p.close();
    }
  }
}
await b.close();
