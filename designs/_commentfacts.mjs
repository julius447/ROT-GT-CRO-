// ============================================================================
//  _commentfacts.mjs — mäter de VERKLIGA värden som kommentarerna påstår
//  (P2-8 --h3fs · P2-9 H2→steg vs steg↔steg · P2-10 mobil --nsz/siffra ·
//   P2-11 .step .n bakgrund), så varje kommentarrättelse är MÄTT, inte räknad.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = [320, 375, 390, 1280, 1440];
const b = await chromium.launch();
const res = {};

for (const f of FILES) {
  res[f] = {};
  for (const w of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: 1400 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href, { waitUntil: 'load' });
    res[f][w] = await p.evaluate(() => {
      const g = (s, prop) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[prop] : null; };
      const step = document.querySelector('.step');
      const h3 = document.querySelector('.step h3');
      const n = document.querySelector('.step .n');
      const d = document.querySelector('.step .n .d');
      const steps = document.querySelector('.steps');
      const h2 = document.querySelector('h2');
      return {
        h3fs: h3 ? getComputedStyle(h3).fontSize : null,
        nsz: n ? getComputedStyle(n).width + ' x ' + getComputedStyle(n).height : null,
        siffra: d ? getComputedStyle(d).fontSize : (n ? getComputedStyle(n).fontSize : null),
        nBgColor: n ? getComputedStyle(n).backgroundColor : null,
        nBgImage: n ? getComputedStyle(n).backgroundImage : null,
        h2MarginB: h2 ? getComputedStyle(h2).marginBottom : null,
        stegGap: steps ? getComputedStyle(steps).rowGap : null,
        capsMarginB: g('.steps-cap', 'marginBottom'),
      };
    });
    await p.close();
  }
}
await b.close();

const P = (s, n) => String(s).padEnd(n), L = (s, n) => String(s).padStart(n);
const keys = ['h3fs', 'nsz', 'siffra', 'nBgColor', 'nBgImage', 'h2MarginB', 'stegGap', 'capsMarginB'];
for (const k of keys) {
  console.log('\n  ' + k.toUpperCase());
  console.log('  ' + P('fil', 22) + WIDTHS.map(w => L('@' + w, 22)).join(''));
  for (const f of FILES) console.log('  ' + P(f, 22) + WIDTHS.map(w => L(res[f][w][k], 22)).join(''));
}
console.log('');
