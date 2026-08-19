import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b=await chromium.launch();
const at=async(f,w,fn,css)=>{const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(pathToFileURL(resolve(f+'.html')).href); if(css) await p.addStyleTag({content:css});
  await p.evaluate(()=>document.fonts.ready); const r=await p.evaluate(fn); await p.close(); return r;};

console.log('===== 1. .step p max-width:65ch — vad blir 65ch i px, och hur många tecken ryms? =====');
for (const w of [1440,1600,1920,2560]) {
  const r=await at('d2-kvittot-forst',w,()=>{
    const p=document.querySelector('.step p'); const cs=getComputedStyle(p);
    const probe=document.createElement('span'); probe.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:'+cs.font;
    probe.textContent='0'.repeat(65); document.body.appendChild(probe);
    const ch65=probe.getBoundingClientRect().width; probe.remove();
    // faktisk radlängd
    const rg=document.createRange(); rg.selectNodeContents(p);
    const rects=rg.getClientRects(); const t=p.textContent;
    return {maxW:cs.maxWidth, faktiskBredd:+p.getBoundingClientRect().width.toFixed(1),
      ch65px:+ch65.toFixed(1), fs:cs.fontSize, rader:rects.length, tecken:t.length,
      snittPerRad:Math.round(t.length/rects.length)};
  });
  console.log(' @'+w, JSON.stringify(r));
}

console.log('\n===== 2. LATENT: .r-total full-bleed utan .panel--dark (overflow:hidden saknas) =====');
const bleed=()=>{const p=document.querySelector('.panel'),t=document.querySelector('.r-total');
  const P=p.getBoundingClientRect(),T=t.getBoundingClientRect();
  return {panelOverflow:getComputedStyle(p).overflow, radie:getComputedStyle(p).borderRadius,
    utanforV:+(P.left-T.left).toFixed(1), utanforH:+(T.right-P.right).toFixed(1)};};
for (const w of [390,1440]) {
  console.log(' @'+w+' med panel--dark: '+JSON.stringify(await at('d2-kvittot-forst',w,bleed)));
  console.log(' @'+w+' UTAN panel--dark (ljus panel, som CSS-kommentaren säger är default): '+
    JSON.stringify(await at('d2-kvittot-forst',w,bleed,'.panel--dark{background:#fff!important;overflow:visible!important}')));
}

console.log('\n===== 3. h2 .accent nowrap-band per fil (exakt) =====');
for (const f of ['gt-produkt','gt-generisk','d2-kvittot-forst','hemforsakring']) {
  const bad=[];
  for(let w=901;w<=1120;w++){const r=await at(f,w,()=>{const h=document.querySelector('h2'),a=h.querySelector('.accent');
    return {over:+(a.getBoundingClientRect().right-h.getBoundingClientRect().right).toFixed(1),
      accW:+a.getBoundingClientRect().width.toFixed(1), h2W:+h.getBoundingClientRect().width.toFixed(1)};});
    if(r.over>0.3) bad.push([w,r]);}
  console.log(' '+f.padEnd(18)+(bad.length?`överspill ${bad[0][0]}-${bad[bad.length-1][0]}px, accent ${bad[0][1].accW}px vs h2-box ${bad[0][1].h2W}px (max +${Math.max(...bad.map(x=>x[1].over))}px)`:'inget'));
}

console.log('\n===== 4. Kontrollprov: gäller CTA-defekten även med systemfont (Outfit ej laddad)? =====');
for (const w of [320,360,375,390]) {
  const r=await at('d2-kvittot-forst',w,()=>{const c=document.querySelector('.cta'),R=c.getBoundingClientRect();
    let minL=1e9,maxR=-1e9;const wk=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
    while((n=wk.nextNode())){if(!n.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);
      for(const q of rg.getClientRects()){minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}}
    for(const el of c.children){const q=el.getBoundingClientRect();minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}
    return {utanforV:+(R.left-minL).toFixed(1),utanforH:+(maxR-R.right).toFixed(1)};},
    '@font-face{font-family:"Outfit";src:local("__none__")}');
  console.log(' @'+w+' systemfont-fallback: '+JSON.stringify(r));
}
await b.close();
