// Probe: laddar den REMOTA AvdragOutfit-filen alls från en file://-sida i Chromium?
// Mäter dessutom bläckbredden på en 36px/450-sträng med och utan facet, så jag ser
// att fallbacken INTE är det som renderas.
import { chromium } from 'playwright';

const URL = 'https://ampy.se/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2';
const page = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-display:swap;font-family:"AvdragOutfit";src:url("${URL}") format("woff2");font-weight:100 900;font-style:normal}
#a{font-family:"AvdragOutfit",system-ui;font-size:36px;font-weight:450;position:absolute;white-space:nowrap}
#b{font-family:system-ui;font-size:36px;font-weight:450;position:absolute;top:100px;white-space:nowrap}
</style></head><body><span id="a">Byta elcentral med 30 % ROT-avdrag</span><span id="b">Byta elcentral med 30 % ROT-avdrag</span></body></html>`;

const b = await chromium.launch();
const p = await b.newPage();
const net = [];
p.on('response', r => { if (/woff2/.test(r.url())) net.push(r.status() + ' ' + r.url()); });
await p.setContent(page, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => ({
  faces: [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status),
  check: document.fonts.check('36px "AvdragOutfit"'),
  checkOutfit: document.fonts.check('36px "Outfit"'),
  inkAvdrag: +document.getElementById('a').getBoundingClientRect().width.toFixed(2),
  inkSystem: +document.getElementById('b').getBoundingClientRect().width.toFixed(2)
})), null, 1));
console.log('NÄTVERK: ' + JSON.stringify(net));
await b.close();
