// Family parity audit — measures every shared-base key value in all four blocks.
// usage: node _parity-audit.mjs [width ...]
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FILES = ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const SHORT = { 'd2-kvittot-forst':'D2', 'gt-produkt':'GTP', 'gt-generisk':'GTG', 'hemforsakring':'HF' };
const WIDTHS = process.argv.slice(2).map(Number).filter(Boolean);
const widths = WIDTHS.length ? WIDTHS : [1440, 390];

const probe = () => {
  const r = (n) => Math.round(n * 100) / 100;
  const g = (el, ...props) => { const cs = getComputedStyle(el); return props.map(p => cs[p]).join(' / '); };
  const rect = (el) => { const b = el.getBoundingClientRect(); return `${r(b.width)}x${r(b.height)}`; };
  const q = (s) => document.querySelector(s);
  const out = {};

  const h2 = q('h2');
  out['H2 size/weight/lh'] = g(h2, 'fontSize', 'fontWeight', 'lineHeight');
  out['H2 ls/maxw/align'] = g(h2, 'letterSpacing', 'maxWidth', 'textAlign');
  out['H2 margin-bottom'] = g(h2, 'marginBottom');
  out['H2 box'] = rect(h2);
  const acc = q('h2 .accent');
  out['H2 accent w/ws/deco'] = g(acc, 'fontWeight', 'whiteSpace', 'textDecorationThickness');

  const sc = q('.steps-cap');
  out['steps-cap size/weight/ls'] = g(sc, 'fontSize', 'fontWeight', 'letterSpacing');
  out['steps-cap margin-bottom'] = g(sc, 'marginBottom');
  out['steps-cap color'] = g(sc, 'color');

  const h3 = q('.step h3');
  out['H3 size/weight/lh'] = g(h3, 'fontSize', 'fontWeight', 'lineHeight');
  const sp = q('.step p');
  out['body size/weight/lh'] = g(sp, 'fontSize', 'fontWeight', 'lineHeight');
  out['body color'] = g(sp, 'color');

  const steps = q('.steps');
  out['steps gap'] = g(steps, 'rowGap');
  const stepEls = [...document.querySelectorAll('.step')];
  out['step gap measured'] = stepEls.length > 1
    ? r(stepEls[1].getBoundingClientRect().top - stepEls[0].getBoundingClientRect().bottom) : 'n/a';
  const n = q('.step .n');
  out['icon size'] = rect(n);
  out['icon margin-top'] = g(n, 'marginTop');
  out['step column-gap'] = g(q('.step'), 'columnGap');
  // connector line
  const st = q('.step:not(:last-child)');
  const cs2 = getComputedStyle(st, '::before');
  out['connector'] = cs2.borderLeftWidth + ' ' + cs2.borderLeftColor;

  const panel = q('.panel');
  out['panel box'] = rect(panel);
  out['panel padding'] = g(panel, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft');
  out['panel radius'] = g(panel, 'borderRadius');
  out['panel bg'] = g(panel, 'backgroundColor');

  const pcap = q('.p-cap');
  out['p-cap size/weight/ls'] = g(pcap, 'fontSize', 'fontWeight', 'letterSpacing');
  out['p-cap pad-bottom'] = g(pcap, 'paddingBottom');

  const rows = [...document.querySelectorAll('.r-row')];
  out['r-row count'] = rows.length;
  out['r-row heights'] = rows.map(x => r(x.getBoundingClientRect().height)).join(', ');
  out['r-row font-size'] = g(rows[0], 'fontSize');
  out['r-row padding'] = g(rows[0], 'paddingTop', 'paddingBottom');
  const pill = q('.offert-pill');
  out['pill size/weight/pad'] = pill ? g(pill, 'fontSize', 'fontWeight', 'padding') : '(ingen pill)';
  out['pill box'] = pill ? rect(pill) : 'n/a';
  const ded = q('.r-row.deduct .amt');
  out['deduct chip'] = ded ? g(ded, 'fontSize', 'fontWeight', 'backgroundColor', 'padding') : '(ingen deduct)';

  const tot = q('.r-total');
  out['r-total box'] = rect(tot);
  out['r-total padding'] = g(tot, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft');
  out['r-total margin'] = g(tot, 'marginTop', 'marginRight', 'marginLeft');
  out['r-total bg/radius'] = g(tot, 'backgroundColor', 'borderRadius');
  out['r-total gap'] = g(tot, 'rowGap', 'columnGap');
  const tl = q('.r-total .t-label'), ta = q('.r-total .amt'), tn = q('.r-total .t-note');
  out['t-label size/weight/ls'] = g(tl, 'fontSize', 'fontWeight', 'letterSpacing');
  out['BELOPP size/weight/ls/lh'] = g(ta, 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight');
  out['t-note'] = tn ? g(tn, 'fontSize', 'fontWeight', 'lineHeight') + ' | display=' + getComputedStyle(tn).display : '(ingen t-note)';
  out['t-note height'] = tn ? r(tn.getBoundingClientRect().height) : 'n/a';

  const fine = q('.fine');
  out['fine size/weight/lh/mt'] = g(fine, 'fontSize', 'fontWeight', 'lineHeight', 'marginTop');
  out['fine height'] = r(fine.getBoundingClientRect().height);

  const cw = q('.cta-wrap');
  out['cta-wrap pt/flex'] = g(cw, 'paddingTop', 'flexGrow', 'flexShrink', 'flexBasis');
  const before = getComputedStyle(cw, '::before');
  out['divider h/bg/mb'] = before.height + ' ' + before.backgroundColor + ' ' + before.marginBottom;
  const cta = q('.cta');
  out['CTA box'] = rect(cta);
  out['CTA padding'] = g(cta, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft');
  out['CTA min-h/radius/gap'] = g(cta, 'minHeight', 'borderRadius', 'gap');
  out['CTA font'] = g(cta, 'fontSize', 'fontWeight');
  out['CTA bg'] = getComputedStyle(cta).backgroundImage.slice(0, 70);
  const ring = q('.cta-ring');
  out['CTA ring'] = ring ? rect(ring) + ' pad=' + g(ring, 'padding') + ' shadow=' + getComputedStyle(ring).boxShadow.slice(0, 40) : '(ingen ring)';

  // waves
  for (const c of ['hero-w1', 'hero-w2', 'hero-w3']) {
    const el = q('.' + c);
    if (!el) { out['wave ' + c] = '(saknas)'; continue; }
    const b = el.getBoundingClientRect(), bb = q('.block').getBoundingClientRect();
    out['wave ' + c] = `${r(b.width)}x${r(b.height)} @ dx=${r(b.left - bb.left)} dy=${r(b.top - bb.top)} maxw=${getComputedStyle(el).maxWidth}`;
  }
  for (const c of ['blob-a', 'blob-b', 'blob-c']) {
    const el = q('.' + c);
    if (!el) { out['blob ' + c] = '(saknas)'; continue; }
    const b = el.getBoundingClientRect(), pb = q('.panel').getBoundingClientRect();
    out['blob ' + c] = `${r(b.width)}x${r(b.height)} @ dx=${r(b.left - pb.left)} dy=${r(b.top - pb.top)}`;
  }

  const block = q('.block');
  out['block box'] = rect(block);
  out['block padding'] = g(block, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft');
  out['block radius'] = g(block, 'borderRadius');
  const grid = q('.grid');
  out['grid cols'] = g(grid, 'gridTemplateColumns');
  out['grid gap'] = g(grid, 'columnGap', 'rowGap');
  out['grid align'] = g(grid, 'alignItems');
  out['grid maxw'] = g(grid, 'maxWidth');
  out['doc scrollW/clientW'] = document.documentElement.scrollWidth + ' / ' + document.documentElement.clientWidth;
  out['TOTAL block height'] = r(block.getBoundingClientRect().height);
  return out;
};

const b = await chromium.launch();
const results = {};
for (const w of widths) {
  results[w] = {};
  for (const f of FILES) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(resolve(f + '.html')).href);
    await p.waitForTimeout(350);
    results[w][f] = await p.evaluate(probe);
    await p.close();
  }
}
await b.close();

for (const w of widths) {
  console.log('\n############ VIEWPORT ' + w + 'px ############');
  const keys = Object.keys(results[w][FILES[0]]);
  const allKeys = new Set(keys);
  for (const f of FILES) Object.keys(results[w][f]).forEach(k => allKeys.add(k));
  for (const k of allKeys) {
    const vals = FILES.map(f => String(results[w][f][k]));
    const uniq = new Set(vals);
    const flag = uniq.size === 1 ? '   ' : '≠≠≠';
    if (uniq.size === 1) {
      console.log(`${flag} ${k.padEnd(28)} | ALLA: ${vals[0]}`);
    } else {
      console.log(`${flag} ${k.padEnd(28)} |`);
      FILES.forEach((f, i) => console.log(`        ${SHORT[f].padEnd(4)} ${vals[i]}`));
    }
  }
}
