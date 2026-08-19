import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:320,height:900}});
await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href,{waitUntil:'load'});
await p.waitForFunction(()=>document.fonts.status==='loaded');
await p.waitForTimeout(400);
console.log(' bredd  pW    fs     maxW      leftW   blkPadL  fineW  fineMax  medelTknBredd  tkn/rad(beraknad)');
for (const w of [320,344,375,390,430,480,600,768,1024,1440,1512,1920,2560]) {
  await p.setViewportSize({width:w,height:900});
  await p.waitForTimeout(120);
  const r = await p.evaluate(()=>{
    const el=document.querySelector('.av-step p'), cs=getComputedStyle(el);
    const left=document.querySelector('.av-left');
    const fine=document.querySelector('.av-fine'), fcs=getComputedStyle(fine);
    const blk=document.querySelector('.av-block');
    // medelteckenbredd = blackbredden pa den langsta raden / antal tecken pa den
    const cv=document.createElement('canvas').getContext('2d');
    cv.font = cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
    const mw = cv.measureText('abcdefghijklmnopqrstuvwxyzåäö ').width/30;
    return {pW:+el.getBoundingClientRect().width.toFixed(1), fs:cs.fontSize, maxW:cs.maxWidth,
            leftW:+left.getBoundingClientRect().width.toFixed(1),
            blkPadL:getComputedStyle(blk).paddingLeft,
            fineW:+fine.getBoundingClientRect().width.toFixed(1), fineMax:fcs.maxWidth,
            mw:+mw.toFixed(2)};
  });
  console.log(String(w).padStart(6), String(r.pW).padStart(6), r.fs.padStart(7), r.maxW.padStart(9),
    String(r.leftW).padStart(8), r.blkPadL.padStart(8), String(r.fineW).padStart(7), r.fineMax.padStart(8),
    String(r.mw).padStart(14), String((r.pW/r.mw).toFixed(0)).padStart(10));
}
await b.close();
