import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const browser = await chromium.launch();
for (const f of ['d2-kvittot-forst','hemforsakring']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  await page.goto(pathToFileURL(resolve(f + '.html')).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screens/dx-${f}-1920.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log('ok');
