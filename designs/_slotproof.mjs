// Bevis för P2-12/P2-13: räkna data-slot i den RIKTIGA DOM:en (inte i källtexten,
// där kommentarerna smittar grep-räkningen).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1400 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href, { waitUntil: 'load' });
  const r = await p.evaluate(() => {
    const els = [...document.querySelectorAll('[data-slot]')];
    const per = {};
    for (const e of els) {
      const k = e.getAttribute('data-slot');
      (per[k] = per[k] || []).push(e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60));
    }
    return { total: els.length, nycklar: Object.keys(per).length, per };
  });
  console.log('\n=== ' + f + ' ===  ' + r.total + ' slot-element, ' + r.nycklar + ' unika nycklar');
  for (const [k, v] of Object.entries(r.per)) console.log('  ' + (k + ' ×' + v.length).padEnd(24) + v.map(t => '"' + t + '"').join('  |  '));
  await p.close();
}
await b.close();
console.log('');
