// Basbas-editor: skriver IDENTISKA CSS-ändringar i alla fyra familjefiler (rad 7-383),
// så basparitetens md5 aldrig kan divergera av en handpåläggning i en enda fil.
import { readFileSync, writeFileSync } from 'fs';

const FILES = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];

const EDITS = [
  // ---- P1-2 (följdnotering): accentregelns egen kommentar måste nämna mobilsläppet ----
  [`h2 .accent { color: var(--heading-ink); font-weight: 600; white-space: nowrap; }`,
   `/* nowrap = DESKTOP only. ≤900 släpps den (se rag-fixen i mobilblocket, ägarorder 5). */
h2 .accent { color: var(--heading-ink); font-weight: 600; white-space: nowrap; }`],
];

let n = 0;
for (const f of FILES) {
  let s = readFileSync(f, 'utf8');
  for (const [from, to] of EDITS) {
    const c = s.split(from).length - 1;
    if (c !== 1) { console.error(`FEL: ${f} — hittade ${c} träffar för:\n${from.slice(0,70)}...`); process.exit(1); }
    s = s.replace(from, to);
  }
  writeFileSync(f, s);
  n++;
}
console.log(`OK — ${EDITS.length} basändringar skrivna i ${n} filer.`);
