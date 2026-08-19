// ============================================================================
//  _s3shot.mjs — FÖRE/EFTER-BILDER för steg 3, på uppdragets sex bredder.
//     node _s3shot.mjs --tag=fore     -> screens/steg3/fore/
//     node _s3shot.mjs --tag=efter    -> screens/steg3/efter/
//
//  Två serier per fil och bredd:
//     prev-<fil>-<bredd>.png   hela previewsidan (den pixelgodkända renderingen)
//     prod-<fil>-<bredd>.png   BLOCKET klippt ur produktionssidan (ampy.se:s
//                              riktiga CSS + 1280px Bricks-container)
//     ctaz-<fil>-<bredd>.png   CTA-zoomen (knappen + 24px marginal) — P0-1:s bevis
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import { SHOT_WIDTHS, FILES } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const TAG = arg('tag', 'fore');
const S = '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/';
const DIR = resolve('screens/steg3/' + TAG);
mkdirSync(DIR, { recursive: true });

const b = await chromium.launch();
let n = 0;

for (const f of FILES) {
  // ---- preview -----------------------------------------------------------
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(resolve(f + '.html')).href, { waitUntil: 'load' });
    await p.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
    await p.waitForTimeout(600);
    for (const w of SHOT_WIDTHS) {
      await p.setViewportSize({ width: w, height: 900 });
      await p.waitForTimeout(160);
      await p.screenshot({ path: `${DIR}/prev-${f}-${w}.png`, fullPage: true }); n++;
    }
    await p.close();
  }
  // ---- produktion --------------------------------------------------------
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(S + 's3' + TAG + '-' + f + '.html').href, { waitUntil: 'load' });
    await p.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 20000 });
    await p.waitForTimeout(600);
    for (const w of SHOT_WIDTHS) {
      await p.setViewportSize({ width: w, height: 900 });
      await p.waitForTimeout(160);
      const box = await p.evaluate(() => {
        const e = document.querySelector('.ampy-avdrag');
        e.scrollIntoView({ block: 'start' });
        const r = e.getBoundingClientRect();
        return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
      });
      await p.screenshot({
        path: `${DIR}/prod-${f}-${w}.png`, fullPage: true,
        clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: Math.min(box.w + 16, w), height: box.h + 16 }
      }); n++;
      // CTA-zoomen
      const cbox = await p.evaluate(() => {
        const c = document.querySelector('.av-cta'); if (!c) return null;
        c.scrollIntoView({ block: 'center' });
        const r = c.getBoundingClientRect();
        return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
      });
      if (cbox) {
        await p.screenshot({
          path: `${DIR}/ctaz-${f}-${w}.png`, fullPage: true,
          clip: { x: Math.max(0, cbox.x - 24), y: Math.max(0, cbox.y - 24), width: Math.min(cbox.w + 48, w), height: cbox.h + 48 }
        }); n++;
      }
    }
    await p.close();
  }
  console.error('bilder klara: ' + f);
}
await b.close();
console.log(n + ' bilder -> ' + DIR);
