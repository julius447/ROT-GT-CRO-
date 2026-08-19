import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { FILES } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/_metrics.mjs';
const browser = await chromium.launch();
for (const f of FILES) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(process.env.D4 || '.', f + '.html')).href, { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    const sh = [...document.styleSheets].find(s => s.ownerNode && s.ownerNode.id === 'ampy-avdrag-css');
    const doda = [];
    const ga = (rules, villkor) => { for (const rr of rules) {
      // OBS: en CSSStyleRule HAR numera en (tom) cssRules-lista — den far aldrig
      // anvandas som "detta ar en villkorsregel", da kontrolleras noll selektorer.
      if (rr.selectorText) {
        for (const sel of rr.selectorText.split(',')) {
          const ren = sel.trim()
            .replace(/::?(before|after|hover|active|focus-visible|first-line)\b/g, '')
            .replace(/:not\(:last-child\)/g, '').trim();
          if (!ren) continue;
          let n = 0; try { n = document.querySelectorAll(ren).length; } catch (e) { n = -1; }
          if (n === 0) doda.push((villkor.trim() || 'skarm') + ' | ' + sel.trim());
        }
      }
      if (rr.cssRules && rr.cssRules.length) {
        ga(rr.cssRules, villkor + (rr.conditionText ? ' @' + rr.conditionText : ''));
      }
    } };
    ga(sh.cssRules, '');
    return doda;
  });
  const nya = r.filter(x => /print|forced-colors/.test(x));
  const gamla = r.filter(x => !/print|forced-colors/.test(x));
  console.log('  ' + f.padEnd(22) + ' döda selektorer TOTALT: ' + String(r.length).padStart(3) + '   varav i det NYA lagret: ' + nya.length);
  for (const d of nya) console.log('     ' + f.padEnd(20) + ' NY   ' + d);
  for (const d of gamla) console.log('     ' + f.padEnd(20) + ' SKARM ' + d);
  await page.close();
}
await browser.close();
