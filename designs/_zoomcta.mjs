import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b = await chromium.launch();
for (const [f,w,name] of [['d2-kvittot-forst',320,'d2-320'],['gt-generisk',320,'gtg-320'],['hemforsakring',320,'hf-320'],['hemforsakring',360,'hf-360'],['d2-kvittot-forst',375,'d2-375'],['d2-kvittot-forst',360,'d2-360']]) {
  const p = await b.newPage({ viewport:{width:w,height:900}, deviceScaleFactor:3 });
  await p.goto(pathToFileURL(resolve(f+'.html')).href);
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(250);
  await p.evaluate(()=>document.querySelector('.cta').scrollIntoView({block:'center'}));
  await p.waitForTimeout(150);
  const box = await p.evaluate(()=>{ const c=document.querySelector('.cta').getBoundingClientRect(); return {x:0,y:Math.max(0,c.top-26),width:document.documentElement.clientWidth,height:c.height+52}; });
  await p.screenshot({ path:'screens/resp/zoom-'+name+'-cta.png', clip:box });
  await p.close();
}
await b.close(); console.log('ok');
