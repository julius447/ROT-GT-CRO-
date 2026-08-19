Alla mätningar nedan är mina egna, körda i Chromium/Playwright från `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs`. Två harnesser: **preview** (filerna som de ligger) och **produktion** (ampy.se:s riktiga CSS, 389 200 B ur 26 sheets i dokumentordning + riktig `<body class="…brx-body bricks-is-frontend brx-wide">` + riktig live-markup, blocket inklistrat som Bricks Code-element). Skript: `_cons-1.mjs` … `_cons-8.mjs` i designs/ + harnessbyggarna i `/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/` (`mkhost.py`, `mkpage.py`, `mkpage2.py`, `nsproof.py`).

---

# A. EXEKUTIV SAMMANFATTNING

**43 unika fynd efter deduplicering** (från ~110 rapporterade poster i de sex auditerna): **6 P0 · 18 P1 · 19 P2**. Dessutom **8 påståenden som jag underkänner eller nedgraderar** efter egen mätning — två av dem är farliga att följa.

| Nivå | Antal | Varav riskfria för utseendet | Varav ägargrind (ändrar godkänd rendering) |
|---|---|---|---|
| P0 | 6 | 4 | 2 |
| P1 | 18 | 11 | 7 |
| P2 | 19 | 18 | 1 |

### De tre största riskerna

**1. CTA:n är trasig på de vanligaste svenska telefonbredderna — och den är VÄRRE i produktion än någon auditör mätte.** Ingen av de sex körde CTA-mätningen mot sajtens riktiga CSS. Preview säger att d2 spiller −5,16 px vid 320. I produktion är det **−25,17 px vid 320 och fortfarande −2,80 px vid 375** (iPhone SE / 12 mini / 13 mini). gt-generisk −20,08 @320, hemförsäkring −14,67 @320. Orsaken är att blocket är 43 px smalare i produktion än i previewn vid samma viewport. Skärmdump: `scratchpad/BEVIS-cta-375-produktion.png` — "B" i "Begär" ligger utanför gradienten.

**2. Blocket skriver om 81 % av värdsidan.** Uppmätt computed-diff på ampy.se:s egna element, ren sida vs sida med blocket: **1 035 av 1 277 element ändras** (font-family 998, line-height 803, color 617, outline-color 617, margin 62, padding 8, max-width 13, text-align 6 @390). Sidans `line-height` går 27,2 → 24 px överallt, `body`-padding 0 → 30/28/80 (som dessutom ökar sajtens redan befintliga horisontella overflow med 10 px vid 320-768). Detta ×278 sidor. Och: **leveransformatet avgör vem som vinner** — som Bricks Code-element ligger blockets `<style>` i `<body>` och vinner på källordning; enligt Ampys FluentSnippets-kontrakt enqueueas CSS i `wp_head` och då **förlorar** blockets `h2`/`h3` mot temat. Samma kod, motsatt utfall.

**3. Produktion är redan idag INTE den pixelgodkända renderingen — så "rör inte godkänt utseende" och "laga produktion" står mot varandra.** Blockets `@font-face` pekar relativt (`../assets/fonts/…`) och 404:ar på varje sida utom rot-nivån. Sajten deklarerar `Outfit` som **nio diskreta vikter** (100…900), aldrig ett `100 900`-intervall — så ägarordern 450/550 renderas som **500/600**. Uppmätt: d2 H2-bläck 579,39 px (godkänt) → 581,81 px (produktion). Dessutom är blocket 43 px smalare på mobil, gt-produkts H2 bryter till **två rader** i produktion mot en i previewn, och vänsterspalten är **307 px mot panelens 456 px** vid 1024. Två av mina fixar ÅTERSTÄLLER det godkända; sju BRYTER det och måste grindas.

### Namespacing-refaktorn: bevisat pixelneutral (och grinden är obligatorisk)
Jag byggde en mekanisk namespace-transform av alla fyra filerna och körde två grindar:
- **Paritet:** 21 mätvärden × 17 bredder (320-2560) × 4 filer = **1 428 mätningar, 0 avvikelser.**
- **Läckage:** värdsidans element ändrade **1 035 → 0** (@1440 och @390).

Men första försöket gav **135 paritetsavvikelser** — orsak: EN kvarlämnad `body { padding: 18px var(--edge) 56px }` inuti en media query. Efter omdöpningen var `--av-edge` odefinierad på `body`, och `var()` utan fallback blir "invalid at computed-value time" → padding **0**, blocket 20 px bredare på mobil, tyst. Det är exakt den fällan WP-KOLLISION anade. **Refaktorn utan mätt paritetsgrind är inte genomförbar.**

---

# B. RANKAD PUNCHLISTA

Riskkolumnen: **RISKFRI** = renderingen är bit-identisk · **ÅTERSTÄLLER** = produktion avviker idag, fixen tar den tillbaka till det godkända · **⚠ ÄGARGRIND** = ändrar pixelgodkänd rendering.

## P0 — bryter i produktion eller på någon målenhet

### P0-1 · CTA-texten renderas utanför knappen 320-375 px i produktion
**Fil/rad:** `.cta { white-space: nowrap }` d2:319 · gtp:353 · gtg:355 · hf:377, mot `@media (max-width:900px) .cta { width:auto; max-width:100%; padding:11px 24px }` d2:452 · gtp:466 · gtg:468 · hf:505.
**Bevis** (`_cons-3.mjs`, produktionsharness, bläckets ytterkant → knappens border-box, avsedd padding 24 px):

| bredd | d2 | gt-generisk | hemförsäkring | gt-produkt |
|---|---|---|---|---|
| 320 | **−25,17** | **−20,08** | **−14,67** | +3,50 |
| 344 | **−13,67** | **−8,58** | **−3,17** | +15,00 |
| 360 | **−10,00** | **−4,91** | +0,50 | +18,67 |
| 375 | **−2,80** | +2,30 | +7,70 | +24 |
| 390 | +4,39 | +9,48 | +14,89 | +24 |

Preview-siffrorna (`_cons-1.mjs`) är mildare (d2 −5,16 @320, +6,84 @344) — **produktionsmätningen är den giltiga**. Rotorsaken är att fixen `width:100%` bara finns i `@supports not (container-type: inline-size)` (d2:375 m.fl.), och `CSS.supports('container-type','inline-size')` = **true** i både Chromium och WebKit → grenen kör aldrig (se P1-6).
**Exakt fix** (verifierad i `_cons-8.mjs`, injicerad i blockets EGEN `<style>` — inte i `<head>`, där den förlorar på källordning):
```css
@media (max-width: 430px) {
  .cta { width:100%; max-width:100%; padding:11px 14px; gap:10px;
         white-space:normal; text-wrap:balance; line-height:1.25; }
}
```
Efter fixen: **≥14 px innanför knappkanten på samtliga bredder 320-430 för alla fyra filer.** Knapphöjd 58 → 62 px där etiketten går på två rader (d2/gtg/hf 320-390, gtp endast 320).
**Risk: ⚠ ÄGARGRIND** — CTA:n blir fullbredd + tvåradig på små telefoner. Alternativ som inte griper lika brett: begränsa till `max-width: 392px`, eller sänk `font-size` till 15 px istället för att tillåta radbrytning. Ägarval.

### P0-2 · Blockets CSS är oscopad och skriver om hela värdsidan
**Fil/rad (identiskt i alla fyra):** `:root` 15 · `* { box-sizing; margin:0; padding:0 }` 54 · `html` 55 · `body` 56-62 · `a` 63 · `:focus-visible` 65 · `h2` 113 · `h2 .accent` 128/130 · `:root{--edge}` + `body{padding}` i mobil-mediat (d2 412-413) · `@media (prefers-reduced-motion){ * { animation:none !important } }` d2:461 · gtp:475 · gtg:477 · hf:516.
**Bevis** (`_cons-3.mjs`, computed-diff av 1 277 värdelement mot den riktiga ampy.se-CSS:en): **1 035 ändrade (81,0 %)** @1440, 1 033 @390. Fördelning: `fontFamily` 998 · `lineHeight` 803 · `color` 617 · `outlineColor` 617 · `margin` 62 · `padding` 8 · `maxWidth` 13 · `letterSpacing` 13 · `textAlign` 6 · `backgroundColor` 1.
Konkreta träffar: `body` padding 0 → 30px 28px 80px · bakgrund transparent → #f5f9ff · line-height 27,2 → 24 px · färg rgb(54,54,54) → rgb(15,18,60) · sajtens `h2.hero_2__section-heading` max-width 100% → 708,48 px och **text-align start → center @390** · `h2.rot__main-heading` margin-bottom 0 → 44 px · sajtknappens höjd 41,19 → 38 px (via ärvd line-height) · dokument-scrollWidth 409 → **419** @320-390 och 842 → **852** @744-768 (blocket förvärrar sajtens befintliga overflow med 10 px).
Tokenkollisioner mot sajtens egna: `--ink`, `--muted`, `--ring`, `--ease`, `--ease-out`, `--line`, `--navy` finns redan i sajtens CSS; `--ring` är dessutom Tailwind/shadcn-standard.
**Exakt fix:** hela namespace-schemat (se steg 2 i del C). Wrapper `.ampy-avdrag` bär tokens (`--av-*`), `width:100%`, `font-size:16px`, `font-weight:400`, typografibasen; `*` → `.ampy-avdrag, .ampy-avdrag *, …::before/::after`; `html{}` och `body{}` raderas (preview-krom); `a`, `:focus-visible`, `h2`, reduced-motion scopas.
**Risk: RISKFRI — bevisat.** 1 428 paritetsmätningar, 0 avvikelser; läckage 1 035 → 0.

### P0-3 · `[class^="…"]` — en enda plugin-tillagd klass spränger blocket
**Fil/rad:** `.block--wave > svg[class^="hero-w"]` d2:346 · gtp:295 **och** 335 · gtg:297 **och** 337 · hf:306 **och** 346. `.panel--dark > svg[class^="blob"]` d2:298 · gtp:313 · gtg:315 · hf:324.
**Bevis** (`_cons-2.mjs`, `host-d2-lazy.html` = de sex dekorativa SVG:erna får `class="lazyloaded …"`, precis vad FlyingPress/lazyload gör — FlyingPress kör redan på sajten): blockhöjd **691,4 → 3 482,4 px @1440** och **1 327,3 → 4 118,7 px @390**. `[class^=]` matchar hela class-attributet, inte en klass i listan. Skärmdump `scratchpad/BEVIS-lazyload-klasskrasch.png`.
**Exakt fix:** ge SVG:erna en delad klass och selektera på den — `.ampy-avdrag .av-block--wave > svg.av-wave` / `> svg.av-blob`. Faller ut gratis i namespace-passet.
**Risk: RISKFRI** (ingår i de 0 paritetsavvikelserna).

### P0-4 · `@font-face` 404:ar i produktion → vikt 450/550 renderas som 500/600
**Fil/rad:** rad 9-14 i alla fyra: `src: url("../assets/fonts/Outfit-VariableFont_wght.woff2")`. Inline `<style>` löser relativa URL:er mot **sidans** URL → `/elservice/assets/fonts/…` = 404.
**Bevis** (`_cons-3.mjs`, A/B i produktionsharnesset — enda skillnaden är fontfacet):

| fil | preview (GODKÄNT) | produktion idag | med fixen |
|---|---|---|---|
| d2 H2-bläck | 579,39 px | **581,81** | **579,39** ✓ |
| gtp `.accent` | 397,61 px | **400,88** | **397,61** ✓ |
| gtg H2 | 397,61 px | **400,88** | **397,61** ✓ |
| hf H2 | 525,47 px | **529,16** | **525,47** ✓ |

Sajtens `Outfit` är **nio diskreta `@font-face` med font-weight 100,200,…,900** (verifierat i `source/live-source-elcentral.html`), alla mot samma variabelfil. CSS font-matching ger 450→500 och 550→600. Ett `100 900`-intervall finns inte site-wide.
**Exakt fix — egen namnrymdad familj mot den URL som faktiskt svarar:**
```css
@font-face{font-display:swap;font-family:"AvdragOutfit";
  src:url("https://ampy.se/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2") format("woff2");
  font-weight:100 900;font-style:normal}
/* i blocket: font-family:"AvdragOutfit","Outfit",system-ui,-apple-system,sans-serif */
```
`curl -I` på den URL:en → **200**. Filen är redan `<link rel=preload>`:ad site-wide, så noll extra request. Egen familj (inte en site-nivå-omdefinition av `Outfit`) så vi inte påverkar sajtens övriga typografi.
**Risk: ÅTERSTÄLLER GODKÄND RENDERING.** Verifierat: exakt samma bläckbredder som previewn, till 0,00 px.

### P0-5 · Container-blindhet: layouten inverteras på surfplatte- och laptopbredder i produktion
**Fil/rad:** `.grid { grid-template-columns: minmax(0,1fr) clamp(466px,33vw,530px) }` rad 98 · `--pad-x/--pad-y` 49-50 (`4.4vw`/`5.4vw`) · `gap: clamp(48px,5.5vw,96px)` 99 · `--panel-pad-x: clamp(24px,2.2vw,32px)` 193/195. Allt mäts mot **viewporten**; i produktion klämmer `.brxe-container{width:1280px}`.
**Bevis** (`_cons-2.mjs`, riktig Bricks-container):

| viewport | blockbredd | **vänsterspalt** | panel | kommentar |
|---|---|---|---|---|
| 1024 (iPad Pro liggande) | 899,3 | **307,2** | 456 | vänsterspalten smalare än kvittot |
| 1112 (iPad Pro) | 985 | **372,8** | 467 | inverterad |
| 1180 (iPad Pro) | 1 049 | **412,2** | 466 | inverterad |
| 1280 | 1 144,8 | 493,8 | 466 | jämnt men trångt |
| 1600 | 1 280 | **521,2** | 528 | vänsterspalten KRYMPER när skärmen växer |
| 1920 | 1 280 | **492** | 530 | preview visar 934 px här |

Skärmdump `scratchpad/BEVIS-1024-vansterspalt-krossad.png`: varje steg-H3 bryter till två rader, ~150 px död yta under panelen. 1024/1112/1180 står uttryckligen i kravbilden.
**Exakt fix** (verifierad i `_cons-8.mjs` i produktionsharnesset):
```css
.block { container-type: inline-size; container-name: rotblk; }
.block { padding: clamp(44px,5.4cqi,100px) clamp(24px,4.4cqi,80px); }
.block .grid { grid-template-columns: minmax(0,1fr) clamp(466px,33cqi,530px); gap: clamp(48px,5.5cqi,96px); }
.panel { --panel-pad-x: clamp(24px,2.2cqi,32px); }
@container rotblk (max-width:1064px){ .block .grid{ grid-template-columns:minmax(0,1fr) clamp(456px,42cqi,500px); gap:44px } }
@container rotblk (max-width:944px) { .block .grid{ grid-template-columns:1fr; gap:56px; max-width:700px; margin-inline:auto } }
```
Uppmätt efter: 1024 vänsterspalt 307,2 → **700** (staplat), 1112 372,8 → 700, 1180 412,2 → 700, 1920 492 → **590,5**, panelens innerbredd 401,87 → 413-415 på laptopbandet (löser även P1-2). `:root{--edge}` och body-padding MÅSTE förbli viewport-`@media`.
**⚠ VARNING:** regelblocket måste skrivas in på rätt plats i kaskaden. Klistrad sist överskrev den `@media (max-width:900px){ .block{ padding:28px 16px } }` → panelens innerbredd 263 → **227 px @390**. Det är en oavsiktlig mobilregression som paritetsgrinden fångar.
**Risk: ⚠ ÄGARGRIND** — layouten staplas nu vid 1024-1180 istället för att stå i två spalter, och blocket blir högre där.

### P0-6 · Dubblett-id över filerna → fel tillgängligt namn när två block delar sida
**Fil/rad:** `id="pcap"` d2:520 · gtp:596 · gtg:553 · hf:657 — **samma id i alla fyra**. `id="gt-h2"` i både gtp:546 och gtg:508.
**Bevis** (`_cons-1.mjs` textinventering + `_cons-2.mjs` `host-two.html` med d2 + gt-produkt på samma sida): `dupIds: ['pcap×2']`. Båda panelernas `aria-labelledby="pcap"` löser till FÖRSTA träffen → GT-panelen annonseras som "Så räknas ROT". Kräver inte samma fil två gånger — en /elservice/-sida med ROT-block + GT-block kolliderar direkt.
**Exakt fix:** instansunika id i PHP-shortcoden (`id="<?= $uid ?>-cap"` + matchande `aria-labelledby`), eller ta bort den inre `<section aria-labelledby>` helt (den behöver inte vara landmärke — se P2-19) och låt bara den yttre bära `aria-label`.
**Risk: RISKFRI.**

---

## P1 — kvalitetsdefekt

| # | Fil / rad / selektor | Fel + bevis (mitt eget mått) | Exakt fix | Risk |
|---|---|---|---|---|
| **P1-1** | `.steps-cap{margin-bottom:22px}` d2:425 · gtp:439 · gtg:441 · hf:478, överskuggad av en **inklistrad desktopkopia i SAMMA media query** d2:438-443 · gtp:452-457 · gtg:454-459 · hf:491-496 (bekräftad byte-identisk med raderna 134/136) | Computed `margin-bottom` = **36px @390 och @1440** i alla fyra (`_cons-1.mjs`). Ägarordern "22 px på mobil" har aldrig renderats. | Radera det duplicerade `.steps-cap`-blocket ur mobil-mediat. | **⚠ ÄGARGRIND** — uppmätt blockhöjd −14,00 px på mobil i **alla fyra** (`_cons-6.mjs`: d2 1257,75→1243,75 · gtp 1281,47→1267,47 · gtg 1306,13→1292,13 · hf 1370,25→1356,25) |
| **P1-2** | `.grid` rad 98 mot `@container (max-width:400px)` d2:359 | Panelens innerbredd bottnar på **401,83 px @1413** (svep 1121-1470, `_cons-1.mjs`) och **401,87 @1412 i produktion** (`_cons-2.mjs`). 1,87 px marginal till tröskeln som fäller kvittot till mobilrader mitt i tvåspaltsläget. 1366 ger 403,90. | Täcks av P0-5-fixen (413-415 px marginal). Fristående alternativ: `@media (min-width:1121px){ .grid{ grid-template-columns:minmax(0,1fr) clamp(480px,33vw,530px) } }` | ⚠ ÄGARGRIND (panelen 14 px bredare på laptopbandet) |
| **P1-3** | `h2 .accent{white-space:nowrap}` gtp:129 · gtg:131 | Accenten spiller ut ur H2-boxen **1001-1013 px, max +10,75 px** (1 px-svep, `_cons-1.mjs`). Endast gtp/gtg; d2/hf rena. Ingen kollision (blocket har `overflow:hidden`) men raggen bryter mot `max-width:30ch`. | `@media (max-width:1024px){ h2 .accent{ white-space:normal } }` | ⚠ ÄGARGRIND (rubriken kan brytas mitt i accenten 901-1024) |
| **P1-4** | `hemforsakring.html:405` `.cta:focus-visible{outline:3px solid #090b32}` | Uppmätt fokusring **rgb(9,11,50)** mot panelens navy — de tre andra har `rgb(255,255,255)` (`_cons-6.mjs`). Basfilernas egen kommentar (d2:336) säger "vit på mörk panel". WCAG 2.4.11 kräver 3:1. | `outline: 3px solid #fff;` | ⚠ ÄGARGRIND (endast fokustillstånd — trivial) |
| **P1-5** | hf:379 `padding:11px 30px 11px 12px` vs hf:505 `padding:11px 24px` | Ring-CTA:ns asymmetriska padding (ikon vänster) skrivs över av familjebasens mobilregel. Ikonens vänsterinset 12 → 24 px under 900. Kommentaren hf:509-510 beskriver dessutom ett row-reverse-mönster som **inte finns i koden**. | `@media(max-width:900px){ .cta{ padding:11px 20px 11px 10px } }` i hf, eller scopa familjeregeln till `.cta:not(.cta--ring)`. | ⚠ ÄGARGRIND |
| **P1-6** | `@supports not (container-type: inline-size){ @media(max-width:480px){ .cta{width:100%;padding:11px 16px;gap:10px} … } }` d2:373-385 | `CSS.supports('container-type','inline-size')` = **true** i Chromium OCH WebKit (`_cons-4.mjs`) → grenen är död kod. På Safari ≤15 där den lever slipper bara `gap:10px` igenom (900-regeln sätter width/padding senare) → 10 px gap istf 16. | Flytta `.cta`-raden ut ur `@supports`-blocket (den har inget med container queries att göra) och placera den efter `@media(max-width:900px)`. Behåll `.r-row`-speglingen. | RISKFRI (rör bara Safari ≤15) |
| **P1-7** | `.block--wave`-gruppen (7 regler) deklarerad **två gånger**: gtp 284-306 + **328-346** · gtg 286-308 + **330-348** · hf 295-317 + **339-357** | Verifierat med radnummer-diff (kommentarer strippade, radnummer bevarade). d2 har den en gång. Ingen renderingsskillnad — men en redigering av FÖRSTA kopian är verkningslös, och P0-3-fixen skulle annars behöva göras två gånger per fil. | Radera den andra förekomsten. | RISKFRI |
| **P1-8** | `@keyframes ampyRing` hf **286-290 och 393-397**, ordagrant identiska | `_cons-1.mjs` keyframes-inventering: `['fade','ampyRing','ampyRing']`. Namnet krockar dessutom med sajtens egen `ampyRing` (finns i den fångade CSS:en) — vår ligger senare och vinner globalt. | Radera 286-290; döp om till `ampy-av-ring`. | RISKFRI |
| **P1-9** | `hemforsakring.html:391` `animation: ampyRing 2.8s … infinite` (animerar **box-shadow**) | 3 s stillastående fönster, CDP Performance (`_cons-4.mjs`): hf **ΔRecalcStyleCount 183 · ΔTaskDuration 122,7 ms · ΔRecalcStyleDuration 17,9 ms**. Övriga tre: **0 / 0,4-2,9 ms**. Pågår i evighet, även utanför skärmen, på 278 sidor. | Flytta pulsen till en wrapper-`::after` som animerar `transform`+`opacity` (kompositorsäkert), eller ta bort pulsen. | ⚠ ÄGARGRIND (pulsens geometri blir skalande istf spread — måste omgodkännas) |
| **P1-10** | Ingen `@media print` i någon fil | `emulateMedia({media:'print'})` (`_cons-4.mjs`): `hasPrintRule:false`, `.panel` bakgrund `rgb(27,29,75)` med `print-color-adjust: economy` (webbläsaren släcker bakgrunden), texten kvar på `rgba(255,255,255,.94)` / `.70` → **vit text på vitt papper**. Hela kvittot försvinner. Ett avdragskvitto är precis vad målgruppen skriver ut. | Eget `@media print`-block: vit panel, navy text, dölj våg-/blob-SVG:er, grå totalplatta, CTA som ram + `::after{content:" (" attr(href) ")"}`. | RISKFRI (nytt tillstånd, skärmen orörd) |
| **P1-11** | `.cta` under `forced-colors: active` | Uppmätt (`_cons-4.mjs`): `background-image: none`, `background-color: rgba(255,255,255,0)`, `border: 0px none`, `box-shadow: none`, `color: rgb(0,0,159)` → primär-CTA:n renderas som naken länktext, ingen knappaffordans, på alla 278 sidor. WCAG 1.4.11. | `@media (forced-colors:active){ .cta{ border:2px solid ButtonBorder; background:ButtonFace; color:ButtonText; forced-color-adjust:none } .cta:focus-visible{ outline:3px solid Highlight } }` — alternativt `border:2px solid transparent` året runt (justera padding −2px). | RISKFRI |
| **P1-12** | Blob-/våg-SVG:erna under `forced-colors: active` | Uppmätt på PATH-noden (`_cons-6.mjs`): `.blob-a path` fill **rgb(11,13,42)** och `.hero-w1 path` fill **rgb(238,244,252)** tvingas INTE om (attributfill), medan `.panel` tvingas till `rgb(255,255,255)`. Resultat: nästan svarta blobbar på vit panel. | `@media (forced-colors:active){ .panel--dark > svg.av-blob, .block--wave > svg.av-wave { display:none } }` | RISKFRI |
| **P1-13** | `<ol class="steps">` + `<span class="n" aria-hidden="true">` d2:493/500/507 | Uppmätt (`_cons-6.mjs`): `<ol>` `list-style-type:none`, `display:flex`, `role=null`; `<li>` `display:grid`, `role=null`; de **synliga siffrorna 1/2/3 är `aria-hidden`**. `<ol>` är därmed enda bäraren av stegordningen, och listrollen tas bort i Safari/VoiceOver när `list-style:none` sätts (dokumenterat WebKit-beteende — jag har mätt att villkoret är uppfyllt, inte kört VoiceOver). | `<ol class="steps" role="list">` + `<li class="step" role="listitem">`. | RISKFRI |
| **P1-14** | `gt-produkt.html:491` `.r-total .t-note:has(> [data-slot="grind-produkt"]:empty){display:none}` | Uppmätt totalplattans höjd (`_cons-6.mjs`): helt tom → `none` / **66,5 px**; ett blanksteg → `block` / **72,5 px**; nyrad+indrag → 72,5; `<p></p>` (wpautop) → 72,5. ACF/`the_field()` producerar nästan alltid whitespace. De 6 px död luft kommentaren säger sig ha stängt kommer tillbaka. | Grinda på serversidan (rendera hela `<span class="t-note">` bara när fältet är ifyllt). | RISKFRI |
| **P1-15** | Blocket sätter aldrig egen `font-size`/`font-weight` | Uppmätt i produktion (`_cons-2.mjs`): sajtens `body{font-size:var(--aptext-sm);font-weight:300}` ger **14,119 px @390** (16 px i previewn) och vikt 300. Följd: `65ch`/`ch`/`em` resolvar annorlunda, blockhöjd @320 1 349,97 (preview) → **1 458,86** (produktion). Previewn som ägaren godkände är inte det som renderas. | `.ampy-avdrag{ font-size:16px; font-weight:400 }` explicit. | ÅTERSTÄLLER |
| **P1-16** | `gt-generisk.html:119` `h2{max-width:38ch}` mot 30ch i d2:117/gtp:117/hf:117 | Uppmätt @1920 (`_cons-1.mjs`): H2-box **896,72 px i gtg** mot **707,94 px** i de tre andra — 188,78 px familjebrott. No-op under ~1700 px. gtg är volymfilen (56 ortssidor). | Ägarbeslut: 38ch till alla fyra, eller tillbaka till 30ch i gtg. | ⚠ ÄGARGRIND |
| **P1-17** | `.step p{max-width:65ch}` d2:184 · gtp:182 · gtg:184 · hf:182; `.fine` saknar `max-width` helt | `65ch` resolvar till **768,69 px** (uppmätt @1920, alla fyra) = ~96 tecken/rad, inte 65. `.fine` spänner hela den staplade panelen (upp till 112 tecken/rad @901-1000 i hf). | `.step p{max-width:58ch}` (=685,9 px), `.fine{max-width:62ch}`, samma cap på `.r-total .t-note`. | ⚠ ÄGARGRIND (radbrytningarna ändras ≥1600) |
| **P1-18** | Leverans/payload | Uppmätt: 53-55 % av varje fils CSS är kommentarer; **86 % av CSS:en är byte-identisk mellan de fyra**; allt inlineas per sidvisning × 278 sidor (16 573 B gz snitt → 5 815 B minifierat → **3 827 B gz för alla fyra varianter som EN cachad extern fil**). Dessutom: fontswappen omflödar blocket upp till **47,75 px** (ingen fallback-metrik). | En extern `ampy-avdrag.css` med variantklass, `filemtime()`-versionering, `max-age=31536000, immutable`; minifierad build av kommenterad källa; `size-adjust`-fallbackface. | RISKFRI (fallback-metriken minskar en befintlig jank) |

---

## P2 — polish

| # | Fil / rad | Fynd (verifierat) | Fix | Risk |
|---|---|---|---|---|
| P2-1 | rad 15-53, alla fyra | **7 döda tokens**: `--teal-bright --faint --subtle --shadow-1 --fast --normal --ease` (0 `var()`-referenser, verifierat) | Radera | RISKFRI |
| P2-2 | d2:286 · gtp:283 · gtg:285 | `.nb{white-space:nowrap}` — 0 element i markupen (hf:294 använder den, 1 träff) | Radera i de tre | RISKFRI |
| P2-3 | hf:236-240, 258-261, 337 | `.r-row.deduct .amt`, `.r-total .t-note`, `.panel--dark .r-total .t-note` — 0 matchningar (medvetna ägarbeslut, men reglerna är döda) | Radera eller markera som familjearv | RISKFRI |
| P2-4 | `.panel--dark .fine{border-top-color}` d2:312 · gtp:327 · gtg:329 · hf:338 | `.fine` har `border-top-style:none / width:0px` — deklarationen är en no-op | Radera | RISKFRI |
| P2-5 | d2:277 · gtp:274 · gtg:276 · hf:279 | **Nästlad `/*` — kommentaröppningar 90 mot 89 stängningar** i alla fyra. CSS-kommentarer nästlar inte; en kommentar sväljer nästa. Ingen CSS förloras idag (verifierat), men en regel som läggs mellan raderna kommenteras bort tyst — och en naiv minifierare kan svälja mer | Stäng kommentaren | RISKFRI |
| P2-6 | `.wf-label` markup d2:470-473 (+3 syskon), CSS 68-78 + 414-415 | **Korrigering av WP-KOLLISION:** markupen ligger som `<div>` DIREKT UNDER `<body>`, **utanför** `<section class="block">` (`_cons-1.mjs`: `insideBlock: false`, `parent: BODY`). Den följer alltså inte med om man klistrar in sektionen — men CSS:en följer med om hela `<style>` klistras, och markupen följer med om hela `<body>` klistras. `href="familj.html"` → 404 på ampy.se | Strippa markup + CSS i WP-builden | RISKFRI |
| P2-7 | `.wf-label a` | 109,8 × 40,3 px tryckyta (<44 px) vid alla bredder >900. Endast preview-krom | `padding:12px 8px` om den någonsin skeppas | RISKFRI |
| P2-8 | rad 146/148 alla fyra | `--h3fs`-kommentaren säger "19,6px @375 · 26px @1280"; koden är `clamp(19px, calc(0.52vw+17px), 23px)` → **19 / 23 px**. Båda talen fel | Rätta | RISKFRI |
| P2-9 | rad 118/120 alla fyra | "H2→steg ≥1.4× steg↔steg (64 mot 44 @1440)" — uppmätt `margin-bottom:44px` mot `gap:44px` = **1,0×** | Rätta eller åtgärda avståndet | RISKFRI |
| P2-10 | d2:445-447 (+syskon) | mobilkommentaren säger `--nsz` 38→32 och siffran 15→14; uppmätt **36 px** cirkel och **14,5 px** siffra | Rätta | RISKFRI |
| P2-11 | rad 161/159 alla fyra | `.step .n` beskrivs som "teal-**fylld** cirkel"; uppmätt `background-color: rgba(0,0,0,0)`, `background-image: none` — motsägs av VARIANT F-kommentaren tre rader ner | Rätta | RISKFRI |
| P2-12 | gtp:510-512, 521, 606, 636 | SLOTKARTAN säger "sju vägar" och listar `produkt-obest`; markupen har **sex** slots och `produkt-obest` finns inte. `.t-amt-fras` refereras i två kommentarer men klassen finns inte (uppmätt `.r-total .amt` = 23,04px/700, familjens basstorlek) | Rätta kartan | RISKFRI |
| P2-13 | gtg:506, 567, 602 | Kommentarerna säger sats-strängen står i **FYRA** `data-slot="sats"`; markupen har **TRE**. Biter eftersom GAP-1 (50 % vs 48,5 %) är en go-live-blocker på 56 ortssidor och en programmatisk swap letar efter fyra | FYRA→TRE, "övriga tre"→"övriga två" | RISKFRI |
| P2-14 | gtp:546 vs gtp:612 | Samma slot-nyckel `data-slot="produkt"` bär "Subtech Go" (vanligt blanksteg) och "Subtech&nbsp;Go" (hårt) — filens egen regel gtp:517 förbjuder det. Samma klass: hf `data-slot="tjanst"` bär "ett elfel" och "Felsökning + reparation" | Välj EN form; lägg nbsp i ACF-värdet | RISKFRI |
| P2-15 | d2:6 `<title>` | `Design 2 — Kvittot först (v3, sajtmatchad)` — enda em-dashen i familjen (kanonbrott), stale namn, avviker från syskonens `·`. **Renderad UI-text i body har 0 em-dashes i alla fyra** (verifierat); hf:704 U+2013 i "1 000–2 000 kr" är korrekt svensk intervalltypografi | `Blockfamiljen · ROT elcentral · Kvittot först` | RISKFRI |
| P2-16 | hf:376 + 377 | `.cta{margin-top:auto}` som egen regel före `.cta{…}`; hela CTA-bannern duplicerad (hf:271-278 ≈ 359-366) | Slå ihop | RISKFRI |
| P2-17 | `.r-total` bg `rgba(255,255,255,.08)` d2:308; `.cta-wrap::before` bg `rgba(255,255,255,.16)` d2:318 | Under `forced-colors:active` tvingas de **inte** (uppmätt `_cons-6.mjs`) → totalplattan och avdelaren blir osynliga på tvingad vit canvas | Täcks av P1-12-blocket | RISKFRI |
| P2-18 | `@media(max-width:345px)` | Icke-monoton brytpunkt: panelbredd **295 → 292 px när skärmen växer 345→346** (CTA-bläckets marginal hoppar 7,34 → 3,84). Kosmetisk ryckning vid rotation/fönsterdrag | Jämna ut kurvan | ⚠ liten ägargrind |
| P2-19 | Alla fyra: `<section class="panel" aria-labelledby="pcap">` (d2:515), `align-items:center` rad 100, `html{-webkit-text-size-adjust}` rad 55, `href="#"` d2:548/gtp:711/gtg:618, `.panel--dark`-bannern d2:293 | Samlingspost: (a) dubbel annonsering — regionens namn = rubrikens text, ×2 per block; panelen behöver inte vara landmärke; (b) 232,6 px död yta @1024 i hf p.g.a. `align-items:center`; (c) prefixad text-size-adjust utan standardegenskap, hör hemma i temat; (d) `href="#"` i tre av fyra mot familjens egen regel; (e) bannern säger "ENDAST ROT-blocket" men `.panel--dark` finns i alla fyra (uppmätt `rgb(27,29,75)` överallt) | Se respektive | RISKFRI (utom (b) som är ägargrind) |

---

## UNDERKÄNT / NEDGRADERAT — påståenden jag mätte och inte kan bekräfta

Två av dessa är **farliga att följa**.

1. **⛔ "Använd `AmpyOutfit` — sajten hostar redan samma variabelfil på stabil URL" (WP-KOLLISION P0-4).** `AmpyOutfit` finns bara i `post-15498.css` och `post-15545.css` — två sidspecifika sheets, inte site-wide. Och dess URL `https://ampy.se/wp-content/uploads/ampy-fonts/Outfit-VariableFont_wght.woff2` returnerar **404** (`curl -I`). Att följa rådet skickar ett garanterat trasigt typsnitt till 278 sidor. Rätt URL är `…/uploads/fonts/…` → 200.
2. **⛔ "Lägg EN site-nivå-`@font-face` med `font-weight:100 900` som ersätter de nio" (PRESTANDA).** Det ändrar `Outfit` för hela ampy.se, inte bara för blocket — en global typografiändring smugglad in i en blockfix. Använd en egen familj (P0-4).
3. **`.brxe-div` kollapsar blocket (WP-KOLLISION P0-5, "885,5 px @1440 / 157,9 px @390").** Inte reproducerbart mot sajtens riktiga CSS: `host-d2-div.html` ger **1 280 px @1440 och 327,09 px @390 — identiskt med `.brxe-code`**. Regeln `.brxe-div:where(:not(.brx-dropdown-content)){display:flex}` finns inte i den fångade `frontend.css`. Behåll ändå `.ampy-avdrag{width:100%}` som gratis härdning, men det är inte P0.
4. **"Kvittots belopp blir osynliga av en vanlig tema-regel på `span`" (HTML-A11Y P0-5, kontrast 1,04:1).** Premissen (`.brxe-container span{color:#333}`) finns inte: **0 span-färgregler** i sajtens riktiga CSS (uppmätt selektorenumerering över hela CSSOM), och `.r-row .amt` / `.r-row .lbl span` computed till `rgba(255,255,255,.94)` i produktion. Nedgraderad till gratis härdning (lägg dit den explicita färgen ändå — den kostar inget).
5. **"Överskridande band d2 300-386 px (87 bredder)" (HTML-A11Y P0-1).** Felmärkt. Det bandet är "padding < 24 px", inte "bläck utanför knappen". Bläcket ligger utanför ≤343 px i preview och ≤~380 px i produktion. Den riktiga siffran är illa nog — men rapportera rätt sak.
6. **"`.wf-label` levereras till kund" (WP-KOLLISION P0-8).** Markupen ligger utanför `<section class="block">`. Se P2-6.
7. **`.r-row` / `.r-row .dots` / `.r-row .lbl` / `.r-row .amt` / `.r-total` som "dubbletter" (HTML-A11Y P2-3: "d2 5 st").** Det är den AVSIKTLIGA `@supports not (container-type)`-fallbacken (d2:359-369 vs 373-385) som speglar `@container`-läget på viewportbredd. **Radera dem inte.** De enda äkta dubbletterna är `.steps-cap` (P1-1), `.block--wave`-gruppen (P1-7) och `ampyRing` (P1-8).
8. **RESPONSIVs cqi-fix "verbatim".** Riktningen är verifierad korrekt i produktion (P0-5), men klistrad sist i CSS:en överskriver den mobil-paddingen (`.block{padding:28px 16px}` → 24 px) och drar panelens innerbredd 263 → 227 px @390. Måste författas i kaskadordning och köras genom paritetsgrinden.

---

# C. FÖRESLAGEN GENOMFÖRANDEORDNING

Namespacing-refaktorn ligger i **steg 2** — efter dedupliceringen, före allt beteende. Motiveringen står under steget.

### Steg 0 — Frys facit och lås leveransformatet (blockerar allt annat)
1. Kör baseline-fångsten: 21 metrik × 17 bredder × 4 filer + skärmdumpar, sparat som JSON. Harnessen finns: `_cons-5.mjs` (paritet + läckage) och `_cons-2.mjs` (produktion). Utan den här filen kan ingen senare ändring bevisas neutral.
2. **Ägarbeslut som styr allt nedan:** levereras blocket som Bricks **Code-element** (CSS i `<body>`, vinner på källordning) eller som **FluentSnippets/`wp_head`** (CSS i head, **förlorar** mot temats `h2{font-size:var(--aptext-3xl)}`)? Uppmätt skillnad: H2 `36px/450/lh43,2` mot `40px/500/lh48`. Ampys leveranskontrakt säger 3-filsformatet — alltså det läge som förlorar. Namespacing (klasser, 0-1-0) tar bort beroendet helt, vilket är ytterligare ett skäl att göra steg 2 tidigt.

### Steg 1 — Deduplicering och död kod (riskfritt, krymper diffytan före refaktorn)
P1-7 (`.block--wave` ×3 filer), P1-8 (`ampyRing` ×2), P2-1 (7 tokens), P2-2 (`.nb` ×3), P2-3 (hf döda selektorer), P2-4 (`border-top-color`), P2-5 (nästlad kommentar), P2-16 (hf split-regel), P2-8…P2-15 (kommentarsanering).
**Varför före namespacing:** annars transformeras duplicerade block och varje selektorfix måste göras två gånger per fil, och diffgranskningen fördubblas. **Grind:** paritet = 0 avvikelser.

### Steg 2 — NAMESPACE-REFAKTORN (pivoten — ett enda svep, en enda grind)
Löser i samma pass: **P0-2** (scoping), **P0-3** (klasselektorer istf `[class^=]`), **P0-4** (namnrymdad font mot 200-URL:en), **P0-6** (unika id), **P1-15** (egen font-size/weight), **P2-6** (wf-label bort) samt tokenkollisionerna och `@keyframes`-krocken.

Schema: wrapper `.ampy-avdrag` (bär `--av-*`-tokens, `width:100%`, `font-size:16px`, `font-weight:400`, typografibasen) + `av-`-prefix på samtliga 36 klasser. `:root` → `.ampy-avdrag`. `*` → `.ampy-avdrag, .ampy-avdrag *, …::before/::after`. `html{}` och `body{}` **raderas** (preview-krom flyttas till preview-sidan). `a`, `:focus-visible`, `h2` (som klass `.av-h2`), reduced-motion-`*` scopas. `@keyframes fade|ampyRing` → `av-fade|av-ring`. Delade svg-klasser `.av-wave` / `.av-blob`.

**Sök-och-ersätt-fällor (jag gick i två av dem):**
- Kör klassbytet som **EN regex-alternation sorterad längst-först** — annars ger `\bsteps\b` mot `av-steps-cap` dubbelprefixet `av-av-steps-cap`. Samma för `block` vs `block--wave`, `cta` vs `cta-wrap/arrow/ring`, `r-row` vs `r-total`.
- **`body`- och `:root`-regler finns även INUTI media queries** (d2:412-413). Missar man dem blir `var(--av-edge)` odefinierad på `body` → `var()` utan fallback = "invalid at computed-value time" → padding **0**, tyst. Det gav mig 135 paritetsavvikelser i första försöket.

**Grind (blockerande, båda måste vara 0):**
- Paritet: 21 metrik × 17 bredder (320-2560) × 4 filer = 1 428 mätningar, **0 avvikelser**. ✅ uppnått i `_cons-5.mjs`.
- Läckage: värdelement ändrade i produktionsharnesset = **0** (från 1 035). ✅ uppnått, @1440 och @390.
- Sidoeffekt att notera i grinden: i produktion går blockbredden @390 327,09 → **347,1 px** och sajtens scrollWidth 419 → **409** (= värdens egen baslinje, vår extra overflow borta). Det är en avsedd förbättring, inte en paritetsmiss — previewfacit är oförändrat.

**Varför inte först:** steg 1 måste rensa dubbletterna. **Varför inte sist:** varje behandlad P0/P1 i steg 3-4 skulle annars behöva skrivas om och omverifieras inne i den namespacade källan.

### Steg 3 — Beteendefixar som ÄNDRAR godkänd rendering (EN ägargrindssession, före/efter-par per punkt)
P0-1 (CTA mobil, 2-radig ≤390), P0-5 (container queries — inklusive den omkalibrerade kaskadplaceringen), P1-1 (steps-cap 22px, −14 px mobil ×4), P1-2 (panelmarginal), P1-3 (accent nowrap), P1-5 (hf ring-padding), P1-16 (38ch/30ch), P1-17 (65ch→58ch + `.fine` cap), P2-18 (345-brytpunkten).
Leverera varje punkt som ett renderat före/efter-par på 320 / 390 / 768 / 1024 / 1440 / 1920. Ingen får implementeras utan bock. Efter varje bock: paritetsgrinden körs om med det NYA facit som baseline.

### Steg 4 — Robusthetslager (nya tillstånd, skärmen orörd — riskfritt)
P1-10 (`@media print`), P1-11 + P1-12 + P2-17 (ett `@media (forced-colors:active)`-block), P1-13 (`role="list"`/`listitem"`), P1-4 (hf fokusring vit), P1-14 (`:has(:empty)` → serversidesgrind), P1-6 (`@supports`-grenen), A11Y:s explicita färgdeklarationer på `.amt` / `.lbl span` (härdning), `.ampy-avdrag{width:100%}` (härdning), P1-9 (ampyRing → transform/opacity — denna har ägargrind på pulsgeometrin).

### Steg 5 — Leverans och prestanda
P1-18: en extern `ampy-avdrag.css` som bär alla fyra varianterna via klass på wrappern (3 827 B gz, cachad en gång för 278 sidor mot 5 815 B gz per sidvisning), minifierad build av den kommenterade källan, `filemtime()`-versionering + `max-age=31536000, immutable`, `size-adjust`-fallbackface mot fontswap-omflödet. SVG:erna stannar inline (0 paints uppmätt) men dedupliceras med `<defs>/<use>` (1 838 B/fil).

### Steg 6 — Slutregression innan Chris
41 bredder 320-2560 × 4 filer × båda orienteringarna + de tre produktionsscenarierna: (a) två block på samma sida (id-unikhet), (b) lazyload-klass injicerad på alla sex dekor-SVG:er (P0-3 ska ge 0 höjdförändring), (c) blocket i `.brxe-code`, `.brxe-block` OCH `.brxe-div`. Plus 3 s paint-räknare per fil (mål: 0 recalcs i vila, jfr hf:s nuvarande 183) och en `@media print`-PDF per fil.

---

**Filer och verktyg:** blocken i `/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs/{d2-kvittot-forst,gt-produkt,gt-generisk,hemforsakring}.html` · mina mätskript `_cons-1.mjs` … `_cons-8.mjs` i samma katalog · produktionsharness + namespace-transform + bevisbilder i `/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/5d1680be-7598-41bb-9152-121e9db34226/scratchpad/` (`mkhost.py`, `mkpage.py`, `mkpage2.py`, `nsproof.py`, `host-*.html`, `ns-*.html`, `hostns-*.html`, `BEVIS-*.png`, `cons1-8.json`).