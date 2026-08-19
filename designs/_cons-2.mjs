// KONSOLIDERING pass 2 — produktionsharness (riktig ampy.se-CSS + riktig Bricks-body).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const u = (f) => pathToFileURL(S + f).href;
const b = await chromium.launch();
const out = {};

// ---------- probe: mät värdsidans EGNA element + vårt block
const probe = () => {
  const g = (sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect(), o = {};
    for (const p of props) o[p] = cs[p];
    o._box = [+r.width.toFixed(2), +r.height.toFixed(2), +r.x.toFixed(2)];
    return o;
  };
  return {
    body: g('body', ['fontFamily', 'backgroundColor', 'color', 'lineHeight', 'padding', 'fontWeight', 'fontSize', 'boxSizing']),
    heroH2: g('h2.hero_2__section-heading', ['fontSize', 'fontWeight', 'lineHeight', 'maxWidth', 'textAlign', 'marginBottom', 'fontFamily']),
    rotH2: g('h2.rot__main-heading', ['fontSize', 'fontWeight', 'maxWidth', 'textAlign', 'marginBottom']),
    h3: g('h3.rot__heading', ['fontSize', 'lineHeight', 'marginBottom']),
    btn: g('.brxe-button, .bricks-button', ['padding', 'borderRadius', 'boxSizing']),
    li: g('#brx-content li', ['marginBottom', 'paddingLeft']),
    p: g('#brx-content p', ['marginBottom', 'lineHeight', 'fontFamily']),
    container: g('#brx-content .brxe-container', ['width', 'maxWidth', 'paddingLeft']),
    docH: +document.documentElement.scrollHeight,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    // vårt block
    block: g('.block', ['width', 'padding', 'borderRadius']),
    left: g('.left', ['width']),
    panel: g('.panel', ['width', 'paddingLeft']),
    panelInner: (() => {
      const p = document.querySelector('.panel'); if (!p) return null;
      const cs = getComputedStyle(p);
      return +(p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(2);
    })(),
    rowMode: document.querySelector('.r-row') ? getComputedStyle(document.querySelector('.r-row')).display : null,
    blockH: document.querySelector('.block') ? +document.querySelector('.block').getBoundingClientRect().height.toFixed(1) : null,
    ctaGap: (() => {
      const cta = document.querySelector('.cta'); if (!cta) return null;
      const cb = cta.getBoundingClientRect(); let minL = Infinity, maxR = -Infinity;
      const wlk = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT); let n;
      while ((n = wlk.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const rr of r.getClientRects()) { minL = Math.min(minL, rr.left); maxR = Math.max(maxR, rr.right); } }
      return [+(minL - cb.left).toFixed(2), +(cb.right - maxR).toFixed(2)];
    })(),
    fontFaces: [...document.fonts].filter(f => /Outfit/.test(f.family)).map(f => f.family + ' ' + f.weight + ' ' + f.status).slice(0, 12),
    h2Weight: (() => { const h = document.querySelector('.block h2'); return h ? getComputedStyle(h).fontWeight + '/' + getComputedStyle(h).fontSize : null; })(),
    dupIds: (() => { const c = {}; document.querySelectorAll('[id]').forEach(e => c[e.id] = (c[e.id] || 0) + 1); return Object.entries(c).filter(([, v]) => v > 1).map(([k, v]) => k + '×' + v); })()
  };
};

async function measure(file, widths = [1440, 390]) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(u(file));
  await page.waitForTimeout(500);
  const r = {};
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(150);
    r[w] = await page.evaluate(probe);
  }
  await page.close();
  return r;
}

out.clean = await measure('host-clean.html');
out.d2 = await measure('host-d2-kvittot-forst.html');
out.gtp = await measure('host-gt-produkt.html');
out.hf = await measure('host-hemforsakring.html');
out.d2_div = await measure('host-d2-div.html');
out.d2_lazy = await measure('host-d2-lazy.html');
out.two = await measure('host-two.html', [1440]);

// bred-svep i produktion (Bricks-container klämmer)
{
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(u('host-d2-kvittot-forst.html'));
  await page.waitForTimeout(400);
  out.wide = {};
  for (const w of [1280, 1366, 1412, 1440, 1600, 1920, 2560, 1024, 834, 768, 744]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(120);
    out.wide[w] = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const p = q('.panel'), cs = p && getComputedStyle(p);
      return {
        blockW: +q('.block').getBoundingClientRect().width.toFixed(1),
        leftW: +q('.left').getBoundingClientRect().width.toFixed(1),
        panelW: +p.getBoundingClientRect().width.toFixed(1),
        panelInner: +(p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(2),
        rowMode: getComputedStyle(q('.r-row')).display,
        padX: getComputedStyle(q('.block')).paddingLeft,
        gap: getComputedStyle(q('.grid')).columnGap,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
  }
  await page.close();
}

await b.close();
console.log(JSON.stringify(out, null, 1));
