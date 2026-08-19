// ============================================================================
//  _fontscenarios.mjs — VAD RENDERAS EGENTLIGEN I PRODUKTION IDAG? (P0-4)
//
//  Tre scenarier, samma sida (ampy.se:s riktiga CSS), samma bredd, samma container.
//  Bygg dem med  python3 scratchpad/mk_forescenarier.py  först.
//
//    A  blockets @font-face DEKLARERAD men laddar inte   = PRODUKTION IDAG
//    B  blockets @font-face BORTTAGEN helt               = auditens font404-harness
//    C  @font-face mot 200-URL:en, familjen heter Outfit = auditens fontfix-harness
//
//  Skillnaden A/B är inte akademisk: en DEKLARERAD men trasig face behåller sin plats
//  som bästa träff för vikt 450 och Chrome faller INTE tillbaka på sajtens egna
//  Outfit-vikter — den faller ur familjen och landar på system-ui. Blocket renderar
//  alltså inte Outfit alls i produktion idag. Tas facen bort (B) hittar familjen
//  sajtens nio diskreta vikter och 450 rundas till 500.
//  face-statusen skrivs ut som bevis: "100 900:error" mot "100 900:loaded".
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const FILES = ['d2-kvittot-forst', 'hemforsakring'];
const FACIT = { 'd2-kvittot-forst': 579.39, 'hemforsakring': 525.47 };   // _baseline.json M09_h2black.w @1440

const probe = () => {
  const el = document.querySelector('.block h2') || document.querySelector('.av-block h2');
  let a = Infinity, z = -Infinity;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const q of r.getClientRects()) { if (!q.width && !q.height) continue; a = Math.min(a, q.left); z = Math.max(z, q.right); }
  }
  const cs = getComputedStyle(el);
  const egen = [...document.fonts].filter(f => /100 900/.test(f.weight));
  return {
    ink: +(z - a).toFixed(2), familj: cs.fontFamily.split(',')[0], vikt: cs.fontWeight,
    egenFace: egen.length ? egen.map(f => f.family + ' ' + f.weight + ':' + f.status).join(', ') : 'ingen variabel face',
    sajtLoaded: [...document.fonts].filter(f => /Outfit/.test(f.family) && !/100 900/.test(f.weight) && f.status === 'loaded').map(f => f.weight).join(',')
  };
};

const b = await chromium.launch();
console.log('');
console.log('  P0-4 — TRE SCENARIER @1440, H2-BLÄCKET MOT DET PIXELGODKÄNDA FACIT');
console.log('');
console.log('  ' + 'fil'.padEnd(19) + ' scen  ' + 'bläck'.padStart(8) + '  Δ facit'.padStart(9) + '   renderad familj   blockets egen face');
console.log('  ' + '-'.repeat(19) + ' ----  ' + '-'.repeat(8) + '  ' + '-'.repeat(8) + '   ' + '-'.repeat(45));
for (const f of FILES) {
  for (const v of ['A', 'B', 'C']) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(S + `fore-${v}-${f}.html`).href, { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(probe); await p.close();
    const d = +(r.ink - FACIT[f]).toFixed(2);
    console.log('  ' + f.padEnd(19) + '  ' + v + '   ' + String(r.ink).padStart(8) + '  ' + ((d > 0 ? '+' : '') + d).padStart(8) +
      '   ' + r.familj.padEnd(16) + ' ' + r.egenFace);
  }
  // EFTER: samma sida, namespacat block
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(S + 'ns2-' + f + '.html').href, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(probe); await p.close();
  const d = +(r.ink - FACIT[f]).toFixed(2);
  console.log('  ' + f.padEnd(19) + ' EFTER ' + String(r.ink).padStart(7) + '  ' + ((d > 0 ? '+' : '') + d).padStart(8) +
    '   ' + r.familj.padEnd(16) + ' ' + r.egenFace + (d === 0 ? '   ✅ återställt' : '   ⛔'));
}
await b.close();
console.log('');
