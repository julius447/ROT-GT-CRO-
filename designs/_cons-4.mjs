// KONSOLIDERING pass 4 — måleri (ampyRing), print, reduced-motion, forced-colors, @supports-grenen.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const local = f => pathToFileURL(resolve(f)).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const b = await chromium.launch();
const out = {};

// ---- A. steady-state paints (3 s stillastående)
out.paint = {};
for (const f of FILES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(local(f + '.html'));
  await p.waitForTimeout(600);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Performance.enable');
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  await p.waitForTimeout(3000);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  out.paint[f] = {
    dRecalc: m1.RecalcStyleCount - m0.RecalcStyleCount,
    dLayout: m1.LayoutCount - m0.LayoutCount,
    dTaskMs: +((m1.TaskDuration - m0.TaskDuration) * 1000).toFixed(1),
    dStyleMs: +((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000).toFixed(1),
    animations: await p.evaluate(() => document.getAnimations().map(a => (a.animationName || '?') + '@' + (a.effect.target.className || a.effect.target.tagName)))
  };
  await p.close();
}

// ---- B. print
out.print = {};
{
  const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  for (const f of FILES) {
    await p.goto(local(f + '.html')); await p.waitForTimeout(300);
    await p.emulateMedia({ media: 'print' });
    out.print[f] = await p.evaluate(() => {
      const q = s => document.querySelector(s);
      const g = (s, ps) => { const e = q(s); if (!e) return null; const c = getComputedStyle(e); return ps.map(x => x + '=' + c[x]).join(' '); };
      let hasPrint = false;
      for (const ss of document.styleSheets) { try { for (const r of ss.cssRules) if (r.conditionText && /print/.test(r.conditionText)) hasPrint = true; } catch (e) { } }
      return {
        hasPrintRule: hasPrint,
        panel: g('.panel', ['backgroundColor', 'printColorAdjust', 'webkitPrintColorAdjust']),
        lbl: g('.r-row .lbl', ['color']),
        amt: g('.r-row .amt', ['color']),
        fine: g('.fine', ['color']),
        total: g('.r-total .amt', ['color'])
      };
    });
    await p.emulateMedia({ media: 'screen' });
  }
  await p.close();
}

// ---- C. reduced motion + forced colors
out.rm = {}; out.fc = {};
for (const f of FILES) {
  let p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(local(f + '.html')); await p.waitForTimeout(400);
  out.rm[f] = await p.evaluate(() => {
    const r = document.querySelector('.cta-ring');
    return {
      ctaRingShadow: r ? getComputedStyle(r).boxShadow : 'saknas',
      anims: document.getAnimations().length,
      blockOpacity: getComputedStyle(document.querySelector('.block')).opacity
    };
  });
  await p.close();
  p = await b.newPage({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  await p.goto(local(f + '.html')); await p.waitForTimeout(400);
  out.fc[f] = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const cta = q('.cta'), cs = cta && getComputedStyle(cta);
    const blob = q('.blob-a'), wave = q('.hero-w1');
    return {
      ctaBgImage: cs.backgroundImage, ctaBg: cs.backgroundColor, ctaBorder: cs.borderTopWidth + ' ' + cs.borderTopStyle, ctaColor: cs.color, ctaShadow: cs.boxShadow,
      blobFill: blob ? getComputedStyle(blob).fill : null,
      waveFill: wave ? getComputedStyle(wave).fill : null,
      panelBg: getComputedStyle(q('.panel')).backgroundColor,
      plate: q('.r-total') ? getComputedStyle(q('.r-total')).backgroundColor : null
    };
  });
  await p.close();
}

// ---- D. @supports-grenen + vilken .cta-regel som vinner
{
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  await p.goto(local('d2-kvittot-forst.html')); await p.waitForTimeout(200);
  out.supports = await p.evaluate(() => {
    const res = { CQ: CSS.supports('container-type', 'inline-size'), rules: [] };
    for (const ss of document.styleSheets) {
      try {
        const walk = (rules, ctx) => {
          for (const r of rules) {
            if (r.cssRules) walk(r.cssRules, ctx + ' | ' + (r.conditionText || r.name || r.cssText.split('{')[0]));
            else if (/^\.cta\b|\bcta\s*\{/.test(r.selectorText || '')) {
              if (/width|padding|gap|white-space/.test(r.cssText)) res.rules.push({ ctx: ctx.trim(), sel: r.selectorText, css: r.style.cssText.slice(0, 150) });
            }
          }
        };
        walk(ss.cssRules, '');
      } catch (e) { }
    }
    return res;
  });
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
