// M. (1) Sväljer den oavslutade kommentaren någon CSS?
//    (2) @font-face relativ sökväg i WP-kontext (inline <style> på en nästlad URL)
//    (3) .steps-cap: visa BÅDA reglerna i ≤900-blocket + vilken som vinner
import { readFileSync } from 'fs';
import { chromium } from 'playwright';
import { resolve } from 'path';
import { createServer } from 'http';

const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

console.log('### (1) Oavslutad kommentar — sväljs någon deklaration?');
for (const f of FILES) {
  const html = readFileSync(f + '.html', 'utf8');
  const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
  // hitta alla kommentarregioner
  let i = 0, regions = [];
  while (true) {
    const s = css.indexOf('/*', i); if (s < 0) break;
    const e = css.indexOf('*/', s + 2); if (e < 0) { regions.push([s, css.length, true]); break; }
    regions.push([s, e + 2, false]); i = e + 2;
  }
  // vilken region innehåller ett extra '/*'?
  let swallowed = [];
  for (const [s, e] of regions) {
    const inner = css.slice(s + 2, e - 2);
    if (inner.includes('/*')) {
      const startLine = css.slice(0, s).split('\n').length;
      const endLine = css.slice(0, e).split('\n').length;
      // finns något som ser ut som en deklaration eller regel i den svalda delen?
      const after = inner.slice(inner.indexOf('/*'));
      const looksLikeCss = /[.#a-zA-Z][\w .:>#-]*\{[^}]*\}/.test(after) || /^\s*[-a-z]+\s*:\s*[^;]+;/m.test(after);
      swallowed.push({ startLine, endLine, nestad: true, cssSvald: looksLikeCss });
    }
  }
  console.log('  ' + f.padEnd(20) + (swallowed.length ? JSON.stringify(swallowed) : 'inga nästlade kommentarer'));
}

console.log('\n### (2) @font-face relativ sökväg — WP-scenario');
// server som härmar en WP-sida på /elservice/elcentral/ med blockets CSS INLINE
const css = (f) => { const h = readFileSync(f + '.html', 'utf8'); return h.slice(h.indexOf('<style>') + 7, h.indexOf('</style>')); };
const body = (f) => { const h = readFileSync(f + '.html', 'utf8'); return h.slice(h.indexOf('<body>') + 6, h.indexOf('</body>')); };

const srv = createServer((req, res) => {
  if (req.url.startsWith('/wp-content/uploads/fonts/')) { res.writeHead(200, { 'content-type': 'font/woff2' }); res.end(readFileSync(resolve('../assets/fonts/Outfit-VariableFont_wght.woff2'))); return; }
  if (req.url.includes('.woff2')) { res.writeHead(404); res.end('404'); return; }
  if (req.url.startsWith('/elservice/elcentral')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css('d2-kvittot-forst') + '</style></head><body>' + body('d2-kvittot-forst') + '</body></html>');
    return;
  }
  res.writeHead(404); res.end('nope');
});
await new Promise(r => srv.listen(8893, r));

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const net = [];
p.on('response', r => { if (r.url().includes('.woff')) net.push(r.status() + ' ' + r.url()); });
p.on('requestfailed', r => { if (r.url().includes('.woff')) net.push('FAILED ' + r.url()); });
await p.goto('http://localhost:8893/elservice/elcentral/');
await p.waitForTimeout(1200);
const m = await p.evaluate(async () => {
  await document.fonts.ready;
  return { registrerade: [...document.fonts].map(f => f.family + ' ' + f.status), check: document.fonts.check('36px "Outfit"'), h2W: Math.round(document.querySelector('h2').getBoundingClientRect().width), blockH: Math.round(document.querySelector('.block').getBoundingClientRect().height) };
});
console.log('  Sida: http://localhost:8893/elservice/elcentral/  (inline <style>, precis som en FluentSnippet)');
console.log('  woff2-nätverk: ' + (net.join(' | ') || 'INGEN begäran'));
console.log('  ' + JSON.stringify(m));
await p.close();

console.log('\n### (3) .steps-cap i @media (max-width:900px) — båda reglerna, vinnaren');
for (const f of FILES) {
  const html = readFileSync(f + '.html', 'utf8');
  const lines = html.split('\n');
  const hits = [];
  lines.forEach((l, i) => { if (/\.steps-cap\s*\{/.test(l) || /margin-bottom:\s*22px/.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 90)); });
  console.log('  ' + f + ':'); hits.forEach(h => console.log('     ' + h));
}
const p2 = await b.newPage({ viewport: { width: 390, height: 900 } });
await p2.goto('http://localhost:8893/elservice/elcentral/'); await p2.waitForTimeout(300);
console.log('  VINNARE @390: margin-bottom = ' + await p2.evaluate(() => getComputedStyle(document.querySelector('.steps-cap')).marginBottom));
await p2.close();
await b.close(); srv.close();
