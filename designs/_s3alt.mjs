import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const S='/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const F=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const N={'d2-kvittot-forst':'d2','gt-produkt':'gtp','gt-generisk':'gtg','hemforsakring':'hf'};
const M=()=>{const c=document.querySelector('.av-cta'),b=c.getBoundingClientRect();
 let l=Infinity,r=-Infinity;const t={};const w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(!n.textContent.trim())continue;const g=document.createRange();g.selectNodeContents(n);
  for(const rr of g.getClientRects()){if(!rr.width&&!rr.height)continue;l=Math.min(l,rr.left);r=Math.max(r,rr.right);t[Math.round(rr.top*2)/2]=1;}}
 for(const e of c.querySelectorAll('svg')){const rr=e.getBoundingClientRect();l=Math.min(l,rr.left);r=Math.max(r,rr.right);}
 return [+(l-b.left).toFixed(2),+(b.right-r).toFixed(2),+b.width.toFixed(2),+b.height.toFixed(1),Object.keys(t).length];};
const br=await chromium.launch();
const WS=[320,344,360,375,390,412,425,428,429,430,431,432,435,440];
for(const tag of ['efter','altC']){
 console.log(`\n=== ${tag==='efter'?'PUNCHLISTANS FIX (width:100%)':'ALTERNATIV C (width:auto + max-width:100%)'} — produktion`);
 console.log('  fil   ' + WS.map(w=>String(w).padStart(9)).join(''));
 for(const f of F){
  const p=await br.newPage({viewport:{width:430,height:900}});
  await p.goto(pathToFileURL(S+'s3'+tag+'-'+f+'.html').href,{waitUntil:'load'});
  await p.waitForFunction(()=>document.fonts.status==='loaded',null,{timeout:20000});
  await p.waitForTimeout(500);
  const dl=[],bw=[];
  for(const w of WS){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(90);
   const r=await p.evaluate(M); dl.push(Math.min(r[0],r[1])); bw.push(r[2]);}
  console.log(`  ${N[f].padEnd(5)} ` + dl.map(v=>v.toFixed(1).padStart(9)).join('') + '   <- min bläckmarginal');
  console.log(`  ${''.padEnd(5)} ` + bw.map(v=>v.toFixed(0).padStart(9)).join('') + '   <- knappbredd');
  await p.close();
 }
}
await br.close();
