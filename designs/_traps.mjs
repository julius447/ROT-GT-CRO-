import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import fs from 'fs';
const b=await chromium.launch();

console.log('===== TRAP A: dubbletten av .block--wave gör att en redigering av FÖRSTA kopian är verkningslös =====');
for(const f of ['gt-produkt','gt-generisk','hemforsakring']){
  const src=fs.readFileSync(f+'.html','utf8');
  // edit ONLY the first .hero-w1 rule (Chris's likely target: first hit in the file)
  let done=false;
  const patched=src.replace(/\.block--wave \.hero-w1 \{ top: 0; left: 0; max-width: 65%; z-index: 0; \}/g,(m)=>{
    if(done) return m; done=true; return '.block--wave .hero-w1 { top: 0; left: 0; max-width: 20%; z-index: 0; }';
  });
  fs.writeFileSync('_trapA_'+f+'.html',patched);
  for(const [tag,file] of [['ORIGINAL',f+'.html'],['redigerad 65%→20% i FÖRSTA kopian','_trapA_'+f+'.html']]){
    const p=await b.newPage({viewport:{width:1440,height:900}});
    await p.goto(pathToFileURL(resolve(file)).href); await p.waitForTimeout(200);
    const v=await p.evaluate(()=>{const e=document.querySelector('.hero-w1');
      return getComputedStyle(e).maxWidth+' → renderad bredd '+Math.round(e.getBoundingClientRect().width)+'px';});
    console.log('  '+f.padEnd(15)+tag.padEnd(36)+v);
    await p.close();
  }
}
fs.readdirSync('.').filter(x=>x.startsWith('_trapA_')).forEach(x=>fs.unlinkSync(x));

console.log('\n===== TRAP B: tema-/plugin-CSS träffar blockets namnrymdslösa klasser =====');
const pick=f=>{const s=fs.readFileSync(f,'utf8');
  return {css:s.match(/<style>([\s\S]*?)<\/style>/)[1], body:s.match(/<body>([\s\S]*?)<\/body>/)[1]};};
const A=pick('d2-kvittot-forst.html');
const themeAfter=`
/* CSS som laddas EFTER snippeten (Bricks global CSS / plugin / child-theme) */
.grid{display:flex !important;flex-wrap:wrap;gap:12px}
.panel{background:#fff !important;border:1px solid #ddd !important;box-shadow:none !important;padding:16px !important}
.block{border-radius:0 !important;box-shadow:none !important}
.left{float:left;width:50%}
.cta{background:#f60 !important;color:#fff !important;border-radius:4px !important}
.step{display:list-item !important}
.amt{font-size:12px !important}
.fine{display:none !important}
`;
const page=`<!DOCTYPE html><html lang="sv-SE"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${A.css}</style><style>${themeAfter}</style></head><body>${A.body}</body></html>`;
fs.writeFileSync('_trapB.html',page);
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto(pathToFileURL(resolve('_trapB.html')).href); await p.waitForTimeout(400);
const v=await p.evaluate(()=>{
  const g=getComputedStyle(document.querySelector('.grid'));
  const pa=getComputedStyle(document.querySelector('.panel'));
  const c=getComputedStyle(document.querySelector('.cta'));
  const fi=getComputedStyle(document.querySelector('.fine'));
  return {grid:g.display, panelBg:pa.backgroundColor, panelShadow:pa.boxShadow.slice(0,12),
    ctaBg:c.backgroundColor+' / img='+c.backgroundImage.slice(0,20), fine:fi.display,
    blockH:Math.round(document.querySelector('.block').getBoundingClientRect().height)};
});
console.log('  '+JSON.stringify(v,null,2).split('\n').join('\n  '));
await p.screenshot({path:'/tmp/trapB.png',fullPage:false});
await p.close(); await b.close();
