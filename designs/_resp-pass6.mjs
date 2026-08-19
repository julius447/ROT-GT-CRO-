import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b=await chromium.launch();
const at=async(f,w,fn,css)=>{const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(pathToFileURL(resolve(f+'.html')).href); if(css) await p.addStyleTag({content:css});
  await p.evaluate(()=>document.fonts.ready); const r=await p.evaluate(fn); await p.close(); return r;};
const LC=(sel)=>{const out=[];for(const el of document.querySelectorAll(sel)){
  const wk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;const byTop=new Map();
  while((n=wk.nextNode())){const t=n.textContent;if(!t.trim())continue;const rg=document.createRange();
    for(let i=0;i<t.length;i++){rg.setStart(n,i);rg.setEnd(n,i+1);const q=rg.getClientRects()[0];if(!q)continue;
      const k=Math.round(q.top);let kk=null;for(const key of byTop.keys())if(Math.abs(key-k)<=3)kk=key;
      if(kk===null){kk=k;byTop.set(kk,0);}byTop.set(kk,byTop.get(kk)+1);}}
  out.push(Array.from(byTop.entries()).sort((a,c)=>a[0]-c[0]).map(([,v])=>v));}
  return out;};
const lineChars=(sel)=>new Function('return ('+LC.toString()+')('+JSON.stringify(sel)+')');

console.log('===== 1. .step p: tecken per rad @1920 — nuvarande 65ch vs kandidatvärden =====');
for (const mw of [null,'58ch','56ch','640px']) {
  const css = mw? `.step p{max-width:${mw}}` : null;
  const r = await at('d2-kvittot-forst',1920,lineChars('.step p'),css);
  const w = await at('d2-kvittot-forst',1920,()=>+document.querySelector('.step p').getBoundingClientRect().width.toFixed(1),css);
  console.log(' max-width:'+(mw||'65ch (nuvarande)').padEnd(18)+'bredd '+String(w).padEnd(7)+'rader/tecken: '+JSON.stringify(r)+'  max='+Math.max(...r.flat()));
}
console.log('\n  gt-produkt/gt-generisk/hemforsakring @1920 (nuvarande):');
for (const f of ['gt-produkt','gt-generisk','hemforsakring'])
  console.log('   '+f.padEnd(18)+JSON.stringify(await at(f,1920,lineChars('.step p')))+'  max='+Math.max(...(await at(f,1920,lineChars('.step p'))).flat()));

console.log('\n===== 2. .fine: tecken per rad i det staplade bandet =====');
for (const w of [744,768,834,900,901,1000]) {
  const row=[];
  for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
    const r=await at(f,w,lineChars('.fine'));
    row.push(f.slice(0,4)+':'+Math.max(...r.flat()));
  }
  console.log(' @'+String(w).padEnd(6)+'max tecken/rad  '+row.join('  '));
}

console.log('\n===== 3. CTA @320-375: bläckets överskott per fil (sammanfattning) =====');
const ink=()=>{const c=document.querySelector('.cta'),R=c.getBoundingClientRect(),cs=getComputedStyle(c);
  let minL=1e9,maxR=-1e9;const wk=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
  while((n=wk.nextNode())){if(!n.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);
    for(const q of rg.getClientRects()){minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}}
  for(const el of c.children){const q=el.getBoundingClientRect();minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}
  return {knapp:+R.width.toFixed(1),black:+(maxR-minL).toFixed(1),utanfor:+(R.left-minL).toFixed(1),
    kvarPadding:+(minL-(R.left+parseFloat(cs.paddingLeft))).toFixed(1)};};
for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
  const cells=[];
  for (const w of [320,344,360,375,390]) { const r=await at(f,w,ink);
    cells.push(`@${w}:${r.utanfor>0.3?'UT+'+r.utanfor:'pad'+r.kvarPadding}`); }
  console.log(' '+f.padEnd(18)+cells.join('  '));
}
console.log(' (UT+x = bläcket x px UTANFÖR knappens border-box · padN = N px kvar av deklarerad 24px sidopadding)');

console.log('\n===== 4. Container-query-tröskeln 400px: exakt flip + marginal i tvåspaltsbandet =====');
const cq=()=>{const p=document.querySelector('.panel'),cs=getComputedStyle(p);
  return {inner:+(p.getBoundingClientRect().width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2).toFixed(2),
    mode:getComputedStyle(document.querySelector('.r-row')).display};};
for (const w of [1340,1366,1390,1412,1413,1440]) console.log(' @'+String(w).padEnd(6)+JSON.stringify(await at('d2-kvittot-forst',w,cq)));
console.log(' Prov: +1px extra panel-padding (t.ex. tema som sätter padding) @1412:');
console.log('   '+JSON.stringify(await at('d2-kvittot-forst',1412,cq,'.panel{padding-left:32px!important;padding-right:32px!important}')));
await b.close();
