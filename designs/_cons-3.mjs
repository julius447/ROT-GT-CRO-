// KONSOLIDERING pass 3 — font-A/B i produktion, läckage-blastradie, overflow-jämförelse, CTA i produktion.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = f => pathToFileURL(S + f).href;
const local = f => pathToFileURL(resolve(f)).href;
const b = await chromium.launch();
const out = {};

const typo = () => {
  const q = s => document.querySelector(s);
  const w = el => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return [+b.width.toFixed(2), +b.height.toFixed(2)]; };
  const h2 = q('.block h2'), acc = q('.block h2 .accent'), sp = q('.step p'), amt = q('.r-total .amt');
  return {
    h2: w(h2), h2fw: getComputedStyle(h2).fontWeight, h2fs: getComputedStyle(h2).fontSize,
    accent: acc ? w(acc) : null, accFw: acc ? getComputedStyle(acc).fontWeight : null,
    stepP: w(sp), amt: amt ? w(amt) : null,
    blockH: +q('.block').getBoundingClientRect().height.toFixed(2),
    fontsUsed: (() => { const r = []; for (const f of document.fonts) r.push(f.family + '|' + f.weight + '|' + f.status); return r.filter(x => /Outfit/i.test(x)); })()
  };
};

// ---- A. FONT A/B: lokal preview (godkänt facit) vs produktion-404 vs föreslagen fix
out.font = {};
for (const f of ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring']) {
  const rec = out.font[f] = {};
  for (const [tag, url] of [['preview(godkant)', local(f + '.html')], ['prod404', u('font404-' + f + '.html')], ['fix', u('fontfix-' + f + '.html')]]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url);
    await p.waitForTimeout(1400);
    rec[tag] = { 1440: await p.evaluate(typo) };
    await p.setViewportSize({ width: 390, height: 900 }); await p.waitForTimeout(300);
    rec[tag][390] = await p.evaluate(typo);
    await p.setViewportSize({ width: 320, height: 900 }); await p.waitForTimeout(300);
    rec[tag][320] = await p.evaluate(typo);
    await p.close();
  }
}

// ---- B. blastradie: full computed-diff av VÄRDENS element (utanför blocket)
const snap = () => {
  const PROPS = ['margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'maxWidth', 'textAlign', 'boxSizing', 'letterSpacing', 'listStyleType', 'outlineColor'];
  const res = {};
  const all = document.querySelectorAll('body, body *');
  let i = 0;
  for (const el of all) {
    if (el.closest('.block') || el.closest('.wf-label') || el.tagName === 'STYLE' || el.id === 'brxe-INJ') continue;
    const cs = getComputedStyle(el);
    const key = (el.tagName + '#' + (el.id || '') + '.' + (typeof el.className === 'string' ? el.className : '')).slice(0, 90) + '@' + (i++);
    res[key] = PROPS.map(p => cs[p]).join('|');
  }
  return res;
};
async function blast(fileA, fileB, w) {
  const pa = await b.newPage({ viewport: { width: w, height: 900 } });
  await pa.goto(u(fileA)); await pa.waitForTimeout(400);
  const A = await pa.evaluate(snap); await pa.close();
  const pb = await b.newPage({ viewport: { width: w, height: 900 } });
  await pb.goto(u(fileB)); await pb.waitForTimeout(400);
  const B = await pb.evaluate(snap); await pb.close();
  // A och B har olika index-svansar; matcha på nyckel utan @index när möjligt
  const strip = k => k.replace(/@\d+$/, '');
  const mapA = {}; for (const k in A) (mapA[strip(k)] ||= []).push(A[k]);
  const mapB = {}; for (const k in B) (mapB[strip(k)] ||= []).push(B[k]);
  let changed = 0, total = 0; const ex = [];
  const PROPS = ['margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'maxWidth', 'textAlign', 'boxSizing', 'letterSpacing', 'listStyleType', 'outlineColor'];
  const propHits = {};
  for (const k in mapA) {
    if (!mapB[k]) continue;
    const n = Math.min(mapA[k].length, mapB[k].length);
    for (let i = 0; i < n; i++) {
      total++;
      if (mapA[k][i] !== mapB[k][i]) {
        changed++;
        const av = mapA[k][i].split('|'), bv = mapB[k][i].split('|');
        for (let j = 0; j < PROPS.length; j++) if (av[j] !== bv[j]) propHits[PROPS[j]] = (propHits[PROPS[j]] || 0) + 1;
        if (ex.length < 14) ex.push(k + ' :: ' + PROPS.filter((p, j) => av[j] !== bv[j]).map((p, ) => p).join(',') + ' :: ' + av.filter((x, j) => x !== bv[j]).join(' ') + ' -> ' + bv.filter((x, j) => x !== av[j]).join(' '));
      }
    }
  }
  return { total, changed, propHits, ex };
}
out.blast1440 = await blast('host-clean.html', 'host-d2-kvittot-forst.html', 1440);
out.blast390 = await blast('host-clean.html', 'host-d2-kvittot-forst.html', 390);

// ---- C. overflow: ren värd vs värd+block, per bredd
out.overflow = {};
{
  const pa = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await pa.goto(u('host-clean.html')); await pa.waitForTimeout(400);
  const pb = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await pb.goto(u('host-d2-kvittot-forst.html')); await pb.waitForTimeout(400);
  for (const w of [320, 360, 390, 430, 744, 768, 810, 834, 1024, 1112, 1180, 1280, 1440, 1600, 1920, 2560]) {
    await pa.setViewportSize({ width: w, height: 900 }); await pb.setViewportSize({ width: w, height: 900 });
    await pa.waitForTimeout(90); await pb.waitForTimeout(90);
    const f = p => p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    out.overflow[w] = { clean: await f(pa), block: await f(pb) };
  }
  await pa.close(); await pb.close();
}

// ---- D. CTA-bläck i PRODUKTION 320..430
out.ctaProd = {};
for (const f of ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring']) {
  const p = await b.newPage({ viewport: { width: 320, height: 900 } });
  await p.goto(u('font404-' + f + '.html')); await p.waitForTimeout(500);
  const r = {};
  for (const w of [320, 344, 360, 375, 390, 412, 430]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(90);
    r[w] = await p.evaluate(() => {
      const cta = document.querySelector('.cta'); const cb = cta.getBoundingClientRect();
      let minL = Infinity, maxR = -Infinity;
      const wk = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT); let n;
      while ((n = wk.nextNode())) { if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const rr of rg.getClientRects()) { minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); } }
      for (const el of cta.querySelectorAll('svg')) { const rr = el.getBoundingClientRect(); minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); }
      return [+(minL - cb.left).toFixed(2), +(cb.right - maxR).toFixed(2), +cb.width.toFixed(1)];
    });
  }
  out.ctaProd[f] = r;
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
