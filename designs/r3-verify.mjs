// Slutverifiering: overflow-mätning + nyckelmått + basparitetsdiff.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { readFileSync } from 'fs';

const DIR = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs';
const FILES = {
  d2: 'd2-kvittot-forst.html',
  gtp: 'gt-produkt.html',
  gtg: 'gt-generisk.html',
  hf: 'hemforsakring.html',
};
const WIDTHS = [320, 350, 768, 1024, 1080, 1360, 1440, 1600, 1920];

const browser = await chromium.launch();
const out = {};
for (const [slug, file] of Object.entries(FILES)) {
  out[slug] = {};
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto(pathToFileURL(`${DIR}/${file}`).href);
    await page.waitForTimeout(350);
    const m = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const r = (el) => el ? el.getBoundingClientRect() : null;
      const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const panel = q('.panel');
      const amt = q('.r-total .amt');
      const amtFs = amt ? getComputedStyle(amt).fontSize : null;
      // staplade kvittorader? (container-läget): .dots display none => staplat
      const dots = q('.r-row .dots');
      const stacked = dots ? getComputedStyle(dots).display === 'none' : null;
      const fine = q('.fine');
      const wrap = q('.cta-wrap');
      const cta = q('.cta');
      const fineR = r(fine), wrapR = r(wrap), ctaR = r(cta);
      // avdelaren = wrap::before: topp av wrap + padding-top
      const wrapPT = wrap ? parseFloat(getComputedStyle(wrap).paddingTop) : null;
      const fineToDivider = fineR && wrapR ? (wrapR.top + wrapPT) - fineR.bottom : null;
      const dividerToCta = wrapR && ctaR ? ctaR.top - (wrapR.top + wrapPT + 1) : null;
      // CTA textrader
      const ctaLines = cta ? Math.round(ctaR.height / (parseFloat(getComputedStyle(cta).fontSize) * 1.25)) : null;
      const block = q('.block');
      const blockPad = block ? getComputedStyle(block).paddingTop : null;
      const grid = q('.grid');
      const gridCols = grid ? getComputedStyle(grid).gridTemplateColumns : null;
      const stepN = q('.step .n');
      const stepNBg = stepN ? getComputedStyle(stepN).backgroundColor : null;
      const tnote = q('.r-total .t-note');
      const tnoteDisp = tnote ? getComputedStyle(tnote).display : 'none/absent';
      const h2 = q('h2');
      const h2Lines = h2 ? Math.round(r(h2).height / (parseFloat(getComputedStyle(h2).fontSize) * 1.2)) : null;
      return {
        overflowX,
        panelW: panel ? +r(panel).width.toFixed(1) : null,
        amtFs, stacked,
        fineToDivider: fineToDivider != null ? +fineToDivider.toFixed(1) : null,
        dividerToCta: dividerToCta != null ? +dividerToCta.toFixed(1) : null,
        ctaLines, blockPad, gridCols: gridCols ? gridCols.split(' ').map(x => x).join(' ') : null,
        stepNBg, tnoteDisp, h2Lines,
        blockH: block ? +r(block).height.toFixed(0) : null,
      };
    });
    out[slug][w] = m;
    await page.close();
  }
}
await browser.close();

for (const slug of Object.keys(out)) {
  console.log(`\n=== ${slug} ===`);
  for (const w of WIDTHS) {
    const m = out[slug][w];
    console.log(`${w}: ovf=${m.overflowX} panel=${m.panelW} amt=${m.amtFs} stacked=${m.stacked} fine→div=${m.fineToDivider} div→cta=${m.dividerToCta} ctaLines=${m.ctaLines} padY=${m.blockPad} tnote=${m.tnoteDisp} h2L=${m.h2Lines} blockH=${m.blockH}`);
  }
}

// ---- basparitetsdiff: extrahera <style> och jämför mot d2 ----
console.log('\n=== BASPARITET (style-diff mot d2) ===');
const style = (f) => readFileSync(`${DIR}/${f}`, 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1].split('\n');
const base = style(FILES.d2);
for (const slug of ['gtp', 'gtg', 'hf']) {
  const s = style(FILES[slug]);
  const a = new Set(base.map((l, i) => l));
  // radvis LCS-lös enkel diff: rader i s som inte finns i base + tvärtom
  const onlyIn = (x, y) => x.filter(l => !y.includes(l));
  const extra = onlyIn(s, base);
  const missing = onlyIn(base, s);
  console.log(`\n--- ${slug}: +${extra.length} rader egna / -${missing.length} rader saknas ---`);
  extra.slice(0, 40).forEach(l => console.log(`+ ${l}`));
  missing.slice(0, 40).forEach(l => console.log(`- ${l}`));
}
