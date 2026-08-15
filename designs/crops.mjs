// Zoom-crop helper: node crops.mjs <file.html> <outprefix> [underline]
// Clip-crops (2x) with 24px breathing room: h2, each step, steps, panel — desktop & mobile.
// Also prints measured geometry: circle center vs H3 first-line center, per step.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [,, file, prefix, variant] = process.argv;
if (!file || !prefix) { console.error('usage: node crops.mjs <file.html> <outprefix> [underline]'); process.exit(1); }
const url = pathToFileURL(resolve(file)).href;
const browser = await chromium.launch();
const pad = 24;
for (const [name, w, h] of [['desktop', 1440, 1400], ['mobile', 390, 1800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(url);
  if (variant === 'underline') {
    await page.addStyleTag({ content: 'h2 .accent{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:5px;text-decoration-color:var(--teal);}' });
  }
  await page.waitForTimeout(500);
  const shootClip = async (sel, out, idx = 0) => {
    const box = await page.locator(sel).nth(idx).boundingBox();
    const clip = {
      x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
      width: Math.min(w, box.width + pad * 2), height: box.height + pad * 2,
    };
    await page.screenshot({ path: out, clip });
  };
  await shootClip('h2', `${prefix}-h2-${name}.png`);
  await shootClip('.steps', `${prefix}-steps-${name}.png`);
  await shootClip('.step', `${prefix}-step1-${name}.png`, 0);
  await shootClip('.step', `${prefix}-step2-${name}.png`, 1);
  await shootClip('.panel', `${prefix}-panel-${name}.png`);
  // geometry: circle center vs first-line center of H3
  const geo = await page.evaluate(() => {
    return [...document.querySelectorAll('.step')].map((s, i) => {
      const n = s.querySelector('.n').getBoundingClientRect();
      const h3 = s.querySelector('h3');
      const r = document.createRange(); r.selectNodeContents(h3);
      const first = r.getClientRects()[0];
      return { step: i + 1, circleC: +(n.top + n.height / 2).toFixed(2), lineC: +(first.top + first.height / 2).toFixed(2), delta: +((n.top + n.height / 2) - (first.top + first.height / 2)).toFixed(2) };
    });
  });
  console.log(name, JSON.stringify(geo));
  await page.close();
}
await browser.close();
console.log('crops saved for', prefix);
