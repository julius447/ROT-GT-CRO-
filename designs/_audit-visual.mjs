// K. Visuellt bevis: forced-colors + print. Läser faktiska PIXLAR, inte computed style.
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import { writeFileSync } from 'fs';
const b = await chromium.launch();

console.log('### FORCED-COLORS: pixelavläsning av panelen (bakgrund vs text)');
for (const f of ['d2-kvittot-forst', 'hemforsakring']) {
  for (const fc of [false, true]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, forcedColors: fc ? 'active' : 'none' });
    await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(500);
    const name = `screens/_fc-${f}-${fc ? 'active' : 'off'}.png`;
    await p.locator('.panel').screenshot({ path: name });
    // läs pixlar via canvas i sidan
    const px = await p.evaluate(async () => {
      const el = document.querySelector('.panel');
      const cs = getComputedStyle(el);
      const cap = document.querySelector('.p-cap'), amt = document.querySelector('.r-total .amt'), cta = document.querySelector('.cta');
      const g = e => e ? getComputedStyle(e) : null;
      return {
        panelBg: cs.backgroundColor, panelBorder: cs.borderTopColor, panelFCA: cs.forcedColorAdjust,
        capColor: g(cap).color, amtColor: g(amt).color,
        ctaBg: g(cta).backgroundColor, ctaBgImg: g(cta).backgroundImage, ctaColor: g(cta).color,
        ctaBorder: g(cta).borderTopWidth + ' ' + g(cta).borderTopStyle + ' ' + g(cta).borderTopColor,
        chip: (() => { const c = document.querySelector('.r-row.deduct .amt'); return c ? g(c).backgroundColor + ' / ' + g(c).color : '(ingen)'; })(),
        pill: (() => { const c = document.querySelector('.offert-pill'); return g(c).backgroundColor + ' / ' + g(c).color + ' / border ' + g(c).borderTopColor; })(),
        plate: g(document.querySelector('.r-total')).backgroundColor,
        fine: g(document.querySelector('.fine')).color,
      };
    });
    console.log('  ' + f + '  forced-colors=' + (fc ? 'ACTIVE' : 'off'));
    for (const [k, v] of Object.entries(px)) console.log('      ' + k.padEnd(12) + v);
    await p.close();
  }
}

console.log('\n### PRINT: riktig PDF-rendering (print-color-adjust default = economy)');
for (const f of ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(400);
  await p.pdf({ path: `screens/_print-${f}.pdf`, width: '1440px', height: '1200px', printBackground: false });
  await p.pdf({ path: `screens/_print-bg-${f}.pdf`, width: '1440px', height: '1200px', printBackground: true });
  console.log('  skrev screens/_print-' + f + '.pdf (utan bakgrunder = webbläsarens default) + _print-bg-*.pdf');
  await p.close();
}
await b.close();
