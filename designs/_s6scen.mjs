// ============================================================================
//  _s6scen.mjs — STEG 6, DEL 2: de tre produktionsscenarierna.
//
//   (a) TVA BLOCK PA SAMMA SIDA   id-unikhet + att aria-labelledby loser ratt
//       ns2two.html   = d2 + gt-produkt  (olika filer — det normala fallet)
//       ns2twin.html  = d2 + d2          (SAMMA fil tva ganger — varsta fallet)
//   (b) LAZYLOAD-KLASS pa alla sex dekor-SVG:er  -> blockhojden far INTE andras
//       (P0-3: fore refaktorn 691,4 -> 3 482,4 px @1440)
//   (c) BRICKS-WRAPPERN: .brxe-code, .brxe-block OCH .brxe-div -> samma geometri
//
//  node _s6scen.mjs
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

const b = await chromium.launch();
const open = async (f, w) => {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(u(f), { waitUntil: 'load' });
  await p.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
  await p.waitForTimeout(450);
  return p;
};

const pad = (s, n) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
const P = console.log;
let FEL = 0;

// Geometrin som jamfors mellan wrappers/lagen.
const geom = () => {
  const n2 = v => +v.toFixed(2);
  const r = el => { const x = el.getBoundingClientRect(); return { w: n2(x.width), h: n2(x.height) }; };
  const blk = document.querySelector('.av-block'), pan = document.querySelector('.av-panel');
  const h2 = document.querySelector('.av-h2'), cta = document.querySelector('.av-cta');
  const ink = el => {
    let l = Infinity, R = -Infinity;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim()) continue;
      const g = document.createRange(); g.selectNodeContents(n);
      for (const rr of g.getClientRects()) { if (!rr.width) continue; l = Math.min(l, rr.left); R = Math.max(R, rr.right); }
    }
    return isFinite(l) ? n2(R - l) : null;
  };
  return {
    blk: r(blk), pan: r(pan), h2: r(h2), cta: cta ? r(cta) : null,
    h2ink: ink(h2), ctaInk: cta ? ink(cta) : null,
    steg: [...document.querySelectorAll('.av-step')].map(s => r(s).h)
  };
};

// ============================================================ (a) TVA BLOCK
P('');
P('  (a) TVA BLOCK PA SAMMA SIDA');
for (const [namn, fil, beskr] of [
  ['ns2two.html', 'ns2two.html', 'd2 + gt-produkt (olika filer)'],
  ['ns2twin.html', 'ns2twin.html', 'd2 + d2 (SAMMA fil tva ganger)']]) {
  const p = await open(fil, 1440);
  const r = await p.evaluate(() => {
    const wrappers = [...document.querySelectorAll('.ampy-avdrag')];
    const ids = wrappers.flatMap(w => [...w.querySelectorAll('[id]')].map(e => e.id));
    const dup = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
    const namnAv = el => {
      const id = el.getAttribute('aria-labelledby');
      const t = id ? document.getElementById(id) : null;
      return { id, txt: t ? t.textContent.trim().slice(0, 40) : 'SAKNAS', egen: t ? el.contains(t) : false };
    };
    return {
      antal: wrappers.length,
      ids,
      dup,
      sektioner: [...document.querySelectorAll('.av-block[aria-labelledby]')].map(namnAv),
      paneler: [...document.querySelectorAll('.av-panel[aria-labelledby]')].map(namnAv),
      hojder: wrappers.map(w => +w.querySelector('.av-block').getBoundingClientRect().height.toFixed(2))
    };
  });
  await p.close();
  P('    ' + pad(beskr, 34) + 'block=' + r.antal + '  id=' + r.ids.length + '  unika=' + new Set(r.ids).size +
    '  hojder=' + r.hojder.join(' / '));
  P('      id: ' + r.ids.join(' '));
  if (r.dup.length) { FEL++; P('      ⛔ DUBBLETT-ID: ' + r.dup.join(', ')); }
  else P('      ✅ inga dubblett-id');
  for (const s of r.sektioner) {
    const ok = s.txt !== 'SAKNAS' && s.egen;
    if (!ok) FEL++;
    P('      sektionens namn : ' + pad(s.id, 16) + '-> "' + s.txt + '"' + (s.egen ? '  (egen rubrik)  ✅' : '  ⛔ PEKAR UTANFOR SITT EGET BLOCK'));
  }
  for (const s of r.paneler) {
    const ok = s.txt !== 'SAKNAS' && s.egen;
    if (!ok) FEL++;
    P('      panelens namn   : ' + pad(s.id, 16) + '-> "' + s.txt + '"' + (s.egen ? '  (egen rubrik)  ✅' : '  ⛔ PEKAR UTANFOR SITT EGET BLOCK'));
  }
}
P('');

// ============================================================ (b) LAZYLOAD
P('  (b) LAZYLOAD-KLASS PA ALLA SEX DEKOR-SVG:er  (P0-3)');
P('    ' + pad('FIL', 22) + padL('BREDD', 6) + padL('utan', 11) + padL('med', 11) + padL('DELTA', 9) + '   klassattribut');
let lazyFel = 0;
for (const f of FILES) {
  for (const w of WIDTHS) {
    const a = await open('ns2-' + f + '.html', w);
    const ha = await a.evaluate(geom); await a.close();
    const c = await open('ns2lazy-' + f + '.html', w);
    const hc = await c.evaluate(() => ({
      g: (() => { const n2 = v => +v.toFixed(2); const x = document.querySelector('.av-block').getBoundingClientRect(); return { w: n2(x.width), h: n2(x.height) }; })(),
      kl: document.querySelector('.av-hero-w1').getAttribute('class'),
      antal: document.querySelectorAll('.lazyloaded').length
    })); await c.close();
    const d = +(hc.g.h - ha.blk.h).toFixed(2);
    if (Math.abs(d) > 0.05) { lazyFel++; FEL++; }
    P('    ' + pad(f, 22) + padL(w, 6) + padL(ha.blk.h, 11) + padL(hc.g.h, 11) + padL((d > 0 ? '+' : '') + d.toFixed(2), 9) +
      '   ' + (w === WIDTHS[0] ? '"' + hc.kl + '" (' + hc.antal + ' st)' : '') + (Math.abs(d) > 0.05 ? '  ⛔' : ''));
  }
}
P('    ' + (lazyFel ? '⛔ ' + lazyFel + ' hojdforandringar' : '✅ 0 hojdforandringar pa ' + FILES.length * WIDTHS.length + ' matpunkter'));
P('');

// ============================================================ (c) WRAPPERN
P('  (c) BRICKS-WRAPPERN: .brxe-code vs .brxe-block vs .brxe-div');
P('    ' + pad('FIL', 22) + padL('BREDD', 6) + '   code (blockW x H)      block                  div                  dom');
let wrapFel = 0;
for (const f of FILES) {
  for (const w of WIDTHS) {
    const vals = [];
    for (const v of ['ns2-', 'ns2blk-', 'ns2div-']) {
      const p = await open(v + f + '.html', w);
      vals.push(await p.evaluate(geom));
      await p.close();
    }
    const k = vals.map(v => JSON.stringify(v));
    const lika = k[0] === k[1] && k[1] === k[2];
    if (!lika) { wrapFel++; FEL++; }
    P('    ' + pad(f, 22) + padL(w, 6) + '   ' +
      vals.map(v => (v.blk.w + 'x' + v.blk.h).padEnd(21)).join('') + (lika ? '  ✅' : '  ⛔ SKILJER'));
    if (!lika) for (let i = 0; i < 3; i++) P('        ' + ['code', 'block', 'div'][i] + ': ' + k[i]);
  }
}
P('    ' + (wrapFel ? '⛔ ' + wrapFel + ' avvikelser' : '✅ identisk geometri i alla tre wrappers pa ' + FILES.length * WIDTHS.length + ' matpunkter'));
P('');

await b.close();
P('  DEL 2 AVVIKELSER: ' + FEL);
P(FEL === 0 ? '  ✅ DEL 2 GRON' : '  ⛔ DEL 2 HAR AVVIKELSER');
P('');
process.exit(FEL === 0 ? 0 : 1);
