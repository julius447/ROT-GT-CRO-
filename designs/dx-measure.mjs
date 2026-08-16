// Desktop-expert measurements at 1280/1440/1600/1920
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const files = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const browser = await chromium.launch();
for (const w of [1280, 1440, 1600, 1920]) {
  console.log(`\n======== ${w}px ========`);
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const r = s => { const e = q(s); return e ? e.getBoundingClientRect() : null; };
      const left = r('.left'), panel = r('.panel'), block = r('.block'), grid = r('.grid');
      const lastStep = [...document.querySelectorAll('.step')].pop().getBoundingClientRect();
      const h2 = q('h2'); const h2r = h2.getBoundingClientRect();
      const h2lines = Math.round(h2r.height / (parseFloat(getComputedStyle(h2).fontSize) * 1.2));
      const p1 = q('.step p'); const ps = getComputedStyle(p1);
      // measure widest rendered text line in first step p
      const range = document.createRange(); range.selectNodeContents(p1);
      const rects = [...range.getClientRects()];
      const maxLine = Math.max(...rects.map(x => x.width));
      const tot = q('.r-total .amt');
      const cta = r('.cta');
      return {
        blockW: Math.round(block.width), leftW: Math.round(left.width), panelW: Math.round(panel.width),
        gap: Math.round(panel.left - left.right),
        leftBottom: Math.round(lastStep.bottom), panelBottom: Math.round(panel.bottom),
        deltaBottoms: Math.round(panel.bottom - lastStep.bottom),
        blockBottom: Math.round(block.bottom),
        h2lines, h2W: Math.round(h2r.width),
        pFS: ps.fontSize, pMaxLinePx: Math.round(maxLine),
        pMaxLineCh: Math.round(maxLine / (parseFloat(ps.fontSize) * 0.52)),
        totFS: tot ? getComputedStyle(tot).fontSize : null,
        ctaW: cta ? Math.round(cta.width) : null,
        panelShare: (panel.width / grid.width * 100).toFixed(1) + '%'
      };
    });
    console.log(f.padEnd(24), JSON.stringify(m));
    await page.close();
  }
}
await browser.close();
