import { chromium } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
const [,, file, out, w, h] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(resolve(file)).href); await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true });
await b.close(); console.log('saved', out);
