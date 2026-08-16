import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const browser = await chromium.launch();
for (const [file, sel] of [['d2-kvittot-forst.html','h2 .accent'],['gt-produkt.html','h2 .accent']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 4 });
  await page.goto(pathToFileURL(resolve(file)).href);
  await page.waitForTimeout(400);
  // measure: accent inline box right edge vs last glyph right edge via Range
  const info = await page.evaluate(() => {
    const acc = document.querySelector('h2 .accent');
    const boxes = [...acc.getClientRects()];
    const last = boxes[boxes.length-1];
    // last text node, last char rect
    const walker = document.createTreeWalker(acc, NodeFilter.SHOW_TEXT);
    let tn; while (walker.nextNode()) tn = walker.currentNode;
    const r = document.createRange();
    r.setStart(tn, tn.length-1); r.setEnd(tn, tn.length);
    const cr = r.getBoundingClientRect();
    return { accRight: last.right, lastCharRight: cr.right, lastChar: tn.textContent.slice(-1), delta: last.right - cr.right, accRect: {x:last.x,y:last.y,w:last.width,h:last.height} };
  });
  console.log(file, JSON.stringify(info));
  const b = info.accRect;
  await page.screenshot({ path: `screens/TYP6-tail-${file.slice(0,6)}.png`, clip: { x: b.x + b.w - 90, y: b.y - 6, width: 120, height: b.h + 24 } });
  await page.close();
}
await browser.close();
