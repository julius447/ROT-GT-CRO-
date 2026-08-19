// ============================================================================
//  _shotdiff.mjs — OBEROENDE ANDRA BEVIS: skjuter om exakt de 24 fullPage-dumpar
//  som _baseline.mjs frös (samma bredder, samma animations:'disabled') och
//  jämför sha256 mot screens/base-*.png. En enda avvikande pixel ändrar hashen.
//    node _shotdiff.mjs
//  Slutstatus 1 om någon bild skiljer sig.
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { readFileSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { FILES, SHOT_WIDTHS } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const DIR = resolve(arg('dir', '.'));
const ONLY = arg('only', null);
const TMP = resolve(arg('tmp', 'screens/_verify'));
mkdirSync(TMP, { recursive: true });
const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');

const browser = await chromium.launch();
let lika = 0, olika = [];
for (const f of (ONLY ? ONLY.split(',') : FILES)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(join(DIR, f + '.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  for (const w of SHOT_WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(220);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const ny = join(TMP, f + '-' + w + '.png');
    await page.screenshot({ path: ny, fullPage: true, animations: 'disabled' });
    const facit = resolve('screens/base-' + f + '-' + w + '.png');
    const a = sha(facit), b = sha(ny);
    if (a === b) lika++; else olika.push({ f, w, facit: a.slice(0, 12), nu: b.slice(0, 12) });
  }
  await page.close();
}
await browser.close();

console.log('\n  SKÄRMDUMPSGRIND — sha256 mot screens/base-*.png');
console.log('  ' + (ONLY ? ONLY.split(',').length : FILES.length) + ' filer x ' + SHOT_WIDTHS.length + ' bredder = ' + ((ONLY ? ONLY.split(',').length : FILES.length) * SHOT_WIDTHS.length) + ' bilder\n');
console.log('  IDENTISKA: ' + lika + '   AVVIKANDE: ' + olika.length + '\n');
for (const o of olika) console.log('  ' + o.f.padEnd(22) + String(o.w).padStart(6) + '   facit ' + o.facit + ' -> nu ' + o.nu);
if (!olika.length) console.log('  ✅ BIT-IDENTISK RENDERING.\n');
process.exit(olika.length ? 1 : 0);
