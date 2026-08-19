// E. @font-face: laddas Outfit verkligen? format("woff2-variations") stöds inte av alla motorer.
// Bevis: document.fonts.check + faktisk textbredd mot en känd fallback + nätverkslogg.
import { chromium, webkit, firefox } from 'playwright';
import { resolve } from 'path'; import { pathToFileURL } from 'url';
import { existsSync, statSync } from 'fs';

const FONT = resolve('../assets/fonts/Outfit-VariableFont_wght.woff2');
console.log('woff2 finns på disk:', existsSync(FONT), existsSync(FONT) ? statSync(FONT).size + ' bytes' : '');

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit], ['firefox', firefox]]) {
  let b;
  try { b = await engine.launch(); } catch (e) { console.log(name + ': kunde inte starta (' + e.message.split('\n')[0] + ')'); continue; }
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const reqs = [];
  p.on('requestfinished', r => { if (r.url().includes('.woff')) reqs.push('OK ' + r.url().split('/').pop()); });
  p.on('requestfailed', r => { if (r.url().includes('.woff')) reqs.push('FAIL ' + r.url().split('/').pop() + ' ' + r.failure()?.errorText); });
  await p.goto(pathToFileURL(resolve('d2-kvittot-forst.html')).href);
  await p.waitForTimeout(1200);
  const m = await p.evaluate(async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status);
    const h2 = document.querySelector('h2');
    const cs = getComputedStyle(h2);
    // mät samma sträng i Outfit vs i den deklarerade fallbacken
    const probe = document.createElement('span');
    probe.textContent = 'Byta elcentral med 30 % ROT-avdrag';
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:36px;font-weight:450;';
    document.body.appendChild(probe);
    probe.style.fontFamily = '"Outfit"'; const wOutfit = probe.getBoundingClientRect().width;
    probe.style.fontFamily = 'system-ui'; const wSys = probe.getBoundingClientRect().width;
    probe.style.fontFamily = '"NoSuchFontXYZ"'; const wNone = probe.getBoundingClientRect().width;
    probe.remove();
    // varierar variabelaxeln? 450 vs 700 ska ge olika bredd om variable font är aktiv
    const p2 = document.createElement('span');
    p2.textContent = 'Byta elcentral'; p2.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:36px;font-family:"Outfit";';
    document.body.appendChild(p2);
    p2.style.fontWeight = '300'; const w300 = p2.getBoundingClientRect().width;
    p2.style.fontWeight = '450'; const w450 = p2.getBoundingClientRect().width;
    p2.style.fontWeight = '900'; const w900 = p2.getBoundingClientRect().width;
    p2.remove();
    return {
      fontsRegistered: loaded,
      checkOutfit: document.fonts.check('36px "Outfit"'),
      check450: document.fonts.check('450 36px "Outfit"'),
      h2Family: cs.fontFamily, h2Weight: cs.fontWeight,
      wOutfit: +wOutfit.toFixed(1), wSys: +wSys.toFixed(1), wNone: +wNone.toFixed(1),
      variabelAxel: { w300: +w300.toFixed(1), w450: +w450.toFixed(1), w900: +w900.toFixed(1) },
      tabular: (() => {
        const a = document.createElement('span'), c = document.createElement('span');
        for (const e of [a, c]) { e.style.cssText = 'position:absolute;visibility:hidden;font:17px "Outfit"'; document.body.appendChild(e); }
        a.textContent = '111111'; c.textContent = '000000';
        c.style.fontVariantNumeric = 'tabular-nums'; a.style.fontVariantNumeric = 'tabular-nums';
        const t1 = a.getBoundingClientRect().width, t0 = c.getBoundingClientRect().width;
        a.style.fontVariantNumeric = 'normal'; c.style.fontVariantNumeric = 'normal';
        const n1 = a.getBoundingClientRect().width, n0 = c.getBoundingClientRect().width;
        a.remove(); c.remove();
        return { tnum_1: +t1.toFixed(2), tnum_0: +t0.toFixed(2), norm_1: +n1.toFixed(2), norm_0: +n0.toFixed(2) };
      })(),
    };
  });
  console.log('\n--- ' + name);
  console.log('  nät:', reqs.length ? reqs.join(' | ') : 'INGEN woff2-begäran');
  console.log('  ' + JSON.stringify(m, null, 2).split('\n').join('\n  '));
  await b.close();
}
