import { readFileSync } from 'fs';
const R=JSON.parse(readFileSync('_resp-out.json','utf8'));
const F=['d2-kvittot-forst','gt-produkt','gt-generisk','hemforsakring'];
const K=Object.keys(R[F[0]]);
// per (bredd,fil): samla flaggor
const flag=(f,k)=>{
  const d=R[f][k]; const s=[];
  if(d.overflow.delta>0) s.push('DOC');
  // CTA-bläck utanför -> approximeras med want>w (mätt separat, exakt: d2@320)
  const c=d.cta; if(c && c.pct>98.5) s.push('CTA');
  for(const sp of d.spill){ if(sp.el.startsWith('span.accent')) s.push('H2'); }
  for(const L of d.lines){ if(L.lines.some(x=>x.chars>90)) s.push('RAD'); }
  const ch=d.misc.colHeights; if(d.mode.nCols===2 && Math.abs(ch.diff)>200) s.push('TOM');
  return [...new Set(s)];
};
const W=Math.max(...K.map(k=>k.length));
console.log('STATUSMATRIS  (tom = inga fynd · CTA = knappens 24px sidopadding uppäten/överskriden · H2 = accenten utanför h2-boxen · RAD = radlängd >90 tecken · TOM = kolumnhöjdsdiff >200px · DOC = dokument-overflow)');
console.log('bredd'.padEnd(W+2)+F.map(f=>f.slice(0,9).padEnd(11)).join(''));
for(const k of K){
  console.log(k.padEnd(W+2)+F.map(f=>{const s=flag(f,k);return (s.length?s.join('+'):'—').padEnd(11);}).join(''));
}
console.log('\nDOC-overflow totalt över alla 41 bredder × 4 filer: '+
  F.flatMap(f=>K.map(k=>R[f][k].overflow.delta)).filter(v=>v>0).length+' fall');
console.log('Överlappande element totalt: '+F.flatMap(f=>K.map(k=>R[f][k].overlaps.length)).reduce((a,c)=>a+c,0));
console.log('Tomytor >120px inom .left/.panel: '+F.flatMap(f=>K.map(k=>R[f][k].gaps.length)).reduce((a,c)=>a+c,0));
