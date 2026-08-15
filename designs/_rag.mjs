import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const b = await chromium.launch();
for (const f of ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html']) {
 for (const w of [390,360,320]) {
  const p = await b.newPage({ viewport:{width:w,height:900} });
  await p.goto(pathToFileURL(resolve(f)).href); await p.waitForTimeout(400);
  const r = await p.evaluate(()=>{
    const h2=document.querySelector('h2');
    const meas=(mode)=>{
      h2.style.textWrap=mode;
      const rg=document.createRange(); rg.selectNodeContents(h2);
      const box=h2.getBoundingClientRect();
      const lines=[...rg.getClientRects()].filter(r=>r.width>1);
      // group rects into lines by top
      const map=new Map();
      for(const r of lines){const k=Math.round(r.top);const v=map.get(k)||{l:1e9,r:-1e9};v.l=Math.min(v.l,r.left);v.r=Math.max(v.r,r.right);map.set(k,v);}
      return [...map.values()].map(v=>+(v.r-v.l).toFixed(0));
    };
    const bal=meas('balance'); const norm=meas('wrap'); const pretty=meas('pretty');
    h2.style.textWrap='';
    const avail=+h2.getBoundingClientRect().width.toFixed(0);
    const sd=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return +Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length).toFixed(1)};
    return {avail, balance:bal, sdBal:sd(bal), normal:norm, sdNorm:sd(norm), pretty, sdPretty:sd(pretty)};
  });
  console.log(`${f.padEnd(24)} @${w} avail=${r.avail} | balance ${JSON.stringify(r.balance)} sd=${r.sdBal} | wrap ${JSON.stringify(r.normal)} sd=${r.sdNorm}`);
  await p.close();
 }
}
await b.close();
