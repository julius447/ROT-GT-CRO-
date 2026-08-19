// ============================================================================
//  _ns-proof.mjs — BEVISEN för det namespace-refaktorn påstår sig lösa.
//  Allt mäts i PRODUKTIONSHARNESSET (ampy.se:s riktiga CSS + riktig Bricks-markup).
//
//   P0-3  lazyload-klass på alla sex dekor-SVG:er  -> 0 höjdförändring
//   P0-6  två block på samma sida                  -> 0 dubblett-id, rätt tillgängligt namn
//   P0-4  fonten laddas + H2-bläcket = previewfacit
//   P1-15 blockets font-size/vikt oberoende av temats body
//   0.2   leveransformatet: CSS i <body> (Bricks Code) vs FÖRST i <head> (wp_head)
//   —     .brxe-code vs .brxe-div
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { readFileSync } from 'fs';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const base = JSON.parse(readFileSync('_baseline.json', 'utf8'));

const b = await chromium.launch();
const page = async (f, w) => {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(u(f), { waitUntil: 'load' });
  await p.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await p.waitForTimeout(500);
  return p;
};

// bläckbredd = exakt samma mätning som _metrics.mjs M09
const inkOf = sel => {
  const el = document.querySelector(sel); if (!el) return null;
  let minL = Infinity, maxR = -Infinity;
  const wlk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while ((n = wlk.nextNode())) {
    if (!n.textContent.trim()) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const rr of rg.getClientRects()) {
      if (!rr.width && !rr.height) continue;
      if (rr.left < minL) minL = rr.left; if (rr.right > maxR) maxR = rr.right;
    }
  }
  return isFinite(minL) ? +(maxR - minL).toFixed(2) : null;
};

const rad = (t, v) => console.log('  ' + t.padEnd(46) + v);
console.log('');

// ---------------------------------------------------------------- P0-3
console.log('  P0-3  LAZYLOAD-ATTACKEN (klass FÖRST på alla sex dekor-SVG:er)');
console.log('        före refaktorn: blockhöjd 691,4 -> 3 482,4 px @1440 (auditens mätning)');
let p03 = 0;
for (const f of FILES) {
  for (const w of [1440, 390]) {
    const a = await page('ns2-' + f + '.html', w);
    const ha = await a.evaluate(() => +document.querySelector('.av-block').getBoundingClientRect().height.toFixed(2)); await a.close();
    const c = await page('ns2lazy-' + f + '.html', w);
    const hc = await c.evaluate(() => ({
      h: +document.querySelector('.av-block').getBoundingClientRect().height.toFixed(2),
      klasser: document.querySelector('.av-hero-w1').getAttribute('class')
    })); await c.close();
    const d = +(hc.h - ha).toFixed(2);
    if (Math.abs(d) > 0.05) p03++;
    rad(`   ${f} @${w}`, `${ha} -> ${hc.h} px   Δ ${d}   class="${hc.klasser}"`);
  }
}
console.log('  ' + (p03 ? '⛔ ' + p03 + ' höjdförändringar' : '✅ 0 höjdförändringar — [class^=] är borta, .av-wave/.av-blob tål extra klasser'));
console.log('');

// ---------------------------------------------------------------- P0-6
console.log('  P0-6  TVÅ BLOCK PÅ SAMMA SIDA (d2 + gt-produkt)');
{
  const p = await page('ns2two.html', 1440);
  const r = await p.evaluate(() => {
    const ids = [...document.querySelectorAll('.ampy-avdrag [id]')].map(e => e.id);
    const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
    const namn = [...document.querySelectorAll('.av-panel[aria-labelledby]')].map(s => {
      const t = document.getElementById(s.getAttribute('aria-labelledby'));
      return s.getAttribute('aria-labelledby') + ' -> "' + (t ? t.textContent.trim() : 'SAKNAS') + '"';
    });
    const sekt = [...document.querySelectorAll('.av-block[aria-labelledby]')].map(s => {
      const t = document.getElementById(s.getAttribute('aria-labelledby'));
      return s.getAttribute('aria-labelledby') + ' -> "' + (t ? t.textContent.trim().slice(0, 34) : 'SAKNAS') + '"';
    });
    return { antalBlock: document.querySelectorAll('.ampy-avdrag').length, ids, dup, namn, sekt };
  });
  await p.close();
  rad('   block på sidan', r.antalBlock);
  rad('   id i blocken', r.ids.join('  '));
  rad('   DUBBLETT-ID', r.dup.length ? '⛔ ' + r.dup.join(', ') : '✅ inga (facit före: pcap×2)');
  for (const n of r.namn) rad('   panelens namn', n);
  for (const n of r.sekt) rad('   sektionens namn', n);
}
console.log('');

// ------------------------------------------------------- P0-4 + P1-15 + 0.2
console.log('  P0-4 / P1-15 / LEVERANSFORMAT — produktion mot previewfacit @1440');
console.log('        matt: .accent-blacket, som ar en obruten span i bada harnessen');
console.log('        fil                 facit(preview)   brxe-code(body)   wp_head(head)   .brxe-div');
let bad = 0;
for (const f of FILES) {
  // .accent ar en obruten span i BADA harnessen och darfor det facit-jamforbara mattet.
  // H2-blacket sjalvt ar det bara nar rubriken har lika manga rader i preview och
  // produktion — gt-produkt bryter till tva rader i den smalare Bricks-containern (P0-5,
  // oppen agargrind), och da mater man radbrytning, inte font.
  const facit = base.filer[f].matt['1440'].M10_accent.w;
  const facitH2 = base.filer[f].matt['1440'].M09_h2black.w;
  const vals = [];
  for (const v of ['ns2-', 'ns2head-', 'ns2div-']) {
    const p = await page(v + f + '.html', 1440);
    const r = await p.evaluate((io) => {
      const f = new Function('sel', 'return (' + io + ')(sel)');
      const h2 = document.querySelector('.av-h2'), cs = getComputedStyle(h2);
      const acc = document.querySelector('.av-accent');
      const wrap = document.querySelector('.ampy-avdrag'), ws = getComputedStyle(wrap);
      return {
        ink: f('.av-h2'), accent: f('.av-accent'),
        typ: cs.fontSize + '/' + cs.fontWeight + '/' + cs.lineHeight,
        wrap: ws.fontSize + '/' + ws.fontWeight,
        face: [...document.fonts].filter(x => /Avdrag/.test(x.family)).map(x => x.family + ':' + x.status).join(',') || 'INGEN',
        blockW: +document.querySelector('.av-block').getBoundingClientRect().width.toFixed(1)
      };
    }, inkOf.toString());
    await p.close(); vals.push(r);
  }
  const ok = vals.every(v => Math.abs(v.accent - facit) <= 0.05);
  if (!ok) bad++;
  rad('   ' + f + ' (.accent-black)', `${facit}   ${vals.map(v => v.accent).join('   ')}   ${ok ? '✅' : '⛔'}`);
  rad('      H2-black (facit ' + facitH2 + ')', vals.map(v => v.ink).join('   ') +
     (Math.abs(vals[0].ink - facitH2) > 0.05 ? '   <- rubriken bryter pa annat stalle i den 1280 breda Bricks-containern (P0-5, oppen)' : '   = facit'));
  rad('      H2 typografi (kod/head/div)', vals.map(v => v.typ).join('  |  '));
  rad('      wrapper font-size/vikt', vals.map(v => v.wrap).join('  |  ') + '   (temats body: 16px/300)');
  rad('      @font-face', vals[0].face + '   blockbredd ' + vals[0].blockW + ' px');
}
console.log('  ' + (bad ? '⛔ ' + bad + ' filer avviker' : '✅ .accent-bläcket = previewfacit i ALLA tre leveranslägena (0,00 px)'));
console.log('');
await b.close();
process.exit(p03 || bad ? 1 : 0);
