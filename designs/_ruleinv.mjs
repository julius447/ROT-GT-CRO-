// ============================================================================
//  _ruleinv.mjs — CSSOM-REGELINVENTERING.
//  Läser den PARSADE stilmallen (inte källtexten) och skriver ut varje regel som
//  "kontext|selektor|deklarationer". Kör mot backupen och mot nuläget och diffa:
//  då syns EXAKT vilka regler som försvunnit — och att inget annat rörts.
//    node _ruleinv.mjs                 (nuläget)
//    node _ruleinv.mjs --dir=/backup   (facit)
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';

const argv = process.argv.slice(2);
const dirArg = argv.find(s => s.startsWith('--dir='));
const DIR = resolve(dirArg ? dirArg.split('=').slice(1).join('=') : '.');
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

const b = await chromium.launch();
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  await p.goto(pathToFileURL(join(DIR, f + '.html')).href, { waitUntil: 'load' });
  const rows = await p.evaluate(() => {
    const out = [];
    const decls = st => { const a = []; for (let i = 0; i < st.length; i++) a.push(st[i] + ':' + st.getPropertyValue(st[i]) + (st.getPropertyPriority(st[i]) ? '!important' : '')); return a.sort().join(';'); };
    const walk = (rules, ctx) => {
      for (const r of rules) {
        if (r.type === CSSRule.STYLE_RULE) out.push(ctx + '|' + r.selectorText + '|' + decls(r.style));
        else if (r.type === CSSRule.KEYFRAMES_RULE) { for (const k of r.cssRules) out.push(ctx + '|@keyframes ' + r.name + ' ' + k.keyText + '|' + decls(k.style)); }
        else if (r.type === CSSRule.FONT_FACE_RULE) out.push(ctx + '|@font-face|' + decls(r.style));
        else if (r.cssRules) walk(r.cssRules, ctx + '{' + (r.conditionText || r.media?.mediaText || r.name || '?') + '}');
      }
    };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, ''); } catch (e) { } }
    return out;
  });
  for (const r of rows) console.log(f + '  ' + r);
  await p.close();
}
await b.close();
