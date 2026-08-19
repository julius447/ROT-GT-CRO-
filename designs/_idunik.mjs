/** Kontrollsidan: bevisar att fyra block på samma sida inte kolliderar. */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const F = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview/alla-fyra.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto(pathToFileURL(F).href);
await p.evaluate(async () => { await document.fonts.ready; });
console.log(await p.evaluate(() => {
  const id = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const dubbla = id.filter((v, i) => id.indexOf(v) !== i);
  const trasigLabelledby = [...document.querySelectorAll('[aria-labelledby]')]
    .filter((e) => !document.getElementById(e.getAttribute('aria-labelledby')))
    .map((e) => e.getAttribute('aria-labelledby'));
  return [
    `block          : ${document.querySelectorAll('.ampy-avdrag').length}`,
    `id totalt      : ${id.length}`,
    `dubbletter     : ${dubbla.length ? dubbla.join(', ') : 'inga'}`,
    `trasig koppling: ${trasigLabelledby.length ? trasigLabelledby.join(', ') : 'inga'}`,
    `vågrätt spill  : ${Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)}px`,
  ].join('\n');
}));
await b.close();
