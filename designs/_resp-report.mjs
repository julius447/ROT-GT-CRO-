import { readFileSync } from 'fs';
const R = JSON.parse(readFileSync('_resp-out.json', 'utf8'));
const FILES = Object.keys(R);
const KEYS = Object.keys(R[FILES[0]]);

console.log('===== 1. DOKUMENT-OVERFLOW (scrollW - clientW) =====');
for (const k of KEYS) {
  const row = FILES.map(f => R[f][k].overflow.delta);
  if (row.some(v => v > 0)) console.log(k.padEnd(9), row.map((v, i) => FILES[i].slice(0, 4) + ':' + v).join('  '));
}
console.log('(inga rader = noll dokument-overflow överallt)');

console.log('\n===== 2. SPILL (element utanför förälderns innerkant, >0.7px) =====');
const spillAgg = {};
for (const f of FILES) for (const k of KEYS) for (const s of R[f][k].spill) {
  const id = `${f} | ${s.el} in ${s.parent} | clipped=${s.clipped}`;
  (spillAgg[id] ||= []).push(`${k}(L${s.overL} R${s.overR} w${s.w}/${s.pw})`);
}
for (const [id, ws] of Object.entries(spillAgg)) console.log(id, '\n   →', ws.join(' '));
if (!Object.keys(spillAgg).length) console.log('(inget)');

console.log('\n===== 3. ÖVERLAPP =====');
const olAgg = {};
for (const f of FILES) for (const k of KEYS) for (const o of R[f][k].overlaps) {
  (olAgg[`${f} | ${o.a} × ${o.b}`] ||= []).push(`${k}(${o.ox}×${o.oy})`);
}
for (const [id, ws] of Object.entries(olAgg)) console.log(id, '\n   →', ws.join(' '));
if (!Object.keys(olAgg).length) console.log('(inget)');

console.log('\n===== 4. TOMYTOR >120px =====');
const gAgg = {};
for (const f of FILES) for (const k of KEYS) for (const g of R[f][k].gaps) {
  (gAgg[`${f} | ${g.where} | ${g.after} → ${g.before || 'BOTTEN'}`] ||= []).push(`${k}:${g.gap}`);
}
for (const [id, ws] of Object.entries(gAgg)) console.log(id, '\n   →', ws.join(' '));
if (!Object.keys(gAgg).length) console.log('(inget)');

console.log('\n===== 5. KOLUMNHÖJDS-DIFF (vänster vs panel, tvåspalt) =====');
for (const k of KEYS) {
  const two = FILES.filter(f => R[f][k].mode.nCols === 2);
  if (!two.length) continue;
  console.log(k.padEnd(9), two.map(f => `${f.slice(0, 4)} L${R[f][k].misc.colHeights.left}/P${R[f][k].misc.colHeights.panel} d${R[f][k].misc.colHeights.diff}`).join('  '));
}

console.log('\n===== 6. TEXTRADER: <25 tecken (widow) eller >90 tecken =====');
const lnAgg = {};
for (const f of FILES) for (const k of KEYS) for (const L of R[f][k].lines) {
  L.lines.forEach((ln, i) => {
    const isLast = i === L.lines.length - 1;
    if (L.n > 1 && isLast && ln.chars < 25 && ln.chars > 0) (lnAgg[`WIDOW ${f} | ${L.sel} | "${ln.txt}"`] ||= []).push(`${k}:${ln.chars}ch`);
    if (ln.chars > 90) (lnAgg[`LONG ${f} | ${L.sel}`] ||= []).push(`${k}:${ln.chars}ch`);
  });
}
for (const [id, ws] of Object.entries(lnAgg)) console.log(id, '\n   →', ws.slice(0, 40).join(' '));

console.log('\n===== 7. CTA =====');
for (const k of KEYS) console.log(k.padEnd(9), FILES.map(f => { const c = R[f][k].cta; return c ? `${f.slice(0, 4)}:${c.w}/${c.availW}(${c.pct}%)h${c.h}` : f.slice(0, 4) + ':—'; }).join(' '));

console.log('\n===== 8. TRYCKYTOR <44px =====');
const tapAgg = {};
for (const f of FILES) for (const k of KEYS) for (const t of R[f][k].tap) (tapAgg[`${f} | ${t.el} | ${t.txt}`] ||= []).push(`${k}:${t.w}x${t.h}`);
for (const [id, ws] of Object.entries(tapAgg)) console.log(id, '\n   →', ws.slice(0, 45).join(' '));

console.log('\n===== 9. LAYOUTLÄGE + PANELMÅTT =====');
console.log('bredd'.padEnd(9), 'nCols  panelW  panelInnerW  r-row-display  blockW  gridW  colGap');
for (const k of KEYS) {
  const m = R[FILES[0]][k].mode, mi = R[FILES[0]][k].misc;
  console.log(k.padEnd(9), String(m.nCols).padEnd(6), String(m.panelW).padEnd(7), String(m.panelInnerW).padEnd(12), m.rowStacked.padEnd(14), String(m.blockW).padEnd(7), String(m.gridW).padEnd(6), mi.colGapPx ?? '-');
}
