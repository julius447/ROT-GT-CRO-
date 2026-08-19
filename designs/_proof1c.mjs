import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import fs from 'fs';
const b=await chromium.launch();
const dupRe=/(h2 \.accent \{ white-space: normal; \}\n)[\s\S]*?(\.steps \{ --sgap: 28px; \})/;
for(const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']){
  const src=fs.readFileSync(f+'.html','utf8');
  fs.writeFileSync('_tmp_'+f+'.html', src.replace(dupRe,'$1$2'));
}
console.log('fil            variant  font          capMB  cap→steg  vänsterspalt  blockH');
for(const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']){
 for(const [tag,file] of [['ORIG',f+'.html'],['PATCH','_tmp_'+f+'.html']]){
  const p=await b.newPage({viewport:{width:390,height:900}});
  await p.goto(pathToFileURL(resolve(file)).href); await p.waitForTimeout(400);
  const v=await p.evaluate(async()=>{
    await document.fonts.ready;
    const r=n=>Math.round(n*100)/100;
    const sc=document.querySelector('.steps-cap'), st=document.querySelector('.steps');
    return {font:document.fonts.check('16px Outfit')?'Outfit OK':'FALLBACK',
      mb:getComputedStyle(sc).marginBottom,
      gap:r(st.getBoundingClientRect().top-sc.getBoundingClientRect().bottom),
      left:r(document.querySelector('.left').getBoundingClientRect().height),
      block:r(document.querySelector('.block').getBoundingClientRect().height)};
  });
  console.log(f.padEnd(15)+tag.padEnd(9)+v.font.padEnd(14)+v.mb.padEnd(7)+String(v.gap).padEnd(10)+String(v.left).padEnd(14)+v.block);
  await p.close();
 }
}
await b.close();
