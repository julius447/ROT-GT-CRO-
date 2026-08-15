// Testar manuella brytpunkter i gt-generisks H2 (ägarorder 5, "manuella brytpunkter").
// Mäter radbredderna för varianter UTAN att röra filen.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const NB = ' ';
const VARIANTS = {
  'nu (ingen manuell)':      `Laddbox i [Ort] med <span class="accent">50${NB}% Grön Teknik</span>, draget direkt på fakturan`,
  'Grön<nbsp>Teknik':        `Laddbox i [Ort] med <span class="accent">50${NB}% Grön${NB}Teknik</span>, draget direkt på fakturan`,
  'i<nbsp>[Ort] + Grön<nbsp>Teknik': `Laddbox i${NB}[Ort] med <span class="accent">50${NB}% Grön${NB}Teknik</span>, draget direkt på fakturan`,
  'hela accenten nowrap igen': `Laddbox i [Ort] med <span class="accent" style="white-space:nowrap">50${NB}% Grön Teknik</span>, draget direkt på fakturan`,
};
const b = await chromium.launch();
for (const [name, html] of Object.entries(VARIANTS)) {
  const line = [];
  for (const w of [390, 360, 320]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve('gt-generisk.html')).href);
    await p.waitForTimeout(300);
    const r = await p.evaluate((h) => {
      const h2 = document.querySelector('h2');
      h2.innerHTML = h;
      const rg = document.createRange(); rg.selectNodeContents(h2);
      const map = new Map();
      for (const r of rg.getClientRects()) {
        if (r.width < 1) continue;
        const k = Math.round(r.top); const v = map.get(k) || { l: 1e9, r: -1e9 };
        v.l = Math.min(v.l, r.left); v.r = Math.max(v.r, r.right); map.set(k, v);
      }
      const a = [...map.values()].map(v => +(v.r - v.l).toFixed(0));
      const m = a.reduce((x, y) => x + y, 0) / a.length;
      return { a, sd: +Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length).toFixed(1),
               h: +h2.getBoundingClientRect().height.toFixed(0) };
    }, html);
    line.push(`@${w} ${JSON.stringify(r.a)} sd=${r.sd} h=${r.h}`);
    await p.close();
  }
  console.log(name.padEnd(34), line.join('  '));
}
await b.close();
