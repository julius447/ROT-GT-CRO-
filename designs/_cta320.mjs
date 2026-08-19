import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b=await chromium.launch();
for(const [f,tag] of [['d2-kvittot-forst','D2'],['gt-generisk','GTG'],['gt-produkt','GTP'],['hemforsakring','HF']]){
  const p=await b.newPage({viewport:{width:320,height:900},deviceScaleFactor:2});
  await p.goto(pathToFileURL(resolve(f+'.html')).href); await p.waitForTimeout(400);
  const el = await p.$('.cta');
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(200);
  const bb = await el.boundingBox();
  const clip = {x: Math.max(0,bb.x-24), y: Math.max(0,bb.y-18), width: Math.min(320, bb.width+70), height: bb.height+36};
  await p.screenshot({path:`/tmp/cta320-${tag}.png`, clip});
  console.log(tag, JSON.stringify(bb));
  await p.close();
}
await b.close();
