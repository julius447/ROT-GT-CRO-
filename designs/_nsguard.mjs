// ============================================================================
//  _nsguard.mjs — NAMNRYMDSVAKTEN. Kör efter VARJE framtida ändring (steg 3-5).
//
//  Läser den PARSADE stilmallen (CSSOM, inte källtexten) i varje blockfil och
//  kontrollerar de invarianter som steg 2 etablerade. Grinden mäter rendering;
//  den här mäter STRUKTUR — en ny global selektor kan mycket väl rendera
//  identiskt i previewn och ändå skriva om 278 värdsidor.
//
//    1  blockets stilmall (#ampy-avdrag-css) har NOLL globala selektorer
//       (html, body, :root, bart *, bart h2/a/:focus-visible)
//    2  varje klassselektor i blocket bär av-prefix (eller är wrappern)
//    3  inga [class^=]/[class*=]-selektorer
//    4  varje var(--av-x) har en definition i samma stilmall
//    5  inga dubbelprefix (av-av-), inga kvarglömda okända @keyframes
//    6  preview-kromet ligger i EN EGEN stilmall och rör aldrig .av-*/.ampy-avdrag
//    7  markupens id är instansunika över hela familjen
//
//  node _nsguard.mjs     slutstatus 1 om någon invariant bryts.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { FILES } from './_metrics.mjs';

const PFX = 'av-', WRAP = 'ampy-avdrag';
const b = await chromium.launch();
const brott = [];
const alla = [];

for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href, { waitUntil: 'load' });
  const r = await p.evaluate(({ PFX, WRAP }) => {
    const ark = [...document.styleSheets].map(sh => {
      const sel = [], vars = new Set(), anv = new Set(), kf = [];
      const walk = rules => {
        for (const r of rules) {
          if (r.type === CSSRule.STYLE_RULE) {
            sel.push(r.selectorText);
            for (let i = 0; i < r.style.length; i++) {
              const pnamn = r.style[i];
              if (pnamn.startsWith('--')) vars.add(pnamn);
              for (const m of (r.style.getPropertyValue(pnamn) || '').matchAll(/var\(\s*(--[\w-]+)/g)) anv.add(m[1]);
            }
          } else if (r.type === CSSRule.KEYFRAMES_RULE) kf.push(r.name);
          else if (r.cssRules) walk(r.cssRules);
        }
      };
      try { walk(sh.cssRules); } catch (e) { }
      return { id: sh.ownerNode.id || '(namnlös)', sel, vars: [...vars], anv: [...anv], kf };
    });
    const ids = [...document.querySelectorAll('.' + WRAP + ' [id]')].map(e => e.id);
    return { ark, ids };
  }, { PFX, WRAP });
  await p.close();

  const blk = r.ark.find(a => a.id === 'ampy-avdrag-css');
  const prev = r.ark.find(a => a.id === 'av-preview-krom');
  const fel = [];
  if (!blk) fel.push('ingen <style id="ampy-avdrag-css">');
  if (!prev) fel.push('ingen <style id="av-preview-krom">');
  if (blk) {
    for (const s of blk.sel) {
      for (const del of s.split(',').map(x => x.trim())) {
        const head = del.split(/[\s>+~]/)[0];
        if (!(head.startsWith('.' + PFX) || head.startsWith('.' + WRAP)))
          fel.push('1/2 oscopad selektor: ' + del);
        for (const c of [...del.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(m => m[1]))
          if (!(c.startsWith(PFX) || c === WRAP)) fel.push('2 oprefixad klass .' + c + ' i ' + del);
      }
      if (/\[class[\^*$~]?=/.test(s)) fel.push('3 attributselektor på class: ' + s);
      if (s.includes(PFX + PFX)) fel.push('5 dubbelprefix: ' + s);
    }
    for (const v of blk.anv) if (!blk.vars.includes(v)) fel.push('4 var(' + v + ') saknar definition');
    for (const v of blk.anv) if (!v.startsWith('--av')) fel.push('4 oprefixad token: ' + v);
    for (const k of blk.kf) if (!k.startsWith(PFX)) fel.push('5 oprefixad @keyframes: ' + k);
  }
  if (prev) {
    for (const s of prev.sel) if (/\.(av-(?!preview)|ampy-avdrag)/.test(s)) fel.push('6 preview-kromet rör blocket: ' + s);
  }
  alla.push({ f, ids: r.ids, blkSel: blk ? blk.sel.length : 0, prevSel: prev ? prev.sel.length : 0, fel });
  if (fel.length) brott.push(...fel.map(x => f + ': ' + x));
}
await b.close();

// 7 — id-unikhet över HELA familjen (två olika block på samma sida)
const sedda = new Map();
for (const a of alla) for (const id of a.ids) {
  if (sedda.has(id)) brott.push('7 id "' + id + '" delas av ' + sedda.get(id) + ' och ' + a.f);
  else sedda.set(id, a.f);
}

console.log('');
console.log('  NAMNRYMDSVAKTEN');
console.log('');
console.log('  ' + 'fil'.padEnd(22) + 'blockregler'.padStart(12) + 'previewregler'.padStart(14) + '   id');
for (const a of alla) console.log('  ' + a.f.padEnd(22) + String(a.blkSel).padStart(12) + String(a.prevSel).padStart(14) + '   ' + a.ids.join(' '));
console.log('');
console.log('  unika id i familjen: ' + sedda.size + ' av ' + alla.reduce((n, a) => n + a.ids.length, 0));
console.log('  INVARIANTBROTT: ' + brott.length);
for (const x of brott.slice(0, 40)) console.log('    ⛔ ' + x);
console.log(brott.length ? '' : '  ✅ ALLA SJU INVARIANTER HÅLLER.');
console.log('');
process.exit(brott.length ? 1 : 0);
