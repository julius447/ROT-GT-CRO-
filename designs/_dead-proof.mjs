// ============================================================================
//  _dead-proof.mjs — BEVISET för steg 1 (deduplicering + död kod).
//
//  Två oberoende bevislinjer, ingen gissning:
//    (A) DOM: querySelectorAll(sel).length i den RIKTIGA renderade sidan
//        (Playwright/Chromium) — 0 = ingen nod kan någonsin träffas.
//    (B) TEXT: exakt räkning av var(--token)-referenser i källan, med
//        ordgräns så att var(--ease-out) INTE räknas som var(--ease).
//
//  Kör:  node _dead-proof.mjs            (alla filer, alla kandidater)
//        node _dead-proof.mjs --json
// ============================================================================

import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

// Selektorer som punchlistan påstår är döda (P2-2, P2-3, P2-4) + kontrollgrupp
// (selektorer som MÅSTE ha träffar — bevisar att mätningen alls kan hitta noder).
const SELEKTORER = [
  '.nb',
  '.r-row.deduct .amt',
  '.r-total .t-note',
  '.panel--dark .r-total .t-note',
  '.panel--dark .fine',
  '.fine',
  '.t-amt-fras',
  // --- kontrollgrupp: ska ge >0 ---
  '.block', '.panel', '.cta', '.steps-cap', '.r-row', '.r-total', '.step',
];

// Tokens som punchlistan (P2-1) påstår har 0 var()-referenser + kontrollgrupp.
const TOKENS = [
  'teal-bright', 'faint', 'subtle', 'shadow-1', 'fast', 'normal', 'ease',
  // --- kontrollgrupp: ska ge >0 ---
  'navy', 'teal', 'ink', 'muted', 'line', 'ease-out', 'shadow-3', 'r-xl', 'edge',
];

const out = { filer: {} };
const browser = await chromium.launch();

for (const f of FILES) {
  const path = resolve(f + '.html');
  const src = readFileSync(path, 'utf8');
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(pathToFileURL(path).href, { waitUntil: 'load' });

  // (A) DOM-träffar
  const dom = await page.evaluate(sels => {
    const r = {};
    for (const s of sels) { try { r[s] = document.querySelectorAll(s).length; } catch (e) { r[s] = 'OGILTIG'; } }
    return r;
  }, SELEKTORER);

  // (B) token-referenser i källan — exakt var(--namn) , ordgräns via ')' eller ','
  const tok = {};
  for (const t of TOKENS) {
    const re = new RegExp('var\\(\\s*--' + t.replace(/[-]/g, '\\-') + '\\s*[),]', 'g');
    tok[t] = (src.match(re) || []).length;
  }

  // (C) definitionsräkning: hur många gånger deklareras tokenet
  const def = {};
  for (const t of TOKENS) {
    const re = new RegExp('(^|[;{\\s])--' + t.replace(/[-]/g, '\\-') + '\\s*:', 'gm');
    def[t] = (src.match(re) || []).length;
  }

  // (D) kommentarbalans (P2-5)
  const open = (src.match(/\/\*/g) || []).length;
  const close = (src.match(/\*\//g) || []).length;

  // (E) keyframes-inventering (P1-8) — från den riktiga CSSOM:en
  const kf = await page.evaluate(() => {
    const names = [];
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules; } catch (e) { continue; }
      const walk = rs => { for (const r of rs) { if (r.type === CSSRule.KEYFRAMES_RULE) names.push(r.name); if (r.cssRules) walk(r.cssRules); } };
      walk(rules);
    }
    return names;
  });

  // (F) animation-namn som faktiskt refereras
  const animRefs = [...new Set((src.match(/animation\s*:[^;]*/g) || []).join(' ').match(/\b(fade|ampyRing|ampy-av-ring)\b/g) || [])];

  out.filer[f] = { dom, tok, def, kommentar: { open, close, obalans: open - close }, keyframes: kf, animRefs };
  await page.close();
}
await browser.close();

if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }

const P = (s, n) => String(s).padEnd(n), L = (s, n) => String(s).padStart(n);
console.log('\n=== (A) DOM-TRÄFFAR — querySelectorAll().length i renderad sida ===\n');
console.log('  ' + P('SELEKTOR', 32) + FILES.map(f => L(f.slice(0, 9), 11)).join(''));
for (const s of SELEKTORER) {
  const row = FILES.map(f => L(out.filer[f].dom[s], 11)).join('');
  const dead = FILES.every(f => out.filer[f].dom[s] === 0);
  console.log('  ' + P(s, 32) + row + (dead ? '   <- DÖD I ALLA' : ''));
}
console.log('\n=== (B) TOKEN: var()-referenser (definitioner) ===\n');
console.log('  ' + P('TOKEN', 18) + FILES.map(f => L(f.slice(0, 9), 13)).join(''));
for (const t of TOKENS) {
  const row = FILES.map(f => L(out.filer[f].tok[t] + ' (' + out.filer[f].def[t] + ')', 13)).join('');
  const dead = FILES.every(f => out.filer[f].tok[t] === 0);
  console.log('  ' + P('--' + t, 18) + row + (dead ? '  <- 0 REF I ALLA' : ''));
}
console.log('\n=== (D) KOMMENTARBALANS  /*  vs  */ ===\n');
for (const f of FILES) { const k = out.filer[f].kommentar; console.log('  ' + P(f, 22) + L(k.open, 5) + ' öppningar' + L(k.close, 6) + ' stängningar   obalans ' + k.obalans); }
console.log('\n=== (E) @keyframes i CSSOM  /  (F) refererade animationsnamn ===\n');
for (const f of FILES) console.log('  ' + P(f, 22) + '[' + out.filer[f].keyframes.join(', ') + ']   refs: [' + out.filer[f].animRefs.join(', ') + ']');
console.log('');
