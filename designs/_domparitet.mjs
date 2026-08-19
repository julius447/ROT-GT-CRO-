/**
 * DOM-STRUKTURGRIND — jämför trädet, inte bara måtten.
 *
 * Mätgrinden (_phpparitet.mjs) ser att något ÄR fel; den här säger VAD.
 * Den fångade buggen där en lat regex lämnade en föräldralös textnod
 * (" + installation") kvar i kvittoraden: måtten sa "+31,5 px", trädet sa
 * exakt vilken nod som var för mycket.
 *
 * Jämför: taggnamn · klasser · attribut (id-prefix normaliserat bort) · textnoder.
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const LEV = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview/fran-php';
const PAR = [
  ['rot', 'd2-kvittot-forst.html'],
  ['gt-produkt', 'gt-produkt.html'],
  ['gt-generisk', 'gt-generisk.html'],
  ['hemforsakring', 'hemforsakring.html'],
];

const SIGN = () => {
  const rader = [];
  // Hårt mellanslag skrivs som ~ så att ett tappat &nbsp; syns i diffen i stället
  // för att tyst normaliseras bort av \s
  const norm = (s) => s.replace(/\u00a0/g, '~').replace(/\s+/g, ' ').trim();

  // Designfilerna märker ut redigerbara fält med <span data-slot="…">. De har noll
  // CSS-regler (verifierat) och är därför layoutneutrala; PHP:n plattar ut dem till
  // ett enda fält. Packa upp dem på BÅDA sidor så att grinden jämför det som räknas.
  const rot = document.querySelector('.ampy-avdrag').cloneNode(true);
  rot.querySelectorAll('[data-slot]').forEach((e) => e.replaceWith(...e.childNodes));
  rot.normalize();

  const gaVidare = (nod, djup) => {
    for (const b of nod.childNodes) {
      if (b.nodeType === 3) {
        const t = norm(b.textContent);
        if (t) rader.push(`${'  '.repeat(djup)}#text ${JSON.stringify(t)}`);
      } else if (b.nodeType === 1) {
        const attr = [...b.attributes]
          .map((a) => {
            let v = a.value;
            // instans-id:t är av konstruktion olikt (av-1-…) — normalisera bort prefixet
            if (a.name === 'id' || a.name === 'aria-labelledby') v = v.replace(/^av-\d+-/, '');
            // designen har href="#", PHP:n det riktiga målet — jämför inte målet här
            if (a.name === 'href') v = v.replace(/^(#|\/offert\/)$/, '[CTA]');
            return `${a.name}="${norm(v)}"`;
          })
          .sort()
          .join(' ');
        rader.push(`${'  '.repeat(djup)}<${b.tagName.toLowerCase()} ${attr}>`);
        gaVidare(b, djup + 1);
      }
    }
  };
  gaVidare(rot, 0);
  return rader;
};

const webb = await chromium.launch();
let avvikelser = 0;

for (const [typ, designfil] of PAR) {
  const las = async (url) => {
    const p = await webb.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(url).href);
    await p.evaluate(async () => { await document.fonts.ready; });
    const r = await p.evaluate(SIGN);
    await p.close();
    return r;
  };
  const a = await las(resolve(designfil));
  const b = await las(resolve(LEV, `${typ}.html`));

  // radvis diff: första olikheten pekar ut noden
  const n = Math.max(a.length, b.length);
  let fel = 0;
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      if (fel < 6) {
        console.log(`AVVIKELSE ${typ} rad ${i}`);
        console.log(`  design   : ${a[i] ?? '(saknas)'}`);
        console.log(`  leverans : ${b[i] ?? '(saknas)'}`);
      }
      fel++; avvikelser++;
    }
  }
  console.log(`${typ.padEnd(14)} ${a.length} noder · ${fel} avvikelser`);
}

console.log(`\nDOM-paritet: ${avvikelser} avvikelser`);
await webb.close();
process.exit(avvikelser ? 1 : 0);
