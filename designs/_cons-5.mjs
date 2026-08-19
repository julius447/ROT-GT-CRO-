// KONSOLIDERING pass 5 — namespace-refaktorns PARITETSGRIND + läckagegrind.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const local = f => pathToFileURL(resolve(f)).href;
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];
const W = [320, 360, 390, 430, 744, 768, 810, 834, 1024, 1112, 1180, 1280, 1366, 1440, 1600, 1920, 2560];
const b = await chromium.launch();
const out = {};

// PARITETSMÅTT: geometri för blockets bärande element, relativt blockets egen box
const metric = (P) => {
  const q = s => document.querySelector(s.replace(/\./g, P));
  const rel = (sel) => {
    const el = q(sel); if (!el) return null;
    const blk = q('.block'); const br = blk.getBoundingClientRect(); const r = el.getBoundingClientRect();
    return [+(r.x - br.x).toFixed(2), +(r.y - br.y).toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)];
  };
  const blk = q('.block').getBoundingClientRect();
  const o = { block: [+blk.width.toFixed(2), +blk.height.toFixed(2)] };
  for (const s of ['.grid', '.left', '.panel', '.steps', '.steps-cap', '.step', '.cta', '.r-total', '.fine', '.p-cap', '.r-row', '.mark', '.n', '.amt', '.t-label', '.offert-pill']) {
    o[s] = rel(s);
  }
  const h2 = document.querySelector('h2');
  const hb = h2.getBoundingClientRect();
  o.h2 = [+(hb.x - blk.x).toFixed(2), +(hb.y - blk.y).toFixed(2), +hb.width.toFixed(2), +hb.height.toFixed(2)];
  const cs = getComputedStyle(h2);
  o.h2css = cs.fontSize + '/' + cs.fontWeight + '/' + cs.lineHeight + '/' + cs.textAlign + '/' + cs.maxWidth;
  const p = q('.panel'), pc = getComputedStyle(p);
  o.panelcss = pc.backgroundColor + '|' + pc.paddingLeft + '|' + pc.borderRadius;
  const cta = q('.cta'), cc = getComputedStyle(cta);
  o.ctacss = cc.backgroundImage.slice(0, 60) + '|' + cc.padding + '|' + cc.minHeight + '|' + cc.gap;
  return o;
};

async function grab(url, P) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url); await p.waitForTimeout(900);
  const r = {};
  for (const w of W) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(110); r[w] = await p.evaluate(metric, P); }
  await p.close(); return r;
}

out.parity = {};
for (const f of FILES) {
  const A = await grab(local(f + '.html'), '.');
  const B = await grab(u('ns-' + f + '.html'), '.av-');
  const diffs = [];
  for (const w of W) {
    for (const k in A[w]) {
      const a = JSON.stringify(A[w][k]), c = JSON.stringify(B[w][k]);
      if (a !== c) diffs.push(`@${w} ${k}: ${a} -> ${c}`);
    }
  }
  out.parity[f] = { antalMatt: W.length * Object.keys(A[W[0]]).length, diffs: diffs.length, exempel: diffs.slice(0, 12) };
}

// LÄCKAGEGRIND: värdsidan med namespacad d2 vs ren värd
const snap = () => {
  const PROPS = ['margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'maxWidth', 'textAlign', 'boxSizing', 'letterSpacing', 'listStyleType', 'outlineColor'];
  const res = {}; let i = 0;
  for (const el of document.querySelectorAll('body, body *')) {
    if (el.closest('.block') || el.closest('.av-block') || el.closest('.ampy-avdrag') || el.closest('.wf-label') || el.tagName === 'STYLE' || el.id === 'brxe-INJ') continue;
    const cs = getComputedStyle(el);
    res[(el.tagName + '#' + (el.id || '') + '.' + (typeof el.className === 'string' ? el.className : '')).slice(0, 90) + '@' + (i++)] = PROPS.map(p => cs[p]).join('|');
  }
  return res;
};
async function blast(fa, fb, w) {
  const pa = await b.newPage({ viewport: { width: w, height: 900 } }); await pa.goto(u(fa)); await pa.waitForTimeout(400);
  const A = await pa.evaluate(snap); await pa.close();
  const pb = await b.newPage({ viewport: { width: w, height: 900 } }); await pb.goto(u(fb)); await pb.waitForTimeout(400);
  const B = await pb.evaluate(snap); await pb.close();
  const st = k => k.replace(/@\d+$/, '');
  const ma = {}, mb = {};
  for (const k in A) (ma[st(k)] ||= []).push(A[k]);
  for (const k in B) (mb[st(k)] ||= []).push(B[k]);
  let ch = 0, tot = 0, ex = [];
  for (const k in ma) { if (!mb[k]) continue; const n = Math.min(ma[k].length, mb[k].length); for (let i = 0; i < n; i++) { tot++; if (ma[k][i] !== mb[k][i]) { ch++; if (ex.length < 8) ex.push(k + ' :: ' + ma[k][i] + ' -> ' + mb[k][i]); } } }
  return { tot, ch, ex };
}
out.leak = {
  fore1440: await blast('host-clean.html', 'host-d2-kvittot-forst.html', 1440),
  efter1440: await blast('host-clean.html', 'hostns-d2-kvittot-forst.html', 1440),
  efter390: await blast('host-clean.html', 'hostns-d2-kvittot-forst.html', 390)
};

// PRODUKTIONSGEOMETRI efter namespace (samma som före?)
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(u('hostns-d2-kvittot-forst.html')); await p.waitForTimeout(700);
  out.nsProd = {};
  for (const w of [390, 1024, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(120);
    out.nsProd[w] = await p.evaluate(() => {
      const q = s => document.querySelector(s);
      const bl = q('.av-block').getBoundingClientRect();
      const pa = q('.av-panel'), cs = getComputedStyle(pa);
      return {
        blockW: +bl.width.toFixed(1), blockH: +bl.height.toFixed(1),
        leftW: +q('.av-left').getBoundingClientRect().width.toFixed(1),
        panelW: +pa.getBoundingClientRect().width.toFixed(1),
        panelInner: +(pa.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(2),
        fontFace: [...document.fonts].filter(f => /Avdrag/.test(f.family)).map(f => f.family + ' ' + f.status),
        scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth
      };
    });
  }
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
