// Zoom-crop av H2 (underscore-inspektion): node crop-h2.mjs <fil> <out>
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const [,, file = 'd2-kvittot-forst.html', out = 'screens/h2-crop.png'] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
await p.goto(pathToFileURL(resolve(file)).href);
await p.waitForTimeout(400);
const el = await p.$('h2');
await el.screenshot({ path: out });
await b.close();
console.log('saved', out);
