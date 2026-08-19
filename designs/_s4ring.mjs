// ============================================================================
//  _s4ring.mjs — P1-9-BEVISET.
//  (A) Vilo-skuggan: computed box-shadow på .av-cta-ring när animationen är
//      CANCELLERAD (= exakt vad screenshot({animations:'disabled'}) fångar) och
//      när den LÖPER.
//  (B) Pulsens geometri: ringzonen fotograferad vid tio låsta animationsfaser
//      (currentTime satt via Web Animations API) i FÖRE och EFTER, pixeldiffad.
//  (C) Paint-räknarna: CDP Performance över 3 s stillastående fönster.
//    node _s4ring.mjs --fore=DIR --efter=DIR
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const FORE = resolve(arg('fore', '.'));
const EFTER = resolve(arg('efter', '.'));
const FASER = [0, 28, 56, 140, 400, 800, 1200, 1540, 2000, 2500, 2799];
const FIL = 'hemforsakring';

const browser = await chromium.launch();

async function oppna(dir) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(join(dir, FIL + '.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(600);
  return page;
}

// --- (A) vilo-skuggan -------------------------------------------------------
async function skugga(page) {
  return await page.evaluate(() => {
    const r = document.querySelector('.av-cta-ring');
    const lopande = getComputedStyle(r).boxShadow;
    // exakt det playwright gör: cancel av oändliga animationer
    const alla = document.getAnimations();
    const namn = alla.map(a => (a.animationName || (a.effect && a.effect.target && a.effect.target.className) || '?'));
    alla.forEach(a => { try { a.cancel(); } catch (e) {} });
    const cancellerad = getComputedStyle(r).boxShadow;
    return { lopande, cancellerad, antalAnimationer: alla.length, namn };
  });
}

// --- (B) faslåsta bilder ----------------------------------------------------
async function fasbilder(page) {
  const box = await page.evaluate(() => {
    const w = document.querySelector('.av-cta-ringwrap') || document.querySelector('.av-cta-ring');
    const r = w.getBoundingClientRect();
    // generöst utsnitt: 36px-cirkeln + 9px puls + 3px skugga + marginal
    return { x: Math.round(r.x) - 18, y: Math.round(r.y) - 18, width: Math.round(r.width) + 36, height: Math.round(r.height) + 36 };
  });
  const ut = [];
  for (const t of FASER) {
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t; } catch (e) {} }
    }, t);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    ut.push((await page.screenshot({ clip: box })).toString('base64'));
  }
  return { box, bilder: ut };
}

// --- (C) paint-räknare ------------------------------------------------------
async function paint(dir) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(join(dir, FIL + '.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(1200);                    // fade-animationerna klara
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const pick = m => { const o = {}; for (const x of m.metrics) o[x.name] = x.value; return o; };
  const a = pick(await cdp.send('Performance.getMetrics'));
  await page.waitForTimeout(3000);                    // 3 s stillastående fönster
  const b = pick(await cdp.send('Performance.getMetrics'));
  await page.close();
  const d = {};
  for (const k of ['RecalcStyleCount', 'RecalcStyleDuration', 'LayoutCount', 'LayoutDuration', 'TaskDuration', 'ScriptDuration'])
    d[k] = +(b[k] - a[k]).toFixed(3);
  return d;
}

const pF = await oppna(FORE), pE = await oppna(EFTER);
const bildF = await fasbilder(pF), bildE = await fasbilder(pE);
const skuggaF = await skugga(pF), skuggaE = await skugga(pE);
await pF.close(); await pE.close();

// diffa faserna
const dp = await browser.newPage();
await dp.goto('about:blank');
const fasdiff = [];
for (let i = 0; i < FASER.length; i++) {
  const r = await dp.evaluate(async ([a, b]) => {
    const ld = s => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/png;base64,' + s; });
    const ia = await ld(a), ib = await ld(b);
    const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
    x.clearRect(0, 0, c.width, c.height); x.drawImage(ib, 0, 0);
    const db = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0, max = 0, sum = 0;
    for (let p = 0; p < da.length; p += 4) {
      let d = 0; for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(da[p + k] - db[p + k]));
      if (d) { n++; sum += d; if (d > max) max = d; }
    }
    return { px: c.width * c.height, andrade: n, maxDelta: max, medel: n ? +(sum / n).toFixed(2) : 0 };
  }, [bildF.bilder[i], bildE.bilder[i]]);
  fasdiff.push({ t: FASER[i], ...r });
}
await dp.close();

const paintF = await paint(FORE), paintE = await paint(EFTER);
await browser.close();

console.log('\n  (A) VILO-SKUGGAN på .av-cta-ring');
console.log('      FORE  löpande     : ' + skuggaF.lopande);
console.log('      FORE  cancellerad : ' + skuggaF.cancellerad + '   <-- det skärmdumpsgrinden fångar');
console.log('      EFTER löpande     : ' + skuggaE.lopande);
console.log('      EFTER cancellerad : ' + skuggaE.cancellerad);
console.log('      animationer på sidan: fore ' + skuggaF.antalAnimationer + ' · efter ' + skuggaE.antalAnimationer);

console.log('\n  (B) PULSENS GEOMETRI — ringzonen ' + bildF.box.width + 'x' + bildF.box.height + ' px vid låsta faser');
console.log('      t(ms)   ändrade px   max Δ   medel Δ');
for (const f of fasdiff) console.log('      ' + String(f.t).padStart(5) + String(f.andrade).padStart(13) + String(f.maxDelta).padStart(8) + String(f.medel).padStart(10));

console.log('\n  (C) PAINT-RÄKNARE, 3 s stillastående fönster');
for (const k in paintF) console.log('      ' + k.padEnd(22) + String(paintF[k]).padStart(10) + '  ->  ' + String(paintE[k]).padStart(10));
console.log('');
