// B. Råtext-analys: var()-användning, dubblerade regelblock, dubbeldefinierade properties,
// kommentarer som refererar selektorer/klasser som inte finns.
import { readFileSync } from 'fs';
const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length)); }

for (const f of FILES) {
  const html = readFileSync(f + '.html', 'utf8');
  const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
  const bare = stripComments(css);
  console.log('\n===================== ' + f + '.html   (CSS ' + css.split('\n').length + ' rader)');

  // --- deklarerade vs använda custom props
  const decl = new Map();
  for (const m of bare.matchAll(/(--[\w-]+)\s*:/g)) decl.set(m[1], (decl.get(m[1]) || 0) + 1);
  const used = new Map();
  for (const m of bare.matchAll(/var\(\s*(--[\w-]+)/g)) used.set(m[1], (used.get(m[1]) || 0) + 1);
  const unused = [...decl.keys()].filter(k => !used.has(k));
  const undef = [...used.keys()].filter(k => !decl.has(k));
  console.log('VAR oanvända (' + unused.length + '):', unused.join(', ') || '(inga)');
  if (undef.length) console.log('VAR odefinierade:', undef.join(', '));

  // --- dubblerade regelblock (identisk selektor + identiska deklarationer)
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(bare))) {
    const sel = m[1].replace(/\s+/g, ' ').trim();
    const body = m[2].replace(/\s+/g, ' ').trim();
    if (!sel || sel.startsWith('@')) continue;
    // radnummer
    const line = bare.slice(0, m.index).split('\n').length;
    rules.push({ sel, body, line });
  }
  const seen = new Map();
  for (const r of rules) {
    const key = r.sel + '||' + r.body;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push(r.line);
  }
  const dups = [...seen.entries()].filter(([, l]) => l.length > 1);
  console.log('IDENTISKA REGELBLOCK som förekommer >1 gång: ' + dups.length);
  for (const [k, lines] of dups) console.log('   rader ' + lines.join(' + ') + '  ->  ' + k.split('||')[0] + ' { ' + k.split('||')[1].slice(0, 70) + ' }');

  // --- dubbeldefinierade properties INOM samma regel
  for (const r of rules) {
    const names = [...r.body.matchAll(/(^|;)\s*([-a-zA-Z]+)\s*:/g)].map(x => x[2]);
    const c = {};
    names.forEach(n => c[n] = (c[n] || 0) + 1);
    const d = Object.entries(c).filter(([, n]) => n > 1);
    if (d.length) console.log('   DUBBEL PROP i rad ' + r.line + ' (' + r.sel + '): ' + JSON.stringify(d));
  }

  // --- selektorer som skrivs mer än en gång (potentiell kaskadkonflikt) i SAMMA kontext
  const bySel = new Map();
  for (const r of rules) { if (!bySel.has(r.sel)) bySel.set(r.sel, []); bySel.get(r.sel).push(r.line); }
  const multi = [...bySel.entries()].filter(([, l]) => l.length > 1);
  console.log('SELEKTORER SOM UPPREPAS (' + multi.length + '):');
  for (const [s, l] of multi) console.log('   ' + s + '  @rader ' + l.join(', '));

  // --- @keyframes-namn
  const kf = [...bare.matchAll(/@keyframes\s+([\w-]+)/g)].map(x => x[1]);
  const kfc = {}; kf.forEach(k => kfc[k] = (kfc[k] || 0) + 1);
  console.log('@keyframes:', JSON.stringify(kfc));

  // --- kommentarer som nämner en klass som inte finns i CSS/HTML
  const comments = [...css.matchAll(/\/\*[\s\S]*?\*\//g)].map(x => x[0]);
  const mentioned = new Set();
  for (const c of comments) for (const mm of c.matchAll(/(?:^|[\s(])(\.[a-z][\w-]{2,})/g)) mentioned.add(mm[1]);
  const missing = [...mentioned].filter(cl => !bare.includes(cl) && !html.includes('class="' + cl.slice(1)));
  console.log('KLASSER SOM BARA NÄMNS I KOMMENTAR (finns ej i CSS):', missing.join(', ') || '(inga)');

  // --- HTML-klasser utan CSS-regel
  const htmlBody = html.slice(html.indexOf('</style>'));
  const htmlClasses = new Set();
  for (const mm of htmlBody.matchAll(/class="([^"]+)"/g)) mm[1].split(/\s+/).forEach(c => c && htmlClasses.add(c));
  const noRule = [...htmlClasses].filter(c => !bare.includes('.' + c));
  console.log('HTML-KLASSER UTAN CSS-REGEL:', noRule.join(', ') || '(inga)');
}
