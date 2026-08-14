import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const url = pathToFileURL('./d2-kvittot-forst.html').href;
const browser = await chromium.launch();

async function measure(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url);
  await page.waitForTimeout(600);
  const data = await page.evaluate(() => {
    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];
    const r = el => { const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), left: +b.left.toFixed(1), right: +b.right.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const cs = el => getComputedStyle(el);

    const out = {};
    const block = $('.block'), grid = $('.grid'), h2 = $('h2'), steps = $('.steps');
    const stepEls = $$('.step');
    const panel = $('.panel'), pcap = $('.p-cap');
    const rows = $$('.r-row');
    const rtotal = $('.r-total'), fine = $('.fine'), ctaWrap = $('.cta-wrap'), cta = $('.cta'), tel = $('.tel'), telA = $('.tel a');

    out.viewport = { w: innerWidth, h: innerHeight };
    out.bodyPadding = { left: cs(document.body).paddingLeft, right: cs(document.body).paddingRight, top: cs(document.body).paddingTop, bottom: cs(document.body).paddingBottom };
    out.block = { rect: r(block), padding: { top: cs(block).paddingTop, right: cs(block).paddingRight, bottom: cs(block).paddingBottom, left: cs(block).paddingLeft } };
    out.grid = { rect: r(grid), colGap: cs(grid).columnGap, rowGap: cs(grid).rowGap, cols: cs(grid).gridTemplateColumns };

    // H2
    out.h2 = { rect: r(h2), fontSize: cs(h2).fontSize, fontWeight: cs(h2).fontWeight, lineHeight: cs(h2).lineHeight, marginBottom: cs(h2).marginBottom };
    out.h2_to_steps = +(r(steps).top - r(h2).bottom).toFixed(1);

    // Steps
    out.steps_gap = cs(steps).gap;
    out.steps_detail = stepEls.map((s, i) => {
      const n = s.querySelector('.n'), h3 = s.querySelector('h3'), p = s.querySelector('p');
      return {
        i: i + 1,
        step: r(s),
        icon: r(n),
        h3: r(h3),
        p: r(p),
        icon_to_text_gap: +(r(h3).left - r(n).right).toFixed(1),
        h3_to_p: +(r(p).top - r(h3).bottom).toFixed(1),
        icon_center_vs_h3_center: +(((r(n).top + r(n).h / 2) - (r(h3).top + r(h3).h / 2))).toFixed(1),
      };
    });
    out.step_external_gaps = stepEls.slice(1).map((s, i) => +(r(s).top - r(stepEls[i]).bottom).toFixed(1));

    // dashed connector: pseudo-element measurement
    out.connector = stepEls.slice(0, -1).map((s, i) => {
      const ps = getComputedStyle(s, '::before');
      return { i: i + 1, top: ps.top, bottom: ps.bottom, left: ps.left };
    });
    // gap between icon bottom and next icon top vs connector coverage
    out.icon1_bottom = r(stepEls[0].querySelector('.n')).bottom;
    out.icon2_top = r(stepEls[1].querySelector('.n')).top;

    // Panel
    out.panel = { rect: r(panel), padding: { top: cs(panel).paddingTop, right: cs(panel).paddingRight, bottom: cs(panel).paddingBottom, left: cs(panel).paddingLeft } };
    out.pcap = { rect: r(pcap), paddingBottom: cs(pcap).paddingBottom, fontSize: cs(pcap).fontSize };
    out.pcap_to_row1 = +(r(rows[0]).top - r(pcap).bottom).toFixed(1);

    // Receipt rows
    out.rows = rows.map((row, i) => {
      const lbl = row.querySelector('.lbl'), amt = row.querySelector('.amt');
      return {
        i: i + 1, rect: r(row), padTop: cs(row).paddingTop, padBottom: cs(row).paddingBottom,
        lbl: r(lbl), amt: r(amt),
        lbl_to_amt_vert: +(r(amt).top - r(lbl).bottom).toFixed(1),
      };
    });
    out.row_gaps = rows.slice(1).map((row, i) => +(r(row).top - r(rows[i]).bottom).toFixed(1));
    out.row2_to_rtotal = +(r(rtotal).top - r(rows[rows.length - 1]).bottom).toFixed(1);

    // r-total
    const tlabel = rtotal.querySelector('.t-label'), tamt = rtotal.querySelector('.amt'), tnote = rtotal.querySelector('.t-note');
    out.rtotal = {
      rect: r(rtotal), padding: { top: cs(rtotal).paddingTop, right: cs(rtotal).paddingRight, bottom: cs(rtotal).paddingBottom, left: cs(rtotal).paddingLeft },
      margin: { top: cs(rtotal).marginTop, left: cs(rtotal).marginLeft, right: cs(rtotal).marginRight },
      gap: cs(rtotal).gap,
      tlabel: r(tlabel), tamt: r(tamt), tnote: r(tnote),
      label_to_note: +(r(tnote).top - r(tlabel).bottom).toFixed(1),
    };
    out.rtotal_to_fine = +(r(fine).top - r(rtotal).bottom).toFixed(1);

    // fine
    out.fine = { rect: r(fine), marginTop: cs(fine).marginTop, fontSize: cs(fine).fontSize };
    out.fine_to_ctawrap = +(r(ctaWrap).top - r(fine).bottom).toFixed(1);

    // CTA area
    const ctaWrapCS = cs(ctaWrap);
    const beforeCS = getComputedStyle(ctaWrap, '::before');
    out.ctaWrap = { rect: r(ctaWrap), paddingTop: ctaWrapCS.paddingTop, gap: ctaWrapCS.gap, divider: { height: beforeCS.height, marginBottom: beforeCS.marginBottom } };
    out.fine_to_cta_visual = +(r(cta).top - r(fine).bottom).toFixed(1);
    out.cta = { rect: r(cta), padding: cs(cta).padding, minHeight: cs(cta).minHeight, gap: cs(cta).gap, fontSize: cs(cta).fontSize };
    out.cta_to_tel = +(r(tel).top - r(cta).bottom).toFixed(1);
    out.tel = { rect: r(tel), fontSize: cs(tel).fontSize };
    out.telA = { rect: r(telA), padding: cs(telA).padding, tapHeight: r(telA).h };
    out.cta_bottom_to_panel_bottom = +((r(panel).bottom - parseFloat(cs(panel).paddingBottom)) - r(tel).bottom).toFixed(1);
    out.panel_bottom_pad_actual = +(r(panel).bottom - r(tel).bottom).toFixed(1);

    // divider line position (::before of cta-wrap) approximate: ctaWrap.top + paddingTop? Actually ::before is first in flow
    out.cta_wrap_top_to_cta = +(r(cta).top - r(ctaWrap).top).toFixed(1);

    // horizontal: h2 left vs steps text left, panel inner widths
    out.h2_left = r(h2).left;
    out.step_text_left = r(stepEls[0].querySelector('h3')).left;
    out.icon_left = r(stepEls[0].querySelector('.n')).left;
    out.panel_inner_width = +(r(panel).w - parseFloat(cs(panel).paddingLeft) - parseFloat(cs(panel).paddingRight)).toFixed(1);
    out.left_col_width = r($('.left')).w;

    // mobile order check: grid vs panel top relative to steps bottom
    out.steps_bottom = r(steps).bottom;
    out.panel_top = r(panel).top;
    if (r(panel).top > r(steps).bottom) out.steps_to_panel = +(r(panel).top - r(steps).bottom).toFixed(1);

    // horizontal scroll check
    out.scrollWidth = document.documentElement.scrollWidth;

    return out;
  });
  await page.close();
  return data;
}

const d1440 = await measure(1440, 900);
const d390 = await measure(390, 844);
const d320 = await measure(320, 700);
console.log(JSON.stringify({ d1440, d390, d320 }, null, 1));
await browser.close();
