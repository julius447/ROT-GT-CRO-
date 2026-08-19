// Width sweep: overflow + layout-break + key parity values across all target devices.
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const SHORT = { 'd2-kvittot-forst': 'D2', 'gt-produkt': 'GTP', 'gt-generisk': 'GTG', 'hemforsakring': 'HF' };
const WIDTHS = [320, 344, 345, 346, 360, 375, 390, 412, 430, 480, 481, 600, 744, 768, 810, 834, 900, 901,
  1000, 1001, 1024, 1112, 1120, 1180, 1280, 1366, 1440, 1600, 1699, 1700, 1920, 2560];

const probe = () => {
  const r = n => Math.round(n * 100) / 100;
  const q = s => document.querySelector(s);
  const de = document.documentElement;
  // any element wider than viewport?
  let worst = null;
  for (const el of document.querySelectorAll('.block *, .block')) {
    const b = el.getBoundingClientRect();
    if (b.right > de.clientWidth + 0.5 || b.left < -0.5) {
      const over = Math.max(b.right - de.clientWidth, -b.left);
      if (!worst || over > worst.over) worst = { sel: el.className || el.tagName, over: r(over) };
    }
  }
  const h2 = q('h2'), cta = q('.cta'), panel = q('.panel'), fine = q('.fine');
  const cs = getComputedStyle(cta);
  return {
    scrollW: de.scrollWidth, clientW: de.clientWidth,
    overflow: de.scrollWidth > de.clientWidth ? de.scrollWidth - de.clientWidth : 0,
    outside: worst ? `${worst.sel}:+${worst.over}` : '-',
    h2maxw: getComputedStyle(h2).maxWidth,
    h2w: r(h2.getBoundingClientRect().width),
    h2lines: Math.round(h2.getBoundingClientRect().height / parseFloat(getComputedStyle(h2).lineHeight)),
    stepsCapMB: getComputedStyle(q('.steps-cap')).marginBottom,
    panelW: r(panel.getBoundingClientRect().width),
    panelInner: r(panel.getBoundingClientRect().width - parseFloat(getComputedStyle(panel).paddingLeft) * 2),
    rowMode: getComputedStyle(q('.r-row')).display,
    ctaPad: cs.paddingTop + ' ' + cs.paddingRight + ' ' + cs.paddingBottom + ' ' + cs.paddingLeft,
    ctaW: r(cta.getBoundingClientRect().width),
    ctaH: r(cta.getBoundingClientRect().height),
    blockH: r(q('.block').getBoundingClientRect().height),
    fineLines: Math.round(fine.getBoundingClientRect().height / parseFloat(getComputedStyle(fine).lineHeight)),
  };
};

const b = await chromium.launch();
const res = {};
for (const w of WIDTHS) {
  res[w] = {};
  for (const f of FILES) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    await p.waitForTimeout(150);
    res[w][f] = await p.evaluate(probe);
    await p.close();
  }
}
await b.close();

console.log('W'.padEnd(6) + FILES.map(f => SHORT[f].padEnd(2)).join('') + '  | overflow | outside-viewport | h2 maxw / w / lines | steps-cap mb | panel inner | rowmode | cta pad | cta w');
for (const w of WIDTHS) {
  const anyOver = FILES.some(f => res[w][f].overflow > 0 || res[w][f].outside !== '-');
  for (const f of FILES) {
    const m = res[w][f];
    const flag = (m.overflow > 0 || m.outside !== '-') ? ' !!! ' : '     ';
    console.log(
      String(w).padEnd(6) + SHORT[f].padEnd(5) + flag +
      `ovf=${String(m.overflow).padEnd(4)} out=${m.outside.padEnd(22)} ` +
      `h2=${m.h2maxw.padEnd(10)}/${String(m.h2w).padEnd(7)}/${m.h2lines}r ` +
      `scmb=${m.stepsCapMB.padEnd(6)} pin=${String(m.panelInner).padEnd(7)} ${m.rowMode.padEnd(5)} ` +
      `cta[${m.ctaPad}] w=${m.ctaW} h=${m.ctaH} fine=${m.fineLines}r blk=${m.blockH}`);
  }
  console.log('');
}
