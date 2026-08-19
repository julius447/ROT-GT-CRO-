import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const NAMN = ['Enershare','Zaptec Go','Subtech Go','Charge Amps Aura','Tesla Wall Connector',
              'Wallbox Pulsar Max','go-e Gemini Flex 2.0','Emaldo Power Store','Nexblue Edge 2'];
const b = await chromium.launch();
for (const w of [320, 360, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(pathToFileURL(resolve('gt-produkt.html')).href);
  await p.evaluate(async()=>{await document.fonts.ready});
  console.log('--- ' + w + 'px');
  for (const n of NAMN) {
    const r = await p.evaluate((namn) => {
      const lbl = document.querySelector('.av-lbl');
      lbl.innerHTML = namn.replace(/ /g, ' ') + ' + installation';
      const row = lbl.closest('.av-r-row');
      const panel = document.querySelector('.av-panel');
      return { lblW: lbl.getBoundingClientRect().width,
               inner: row.getBoundingClientRect().width,
               spill: Math.max(0, lbl.scrollWidth - lbl.clientWidth),
               hspill: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) };
    }, n);
    const flagga = (r.spill > 0.5 || r.hspill > 0.5) ? '  ⚑ SPILLER' : '';
    console.log(`  ${n.padEnd(22)} etikett=${r.lblW.toFixed(0)}px rad=${r.inner.toFixed(0)}px spill=${r.spill.toFixed(1)} sida=${r.hspill.toFixed(1)}${flagga}`);
  }
  await p.close();
}
await b.close();
