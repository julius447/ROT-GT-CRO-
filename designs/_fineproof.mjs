// Bevis för P2-4: är `border-top-color` på .panel--dark .fine en no-op?
// Mäter beräknad border-top-style/width/color på den riktiga noden.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
console.log('\n  FIL                  BREDD  .panel--dark .fine — beräknad border-top\n');
for (const f of FILES) {
  for (const w of [390, 1024, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 1200 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href, { waitUntil: 'load' });
    const r = await p.evaluate(() => {
      const e = document.querySelector('.panel--dark .fine');
      if (!e) return null;
      const c = getComputedStyle(e);
      return { style: c.borderTopStyle, width: c.borderTopWidth, color: c.borderTopColor };
    });
    console.log('  ' + f.padEnd(22) + String(w).padStart(5) + '  ' + JSON.stringify(r));
    await p.close();
  }
}
await b.close();
console.log('');
