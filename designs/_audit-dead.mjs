// A. Statisk CSS-parse + runtime querySelectorAll-räkning per selektor.
// Bevisar död kod: selektor finns i CSS men matchar 0 element i SIN EGEN fil.
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const WIDTHS = [320, 390, 744, 900, 1024, 1280, 1440, 1920];

const b = await chromium.launch();
const out = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href);
  await p.waitForTimeout(300);

  const res = await p.evaluate(() => {
    const sheet = document.styleSheets[0];
    const rows = [];
    const props = new Set();      // deklarerade custom props
    const used = new Set();       // refererade via var()
    const impo = [];
    const dupProps = [];
    const keyframes = [];

    function scanDecls(rule, ctx) {
      const s = rule.style;
      const seen = {};
      for (let i = 0; i < s.length; i++) {
        const name = s.item(i);
        const val = s.getPropertyValue(name);
        if (name.startsWith('--')) props.add(name);
        for (const m of val.matchAll(/var\(\s*(--[\w-]+)/g)) used.add(m[1]);
        if (s.getPropertyPriority(name) === 'important') impo.push({ ctx, sel: rule.selectorText, name, val });
        seen[name] = (seen[name] || 0) + 1;
      }
      // dubbeldefinierade properties syns inte i CSSOM (den kollapsar) -> hanteras i textparsen
    }

    function walk(rules, ctx) {
      for (const r of rules) {
        if (r.type === CSSRule.STYLE_RULE) {
          scanDecls(r, ctx);
          for (const sel of r.selectorText.split(',').map(s => s.trim())) {
            let n = -1, err = null;
            try { n = document.querySelectorAll(sel.replace(/::?(before|after|focus-visible|hover|active)\b/g, '')).length; }
            catch (e) { err = e.message; }
            rows.push({ ctx, sel, raw: r.selectorText, n, err, css: r.style.cssText.slice(0, 140) });
          }
        } else if (r.type === CSSRule.MEDIA_RULE) walk(r.cssRules, ctx + ' @media ' + r.conditionText);
        else if (r.type === CSSRule.SUPPORTS_RULE) walk(r.cssRules, ctx + ' @supports ' + r.conditionText);
        else if (r.type === CSSRule.CONTAINER_RULE) walk(r.cssRules, ctx + ' @container ' + (r.conditionText || r.containerQuery));
        else if (r.type === CSSRule.KEYFRAMES_RULE) keyframes.push(r.name);
        else if (r.constructor.name === 'CSSContainerRule') walk(r.cssRules, ctx + ' @container');
      }
    }
    walk(sheet.cssRules, '');
    // hitta animation-namn som används
    const animUsed = new Set();
    document.querySelectorAll('*').forEach(e => {
      const a = getComputedStyle(e).animationName;
      if (a && a !== 'none') a.split(',').forEach(x => animUsed.add(x.trim()));
    });
    return { rows, props: [...props], used: [...used], impo, keyframes, animUsed: [...animUsed] };
  });
  out[f] = res;
  await p.close();
}
await b.close();

for (const f of FILES) {
  const r = out[f];
  console.log('\n======================= ' + f + '.html');
  const dead = r.rows.filter(x => x.n === 0);
  console.log('-- SELEKTORER MED 0 MATCHNINGAR (' + dead.length + ' av ' + r.rows.length + ')');
  for (const d of dead) console.log('   [' + (d.ctx || 'top') + '] ' + d.sel + '   ->   ' + d.css);
  const errs = r.rows.filter(x => x.err);
  if (errs.length) console.log('-- SELEKTORFEL:', JSON.stringify(errs, null, 1));
  const unusedVars = r.props.filter(p => !r.used.includes(p));
  console.log('-- CUSTOM PROPS DEKLARERADE:', r.props.length, ' OANVÄNDA:', JSON.stringify(unusedVars));
  const undef = r.used.filter(u => !r.props.includes(u));
  if (undef.length) console.log('-- var() UTAN DEFINITION:', JSON.stringify(undef));
  console.log('-- !important:', JSON.stringify(r.impo));
  console.log('-- @keyframes definierade:', JSON.stringify(r.keyframes), ' animationer i bruk:', JSON.stringify(r.animUsed));
}
