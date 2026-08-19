// ============================================================================
//  _s4pdf.mjs — RENDERAR EN PDF PER FIL (A4) och mäter pappersutfallet:
//  antal sidor, var sidbrytningarna hamnar, och om något steg / någon
//  kvittorad delas av en brytning (P1-10:s krav).
//    node _s4pdf.mjs --ut=KATALOG [--dir=.]
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { mkdirSync, statSync } from 'fs';
import { FILES } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const DIR = resolve(arg('dir', '.'));
const UT = resolve(arg('ut', 'screens/steg4/pdf'));
mkdirSync(UT, { recursive: true });

// A4 i CSS-px vid 96 dpi: 210mm x 297mm = 793,7 x 1122,5
const FORMAT = arg('format', 'A4');
const SIDHOJD = { A4: 1122.52, A5: 793.70, A6: 559.37 };
const SIDH = SIDHOJD[FORMAT], MARGIN = 37.8;          // 10 mm marginal upp/ned
const NYTTIG = SIDH - 2 * MARGIN;

const browser = await chromium.launch();
for (const f of FILES) {
  const page = await browser.newPage({ viewport: { width: FORMAT === 'A4' ? 794 : (FORMAT === 'A5' ? 559 : 397), height: Math.round(SIDH) } });
  await page.goto(pathToFileURL(join(DIR, f + '.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(400);
  const p = join(UT, f + '-' + FORMAT + '.pdf');
  await page.pdf({ path: p, format: FORMAT, printBackground: false, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });

  // mät i printläge: var ligger stegen/raderna, och krockar de med en brytning?
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(150);
  const m = await page.evaluate((NYTTIG) => {
    const top = document.querySelector('.av-block').getBoundingClientRect().top + window.scrollY;
    const rader = [];
    const put = (namn, sel) => document.querySelectorAll(sel).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      rader.push({ namn: namn + (i + 1), y0: +(r.top + window.scrollY - top).toFixed(1), y1: +(r.bottom + window.scrollY - top).toFixed(1), h: +r.height.toFixed(1) });
    });
    put('steg', '.av-step'); put('rad', '.av-r-row'); put('total', '.av-r-total');
    put('cta', '.av-cta-wrap'); put('fine', '.av-fine');
    const hojd = document.querySelector('.av-block').getBoundingClientRect().height;
    // brytningar ligger pa multiplar av den nyttiga sidhojden
    const brott = [];
    for (let y = NYTTIG; y < hojd; y += NYTTIG) brott.push(+y.toFixed(1));
    const delade = rader.filter(r => brott.some(b => r.y0 < b && r.y1 > b));
    return { hojd: +hojd.toFixed(1), sidor: Math.ceil(hojd / NYTTIG), brott, delade, antalElement: rader.length };
  }, NYTTIG);

  // ...och en TITTBAR bild av pappersrenderingen
  await page.screenshot({ path: join(UT, f + '-' + FORMAT + '-print.png'), fullPage: true });
  const kb = (statSync(p).size / 1024).toFixed(1);
  console.log('  ' + FORMAT + ' ' + f.padEnd(22) + ' pdf ' + kb.padStart(7) + ' kB   blockhöjd ' + String(m.hojd).padStart(8) + ' px   ' +
    String(m.sidor) + ' A4-sida(or)   brytning vid [' + m.brott.join(', ') + ']   DELADE ELEMENT: ' + m.delade.length +
    (m.delade.length ? '  ' + JSON.stringify(m.delade) : '  (av ' + m.antalElement + ' mätta)'));
  await page.close();
}
await browser.close();
console.log('\n  PDF:er i ' + UT + '\n');
