// _s3edge.mjs — extra bevisbilder på 430/431-gränsen (P0-1:s ytterkant).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
const argv=process.argv.slice(2);
const TAG=(argv.find(s=>s.startsWith('--tag='))||'--tag=efter').split('=')[1];
const S='/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const DIR=resolve('screens/steg3/'+TAG); mkdirSync(DIR,{recursive:true});
const b=await chromium.launch();
for(const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']){
 const p=await b.newPage({viewport:{width:430,height:900}});
 await p.goto(pathToFileURL(S+'s3'+TAG+'-'+f+'.html').href,{waitUntil:'load'});
 await p.waitForFunction(()=>document.fonts.status==='loaded',null,{timeout:20000});
 await p.waitForTimeout(500);
 for(const w of [430,431]){
  await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(180);
  const c=await p.evaluate(()=>{const e=document.querySelector('.av-cta');e.scrollIntoView({block:'center'});
    const r=e.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height};});
  await p.screenshot({path:`${DIR}/ctaz-${f}-${w}.png`,fullPage:true,
    clip:{x:Math.max(0,c.x-24),y:Math.max(0,c.y-24),width:Math.min(c.w+48,w),height:c.h+48}});
 }
 await p.close();
}
await b.close(); console.log('gränsbilder klara');
