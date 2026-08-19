// I. (1) :has(:empty)-grinden i gt-produkt under REALISTISK ACF-output (blanksteg/nyrad i sloten)
//    (2) Optisk linjering mätt per RAD (Range), inte per elementbox
//    (3) Connector-linjens ändar
//    (4) Innehållsvariation: långa slot-värden (produktnamn, ortsnamn, batterinoten)
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';

const b = await chromium.launch();

console.log('### (1) gt-produkt: .r-total .t-note:has(> [data-slot="grind-produkt"]:empty)');
for (const [label, mutate] of [
  ['tom slot (som i filen)', () => { }],
  ['ACF-output med ETT blanksteg', () => { document.querySelector('[data-slot="grind-produkt"]').textContent = ' '; }],
  ['ACF-output med nyrad+indrag', () => { document.querySelector('[data-slot="grind-produkt"]').innerHTML = '\n      '; }],
  ['ACF-output med <br>', () => { document.querySelector('[data-slot="grind-produkt"]').innerHTML = '<br>'; }],
  ['ACF wpautop: <p></p>', () => { document.querySelector('[data-slot="grind-produkt"]').innerHTML = '<p></p>'; }],
  ['batteri-payload (riktig text)', () => { document.querySelector('[data-slot="grind-produkt"]').textContent = 'För solcellsbatteri krävs att batteriet kopplas till egen solelproduktion. Utan solceller kan ROT, 30 % av arbetet, gälla i stället.'; }],
]) {
  for (const w of [390, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve('gt-produkt.html')).href);
    await p.evaluate(mutate);
    await p.waitForTimeout(200);
    const m = await p.evaluate(() => {
      const t = document.querySelector('.r-total .t-note'), tot = document.querySelector('.r-total');
      return { display: getComputedStyle(t).display, noteH: +t.getBoundingClientRect().height.toFixed(1), plateH: Math.round(tot.getBoundingClientRect().height), blockH: Math.round(document.querySelector('.block').getBoundingClientRect().height) };
    });
    console.log('   ' + label.padEnd(30) + '@' + String(w).padEnd(6) + JSON.stringify(m));
    await p.close();
  }
}

console.log('\n### (2)+(3) Optisk linjering PER RAD + connector-linjens ändar');
for (const f of ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring']) {
  console.log('--- ' + f);
  for (const w of [320, 390, 744, 1024, 1280, 1440, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href); await p.waitForTimeout(300);
    const m = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.step').forEach((s, i) => {
        const n = s.querySelector('.n'), h3 = s.querySelector('h3');
        const r = document.createRange(); r.selectNodeContents(h3);
        const lines = [...r.getClientRects()];
        const first = lines[0];
        const nr = n.getBoundingClientRect();
        out.push({ i, rader: lines.length, d: +((nr.top + nr.height / 2) - (first.top + first.height / 2)).toFixed(2) });
      });
      // connector: mellanrum cirkelns underkant -> linjens topp, och linjens botten -> nästa cirkels topp
      const s0 = document.querySelectorAll('.step')[0], s1 = document.querySelectorAll('.step')[1];
      const cs = getComputedStyle(s0, '::before');
      const n0 = s0.querySelector('.n').getBoundingClientRect(), n1 = s1.querySelector('.n').getBoundingClientRect();
      const stepTop = s0.getBoundingClientRect().top;
      const lineTop = stepTop + parseFloat(cs.top);
      const lineBottom = s0.getBoundingClientRect().bottom - parseFloat(cs.bottom);
      return { steg: out, gapOver: +(lineTop - n0.bottom).toFixed(2), gapUnder: +(n1.top - lineBottom).toFixed(2), lineW: cs.borderLeftWidth };
    });
    console.log('   @' + String(w).padEnd(5) + 'linjering=' + m.steg.map(s => s.d + '(' + s.rader + 'r)').join(' ') + '  connector-luft över=' + m.gapOver + ' under=' + m.gapUnder);
    await p.close();
  }
}

console.log('\n### (4) INNEHÅLLSVARIATION — långa slot-värden (programmatiska sidor)');
const VAR = {
  'gt-generisk': [
    ['kort ort', s => s.querySelector('[data-slot="ort"]').textContent = 'Ekerö'],
    ['lång ort', s => s.querySelector('[data-slot="ort"]').textContent = 'Upplands Väsby'],
    ['längsta sv. kommunnamn', s => s.querySelector('[data-slot="ort"]').textContent = 'Hässleholm-Vittsjö'],
  ],
  'gt-produkt': [
    ['kort produkt', s => s.querySelectorAll('[data-slot="produkt"]').forEach(e => e.textContent = 'Zaptec Go')],
    ['långt produktnamn', s => s.querySelectorAll('[data-slot="produkt"]').forEach(e => e.textContent = 'Sonnen sonnenBatterie 10 Performance')],
    ['batteri + villkorsrad', s => { s.querySelector('[data-slot="villkor-produkt"]').textContent = 'Är ni två ägare kan ni dela på taket.'; s.querySelector('[data-slot="grind-produkt"]').textContent = 'För solcellsbatteri krävs att batteriet kopplas till egen solelproduktion. Utan solceller kan ROT, 30 % av arbetet, gälla i stället.'; }],
  ],
  'hemforsakring': [
    ['kort tjänst', s => s.querySelector('h2 [data-slot="tjanst"]').textContent = 'ett elfel'],
    ['lång tjänst', s => s.querySelector('h2 [data-slot="tjanst"]').textContent = 'en elbesiktning efter vattenskada'],
  ],
};
for (const [f, cases] of Object.entries(VAR)) {
  console.log('--- ' + f);
  for (const [label, fn] of cases) {
    for (const w of [320, 390, 744, 1024, 1440]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.goto(pathToFileURL(resolve(f + '.html')).href);
      await p.evaluate(`(${fn.toString()})(document)`);
      await p.waitForTimeout(220);
      const m = await p.evaluate(() => {
        const panel = document.querySelector('.panel'), H = panel.getBoundingClientRect();
        const over = [];
        panel.querySelectorAll('.r-row *, .r-total *, .fine, .cta, .cta *').forEach(e => {
          const r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
          if (r.right > H.right + 0.6 || r.left < H.left - 0.6) over.push((e.className.baseVal ?? e.className) + ' ut=' + Math.round(r.right - H.right));
        });
        return { over, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, blockH: Math.round(document.querySelector('.block').getBoundingClientRect().height) };
      });
      const bad = (m.scrollW > m.clientW ? ' ⚠H-SCROLL ' + m.scrollW + '>' + m.clientW : '') + (m.over.length ? ' ⚠ÖVERFLÖD ' + JSON.stringify(m.over) : '');
      if (bad) console.log('    ' + label.padEnd(24) + '@' + String(w).padEnd(5) + 'h=' + m.blockH + bad);
    }
    console.log('    ' + label.padEnd(24) + '(inga överflöd om inget listat ovan)');
  }
}
await b.close();
