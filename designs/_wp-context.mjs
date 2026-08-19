import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import fs from 'fs';
const pick=f=>{const s=fs.readFileSync(f,'utf8');
  return {css:s.match(/<style>([\s\S]*?)<\/style>/)[1],
          body:s.match(/<body>([\s\S]*?)<\/body>/)[1]};};
const A=pick('d2-kvittot-forst.html'), B=pick('gt-produkt.html');
// simulate a WP/Bricks page: theme CSS first, then the two pasted snippets
const page=`<!DOCTYPE html><html lang="sv-SE"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>/* TEMA (Bricks) */
body{margin:0;font-family:Georgia,serif;background:#fff;color:#111;padding:0}
h1{font-size:48px;font-weight:700;margin:0 0 24px}
h2{font-size:40px;font-weight:700;line-height:1.4;margin:0 0 20px;color:#111}
p{margin:0 0 16px;font-size:18px}
.site-header{background:#eee;padding:24px 40px}
.site-main{padding:40px}
a{color:#0645ad}
</style>
<style>${A.css}</style>
<style>${B.css}</style>
</head><body>
<header class="site-header"><h1>Byta elcentral</h1><p>Temats egen ingress som ska ha 18px Georgia och 16px marginal under.</p></header>
<main class="site-main">
<h2>Temats egen H2 utanför blocken</h2>
<p>Temats egen brödtext.</p>
${A.body}
${B.body}
<h2>Temats andra H2 under blocken</h2>
<p>Temats andra brödtext.</p>
</main></body></html>`;
fs.writeFileSync('_wp-context.html',page);
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto(pathToFileURL(resolve('_wp-context.html')).href); await p.waitForTimeout(500);
const r=await p.evaluate(()=>{
  const out={};
  const themeH2=[...document.querySelectorAll('.site-main > h2')];
  out.temaH2 = themeH2.map(h=>{const c=getComputedStyle(h);return `${c.fontSize}/${c.fontWeight}/${c.lineHeight}/${c.color}/mb=${c.marginBottom}/ff=${c.fontFamily.split(',')[0]}`;});
  const h1=getComputedStyle(document.querySelector('h1'));
  out.temaH1=`${h1.fontSize}/${h1.fontWeight}/mb=${h1.marginBottom}/ff=${h1.fontFamily.split(',')[0]}`;
  const tp=getComputedStyle(document.querySelector('.site-header p'));
  out.temaP=`${tp.fontSize}/mb=${tp.marginBottom}/ff=${tp.fontFamily.split(',')[0]}`;
  const bd=getComputedStyle(document.body);
  out.body=`padding=${bd.padding} bg=${bd.backgroundColor} ff=${bd.fontFamily.split(',')[0]} color=${bd.color} lh=${bd.lineHeight}`;
  const link=getComputedStyle(document.querySelector('.site-header a')||document.createElement('a'));
  // id collisions
  const ids={};
  document.querySelectorAll('[id]').forEach(e=>{ids[e.id]=(ids[e.id]||0)+1;});
  out.dubblettId=Object.entries(ids).filter(([k,v])=>v>1);
  // what do the two panels' aria-labelledby resolve to?
  out.ariaTargets=[...document.querySelectorAll('.panel[aria-labelledby]')].map(s=>{
    const t=document.getElementById(s.getAttribute('aria-labelledby'));
    return s.getAttribute('aria-labelledby')+' → "'+(t?t.textContent.trim():'NULL')+'"';
  });
  out.sectionAria=[...document.querySelectorAll('section.block[aria-labelledby]')].map(s=>{
    const t=document.getElementById(s.getAttribute('aria-labelledby'));
    return s.getAttribute('aria-labelledby')+' → "'+(t?t.textContent.trim().slice(0,45):'NULL')+'"';
  });
  return out;
});
console.log(JSON.stringify(r,null,2));
await p.screenshot({path:'/tmp/wp-context.png',fullPage:false});
await p.close(); await b.close();
