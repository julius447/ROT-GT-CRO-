// ============================================================================
//  _s4ringpx.mjs — läser FAKTISKA pixelvärden i ringzonen vid låsta faser.
//  Samplar längs en radie ut från cirkelns mitt, så man ser exakt VAR och HUR
//  MYCKET två varianter skiljer sig — i st.f. att gissa utifrån ett diffantal.
//    node _s4ringpx.mjs --a=DIR --b=DIR [--spara=PREFIX]
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { writeFileSync } from 'fs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const x = argv.find(s => s.startsWith('--' + k + '=')); return x ? x.split('=').slice(1).join('=') : d; };
const A = resolve(arg('a', '.')), B = resolve(arg('b', '.'));
const SPARA = arg('spara', null);
const FASER = [0, 200, 400, 800, 1540, 2000];
const RADIER = [0, 6, 12, 17, 19, 21, 24, 27, 30, 33];   // px från cirkelns mitt (cirkeln r=18, puls till r=27)

const browser = await chromium.launch();

async function kor(dir) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(join(dir, 'hemforsakring.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const w = document.querySelector('.av-cta-ringwrap') || document.querySelector('.av-cta-ring');
    const r = w.getBoundingClientRect();
    const pseudo = getComputedStyle(w, '::after');
    return {
      cx: r.x + r.width / 2, cy: r.y + r.height / 2, w: r.width, h: r.height,
      pseudoAnim: pseudo.animationName, pseudoOp: pseudo.opacity, pseudoBg: pseudo.backgroundColor,
      antalAnim: document.getAnimations().length,
      animNamn: document.getAnimations().map(a => a.animationName || '?')
    };
  });
  const clip = { x: Math.round(info.cx) - 40, y: Math.round(info.cy) - 40, width: 80, height: 80 };
  const bilder = {};
  for (const t of FASER) {
    await page.evaluate((t) => { for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t; } catch (e) {} } }, t);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const buf = await page.screenshot({ clip });
    bilder[t] = buf.toString('base64');
    if (SPARA) writeFileSync(SPARA + '-' + dir.split('/').pop() + '-' + t + '.png', buf);
  }
  await page.close();
  return { info, bilder, clip };
}

const ra = await kor(A), rb = await kor(B);

const dp = await browser.newPage(); await dp.goto('about:blank');
const rad = async (b64) => dp.evaluate(async ([s, radier]) => {
  const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + s; });
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const cx = c.width / 2, cy = c.height / 2;
  // medelvärde över 16 vinklar per radie -> robust mot ikonens streck
  return radier.map(r => {
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let i = 0; i < 32; i++) {
      const a = i * Math.PI / 16;
      const px = Math.round(cx + r * Math.cos(a)), py = Math.round(cy + r * Math.sin(a));
      if (px < 0 || py < 0 || px >= c.width || py >= c.height) continue;
      const p = (py * c.width + px) * 4;
      sr += d[p]; sg += d[p + 1]; sb += d[p + 2]; n++;
    }
    return [Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)];
  });
}, [b64, RADIER]);

console.log('\n  A = ' + A.split('/').pop() + '   B = ' + B.split('/').pop());
console.log('  A: pseudo-animation=' + ra.info.pseudoAnim + ' opacity=' + ra.info.pseudoOp + ' bg=' + ra.info.pseudoBg + ' · animationer=' + ra.info.antalAnim + ' [' + ra.info.animNamn.join(',') + ']');
console.log('  B: pseudo-animation=' + rb.info.pseudoAnim + ' opacity=' + rb.info.pseudoOp + ' bg=' + rb.info.pseudoBg + ' · animationer=' + rb.info.antalAnim + ' [' + rb.info.animNamn.join(',') + ']');
console.log('  cirkelns mitt: A ' + ra.info.cx.toFixed(1) + ',' + ra.info.cy.toFixed(1) + '  B ' + rb.info.cx.toFixed(1) + ',' + rb.info.cy.toFixed(1) + '  (box ' + ra.info.w + 'x' + ra.info.h + ')');

for (const t of FASER) {
  const va = await rad(ra.bilder[t]), vb = await rad(rb.bilder[t]);
  console.log('\n  t=' + t + ' ms      r:  ' + RADIER.map(r => String(r).padStart(11)).join(''));
  console.log('    A (grön kanal)   ' + va.map(v => String(v[1]).padStart(11)).join(''));
  console.log('    B (grön kanal)   ' + vb.map(v => String(v[1]).padStart(11)).join(''));
  console.log('    Δ                ' + va.map((v, i) => String(vb[i][1] - v[1]).padStart(11)).join(''));
}
await browser.close();
console.log('');
