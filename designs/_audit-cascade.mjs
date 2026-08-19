// C. Kaskad: vilka deklarationer VINNER egentligen? Använder CDP getMatchedStylesForNode
// för att lista varje matchande regel i ordning + vilka som är överskuggade.
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();

for (const f of FILES) {
  console.log('\n===================== ' + f);
  for (const w of [390, 768, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    await p.waitForTimeout(250);
    const m = await p.evaluate(() => {
      const g = (sel, props) => {
        const e = document.querySelector(sel);
        if (!e) return '(saknas)';
        const cs = getComputedStyle(e);
        return props.map(pr => pr + '=' + cs[pr]).join(' ');
      };
      return {
        stepsCap: g('.steps-cap', ['marginBottom', 'fontSize', 'letterSpacing']),
        cta: g('.cta', ['width', 'paddingLeft', 'paddingRight', 'paddingTop', 'gap', 'maxWidth']),
        ctaBox: (() => { const e = document.querySelector('.cta'); const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })(),
        ring: (() => { const e = document.querySelector('.cta-ring'); if (!e) return '(ingen)'; const r = e.getBoundingClientRect(); const c = document.querySelector('.cta').getBoundingClientRect(); return 'vänsterkant +' + (r.left - c.left).toFixed(1) + 'px'; })(),
        sgap: getComputedStyle(document.querySelector('.steps')).rowGap,
        panelPad: g('.panel', ['paddingLeft', 'paddingTop', 'paddingBottom']),
        tnote: (() => { const e = document.querySelector('.r-total .t-note'); if (!e) return '(ingen t-note)'; return getComputedStyle(e).display + ' h=' + e.getBoundingClientRect().height.toFixed(1); })(),
      };
    });
    console.log(' @' + w + 'px  ' + JSON.stringify(m, null, 0).replace(/","/g, '"\n           "'));
    await p.close();
  }
}
await b.close();
