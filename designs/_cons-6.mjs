// KONSOLIDERING pass 6 — resterande omtvistade fynd.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const local = f => pathToFileURL(resolve(f)).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const out = {};

// A. steps-cap 36 -> 22: exakt höjddelta på mobil (ägargrindad visuell diff)
out.stepsCapDelta = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  await p.goto(local(f + '.html')); await p.waitForTimeout(500);
  const before = await p.evaluate(() => [+document.querySelector('.block').getBoundingClientRect().height.toFixed(2), getComputedStyle(document.querySelector('.steps-cap')).marginBottom]);
  await p.addStyleTag({ content: '@media (max-width:900px){ .steps-cap{ margin-bottom:22px !important } }' });
  await p.waitForTimeout(120);
  const after = await p.evaluate(() => [+document.querySelector('.block').getBoundingClientRect().height.toFixed(2), getComputedStyle(document.querySelector('.steps-cap')).marginBottom]);
  out.stepsCapDelta[f] = { fore: before, efter: after, delta: +(after[0] - before[0]).toFixed(2) };
  await p.close();
}

// B. forced-colors: mät PATH-fills (inte svg-elementet)
out.fcPaths = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  await p.goto(local(f + '.html')); await p.waitForTimeout(400);
  out.fcPaths[f] = await p.evaluate(() => {
    const g = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).fill : null; };
    return {
      blobApath: g('.blob-a path'), waveW1path: g('.hero-w1 path'),
      blobAttr: document.querySelector('.blob-a path') ? document.querySelector('.blob-a path').getAttribute('fill') : null,
      panelBg: getComputedStyle(document.querySelector('.panel')).backgroundColor,
      plateBg: getComputedStyle(document.querySelector('.r-total')).backgroundColor,
      dividerBg: (() => { const e = document.querySelector('.cta-wrap'); if (!e) return null; return getComputedStyle(e, '::before').backgroundColor; })()
    };
  });
  await p.close();
}

// C. a11y: listroll + aria-hidden siffror + fokusring HF
out.a11y = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(local(f + '.html')); await p.waitForTimeout(300);
  out.a11y[f] = await p.evaluate(() => {
    const ol = document.querySelector('.steps');
    const hid = [...document.querySelectorAll('[aria-hidden="true"]')].filter(e => e.textContent.trim()).map(e => e.className + ':' + e.textContent.trim().slice(0, 12));
    const foc = document.querySelector('.cta');
    const cs = getComputedStyle(foc);
    return {
      olTag: ol.tagName, olListStyle: getComputedStyle(ol).listStyleType, olRole: ol.getAttribute('role'), olDisplay: getComputedStyle(ol).display,
      liDisplay: getComputedStyle(ol.querySelector('li')).display, liRole: ol.querySelector('li').getAttribute('role'),
      ariaHiddenMedText: hid,
      fokuserbara: document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]').length,
      ctaOutline: null,
      amtColor: getComputedStyle(document.querySelector('.r-row .amt')).color,
      lblSpanColor: (() => { const s = document.querySelector('.r-row .lbl span'); return s ? getComputedStyle(s).color : null; })()
    };
  });
  // fokusring
  await p.focus('.cta'); await p.waitForTimeout(150);
  out.a11y[f].ctaFocus = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.cta')); return { outline: c.outline, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow.slice(0, 90) }; });
  await p.close();
}

// D. gt-produkt :has(:empty)-grinden med whitespace
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(local('gt-produkt.html')); await p.waitForTimeout(300);
  const meas = () => document.querySelector('.r-total') ? [getComputedStyle(document.querySelector('.t-note')).display, +document.querySelector('.r-total').getBoundingClientRect().height.toFixed(2)] : null;
  out.hasEmpty = { tom: await p.evaluate(meas) };
  for (const [tag, val] of [['blanksteg', ' '], ['nyrad', '\n  '], ['wpautop', '<p></p>']]) {
    await p.evaluate(v => { const s = document.querySelector('[data-slot="grind-produkt"]'); s.innerHTML = v; }, val);
    await p.waitForTimeout(80);
    out.hasEmpty[tag] = await p.evaluate(meas);
    await p.evaluate(() => { document.querySelector('[data-slot="grind-produkt"]').innerHTML = ''; });
  }
  await p.close();
}

// E. finns span-färgregler i sajtens riktiga CSS? (A11Y:s P0-5-premiss)
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(u('host-d2-kvittot-forst.html')); await p.waitForTimeout(500);
  out.spanRisk = await p.evaluate(() => {
    const hits = [];
    for (const ss of document.styleSheets) {
      try {
        const walk = rules => { for (const r of rules) { if (r.cssRules) walk(r.cssRules); else if (r.selectorText && /(^|[\s,>+~])span(?![\w-])/.test(r.selectorText) && /color\s*:/.test(r.style.cssText) && !/background/.test(r.style.cssText.split('color')[0].slice(-12))) hits.push(r.selectorText.slice(0, 80) + ' {' + r.style.cssText.slice(0, 60) + '}'); } };
        walk(ss.cssRules);
      } catch (e) { }
    }
    return {
      spanColorRegler: hits.slice(0, 12), antal: hits.length,
      amtColor: getComputedStyle(document.querySelector('.r-row .amt')).color,
      lblSpan: (() => { const s = document.querySelector('.r-row .lbl span'); return s ? getComputedStyle(s).color : null; })()
    };
  });
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
