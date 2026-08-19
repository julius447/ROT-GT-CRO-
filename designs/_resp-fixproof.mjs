import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const b=await chromium.launch();
const at=async(f,w,fn,css,wrap)=>{const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(pathToFileURL(resolve(f+'.html')).href); if(css) await p.addStyleTag({content:css});
  if(wrap) await p.evaluate(m=>{const c=document.createElement('div');c.className='brx-container';
    c.style.cssText='max-width:'+m+'px;margin:0 auto;padding:0 20px;box-sizing:border-box';
    document.body.style.paddingLeft='0';document.body.style.paddingRight='0';
    const bl=document.querySelector('.block');bl.parentNode.insertBefore(c,bl);c.appendChild(bl);},wrap);
  await p.evaluate(()=>document.fonts.ready); const r=await p.evaluate(fn); await p.close(); return r;};

// ---------- FIX 1: panelspåret slutar krocka med panel-paddingen ----------
console.log('===== FIX-BEVIS 1: .grid clamp-min 466→480px (panelens innerbredd vs 400px-tröskeln) =====');
const cq=()=>{const p=document.querySelector('.panel'),cs=getComputedStyle(p);
  return {inner:+(p.getBoundingClientRect().width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2).toFixed(2),
    mode:getComputedStyle(document.querySelector('.r-row')).display,
    left:+document.querySelector('.left').getBoundingClientRect().width.toFixed(1)};};
const FIX1=`@media(min-width:1121px){.grid{grid-template-columns:minmax(0,1fr) clamp(480px,33vw,530px)}}`;
let minA={inner:1e9},minB={inner:1e9};
for(let w=1121;w<=1700;w+=1){
  const a=await at('d2-kvittot-forst',w,cq); if(a.inner<minA.inner)minA={...a,w};
  if(w%17===0){const c=await at('d2-kvittot-forst',w,cq,FIX1); if(c.inner<minB.inner)minB={...c,w};}
}
for(const w of [1400,1412,1420]){const c=await at('d2-kvittot-forst',w,cq,FIX1); if(c.inner<minB.inner)minB={...c,w};}
console.log(' FÖRE: min inner='+minA.inner+' @'+minA.w+'px (marginal '+(minA.inner-400).toFixed(2)+'px), vänsterspalt '+minA.left);
console.log(' EFTER: min inner='+minB.inner+' @'+minB.w+'px (marginal '+(minB.inner-400).toFixed(2)+'px), vänsterspalt '+minB.left);
console.log(' Störningsprov @1412 (tema sätter .panel padding:32px):');
console.log('   FÖRE : '+JSON.stringify(await at('d2-kvittot-forst',1412,cq,'.panel{padding-left:32px!important;padding-right:32px!important}')));
console.log('   EFTER: '+JSON.stringify(await at('d2-kvittot-forst',1412,cq,FIX1+'.panel{padding-left:32px!important;padding-right:32px!important}')));

// ---------- FIX 2: container-queries istället för vw/viewport-media ----------
console.log('\n===== FIX-BEVIS 2: .block som container (cqi + @container) i en Bricks-container =====');
const FIX2=`
.block{container-type:inline-size;container-name:rotblk;}
.block .grid{grid-template-columns:minmax(0,1fr) clamp(466px,33cqi,530px);gap:clamp(48px,5.5cqi,96px);}
.block{padding:clamp(44px,5.4cqi,100px) clamp(24px,4.4cqi,80px);}
@container rotblk (max-width:1064px){.block .grid{grid-template-columns:minmax(0,1fr) clamp(456px,42cqi,500px);gap:44px}}
@container rotblk (max-width:944px){.block .grid{grid-template-columns:1fr;gap:56px;max-width:700px;margin-inline:auto}}
@container rotblk (max-width:880px){.block .grid{gap:56px;max-width:640px}}
`;
const probe=()=>{const q=s=>document.querySelector(s),R=e=>e.getBoundingClientRect();
  return {blockW:+R(q('.block')).width.toFixed(1),leftW:+R(q('.left')).width.toFixed(1),
    panelW:+R(q('.panel')).width.toFixed(1),cols:getComputedStyle(q('.grid')).gridTemplateColumns,
    docOver:document.documentElement.scrollWidth-document.documentElement.clientWidth};};
for (const cont of [1600,1280,1100,1000,900,800,700]) {
  const a=await at('d2-kvittot-forst',1920,probe,null,cont);
  const c=await at('d2-kvittot-forst',1920,probe,FIX2,cont);
  console.log(` container ${String(cont).padEnd(5)} FÖRE vä=${String(a.leftW).padEnd(6)} panel=${String(a.panelW).padEnd(6)}| EFTER vä=${String(c.leftW).padEnd(6)} panel=${String(c.panelW).padEnd(6)} cols=${c.cols}`);
}

// ---------- FIX 3: CTA ----------
console.log('\n===== FIX-BEVIS 3: .cta-regeln ut ur @supports-not =====');
const FIX3=`@media (max-width:430px){.cta{width:100%;max-width:100%;padding:11px 14px;gap:10px;white-space:normal;line-height:1.25;text-align:center;}}`;
const ink=()=>{const c=document.querySelector('.cta'),R=c.getBoundingClientRect(),cs=getComputedStyle(c);
  let minL=1e9,maxR=-1e9;const wk=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
  while((n=wk.nextNode())){if(!n.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);
    for(const q of rg.getClientRects()){minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}}
  for(const el of c.children){const q=el.getBoundingClientRect();minL=Math.min(minL,q.left);maxR=Math.max(maxR,q.right);}
  return {h:+R.height.toFixed(0),utanfor:+Math.max(R.left-minL,maxR-R.right).toFixed(1),
    effPadV:+(minL-R.left).toFixed(1),effPadH:+(R.right-maxR).toFixed(1)};};
for (const w of [320,344,360,375,390,430]) {
  const out=[];
  for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
    const a=await at(f,w,ink), c=await at(f,w,ink,FIX3);
    out.push(`${f.slice(0,4)} ${a.utanfor>0.3?'UT+'+a.utanfor:'pad'+a.effPadV}→${c.utanfor>0.3?'UT+'+c.utanfor:'pad'+c.effPadV}(h${c.h})`);
  }
  console.log(' @'+String(w).padEnd(5)+out.join('  '));
}

// ---------- FIX 4: .steps-cap dubblett ----------
console.log('\n===== FIX-BEVIS 4: ta bort dubblerad .steps-cap i ≤900-blocket =====');
for (const w of [320,390,744,900]) {
  const a=await at('d2-kvittot-forst',w,()=>getComputedStyle(document.querySelector('.steps-cap')).marginBottom);
  const c=await at('d2-kvittot-forst',w,()=>getComputedStyle(document.querySelector('.steps-cap')).marginBottom,
    '@media(max-width:900px){.steps-cap{margin-bottom:22px}}');
  console.log(' @'+String(w).padEnd(5)+'FÖRE '+a+' → EFTER '+c+' (avsedd 22px)');
}

// ---------- FIX 5: .step p 65ch ----------
console.log('\n===== FIX-BEVIS 5: .step p max-width 65ch→58ch =====');
const chars=()=>{const out=[];for(const el of document.querySelectorAll('.step p')){
  const n=el.firstChild;const t=n.textContent;const rg=document.createRange();const m=new Map();
  for(let i=0;i<t.length;i++){rg.setStart(n,i);rg.setEnd(n,i+1);const q=rg.getClientRects()[0];if(!q)continue;
    const k=Math.round(q.top);m.set(k,(m.get(k)||0)+1);} out.push(Math.max(...m.values()));}return out;};
for (const f of ['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring']) {
  const a=await at(f,1920,chars), c=await at(f,1920,chars,'.step p{max-width:58ch}');
  console.log(' '+f.padEnd(18)+'FÖRE max '+Math.max(...a)+' tecken/rad → EFTER '+Math.max(...c));
}
await b.close();
