// _s3legacy.mjs — hur renderar blocket i en motor UTAN container queries
// (Safari <=15.x): cqi = okand enhet, @container-at-reglerna slukas, @supports-grenen kor.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const argv=process.argv.slice(2);
const D=(argv.find(s=>s.startsWith('--dir='))||'--dir=.').split('=')[1];
const F=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const N={'d2-kvittot-forst':'d2','gt-produkt':'gtp','gt-generisk':'gtg','hemforsakring':'hf'};
const M=()=>{const q=s=>document.querySelector(s);const b=q('.av-block'),g=q('.av-grid'),l=q('.av-left'),p=q('.av-panel');
 const cb=getComputedStyle(b),cg=getComputedStyle(g),cp=getComputedStyle(p);
 return {padL:+parseFloat(cb.paddingLeft).toFixed(2),padT:+parseFloat(cb.paddingTop).toFixed(2),
  cols:cg.gridTemplateColumns,gap:+parseFloat(cg.columnGap||0).toFixed(2),
  left:+l.getBoundingClientRect().width.toFixed(2),panel:+p.getBoundingClientRect().width.toFixed(2),
  inner:+(p.clientWidth-parseFloat(cp.paddingLeft)-parseFloat(cp.paddingRight)).toFixed(2),
  row:getComputedStyle(q('.av-r-row')).display,
  ov:document.documentElement.scrollWidth>document.documentElement.clientWidth+0.5};};
const br=await chromium.launch();
for(const f of F){
 const p=await br.newPage({viewport:{width:1440,height:900}});
 await p.goto(pathToFileURL(resolve(D,f+'.html')).href,{waitUntil:'load'});
 await p.waitForTimeout(600);
 const out=[];
 for(const w of [320,390,768,1000,1024,1180,1280,1440,1920]){
  await p.setViewportSize({width:w,height:900});await p.waitForTimeout(90);
  const r=await p.evaluate(M);
  out.push(`${String(w).padStart(5)} padL=${String(r.padL).padStart(6)} left=${String(r.left).padStart(7)} panel=${String(r.panel).padStart(7)} inner=${String(r.inner).padStart(6)} rad=${r.row.padEnd(4)}${r.ov?'  OVERFLOW!':''}`);
 }
 console.log('-- '+N[f]); for(const o of out) console.log('   '+o);
 await p.close();
}
await br.close();
