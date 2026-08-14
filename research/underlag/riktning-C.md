# RIKTNING C — "Vad gör jag NU?" (beslutsacceleratorn)

Grounding: läst `ampy-foretagsdata.md` (§1, §3.5, §6.5–6.7, §7, §8, §9), `ampy-rost/SKILL.md`, `ampy-webb-playbook/SKILL.md` samt klonerna `rot-gt-cro/rot.html` + `gron-teknik.html`. Alla siffror nedan är kanon (ROT 30 % arbetskostnad; GT batteri/laddbox 50 %, sol 15 %; tak 50 000 kr/person/år, 2 ägare → 100 000; batteri utan solceller → ROT 30 % på arbetet, [FACT] §6.5). Alla UI-strängar är fria från tank-/halvstreck (R12) och "!"-budgeten är max en per variant.

---

## 1. TES

Besökaren i position 2 har just scrollat förbi ett formulär utan att fylla i det, vilket betyder att hen bär en obesvarad fråga, och den frågan är nästan alltid "gäller avdraget MIG?" (rädsla #2 i §7.1, skatte-rug-pull). Riktning C låter besökaren själv besvara den frågan med två tryck: en mikro-diagnostik i miniatyr (Arketyp B-DNA, bevisad i Elcentral-kollens blockläge) som ger ett ärligt, "kan"-hedgat besked och i samma andetag rutar den nu varma besökaren tillbaka till sidans konverteringspunkter, aldrig ut till infosidan. Det är den enda riktningen som samtidigt löser blockets tre defekter i ett grepp: passiviteten (ägarmål 3 får en mekanik), exit-CTA:n (klicket stannar på sidan) och candour-luckan (villkoren blir själva interaktionen i stället för finstilt, inklusive batteri-solcellsgrinden som dagens GT-H2 döljer).

---

## 2. WIREFRAME

### Desktop (kort på ljusblå sektion, som idag, ~1200 px)

```
┌─────────────────────────────────────────────────────────────────┐
│  H2 (ACF, per sida)  [teal-span server-renderad, inte JS]       │
│                                                                 │
│  ┌──────────────────────────────┐  ┌─────────────────────────┐  │
│  │ AVDRAGSKOLLEN (~55 %)        │  │ SÅ GÅR DET TILL (~45 %) │  │
│  │ Ledtext (template-konstant)  │  │ <ol> vertikal rail,     │  │
│  │ Fråga 1 + svarschips         │  │ CSS-ringar 1-2-3,       │  │
│  │ Fråga 2 + svarschips         │  │ ingen connector-JS      │  │
│  │ ┌──────────────────────────┐ │  │ Steg 1 (ACF-text)       │  │
│  │ │ BESKED (aria-live,       │ │  │ Steg 2 (ACF-text)       │  │
│  │ │ fade-in 200 ms)          │ │  │ Steg 3 (ACF-text)       │  │
│  │ │ + besked-CTA (teal)      │ │  │                         │  │
│  │ └──────────────────────────┘ │  └─────────────────────────┘  │
│  └──────────────────────────────┘                               │
│                                                                 │
│  CTA-RAD (alltid synlig, oberoende av interaktion):             │
│  [Primär teal-pill: ankare till formuläret]                     │
│  [Sekundär textlänk: tel 010-265 79 79]                         │
│  Fotrad: diskret textlänk till fördjupningsartikeln (ACF-URL)   │
└─────────────────────────────────────────────────────────────────┘
```

- **Frågebank + beskedstexter = template-konstanter per avdragstyp** (ROT-bank / GT-bank / villkorad / av). De varierar ALDRIG per sida. Per sida varierar bara H2 + de tre stegtexterna (exakt dagens ACF-yta) + artikel-URL.
- Alla beskedstexter ligger server-renderade i DOM (dolda via CSS tills valda). Ingen data:-URI, ingen JS-injektion (lärdomen från leadmagnet-auditen: Google måste kunna läsa svaren).
- No-JS-fallback: utan JS visas frågorna som statisk villkorslista ("Det här avgör om avdraget gäller dig") plus alla besked hopfällda i en `<details>`. Blocket är aldrig tomt.

### Mobil (375 px)

Ordning: H2 → Avdragskollen (chips fullbredd, 48 px tapphöjd) → besked → besked-CTA → `<details>` "Så går det till" (tre rader, hopfälld; sparar ~200 px mot dagens 587) → CTA-rad → artikel-textlänk. Ingen ikonkolumn, ingen streckad linje; stegen är en enkel numrerad lista i detaljen.

---

## 3. KOMPLETT COPY

### 3a. ROT-varianten, /elservice/elcentral/

**H2 (ACF):** "Byta elcentral med 30 % ROT-avdrag. Kolla på två tryck om det gäller dig"
(teal-span på "om det gäller dig", server-renderad)

**Avdragskollen, ledtext (template-konstant):** "Två frågor avgör det mesta. Resten räknar vi på åt dig."

**Fråga 1:** "Äger du bostaden där jobbet ska göras?" [Ja] [Nej]
**Fråga 2:** "Är bostaden äldre än fem år?" [Ja] [Nej] [Vet inte]

**Besked, alla kombinationer:**
- **Ja + Ja:** "Goda nyheter: du kan använda ROT-avdraget. 30 % av arbetskostnaden dras direkt på fakturan, du ligger aldrig ute med pengarna, och vi sköter hela ansökan till Skatteverket. Avdraget förutsätter att du har skatt att räkna av mot, det kollar vi i den kostnadsfria genomgången." → besked-CTA: **"Få ditt pris efter ROT-avdrag"** (ankare till formuläret)
- **Nej på ägande:** "ROT-avdraget kräver att du äger och bor i bostaden, så i hyresrätt gäller det inte. Jobbet går förstås att göra ändå. Ring oss så lämnar vi ett fast pris utan avdrag." → besked-CTA: "Ring 010-265 79 79" (tel:)
- **Nej på ålder:** "ROT gäller bostäder äldre än fem år, så här får avdraget vänta. Vi lämnar gärna ett fast pris ändå, utan överraskningar på slutfakturan." → besked-CTA: "Få ett fast pris" (ankare)
- **Vet inte:** "Helt okej, det är vanligt. Vi kollar det åt dig i den kostnadsfria genomgången, innan du bestämmer någonting." → besked-CTA: "Boka kostnadsfri genomgång" (ankare)

**Stegen (ACF-texter, lagade och utfallsformulerade):**
1. **"Kostnadsfri genomgång"** — "Våra experter räknar ut hur stort ditt ROT-avdrag kan bli och lämnar ett fast pris innan du bestämmer dig."
2. **"Egna, auktoriserade elektriker"** — "Installationen görs av våra egna, auktoriserade elektriker, registrerade hos Elsäkerhetsverket."
3. **"Vi sköter Skatteverket"** — "Avdraget dras direkt på fakturan. Vi skickar in ROT-ansökan åt dig, du fyller inte i en enda blankett."

**CTA-raden (alltid synlig):**
- Primär (teal): "Få ditt pris efter ROT-avdrag" → ankare till sidans formulär
- Sekundär (textlänk): "Hellre prata? Ring 010-265 79 79" → tel:+46102657979
- Fotrad: "Fördjupning: Så fungerar ROT-avdraget 2026" → /rot-avdrag-2026/

### 3b. GT-varianten, /batterilagring/

**H2 (ACF):** "Batterilagring med upp till 50 % Grön Teknik-avdrag. Två frågor visar vad som gäller dig"

**Fråga 1:** "Har du solceller, eller installerar du i samband med batteriet?" [Ja] [Nej]
**Fråga 2:** "Äger du bostaden?" [Ja] [Nej]

**Besked:**
- **Ja + Ja:** "Då kan du använda Grön Teknik-avdraget: 50 % på både arbete och material, draget direkt på fakturan. Taket är 50 000 kr per person och år, äger ni huset två kan ni räkna på upp till 100 000 kr. Vi skickar in ansökan till Skatteverket åt dig. Avdraget förutsätter skatt att räkna av mot, det räknar vi på i genomgången." → besked-CTA: "Få ditt pris efter avdrag"
- **Nej på solceller:** "Utan solceller gäller inte 50 % Grön Teknik för batteriet. Då kan i stället ROT-avdraget användas, 30 % på arbetskostnaden. Vi räknar på båda vägarna åt dig så att du vet exakt vad som gäller innan du bestämmer dig." → besked-CTA: "Räkna på mitt fall" (ankare). *Detta besked är riktningens costly signal (R11): blocket säger självmant den lägre siffran.*
- **Nej på ägande:** "Grön Teknik-avdraget kräver att du äger bostaden. Bor du i bostadsrätt eller hyresrätt är det föreningen eller fastighetsägaren som söker. Ring oss så reder vi ut vad som gäller i ditt fall." → besked-CTA: "Ring 010-265 79 79"

**Stegen:** samma tre rubriker som ROT; steg 1-text "…hur stort ditt Grön Teknik-avdrag kan bli…", steg 3-text "…skickar in Grön Teknik-ansökan åt dig…".

**CTA-raden:** Primär "Få ditt pris efter avdrag" (ankare) · Sekundär tel-länk · Fotrad "Fördjupning: Så fungerar Grön Teknik-avdraget 2026" → /gron-teknik-2026/.

---

## 4. DESIGNNOTER

- **Behålls:** vitt kort på ljusblå sektion (positionskontinuitet), rundade hörn, enterView-fadeIn, tre-stegs-skelettet, teal-accent i H2.
- **Utgår:** `connector-lines.js` och `heading-highlight.js` (ersätts av `<ol>` + CSS-ringar med text-siffror respektive server-renderad `<span>`), de 6 ring-SVG:erna, våg-SVG:n (webb-playbook §2: dekor späder ut den enda devicen), exit-knappen som primär handling.
- **Signaturenhet = Avdragskollen** (en och endast en, per §2-doktrinen). Chips: vit yta, 1,5 px midnight-border 20 %, vald = teal #00a991 fylld med vit text; besked-kortet får 3 px vänsterkant i teal (positivt), midnight (neutralt/negativt). GT-varianten får INTE en egen grön parallellvärld: samma komponenter, accenten styrs av en variabel (eliminerar dagens ROT/GT-asymmetrier).
- **Typografi/tokens:** Outfit; H2 = aptext-2-5xl w500, frågor aptext-m w500, besked aptext-m w300, apspace-skalan; skugga från token, aldrig legacy-#bebebe (§11.4-defekten).
- **Motion ≤ 300 ms:** chip-val 150 ms ease-out, besked fade+4 px slide 200 ms, ankar-scroll native smooth. `prefers-reduced-motion` respekteras.
- **Tillgänglighet:** chips = riktiga `<input type="radio">` + labels, besked i `aria-live="polite"`, fokusringar i teal, 48 px tapphöjd mobil.

---

## 5. MALLBARHET

**ACF-fält (per sida):**
1. `avdragstyp` (val: `rot` | `gron_teknik` | `gron_teknik_villkorad` | `inget`) — styr frågebank, beskedsbank, procentvariabel, accent och artikel-URL-default. `inget` = blocket renderas inte (felsökning/elbesiktning per kanon, dödar dagens levande candour-defekt där FAQ:n säger nej och blocket säger 30 %).
2. `h2_text` (med span-markering för teal)
3. `steg1_text`, `steg2_text`, `steg3_text` (exakt dagens yta)
4. `artikel_url` (default per avdragstyp)
5. `form_anchor` (default sidans formulär-id; kan pekas mot prisblocket där det finns)

**Skalningsbevis:** frågebankerna och alla beskedstexter är template-konstanter, inte ACF, så 22 tjänstesidor + samtliga programmatiska ortssidor mappas till fyra lägen: ~14 pris-intent-sidor → `rot`; laddbox/batteri/sol → `gron_teknik` (procentvariabeln tål 15 utan att någon "50" läcker, defaulten är aldrig 50); lastbalansering → `gron_teknik_villkorad` tills GAP 3 avgjorts; felsökning/elbesiktning → `inget`. En ny programmatisk sida kostar noll ny copy: den ärver tjänstens läge. En ROT-fråga om bostadsålder är identiskt sann på alla 22 tjänster, det är därför diagnostiken (till skillnad från prisexempel) är mall-säker utan ägargrindade siffror per sida.

---

## 6. MÄTNING (consent-gatad dataLayer per playbook §5, alla events med `page_slug`, `variant`, `experiment_id`)

- `rotgt_block_view` (enterView)
- `rotgt_answer` {question_id, answer} — intent-signal gratis
- `rotgt_verdict` {verdict: positiv | rot_fallback | ej_berattigad | osaker}
- `rotgt_cta_click` {target: form_anchor | tel | article} — mot dagens block där 100 % av klick är article-exit
- `rotgt_steps_open` (mobil-details)

**Bevisen att riktningen fungerar:** (1) KPI = leads per 1000 sidvisningar (inte blockengagemang, blockets jobb är sidans lead); (2) andel `verdict → cta_click(form_anchor|tel)` > andel `cta_click(article)`; (3) A/B mot dagens block med 2 veckors baslinje först, dagens block instrumenteras med `view` + `cta_click` innan bytet. Candour-reglerna är aldrig testvariabler.

---

## 7. RISKER & ÖPPNA FRÅGOR

1. **[GAP] Fakturamodellen för ROT:** "dras direkt på fakturan, du ligger aldrig ute" kräver ägarbekräftelse att Ampy alltid tillämpar den på ROT (för GT är utförar-ansökan regimfakta). Utan bekräftelse stryks likviditetsraden till "vi sköter hela ansökan".
2. **[GAP] 5-årsregeln:** ROT-villkoret "bostad äldre än fem år" finns inte i `ampy-foretagsdata` §6.5 (som bara bär sats/tak/bas). Kanonisera villkoret (+ äga/bo-kravet) med ägar- eller elektrikersignering innan frågebanken låses; web-rate-check är förbjuden, så detta är en ägargrind.
3. **[GAP] Fristående batteri:** §6.5 rad 587 flaggar standalone-eligibility som obekräftad; mitt "Nej på solceller"-besked påstår ROT-fallback (som ÄR [FACT]) men aldrig att GT kan gälla ändå. Håll den gränsen vid granskning.
4. **Juridisk precision i besked:** hyresrätts- och BRF-beskeden förenklar (BRF-batteri går via föreningen). Elektriker-/ägargranskning av samtliga 7 beskedstexter före lås.
5. **Interaktionsrisk:** en andel besökare trycker aldrig. Därför är CTA-raden verdict-oberoende och alltid synlig; blocket måste bära ägarmål 1–2 även statiskt (stegen + H2 gör det).
6. **Ärliga nej-besked kan sänka leadvolym kortsiktigt** (hyresrätt, nytt hus). Det är avsiktligt: ett filtrerat lead-flöde är candour-positionens poäng, men ägaren ska äga beslutet uttryckligen.
7. **Samspel med prisblocket i pos 3:** besked-CTA:ns ankare får inte konkurrera med prisblockets egen väljare; avgör i wireframe-fasen om `form_anchor` pekar upp (hero-form) eller ner (prisblock) per sidtyp. Inga siffror dubbleras: detta block bär villkor + procent, prisblocket bär kronor.
8. **Snabbfixar oberoende av riktningsval:** "Vår experter", "ROT ansökan", "genom" → "med", "30%" → "30 %" kan ACF-lagas idag.