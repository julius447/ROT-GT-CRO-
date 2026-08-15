// Renderar batteripayloaden genom ALLA data-slots (mallvariantens fyra vägar) + tvåägarraden.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const url = pathToFileURL(resolve('gt-produkt.html')).href;
const payload = {
  'produkt': 'Solcellsbatteri',
  'produkt-obest': 'solcellsbatteri',
  'produkt-best': 'batteriet',
  'avdrag': 'Så räknas Grön Teknik',
  'grind-produkt': 'För solcellsbatteri krävs att batteriet kopplas till egen solelproduktion. Utan solceller kan ROT, 30 % av arbetet, gälla i stället.',
  'villkor-produkt': 'Priset förutsätter två ägare som delar fakturan. En ägare: avdraget stannar vid 50 000 kr.',
};
const b = await chromium.launch();
for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url);
  await p.evaluate(pl => {
    for (const [k, v] of Object.entries(pl))
      document.querySelectorAll(`[data-slot="${k}"]`).forEach(el => el.textContent = v);
  }, payload);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `screens/final-gt-batteri-${name}.png`, fullPage: true });
  if (name === 'desktop') {
    const t = await p.evaluate(() => ({
      titel: document.title,
      namn: document.querySelector('.block[aria-labelledby]') ? document.querySelector('#' + document.querySelector('.block').getAttribute('aria-labelledby')).textContent.replace(/\s+/g,' ').trim() : 'HÅRDKODAD aria-label: ' + document.querySelector('.block').getAttribute('aria-label'),
      rad1: document.querySelectorAll('.r-row')[0].textContent.replace(/\s+/g,' ').trim(),
      note: document.querySelector('.t-note').textContent.replace(/\s+/g,' ').trim(),
      fine: document.querySelector('.fine').textContent.replace(/\s+/g,' ').trim(),
      dubbelSpace: /\S {2,}\S/.test(document.querySelector('.t-note').textContent + '|' + document.querySelector('.fine').textContent),
      hopklistrat: /[a-zåäö]\.[A-ZÅÄÖ]/.test(document.querySelector('.t-note').textContent + '|' + document.querySelector('.fine').textContent),
      emdash: (document.body.innerText.match(/—/g) || []).length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    console.log(JSON.stringify(t, null, 1));
  }
  await p.close();
}
await b.close();
console.log('sparat batteri-png:er');
