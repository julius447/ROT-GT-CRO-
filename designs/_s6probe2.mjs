// Bevisar (eller falsifierar) att "overlappet" ar en matartefakt:
// Range.getClientRects() ger FONTBOXEN (ascent+descent), inte radhojden.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1080,height:900}});
await p.goto(pathToFileURL(resolve('gt-produkt.html')).href,{waitUntil:'load'});
await p.waitForFunction(()=>document.fonts.status==='loaded');
await p.waitForTimeout(400);
const r = await p.evaluate(()=>{
  const h2=document.querySelector('.av-h2'), cs=getComputedStyle(h2);
  const cv=document.createElement('canvas').getContext('2d');
  cv.font = cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+'/'+cs.lineHeight+' '+cs.fontFamily;
  const m=cv.measureText('Subtech Go');
  const out={fontSize:cs.fontSize, lineHeight:cs.lineHeight, font:cv.font,
    fontBoxAsc:+m.fontBoundingBoxAscent.toFixed(2), fontBoxDesc:+m.fontBoundingBoxDescent.toFixed(2),
    fontBoxH:+(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent).toFixed(2),
    glyphAsc:+m.actualBoundingBoxAscent.toFixed(2), glyphDesc:+m.actualBoundingBoxDescent.toFixed(2),
    rader:[]};
  // varje textnods radrects
  const w=document.createTreeWalker(h2,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){
    if(!n.textContent.trim()) continue;
    const rg=document.createRange(); rg.selectNodeContents(n);
    for(const rr of rg.getClientRects()){
      if(rr.width<0.5) continue;
      out.rader.push({txt:n.textContent.trim().slice(0,22), top:+rr.top.toFixed(2), bottom:+rr.bottom.toFixed(2), h:+rr.height.toFixed(2)});
    }
  }
  return out;
});
console.log(JSON.stringify(r,null,1));
const rr=r.rader.sort((a,b)=>a.top-b.top);
console.log('\n  radhojd (line-height) :', r.lineHeight);
console.log('  Range-rect hojd       :', rr[0]?.h, ' (= fontBox', r.fontBoxH, ')');
console.log('  glyfband (verkligt)   : asc', r.glyphAsc, 'desc', r.glyphDesc, '=', (r.glyphAsc+r.glyphDesc).toFixed(2),'px');
for(let i=0;i<rr.length-1;i++){
  const ov=rr[i].bottom-rr[i+1].top;
  if(ov>0) console.log(`  Range-overlapp rad${i+1}/rad${i+2}: ${ov.toFixed(2)} px  ("${rr[i].txt}" / "${rr[i+1].txt}")`);
}
await b.close();
