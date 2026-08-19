// _s3spill.mjs — 1px-svep 320-1440 + 4px 1440-2560: spiller accenten ut ur H2-boxen
// eller ur vänsterspalten? (AUDIT P1-3). Kör mot BÅDA harnessen och båda tillstånden.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const argv=process.argv.slice(2);
const TAG=(argv.find(s=>s.startsWith('--tag='))||'--tag=efter').split('=')[1];
const DIR=(argv.find(s=>s.startsWith('--dir=')));
const S='/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const FILES=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const W=[]; for(let w=320;w<=1440;w++)W.push(w); for(let w=1444;w<=2560;w+=4)W.push(w);
const M=()=>{const h2=document.querySelector('.ampy-avdrag h2'),a=document.querySelector('.av-accent'),
  l=document.querySelector('.av-left'),b=document.querySelector('.av-block');
  if(!a)return null; const ar=a.getBoundingClientRect();
  return [+(ar.right-h2.getBoundingClientRect().right).toFixed(2),
          +(ar.right-l.getBoundingClientRect().right).toFixed(2),
          +(ar.right-b.getBoundingClientRect().right).toFixed(2)];};
const br=await chromium.launch();
for(const f of FILES){
  for(const [h,url] of [['preview',pathToFileURL(resolve((DIR?DIR.split('=')[1]+'/':'')+f+'.html')).href],
                        ['produktion',pathToFileURL(S+'s3'+TAG+'-'+f+'.html').href]]){
    const p=await br.newPage({viewport:{width:1440,height:900}});
    await p.goto(url,{waitUntil:'load'});
    await p.waitForFunction(()=>document.fonts.status==='loaded',null,{timeout:20000});
    await p.waitForTimeout(500);
    let h2max=[-1e9,0],lmax=[-1e9,0],bmax=[-1e9,0];
    for(const w of W){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(12);
      const r=await p.evaluate(M); if(!r)continue;
      if(r[0]>h2max[0])h2max=[r[0],w]; if(r[1]>lmax[0])lmax=[r[1],w]; if(r[2]>bmax[0])bmax=[r[2],w];}
    console.log(`${h.padEnd(11)}${f.padEnd(20)} max(accent-H2)=${h2max[0].toFixed(2)}@${h2max[1]}  max(accent-vänsterspalt)=${lmax[0].toFixed(2)}@${lmax[1]}  max(accent-block)=${bmax[0].toFixed(2)}@${bmax[1]}`);
    await p.close();
  }
}
await br.close();
