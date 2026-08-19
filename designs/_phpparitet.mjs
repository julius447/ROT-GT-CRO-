// Bevisar att leveransfilerna renderar identiskt med de godkända designfilerna.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const DESIGN = resolve('.');
const LEV = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview/fran-php';
const PAR = [['d2-kvittot-forst','rot'],['gt-produkt','gt-produkt'],['gt-generisk','gt-generisk'],['hemforsakring','hemforsakring']];
const BREDDER = [320,360,375,390,430,480,600,744,768,834,1024,1180,1280,1440,1600,1920,2560];

const MET = () => {
  const q = s => document.querySelector(s);
  const r = e => { if(!e) return null; const b=e.getBoundingClientRect(); return [Math.round(b.width*100)/100, Math.round(b.height*100)/100]; };
  const cs = (s,p) => { const e=q(s); return e ? getComputedStyle(e)[p] : null; };
  return {
    block: r(q('.av-block')), grid: r(q('.av-grid')), left: r(q('.av-left')), panel: r(q('.av-panel')),
    h2: r(q('.av-h2')) , h2fs: cs('.av-h2','fontSize'), h2fw: cs('.av-h2','fontWeight'), h2lh: cs('.av-h2','lineHeight'),
    h3fs: cs('.av-step h3','fontSize'), pfs: cs('.av-step p','fontSize'),
    cap: cs('.av-steps-cap','fontSize'), capmb: cs('.av-steps-cap','marginBottom'),
    total: r(q('.av-r-total')), amt: cs('.av-r-total .av-amt','fontSize'),
    cta: r(q('.av-cta')), ctafs: cs('.av-cta','fontSize'),
    fine: cs('.av-fine','fontSize'), n: r(q('.av-step .av-n')),
    steps: cs('.av-steps','rowGap'), colw: cs('.av-grid','gridTemplateColumns'),
    ovf: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
};

const MET_FN = MET;

const stabil = async (page) => {
  await page.evaluate(async () => { await document.fonts.ready; });
  let f = null;
  for (let i = 0; i < 20; i++) {
    const n = await page.evaluate(MET_FN);
    if (f && JSON.stringify(f) === JSON.stringify(n)) return n;
    f = n; await page.waitForTimeout(120);
  }
  return f;
};

const b = await chromium.launch();
let avvik = 0, matningar = 0;
for (const [d, l] of PAR) {
  for (const w of BREDDER) {
    const p1 = await b.newPage({ viewport:{width:w,height:900} });
    await p1.goto(pathToFileURL(resolve(DESIGN, d + '.html')).href); const a = await stabil(p1); await p1.close();
    const p2 = await b.newPage({ viewport:{width:w,height:900} });
    await p2.goto(pathToFileURL(resolve(LEV, l + '.html')).href); const c = await stabil(p2); await p2.close();
    for (const k of Object.keys(a)) {
      matningar++;
      if (JSON.stringify(a[k]) !== JSON.stringify(c[k])) {
        avvik++; console.log(`AVVIKELSE ${l} @${w} ${k}: design=${JSON.stringify(a[k])} leverans=${JSON.stringify(c[k])}`);
      }
    }
  }
}
console.log(`\n${matningar} mätningar · ${avvik} avvikelser`);
await b.close();
