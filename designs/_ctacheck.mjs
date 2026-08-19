import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const FILES=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const b=await chromium.launch();
console.log('W    file  ctaW  ctaScrollW  overflowPx  panelClip?  textW  ws');
for(const w of [320,344,345,346,360,375,390,412,430,480,481,600,744,768]){
  for(const f of FILES){
    const p=await b.newPage({viewport:{width:w,height:900}});
    await p.goto(pathToFileURL(resolve(f+'.html')).href); await p.waitForTimeout(120);
    const m=await p.evaluate(()=>{
      const c=document.querySelector('.cta');
      const cr=c.getBoundingClientRect();
      const pr=document.querySelector('.panel').getBoundingClientRect();
      // measure natural text width
      const range=document.createRange(); range.selectNodeContents(c);
      const rects=[...range.getClientRects()];
      const maxRight=Math.max(...rects.map(r=>r.right));
      const minLeft=Math.min(...rects.map(r=>r.left));
      return {ctaW:+cr.width.toFixed(2), sw:c.scrollWidth, cw:c.clientWidth,
        contentRight:+maxRight.toFixed(2), ctaRight:+cr.right.toFixed(2),
        panelRight:+pr.right.toFixed(2), ws:getComputedStyle(c).whiteSpace,
        contentW:+(maxRight-minLeft).toFixed(2)};
    });
    const ovf=+(m.contentRight-(m.ctaRight- parseFloat(0))).toFixed(2);
    const clip=+(m.contentRight-m.panelRight).toFixed(2);
    console.log(String(w).padEnd(5)+f.slice(0,5).padEnd(6)+String(m.ctaW).padEnd(8)+String(m.sw).padEnd(6)+String(m.sw-m.cw).padEnd(6)+' contentRight-ctaRight='+String(ovf).padEnd(8)+' contentRight-panelRight='+String(clip).padEnd(8)+' contentW='+m.contentW+' ws='+m.ws);
    await p.close();
  }
  console.log('');
}
await b.close();
