// Zoom-crop av en region: node crop-region.mjs <fil> <out> <w> <x> <y> <cw> <ch>
import { chromium } from 'playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const [,, file, out, w = 1440, x = 0, y = 0, cw = 700, ch = 300] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 1000 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(resolve(file)).href);
await p.waitForTimeout(400);
await p.screenshot({ path: out, clip: { x: +x, y: +y, width: +cw, height: +ch } });
await b.close();
console.log('saved', out);
