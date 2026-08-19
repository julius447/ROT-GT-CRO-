// KONSOLIDERING pass 1 — verifierar de mest omtvistade fynden i alla fyra filer.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const out = {};

for (const f of FILES) {
  const url = pathToFileURL(resolve(f + '.html')).href;
  const rec = out[f] = {};

  // ---- A. CTA-bläck vs knappkant, 320..430
  const page = await b.newPage({ viewport: { width: 320, height: 900 } });
  await page.goto(url);
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  rec.fontOK = await page.evaluate(() => document.fonts.check('36px "Outfit"'));
  rec.cta = {};
  for (const w of [320, 344, 345, 346, 360, 375, 390, 400, 430]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    rec.cta[w] = await page.evaluate(() => {
      const cta = document.querySelector('.cta');
      if (!cta) return null;
      const cb = cta.getBoundingClientRect();
      // mät bläckets ytterkanter via Range över alla textnoder + ikoner
      let minL = Infinity, maxR = -Infinity;
      const walk = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        if (!n.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const rr of r.getClientRects()) { minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); }
      }
      for (const el of cta.querySelectorAll('svg')) {
        const rr = el.getBoundingClientRect();
        minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right);
      }
      const cs = getComputedStyle(cta);
      return {
        ctaW: +cb.width.toFixed(2), ctaH: +cb.height.toFixed(2),
        leftGap: +(minL - cb.left).toFixed(2),   // negativt = bläck utanför
        rightGap: +(cb.right - maxR).toFixed(2),
        padL: cs.paddingLeft, padR: cs.paddingRight, width: cs.width, ws: cs.whiteSpace, gap: cs.gap
      };
    });
  }

  // ---- B. steps-cap margin (mobil)
  await page.setViewportSize({ width: 390, height: 900 });
  await page.waitForTimeout(60);
  rec.stepsCap390 = await page.evaluate(() => getComputedStyle(document.querySelector('.steps-cap')).marginBottom);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(60);
  rec.stepsCap1440 = await page.evaluate(() => getComputedStyle(document.querySelector('.steps-cap')).marginBottom);

  // ---- C. wf-label i DOM: inuti section.block?
  rec.wfLabel = await page.evaluate(() => {
    const wf = document.querySelector('.wf-label');
    const blk = document.querySelector('section.block');
    if (!wf) return 'saknas';
    return {
      insideBlock: blk ? blk.contains(wf) : null,
      parent: wf.parentElement.tagName + '.' + wf.parentElement.className,
      href: wf.querySelector('a') ? wf.querySelector('a').getAttribute('href') : null,
      h: +wf.getBoundingClientRect().height.toFixed(1)
    };
  });

  // ---- D. h2 max-width @1920 + .step p max-width
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.waitForTimeout(60);
  rec.at1920 = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    const sp = document.querySelector('.step p');
    return {
      h2MaxWidth: getComputedStyle(h2).maxWidth,
      h2BoxW: +h2.getBoundingClientRect().width.toFixed(2),
      stepPMaxWidth: getComputedStyle(sp).maxWidth,
      leftW: +document.querySelector('.left').getBoundingClientRect().width.toFixed(2),
      panelW: +document.querySelector('.panel').getBoundingClientRect().width.toFixed(2),
      blockW: +document.querySelector('.block').getBoundingClientRect().width.toFixed(2)
    };
  });

  // ---- E. panel inner-size svep 1121..1470 (letar CQ-tröskeln 400)
  const sweep = [];
  for (let w = 1121; w <= 1470; w += 1) {
    await page.setViewportSize({ width: w, height: 900 });
    const v = await page.evaluate(() => {
      const p = document.querySelector('.panel');
      const cs = getComputedStyle(p);
      const inner = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const row = document.querySelector('.r-row');
      return [+inner.toFixed(2), row ? getComputedStyle(row).display : null];
    });
    sweep.push([w, v[0], v[1]]);
  }
  const min = sweep.reduce((a, c) => (c[1] < a[1] ? c : a));
  rec.panelInnerMin = { width: min[0], inner: min[1], rowDisplay: min[2] };
  rec.panelInnerAny400 = sweep.filter(s => s[1] < 402).map(s => s.join(':'));
  rec.rowModes = [...new Set(sweep.map(s => s[2]))];

  // ---- F. h2 .accent overflow 995..1030
  const acc = [];
  for (let w = 995; w <= 1030; w++) {
    await page.setViewportSize({ width: w, height: 900 });
    const v = await page.evaluate(() => {
      const h2 = document.querySelector('h2'); const a = h2.querySelector('.accent');
      if (!a) return null;
      const hb = h2.getBoundingClientRect(); const ab = a.getBoundingClientRect();
      return +(ab.right - hb.right).toFixed(2);
    });
    if (v !== null && v > 0.5) acc.push(w + ':+' + v);
  }
  rec.accentOverflow = acc;

  await page.close();
}

// ---- G. dubblett-id över filer + inom fil
const fs = await import('fs');
const ids = {};
for (const f of FILES) {
  const src = fs.readFileSync(f + '.html', 'utf8');
  const body = src.slice(src.indexOf('<body'));
  for (const m of body.matchAll(/\bid="([^"]+)"/g)) (ids[m[1]] ||= []).push(f);
}
out._ids = Object.fromEntries(Object.entries(ids).filter(([, v]) => v.length > 1));

await b.close();
console.log(JSON.stringify(out, null, 1));
