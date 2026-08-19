// L. [class^="hero-w"] / [class^="blob"] är PREFIX-selektorer på hela class-attributet.
// I Bricks/WP får element ofta EN EXTRA klass först (brxe-xxxx, wp-block-*, lazyload...).
// Bevis: lägg till en klass före och mät vad som händer med layouten.
import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b = await chromium.launch();
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

const PROBE = () => {
  const R = e => e.getBoundingClientRect();
  const w1 = document.querySelector('.hero-w1'), blob = document.querySelector('.blob-a');
  const block = document.querySelector('.block'), panel = document.querySelector('.panel');
  return {
    w1: getComputedStyle(w1).position + ' ' + Math.round(R(w1).width) + 'x' + Math.round(R(w1).height) + ' top=' + Math.round(R(w1).top - R(block).top),
    blob: getComputedStyle(blob).position + ' ' + Math.round(R(blob).width) + 'x' + Math.round(R(blob).height),
    blockH: Math.round(R(block).height), panelH: Math.round(R(panel).height),
    docH: document.documentElement.scrollHeight,
    docScrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
  };
};

for (const f of FILES) {
  console.log('--- ' + f);
  for (const [label, mut] of [
    ['ORÖRD', null],
    ['Bricks-klass FÖRE (class="brxe-abc123 hero-w1")', () => {
      document.querySelectorAll('[class^="hero-w"]').forEach((e, i) => e.setAttribute('class', 'brxe-abc12' + i + ' ' + e.getAttribute('class')));
      document.querySelectorAll('[class^="blob-"]').forEach((e, i) => e.setAttribute('class', 'brxe-xyz9' + i + ' ' + e.getAttribute('class')));
    }],
    ['plugin-klass FÖRE (lazyloaded)', () => {
      document.querySelectorAll('svg').forEach(e => { const c = e.getAttribute('class'); if (c && (c.startsWith('hero-w') || c.startsWith('blob'))) e.setAttribute('class', 'lazyloaded ' + c); });
    }],
  ]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    if (mut) await p.evaluate(mut);
    await p.waitForTimeout(300);
    const m = await p.evaluate(PROBE);
    const bad = m.docScrollW > m.clientW ? '  ⚠HORISONTELL SCROLL ' + m.docScrollW + '>' + m.clientW : '';
    console.log('   ' + label.padEnd(46) + JSON.stringify(m) + bad);
    await p.close();
  }
}
await b.close();
