# Designflottans anteckningar — 4 hi-fi-designer

Pipeline per riktning: designer (self-render-loop) → adversarial granskare (färska ögon) → fix-agent (stänger punchlistan + slutverifierar).


---

# d1-kollen-forst

## Designerns beslut

Varv 3 verifierat: CTA:n bryter balanserat, processrubriken klarar kontrast, kvittot rent på båda viewports. Klar.

**Leverabel:** `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d1-kollen-forst.html`
**Renders:** `designs/screens/d1-r{1,2,3}-{desktop,mobile}.png` + interaktionstillstånd `d1-r{1,2,3}s-{ok,hm,wait}-{desktop,mobile}.png` (statehelper: `designs/shot-states-d1.mjs`)

**1) Designbeslut**

- **Frågan är rubriken, oförändrad struktur/copy från w1.** Lade endast till en centrerad eyebrow "ROT-AVDRAG" med dubbla teal-streck (designsystemets eyebrow-motiv, speglat) — förankrar blocket i sidfamiljen utan att stjäla från H2:n. Accenten "30 % ROT-avdrag?" i teal 800 med `white-space: nowrap` ger en kontrollerad tvåradsbrytning på desktop.
- **Frågepanelen** = offwhite-kort på det vita blockkortet (inverterad yta = lugn), segmenterade Ja/Nej-pillrar med 44px tryckyta; valt Ja = navy-fylld (commitment), valt Nej = vit med navy-inline-ring (synligt men tystare, ingen röd/grön moralisering av svaret — candour).
- **Kvittots papperskänsla utan kitsch:** vit yta med riven/sågtandad NEDERKANT via `conic-gradient`-mask (22px tänder) + `drop-shadow` på wrappern så skuggan följer den rivna kanten; prickade ledare (klassisk kvittotypografi) mellan rad och belopp; totalrad med 2px navy-linjal; `tabular-nums`. Ingen textur, ingen serif, ingen fejk-logga.
- **−30 % som teal-pill med vit 19px/700-text** i stället för teal småtext — det är belöningsögonblickets enda färgslag OCH löser WCAG (teal ≈3:1 klarar bara stor text; 19px bold = stor). "Skräddarsydd offert"-pillen behöll streckad kant = "fylls i av oss", offerten ÄR priset.
- **Reveal-koreografi:** besked (280ms rise) → kvittoraderna staggras 40/120/200/260ms → CTA-raden 300ms; varje enskild animation ≤300ms, en easing (`cubic-bezier(.16,1,.3,1)`), allt dött under `prefers-reduced-motion`. På mobil mjukscrollas beskedet in i vy när kvittot låses upp (auto vid reduced motion).
- **"Osäkert"-beskedet i neutral navy-grå**, inte amber (wireframens `--warn` ströks — "INGA nya färger" är hårdare ram än wireframens fidelity; informationsikon i muted i stället).
- **Mellanläget** "1 av 2 besvarad — en fråga kvar." i en tyst streckad platshållare — ger flödesåterkoppling utan att skrika.
- **Handritade sifferringar:** tre olika inline-SVG-bågar (öppen glipa, olika startvinklar per steg, rundade linjeslut) — ärver dagens blocks handritade ringkänsla utan att kopiera ikonerna; streckade connector-linjer horisontellt på desktop, vertikalt i vänsterspalt på mobil.
- **A11y:** riktiga `<button type="button">` med `aria-pressed`, `role="group"` + `aria-labelledby` per fråga, `role="status" aria-live="polite"` på beskedet, fokusringar via `--ring`-token, alla textytor ≥4.5:1 (teal endast i stor/fet text).

**2) Render-varv: 3 st (plus interaktionstillstånd i varje varv)**

- **r1** (bas + ok/hm/wait): grundlayout satt. Fynd: prickade ledare hängde löst på mobil när beloppet radbröts; −30 %-pillens teal-skugga för tung inne i kvittot; CTA:n bröt trångt till två rader på mobil; wait-hinten för högljudd.
- **r2**: mobilkvittot fick `dots` dolda + `margin-left:auto` på belopp (högerställd radbrytning); pillskuggan sänkt till 4/12px-nivå; CTA fick padding/line-height för tvåradsläge; scrollIntoView tillagd. Fynd kvar: `SÅ GÅR DET TILL` + etikettrad i `--faint` (~3.4:1, under AA); orphan "och år." i finstilten; CTA-brytningen obalanserad.
- **r3**: faint→muted på båda (AA-grönt), `text-wrap: pretty` på finstilt, `text-wrap: balance` på CTA. Verifierat rent på 1440 + 390 i alla tillstånd.

**3) Kvarstående tveksamheter**

- **Impeccable-hookens [single-font]-fynd = avsiktligt falskt positivt** (Ampy-lag: enbart Outfit, viktkontrast bär hierarkin). Ej suppressat i config — kräver ägarbekräftelse.
- **Wireframens grindar ärvda oförändrade:** frågebanken kräver elektriker-/ägarsignering; "dras direkt på fakturan" kräver GAP 1-bekräftelse; kvittoraden "Elcentral + installation" ska bli ACF-variabel per tjänstesida.
- `conic-gradient`-mask för den rivna kanten: verifierad i Chromium; bör ögnas i Safari/Firefox före Bricks-portning (`-webkit-mask` medskickad).
- Eyebrown "ROT-AVDRAG" och mellanläges-hinten "1 av 2 besvarad" är mina enda copytillägg utöver wireframen — båda inom candour, men ägaren bör se dem.
- CTA-länkarna är `href="#"` (offert-URL = GAP); telefonlänken är riktig (`tel:0102657979`).

## Granskarens punchlista

Granskningen är gjord på riktigt: koden läst rad för rad, blocket renderat i 8 tillstånd (default/ok/hm/wait × desktop/mobil), jämfört mot wireframe w1, tokens.css och dagens rot.html.

# PUNCHLISTA — d1-kollen-forst.html

## P0 (måste fixas)

1. **"Osäkert"-beskedet är en återvändsgränd — copyn lovar en väg som designen gömmer.** Verdictet säger "hör av dig så tittar vi på ditt fall", men i hm-grenen körs `hide(reveal)` → BÅDA CTA:erna (Begär offert + Ring 010-265 79 79) är dolda. Den ärliga nej-vägen (candour-styrkan i hela riktningen) har alltså noll affordance att faktiskt höra av sig. Fix (JS, hm-grenen): appendera en tel-länk direkt i beskedet, t.ex. `verdict.innerHTML = ICON_HM + '<span><strong>Osäkert.</strong> … så tittar vi på ditt fall.<br><a class="verdict-tel" href="tel:0102657979">Ring 010-265 79 79</a></span>'` + en `.verdict-tel { font-weight:600; color:var(--teal); text-decoration:none; }`-rad. Alternativ: visa `.cta-row` (bara ghost-knappen) även i hm-läget.

## P1 (bör fixas)

2. **Fokusring deformerar pill-CTA:n.** Den generiska regeln `:is(a, button):focus-visible { … border-radius: 6px }` (rad 42, specificitet 0,1,1) slår `.cta { border-radius: 999px }` (0,1,0) — vid tangentbordsfokus knäpper pillen om till 6px-hörn. Fix: ta bort `border-radius: 6px` ur den generiska regeln och lägg den bara där den behövs (`.wf-label a`), eller lägg till `.cta:focus-visible { border-radius: 999px; }`.

3. **Fokusindikatorn på den teala CTA:n är nästan osynlig.** `.cta:focus-visible { box-shadow: var(--ring) }` = rgba(0,169,145,.28) — en svag teal-glow runt en teal knapp; klarar inte 3:1 mot intilliggande färg. Fix utan nya färger: `.cta:focus-visible { box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--teal); }` (vit gap-ring + teal ytterring).

4. **Den som aldrig trycker har ingen konverteringsväg alls.** Default-tillståndet slutar vid processen 1-2-3 — inget telefonnummer, ingen CTA någonstans i blocket. Detta är ärvt från wireframen (riktningen är medvetet "belönings-mekanik"), så inte en regression — men i POSITION 2 på 22 tjänstesidor är det dyrt. Lågmäld fix som inte bryter riktningens idé: en stillsam rad under stegen, `<p class="steps-tel">Vill du hellre prata direkt? <a href="tel:0102657979">010-265 79 79</a></p>` i muted/14px. (Ägarbeslut — det ändrar riktningens renodling.)

5. **`href="#"` på primär-CTA:n + noll instrumentering.** Inga dataLayer-events på svar/besked/reveal/CTA-klick (webb-playbookens mätkontrakt). OK i designfas, men märk filen med en kommentar så det inte glider till produktion: mål `/offert/`, events `rot_q_answer`, `rot_verdict`, `rot_cta_click`.

6. **Verdictet re-animerar vid varje klick — även när svaret inte ändras.** `verdict.className = …` + `void verdict.offsetWidth` + `classList.add('show')` körs ovillkorligt, så att klicka "Ja" igen (eller byta fråga 1 mellan samma svar) får besked + kvittostagger att hoppa om. Fix: håll en `let lastKey` (t.ex. `state.own+'|'+state.tax`) och returnera tidigt om oförändrad.

## P2 (nice)

7. **Deduct-pillen −30 % (vit på teal, 19px bold) mäter ~2,96:1** — marginellt under 3:1 för stor text. Samma familjemönster som sajtens teal-CTA:er, så ingen ny defekt — men här är det själva nyckelsiffran. Billig höjning: `color: var(--navy)` på pillen testar sämre mot varumärket; rimligare är att lägga `text-shadow` bort och acceptera familjemönstret, eller mörka pill-bakgrunden går inte (inga nya färger). Flagga, ägarens val.

8. **`.head h2 .accent { white-space: nowrap }`** — "30 % ROT-avdrag?" ryms på 390px men riskerar horisontell overflow <360px. Fix: `@media (max-width:359px){ .head h2 .accent{ white-space:normal } }`.

9. **Kvittoraden på mobil:** "Skräddarsydd offert"-pillen wrappar till egen högerställd rad under etiketten — funkar, men ser lite tappad ut. Snyggare: `@media (max-width:767px){ .receipt .row{ display:grid; grid-template-columns:1fr; gap:6px } .receipt .row .amt{ margin-left:0 } }` (pill vänsterställd under sin etikett).

10. **Sifferringarna (teal 17px på vitt, ~2,96:1)** — matchar de handritade ringarna i dagens block, så familjetroget; AA-vänligare vore navy siffra i teal ring: `.step .n { color: var(--navy) }`.

11. **Token-avvikelse:** `--shadow-3` använder 0.14/0.08 mot tokens.css 0.18/0.10 — kortet är aningen lättare än guldstandarden. Justera till kanonvärdena.

12. **Segmenten är semantiskt en radiogrupp** men byggd som toggle-knappar med `aria-pressed` — fungerar och är läsbar, men `role="radiogroup"` + `role="radio"`/`aria-checked` med roving tabindex vore striktare. Nuvarande mönster är acceptabelt.

13. **`--faint` definieras men används aldrig** — rensa.

## Vad som är starkt (verifierat i render)

- Kvitto-mekaniken är blockets bästa yta: zigzag-masken, punktledarna, dashed offert-pill, 2px navy-totallinje, staggern 40→260ms — läser som ett riktigt kvitto och hierarkin (total 23px/800 navy > pill 19px > rader 16,5px) är korrekt: "70 % av arbetskostnaden" vinner ögat.
- Copy och hedges är intakta mot wireframen ord för ord ("Troligen", "beror på din skatt", "Osäkert … hör av dig", 30 %/50 000 kr-kanon, inga påhittade siffror). Wait-tillståndet "1 av 2 besvarad — en fråga kvar" är en fin, ärlig mikro-progress.
- JS-logiken är korrekt över alla svarskombinationer (ja/ja → ok+reveal; nej på ägande prioriteras korrekt före skatt i hm-texten; delsvar → wait; byte ja/ja→nej döljer kvittot igen). `hidden`-attributet och `.show`-klassen sätts/tas i rätt ordning så inget tillstånd läcker.
- aria-live="polite"/role="status" på beskedet, riktiga `<button>`, 44px tryckytor, fullbredds-segment på mobil, ingen horisontell scroll i något renderat tillstånd, `prefers-reduced-motion` nollar allt och gör stagger-raderna synliga (animation-fill "both" blir inte en fälla).
- Mobilstegen (ring vänster, rubrik/brödtext höger, vertikal streckad connector) är en snyggare lösning än wireframens.

Designen är inte svagare än wireframen på någon punkt — den ärver wireframens två strukturella svagheter (punkt 1 och 4) men höjer allt annat.

# TOTALOMDÖME: NÄSTAN

Craft-nivån når guldstandarden (kvittot är på riktigt premium, tillståndsmaskinen håller), men P0:1 — nej-vägens döda ände där copyn säger "hör av dig" utan någon kontaktyta — måste stängas innan detta kan ligga i position 2 på 22 sidor. Med punkt 1–3 fixade: PREMIUM.

## Fix-agentens stängning

Fokusringen är nu en tydlig vit+teal dubbelring med bibehållen pillform, och steps-tel-raden döljs korrekt när kvitto-CTA:erna är synliga. Alla tillstånd ögonbesiktigade genom de fyra linserna — inget regredierade.

# STÄNGDA PUNKTER

**P0**
- **1. Osäkert-beskedets döda ände — STÄNGD.** hm-grenen injicerar nu en `.verdict-tel`-länk (telefonikon + "Ring 010-265 79 79", teal 600, min-height 44px) direkt i beskedet. Verifierad i render desktop + mobil; copyn "hör av dig så tittar vi på ditt fall" har nu en riktig kontaktyta.

**P1**
- **2. Fokusring deformerar pillen — STÄNGD.** `border-radius: 6px` borttagen ur den generiska focus-visible-regeln (flyttad till `.wf-label a:focus-visible`). Pillen behåller 999px vid tangentbordsfokus (verifierad i fokus-render).
- **3. Osynlig fokusindikator på teal CTA — STÄNGD.** `.cta:focus-visible { box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--teal) }` — vit gap-ring + teal ytterring, tydligt synlig i render. Inga nya färger.
- **4. Ingen konverteringsväg i default — STÄNGD (med ägarflagg).** Stillsam rad `Vill du hellre prata direkt? 010-265 79 79` (muted 14px/300, centrerad) under stegen. Extra finess utöver punchlistan: raden döljs via `:has(.reveal.show)` när kvittots Ring-knapp är synlig, så numret aldrig dubbleras. **Ägarbeslut kvarstår formellt** — raden är en enradsborttagning om Julius vill ha riktningen renodlad.
- **5. href="#" + noll instrumentering — STÄNGD.** Primär-CTA pekar nu på `/offert/`, produktionskommentar i HTML, och riktiga dataLayer-stubbar: `rot_q_answer` (fråga+svar), `rot_verdict` (ok/hm), `rot_cta_click` (offert/ring/ring_steps/ring_osakert), alla med `block:'rot_kollen'`. Consent-gating till GTM markerad som produktionsvillkor i kommentaren.
- **6. Re-animation vid oförändrat svar — STÄNGD.** `lastKey`-guard (`own|tax`) med early return; identiskt omklick studsar inte längre besked/kvitto.

**P2**
- **8. Accent-nowrap <360px — STÄNGD** (`@media (max-width:359px)` → `white-space: normal`).
- **9. Mobilkvittoraden — STÄNGD.** Grid 1-kolumn, gap 6px, pill vänsterställd under sin etikett (verifierad i ok-mobil — läser mycket renare).
- **11. shadow-3-tokenavvikelse — STÄNGD.** Nu kanon 0.18/0.10 (verifierad mot tokens.css).
- **13. Oanvänd `--faint` — STÄNGD** (borttagen).

# LÄMNADE PUNKTER

- **P2:7 (deduct-pill ~2,96:1)** — lämnad per punchlistans egen slutsats: familjemönstret med sajtens teal-CTA:er, och båda alternativen (navy text / mörkare bakgrund) bryter varumärke eller palettregeln. Flaggad, ägarens val.
- **P2:10 (sifferringar teal på vitt)** — lämnad: matchar medvetet de handritade ringarna i dagens rot.html (familjetrohet), och en ensidig ändring här skulle avvika från de tre systerdesignerna. Flaggad som möjligt gemensamt beslut för alla fyra.
- **P2:12 (radiogroup-semantik)** — lämnad: punchlistan bedömer själv nuvarande `aria-pressed`-mönster som acceptabelt; en roving-tabindex-ombyggnad är risk utan motsvarande vinst i detta skede.

**Övrigt:** design-hookens "single-font"-fynd är falskt positivt — Ampy-identiteten föreskriver Outfit som enda typsnitt med viktburen hierarki (hårda ramar i uppdraget + guldstandarden); medvetet oförändrat.

# VERIFIERING

Render-loopen körd 2 fulla varv + fokus-render: `screens/d1-kollen-forst-final-{desktop,mobile}.png` (default), `screens/d1-final-states-{ok,hm,wait}-{desktop,mobile}.png`, `screens/d1-final-focus-cta.png` — alla lästa och granskade genom fyra linser. Copy/candour intakt ord för ord, inga nya färger, alla tillstånd har nu en konverteringsväg.

Fil: `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d1-kollen-forst.html`

# SLUTSTATUS: PREMIUM

Granskarens eget villkor ("med punkt 1–3 fixade: PREMIUM") är uppfyllt, plus 4, 5, 6, 8, 9, 11, 13. Kvarvarande är tre flaggade ägarval, inga defekter.

---

# d2-kvittot-forst

## Designerns beslut

Design är klar och verifierad i alla tillstånd. Rådata:

**Leverabel:** `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d2-kvittot-forst.html`
**Renders:** `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d2-r1…r5-{desktop,mobile}.png` + interaktionstillstånd `d2-r{2,3,4,5}-unlocked-*.png` / `d2-r{2,3,4,5}-hm-*.png` (ja/ja-upplåst resp. osäkert-besked, tagna via playwright-klickscript).

**1. Designbeslut**
- **Kvittot som värdeobjekt:** eget vitt kort med border + shadow-2, teal vertikal rygg på vänsterkanten, kvittorubrik "SÅ RÄKNAS DITT PRIS" i spärrad versal + Ampy-blixt, prickade ledarlinjer mellan etikett och belopp (kvitto-autenticitet utan kitsch). Skannbart på 3 sek utan interaktion.
- **Upplåsningsmekaniken taktil:** låsta rader = opacity .34 + grayscale + 2px nedsänkning; vid ja/ja tänds de (280ms, en easing), låsikonen korsfadar till teal-bock, totalraden får 70ms fördröjd tändning + scale-pop på "70 % av arbetet". Nej-svar återlåser. Hint-raden ("→ Svara på två frågor…") pekar mot panelen på desktop, ↓ på mobil, försvinner vid upplåsning.
- **Högerspalten är ingen sidopanel:** grid `align-items:stretch`, panelen flex-kolumn med CTA:n bottenankrad (`margin-top:auto`) så båda korten delar bottenlinje; beskedet bor i en alltid synlig "dock" (mjuk dashed slot med placeholder "Ditt besked visas här när du svarat.") som fylls till teal-soft (ok) / neutral subtle (osäkert). Ingen amber — wireframens warn-färg ströks för att hålla teal+midnight-regeln; "osäkert" bär sitt allvar i text, inte färg.
- **Processen som fotrad:** 1-2-3 med teal-ringar och korta streckade connectors som bara spänner gapet mellan stegen (familjearv från dagens block utan textkollision).
- **Copy:** wireframens copy orörd (candour-vettad). Enda tillägg: eyebrow "ROT-avdrag 2026" + kvittorubriken + placeholder-raden — inga nya sifferpåståenden.
- **A11y:** riktiga `<button>` med `aria-pressed`, `role="group"` + `aria-labelledby` per fråga, `aria-live="polite"` på beskedet, 44px+ tryckytor, `:focus-visible`-ring, prefers-reduced-motion nollar allt. Teal används aldrig för liten text (hint-raden är navy med teal-pil; −30 % är 19px/700 = large-text-nivå).

**2. Render-varv: 5**
- **r1:** hittade 5 defekter — högerpanelen svävade som kort stubbe med dött utrymme under; "ROT-avdrag" ordbröts i rubriken; steps-connectors kolliderade med stegtitlarna; mobilkvittots belopp vänsterställdes vid radbrytning; mobil-CTA bröt till två rader.
- **r2:** balans fixad men avslöjade JS/CSS-bugg — verdictens `<strong>` + text blev separata flexbarn → förvrängd textordning ("Osäkert." mitt i meningen); placeholder-slotten var ett 200px tomt dashed hål.
- **r3:** verdict-texten korrekt, mobilupplåst stark; slotten svalde fortfarande all överskottshöjd.
- **r4:** slot fixhöjd + CTA bottenankrad — luften blev osynlig generositet i stället för inramat tomrum. Alla tre tillstånd rena på båda viewports.
- **r5:** fix av global `:focus-visible { border-radius:8px }` som skulle deformera pillerknapparna vid tangentbordsnav; slutverifiering utan regression.

**3. Kvarstående tveksamheter**
- **GAP 1 (från wireframen):** "draget direkt på fakturan" i rubriken kräver ägarsignering, liksom finstiltens "Materialet omfattas inte av ROT" och frågebanken (äga bostad / inkomstskatt som enda två kvalificeringsfrågor).
- **Eyebrow "ROT-avdrag 2026":** årtalstillägg utöver wireframen — stryk om ägaren vill ha blocket årtalsneutralt över årsskiften.
- **Placeholder-dockan** i initialt läge är designens största smakfråga: den lär ut mekaniken men kostar ~86px vertikal höjd på mobil innan interaktion.
- **CTA-länken är `href="#"`** — måldestination (/offert/ med prefill?) är instrumenterings-/routingbeslut utanför uppdraget.
- Impeccable-hookens single-font-flagga är avsiktlig false positive: Ampys brandbook kräver enbart Outfit med viktkontrast.

## Granskarens punchlista

Ran the full state matrix (ja/ja, ja/nej, keyboard focus probes) — screenshots in `screens/d2-review-*`. Probe script kept at `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/shot-d2-review.mjs` for the fix pass.

# PUNCHLISTA — d2-kvittot-forst.html

## P0 (måste fixas)

1. **CTA saknar synlig fokusring vid tangentbordsnavigering** — `designs/d2-kvittot-forst.html` rad 50 vs 204–211. Verifierat med Playwright: keyboard-fokus på `.cta` ger computed box-shadow = enbart `--shadow-teal`, ingen ring. Regeln `.cta { box-shadow: var(--shadow-teal) }` kommer senare i kaskaden och slår `:focus-visible` (samma specificitet). Samma mekanik dödar ringen på vald Nej-knapp: `.seg button.on.no` (0,3,1) > `:focus-visible` (0,1,0). Hårda ramen kräver fokusringar.
   **Fix:**
   ```css
   .cta:focus-visible { box-shadow: var(--shadow-teal), var(--ring); }
   .seg button:focus-visible,
   .seg button.on.no:focus-visible { box-shadow: var(--ring); }
   ```

## P1 (bör fixas)

2. **Stale unlock-hint efter nej-svar** — verifierat: efter ja/nej säger kvittot fortfarande "→ Svara på två frågor så ser du om avdragsraderna gäller dig" trots att båda frågorna är besvarade och beskedet säger "Osäkert". Motstridig microcopy; blocket ser trasigt ut för exakt den grupp som fick tummen ner.
   **Fix (JS):** i `update()`:s else-gren, dölj hinten när båda svaren finns: `receipt.classList.add('answered')` + CSS `.receipt.answered .unlock-hint { display: none; }` (behåll `waiting` för låsningen).

3. **Död selektor → dubbel avdelare ovanför beskedet** — `.q:last-of-type { border-bottom: 0 }` (rad 176) träffar aldrig: `.verdict` och `.cta-wrap` är också `div`-syskon, så ingen `.q` är `:last-of-type`. Verifierat: sista frågan har computed `border-bottom-width: 1px` → solid linje direkt ovanpå den streckade verdict-ramen.
   **Fix:** `.q:has(+ .verdict) { border-bottom: 0; }` (eller klass `.q--last`).

4. **Dött tomrum i högerpanelen (desktop)** — `cta-wrap { margin-top: auto }` + `align-items: stretch` ger ~110–140 px vakuum mellan besked och CTA i alla tillstånd. Guldstandarden har ingen sådan oadresserad yta; det är panelens största avstånd från premium.
   **Fix:** låt besked-sloten absorbera ytan: `.verdict { flex: 1 0 auto; min-height: 86px; }` (innehållet är redan centrerat) — den streckade "hit kommer ditt besked"-ytan blir då designens svar på tomrummet.

5. **Kontrast under 4,5:1 på skarp text** — `--faint` #8a90ac på vitt = 3,16:1 (uträknat). Träffar (a) kvittorubriken "SÅ RÄKNAS DITT PRIS" (11,5 px) och (b) placeholdern "Ditt besked visas här när du svarat." (14,5 px, w300). Båda är riktig läs-text, inte dekor.
   **Fix:** byt till `--muted` #565e82 (6,3:1) i `.r-cap` och `.verdict`-basen; behåll `--faint` enbart i wf-etikettraden (skaffolding).

6. **GAP-grinden tappades i hi-fi** — wireframens annotation grindar "draget direkt på fakturan" (= GAP 1) och frågebanken + "Materialet omfattas inte av ROT" (kräver signering). Hi-fi-filen bär ingen spårning alls — nedströms (Bricks-konvertering) försvinner grinden tyst, mot provenance-regeln.
   **Fix:** HTML-kommentar vid h2 och `.fine`: `<!-- [GAP] "draget direkt på fakturan" + materialformulering: ägargrind före ship -->`. Samma för `href="#"` på CTA (mål-URL = ägarbeslut).

## P2 (nice)

7. **Låsta rader för bleka vid 3-sekundersskanning** — `opacity: .34` + grayscale gör att blockets kärnlöfte (−30 %, "70 % av arbetet") knappt läses utan interaktion; wireframen låg på .38. Höj till `.45` — låskänslan består, siffrorna överlever skanningen.
8. **Mobil: pricklinjer pekar på ingenting när rader bryts** — deduct-raden bryter ("−30 %" hamnar ensam på rad 2) och leader-prickarna slutar i luften. Fix: vid ≤900px, sänk `.r-row.deduct .amt` till 17px + `gap: 10px` så raden ryms på en rad, alternativt `.r-row .dots { display: none }` när raden är bruten.
9. **Layout-skift vid upplåsning** — `unlock-hint` får `display: none` → kvittot krymper ~36 px medan användaren tittar. Fada ut (opacity+max-height, 280 ms) i stället, eller reservera höjden.
10. **Rise-animationen spelas inte om vid ok↔hm-växling** — `show`-klassen ligger kvar så `rise` triggar bara första gången. Fix i JS: `verdict.classList.remove('show'); void verdict.offsetWidth;` före ny klass.
11. **Semantik på ja/nej** — `aria-pressed`-togglar fungerar, men paret är ömsesidigt uteslutande; `role="radiogroup"` + `role="radio"`/`aria-checked` vore ärligare för skärmläsare. Lågt prioriterat, mönstret är OK som det är.

## Vad som är BÄTTRE än wireframen (behåll)
Teal-ryggraden på kvittot, lås→bock-badgen, pop på totalen, det streckade besked-slotet, offert-pillen med streckad kant (kommunicerar "här står normalt en siffra" utan att ljuga), mobilens seg-knappar i full bredd med 44 px+ tryckytor. Copy 1:1 mot den candour-vettade wireframen, alla siffror kanon (30 % / 70 % / 50 000 kr), beskeden korrekt hedgade i alla fyra svarskombinationer (JS-logiken verifierad: ja/ja → ok+upplåst; övriga tre → "Osäkert"+låst, omlåsning vid ändrat svar fungerar). Motion 140/280 ms, en easing, reduced-motion-killswitch total.

## TOTALOMDÖME: **NÄSTAN**
Strukturen och interaktionsidén är premium och trogen den godkända wireframen; craften är nära guldstandarden. Men en hård-rams-miss (osynlig fokusring på huvud-CTA:n, P0), den motsägelsefulla hinten efter nej-svar, kontrastmissarna och panelens döda yta måste stängas innan det här visas för en kräsen art director. Med punkterna 1–6 fixade: PREMIUM.

## Fix-agentens stängning

Alla tillstånd verifierade — upplåsning, bock-badge, teal-verdict, ingen dubbel avdelare, inget vakuum. Klart.

STÄNGDA PUNKTER
- **P0-1 Fokusringar** — `.cta:focus-visible { box-shadow: var(--shadow-teal), var(--ring) }` + `.seg button:focus-visible` / `.seg button.on.no:focus-visible { box-shadow: var(--ring) }`. Probe-verifierat settled: CTA = shadow-teal + ring, vald Nej-knapp = ring, ovald seg-knapp = ring.
- **P1-2 Stale unlock-hint** — JS sätter `receipt.classList.add('answered')` när båda svaren finns; hinten döljs i BÅDA utfallen. Probe: opacity 0, clientHeight 0 efter ja/nej.
- **P1-3 Död selektor/dubbel avdelare** — `.q:last-of-type` ersatt med `.q:has(+ .verdict) { border-bottom: 0 }`. Probe: computed border-bottom-width = 0px.
- **P1-4 Dött tomrum** — `.verdict { flex: 1 0 auto }`: besked-sloten absorberar panelens yta, CTA:n sitter tätt under i alla tillstånd (verifierat i alla tre state-skärmdumpar).
- **P1-5 Kontrast** — `.r-cap` och `.verdict`-basen bytta från `--faint` (3,16:1) till `--muted` (6,3:1); `--faint` kvar endast i wf-etikettraden.
- **P1-6 GAP-grinden** — tre HTML-kommentarer återinförda: `[GAP]` vid h2 ("draget direkt på fakturan"), vid `.fine` (materialformulering + frågebank kräver signering), vid CTA (href="#" = ägarbeslut).
- **P2-7** låst opacity .34→.45; **P2-8** deduct-radens pricklinjer döljs vid ≤900px (raden bryter rent, inga prickar i luften — 17px+gap räckte inte på 390px, tog granskarens alternativ); **P2-9** hinten fadar/kollapsar (opacity+max-height, 280ms) i stället för display:none — inget layout-hopp; **P2-10** `classList.remove('show') + void offsetWidth` före ny klass — rise spelas om vid ok↔hm (probe: 'verdict ok show' efter växling); **P2-11** `role="radiogroup"` + `role="radio"`/`aria-checked` ersätter group/aria-pressed (JS uppdaterad).

LÄMNAT
- Inget ur punchlistan. Två hook-fynd klassade som false positives: "single-font" (Outfit som enda familj är Ampy-lag; viktkontrast bär hierarkin) och "layout-transition" på hinten (max-height-kollapsen är exakt granskarens föreskrivna P2-9-fix; engångs, 280 ms, litet element).

RENDER-LOOP: 2 varv (full render → mobil-deduct-fix → full render) + tillståndsmatris (ja/ja, ja/nej, CTA-fokus) via settle-probe. Skärmar: `screens/d2-kvittot-forst-final-{desktop,mobile,jaja,janej,cta-focus}.png`.

Fil: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d2-kvittot-forst.html

SLUTSTATUS: **PREMIUM** — kvittometaforen läses direkt, lås→bock-mekaniken och besked-sloten är nu konsekventa i alla fyra svarskombinationer, mobilen bryter rent utan hängande pricklinjer, fokusringar synliga överallt, kontrast och candour-copy intakta (30 % / 70 % / 50 000 kr, hedgade besked, ärligt nej-utfall).

---

# d3-processen-som-verktyg

## Designerns beslut

Verified: the teal overlay is at `scaleX(1)` with the teal repeating-gradient covering the grey dashes (z-index 1) — the 1→2 connector draws teal on activation. Build complete.

---

**Leverabel:** `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d3-processen-som-verktyg.html` (+ statehjälpare `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d3-state.mjs`, renders i `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d3-r1..r3-*.png`, `d3-state-ok-*.png`, `d3-state-hm-*.png`)

**1. Designbeslut**
- **Processen som tillstånd, inte dekor:** ett `flow-on`-läge på blocket när kollen blir grön: ring 1 fylls teal med vit check (crossfade nummer→check), connectorn 1→2 "ritas" i teal (scaleX/scaleY-draw 280 ms, dagens streckade connector-språk återskapat som repeating-linear-gradient så draget kan animeras via transform, inte layout), kort 2 lyfts 4 px med teal kantlinje + mjuk teal skugga, ring 2 tänds teal, och en "Nästa steg"-pill fäller in över kort 2:s överkant. Ja+Nej eller ombeslut backar hela tillståndet.
- **Ringar i handritat språk:** SVG-cirklar med öppen glipa (`stroke-dasharray: 90 10`, roterade) som ekar live-blockets handritade sifferringar; steg 1 teal (start här), 2–3 grå tills processen startat.
- **Verdictreveal utan layout-thrash:** `grid-template-rows: 0fr→1fr` + opacity/translate på innern; `aria-live="polite"` på containern. "Osäkert"-beskedet fick neutral navy-grå yta i stället för wireframens amber — teal är enda accent per identitetslagen.
- **Kroppar topp-flödade** (rd 2): wireframens `margin-top:auto` gav döda gap mellan desc och innehåll; kort 1:s tomrum är nu i stället "reserverat" för verdictet och fylls när man svarat.
- **Copy behållen** från wireframen; enda justeringar inom brief-kanon: totalraden "Ditt pris efter ROT" (brief-kanon över wireframens "DITT PRIS"), pillen "Skräddarsydd offert" (brief), eyebrow "Så fungerar det", ghost-CTA som riktig `tel:`-länk.
- **Tillgänglighet/mobil:** riktiga `<button>` med `aria-pressed` + `role="group"`, fokusring 3 px teal, seg-knappar 46 px höga och fullbredd på mobil, vertikala connectors mellan staplade kort (teal-draw även där, kortlyftet avstängt), inga transitions vid `prefers-reduced-motion`, ingen horisontell scroll.

**2. Render-varv (3 fulla + 2 stateverifieringar)**
- **r1:** hittade bottenlinjerade kortkroppar (fula gap i kort 1 och 3) → topp-flöde; byggde statehjälpare eftersom statisk shot inte visar interaktionen.
- **r2 + state-shots:** flow-on/hm-lägena verifierade (check-ring, tag, lyft, neutral hm-yta); hittade att kort 2:s lyft drog med sig 2→3-connectorn 4 px ur linje med ring 3.
- **r3 + state-shots:** kompensation `top: 53px` i flow-on (med mobil-guard, eftersom specificiteten annars slog sönder den vertikala connectorn) → linjen möter ring 3:s mitt; slutligen pixel-/computed-style-verifiering att teal-draget faktiskt renderas (transform matrix(1,…), teal gradient, z-index över grå).
- Impeccable-hookens två kvarvarande fynd är klassade som falska positiver: `single-font` = Ampys brandlag (endast Outfit, viktkontrast bär hierarkin); `layout-transition` pekar nu på `grid-template-rows`-övergången, vilket är exakt tekniken hookens egen vägledning rekommenderar. Max-height-animeringen den ursprungligen fann är fixad.

**3. Kvarstående tveksamheter**
- Kort 3 har mest luft i botten på desktop (3 punkter mot kvittots höjd) — medvetet lugn, men en subrad per punkt kunde balansera; avstod eftersom det vore ny copy utöver wireframen.
- "Elcentral + installation" bryter på två rader i kvittot på alla bredder (kortets inre ~226 px medger inte en rad med pillen) — ser avsiktligt ut men ACF-radnamn per tjänst kan bli längre; radbrytningen bör QA:as per tjänstesida.
- "Nästa steg"-pillen på mobil överlappar den vertikala connectorns slutpunkt något (läsbart, men värt ett ägaröga).
- CTA-länken "Begär offert med ROT inräknat" pekar på `#` — måltavla (/offert/ eller per-sida-ankare) är ett känt [GAP] för hela blocket.

## Granskarens punchlista

All lenses examined — code read in full, all four svarskombinationer verifierade i JS-logiken, default/ok/hm-states renderade och granskade på desktop + mobil, jämfört mot guldstandarden och dagens block. Punchlistan:

---

## PUNCHLISTA — d3-processen-som-verktyg.html

### P0 (måste fixas)

1. **Kvittots pengarader bryter kontrastramen (hård ram: ≥4.5:1).** `.receipt .row.deduct .amt` ("−30 %", 15px/700) och `.receipt .total .t-label` ("DITT PRIS EFTER ROT", 13px/800) är teal #00a991 på vitt = **2,97:1** — underkänt för liten text, och det är blockets viktigaste fakta. Fix inom paletten: sätt `-30 %` i `var(--navy)` och ge den en teal-soft-chip (`background: var(--teal-soft); border-radius: 999px; padding: 2px 10px;`) så teal-signalen behålls som yta i stället för textfärg; sätt `.t-label { color: var(--navy); }` och låt teal-markeringen i totalraden bäras av den befintliga 2px navy-topplinjen + beloppet i navy 700. (Obs: vit-på-teal i CTA/`next-tag` och teal-eyebrow faller tekniskt också under 4.5:1, men det är sajtbrett brand-precedens från live och guldstandarden — ägarnivåbeslut, inte denna fils defekt. Kvittoraderna är nya och trivialt fixbara.)

### P1 (bör fixas)

2. **Kort 3:s döda yta + wireframens bottenankare tappades.** W3 hade `.card .body { margin-top: auto; }` — d3 släppte det, så "Vi gör resten"-punkterna svävar högt med ~150–180px tomrum under (växer i flow-on-läget när kort 1 får besked). Dessutom ligger `.points .sub-p` som **död CSS** (definierad, aldrig använd) — beviset på att underrader var planerade. Fix: återinför `.card .body { margin-top: auto; }` (kort 1 opåverkat — det är högst) och öka `.points { gap: 16px }`; alternativt aktivera `.sub-p` med candour-säkra underrader (kräver copy-grind — inga nya sakpåståenden utan ägare).

3. **Beskedets fade är död kod — blockets nyckelögonblick animerar bara till hälften.** `render()` sätter `className='verdict ok show'` och `innerHTML` i samma frame → `.inner` föds med `.show` redan på föräldern och hoppar in på opacity 1 utan fade (endast grid-rows-höjden animerar). Byte ok↔hm sker helt abrupt. Fix: behåll `.clip/.inner` permanent i DOM och byt bara textContent + klass, eller tvåfas: sätt innerHTML → `requestAnimationFrame(() => verdict.classList.add('show'))`. Detta är skillnaden mellan "premium reveal" och "pop".

4. **Totalradens radbrytning ser oavsiktlig ut.** "DITT PRIS EFTER ROT" bryter till två rader och `align-items: baseline` hänger beloppet i första radens baslinje — kvittots tyngsta rad är dess visuellt svagaste. Fix: `.receipt .total { align-items: center; }` + `.t-label { line-height: 1.25; }` — då läses tvåradslabeln som avsiktlig stack med beloppet optiskt centrerat.

### P2 (nice)

5. **Mobilrubrikens rag:** "vägen" hamnar ensamt på rad 4 (390px). Fix: `h2 { text-wrap: balance; }` — gratis förbättring, degraderar snyggt.
6. **Connector 1→2 pekar 4px fel i flow-on:** kort 2 lyfts −4px men linjen på `.card--1` ligger kvar på `top:49px` (2→3 kompenserades, 1→2 glömdes). Fix: `.flow-on .card--1::after, .flow-on .card--1::before { top: 47px; }` eller luta med liten `rotate(-2deg)` — alternativt acceptera (knappt synligt på 30px).
7. **Ghost-CTA:n ärver teal-glöd vid fokus:** `.cta:focus-visible` lägger `0 12px 28px rgba(0,169,145,.5)` även på tel-knappen som annars saknar skugga. Fix: egen `.cta.ghost:focus-visible { box-shadow: var(--ring); }`.
8. **Flow-on är osynligt för skärmläsare:** "Nästa steg"-mekaniken är rent visuell (`aria-hidden`). Beskedstexten bär redan innebörden ("det räknar vi ut i offerten") så det är acceptabelt — men att appendera "Nästa: begär offert." i ok-beskedet skulle ge SR-användare samma riktning.
9. **Toggle-semantik:** ja/nej som `aria-pressed`-par funkar, men `role="radiogroup"` + `role="radio"`/`aria-checked` vore ärligare semantik för ett antingen-eller-val.
10. **Produktionsgrindar (utanför designens skuld):** `href="#"` på primär-CTA (ska till /offert/-grind), och ACF-raden "Elcentral + installation" är tjänstesid-specifik — per-tjänst-radens grind från wireframen gäller fortfarande.

### Vad som är STARKARE än wireframen (för balansens skull)
Ring-1-i-teal som "börja här"-signal, den ritade teal-connectorn + kort-2-lyftet + NÄSTA STEG-taggen vid grönt besked är en riktig signaturmekanik wireframen bara antydde; ja/nej-segmenten, den ärliga vita "Nej"-stylingen, och besked-copyn är intakta och candour-rena. Utan interaktion kommunicerar blocket ändå allt (ingen låst yta) — rätt val för position 2. Sanningslinsen är helt ren: 30 %, 70 %, 50 000 kr/person och år, inga uppfunna siffror, hedges intakta i båda beskeden.

---

## TOTALOMDÖME: **NÄSTAN**

Strukturen, mekaniken och rösten håller premium — detta är tydligt över dagens block och i nivå med guldstandardens språk. Men kvittot, som ÄR blockets värdeerbjudande, bär tre av fynden (kontrast-P0, radbrytningen, chip-fixen) och nyckelanimationen är halvdöd. Fixa #1–#4 (uppskattningsvis <1 h) → PREMIUM.

Fil: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d3-processen-som-verktyg.html · Renderingar: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d3-processen-som-verktyg-review-{desktop,mobile}.png + d3-state-{ok,hm}-{desktop,mobile}.png

## Fix-agentens stängning

Alla states verifierade. Slutlig ögonbesiktning: kvittots chip och totalrad läses avsiktliga och navy-tunga, kort 1:s frågor sitter åter tätt under rubriken i default, kort 2+3 bottenankrade, hm-beskedet ärligt grått utan flow-on, mobil-ok visar tänd bock + tecknad teal-connector + NÄSTA STEG utan lyft. Klart.

---

## RESULTAT

**Stängda punkter:**

- **P0 #1 (kvitto-kontrast)** — `−30 %` nu navy #090b32 på teal-soft-chip (999px, 2px 12px) — tealen behålls som yta, texten klarar kontrast; `.t-label` → navy. CTA/next-tag/eyebrow lämnade orörda per punchlistans eget ägarnivå-undantag.
- **P1 #2 (kort 3 döda ytan)** — bottenankare återinfört, men **skopat till `.card--2 .body, .card--3 .body`** (inte alla kort som wireframen): render-loopen avslöjade att globalt `margin-top:auto` flyttade hålet till kort 1 i default-läget (kort 2 är högst före besked) och lossade frågorna från sin rubrik. Död `.sub-p`-CSS borttagen (aktivering är copy-grindad — inga nya sakpåståenden utan ägare), `.points` gap 13→16px.
- **P1 #3 (död fade)** — `.clip/.inner` ligger nu permanent i DOM; JS byter bara typklass + innerHTML och lägger `.show` via dubbel-rAF → beskedet fadar in på riktigt. Byte ok↔hm fäller ihop + fadar ut det gamla (300 ms, matchar `--normal`) innan det nya fadas in; `prefers-reduced-motion` ger 0 ms delay. Race-säkrat med clearTimeout + no-op vid samma state.
- **P1 #4 (totalradens brytning)** — `align-items: center` + `t-label line-height: 1.25` → tvåradslabeln läses som avsiktlig stack med beloppet optiskt centrerat (bekräftat i render).
- **P2 #5** — `text-wrap: balance` på h2 (mobilrubriken bryter nu 3 balanserade rader).
- **P2 #6** — `.flow-on .card--1::after/::before { top: 47px }` desktop + `top: auto`-override i mobil-media så lodräta linjen inte påverkas.
- **P2 #7** — `.cta.ghost:focus-visible { box-shadow: var(--ring) }` — ingen ärvd teal-glöd.
- **P2 #8** — sr-only-span " Nästa steg: begär offert." appendad i ok-beskedet (aria-live läser upp den; visuellt oförändrat).

**Lämnade punkter:**

- **P2 #9 (radiogroup-semantik)** — lämnad medvetet: `aria-pressed`-toggleparet är giltig APG-semantik; ett halvbyggt radiomönster utan roving tabindex + piltangentsnavigation vore sämre för tangentbordsanvändare än dagens fungerande knappar.
- **P2 #10 (produktionsgrindar)** — `href="#"` och per-tjänst-ACF-raden är ägar-/integrationsnivå (offert-URL + Bricks-mappning), inte denna fils designscope; grindarna kvarstår som i wireframen.
- **Impeccable-hookens single-font-fynd** — falsk positiv: hårda ramen kräver enbart Outfit; viktkontrast bär hierarkin (Ampy-identiteten är lag). Ingen ignore persisterad utan ägarbekräftelse.

**Render-loop:** 2 varv körda — varv 1 fångade en riktig regression (kort 1-hålet från oskopat bottenankare) som fixades; varv 2 + tre state-renders (ok-desktop, ok-mobil, hm-desktop) bekräftar alla fixar utan regressioner. Ingen candour-copy ändrad, inga nya färger.

Fil: `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d3-processen-som-verktyg.html`
Renders: `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d3-processen-som-verktyg-final-{desktop,mobile}.png` + `d3-final-state-{ok-desktop,ok-mobile,hm-desktop}.png`

**Slutstatus: PREMIUM** — kvittot (blockets värdeerbjudande) bär nu sina fakta i full kontrast, nyckelanimationen lever i båda riktningarna, och alla tre kort är balanserade i samtliga states på både 1440 och 390.

---

# d4-ett-kort

## Designerns beslut

LEVERABEL: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d4-ett-kort.html
RENDERS: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d4-r1..r3-*.png (desktop+mobile × default/q2/ja/nej + picked/focus-mikrostates)

(1) DESIGNBESLUT
- Scenen: verktyget är ett inre offwhite-kort (1px line-border, 22px radius) inne i det vita sektionskortet, med en knappt synlig radial teal-tint (5,5 % alpha) vid toppen — app-känsla utan ny färg. Fast min-height 324px så kortet inte hoppar mellan fråga 1↔2.
- Progress: iOS-typ prickar där aktiv prick sträcks till 22px-pill (width-animation medveten: 3 små absoluta element, ingen layout-thrash; scaleX skulle deformera radien) + diskret "1 / 2"-räknare uppe till höger som försvinner på resultatet.
- Ja/Nej-knapparna: 190×60px pillerknappar, hover = teal kant + lyft + mjuk teal skugga, active = scale(.97), och en 180 ms "picked"-blixt (teal fyllning, vit text) innan face-bytet — bekräftelsen är njutningen. Vid reduced-motion hoppas blixten över helt.
- Face-övergång: 250 ms fade+10px translateY med ease-out, inget mer.
- Payoff-facet: verdikt med teal check-medaljong (skugga = shadow-teal) → kvittot som vitt elevated kort med streckade radavgränsare; totalraden är en NAVY-platta med vit versal-etikett "Ditt pris efter ROT" och beloppet "70 % av arbetet" i teal-bright (#1cc4af på #090b32 ≈ 8:1). −30 % ligger i teal-soft-chip med navy text (AA-säkert; ren teal-text på vitt är bara ~3:1 och undveks därför för småtext). Raderna staggas in 260 ms/70 ms delay.
- Nej-vägen: neutral (ingen varningsfärg — inga nya färger), ärligt besked + fetstilat "Hör av dig så tittar vi på ditt fall.", kvittot döljs, CTA + telefon står kvar under.
- Statisk bärighet (riktningens kända risk): eyebrow "ROT-avdrag 2026", H2, sub, CTA-paret och processraden ligger ALLA utanför kortet — icke-interagerande besökare får fortfarande hela erbjudandet + processen.
- Processen: en rad med teal-ringade nummer (navy siffra, AA) + streckade connectors som ekar dagens live-block; staplas vänsterställt på mobil.
- A11y: riktiga <button>, aria-live="polite" på resultat-facet, programmatisk fokus till frågerubriken vid face-byte, focus-visible = teal kant + 3px teal-ring (verifierad synlig), tel:-länk, 44px+ tryckytor överallt, prefers-reduced-motion dödar allt.
- Copy: wireframens candour-copy behållen ordagrant; enda ändringarna är totaletiketten till kanon "Ditt pris efter ROT" och finstilten "Avdraget dras direkt på fakturan. Taket är 50 000 kr per person och år." Ett "!" totalt (Troligen ja!).

(2) RENDER-VARV: 3 varv, 16 screenshots granskade.
- Varv 1 (default+q2+ja+nej, båda viewports): hittade (a) navy-totaletiketten bröt fult bredvid beloppet på mobil, (b) H2-accenten "30 % ROT?" bröts mitt i på 390px, (c) "Osäkert"-ikonen för svag, (d) död yta i kortet.
- Varv 2: fixade a–d (totalrad staplas på mobil med beloppet 19px teal-bright, accent nowrap → hel rad 2, större utropsglyf, min-height 348→324). Allt verifierat i nya renders.
- Varv 3 (mikrostates): picked-blixten verifierad snygg mid-transition; fokusringen visade sig OSYNLIG i screenshot — computed-style-debug avslöjade att det var mid-transition-interpolation + för låg alpha; höjde ringen till 40 % alpha + teal kant vid focus-visible och verifierade computed rgba(0,169,145,.4) 0 0 0 3px + synlig i crop.

(3) KVARSTÅENDE TVEKSAMHETER
- Impeccable-hookens 2 fynd är klassade som avsiktliga false positives: single-font (Outfit-only är Ampy-lag, viktkontrast bär hierarkin) och width-animationen på prickarna (3 småelement, transform skulle deformera pillformen). Ingen ignore persisterad — ägargrind.
- Kvitto-raden "Elcentral + installation" är hårdkodad; på de 21 andra tjänstesidorna måste raden parametriseras per tjänst (samma GAP som i wireframen).
- Kortets höjd hoppar (324→~590px) vid resultatet; medvetet ohanterat (höjdanimation = layout-thrash), fade täcker det, men värt ett ögonkast i verklig sidkontext med innehåll under blocket.
- CTA href="#offert" är placeholder; tel:0102657979 är riktig.
- Dubbelklick på Ja/Nej under 180 ms-blixten kan trigga answer två gånger — ofarligt (idempotent goto_) men en debounce vore prydligare i produktionsporten.

## Granskarens punchlista

PUNCHLISTA — d4-ett-kort.html (granskning med färska ögon; renderad + interagerad: start/q2/ja-ja/nej-vägar, desktop 1440 + mobil 390)

**P0 — måste fixas**

1. **aria-live-beskedet annonseras aldrig (JS, rad 356–361 + 299).** `#f3` har `aria-live="polite"`, men `renderResult()` skriver texten MEDAN facet är `display:none`, och sedan visas hela regionen. Skärmläsare annonserar inte innehåll som togglas in via display — kravet "aria-live på beskedet" är i praktiken inte uppfyllt. Dessutom: `goto_(3)` letar efter `.q-big` som inte finns i f3 → fokus dör på `<body>` när knappen användaren just klickade försvinner. Fix: (a) lägg `role="status" aria-live="polite"` på en ALLTID synlig wrapper (t.ex. direkt på `.tool` eller en tom announcer-div), och skriv beskedstexten EFTER `goto_(3)` i `requestAnimationFrame`; (b) ge `#vTitle` `tabindex="-1"` och fokusera den i goto_ när n===3.
2. **Tryckytorna på "← Ändra förra svaret" / "← Gör om kollen" är ~32 px** (`.back`: padding 6px 10px, 13.5px text) — hårda ramen kräver ≥44 px. Fix: `.back { min-height: 44px; padding: 10px 14px; display: inline-flex; align-items: center; }`.
3. **Progressen motsäger sig själv: 3 prickar men räknaren säger "1 / 2".** Samma widget visar två olika totaler i varje skärmbild. Fix: ta bort tredje pricken (resultatet är inget "steg" — behåll `d1`/`d2` och låt båda bli `on` på resultatet), eller skriv "1 / 3". Rekommendation: 2 prickar + behåll "1 / 2".

**P1 — bör fixas**

4. **`.stepcount` i `--faint` (#8a90ac) på offwhite ≈ 3,0:1** — under 4.5:1-kravet för text. Fix: `color: var(--muted)` (#565e82 ≈ 5,4:1).
5. **Race i `answer()` (rad 361):** under 180 ms-fördröjningen kan användaren hinna klicka den andra knappen (två köade timeouts, dubbelt `goto_`) eller "← Ändra förra svaret" (varpå den väntande timeouten ändå hoppar till resultatet). Fix: sätt `disabled` på båda knapparna i `answer()` (goto_ tar bort det), eller spara timeout-id och `clearTimeout` i `goto_`.
6. **"Osäkert"-facet är visuellt tunt på desktop:** 324 px-kortet innehåller två textrader och stor tomyta; "Hör av dig" kopplar inte till telefonen. Fix: lägg en liten tel-länk-rad i osäkert-facet (`<a href="tel:...">010-265 79 79</a>` i teal, ≥44 px) så beskedet landar i en handling — och/eller sänk `min-height` till ~280 px i resultatläget.
7. **"Elcentral + installation" är hårdkodad i kvittot** — blocket ska ligga på 22 tjänstesidor; på 21 av dem blir raden osann. Fix: markera raden som mall-variabel (`data-service`-slot + kommentar/[GAP]-not i leveransen), t.ex. `<span data-slot="tjanst">Elcentral + installation</span>`.

**P2 — nice**

8. `href="#offert"` är placeholder — måste pekas på riktig offert-anchor/URL per sida vid Bricks-mappning (leveransnot, inte designfel).
9. Utropstecken-ikonen på "Osäkert." läser som varning; ett neutralt "?" i samma cirkel matchar det hedgade beskedet bättre.
10. SR-orientering: lägg visually-hidden "Fråga 1 av 2" i respektive face (prickarna är aria-hidden och räknaren okopplad).
11. `.fine` i vikt 300 vid 13 px är på gränsen läsbart — vikt 400 vid 13 px, eller behåll 300 men 14 px.
12. Hårdkodade hex i verdict-SVG:erna (#fff, #565e82) + `:root` duplicerar tokens.css i stället för att peka på ap*-namnen — ok i fristående mock, notera inför produktionsporten.
13. Utan JS visas bara fråga 1 med döda knappar och kvittot aldrig (wireframens egen flaggade risk). CTA + processraden bär blocket statiskt, så acceptabelt — men en `<noscript>`-visning av kvittot vore billig försäkring.

**Styrkor (behåll):** kvittots hierarki är blockets bästa yta — navy-totalrad med teal-bright-belopp, offert-pillen i streckad ram ("Begär offert ÄR priset" läses exakt rätt), staggered reveal ≤300 ms, prick-morfen, ja/nej-knappar 60 px med teal-picked-state. Copy 100 % candour-intakt: hedges ("Troligen", "beror på din skatt", "kräver normalt"), endast kanonsiffror (30 % / 70 % / 50 000 kr), "!" doserat (1 st). Klart starkare än wireframen på alla ytor; processraden-som-en-rad är en lyckad kokning av dagens 3-kolumnsblock.

**TOTALOMDÖME: NÄSTAN.** Den visuella nivån ligger nära guldstandarden (kvittot är premium), men P0:erna är verkliga: beskedet — blockets hela payoff — når aldrig skärmläsare, fokus tappas vid övergången, back-knapparna missar tryckyte-kravet och progressindikatorn motsäger sig själv. Fixa 1–3 (+ helst 4–6) så är det PREMIUM.

Granskade filer: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d4-ett-kort.html · skärmdumpar i /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/ (d4-ett-kort-review-*.png + d4-state-{q2,ok,nej1,nej2}-{desktop,mobile}.png, statescript: designs/shot-states-d4.mjs)

## Fix-agentens stängning

PUNCHLISTA STÄNGD — d4-ett-kort.html

**Stängda punkter**

- **P0-1 (aria-live + fokus):** Ny ALLTID synlig announcer (`<p class="sr-only" role="status" aria-live="polite" id="announce">` direkt i `.tool`, aldrig display-togglad). Beskedet skrivs dit via dubbel `requestAnimationFrame` EFTER `goto_(3)`; texten inkluderar besked + "70 procent av arbetet" (ok) resp. tel-numret (osäkert), och töms vid restart/back. `#vTitle` har `tabindex="-1"` och fokuseras i `goto_` när n===3 — verifierat funktionellt: `document.activeElement.id === "vTitle"` efter resultat, announcer-text satt.
- **P0-2 (tryckytor):** `.back` nu `min-height:44px; padding:10px 14px; inline-flex` — uppmätt 151×44 px i Playwright.
- **P0-3 (progress-motsägelse):** Tredje pricken borttagen; 2 prickar + "1 / 2"-räknaren kvar. Vid resultat: båda prickarna `on`, ingen `now`, räknaren släcks. Verifierat i alla skärmdumpar.
- **P1-4:** `.stepcount` → `var(--muted)` (#565e82, ≈5,4:1).
- **P1-5 (race):** Båda knapparna `disabled` i `answer()` (återställs i `goto_`), timeout-id sparas och `clearTimeout` körs i `goto_`. Testat: dubbelklick på Ja+Nej → ett svar registrerat; svar+direkt-back → väntande hopp till resultatet avbryts, f1 visas.
- **P1-6 (tunt osäkert-facet):** Ny tel-länk `#vTel` (44 px, teal-outline pill med lur-ikon) visas ENDAST i osäkert-fallet — beskedet landar nu i en handling och kortet känns inte tomt.
- **P1-7 (hårdkodad tjänsterad):** `<span data-slot="tjanst">` + `[MALL]`-kommentar i HTML: raden är mallvariabel per tjänstesida, "Elcentral + installation" = platshållare för elcentral-sidan.
- **P2-9:** "!"-ikonen ersatt med neutralt "?" i samma cirkel — matchar det hedgade beskedet.
- **P2-10:** Visually-hidden "Fråga 1 av 2:" / "Fråga 2 av 2:" i respektive q-big.
- **P2-11:** `.fine` 13→14 px (vikt 300 behållen).
- **P2-13:** `<noscript>`-style: frågespelet göms, kvittot visas statiskt (verifierat med JS avstängt: f3=flex, f1=none, receipt=block) — CTA + processrad bär blocket.

**Lämnade punkter**

- **P2-8** (`#offert`-placeholder): leveransnot, pekas per sida vid Bricks-mappningen — inte ett designfel att åtgärda i mocken.
- **P2-12** (hex i verdict-SVG:er + :root-dubblering av tokens.css): ok i fristående mock per granskarens egen notering; noteras inför produktionsporten.
- Impeccable-hookens två fynd klassade som avsiktliga: prick-bredds-morfen (7→22 px) är granskarens uttalade styrka att behålla, och enbart Outfit är Ampy-lag (viktledd hierarki).

**Candour:** ingen copy ändrad i mindre ärlig riktning — alla hedges, kanonsiffror (30 %/70 %/50 000 kr) och det enda "!" intakta; announcer-texten återger beskedet ordagrant.

**Render-loop:** 2 varv körda — `screens/d4-fix-r1-*` + alla fyra tillstånd (`d4-state-{q2,ok,nej1,nej2}-{desktop,mobile}`) + funktionstest (race/fokus/announcer/noscript) + slutrender `screens/d4-ett-kort-final-{desktop,mobile}.png`, samtliga lästa och besiktade. Inga regressioner: kvittots hierarki, staggered reveal, picked-state och processraden orörda.

**SLUTSTATUS: PREMIUM.** Alla P0 + alla P1 stängda, 4 av 6 P2 dessutom; beskedet når skärmläsare, fokus följer flödet, tryckytor ≥44 px, progressindikatorn är konsekvent, osäkert-beskedet landar i ett samtal.

Fil: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/d4-ett-kort.html
Skärmdumpar: /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/screens/d4-ett-kort-final-{desktop,mobile}.png + d4-state-{q2,ok,nej1,nej2}-{desktop,mobile}.png
---

# FAMILJEKONTRAKT (sprint-final 2026-08-15 — uttalade regler, inte fotnoter)

Gäller alla fyra: `d2-kvittot-forst.html` (bas) · `gt-produkt.html` · `gt-generisk.html` · `hemforsakring.html`.

1. **CSS-basen är helig.** `<style>`-blocket ska vara diff-identiskt i alla fyra. En basändring speglas ordagrant i syskonen, alltid i samma commit.
2. **CTA-formen (paritetssvep P2-4).** Familjeformen är "Begär offert med X inräknat". GT-blocken kör medvetet den kortare "Begär offert med Grön Teknik": fullformen mäter 274px i sajtens 16px/500 nowrap och spiller 28/46/53px @390/345/320. Hemförsäkringen kör "Ring oss på 010-265 79 79" (akut kontext, telefon primär — faktabas §2). Ny CTA-text kräver ALLTID ett 320–480-omsvep före merge.
3. **Kvittorad 1:s värde är alltid en pill** (`.offert-pill`): "Skräddarsydd offert" / "[X] kr" (grindat belopp) / "Prisbesked på telefon". Ger identisk radhöjd (63,8px @1440) i hela familjen.
4. **Den stora teal-klädseln på avdragsraden (`.r-row.deduct .amt`, 20px/700) är reserverad för kanonsatser** (−30 % / −50 %). Hedgad text får aldrig bära den — hemförsäkringens "kan ersätta en del" renderar i normalvikt.
5. **Tillgängligt sektionsnamn via `aria-labelledby` mot H2:ns id** (`rot-h2`/`gt-h2`/`hf-h2`) — aldrig hårdkodad `aria-label` (den divergerar från slottade H2:or).
6. **Sekundärlänken under CTA:n:** `.tel` för telefonnummer, `.sec-link` för annan rutt — identisk stil, ärliga klassnamn.
7. **Preview-etiketten:** "Blockfamiljen · <blocknamn>", avdelare `·` (aldrig em-dash i renderad UI), länk "← blockfamiljen" → `familj.html`.
8. **Ordbudget (ägardirektiv):** ROT-blocket är referensen — stegparagrafer ≈ 1–2 korta meningar (grind 150 % av basens ordtal), panelnot ≈ 1 rad, finstilt ≤150 % av basens. Hemförsäkringens riskklass trimmas i ORD, aldrig i sanning.

## Paritetsgrindarna (de tre som måste vara gröna före leverans)

| Skript | Jämför | Fångar |
|---|---|---|
| `_leveransparitet.mjs` | levererad CSS mot designens egen, 21 mått × 17 bredder × 4 filer | att bygget av CSS:en ändrat rendering |
| `_phpparitet.mjs` | PHP-utdata mot godkänd design, samma mått | att shortcoden renderar annorlunda än designen |
| `_domparitet.mjs` | DOM-trädet nod för nod: taggar, klasser, attribut, textnoder | *vilken nod* som skiljer — skrevs efter av-lbl-buggen, som mätgrinden bara kunde säga "+31,5 px" om |

Övriga `_*.mjs` är engångssonder från djupauditen. De är kvar som bevisspår för
`handover/AUDIT-punchlista.md` — varje fynd där går att mäta om.
