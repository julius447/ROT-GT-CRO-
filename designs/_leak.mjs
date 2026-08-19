// ============================================================================
//  _leak.mjs — LÄCKAGEGRINDEN (P0-2).
//
//  Mäter hur många av VÄRDSIDANS egna element som ändrar computed style när
//  blocket klistras in. Ren sida (host-clean.html) vs sida med block, element
//  för element, 14 egenskaper. Blockets egna element räknas INTE (de ska ändras).
//
//    node _leak.mjs --pre       FÖRE-läget  (pre2-*.html)
//    node _leak.mjs --post      EFTER-läget (ns2-*.html)
//    node _leak.mjs --files=pre2-d2-kvittot-forst,ns2-d2-kvittot-forst
//    node _leak.mjs --widths=1440,390
//
//  Slutstatus 0 = 0 ändrade värdelement (grinden öppen).
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const has = k => argv.includes('--' + k);

const NAMES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = arg('widths', '1440,390').split(',').map(Number);
const files = arg('files', null)
  ? arg('files').split(',')
  : NAMES.map(n => (has('post') ? 'ns2-' : 'pre2-') + n + '.html');

// Värdsidans element: allt UTOM blocket självt.
const snap = () => {
  const PROPS = ['margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color',
    'backgroundColor', 'maxWidth', 'textAlign', 'boxSizing', 'letterSpacing', 'listStyleType', 'outlineColor'];
  const res = {}; let i = 0;
  for (const el of document.querySelectorAll('body, body *')) {
    if (el.closest('.block') || el.closest('.av-block') || el.closest('.ampy-avdrag') ||
      el.closest('.wf-label') || el.tagName === 'STYLE' || el.id === 'brxe-INJ' || el.id === 'brxe-INJ2') continue;
    const cs = getComputedStyle(el);
    res[(el.tagName + '#' + (el.id || '') + '.' + (typeof el.className === 'string' ? el.className : '')).slice(0, 90) + '@' + (i++)] = PROPS.map(p => cs[p]).join('|');
  }
  return res;
};
const docmetrics = () => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  bodyPad: getComputedStyle(document.body).padding,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  bodyLh: getComputedStyle(document.body).lineHeight
});

const b = await chromium.launch();
async function grab(file, w) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(u(file), { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = { snap: await p.evaluate(snap), doc: await p.evaluate(docmetrics) };
  await p.close(); return r;
}

const PROPNAMES = ['margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color',
  'backgroundColor', 'maxWidth', 'textAlign', 'boxSizing', 'letterSpacing', 'listStyleType', 'outlineColor'];

let total = 0;
console.log('');
console.log('  LÄCKAGEGRIND — värdsidans element som ändras av blocket');
console.log('');
console.log('  ' + 'HARNESS'.padEnd(34) + 'BREDD'.padStart(6) + 'ÄNDRADE'.padStart(10) + '  AV'.padStart(7) + '   scrollW ren -> med block');
console.log('  ' + '-'.repeat(34) + '-'.repeat(6) + '-'.repeat(10) + '-'.repeat(7) + '   ' + '-'.repeat(26));

const rader = [];
for (const w of WIDTHS) {
  const clean = await grab('host-clean.html', w);
  for (const f of files) {
    const test = await grab(f, w);
    const st = k => k.replace(/@\d+$/, '');
    const ma = {}, mb = {};
    for (const k in clean.snap) (ma[st(k)] ||= []).push(clean.snap[k]);
    for (const k in test.snap) (mb[st(k)] ||= []).push(test.snap[k]);
    let ch = 0, tot = 0; const perProp = {}; const ex = [];
    for (const k in ma) {
      if (!mb[k]) continue;
      const n = Math.min(ma[k].length, mb[k].length);
      for (let i = 0; i < n; i++) {
        tot++;
        if (ma[k][i] !== mb[k][i]) {
          ch++;
          const A = ma[k][i].split('|'), B = mb[k][i].split('|');
          for (let j = 0; j < PROPNAMES.length; j++) if (A[j] !== B[j]) perProp[PROPNAMES[j]] = (perProp[PROPNAMES[j]] || 0) + 1;
          if (ex.length < 6) ex.push(k + ' :: ' + ma[k][i] + '  ->  ' + mb[k][i]);
        }
      }
    }
    total += ch;
    rader.push({ f, w, ch, tot, perProp, ex, cleanDoc: clean.doc, testDoc: test.doc });
    console.log('  ' + f.padEnd(34) + String(w).padStart(6) + String(ch).padStart(10) + String(tot).padStart(7) +
      '   ' + clean.doc.scrollW + ' -> ' + test.doc.scrollW +
      (clean.doc.scrollW === test.doc.scrollW ? '  (=)' : '  (!)'));
  }
}
await b.close();

console.log('');
for (const r of rader) {
  if (!r.ch) continue;
  console.log('  --- ' + r.f + ' @' + r.w + ' : ' + r.ch + ' ändrade -----------------------------');
  console.log('      per egenskap : ' + Object.entries(r.perProp).sort((a, c) => c[1] - a[1]).map(([k, v]) => k + '=' + v).join('  '));
  console.log('      body padding : ' + r.cleanDoc.bodyPad + '  ->  ' + r.testDoc.bodyPad);
  console.log('      body lh      : ' + r.cleanDoc.bodyLh + '  ->  ' + r.testDoc.bodyLh);
  for (const e of r.ex) console.log('      ' + e.slice(0, 200));
}
console.log('');
console.log('  SUMMA ÄNDRADE VÄRDELEMENT: ' + total);
console.log(total === 0 ? '  ✅ LÄCKAGEGRINDEN ÖPPEN — blocket rör inte ett enda element på värdsidan.'
  : '  ⛔ LÄCKAGE — ' + total + ' element på värdsidan ändras av blocket.');
process.exit(total === 0 ? 0 : 1);
