import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import { readFileSync } from 'fs';
const FILES=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const b=await chromium.launch();

console.log('===== A. DUBBLETTREGLER i <style> =====');
for (const f of FILES) {
  const p=await b.newPage(); await p.goto(pathToFileURL(resolve(f+'.html')).href);
  const r=await p.evaluate(()=>{
    const flat=[]; const walk=(rs,ctx)=>{ for(const r of rs){ if(r.cssRules&&r.cssRules.length) walk(Array.from(r.cssRules), ctx+'@'+(r.conditionText||r.name||'')+' ');
      else if(r.selectorText) flat.push(ctx+'|'+r.selectorText); } };
    walk(Array.from(document.styleSheets[0].cssRules),'');
    const c={}; flat.forEach(k=>c[k]=(c[k]||0)+1);
    return Object.entries(c).filter(([,v])=>v>1);
  });
  console.log(' '+f); r.forEach(([s,n])=>console.log('    ×'+n+'  '+s)); if(!r.length) console.log('    (inga)');
  await p.close();
}

console.log('\n===== B. .steps-cap: vilken regel vinner på mobil =====');
for (const f of FILES) {
  const src=readFileSync(f+'.html','utf8').split('\n');
  const idx=src.map((l,i)=>[i+1,l]).filter(([,l])=>/\.steps-cap\s*\{|\.steps-cap\s*$/.test(l));
  console.log(' '+f+'  .steps-cap-regler på rad: '+idx.map(([n])=>n).join(', '));
}
const capAt=async(f,w)=>{const p=await b.newPage({viewport:{width:w,height:900}});await p.goto(pathToFileURL(resolve(f+'.html')).href);
  const r=await p.evaluate(()=>getComputedStyle(document.querySelector('.steps-cap')).marginBottom);await p.close();return r;};
for (const f of FILES) console.log(' '+f.padEnd(18)+' @390='+await capAt(f,390)+'  @1440='+await capAt(f,1440)+'   (avsikt mobil: 22px)');

console.log('\n===== C. FIX-BEVIS: .cta overflow före/efter (scrollWidth vs clientWidth + barnrekt) =====');
const CTAFIX=`@media (max-width:430px){.cta{width:100%;padding:11px 14px;gap:10px;white-space:normal;line-height:1.25;text-align:center;min-height:58px;}}`;
const probe=()=>{const c=document.querySelector('.cta');const r=c.getBoundingClientRect();
  let worst=0; for(const ch of c.childNodes){ if(ch.nodeType===1){const q=ch.getBoundingClientRect();worst=Math.max(worst,r.left-q.left,q.right-r.right);} 
    else if(ch.nodeType===3&&ch.textContent.trim()){const rg=document.createRange();rg.selectNode(ch);for(const q of rg.getClientRects())worst=Math.max(worst,r.left-q.left,q.right-r.right);} }
  return {w:+r.width.toFixed(1),h:+r.height.toFixed(1),scroll:c.scrollWidth,client:c.clientWidth,barnUtanfor:+worst.toFixed(1)};};
for (const fix of [false,true]) {
  console.log(fix?' EFTER FIX:':' FÖRE (nuvarande kod):');
  for (const w of [320,344,346,360,375,390,414,430]) {
    const out=[];
    for (const f of FILES){const p=await b.newPage({viewport:{width:w,height:900}});await p.goto(pathToFileURL(resolve(f+'.html')).href);
      if(fix) await p.addStyleTag({content:CTAFIX}); await p.evaluate(()=>document.fonts.ready);
      const r=await p.evaluate(probe);await p.close();
      out.push(`${f.slice(0,4)}:${r.barnUtanfor>0.5?'UTANFÖR+'+r.barnUtanfor:'ok'}(h${r.h})`);}
    console.log('  '+String(w).padEnd(5)+out.join('  '));
  }
}
await b.close();
