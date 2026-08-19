import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b = await chromium.launch();
console.log('### Deklarationer utan effekt + fokusring vs overflow:hidden');
for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
  for (const w of [390, 1440]) {
    const p = await b.newPage({ viewport:{width:w,height:900} });
    await p.goto(pathToFileURL(resolve(f+'.html')).href); await p.waitForTimeout(300);
    const m = await p.evaluate(()=>{
      const fine = document.querySelector('.fine'), cs = getComputedStyle(fine);
      const panel = document.querySelector('.panel'), cta = document.querySelector('.cta');
      const pr = panel.getBoundingClientRect(), cr = cta.getBoundingClientRect();
      const ps = getComputedStyle(panel);
      return {
        fineBorderStyle: cs.borderTopStyle, fineBorderWidth: cs.borderTopWidth, fineBorderColor: cs.borderTopColor,
        panelOverflow: ps.overflow,
        ctaBottomTillPanelBottom: +(pr.bottom - cr.bottom).toFixed(1),
        ctaTopTillPanelTop: +(cr.top - pr.top).toFixed(1),
        fokusringBehov: '3px outline + 3px offset = 6px',
        klipps: (pr.bottom - cr.bottom) < 6 ? 'JA' : 'nej',
        htmlTextSizeAdjust: getComputedStyle(document.documentElement).webkitTextSizeAdjust + ' / std=' + (getComputedStyle(document.documentElement).textSizeAdjust ?? 'n/a'),
      };
    });
    console.log('  '+f.padEnd(20)+'@'+String(w).padEnd(6)+JSON.stringify(m));
    await p.close();
  }
}
await b.close();
