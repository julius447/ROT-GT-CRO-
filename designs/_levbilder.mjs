/** Skärmbilder till leveransen: desktop + mobil per variant, plus kontrollsidan. */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const LEV = '/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris';
const UT  = LEV + '/08-skarmbilder';
const b = await chromium.launch();
const skott = async (fil, namn, w) => {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(fil).href);
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${UT}/${namn}`, fullPage: true });
  await p.close();
  console.log(namn);
};
for (const [typ, fil] of [['rot','rot'],['gt-produkt','gt-produkt'],['gt-generisk','gt-generisk'],['hemforsakring','hemforsakring']]) {
  await skott(resolve(LEV, '04-preview/fran-php', fil + '.html'), `${typ}-desktop-1440.png`, 1440);
  await skott(resolve(LEV, '04-preview/fran-php', fil + '.html'), `${typ}-mobil-390.png`, 390);
}
await skott(resolve(LEV, '04-preview/alla-fyra.html'), 'kontrollsida-alla-fyra-1440.png', 1440);
await b.close();
