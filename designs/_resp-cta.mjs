import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const FILES=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const b=await chromium.launch();
const probe=()=>{
  const c=document.querySelector('.cta'); const R=c.getBoundingClientRect();
  const cs=getComputedStyle(c);
  const padL=parseFloat(cs.paddingLeft),padR=parseFloat(cs.paddingRight);
  let minL=1e9,maxR=-1e9,items=[];
  const w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){ if(!n.textContent.trim())continue; const rg=document.createRange(); rg.selectNodeContents(n);
    for(const q of rg.getClientRects()){minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);items.push(['text',+q.left.toFixed(1),+q.right.toFixed(1)]);} }
  for(const el of c.children){const q=el.getBoundingClientRect();minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);items.push([el.tagName,+q.left.toFixed(1),+q.right.toFixed(1)]);}
  return {
    ctaL:+R.left.toFixed(1), ctaR:+R.right.toFixed(1), ctaW:+R.width.toFixed(1),
    inkL:+minL.toFixed(1), inkR:+maxR.toFixed(1), inkW:+(maxR-minL).toFixed(1),
    utanforVanster:+(R.left-minL).toFixed(1), utanforHoger:+(maxR-R.right).toFixed(1),
    inomPaddingV:+(minL-(R.left+padL)).toFixed(1), inomPaddingH:+((R.right-padR)-maxR).toFixed(1),
    items
  };
};
const FIX=`@media (max-width:430px){.cta{width:100%;padding:11px 14px;gap:10px;white-space:normal;line-height:1.25;text-align:center;}}`;
for(const fix of [false,true]){
  console.log(fix?'\n===== EFTER FIX =====':'===== FÖRE (nuvarande kod): bläckets kanter vs knappens border-box =====');
  for(const w of [320,344,346,360,375,390]){
    for(const f of FILES){
      const p=await b.newPage({viewport:{width:w,height:900}});
      await p.goto(pathToFileURL(resolve(f+'.html')).href);
      if(fix) await p.addStyleTag({content:FIX});
      await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(60);
      const r=await p.evaluate(probe); await p.close();
      const bad=r.utanforVanster>0.3||r.utanforHoger>0.3;
      const tight=!bad&&(r.inomPaddingV<4||r.inomPaddingH<4);
      console.log(`${String(w).padEnd(5)}${f.padEnd(18)} knapp ${r.ctaW}px  bläck ${r.inkW}px  utanför V${r.utanforVanster} H${r.utanforHoger}  luft-i-padding V${r.inomPaddingV} H${r.inomPaddingH} ${bad?'<<< BLÄCK UTANFÖR KNAPPEN':tight?'<< padding uppäten':''}`);
    }
  }
}
await b.close();
