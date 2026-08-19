// ============================================================================
//  _cssdiff3.mjs — DEKLARATIONSDIFF ur CSSOM (inte ur kalltexten): varje
//  (villkorsvag, selektor, egenskap) -> varde, fore vs efter.
//
//  Poangen: grinden mater RENDERING och ger tusentals foljdavvikelser. Den har
//  mater ORSAKEN. Ar deklarationsdiffen exakt lika med de beslutade andringarna,
//  sa KAN ingen oavsiktlig andring finnas — renderaren ar deterministisk.
//
//    node _cssdiff3.mjs --fore=<katalog> --efter=<katalog>
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { FILES } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const FORE = resolve(arg('fore', '.')), EFTER = resolve(arg('efter', '.'));

const DUMP = () => {
  const sh = [...document.styleSheets].find(s => s.ownerNode && s.ownerNode.id === 'ampy-avdrag-css');
  const out = [];
  const walk = (rules, path) => {
    for (const r of rules) {
      if (r.type === CSSRule.STYLE_RULE) {
        for (let i = 0; i < r.style.length; i++) {
          const p = r.style[i];
          out.push(path + '|' + r.selectorText + '|' + p + '|' + r.style.getPropertyValue(p) +
            (r.style.getPropertyPriority(p) ? ' !important' : ''));
        }
      } else if (r.type === CSSRule.KEYFRAMES_RULE) {
        out.push(path + '|@keyframes ' + r.name + '|' + [...r.cssRules].map(k => k.cssText).join(' ') + '|');
      } else if (r.cssRules) {
        const kind = r.constructor.name;
        const tag = kind.includes('Supports') ? '@supports(' + r.conditionText + ')'
          : kind.includes('Container') ? '@container ' + (r.containerName ? r.containerName + ' ' : '') + r.containerQuery
            : '@media(' + r.conditionText + ')';
        walk(r.cssRules, path + tag + ' ');
      } else if (r.type === CSSRule.FONT_FACE_RULE) {
        out.push(path + '|@font-face|' + r.style.cssText + '|');
      }
    }
  };
  try { walk(sh.cssRules, ''); } catch (e) { out.push('FEL:' + e.message); }
  return out;
};

const b = await chromium.launch();
let totalPlus = 0, totalMinus = 0, totalChanged = 0;
for (const f of FILES) {
  const dump = async dir => {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(join(dir, f + '.html')).href, { waitUntil: 'load' });
    const r = await p.evaluate(DUMP); await p.close(); return r;
  };
  const A = await dump(FORE), B = await dump(EFTER);
  const key = s => s.split('|').slice(0, 3).join('|');
  const mapA = new Map(A.map(s => [key(s), s])), mapB = new Map(B.map(s => [key(s), s]));
  const bort = [...mapA.keys()].filter(k => !mapB.has(k));
  const ny = [...mapB.keys()].filter(k => !mapA.has(k));
  const and = [...mapA.keys()].filter(k => mapB.has(k) && mapA.get(k) !== mapB.get(k));
  console.log('\n================ ' + f + '   (' + A.length + ' -> ' + B.length + ' deklarationer)');
  if (bort.length) { console.log('  -- BORTTAGNA (' + bort.length + '):'); for (const k of bort) console.log('     - ' + mapA.get(k)); }
  if (ny.length) { console.log('  ++ NYA (' + ny.length + '):'); for (const k of ny) console.log('     + ' + mapB.get(k)); }
  if (and.length) {
    console.log('  ~~ ANDRADE (' + and.length + '):');
    for (const k of and) console.log('     ~ ' + k + '\n         ' + mapA.get(k).split('|')[3] + '\n      -> ' + mapB.get(k).split('|')[3]);
  }
  totalMinus += bort.length; totalPlus += ny.length; totalChanged += and.length;
}
await b.close();
console.log('\nSUMMA:  -' + totalMinus + ' borttagna   +' + totalPlus + ' nya   ~' + totalChanged + ' andrade');
