import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const b = await chromium.launch();
for (const w of [1440,390]) {
  const p = await b.newPage({ viewport:{width:w,height:900} });
  await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href); await p.waitForTimeout(500);
  const r = await p.evaluate(()=>{
    const cv=document.createElement('canvas'); const cx=cv.getContext('2d');
    const s=document.querySelector('.step'); const n=s.querySelector('.n'), h3=s.querySelector('h3');
    const cs=getComputedStyle(h3); cx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const H=cx.measureText('H'), x=cx.measureText('x');
    const capH=H.actualBoundingBoxAscent, xH=x.actualBoundingBoxAscent;
    const m=cx.measureText('Hx');
    const lh=parseFloat(cs.lineHeight), fs=parseFloat(cs.fontSize);
    const halfLead=(lh-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent))/2;
    const range=document.createRange(); range.selectNodeContents(h3);
    const line=[...range.getClientRects()][0];
    const baseline=line.top+halfLead+m.fontBoundingBoxAscent;
    const nb=n.getBoundingClientRect(); const nMid=nb.top+nb.height/2;
    return { fs, lh, capH:+capH.toFixed(2), xH:+xH.toFixed(2),
      lineBoxMid:+((line.top+line.bottom)/2).toFixed(2),
      capMid:+(baseline-capH/2).toFixed(2),
      xMid:+(baseline-xH/2).toFixed(2),
      nMid:+nMid.toFixed(2),
      d_capMid:+(nMid-(baseline-capH/2)).toFixed(2),
      d_lineBox:+(nMid-(line.top+line.bottom)/2).toFixed(2),
      capMid_minus_lineBoxMid:+((baseline-capH/2)-(line.top+line.bottom)/2).toFixed(2),
    };
  });
  console.log(`@${w}`, JSON.stringify(r,null,1));
  await p.close();
}
await b.close();
