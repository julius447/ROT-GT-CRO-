import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
const files = ['d2-kvittot-forst.html','gt-produkt.html','gt-generisk.html','hemforsakring.html'];
const b = await chromium.launch();
for (const w of [1440, 390]) {
  console.log('\n############ VIEWPORT ' + w + ' ############');
  for (const f of files) {
    const page = await b.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(pathToFileURL(resolve(f)).href);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const cs = e => getComputedStyle(e);
      const rc = e => { const b = e.getBoundingClientRect(); return {x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1),b:+b.bottom.toFixed(1)}; };
      const words = t => t.trim().replace(/\s+/g,' ').split(' ').filter(Boolean).length;
      const h2 = document.querySelector('h2');
      const steps = [...document.querySelectorAll('.step')];
      const panel = document.querySelector('.panel');
      const out = {};
      out.h2 = { fs: cs(h2).fontSize, fw: cs(h2).fontWeight, lh: cs(h2).lineHeight, mb: cs(h2).marginBottom, rect: rc(h2), lines: h2.getClientRects().length, words: words(h2.innerText), text: h2.innerText.replace(/\n/g,' ') };
      out.steps = steps.map((s,i) => {
        const n = s.querySelector('.n'), h3 = s.querySelector('h3'), p = s.querySelector('p');
        const nr = rc(n), h3r = rc(h3);
        // first line centre of h3: use Range on first text node line box
        const range = document.createRange(); range.selectNodeContents(h3);
        const lineBoxes = [...range.getClientRects()];
        const first = lineBoxes[0];
        const h3lh = parseFloat(cs(h3).lineHeight);
        const firstLineMid = h3r.y + h3lh/2;
        return {
          i:i+1,
          nSize: nr.w, nY: nr.y, nMid: +(nr.y+nr.h/2).toFixed(2),
          h3fs: cs(h3).fontSize, h3fw: cs(h3).fontWeight, h3lh: cs(h3).lineHeight, h3Y: h3r.y, h3lines: lineBoxes.length,
          h3FirstLineMid: +firstLineMid.toFixed(2),
          h3GlyphMid: first ? +(first.y + first.height/2).toFixed(2) : null,
          glyphH: first ? +first.height.toFixed(2) : null,
          delta_circleMid_minus_lineMid: +((nr.y+nr.h/2) - firstLineMid).toFixed(2),
          h3words: words(h3.innerText), h3text: h3.innerText,
          pfs: cs(p).fontSize, pfw: cs(p).fontWeight, plh: cs(p).lineHeight,
          pwords: words(p.innerText), plines: [...p.getClientRects()].length, ptext: p.innerText.replace(/\n/g,' '),
          stepH: rc(s).h
        };
      });
      const gapEls = steps.map(s=>rc(s));
      out.stepGaps = gapEls.slice(0,-1).map((g,i)=> +(gapEls[i+1].y - g.b).toFixed(1));
      out.h2ToStep1 = +(gapEls[0].y - out.h2.rect.b).toFixed(1);
      const pcap = document.querySelector('.p-cap');
      const rows = [...document.querySelectorAll('.r-row')];
      const total = document.querySelector('.r-total');
      const note = document.querySelector('.t-note');
      const fine = document.querySelector('.fine');
      const cta = document.querySelector('.cta');
      const tel = document.querySelector('.tel, .sec-link');
      out.panel = { rect: rc(panel), pad: cs(panel).padding, pcapFs: cs(pcap).fontSize };
      out.rows = rows.map(r=>({ h: rc(r).h, y: rc(r).y, lbl: r.querySelector('.lbl').innerText, amt: r.querySelector('.amt').innerText.replace(/\n/g,' '), amtW: +r.querySelector('.amt').getBoundingClientRect().width.toFixed(1), amtFs: cs(r.querySelector('.amt')).fontSize, dotsW: +(r.querySelector('.dots')?.getBoundingClientRect().width||0).toFixed(1), pill: !!r.querySelector('.offert-pill'), lines: [...r.getClientRects()].length }));
      out.total = { rect: rc(total), amt: total.querySelector('.amt').innerText, amtFs: cs(total.querySelector('.amt')).fontSize, label: total.querySelector('.t-label').innerText,
        note: note? note.innerText.replace(/\n/g,' ') : '', noteWords: note? words(note.innerText):0, noteLines: note? [...note.getClientRects()].length : 0 };
      out.fine = { words: words(fine.innerText), lines: [...fine.getClientRects()].length, h: rc(fine).h, text: fine.innerText.replace(/\n/g,' ') };
      out.cta = { text: cta.innerText.replace(/\n/g,' '), rect: rc(cta), fs: cs(cta).fontSize, fw: cs(cta).fontWeight, minH: cs(cta).minHeight, radius: cs(cta).borderRadius, bg: cs(cta).backgroundImage.slice(0,60) };
      out.tel = { text: tel.innerText.replace(/\n/g,' '), aH: +tel.querySelector('a').getBoundingClientRect().height.toFixed(1) };
      out.block = rc(document.querySelector('.block'));
      out.left = rc(document.querySelector('.left'));
      out.scrollW = document.documentElement.scrollWidth;
      return out;
    });
    console.log('\n===== ' + f + ' @' + w + ' =====');
    console.log('H2: ' + r.h2.fs + '/' + r.h2.fw + ' lh=' + r.h2.lh + ' mb=' + r.h2.mb + ' lines=' + r.h2.lines + ' words=' + r.h2.words + ' h=' + r.h2.rect.h);
    console.log('   "' + r.h2.text + '"');
    console.log('h2->step1 gap: ' + r.h2ToStep1 + '  stepGaps: ' + r.stepGaps.join(', '));
    for (const s of r.steps) {
      console.log(` step${s.i}: n=${s.nSize}px nMid=${s.nMid} h3lineMid=${s.h3FirstLineMid} glyphMid=${s.h3GlyphMid} DELTA=${s.delta_circleMid_minus_lineMid}  h3=${s.h3fs}/${s.h3fw} lines=${s.h3lines} | p ${s.pfs}/${s.pfw} words=${s.pwords} lines=${s.plines}`);
      console.log(`        h3="${s.h3text}"  p="${s.ptext}"`);
    }
    console.log('panel: ' + JSON.stringify(r.panel));
    for (const row of r.rows) console.log(`  row: h=${row.h} lines=${row.lines} pill=${row.pill} amtFs=${row.amtFs} amtW=${row.amtW} dotsW=${row.dotsW} | "${row.lbl}" -> "${row.amt}"`);
    console.log(`  total: label="${r.total.label}" amt="${r.total.amt}" ${r.total.amtFs} h=${r.total.rect.h} note(${r.total.noteWords}w/${r.total.noteLines}l)="${r.total.note}"`);
    console.log(`  fine: ${r.fine.words}w / ${r.fine.lines}l / h=${r.fine.h}`);
    console.log(`        "${r.fine.text}"`);
    console.log(`  cta: "${r.cta.text}" ${r.cta.fs}/${r.cta.fw} rect=${JSON.stringify(r.cta.rect)}`);
    console.log(`  tel: "${r.tel.text}" aH=${r.tel.aH}`);
    console.log(`  block h=${r.block.h} left h=${r.left.h} panel h=${r.panel.rect.h} scrollW=${r.scrollW}`);
    await page.close();
  }
}
await b.close();
