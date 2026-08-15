// SLUTVERIFIERING runda 2 — allt som svepet mätte, mätt om efter fixarna.
// node _final.mjs
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const FILES = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const ALL = [...FILES, 'ab-mobil.html'];
const b = await chromium.launch();

// ---------- 1. OVERFLOW + CTA-tryckyta, hela breddbandet ----------
console.log('===== 1. OVERFLOW / CTA-BOUNDS =====');
const widths = [320, 345, 390, 768, 1024, 1440];
for (const f of ALL) {
  const out = [];
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(resolve(f)).href);
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const d = document.documentElement;
      const over = [];
      document.querySelectorAll('*').forEach(e => {
        const bb = e.getBoundingClientRect();
        if (bb.width && bb.right > d.clientWidth + 0.5) over.push(e.className || e.tagName);
      });
      const ctas = [...document.querySelectorAll('.cta')].map(c => {
        const bb = c.getBoundingClientRect();
        return { h: +bb.height.toFixed(1), inner: c.scrollWidth > Math.ceil(bb.width) };
      });
      return { hscroll: d.scrollWidth - d.clientWidth, over: [...new Set(over)], ctas };
    });
    const badCta = r.ctas.filter(c => c.h < 44 || c.inner);
    out.push(`@${w}: hscroll=${r.hscroll} over=${r.over.length ? JSON.stringify(r.over) : '0'} ctaMinH=${Math.min(...r.ctas.map(c=>c.h))} ctaTextOverflow=${badCta.length}`);
    await p.close();
  }
  console.log(`\n-- ${f}\n   ` + out.join('\n   '));
}

// ---------- 2. TYPOGRAFISK BASPARITET (alla fyra måste vara identiska) ----------
console.log('\n===== 2. TYPOGRAFISK BASPARITET =====');
for (const vw of [1440, 390]) {
  const rows = {};
  for (const f of FILES) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 } });
    await p.goto(pathToFileURL(resolve(f)).href);
    await p.waitForTimeout(300);
    rows[f] = await p.evaluate(() => {
      const g = (sel, ...props) => {
        const e = document.querySelector(sel); if (!e) return 'saknas';
        const cs = getComputedStyle(e); return props.map(x => cs[x]).join('/');
      };
      const n = document.querySelector('.step .n').getBoundingClientRect();
      return {
        h2: g('h2','fontSize','fontWeight','lineHeight','marginBottom'),
        accent: g('h2 .accent','fontWeight','color','whiteSpace'),
        h3: g('.step h3','fontSize','fontWeight','lineHeight'),
        p: g('.step p','fontSize','fontWeight','lineHeight'),
        n: `${+n.width.toFixed(1)}/${getComputedStyle(document.querySelector('.step .n')).marginTop}`,
        total: g('.r-total .amt','fontSize','fontWeight'),
        note: g('.r-total .t-note','fontSize','fontWeight'),
        fine: g('.fine','fontSize','fontWeight'),
        pill: g('.offert-pill','fontSize','fontWeight','borderRadius'),
        cta: g('.cta','fontSize','fontWeight','paddingLeft','minHeight'),
      };
    });
    await p.close();
  }
  const keys = Object.keys(rows[FILES[0]]);
  let diffs = 0;
  for (const k of keys) {
    const vals = FILES.map(f => rows[f][k]);
    const same = vals.every(v => v === vals[0]);
    if (!same) { diffs++; console.log(`  @${vw} AVVIKELSE ${k}: ${FILES.map((f,i)=>f.split('.')[0]+'='+vals[i]).join(' | ')}`); }
  }
  console.log(`  @${vw} ${diffs === 0 ? 'IDENTISK i alla fyra' : diffs + ' avvikelser'} — ` +
    Object.entries(rows[FILES[0]]).map(([k,v])=>`${k}:${v}`).join('  '));
}

// ---------- 3. OPTISK LINJERING (versalbandsmitt, alla fyra, båda lägen) ----------
console.log('\n===== 3. OPTISK LINJERING (cirkelmitt − versalbandsmitt) =====');
for (const f of FILES) {
  const o = [];
  for (const vw of [1440, 1120, 768, 390, 320]) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 } });
    await p.goto(pathToFileURL(resolve(f)).href);
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const cv = document.createElement('canvas'), cx = cv.getContext('2d');
      return [...document.querySelectorAll('.step')].map(s => {
        const n = s.querySelector('.n'), h3 = s.querySelector('h3');
        const cs = getComputedStyle(h3);
        cx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const capH = cx.measureText('H').actualBoundingBoxAscent;
        const m = cx.measureText('Hx');
        const lh = parseFloat(cs.lineHeight);
        const halfLead = (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
        const rg = document.createRange(); rg.selectNodeContents(h3);
        const line = [...rg.getClientRects()][0];
        const baseline = line.top + halfLead + m.fontBoundingBoxAscent;
        const nb = n.getBoundingClientRect();
        return +((nb.top + nb.height / 2) - (baseline - capH / 2)).toFixed(2);
      });
    });
    o.push(`@${vw} [${r.join(', ')}]`);
    await p.close();
  }
  console.log(`  ${f.split('.')[0].padEnd(18)} ${o.join('  ')}`);
}

// ---------- 4. CANDOUR: em-dash, kanon-siffror, villkorstext, ordbudget ----------
console.log('\n===== 4. CANDOUR / ORDEKONOMI =====');
const wc = s => (s || '').trim().split(/\s+/).filter(Boolean).length;
let base = null;
for (const f of ALL) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(resolve(f)).href);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const t = document.body.innerText;
    const blk = document.querySelector('.block') || document.body;
    const txt = blk.innerText;
    const note = document.querySelector('.r-total .t-note');
    const fine = document.querySelector('.fine');
    const hits = (s, re) => (s.match(re) || []).length;
    return {
      emdash: hits(t, /—/g),
      taket: hits(txt, /50\s?000\s?kr/g),
      pct30: hits(txt, /30\s?%/g), pct50: hits(txt, /50\s?%/g), pct70: hits(txt, /70\s?%/g),
      note: note ? note.innerText : null,
      fine: fine ? fine.innerText : null,
      superl: /marknadens|bäst i|ledande|garanterat/i.test(txt),
    };
  });
  if (f === 'd2-kvittot-forst.html') base = r;
  const nw = wc(r.note), fw = wc(r.fine);
  console.log(`  ${f.split('.')[0].padEnd(18)} em-dash=${r.emdash} tak50k=${r.taket} 30%=${r.pct30} 50%=${r.pct50} 70%=${r.pct70}` +
    (r.note !== null ? `  t-note=${nw}w (${Math.round(nw/wc(base.note)*100)}%)  fine=${fw}w (${Math.round(fw/wc(base.fine)*100)}%)` : '') +
    `  superlativ=${r.superl}`);
  await p.close();
}

await b.close();
