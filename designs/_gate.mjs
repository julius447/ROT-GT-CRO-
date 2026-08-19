// ============================================================================
//  _gate.mjs — DEN ÅTERANVÄNDBARA GRINDEN.
//
//  Mäter nuläget med EXAKT samma 21 metrik som _baseline.mjs och jämför mot
//  _baseline.json. Skriver ut ANTAL AVVIKELSER + en tabell över dem.
//  Tolerans 0,05 px på tal; strängar (färg, familj, white-space, display …)
//  jämförs exakt.
//
//  Kör efter VARJE steg:
//     node _gate.mjs                        — hela familjen mot facit
//     node _gate.mjs --only=hemforsakring   — en fil
//     node _gate.mjs --prefix=av-           — mät namespacad källa (steg 2)
//     node _gate.mjs --dir=/nån/annan/kat   — mät filer på annan plats
//     node _gate.mjs --baseline=_facit2.json
//     node _gate.mjs --max=40               — fler rader i tabellen (default 60)
//     node _gate.mjs --json                 — maskinläsbart
//     node _gate.mjs --deklarerad=M08_h2typ.family
//                                           — DEKLARERAD avvikelse: ett löv som en
//                                             beslutad ändring MÅSTE flytta. Räknas
//                                             separat, skrivs ut i klartext med
//                                             facit->nu, och fäller inte grinden.
//                                             Använd ALDRIG för att tysta något som
//                                             inte står i punchlistan — varje post
//                                             ska kunna pekas på i ett fynd.
//
//  Slutstatus: 0 = 0 ODEKLARERADE avvikelser (grinden öppen). 1 = grinden STÄNGD.
//  ARBETSREGEL: går grinden inte till 0 — laga och kör om. Gå inte vidare.
// ============================================================================

import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { FILES, WIDTHS, METRICS, sweep } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const has = k => argv.includes('--' + k);

const BASE = resolve(arg('baseline', '_baseline.json'));
const PREFIX = arg('prefix', '');
const DIR = resolve(arg('dir', '.'));
const ONLY = arg('only', null);
const TOL = parseFloat(arg('tol', '0.05'));
const MAX = parseInt(arg('max', '60'), 10);
const JSONOUT = has('json');
const DEKL = new Set(arg('deklarerad', '').split(',').filter(Boolean));

const baseline = JSON.parse(readFileSync(BASE, 'utf8'));
const targets = ONLY ? ONLY.split(',') : FILES;

const num = v => (typeof v === 'number' && isFinite(v));

const browser = await chromium.launch();
const avvikelser = [];
const deklarerade = [];
const perFil = {}, perMetrik = {}, perBredd = {};
const info = [];

for (const f of targets) {
  const bas = baseline.filer[f];
  if (!bas) { console.error('FACIT SAKNAR FILEN: ' + f); process.exit(2); }
  const path = join(DIR, f + '.html');
  const { fontOK, widths } = await sweep(browser, pathToFileURL(path).href, PREFIX);
  if (fontOK !== bas.fontOK) info.push(f + ': fontladdning ' + bas.fontOK + ' -> ' + fontOK + ' (mätningen är inte jämförbar)');

  for (const w of WIDTHS) {
    const A = bas.matt[w], B = widths[w];
    for (const m of METRICS) {
      const a = A ? A[m] : undefined, b = B ? B[m] : undefined;
      if (!a || !b) { push(f, w, m, '(hela metriken)', a ? 'finns' : 'saknas', b ? 'finns' : 'saknas', null, 'METRIK'); continue; }
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const k of keys) {
        const va = a[k], vb = b[k];
        if (!(k in a)) { push(f, w, m, k, '—', fmt(vb), null, 'NYTT LÖV'); continue; }
        if (!(k in b)) { push(f, w, m, k, fmt(va), '—', null, 'LÖV BORTA'); continue; }
        if (num(va) && num(vb)) {
          const d = vb - va;
          if (Math.abs(d) > TOL) push(f, w, m, k, va, vb, d, 'PX');
        } else if (va === null && vb === null) {
          // båda saknas — enigt
        } else if (String(va) !== String(vb)) {
          push(f, w, m, k, fmt(va), fmt(vb), null, num(va) || num(vb) ? 'TYP' : 'VÄRDE');
        }
      }
    }
  }
}
await browser.close();

function fmt(v) { return v === null || v === undefined ? 'null' : String(v); }
function push(fil, bredd, metrik, lov, facit, nu, delta, typ) {
  if (DEKL.has(metrik + '.' + lov)) { deklarerade.push({ fil, bredd, metrik, lov, facit, nu, delta, typ }); return; }
  avvikelser.push({ fil, bredd, metrik, lov, facit, nu, delta, typ });
  perFil[fil] = (perFil[fil] || 0) + 1;
  perMetrik[metrik] = (perMetrik[metrik] || 0) + 1;
  perBredd[bredd] = (perBredd[bredd] || 0) + 1;
}

// ---------------------------------------------------------------------------
if (JSONOUT) {
  console.log(JSON.stringify({ antal: avvikelser.length, deklarerade: deklarerade.length, deklareradeLov: [...DEKL], facit: BASE, prefix: PREFIX, katalog: DIR, tolerans: TOL, perFil, perMetrik, perBredd, avvikelser, deklareradeRader: deklarerade }, null, 1));
  process.exit(avvikelser.length ? 1 : 0);
}

const celler = targets.length * WIDTHS.length * METRICS.length;
const pad = (s, n) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

console.log('');
console.log('  GRIND mot ' + BASE.split('/').pop() + (PREFIX ? '   prefix=".' + PREFIX + '"' : '') + '   tolerans ' + TOL + ' px');
console.log('  ' + targets.length + ' filer x ' + WIDTHS.length + ' bredder x ' + METRICS.length + ' metrik = ' + celler + ' metrikceller');
for (const i of info) console.log('  ! ' + i);
console.log('');
if (DEKL.size) {
  const par = [...new Set(deklarerade.map(d => d.facit + '  ->  ' + d.nu))];
  console.log('  DEKLARERADE AVVIKELSER (räknas inte, men göms inte heller):');
  for (const l of DEKL) {
    const rader = deklarerade.filter(d => d.metrik + '.' + d.lov === l);
    console.log('    ' + l + ' : ' + rader.length + ' celler  (' + [...new Set(rader.map(r => r.fil))].length + ' filer x ' +
      [...new Set(rader.map(r => r.bredd))].length + ' bredder)');
  }
  for (const p of par) console.log('    ' + p);
  console.log('');
}
console.log('  ANTAL AVVIKELSER: ' + avvikelser.length + (DEKL.size ? '   (odeklarerade; ' + deklarerade.length + ' deklarerade ovan)' : ''));
console.log('');

if (avvikelser.length === 0) {
  console.log('  ✅ GRINDEN ÖPPEN — renderingen är identisk med facit.');
  process.exit(0);
}

console.log('  ' + pad('FIL', 20) + padL('BREDD', 6) + '  ' + pad('METRIK.LÖV', 30) + padL('FACIT', 14) + padL('NU', 14) + padL('Δ', 11) + '  TYP');
console.log('  ' + '-'.repeat(20) + '-'.repeat(6) + '  ' + '-'.repeat(30) + '-'.repeat(14) + '-'.repeat(14) + '-'.repeat(11) + '  ---');
for (const d of avvikelser.slice(0, MAX)) {
  console.log('  ' + pad(d.fil, 20) + padL(d.bredd, 6) + '  ' + pad(d.metrik.replace(/^M\d\d_/, '') + '.' + d.lov, 30)
    + padL(d.facit, 14) + padL(d.nu, 14) + padL(d.delta === null ? '' : (d.delta > 0 ? '+' : '') + d.delta.toFixed(2), 11) + '  ' + d.typ);
}
if (avvikelser.length > MAX) console.log('  … ' + (avvikelser.length - MAX) + ' till (kör med --max=' + avvikelser.length + ' eller --json)');

const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + '=' + v).join('  ');
console.log('');
console.log('  per fil    : ' + top(perFil));
console.log('  per metrik : ' + top(perMetrik));
console.log('  per bredd  : ' + top(perBredd));
console.log('');
console.log('  ⛔ GRINDEN STÄNGD — laga och kör om. Gå inte vidare.');
process.exit(1);
