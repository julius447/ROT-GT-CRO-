import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const url = pathToFileURL(resolve('gt-produkt.html')).href;
const payload = { 'produkt':'Solcellsbatteri','produkt-obest':'solcellsbatteri','produkt-best':'batteriet',
  'grind-produkt':'För solcellsbatteri krävs att batteriet kopplas till egen solelproduktion. Utan solceller kan ROT, 30 % av arbetet, gälla i stället.',
  'villkor-produkt':'Priset förutsätter två ägare som delar fakturan. En ägare: avdraget stannar vid 50 000 kr.' };
const b = await chromium.launch();
for (const variant of ['laddbox', 'batteri']) {
  console.log(`\n--- ${variant} ---`);
  for (const w of [320, 330, 345, 360, 390, 480, 768, 900, 1000, 1120, 1440, 1600]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(url);
    if (variant === 'batteri') await p.evaluate(pl => { for (const [k,v] of Object.entries(pl)) document.querySelectorAll(`[data-slot="${k}"]`).forEach(e => e.textContent = v); }, payload);
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const d = document.documentElement, cta = document.querySelector('.cta');
      const txt = document.body.innerText;
      return { of: d.scrollWidth > d.clientWidth ? `SPILL ${d.scrollWidth}>${d.clientWidth}` : 'ok',
        ctaH: Math.round(cta.getBoundingClientRect().height),
        ctaSpill: cta.scrollWidth > Math.ceil(cta.getBoundingClientRect().width) ? 'CTA-SPILL' : 'ok',
        emdash: (txt.match(/—/g)||[]).length, bang: (txt.match(/!/g)||[]).length,
        dblSpace: /\S  +\S/.test(txt) ? 'DUBBELSPACE' : 'ok',
        glued: /[a-zåäö0-9]\.[A-ZÅÄÖ]/.test(txt) ? 'HOPKLISTRAT' : 'ok',
        namn: document.querySelector('.block').getAttribute('aria-label') || 'via labelledby: ' + document.getElementById(document.querySelector('.block').getAttribute('aria-labelledby')).textContent.replace(/\s+/g,' ').trim().slice(0,42) };
      });
    console.log(`  ${String(w).padStart(4)}px  overflow=${r.of}  cta=${r.ctaH}px/${r.ctaSpill}  em-dash=${r.emdash}  "!"=${r.bang}  ${r.dblSpace}  ${r.glued}`);
    if (w === 1440) console.log(`         a11y-namn: ${r.namn}`);
    await p.close();
  }
}
await b.close();
