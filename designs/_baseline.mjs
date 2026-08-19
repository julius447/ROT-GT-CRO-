// ============================================================================
//  _baseline.mjs — STEG 0: fryser facit.
//
//  Fångar 21 metrik × 17 bredder × 4 filer till _baseline.json och skjuter
//  fullPage-skärmdumpar på 6 bredder till screens/base-*.png.
//
//  Kör:  node _baseline.mjs              (skriver _baseline.json + skärmdumpar)
//        node _baseline.mjs --no-shots   (bara JSON)
//        node _baseline.mjs --out=X.json (annan målfil, t.ex. nytt facit i steg 3)
//
//  Facit = filerna EXAKT som de ligger i designs/ (preview-harnesset). Det är
//  den rendering ägaren har godkänt. Produktionsavvikelserna är dokumenterade i
//  handover/AUDIT-punchlista.md (P0-4, P1-15) och hör inte hemma i facit.
// ============================================================================

import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { writeFileSync, mkdirSync, readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { FILES, WIDTHS, SHOT_WIDTHS, METRICS, sweep, countLeaves } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const OUT = resolve(arg('out', '_baseline.json'));
const PREFIX = arg('prefix', '');
const DIR = resolve(arg('dir', '.'));
const SHOTS = !argv.includes('--no-shots');
const SHOTDIR = resolve('screens');

mkdirSync(SHOTDIR, { recursive: true });

const t0 = Date.now();
const browser = await chromium.launch();

const baseline = {
  _meta: {
    skapad: new Date().toISOString(),
    beskrivning: 'STEG 0 facit — 21 metrik x 17 bredder x 4 filer, preview-harnesset (filerna som de ligger).',
    verktyg: 'playwright/chromium ' + browser.version(),
    metrik: METRICS,
    bredder: WIDTHS,
    prefix: PREFIX,
    katalog: DIR,
    tolerans_px: 0.05
  },
  filer: {}
};

console.log('STEG 0 — fryser facit');
console.log('  ' + FILES.length + ' filer x ' + WIDTHS.length + ' bredder x ' + METRICS.length + ' metrik');

for (const f of FILES) {
  const path = join(DIR, f + '.html');
  const url = pathToFileURL(path).href;
  const src = readFileSync(path);
  process.stdout.write('  ' + f.padEnd(20));
  const { fontOK, widths } = await sweep(browser, url, PREFIX);
  baseline.filer[f] = {
    kalla: { sha256: createHash('sha256').update(src).digest('hex'), bytes: src.length, mtime: statSync(path).mtime.toISOString() },
    fontOK,
    matt: widths
  };
  console.log('klar  (fontOutfit=' + fontOK + ', löv=' + countLeaves(widths) + ')');
}

// --- Skärmdumpar ----------------------------------------------------------
if (SHOTS) {
  console.log('  skärmdumpar (fullPage):');
  for (const f of FILES) {
    const url = pathToFileURL(join(DIR, f + '.html')).href;
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
    const rader = [];
    for (const w of SHOT_WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(220);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const p = join(SHOTDIR, 'base-' + f + '-' + w + '.png');
      // animations:'disabled' spolar fram fade (400 ms) till slutläget och
      // nollställer hemförsäkringens oändliga ampyRing -> deterministisk bild.
      await page.screenshot({ path: p, fullPage: true, animations: 'disabled' });
      rader.push(w);
    }
    await page.close();
    console.log('    ' + f.padEnd(20) + rader.join(' · '));
  }
}

await browser.close();

writeFileSync(OUT, JSON.stringify(baseline, null, 1));

const celler = FILES.length * WIDTHS.length * METRICS.length;
let lov = 0; for (const f of FILES) lov += countLeaves(baseline.filer[f].matt);
console.log('');
console.log('  FACIT SKRIVET: ' + OUT);
console.log('  metrikceller : ' + celler + '  (' + FILES.length + ' x ' + WIDTHS.length + ' x ' + METRICS.length + ')');
console.log('  mätpunkter   : ' + lov + '  (jämförbara löv)');
if (SHOTS) console.log('  skärmdumpar  : ' + (FILES.length * SHOT_WIDTHS.length) + ' st i screens/base-*.png');
console.log('  tid          : ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
