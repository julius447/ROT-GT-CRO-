Jag har läst klonerna (rot.html + gron-teknik.html), ampy-foretagsdata (§1.1–1.5, §6.5–6.7, §7), ampy-rost och ampy-webb-playbook. Här är riktningsspecen.

---

# RIKTNING B — "VÅGAR JAG LITA PÅ DET HÄR?" (tillitsmaskineriet)

## 1. TES

Besökaren i position 2 har just scrollat förbi ett lead-formulär utan att fylla i det, och §7.1 säger exakt varför: hen är disconfirmation-seeking och letar efter haken som bevisar att "30 % avdrag" är säljarens siffra, inte hens. Den enda mekanik som avväpnar en katch-jägare är att ge hen haken frivilligt, göra ansvaret synligt och göra påståendena kontrollerbara: därför byggs blocket om från processbeskrivning till ett tillitsmaskineri där varje steg bär en ansvarsägare (VI/DU), villkoren står i öppen text i stället för att saknas, och legitimiteten är klickbart verifierbar hos Elsäkerhetsverket. Vinsten i position 2 är att blocket gör det heron inte kan: det tar risken för avdragsfrågan åt besökaren ("gäller det MIG?") innan nästa block ber om något, vilket är exakt det priming-jobb ägarmål 1+3 beskriver.

**Signaturenheten (EN, per webb-playbook §2): ANSVARSRAILEN** — trestegskedjan behålls som silhuett men varje nod får en ansvars-chip (VI · VI · VI) och railen kröns av en enda avvikande nod: **"DU: tacka ja. Det är allt."** Enheten dramatiserar blockets sanna argument (ansvarsasymmetrin: kundens insats är noll, Ampys ansvar är totalt) i stället för att illustrera ett generiskt arbetsflöde. Kronexempel och interaktiv diagnostik lämnas medvetet till de andra riktningarna.

## 2. WIREFRAME

### Desktop (~1140 px innehållsbredd, vitt kort på ljusblå sektion behålls för sidkontinuitet)

```
┌──────────────────────────────────────────────────────────────┐
│  [Eyebrow-pill: "ROT-avdrag 2026"]              (ACF: regim) │
│                                                              │
│  H2, vänsterställd, teal på nyckelfras (server-renderad      │
│  <span>, ALDRIG last-3-JS)                     (ACF: h2)     │
│  Mekanikrad, 1 mening: fakturamekanismen       (mall-fast*)  │
│                                                              │
│  ── ANSVARSRAILEN (signaturenheten) ─────────────────────────│
│  <ol> 3 noder i rad, CSS-ringar med tal som TEXT,            │
│  streckad linje = border-image/pseudo-element (ingen JS):    │
│                                                              │
│   [chip: VI]          [chip: VI]          [chip: VI]         │
│   ① Vi kollar att     ② Egna auktori-     ③ Vi sköter allt   │
│   avdraget gäller dig serade elektriker   med Skatteverket   │
│   (ACF: steg1_text)   (ACF: steg2_text)   (ACF: steg3_text)  │
│                                                              │
│   ┌─ DU-noden, enda teal-fyllda elementet i railen ────────┐ │
│   │  DU: tacka ja till offerten. Det är allt.              │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ▸ "Det här lovar vi inte" (<details>, stängd, rubriken      │
│    alltid synlig)                    (ACF: villkorsrad,      │
│    3-4 punkter villkor + 2026-korrigering)  per avdragstyp)  │
│                                                              │
│  Proof-rad, smal, midnight text 14px:                        │
│  Ampy Nordic AB · Registrerat elinstallationsföretag hos     │
│  Elsäkerhetsverket (kolla själv ↗) · F-skattsedel ·          │
│  Försäkrade                                     (mall-fast)  │
│                                                              │
│  [CTA primär, teal: ankare till sidans formulär]             │
│  [Sekundär textlänk: tel:] · [Tertiär textlänk: artikeln]    │
└──────────────────────────────────────────────────────────────┘
```
\* Mekanikraden är mall-fast text (inte ACF) men grindad på [GAP] fakturamodell-bekräftelsen, se §7.

### Mobil (≤767 px)
Samma DOM, staplad: eyebrow → H2 → mekanikrad → railen vertikal (chip + ring vänster i en 44 px-kolumn, text höger; streckad linje = `border-left: 2px dashed` på kolumnen, inga SVG-ikoner, inga -15px-hack) → DU-noden fullbredd → details-raden (tappbar, äkta affordance) → proof-rad radbruten → CTA fullbredd teal, tel-länk under. Målhöjd ≤ dagens 587 px trots mer innehåll (details:en är stängd).

### Vad som varierar per sida (allt annat är mall-fast)
`avdragstyp` (rot | gron_teknik | gron_teknik_villkorad | inget) · `h2` · `steg1_text/steg2_text/steg3_text` · `villkorsrad` (default per avdragstyp, överskrivbar per sida) · `cta_anchor` (default = sidans formulär-id). `inget` → blocket renderas inte (felsökning/elbesiktning, per kanon-beslutet).

## 3. KOMPLETT COPY

Alla UI-strängar är fria från tank-/halvstreck (rost R12). "!"-budget: en per variant. "kan" på allt skatte-/försäkringsjuridiskt (R8).

### ROT-varianten (/elservice/elcentral/)

**Eyebrow:** `ROT-avdrag 2026`

**H2:** `30 % ROT-avdrag när du byter elcentral. Vi tar ansvaret för att det blir rätt.`
(teal-span på "Vi tar ansvaret", server-renderad)

**Mekanikrad:** `Avdraget dras direkt på fakturan. Du ligger aldrig ute med pengarna och deklarerar ingenting själv.` *(grindad på [GAP-1])*

**Rail-etikett:** `Så går det till, och vem som gör vad`

**Steg 1** — chip `VI` — rubrik: `Vi kollar att avdraget gäller dig`
Text: `Innan du bestämmer dig går en av våra experter igenom ditt fall: arbetskostnaden, ROT-satsen och om du har skatt att dra av mot. Ser det inte ut att räcka säger vi det direkt, inte på slutfakturan.` *(operativa löftet grindat på [GAP-2])*

**Steg 2** — chip `VI` — rubrik: `Egna auktoriserade elektriker gör jobbet`
Text: `Ampy är ett registrerat elinstallationsföretag hos Elsäkerhetsverket. Det är ett krav för att ROT-avdraget ska gälla, och du kan kontrollera oss själv i deras register.` *(ordet "kontrollera oss själv" länkar till registret, foretag=12047521, [FACT] §1.1)*

**Steg 3** — chip `VI` — rubrik: `Vi sköter allt med Skatteverket`
Text: `Vi drar avdraget på fakturan, samlar dokumentationen och skickar in ROT-ansökan åt dig. Du fyller inte i en blankett och du väntar inte på någon återbäring.`

**DU-noden:** `DU: tacka ja till offerten. Det är allt!`

**Details-rubrik (alltid synlig):** `Det här lovar vi inte`
**Details-innehåll:**
- `ROT är 30 % av arbetskostnaden, inte av materialet. Vi visar exakt vad som är arbete i din offert.`
- `Taket är 50 000 kr per person och år. ROT och RUT delar dessutom ett samlat tak på 75 000 kr.`
- `Avdraget förutsätter att du äger bostaden och har betalat tillräckligt med skatt under året. Har du inte det kan Skatteverket justera avdraget i efterhand. Därför kollar vi det i steg 1.`
- `Sedan 1 januari 2026 är ROT-avdraget 30 %. Det tillfälliga 50-procentsavdraget upphörde vid årsskiftet.`

**Proof-rad:** `Ampy Nordic AB · Registrerat elinstallationsföretag hos Elsäkerhetsverket (kolla själv) · F-skattsedel · Försäkrade`

**CTA primär (ankare till formuläret):** `Vi kollar om avdraget gäller dig`
**Sekundär (textlänk):** `Hellre prata? Ring 010-265 79 79`
**Tertiär (textlänk):** `Så fungerar ROT-avdraget 2026` → /rot-avdrag-2026/

### Grön Teknik-varianten (/batterilagring/, avdragstyp = gron_teknik_villkorad)

**Eyebrow:** `Grön Teknik 2026`

**H2:** `50 % Grön Teknik-avdrag på batterilagring. Vi tar ansvaret för att det blir rätt.`

**Mekanikrad:** `Avdraget dras direkt på fakturan och gäller både arbete och material. Du ligger aldrig ute med pengarna.` *([GAP-1])*

**Steg 1** — chip `VI` — rubrik: `Vi kollar att avdraget gäller dig`
Text: `50 % gäller batterier som kopplas till din solcellsanläggning, det kollar vi först. Har du inte solceller kan i stället ROT ge 30 % på arbetskostnaden. Vi räknar på rätt sats innan du bestämmer dig.` *([FACT] §6.5 solar-gate; ROT-fallback [FACT] rad 580-582)*

**Steg 2** — chip `VI` — rubrik: `Egna auktoriserade elektriker gör jobbet`
Text: `Ampy är ett registrerat elinstallationsföretag hos Elsäkerhetsverket. Det är ett krav för att avdraget ska gälla, och du kan kontrollera oss själv i deras register.`

**Steg 3** — chip `VI` — rubrik: `Vi sköter allt med Skatteverket`
Text: `Vi drar avdraget på fakturan och skickar in Grön Teknik-ansökan åt dig. Du fyller inte i en blankett och du väntar inte på någon återbäring.`

**DU-noden:** `DU: tacka ja till offerten. Det är allt!`

**Details-rubrik:** `Det här lovar vi inte`
**Details-innehåll:**
- `Taket är 50 000 kr per person och år. Äger ni bostaden två kan ni tillsammans ha upp till 100 000 kr.` *([FACT] §6.5)*
- `Skatteverket kräver att samma företag levererar både hårdvaran och installationen för att materialdelen av avdraget ska gälla. Köper du batteriet själv på nätet kan den delen av avdraget försvinna.` *([FACT] §6.5 + rost-sample 11)*
- `Solceller har en egen, lägre sats: 15 % sedan 1 juli 2025. Vi räknar rätt sats på rätt del av jobbet.`
- `Avdraget förutsätter att du har betalat tillräckligt med skatt under året. Har du inte det kan Skatteverket justera i efterhand. Därför kollar vi det i steg 1.`

**Proof-rad, CTA-stack:** identiska med ROT (tertiär länk → /gron-teknik-2026/, etikett `Så fungerar Grön Teknik-avdraget 2026`).

## 4. DESIGNNOTER

- **Tokens:** teal #00a991 (endast: DU-noden, chips-kant, CTA, teal-span i H2), midnight #090b32 (all text, proof-rad), Outfit, ap*-skalan för spacing/typo. Vitt kort på ljusblå sektion behålls (sidkontinuitet), men skuggan byts från legacy-#bebebe till kanonisk token (§11.4-defekten) och våg-SVG:n utgår (utspäder enheten, playbook §2).
- **Signaturgreppet:** ansvars-chipsen (VI som outline-chip i midnight, DU-noden som blockets enda teal-fyllda yta). Visuell hierarki: det enda färgstarka elementet är besökarens icke-uppgift. Det är candour som layout.
- **Riv JS-kryckorna:** riktig `<ol>`, siffror som text i CSS-ritade ringar (border + border-radius), streckade linjer som pseudo-element (`border-top/left: 2px dashed`), teal-accent som server-renderad `<span>` i ACF-strängen. connector-lines.js + heading-highlight.js raderas; sen-pop- och resize-buggarna (UX-fynd F9) försvinner.
- **Motion:** behåll enterView-fadeIn (finns i Bricks-interaktionen); tillägg: DU-noden fadar in sist med 120 ms fördröjning (stagger, total ≤300 ms, `prefers-reduced-motion` respekteras). Inget mer.
- **Behålls från idag:** vitt kort, tre-stegs-silhuetten, H2-position, ljusblå sektion. Blocket ska kännas som en skärpning, inte ett främmande organ.
- **Details-raden:** samma mönster som elcentral-kollens hopfällbara fynd (synlig rubrikrad + ikon, bara innehållet fälls) — beprövat i Bricks/FluentSnippets.

## 5. MALLBARHET

**ACF-fält (7 st):** `avdragstyp` (rot | gron_teknik | gron_teknik_villkorad | inget) · `h2` (med tillåten `<span class="accent">`) · `steg1_text` · `steg2_text` · `steg3_text` · `villkorsrad` (repeater/textarea; DEFAULT-uppsättning per avdragstyp ligger i mallen, fältet överskrivs bara vid behov) · `cta_anchor` (default `#offert`).

**Skalningsbevis:** (a) De 14+ pris-intent-sidorna (T2/T3/T5/T6) kör `rot` med endast h2 + tre stegtexter ändrade, villkorsrad = default → identisk arbetsinsats med dagens mall. (b) Laddbox kör `gron_teknik` rakt av (50 % okomplicerat). (c) Batterilagring kör `gron_teknik_villkorad` (solcellsgrinden i steg 1 + egen villkorsrad). (d) Felsökning/elbesiktning kör `inget` → blocket renderas inte, vilket stänger dagens levande candour-defekt (blocket lovar 30 % på en sida vars egen FAQ säger att ROT inte medges). (e) Programmatiska ortsidor: alla fält faller tillbaka på defaults, bara h2 interpoleras → noll ny per-sida-kostnad. (f) Solcellssidor: `{X}=15` fungerar eftersom ingen sats är hårdkodad i mall-fasta strängar; mekanikraden och stegen är satslösa by design. En framtida fjärde avdragstyp (t.ex. Ladda bilen-bidraget) är en dataändring, inte ett bygge.

**Steg 2 och proof-raden är mall-fasta** (varierar aldrig): det är blockets verifierbara ryggrad och får inte kunna redigeras sönder per sida.

## 6. MÄTNING

Consent-gatad dataLayer per playbook §5, prefix `ampy_rotgt_*`, alla events med `page_slug`, `avdragstyp`, `experiment_id`, `variant`:
- `block_view` (enterView, runOnce) — exponeringsbas.
- `villkor_open` (details öppnas) — intent-signal; hypotes: öppnare konverterar högre eftersom katch-jägaren fått haken och stannat.
- `register_click` (utlänken till Elsäkerhetsverket) — förväntat låg volym; själva existensen är signalen, men klickarna är extremt kvalificerade.
- `cta_click` med `target: anchor | tel | artikel` — kvantifierar dagens exit-läcka (artikel) mot ny progression (anchor/tel).
- **KPI = leads per 1000 sidvisningar på sidor med blocket** (aldrig blockets egna klick; blockets jobb är sidans lead). A/B: dagens block vs riktning B, 2 veckors baslinje först, en variabel i taget, candour-innehållet aldrig testvariabel.
- Riktnings-specifikt bevis: om tillitstesen stämmer ska `villkor_open` korrelera positivt med `lead_submitted` och artikel-exits sjunka utan att lead-talet sjunker.

## 7. RISKER & ÖPPNA FRÅGOR

1. **[GAP-1] Fakturamodellen** — mekanikraden och steg 3 påstår att avdraget dras på fakturan för BÅDE ROT och GT. Nästan säkert sant (GT fungerar bara så) men ägarbekräfta att Ampy tillämpar det undantagslöst innan copyn låses. Utan bekräftelse: stryk mekanikraden, steg 3 faller tillbaka på "Vi samlar dokumentationen och skickar in ansökan åt dig".
2. **[GAP-2] Skatteutrymmes-kollen är ett operativt löfte.** Steg 1 lovar att Ampy går igenom skatteutrymmet före beslut. Om säljprocessen inte faktiskt gör det är raden ett påhittat åtagande (värsta sortens candour-brott). Ägaren måste bekräfta processen ELLER copyn mjukas till "vi går igenom villkoren med dig innan du bestämmer dig".
3. **[GAP-3] 5-årsregeln (ROT kräver bostad äldre än 5 år)** nämns av sökintent-analysen men finns inte i kanon §6.5 — den är därför UTELÄMNAD ur min villkorsrad. Verifiera mot Skatteverket + kanon innan den ev. läggs till.
4. **[GAP-4] Standalone-batteri utan solceller** — GT-berättigandet har en öppen bekräftelsepunkt (§6.5 rad 587). Min GT-steg-1-copy använder bara den bekräftade ROT-fallbacken, men formuleringen ska ägargranskas.
5. **[GAP-5] Policy vid nekat avdrag** — "vad händer om Skatteverket säger nej?" är en topp-PAA som riktningen INTE besvarar eftersom Ampys åtagande inte finns dokumenterat. Ägarfråga; ett ärligt svar här vore riktningens starkaste möjliga tillägg.
6. **Risk: utlänken till Elsäkerhetsverket** är en medveten exit-yta. Mitigering: `target="_blank"`, mäts via `register_click`; paradox-hypotesen (länken som vågar finnas bygger tillit hos dem som aldrig klickar) ska bevisas i data, inte antas.
7. **Risk: "Det här lovar vi inte"-rubriken** är djärv; om ägaren viker sig är fallbacken "Ärligt om villkoren" (svagare men samma innehåll).
8. **Samspel med prisblocket i pos 2 (kanon-beslut):** denna riktning bär inga siffror utom satser/tak, så den dubblerar inte prisblockets kronor — men ordningen block-mot-block (avdrag före eller efter pris) måste avgöras i nästa fas.
9. **Overlap-gräns:** kronexempel (riktning A-territorium) och interaktiv kvalificerings-quiz (riktning C-territorium) är medvetet uteslutna; details-raden är statisk text, inte diagnostik.

**Lästa källor:** /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/rot.html · /Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/gron-teknik.html · /Users/juliuscallahan/Desktop/Claude Code/ampy-foretagsdata.md (§1.1–1.5, §6.5–6.7, §7) · /Users/juliuscallahan/Desktop/Claude Code/.claude/skills/ampy-rost/SKILL.md · /Users/juliuscallahan/Desktop/Claude Code/.claude/skills/ampy-webb-playbook/SKILL.md