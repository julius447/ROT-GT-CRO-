import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const NAMN = ['Enershare','Zaptec Go','Subtech Go','Charge Amps Aura','Tesla Wall Connector',
              'Wallbox Pulsar Max','go-e Gemini Flex 2.0','Emaldo Power Store'];
const b = await chromium.launch();
for (const w of [1280, 1440, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 1000 } });
  await p.goto(pathToFileURL(resolve('gt-produkt.html')).href);
  await p.evaluate(async()=>{await document.fonts.ready});
  console.log('--- ' + w + 'px  (obruten rad = 63,75px)');
  for (const n of NAMN) {
    const r = await p.evaluate((namn) => {
      const lbl = document.querySelector('.av-lbl');
      const row = lbl.closest('.av-r-row');
      const m = {};
      for (const [k, txt] of [['fri', namn + ' + installation'], ['bunden', namn.replace(/ /g, ' ') + ' + installation']]) {
        lbl.innerHTML = txt;
        m[k] = row.getBoundingClientRect().height;
      }
      return m;
    }, n);
    const f = r.bunden > r.fri + 0.5 ? '  ⚑ bindning bryter raden' : '';
    console.log(`  ${n.padEnd(22)} fri=${r.fri.toFixed(2)}  bunden=${r.bunden.toFixed(2)}${f}`);
  }
  await p.close();
}
await b.close();
