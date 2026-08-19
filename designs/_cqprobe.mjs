// _cqprobe.mjs — MÄTER cq-mekaniken innan en enda rad CSS skrivs.
//   1) Resolverar cqi PÅ containern själv mot containern, eller mot en förfader/viewport?
//   2) Jämför @container (max-width) mot content-box eller border-box?
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 800 } });
await p.setContent(`<style>
 #wrap{width:600px}
 #box{container-type:inline-size;container-name:cbox;width:100%;padding:0 50px;border:1px solid #000;box-sizing:border-box;
      --probe: 10cqi; }
 #box{ margin-left: var(--probe); }                 /* cqi ANVÄND PÅ containern själv */
 #kid{ width: 10cqi; height:10px; background:red }  /* cqi använd på ett BARN */
 @container cbox (max-width: 500px){ #kid{ background:blue } }
 @container cbox (max-width: 498px){ #kid{ outline:2px solid green } }
</style><div id="wrap"><div id="box"><div id="kid"></div></div></div>`);
await p.waitForTimeout(100);
const r = await p.evaluate(() => {
  const box = document.getElementById('box'), kid = document.getElementById('kid');
  const cb = getComputedStyle(box), ck = getComputedStyle(kid);
  return {
    boxBorderBox: box.getBoundingClientRect().width,
    boxContentBox: box.clientWidth - parseFloat(cb.paddingLeft) - parseFloat(cb.paddingRight),
    viewport: innerWidth,
    boxMarginLeft_10cqi: cb.marginLeft,   // 10cqi PÅ containern
    kidWidth_10cqi: ck.width,             // 10cqi på ett barn
    kidBg: ck.backgroundColor,            // @container max-width:500 träffar?
    kidOutline: ck.outlineColor + ' ' + ck.outlineStyle
  };
});
console.log(JSON.stringify(r, null, 1));
console.log('\nTOLKNING:');
console.log(' box border-box = ' + r.boxBorderBox + ', content-box = ' + r.boxContentBox + ', viewport = ' + r.viewport);
console.log(' 10cqi PÅ containern  -> ' + r.boxMarginLeft_10cqi +
  '   (content-box vore ' + (r.boxContentBox / 10) + 'px, viewport vore ' + (r.viewport / 10) + 'px)');
console.log(' 10cqi på BARNET      -> ' + r.kidWidth_10cqi + '   (content-box vore ' + (r.boxContentBox / 10) + 'px)');
console.log(' @container max-width:500 -> ' + (r.kidBg === 'rgb(0, 0, 255)' ? 'TRÄFFAR' : 'träffar INTE') +
  ' ; max-width:498 -> ' + (r.kidOutline.includes('solid') ? 'TRÄFFAR' : 'träffar INTE') +
  '   => jämförs mot ' + (r.kidBg === 'rgb(0, 0, 255)' ? (r.kidOutline.includes('solid') ? '<=498' : 'content-box (' + r.boxContentBox + ')') : 'border-box (' + r.boxBorderBox + ')'));
await b.close();

// ---- 3) Löses cqi INNE i en custom property vid deklarationen eller hos konsumenten?
const b2 = await chromium.launch();
const p2 = await b2.newPage({ viewport: { width: 1000, height: 800 } });
await p2.setContent(`<style>
 #ytter{container-type:inline-size;width:800px}
 #inner{container-type:inline-size;width:400px}
 #ytter{ --tok: 10cqi; }                 /* deklareras PÅ den yttre containern */
 #ytter > b{ width:var(--tok); display:block }
 #inner > b{ width:var(--tok); display:block }
</style><div id="ytter"><b id="a"></b><div id="inner"><b id="c"></b></div></div>`);
await p2.waitForTimeout(80);
const r2 = await p2.evaluate(() => ({
  barnTillYtter: getComputedStyle(document.getElementById('a')).width,
  barnTillInner: getComputedStyle(document.getElementById('c')).width
}));
await b2.close();
console.log('\n--- custom property med cqi, deklarerad på #ytter (800px), ärvd in i #inner (400px):');
console.log('  konsument i #ytter -> ' + r2.barnTillYtter + '   (10% av 800 = 80px)');
console.log('  konsument i #inner -> ' + r2.barnTillInner + '   (10% av 400 = 40px)');
console.log('  => ' + (r2.barnTillYtter === r2.barnTillInner
  ? 'löses VID DEKLARATIONEN (token bär ett px-värde)'
  : 'löses HOS KONSUMENTEN — cqi i en token är en TYST FÄLLA'));
