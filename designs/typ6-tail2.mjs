import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 4 });
await page.goto(pathToFileURL(resolve('gt-produkt.html')).href);
await page.waitForTimeout(400);
const info = await page.evaluate(() => {
  const acc = document.querySelector('h2 .accent');
  const boxes = [...acc.getClientRects()].filter(r=>r.width>1);
  // find rect of "%" (end of line 1) and last g (end of line 2)
  const walker = document.createTreeWalker(acc, NodeFilter.SHOW_TEXT);
  const tns = []; while (walker.nextNode()) tns.push(walker.currentNode);
  const full = tns.map(t=>t.textContent).join('');
  // char-level rects for the whole accent
  const rects = [];
  for (const tn of tns) {
    for (let i=0;i<tn.length;i++){
      const r = document.createRange(); r.setStart(tn,i); r.setEnd(tn,i+1);
      const b = r.getBoundingClientRect();
      rects.push({ch: tn.textContent[i], right:+b.right.toFixed(2), left:+b.left.toFixed(2), top:Math.round(b.top)});
    }
  }
  return { lineBoxes: boxes.map(b=>({l:+b.left.toFixed(1), r:+b.right.toFixed(1), t:Math.round(b.top)})), chars: rects };
});
const lines = info.lineBoxes;
console.log('accent line boxes:', JSON.stringify(lines));
// last char of each line
for (const lb of lines) {
  const onLine = info.chars.filter(c=>Math.abs(c.top-lb.t)<8);
  const last = onLine[onLine.length-1];
  console.log(`line top ${lb.t}: box right ${lb.r}, last visible char "${last.ch}" right ${last.right}, overshoot ${(lb.r-last.right).toFixed(2)}px`);
}
await browser.close();
