// ============================================================================
//  _s4a11y.mjs — P1-13-BEVISET: läser den EXPONERADE tillgänglighetsrollen ur
//  Chromiums a11y-träd (inte attributet i markupen), och gör det i två lägen:
//    (1) som filen ligger
//    (2) med role-attributen BORTTAGNA i DOM:en (kontrollen)
//  Chromium behåller listrollen även utan role — kontrollen visar därför bara att
//  mätningen mäter rätt sak. WebKit/VoiceOver är motorn som tappar den när
//  list-style slacks; det villkoret (list-style-type:none) mäts explicit.
//    node _s4a11y.mjs [--dir=.]
// ============================================================================
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';
import { FILES } from './_metrics.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const DIR = resolve(arg('dir', '.'));

const browser = await chromium.launch();
console.log('\n  P1-13 — LISTSEMANTIKEN\n');
console.log('  fil                    role(ol)  role(li)  list-style   a11y-roll(ol)  a11y-barn  utan role-attr');
console.log('  ' + '-'.repeat(100));

for (const f of FILES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(join(DIR, f + '.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(300);

  const attr = await page.evaluate(() => {
    const ol = document.querySelector('.av-steps');
    return {
      ol: ol.getAttribute('role'),
      li: document.querySelector('.av-step').getAttribute('role'),
      ls: getComputedStyle(ol).listStyleType,
      antalLi: document.querySelectorAll('.av-step[role="listitem"]').length,
      siffrorDolda: [...document.querySelectorAll('.av-step .av-n')].every(n => n.getAttribute('aria-hidden') === 'true')
    };
  });

  // a11y-tradet via CDP (page.accessibility ar borta i nyare playwright)
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const las = async () => {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map(n => [n.nodeId, n]));
    const roll = n => (n.role && n.role.value) || '';
    const listor = nodes.filter(n => roll(n) === 'list' && !n.ignored);
    if (!listor.length) return { roll: 'SAKNAS', barn: 0 };
    // vår lista ar den med exakt tre listitem-barn
    for (const L of listor) {
      const barn = (L.childIds || []).map(i => byId.get(i)).filter(Boolean).filter(n => roll(n) === 'listitem' && !n.ignored);
      if (barn.length) return { roll: 'list', barn: barn.length };
    }
    return { roll: 'list', barn: 0 };
  };
  const lista = await las();

  // kontroll: ta bort role-attributen och las om
  await page.evaluate(() => {
    document.querySelector('.av-steps').removeAttribute('role');
    document.querySelectorAll('.av-step').forEach(l => l.removeAttribute('role'));
  });
  await page.waitForTimeout(200);
  const lista2 = await las();

  console.log('  ' + f.padEnd(22) +
    String(attr.ol).padEnd(10) + String(attr.li).padEnd(10) + String(attr.ls).padEnd(13) +
    String(lista.roll).padEnd(15) + String(lista.barn).padEnd(11) + lista2.roll + '/' + lista2.barn);
  if (attr.antalLi !== 3) console.log('     ! antal listitem = ' + attr.antalLi + ' (väntade 3)');
  if (!attr.siffrorDolda) console.log('     ! siffrorna är INTE aria-hidden');
  await page.close();
}
await browser.close();
console.log('');
