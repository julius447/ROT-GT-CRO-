import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const b = await chromium.launch();
for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
  const p = await b.newPage({ viewport:{width:1440,height:1400} });
  await p.goto(pathToFileURL(resolve(f+'.html')).href,{waitUntil:'load'});
  const r = await p.evaluate(()=>{const e=document.querySelector('.r-total .amt');const c=getComputedStyle(e);return {fs:c.fontSize,fw:c.fontWeight,txt:e.textContent.trim()};});
  console.log('  '+f.padEnd(22)+JSON.stringify(r));
  await p.close();
}
await b.close();
