import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import fs from 'fs';
const FILES=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const b=await chromium.launch();
console.log('=== Kommentarpåståenden mot uppmätt verklighet ===');
for(const w of [375,390,1280,1440]){
 for(const f of FILES){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(pathToFileURL(resolve(f+'.html')).href); await p.waitForTimeout(200);
  const v=await p.evaluate(()=>{ const r=n=>Math.round(n*100)/100;
   const h2=document.querySelector('h2'),h3=document.querySelector('.step h3'),n=document.querySelector('.step .n');
   const st=document.querySelector('.steps');
   const w1=document.querySelector('.hero-w1'),blk=document.querySelector('.block');
   const tn=document.querySelector('.r-total .t-note');
   return {h2fs:getComputedStyle(h2).fontSize, h2mb:getComputedStyle(h2).marginBottom,
     h3fs:getComputedStyle(h3).fontSize, sgap:getComputedStyle(st).rowGap,
     nsz:r(n.getBoundingClientRect().width), nfs:getComputedStyle(n).fontSize,
     nbg:getComputedStyle(n).backgroundColor+'/'+getComputedStyle(n).backgroundImage,
     w1gap:r(blk.getBoundingClientRect().bottom - w1.getBoundingClientRect().bottom),
     tnoteLines: tn? Math.round(tn.getBoundingClientRect().height/parseFloat(getComputedStyle(tn).lineHeight)) : 'n/a',
     panelDark: getComputedStyle(document.querySelector('.panel')).backgroundColor,
     nbUsed: !!document.querySelector('.nb')};
  });
  if(w===375||w===1280) console.log(`@${w} ${f.padEnd(17)} H2=${v.h2fs} H3=${v.h3fs}`);
  else console.log(`@${w} ${f.padEnd(17)} H2mb=${v.h2mb} sgap=${v.sgap} (kommentar: "64 mot 44")  cirkel=${v.nsz}px/${v.nfs} (kommentar: "32px/14px" på mobil)  bg=${v.nbg}  w1→botten=${v.w1gap}px (kommentar: "66px")  t-note rader=${v.tnoteLines}  panel-bg=${v.panelDark} (kommentar: "ENDAST ROT")  .nb används=${v.nbUsed}`);
  await p.close();
 }
 console.log('');
}
// t-note at 320
console.log('=== GTG t-note @320 (kommentar: "en rad håller @320 med marginal") ===');
for(const w of [320,345,390]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(pathToFileURL(resolve('gt-generisk.html')).href); await p.waitForTimeout(200);
  const v=await p.evaluate(()=>{const tn=document.querySelector('.r-total .t-note');
    return {h:Math.round(tn.getBoundingClientRect().height), lines:Math.round(tn.getBoundingClientRect().height/parseFloat(getComputedStyle(tn).lineHeight)), w:Math.round(tn.getBoundingClientRect().width)};});
  console.log(`  @${w}: ${v.lines} rad(er), h=${v.h}px, bredd=${v.w}px`);
  await p.close();
}
await b.close();
