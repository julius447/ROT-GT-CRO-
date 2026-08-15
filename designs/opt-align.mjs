import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const files = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const b = await chromium.launch();
for (const w of [1440,1120,1000,768,390,360,320]) {
  console.log('\n#### ' + w);
  for (const f of files) {
    const page = await b.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const cv = document.createElement('canvas').getContext('2d');
      const cs = e => getComputedStyle(e);
      const ink = (text, font) => { cv.font = font; const m = cv.measureText(text); return { asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent }; };
      const out = [];
      for (const s of document.querySelectorAll('.step')) {
        const n = s.querySelector('.n'), h3 = s.querySelector('h3');
        const nr = n.getBoundingClientRect(), hr = h3.getBoundingClientRect();
        const ns = cs(n), hs = cs(h3);
        const nFont = `${ns.fontWeight} ${ns.fontSize} ${ns.fontFamily}`;
        const hFont = `${hs.fontWeight} ${hs.fontSize} ${hs.fontFamily}`;
        // digit ink centre inside circle: circle is grid place-items center -> line box centred
        const nlh = parseFloat(ns.lineHeight) || parseFloat(ns.fontSize)*1.5;
        const nInk = ink(n.textContent.trim(), nFont);
        // line box top inside circle
        const nLineTop = nr.y + (nr.height - nlh)/2;
        // baseline ~ lineTop + (lh - (ascFont+descFont))/2 + ascFont ; use font metrics
        cv.font = nFont; const nfm = cv.measureText('Hg');
        const fAsc = nfm.fontBoundingBoxAscent, fDesc = nfm.fontBoundingBoxDescent;
        const nBaseline = nLineTop + (nlh - (fAsc+fDesc))/2 + fAsc;
        const digitInkMid = nBaseline - (nInk.asc - nInk.desc)/2;
        const circleMid = nr.y + nr.height/2;
        // h3 first line cap mid
        const hlh = parseFloat(hs.lineHeight);
        cv.font = hFont; const hfm = cv.measureText('Hg');
        const hBaseline = hr.y + (hlh - (hfm.fontBoundingBoxAscent+hfm.fontBoundingBoxDescent))/2 + hfm.fontBoundingBoxAscent;
        const capH = cv.measureText('H').actualBoundingBoxAscent;
        const xh = cv.measureText('x').actualBoundingBoxAscent;
        const h3CapMid = hBaseline - capH/2;
        const h3XMid = hBaseline - xh/2;
        const h3LineMid = hr.y + hlh/2;
        out.push({
          h3: h3.textContent.slice(0,22),
          circleMid:+circleMid.toFixed(2),
          digitInkOffsetInCircle: +(digitInkMid - circleMid).toFixed(2),
          vs_lineMid: +(circleMid - h3LineMid).toFixed(2),
          vs_capMid: +(circleMid - h3CapMid).toFixed(2),
          vs_xMid: +(circleMid - h3XMid).toFixed(2),
          h3lines: h3.getClientRects().length
        });
      }
      return out;
    });
    console.log(' ' + f.padEnd(24) + r.map(x=>`[${x.h3.slice(0,10)}… lines=${x.h3lines} digitOff=${x.digitInkOffsetInCircle} vsLine=${x.vs_lineMid} vsCap=${x.vs_capMid} vsX=${x.vs_xMid}]`).join(' '));
    await page.close();
  }
}
await b.close();
