// ============================================================================
//  _metrics.mjs — DEN ENDA MÄTDEFINITIONEN.
//  Både _baseline.mjs (fångar facit) och _gate.mjs (jämför mot facit) importerar
//  härifrån. Ändra ALDRIG mätfunktionen utan att fånga om facit — då jämför du
//  äpplen med päron och grinden blir meningslös.
//
//  21 metrik × 17 bredder × 4 filer = 1 428 metrikceller.
//  Varje metrik är ett platt objekt av löv (tal eller sträng); grinden jämför löv
//  för löv: tal med tolerans, strängar exakt.
//
//  Prefix-parametern P gör mätningen återanvändbar EFTER namespace-refaktorn
//  (steg 2): P='' mäter `.block`, P='av-' mäter `.av-block`. Samma 21 metrik.
// ============================================================================

export const FILES = ['d2-kvittot-forst', 'gt-produkt', 'gt-generisk', 'hemforsakring'];

// 17 bredder ur uppdraget. 320-430 = svenska telefoner, 480-600 = fablet/liten
// vy, 744-834 = surfplattor, 1024-1180 = iPad Pro liggande / laptopbandet,
// 1280-2560 = desktop upp till Bricks-containerns tak och långt förbi.
export const WIDTHS = [320, 344, 360, 375, 390, 430, 480, 600, 744, 768, 834, 1024, 1180, 1280, 1440, 1600, 2560];

// Skärmdumpsbredderna ur uppdraget.
export const SHOT_WIDTHS = [320, 390, 768, 1024, 1440, 1920];

// De 21 metriknamnen, i ordning. Grinden rapporterar i den här ordningen.
export const METRICS = [
  'M01_block', 'M02_grid', 'M03_left', 'M04_panel', 'M05_panelPad', 'M06_panelYta',
  'M07_h2box', 'M08_h2typ', 'M09_h2black', 'M10_accent', 'M11_capsBox', 'M12_capsTyp',
  'M13_stegGap', 'M14_h3', 'M15_brodtext', 'M16_ikon', 'M17_rader', 'M18_belopp',
  'M19_platta', 'M20_cta', 'M21_vagor'
];

// ---------------------------------------------------------------------------
//  measure(P) — körs INNE i sidan (page.evaluate). Måste vara självbärande:
//  inga closures över modulscope, inga imports.
// ---------------------------------------------------------------------------
export function measure(P) {
  // --- hjälpare ---------------------------------------------------------
  const n2 = v => (typeof v === 'number' && isFinite(v)) ? +v.toFixed(2) : null;
  const pf = v => { const f = parseFloat(v); return isFinite(f) ? +f.toFixed(2) : null; };
  // Sätter klassprefixet på varje klassselektor: '.step' -> '.av-step'.
  const S = s => s.replace(/\.(?=[A-Za-z_-])/g, '.' + P);
  const q = s => document.querySelector(S(s));
  const qa = s => Array.prototype.slice.call(document.querySelectorAll(S(s)));

  const BLK = q('.block');
  const PAN = q('.panel');
  if (!BLK) throw new Error('hittar inte ' + S('.block') + ' — fel prefix?');

  // Relativ box mot en referensnod (default = blocket). Absoluta viewportkoordinater
  // är värdelösa i en paritetsgrind; allt mäts relativt sin egen behållare.
  const rel = (el, ref) => {
    const R = ref || BLK;
    if (!el || !R) return { x: null, y: null, w: null, h: null };
    const r = el.getBoundingClientRect(), b = R.getBoundingClientRect();
    return { x: n2(r.x - b.x), y: n2(r.y - b.y), w: n2(r.width), h: n2(r.height) };
  };
  const spread = (o, pre) => { const t = {}; for (const k in o) t[pre + k] = o[k]; return t; };

  // Bläckmätning: Range över alla textnoder + inline-SVG, ytterkanterna.
  // Returnerar offset relativt elementets EGEN border-box, så värdet är
  // viewport-oberoende och direkt jämförbart mellan körningar.
  const ink = (el) => {
    if (!el) return { dL: null, dR: null, w: null, rader: null };
    const eb = el.getBoundingClientRect();
    let minL = Infinity, maxR = -Infinity; const tops = {};
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rects = rg.getClientRects();
      for (let i = 0; i < rects.length; i++) {
        const rr = rects[i];
        if (rr.width === 0 && rr.height === 0) continue;
        if (rr.left < minL) minL = rr.left;
        if (rr.right > maxR) maxR = rr.right;
        tops[Math.round(rr.top * 2) / 2] = 1;
      }
    }
    const svgs = el.querySelectorAll('svg');
    for (let i = 0; i < svgs.length; i++) {
      const rr = svgs[i].getBoundingClientRect();
      if (rr.width === 0 && rr.height === 0) continue;
      if (rr.left < minL) minL = rr.left;
      if (rr.right > maxR) maxR = rr.right;
    }
    if (!isFinite(minL)) return { dL: null, dR: null, w: null, rader: 0 };
    // dL/dR negativa = bläcket ligger UTANFÖR elementets kant (P0-1-symptomet).
    return { dL: n2(minL - eb.left), dR: n2(eb.right - maxR), w: n2(maxR - minL), rader: Object.keys(tops).length };
  };

  const cs = el => el ? getComputedStyle(el) : null;
  const g = (el, prop) => { const c = cs(el); return c ? c[prop] : null; };
  const gp = (el, prop) => { const c = cs(el); return c ? pf(c[prop]) : null; };

  const M = {};

  // -- M01 blocket: yttermått + padding + container-kontrakt -----------------
  {
    const c = cs(BLK), r = BLK.getBoundingClientRect();
    M.M01_block = {
      w: n2(r.width), h: n2(r.height),
      padT: pf(c.paddingTop), padR: pf(c.paddingRight), padB: pf(c.paddingBottom), padL: pf(c.paddingLeft),
      containerType: c.containerType, overflow: c.overflow, bg: c.backgroundColor
    };
  }

  // -- M02 rutnätet: spaltmodellen som fäller layouten (P0-5) ----------------
  {
    const el = q('.grid'), c = cs(el);
    M.M02_grid = Object.assign(spread(rel(el), ''), {
      cols: c ? c.gridTemplateColumns : null,
      colGap: gp(el, 'columnGap'), rowGap: gp(el, 'rowGap'),
      alignItems: c ? c.alignItems : null, maxW: c ? c.maxWidth : null
    });
  }

  // -- M03 vänsterspalten (den som krossas till 307 px @1024) ---------------
  M.M03_left = spread(rel(q('.left')), '');

  // -- M04 panelen: yttre box --------------------------------------------
  M.M04_panel = spread(rel(PAN), '');

  // -- M05 panelens padding + innerbredd (CQ-tröskeln 400 px, P1-2) ---------
  {
    const c = cs(PAN);
    const inner = (PAN && c) ? PAN.clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight) : null;
    M.M05_panelPad = {
      padT: gp(PAN, 'paddingTop'), padR: gp(PAN, 'paddingRight'),
      padB: gp(PAN, 'paddingBottom'), padL: gp(PAN, 'paddingLeft'),
      innerW: n2(inner), containerType: c ? c.containerType : null
    };
  }

  // -- M06 panelens yta: radie, bakgrund, ram ------------------------------
  M.M06_panelYta = {
    radie: g(PAN, 'borderRadius'), bg: g(PAN, 'backgroundColor'),
    ram: g(PAN, 'borderTopWidth') + ' ' + g(PAN, 'borderTopColor'),
    skugga: (g(PAN, 'boxShadow') || '').slice(0, 80), overflow: g(PAN, 'overflow')
  };

  // -- M07 H2: boxen -------------------------------------------------------
  const H2 = document.querySelector('h2');
  M.M07_h2box = spread(rel(H2), '');

  // -- M08 H2: typografin (storlek/vikt/lh — ägarordern 36/450/1.2) ---------
  {
    const c = cs(H2);
    M.M08_h2typ = {
      fs: pf(c.fontSize), fw: c.fontWeight, lh: pf(c.lineHeight), ls: c.letterSpacing,
      maxW: c.maxWidth, align: c.textAlign, family: (c.fontFamily || '').slice(0, 60),
      farg: c.color, marginB: pf(c.marginBottom)
    };
  }

  // -- M09 H2: BLÄCKBREDDEN (facit för fontrenderingen, P0-4) ---------------
  M.M09_h2black = ink(H2);

  // -- M10 accenten: box + nowrap-spillet (P1-3) ---------------------------
  {
    const a = q('.accent');
    const o = spread(rel(a, H2), '');
    o.ws = g(a, 'whiteSpace'); o.farg = g(a, 'color');
    // Positivt = accenten spiller ut till höger om H2-boxen.
    o.spill = (a && H2) ? n2(a.getBoundingClientRect().right - H2.getBoundingClientRect().right) : null;
    M.M10_accent = o;
  }

  // -- M11 caps ("Steg för steg"): boxen ------------------------------------
  M.M11_capsBox = spread(rel(q('.steps-cap')), '');

  // -- M12 caps: typografin + marginalen (P1-1: 22 vs 36 px) ----------------
  {
    const el = q('.steps-cap'), c = cs(el);
    M.M12_capsTyp = {
      fs: pf(c.fontSize), fw: c.fontWeight, lh: pf(c.lineHeight), ls: c.letterSpacing,
      tt: c.textTransform, marginB: pf(c.marginBottom), farg: c.color
    };
  }

  // -- M13 stegens gap: deklarerad + FAKTISKT uppmätt mellan stegen ---------
  {
    const ol = q('.steps'), st = qa('.step');
    const gap = (i) => (st[i] && st[i + 1])
      ? n2(st[i + 1].getBoundingClientRect().top - st[i].getBoundingClientRect().bottom) : null;
    M.M13_stegGap = {
      rowGap: gp(ol, 'rowGap'), display: g(ol, 'display'), dir: g(ol, 'flexDirection'),
      listStyle: g(ol, 'listStyleType'),
      matt1: gap(0), matt2: gap(1),
      stegColGap: gp(st[0], 'columnGap'), stegDisplay: g(st[0], 'display'),
      antalSteg: st.length
    };
  }

  // -- M14 H3: steg-rubrikerna (storlek/vikt/lh + alla tre boxarna) ---------
  {
    const h3 = qa('.step h3'), c = cs(h3[0]);
    const o = {
      fs: c ? pf(c.fontSize) : null, fw: c ? c.fontWeight : null,
      lh: c ? pf(c.lineHeight) : null, farg: c ? c.color : null,
      maxW: c ? c.maxWidth : null, marginB: c ? pf(c.marginBottom) : null
    };
    for (let i = 0; i < 3; i++) {
      const b = rel(h3[i], BLK);
      o['h3_' + (i + 1) + '_w'] = b.w; o['h3_' + (i + 1) + '_h'] = b.h; o['h3_' + (i + 1) + '_y'] = b.y;
    }
    M.M14_h3 = o;
  }

  // -- M15 brödtexten: .step p (65ch-frågan, P1-17) -------------------------
  {
    const p = qa('.step p'), c = cs(p[0]);
    const o = Object.assign(spread(rel(p[0], BLK), ''), {
      fs: c ? pf(c.fontSize) : null, fw: c ? c.fontWeight : null,
      lh: c ? pf(c.lineHeight) : null, maxWdekl: c ? c.maxWidth : null,
      // 65ch resolvat till px — talet auditen mätte till 768,69 @1920.
      maxWpx: p[0] ? n2(parseFloat(getComputedStyle(p[0]).maxWidth)) : null,
      farg: c ? c.color : null
    });
    o.rader = ink(p[0]).rader;
    M.M15_brodtext = o;
  }

  // -- M16 ikonen: siffercirkeln (P2-10: 38→32 påstått, 36 uppmätt) ---------
  {
    const nEl = q('.n'), mark = q('.mark'), d = q('.d'), trk = q('.trk');
    const nb = rel(nEl, BLK), mb = mark ? mark.getBoundingClientRect() : null;
    M.M16_ikon = {
      n_w: nb.w, n_h: nb.h,
      mark_w: mb ? n2(mb.width) : null, mark_h: mb ? n2(mb.height) : null,
      d_fs: gp(d, 'fontSize'), d_fw: g(d, 'fontWeight'), d_farg: g(d, 'color'),
      trk_stroke: trk ? trk.getAttribute('stroke-width') : null,
      arc_dash: q('.arc') ? q('.arc').getAttribute('stroke-dasharray') : null,
      n_bg: g(nEl, 'backgroundColor')
    };
  }

  // -- M17 kvittoraderna: .r-row-boxarna relativt panelen -------------------
  {
    const rows = qa('.r-row');
    const o = { antal: rows.length, display: g(rows[0], 'display'), gap: gp(rows[0], 'columnGap') };
    for (let i = 0; i < 2; i++) {
      const b = rel(rows[i], PAN);
      o['rad' + (i + 1) + '_x'] = b.x; o['rad' + (i + 1) + '_y'] = b.y;
      o['rad' + (i + 1) + '_w'] = b.w; o['rad' + (i + 1) + '_h'] = b.h;
    }
    const dots = q('.r-row .dots');
    o.dots_w = dots ? n2(dots.getBoundingClientRect().width) : null;
    M.M17_rader = o;
  }

  // -- M18 beloppen: siffrorna som är hela poängen med kvittot --------------
  {
    const amts = qa('.r-row .amt'), tot = q('.r-total .amt'), pill = q('.offert-pill');
    const o = { antal: amts.length };
    for (let i = 0; i < 2; i++) {
      const b = rel(amts[i], PAN);
      o['bel' + (i + 1) + '_x'] = b.x; o['bel' + (i + 1) + '_w'] = b.w; o['bel' + (i + 1) + '_h'] = b.h;
      o['bel' + (i + 1) + '_fs'] = gp(amts[i], 'fontSize'); o['bel' + (i + 1) + '_fw'] = g(amts[i], 'fontWeight');
    }
    const tb = rel(tot, PAN);
    o.tot_x = tb.x; o.tot_w = tb.w; o.tot_h = tb.h;
    o.tot_fs = gp(tot, 'fontSize'); o.tot_fw = g(tot, 'fontWeight'); o.tot_farg = g(tot, 'color');
    const pb = pill ? pill.getBoundingClientRect() : null;
    o.pill_w = pb ? n2(pb.width) : null; o.pill_h = pb ? n2(pb.height) : null;
    o.pill_fs = gp(pill, 'fontSize'); o.pill_fw = g(pill, 'fontWeight'); o.pill_bg = g(pill, 'backgroundColor');
    M.M18_belopp = o;
  }

  // -- M19 totalplattan: HÖJDEN (P1-14: 66,5 vs 72,5 px) + noten + finstilten
  {
    const t = q('.r-total'), note = q('.r-total .t-note'), lab = q('.t-label'), fine = q('.fine');
    const tb = rel(t, PAN);
    const nb = note ? note.getBoundingClientRect() : null;
    const fb = rel(fine, PAN);
    M.M19_platta = {
      x: tb.x, y: tb.y, w: tb.w, h: tb.h,
      padT: gp(t, 'paddingTop'), padB: gp(t, 'paddingBottom'), padL: gp(t, 'paddingLeft'),
      radie: g(t, 'borderRadius'), bg: g(t, 'backgroundColor'),
      lab_fs: gp(lab, 'fontSize'), lab_fw: g(lab, 'fontWeight'),
      not_display: note ? g(note, 'display') : 'saknas',
      not_h: nb ? n2(nb.height) : null,
      fine_y: fb.y, fine_w: fb.w, fine_h: fb.h, fine_fs: gp(fine, 'fontSize'), fine_maxW: g(fine, 'maxWidth')
    };
  }

  // -- M20 CTA: måtten + BLÄCKET mot knappkanten (P0-1) --------------------
  {
    const cta = q('.cta'), c = cs(cta), wrap = q('.cta-wrap');
    const b = rel(cta, PAN), ik = ink(cta);
    M.M20_cta = {
      x: b.x, y: b.y, w: b.w, h: b.h,
      minH: c ? c.minHeight : null, pad: c ? c.padding : null, gap: c ? pf(c.columnGap) : null,
      ws: c ? c.whiteSpace : null, fs: c ? pf(c.fontSize) : null, fw: c ? c.fontWeight : null,
      bredddekl: c ? c.width : null, maxW: c ? c.maxWidth : null,
      radie: c ? c.borderRadius : null,
      // NEGATIVT dL/dR = etiketten renderas utanför knappen. Grindens skarpaste löv.
      inkL: ik.dL, inkR: ik.dR, inkW: ik.w, inkRader: ik.rader,
      wrap_h: rel(wrap, PAN).h
    };
  }

  // -- M21 vågorna + blobbarna: dekorens boxar (P0-3-facit) ----------------
  {
    const o = {};
    ['hero-w1', 'hero-w2', 'hero-w3'].forEach((k, i) => {
      const b = rel(q('.' + k), BLK);
      o['v' + (i + 1) + '_x'] = b.x; o['v' + (i + 1) + '_y'] = b.y; o['v' + (i + 1) + '_w'] = b.w; o['v' + (i + 1) + '_h'] = b.h;
    });
    ['blob-a', 'blob-b', 'blob-c'].forEach((k, i) => {
      const b = rel(q('.' + k), PAN);
      o['b' + (i + 1) + '_x'] = b.x; o['b' + (i + 1) + '_y'] = b.y; o['b' + (i + 1) + '_w'] = b.w; o['b' + (i + 1) + '_h'] = b.h;
    });
    M.M21_vagor = o;
  }

  return M;
}

// ---------------------------------------------------------------------------
//  Gemensam sidhantering — identisk i baseline och grind, annars jämför man
//  inte samma sak.
// ---------------------------------------------------------------------------
export async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

export async function sweep(browser, url, P, widths = WIDTHS) {
  const page = await browser.newPage({ viewport: { width: widths[widths.length - 1], height: 900 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 });
  await page.waitForTimeout(500);            // fade-animationen (400 ms) klar
  const res = {};
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(140);
    await settle(page);
    res[w] = await page.evaluate(measure, P);
  }
  const fontOK = await page.evaluate(() => document.fonts.check('36px "Outfit"'));
  await page.close();
  return { fontOK, widths: res };
}

// Räknar löv (den faktiska jämförelseytan).
export function countLeaves(widthsObj) {
  let n = 0;
  for (const w in widthsObj) for (const m in widthsObj[w]) n += Object.keys(widthsObj[w][m]).length;
  return n;
}
