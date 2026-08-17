// Kantkontroll: syns någon RAK kant (viewBox-brott) inne i kortet vid någon bredd?
// Mäter varje vågs box mot kortets kanter — en rak kant får bara ligga PÅ eller UTANFÖR kortkanten.
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FLAT = { 'wave-a': ['top', 'left'], 'wave-b': ['bottom', 'right'], 'wave-c': ['bottom', 'left'] };
const b = await chromium.launch();
let bad = 0;
for (const w of [320, 360, 390, 430, 600, 768, 900, 1024, 1120, 1280, 1440, 1600, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 1000 } });
  await p.goto(pathToFileURL(resolve(process.argv[2] || 'd2-kvittot-forst.html')).href);
  await p.waitForTimeout(250);
  const rows = await p.evaluate(() => {
    const blk = document.querySelector('.block').getBoundingClientRect();
    return [...document.querySelectorAll('[class^="wave"]')].map(s => {
      const r = s.getBoundingClientRect();
      return { cls: s.getAttribute('class'),
        top: +(r.top - blk.top).toFixed(1), left: +(r.left - blk.left).toFixed(1),
        bottom: +(blk.bottom - r.bottom).toFixed(1), right: +(blk.right - r.right).toFixed(1) };
    });
  });
  for (const r of rows) {
    for (const side of FLAT[r.cls] || []) {
      if (r[side] > 1.5) { console.log(`⚠ ${w}px  ${r.cls}: rak ${side}-kant ligger ${r[side]}px INNE i kortet`); bad++; }
    }
  }
  await p.close();
}
await b.close();
console.log(bad === 0 ? '✓ Inga raka kanter inne i kortet vid någon bredd' : `${bad} brott hittade`);
