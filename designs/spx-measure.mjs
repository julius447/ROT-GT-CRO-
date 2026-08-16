// SPACING-EXPERT slutpanel: mät alla avstånd i alla fyra blocken, desktop+mobil.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst.html', 'gt-produkt.html', 'gt-generisk.html', 'hemforsakring.html'];
const vps = [[1440,1000],[1280,900],[1120,900],[768,900],[390,844],[320,700]];
const browser = await chromium.launch();
const page = await browser.newPage();

const out = {};
for (const f of files) {
  out[f] = {};
  for (const [w,h] of vps) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(250);
    out[f][w] = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const qa = s => [...document.querySelectorAll(s)];
      const r = el => { if(!el) return null; const b = el.getBoundingClientRect(); return {t:+b.top.toFixed(1),b:+b.bottom.toFixed(1),l:+b.left.toFixed(1),rt:+b.right.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}; };
      const cs = el => getComputedStyle(el);
      const block = q('.block'), grid = q('.grid'), left = q('.left'), panel = q('.panel');
      const h2 = q('h2'), steps = qa('.step'), lastP = q('.step:last-child p');
      const pcap = q('.p-cap'), rows = qa('.r-row'), rtotal = q('.r-total'),
            tamt = q('.r-total .amt'), tnote = q('.r-total .t-note'), fine = q('.fine'),
            ctaw = q('.cta-wrap'), cta = q('.cta'), tel = q('.tel, .sec-link'), telA = q('.tel a, .sec-link a');
      const bcs = cs(block);
      const stepGaps = [];
      for (let i=1;i<steps.length;i++) stepGaps.push(+(steps[i].getBoundingClientRect().top - steps[i-1].getBoundingClientRect().bottom).toFixed(1));
      const stacked = getComputedStyle(grid).gridTemplateColumns.split(' ').length === 1;
      return {
        stacked,
        block: r(block),
        blockPad: { t: bcs.paddingTop, b: bcs.paddingBottom, l: bcs.paddingLeft, r: bcs.paddingRight },
        bodyPad: { t: cs(document.body).paddingTop, b: cs(document.body).paddingBottom, x: cs(document.body).paddingLeft },
        gridGap: cs(grid).columnGap + ' / ' + cs(grid).rowGap,
        h2: r(h2), h2fs: cs(h2).fontSize, h2mb: cs(h2).marginBottom,
        h2ToStep1: +(steps[0].getBoundingClientRect().top - h2.getBoundingClientRect().bottom).toFixed(1),
        stepGaps,
        leftBottomDead: +((block.getBoundingClientRect().bottom - parseFloat(bcs.paddingBottom)) - left.getBoundingClientRect().bottom).toFixed(1),
        panel: r(panel),
        panelVsLeftH: +((panel.getBoundingClientRect().height) - left.getBoundingClientRect().height).toFixed(1),
        panelPad: { t: cs(panel).paddingTop, b: cs(panel).paddingBottom, x: cs(panel).paddingLeft },
        rowHeights: rows.map(x=>+x.getBoundingClientRect().height.toFixed(1)),
        rtotalH: r(rtotal)?.h, rtotalMT: rtotal?cs(rtotal).marginTop:null, rtotalPad: rtotal?cs(rtotal).paddingTop+' '+cs(rtotal).paddingLeft:null,
        tamtFS: tamt?cs(tamt).fontSize:null,
        fineMT: fine?cs(fine).marginTop:null,
        fineToCtaw: fine&&ctaw ? +(ctaw.getBoundingClientRect().top - fine.getBoundingClientRect().bottom).toFixed(1) : null,
        ctawPT: ctaw?cs(ctaw).paddingTop:null,
        ctaH: r(cta)?.h, ctaW: r(cta)?.w,
        ctaToTel: tel ? +(tel.getBoundingClientRect().top - cta.getBoundingClientRect().bottom).toFixed(1) : null,
        telToPanelBottom: tel ? +(panel.getBoundingClientRect().bottom - tel.getBoundingClientRect().bottom).toFixed(1) : null,
        telAH: r(telA)?.h,
        telVisualGap: telA ? +(panel.getBoundingClientRect().bottom - telA.getBoundingClientRect().bottom).toFixed(1) : null,
        // visuell textbotten: sista textnodens rad
        h2TopVsPanelTop: +(h2.getBoundingClientRect().top - panel.getBoundingClientRect().top).toFixed(1),
        blockAspect: +( (block.getBoundingClientRect().width) / (block.getBoundingClientRect().height) ).toFixed(2),
        docH: document.documentElement.scrollHeight,
      };
    });
  }
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
