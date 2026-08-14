# RIKTNING A — "Vad blir det för MIG?" (värde-konkretisering)

Grounding utförd: `ampy-foretagsdata.md` (§1.1–1.2, §2.4, §3.5, §3.7, §6.5–6.7, §7.1, §8.3, §9, §11), `ampy-rost/SKILL.md` (R1–R12 + registerdoktrin), `ampy-webb-playbook/SKILL.md` (§1–§5, web-block-profilen), klonerna `rot-gt-cro/rot.html` + `gron-teknik.html` (verifierat: "Vår experter" live i båda, `data-highlight="last-3"` bara på ROT, GT-knappen har pil-SVG som ROT saknar, linjerna JS-ritade).

---

## 1. TES (varför denna riktning vinner i position 2)

Besökaren som scrollat förbi heron har just sett ett pris "efter ROT" och bär på marknadens rankade rädsla nummer ett: att procentsatsen är en juicad siffra med dold hake (§7.1). Ett procenttal ägs av ingen; konverteringsögonblicket är enligt playbook-doktrinen "när den abstrakta smärtan blir en siffra besökaren äger" — därför gör denna riktning avdraget bokstavligt: ett stiliserat fakturautdrag (KVITTOT) som visar exakt vad som dras, från vad, och att du aldrig ligger ute med pengarna. Det är den enda riktningen som samtidigt löser blockets tre ägarmål med EN mekanism: kvittot bevisar att avdraget är verkligt (tillit), raderna ÄR processen i pengaform (förklaring), och siffran besökaren nu "äger" är exakt vad nästa block (prisblocket, kanon-position direkt under) skördar (priming).

---

## 2. WIREFRAME

### Desktop (1280, vitt kort på ljusblå sektion — dagens yttre skal behålls)

```
┌─ .rot__container (vitt kort, apradius-l, riktig shadow: --shadow-primary definierad) ─┐
│                                                                                       │
│  KOLUMN VÄNSTER (~55%)                    KOLUMN HÖGER (~45%)                          │
│  ────────────────────                     ─────────────────────                        │
│  H2 (ACF, aptext-2-5xl, midnight,         ┌─ KVITTOT (signaturenheten) ────────┐      │
│  teal-accent på mekanismfrasen,           │  midnight #090b32, apradius-l       │      │
│  server-renderad <span>)                  │  eyebrow: "SÅ SER DET UT PÅ         │      │
│                                           │  FAKTURAN" (aptext-xs, teal)        │      │
│  STEG-RAILEN (ersätter 3-kolumners-       │  ─────────────────────────────      │      │
│  raden; vertikal <ol>, CSS-ringar +       │  Arbetskostnad ........ 100 %       │      │
│  border-left dashed, ingen JS):           │  ROT-avdrag 30 % ...... -30 %  ◄teal│      │
│   1. [ACF steg1] Du får en exakt          │  ═════════════════════════════      │      │
│      siffra innan du bestämmer dig        │  Du betalar ........... 70 %        │      │
│   2. [ACF steg2] Egna, auktoriserade      │      av arbetskostnaden             │      │
│      elektriker gör jobbet                │  ─────────────────────────────      │      │
│   3. [ACF steg3] Du betalar priset        │  fotnot (aptext-xs, vit 70%):       │      │
│      efter avdrag, vi tar resten          │  villkorsrad [ACF] + takrad         │      │
│      med Skatteverket                     └─────────────────────────────────────┘      │
│                                                                                        │
│  ▾ <details> "Gäller avdraget dig?"       [KRONLÄGE, endast om ACF-fält satt:          │
│  (villkor: skatteutrymme, äga+bo,          raderna byter till kr-belopp med            │
│  5-årsregeln för ROT; "kan"-språk)         etiketten "Exempel" + disclaimerrad]        │
│                                                                                        │
│  ── CTA-RAD ──────────────────────────────────────────────────────────────────         │
│  [PRIMÄR, teal pill] "Se ditt pris efter ROT-avdrag" → ankar-scroll prisblocket        │
│  sekundär textlänk: "Så fungerar ROT-avdraget 2026" → /rot-avdrag-2026/                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobil (≤480)

Ordning: H2 → **KVITTOT i full bredd** (enheten är blocket; den överlever 480px i full styrka, raderna är typografi, inte grafik) → steg-railen som kompakt vertikal lista (ring 40px + en rad titel, brödtext i hopfällbar rad per steg, elcentral-kollen-mönstret) → `<details>` villkor → fullbredds primär-CTA → sekundär textlänk. Målhöjd ≤ dagens 587px trots mer innehåll (stegen kollapsade sparar ~150px).

**Vad som varierar per ACF:** H2, tre stegtexter (som idag) + nya fält i §5. Kvittots struktur, etiketter, CTA-mönster och railen är mall-fasta.

---

## 3. KOMPLETT COPY

Alla strängar fria från tank-/halvstreck (R12; minus skrivs med vanligt bindestreck), "kan" på skatt, kanon-satser. "!"-budget: 0 i denna uppsättning (high-stakes-register, pos 2 ekonomisida).

### ROT-varianten (/elservice/elcentral/)

- **H2:** "Byt elcentral med 30 % ROT-avdrag, draget direkt på fakturan"
  (teal-accent på "draget direkt på fakturan" — accenten flyttas från slumpord till mekanismen)
- **Kvittot, eyebrow:** "SÅ SER DET UT PÅ FAKTURAN"
- **Kvittot, rader (procentläge, mall-default):**
  - "Arbetskostnad — 100 %" *(OBS: strecket här är layoutens punktlinje/leader, inte ett tecken i strängen)*
  - "ROT-avdrag 30 % — -30 %" (teal-rad)
  - "Du betalar — 70 % av arbetskostnaden"
- **Kvittot, fotnot:** "ROT gäller arbetskostnaden, inte materialet. Avdraget förutsätter att du har skatt att dra av mot, upp till 50 000 kr per person och år. Det räknar vi på i steg 1."
- **Kvittot, kronläge (endast när ägaren signerat `exempel_arbetskostnad`, t.ex. 20 000 kr):**
  - Etikett: "Räkneexempel"
  - "Arbetskostnad — 20 000 kr" / "ROT-avdrag 30 % — -6 000 kr" / "Du betalar — 14 000 kr"
  - Disclaimer: "Ett typexempel, inte ett erbjudande. Ditt fasta pris får du i offerten." [GAP: beloppet per tjänst, se §7]
- **Steg 1, rubrik:** "Du får en exakt siffra innan du bestämmer dig"
  **Text:** "En av våra experter går igenom ditt projekt, kollar att du har utrymme för avdraget och lämnar ett fast pris. Kostnadsfritt."
- **Steg 2, rubrik:** "Egna, auktoriserade elektriker gör jobbet"
  **Text:** "Installationen görs av våra egna elektriker. Vi är registrerade hos Elsäkerhetsverket, det kan du kontrollera själv."
- **Steg 3, rubrik:** "Du betalar priset efter avdrag"
  **Text:** "Avdraget är redan draget på fakturan. Vi skickar in ROT-ansökan till Skatteverket och begär resten därifrån. Du deklarerar ingenting."
- **`<details>`-rubrik:** "Gäller avdraget dig?"
  **Innehåll:** "ROT förutsätter att du äger och bor i bostaden, att den är äldre än fem år och att du har betalat tillräckligt med skatt under året. Saknas utrymme kan Skatteverket justera avdraget i efterhand. Därför räknar vi på ditt fall innan du bestämmer dig."
- **Primär CTA:** "Se ditt pris efter ROT-avdrag" (ankare → prisblocket/formuläret)
- **Sekundär textlänk:** "Så fungerar ROT-avdraget 2026" → /rot-avdrag-2026/

### Grön Teknik-varianten (/batterilagring/)

- **H2:** "Batterilagring med 50 % Grön Teknik-avdrag, draget direkt på fakturan"
- **Kvittot, rader:** "Arbete och material — 100 %" / "Grön Teknik-avdrag 50 % — -50 %" (teal-rad) / "Du betalar — 50 %"
- **Kvittot, fotnot (villkorsrad, ACF `villkorsrad` för gt_villkorad-läget):** "50 % gäller batterier som kopplas till din solcellsanläggning. Utan solceller gäller i stället ROT, 30 % på arbetet. Taket är 50 000 kr per person och år, äger ni huset två kan ni använda båda. Avdraget förutsätter skatt att dra av mot."
- **Steg 1, text:** "En av våra experter går igenom ditt projekt och kollar först att du kvalificerar för 50 %. Gör du inte det säger vi det direkt, och räknar på ROT i stället."
- **Steg 2, text:** "Installationen görs av våra egna elektriker. För 50 % på materialet kräver Skatteverket att samma företag levererar både hårdvara och installation, därför gör vi bägge."
- **Steg 3, text:** "Avdraget är redan draget på fakturan. Vi skickar in Grön Teknik-ansökan till Skatteverket och begär resten därifrån. Du deklarerar ingenting."
- **`<details>`:** "Gäller avdraget dig?" med solcellsgrinden + skatteutrymme + tak, "kan"-språk som ovan.
- **Primär CTA:** "Se ditt pris efter avdrag" · **Sekundär:** "Så fungerar Grön Teknik-avdraget 2026" → /gron-teknik-2026/

*(Steg 2-formuleringen om samma-företag-regeln bygger på det kanoniska rost-samplet ur §8.3, url:gron-teknik-2026 — sann, sourced, och ett köp-av-oss-argument utan en enda urgency-taktik.)*

---

## 4. DESIGNNOTER

- **Signaturenheten = KVITTOT, exakt en enhet.** Typografisk tabell, inte clipart: inga perforeringskanter, ingen stämpel, inget genomstruket pris (rea-semiotik fälls på candour-grinden; subtraktion visas som minusrad, aldrig överstruket belopp).
- **Tokens:** kvittopanel `#090b32` (midnight-surface), minusraden + "Du betalar"-summan i teal `#00a991`, siffror Outfit weight 500 med `font-variant-numeric: tabular-nums`, eyebrow `aptext-xs`, rader `aptext-m`, summa `aptext-l`. Kortet `--apradius-l`; definiera `--shadow-primary` explicit (ärv inte `#bebebe`-defekten, §11.4). GT-varianten behåller teal som aktionsfärg; grön (`--apemerald-flow`) får max användas som accent på minusraden, aldrig på CTA:n (aktionsfärgs-disciplin, dagens ljusblå pastellknapp utgår).
- **Vad behålls från dagens block:** vitt kort på ljusblå sektion, tre-stegs-skelettet, fadeIn-on-enterView, ACF-kontraktet H2+3 stegtexter. **Vad utgår:** våg-SVG:n (dekor som späder enheten), de 6 ring-SVG-filerna (ersätts av text-siffra i CSS-ring), `connector-lines.js` (CSS `border-left: 2px dashed` på railen), `heading-highlight.js` (accent-span renderas server-side i ACF/Bricks så redaktören SER var den hamnar).
- **Motion (≤300ms, `prefers-reduced-motion` respekteras):** vid enterView tonar kvittoraderna in sekventiellt (3 × ~80ms stagger) och teal-minusraden dras in sist från höger, 250ms ease-out. Ingen räknande siffer-animation i procentläget (det finns inget att räkna); i kronläge får avdragsbeloppet räkna ner en gång, ≤300ms, runOnce.
- **Semantik:** stegen som `<ol><li>`, kvittot som riktig tabellmarkup med `aria-label`, alt-texts-städningen ("frame 28928228") försvinner med SVG-ringarna. Frågorna i `<details>` renderas i DOM server-side (aldrig JS-injicerat, jfr data:-URI-lärdomen).

---

## 5. MALLBARHET (ACF-fält + skalningsbevis)

| Fält | Typ | Krävs | Roll |
|---|---|---|---|
| `h2` | text | ja (finns) | per-sida-rubrik; mekanismfrasen accent-spannas i mallen |
| `steg1/2/3` | text | ja (finns) | stegtexterna |
| `avdragstyp` | select: `rot` \| `gron_teknik` \| `gt_villkorad` \| `inget` | ja (NYTT) | styr procentsats, basetikett ("arbetskostnaden" vs "arbete och material"), länkmål, villkorsrad; `inget` = blocket renderas inte (felsökning, elbesiktning; dagens mall LJUGER strukturellt där) |
| `procentsats` | tal (30/50/15) | ja (NYTT, default per avdragstyp) | kvittots rader; solceller = 15, defaulten får ALDRIG vara 50 |
| `villkorsrad` | text per avdragstyp/vertikal | ja för `gt_villkorad` | solcellsgrinden m.m. |
| `exempel_arbetskostnad` | tal, valfritt | nej (ägargrindat) | slår på kronläget; tomt fält = procentläget renderas |
| `ankarmal` | anchor-id | ja (default = prisblocket) | primär-CTA:ns mål |

**Skalningsbevis:** procentläget kräver noll per-sida-data → alla programmatiska sidor och samtliga 22 tjänstesidor fungerar dag 1 med bara `avdragstyp` satt (14 ROT-sidor, laddbox/batteri/sol GT-varianter, felsökning+elbesiktning `inget`). Kronläget är en per-sida-uppgradering som slås på sida för sida i takt med att ägaren låser §3.5-priskanonen — mallen degraderar aldrig, den väntar. En framtida tredje avdragstyp (t.ex. "Ladda bilen"-bidraget för BRF) är en dataändring, inte ett nybygge.

**Samspel med prisblocket (kanon pos 2):** detta block visar MEKANIKEN (procent/exempel på arbetskostnad), prisblocket visar SIFFRAN (tjänstens pris). Regel i mallen: kronläget får aldrig aktiveras på en sida där prisblocket visar ett annat belopp för samma storhet — en siffersanning per sida.

---

## 6. MÄTNING

Consent-gatade dataLayer-events per playbook §5, alla med `page_slug`, `variant` (rot/gt/gt_villkorad), `experiment_id`:

- `rotgt_block_view` (enterView, runOnce) — exponeringsbas
- `rotgt_receipt_mode` {procent|kron} — vilken devicenivå sidan körde
- `rotgt_details_open` — "Gäller avdraget dig?" öppnad (gratis intent-signal; hög öppningsgrad = villkorsfrågan är het, validerar riktningen)
- `rotgt_cta_click` {target: anchor | article} — mäter att exit-läckan vänt riktning
- **KPI (A/B mot dagens block, 2 veckors baslinje först):** leads per 1000 sidvisningar på sidan, INTE blockets egna klick. Sekundärt: article-exitandel ska sjunka, anchor-andel ersätta den.
- Kronläge vs procentläge blir ett naturligt andra experiment (`experiment_id=rotgt_kronlage`) när första prissignaturen finns. Candour-raderna är aldrig testvariabler.

---

## 7. RISKER & ÖPPNA FRÅGOR

1. **[GAP] Fakturamodellen som löfte:** "Avdraget är redan draget på fakturan" + "du deklarerar ingenting" kräver ägarbekräftelse att Ampy tillämpar förhandsdrag på BÅDE ROT och GT-utbetalning (GT-samplet i §8.3 säger "drar av direkt" för EV; ROT-flödet obekräftat i datalagret). Blockets bärande mening — grindas först.
2. **[GAP] Kronbelopp per tjänst:** §3.5 har dokumenterad intern priskonflikt (6 000–12 000 vs 12 600–24 500 vs 18 500–30 000 för elcentral). Kronläget är därför designat som opt-in bakom ägarsignatur; mallen shippar i procentläge.
3. **[GAP] Batteri utan solceller:** standalone-GT-berättigande obekräftat (§6.5). Min copy påstår det inte (villkorsraden säger "utan solceller gäller ROT"), men exakt kundformulering ska ägargodkännas.
4. **Kvitto-läsningen "detta är mitt pris":** ett fakturautdrag kan misstas för ett erbjudande. Mitigering inbyggd: procentläget visar inga kronor; kronläget bär etiketten "Räkneexempel" + "inte ett erbjudande"-disclaimern (etablerad EV-sträng). Granskningsfasen bör verifiera att disclaimern inte går att trunkera bort på mobil.
5. **15 %-sidorna (solceller):** kvittot måste se ärligt ut även när minusraden är liten — 15 % ritas som 15 %, aldrig visuellt fetad. Svagare affisch där är priset för candour; acceptera.
6. **Redundansrisk mot heron:** heron säger redan "med 30% ROT-avdrag" (§2.4). H2:ns jobb här är mekanismen ("draget direkt på fakturan"), inte procenten — håll den skillnaden när ACF-rubrikerna skrivs per sida, annars återuppstår upprepningen.
7. **`inget`-läget är ett kanonbeslut:** att blocket stängs av på felsökning/elbesiktning ligger redan i ULTIMATA-STRUKTUREN; mallens `avdragstyp=inget` implementerar det — men lastbalanserings ROT-vs-GT-konflikt (GAP 3) måste avgöras innan den sidan får någon variant alls.
8. **"Vår experter"-felet** lever i båda klonernas ACF-innehåll — fixas centralt idag, oberoende av riktningsval.