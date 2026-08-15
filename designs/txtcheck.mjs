import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const files = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const b = await chromium.launch();
for (const f of files) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(resolve(f)).href);
  const r = await page.evaluate(() => {
    const all = document.body.innerText;
    const block = document.querySelector('.block').innerText;
    const label = document.querySelector('.wf-label').innerText;
    const hits = (s,ch)=> (s.match(new RegExp(ch,'g'))||[]).length;
    return { emAll: hits(all,'—'), emBlock: hits(block,'—'), emLabel: hits(label,'—'),
      bangBlock: hits(block,'!'), enBlock: hits(block,'–'),
      label, superl: /bäst|störst|ledande|marknadens|unik|alltid bäst/i.test(block) };
  });
  console.log(f.padEnd(24), JSON.stringify(r));
  await page.close();
}
await b.close();
