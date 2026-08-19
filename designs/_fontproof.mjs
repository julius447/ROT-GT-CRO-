// ============================================================================
//  _fontproof.mjs — P0-4 mätt som ett A/B I PRODUKTION (inte preview mot produktion).
//
//  Auditens fynd: blockets @font-face pekade relativt och 404:ade i produktion, och
//  sajtens Outfit finns bara som nio DISKRETA vikter -> 450/550 renderades som 500/600.
//  Bevisvärdet ligger i FÖRE/EFTER på SAMMA sida, samma bredd, samma container:
//     pre2-*  = blocket som det låg (relativ font-URL, 404)
//     ns2-*   = blocket namespacat (AvdragOutfit mot 200-URL:en)
//  Previewfacit (_baseline.json) står bredvid — men gt-produkts H2 bryter till TVÅ
//  rader i produktion (Bricks-containern är 1280, previewn 1384). Det är P0-5, som är
//  öppen och ägargrindad, INTE en fontfråga: därför mäts även .accent, som är en
//  obruten span i båda lägena.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { readFileSync } from 'fs';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const base = JSON.parse(readFileSync('_baseline.json', 'utf8'));

const measure = (P) => {
  const ink = el => {
    if (!el) return { w: null, rader: 0 };
    let minL = Infinity, maxR = -Infinity; const tops = {};
    const wlk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = wlk.nextNode())) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const rr of rg.getClientRects()) {
        if (!rr.width && !rr.height) continue;
        if (rr.left < minL) minL = rr.left; if (rr.right > maxR) maxR = rr.right;
        tops[Math.round(rr.top * 2) / 2] = 1;
      }
    }
    return isFinite(minL) ? { w: +(maxR - minL).toFixed(2), rader: Object.keys(tops).length } : { w: null, rader: 0 };
  };
  // BLOCKETS h2 — inte sidans. document.querySelector('h2') tar vardsidans egen rubrik
  // (den ligger tidigare i DOM:en) och matte da fel sak helt.
  const blk = document.querySelector('.' + P + 'block');
  const h2 = blk.querySelector('h2');
  const acc = blk.querySelector('.' + P + 'accent');
  const vardH2 = document.querySelector('h2');
  const cs = getComputedStyle(h2);
  return {
    h2: ink(h2), accent: ink(acc), vard: ink(vardH2), vardSammaSomBlock: vardH2 === h2,
    typ: cs.fontSize + '/' + cs.fontWeight + '/' + cs.lineHeight,
    familj: cs.fontFamily.split(',')[0],
    faces: [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' · ')
  };
};

const b = await chromium.launch();
async function grab(file, P) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const fel = [];
  p.on('response', r => { if (/woff2/.test(r.url()) && r.status() >= 400) fel.push(r.status() + ' ' + r.url().split('/').pop()); });
  p.on('requestfailed', r => { if (/woff2/.test(r.url())) fel.push('FAILED ' + r.url().split('/').pop()); });
  await p.goto(u(file), { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(measure, P); r.fontfel = fel; await p.close(); return r;
}

console.log('');
console.log('  P0-4 — H2-BLÄCKET @1440, PRODUKTIONSHARNESSET, FÖRE mot EFTER');
console.log('');
console.log('  ' + 'fil'.padEnd(20) + 'preview(facit)'.padStart(16) + 'prod FÖRE'.padStart(12) + 'prod EFTER'.padStart(12) + '   rader f/e   avvikelse mot facit');
console.log('  ' + '-'.repeat(20) + '-'.repeat(16) + '-'.repeat(12) + '-'.repeat(12) + '   ' + '-'.repeat(30));
for (const f of FILES) {
  const fac = base.filer[f].matt['1440'];
  const A = await grab('pre2-' + f + '.html', '');
  const B = await grab('ns2-' + f + '.html', 'av-');
  const dA = +(A.h2.w - fac.M09_h2black.w).toFixed(2), dB = +(B.h2.w - fac.M09_h2black.w).toFixed(2);
  console.log('  ' + f.padEnd(20) + String(fac.M09_h2black.w).padStart(16) + String(A.h2.w).padStart(12) + String(B.h2.w).padStart(12) +
    '   ' + (A.h2.rader + '/' + B.h2.rader).padStart(6) + '   FÖRE ' + (dA > 0 ? '+' : '') + dA + '  EFTER ' + (dB > 0 ? '+' : '') + dB);
  console.log('     .accent-bläck (obruten span) : facit ' + fac.M10_accent.w + '   före ' + A.accent.w + '   efter ' + B.accent.w);
  console.log('     H2 fs/vikt/lh                : facit ' + fac.M08_h2typ.fs + 'px/' + fac.M08_h2typ.fw + '/' + fac.M08_h2typ.lh + 'px   före ' + A.typ + '   efter ' + B.typ);
  console.log('     VÄRDSIDANS egen h2 (läckaget) : före ' + A.vard.w + ' px   efter ' + B.vard.w + ' px' +
    (A.vard.w === B.vard.w ? '' : '   <- blockets oscopade h2{} skrev om sidans rubrik'));
  console.log('     familj / fontfel             : före "' + A.familj + '" ' + (A.fontfel.length ? '⛔ ' + A.fontfel.join(',') : '(inga 404 i harnesset)') +
    '   efter "' + B.familj + '" ' + (B.fontfel.length ? '⛔ ' + B.fontfel.join(',') : '✅'));
}
await b.close();
console.log('');
