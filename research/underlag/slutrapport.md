# SLUTRAPPORT: ROT/Grön Teknik-processblocket → position 2

**Underlag:** 5 analyslinser (CRO, konsumentpsykologi, UX/IA, copy, creative direction, sökintent), 3 fullständiga riktningsspecar + 3 oberoende granskningar. Alla fakta mot `ampy-foretagsdata.md`-kanon (ROT 30 % arbetskostnad, GT batteri/laddbox 50 %, sol 15 %, tak 50 000 kr/person/år). Datum: 2026-08-14.

---

## 1. EXECUTIVE SUMMARY

**Vad analysen visade.** Besökaren i position 2 har per definition scrollat förbi hero-formuläret utan att konvertera — hen bär en obesvarad invändning, och den är nästan alltid "gäller avdraget MIG, eller är siffran juicad?" (rankad rädsla #1–2, §7.1). Mot det jobbet underpresterar dagens block på nästan varje rad: det besvarar 1,5 av 12 verkliga kundfrågor, dess enda klickbara element exporterar sidans varmaste trafik till en infosida, blockets starkaste sanning (avdraget dras direkt på fakturan — du ligger inte ute med pengarna) sägs aldrig, noll villkor nämns (vilket den katch-jagande läsaren tolkar som att haken är dold), grammatikfel ligger live i mallen på 22+ sidor, och strukturen är tekniskt skör (JS-ritade linjer, SVG-siffror, live-404:or) samt strukturellt oförmögen till candour: den lovar 30 % även på sidor där ROT inte medges och 50 % på batterisidor utan att nämna solcellsgrinden. Betyg minnesvärdhet: 2/10. Oinstrumenterat.

**Riktning A — "Kvittot" (värde-konkretisering).** Signaturenhet: ett stiliserat midnight-fakturautdrag som visar mekanismen (Arbetskostnad 100 % → ROT −30 % → Du betalar 70 %), med ägargrindat kronläge per sida när priskanonen låsts. Stegen blir en vertikal CSS-rail med utfallsformulerade texter, primär-CTA ankrar till prisblocket i stället för att exportera trafiken. Granskningsdom: **SHIPBAR MED FIX** — dramatiserar rädsla #1, matar prisblocket med exakt den storhet det skördar, mall-säker i procentläge dag 1.

**Riktning B — "Tillitsmaskineriet" (ansvarsrailen).** Signaturenhet: trestegskedjan får ansvars-chips (VI · VI · VI) krönta av blockets enda teal-fyllda yta: "DU: tacka ja. Det är allt!", plus en "Det här lovar vi inte"-rad där villkoren står i öppen text och en verifierbar proof-rad med klickbar Elsäkerhetsverket-länk. Granskningsdom: **SHIPBAR MED FIX** — bästa faktahygienen av de tre, lägst byggkostnad, men en BLOCK-mening (uppfunnet ROT-villkor) måste bytas före allt annat. Candour som layout.

**Riktning C — "Avdragskollen" (beslutsacceleratorn).** Signaturenhet: en mikro-diagnostik med två tryck ("Äger du bostaden?" osv.) som ger ärliga, "kan"-hedgade besked — inklusive självmant lägre siffra vid nej på solceller — och rutar den varma besökaren till formulär/telefon, aldrig ut. Granskningsdom: **OMARBETA ETT VARV** — konceptuellt starkaste läsningen av position 2, men mallmekaniken producerar ett falskt besked på laddbox-sidor (BLOCK), och frågebanken vilar på tre fakta som inte finns i kanon (5-årsregeln, äga/bo, BRF-förfarandet).

**Rekommendation: Riktning A, med B:s DU-nod + proof-rad som ingredienser, och C parkerad tills faktagrindarna stängts.** Skäl: (1) A är den enda riktningen som löser alla tre ägarmålen med EN mekanism — kvittot bevisar att avdraget är verkligt (tillit), raderna ÄR processen i pengaform (förklaring), och den ägda siffran primar prisblocket direkt under (engagemang/priming); (2) A är mall-säker utan ägargrindade siffror (procentläget kräver noll per-sida-data) och degraderar aldrig — kronläget slås på sida för sida i takt med prissigneringar; (3) creative-direction-analysen rankade oberoende exakt denna kombination (kvitto + ansvarsrail) som #1 av 7 utforskade grepp. B är fallback om ägaren vill ha lägsta risk/snabbaste leverans, och blir starkare av att dess proof-rad och DU-nod lånas in i A. C:s frågebank är rätt idé för en senare iteration — efter kanonisering av villkoren. **OBS: både A:s och B:s bärande mening ("draget direkt på fakturan") står och faller med GAP 1 (fakturamodell-bekräftelsen) — det är den första ägargrinden, före allt bygge.**

Fem defektlagningar kan shippas idag, oberoende av riktningsval (se §6, steg 1).

---

## 2. DE 10 VIKTIGASTE TVÄRGÅENDE FYNDEN (rankade)

| # | Fynd | Källa-lins |
|---|---|---|
| **1** | **Exit-CTA:n exporterar sidans varmaste icke-konverterade trafik.** Blockets enda klickbara element ("Läs mer om ROT-avdrag" → infosida) fångar exakt den mest kvalificerade osäkra besökaren — och skickar hen bort från sidan med formuläret. Informationen klicket köper ryms i ~40 ord. På mobil är knappen dessutom blockets mest framträdande element. | CRO F1 · Psykolog F9 · UX F6 · Copy A9 · Sökintent |
| **2** | **Fakturamekanismen — blockets starkaste mening — sägs aldrig.** "Avdraget dras direkt på fakturan, du ligger inte ute med pengarna" dödar tre rädslor i en rad (likviditet, krångel, göra-fel-risk) och kollapsar den folkliga fel-modellen "betala fullt, deklarera, hoppas". Topp-PAA #3, obesvarad. *(Grindas på GAP 1 innan den skrivs.)* | Psykolog F2 · CRO F4 · UX F11 · Sökintent PAA 3 |
| **3** | **Noll villkor = misstänkt tystnad.** Skatteutrymme, tak 50 000 kr/person, äga/bo, batteri-solcellsgrinden — inget nämns. Den disconfirmation-sökande svensken antar att katchen är dold, inte frånvarande, och googlar vidare (= lämnar sidan). Att ge haken frivilligt är candour-differentieringens kärna (R11) och strukturen har inte ens en slot för den. Blocket besvarar 1,5 av 12 verkliga PAA-frågor. | CRO F3 · Psykolog F3/F4 · Sökintent §2 · UX F11 |
| **4** | **Procent utan förankring konverterar inte — och H2:n är MFL-riskabel.** "Sänk kostnaden ... genom 30% rot-avdrag" läses som "hela jobbet 30 % billigare"; ROT gäller bara arbetskostnaden. Inget kronexempel, ingen bas ("på VAD?"), och under pris-direktivet (inga priser på /elservice/*) är detta block sidans ENDA pris-surrogat — som idag inte levererar någon prismekanik alls. | CRO F2 · Psykolog F5 · Copy A5 · Sökintent §1A |
| **5** | **Mallen ljuger strukturellt på fel sidor.** Blocket lovar 30 % på felsökning/elbesiktning där sidans egen FAQ nekar ROT (levande candour-defekt), och 50 % villkorslöst på batterisidan trots solcellsgrinden. En mall som bara kan säga "X % avdrag" behöver eligibility-lägen (rot / gt / gt-villkorad / inget), inte textbyten. | Sökintent §1B–C · UX F15 · Psykolog F11 |
| **6** | **Språkfel live i mall-copyn på 22+ sidor.** "Vår experter" (grammatik), "ROT ansökan" (särskrivning), fyra stavningar av samma begrepp i ett block på ~60 ord, "genom" som preposition. För en analytisk köpare av elarbete är textslarv en proxy för slarv i elcentralen — och särskrivningar är hånet i exakt de forum där hantverkarpubliken avgör om Ampy är seriösa. | Copy A1–A4 · CRO F6 · UX F12 · Psykolog F10 |
| **7** | **Vi-perspektiv i stället för du-utfall.** Alla tre steg har "vi/vår" som subjekt; besökaren värderar inte leverantörens ansträngning utan sin egen frånvaro av ansträngning. Ansvarsasymmetrin (kundens insats ≈ noll) är blockets verkliga argument och uttrycks ingenstans — inga aktörer, inga tider, "certifierade" i stället för det juridiskt meningsbärande "auktoriserade". | Psykolog F1/F14 · CRO F7 · UX F4 · Copy A7–A8 |
| **8** | **Noll bevis i ett block vars jobb är tillit.** Elsäkerhetsverket-registreringen (kollningsbar, foretag=12047521), F-skatt och Skatteverket som avdragets garant — de mest verifierbara trust-atomerna Ampy äger — används inte. En "kolla oss själv"-affordans är omöjlig för en bluffirma att kopiera. | CRO F5 · Psykolog F7 · Copy A8 |
| **9** | **Teknisk och semantisk skuld multiplicerad över 22+ sidor.** Linjer ritade av JS (trasiga vid resize, sen-pop 60–500 ms), teal-accent via `last-3`-JS som träffar prepositionen "genom", siffror som SVG-bilder (skärmläsare hör inget, ingen `<ol>`), 6 SVG-requests per block, två live-404:or, ROT/GT byggda som två parallella system med tre asymmetrier, skugga på kanoniserad `#bebebe`-defekt. | UX F1/F8–F10 · Creative Director §1 |
| **10** | **Generiskt och oinstrumenterat.** Tre steg med ringar och streckade linjer är branschens mest utslitna mönster — blocket klarar inte §11-testet ("kunde det ligga på en konkurrents sajt?"), det är ~90 % identiskt över alla sidor (inlärd blindhet vid andra sidvisningen), och det avfyrar noll events — flytten till position 2 kan varken utvärderas eller itereras. | CD §1 · UX F3/F13/F14 · CRO F10/F12 |

---

## 3. RIKTNINGARNA I FULL SPEC (granskningsfixar inarbetade)

### 3A. RIKTNING A — "KVITTOT" (rekommenderad)

**Tes.** Ett procenttal ägs av ingen; konverteringsögonblicket är när den abstrakta siffran blir en siffra besökaren äger. Kvittot gör avdraget bokstavligt: ett stiliserat fakturautdrag som visar vad som dras, från vad, och att du inte ligger ute med pengarna — och den ägda siffran är exakt vad prisblocket direkt under skördar.

**Struktur (desktop):** vitt kort på ljusblå sektion (behålls). Vänster ~55 %: H2 (teal-accent på mekanismfrasen, server-renderad) + vertikal steg-rail (`<ol>`, CSS-ringar med textsiffror, `border-left: 2px dashed` — connector-lines.js och heading-highlight.js utgår) + `<details>` "Gäller avdraget dig?". Höger ~45 %: KVITTOT — midnight-panel `#090b32`, eyebrow, tre rader, teal minusrad, fotnot. CTA-rad: primär teal-pill (ankare → prisblock/formulär) + sekundär textlänk till artikeln. **Mobil:** H2 → kvittot fullbredd → stegen som kompakt rail med hopfällbara brödtexter (rubrikerna måste bära budskapet oexpanderade — verifieras i ampy-syn) → details → fullbredds-CTA. Våg-SVG:n och de 6 ring-SVG:erna utgår.

**Copy ROT (/elservice/elcentral/):**
- H2: "Byt elcentral med 30 % ROT-avdrag, draget direkt på fakturan" *(mekanismfrasen i teal; hela frasen grindad på GAP 1)*
- Kvitto-eyebrow: "SÅ SER DET UT PÅ FAKTURAN"
- Rader (procentläge, mall-default): "Arbetskostnad — 100 %" / "ROT-avdrag 30 % — −30 %" (teal) / "Du betalar — 70 % av arbetskostnaden"
- **Fotnot (GRANSKNINGSFIX inarbetad — tak och skatteutrymme delade i två meningar):** "ROT gäller arbetskostnaden, inte materialet. Taket är 50 000 kr per person och år. Avdraget förutsätter dessutom att du har betalat tillräckligt med skatt. Det räknar vi på i steg 1."
- Kronläge (endast vid ägarsignerat `exempel_arbetskostnad`): etikett "Räkneexempel", 20 000 / −6 000 / 14 000 kr + disclaimern "Ett typexempel, inte ett erbjudande. Ditt fasta pris får du i offerten."
- Steg 1: "Du får en exakt siffra innan du bestämmer dig" — "En av våra experter går igenom ditt projekt, kollar att du har utrymme för avdraget och lämnar ett fast pris. Kostnadsfritt."
- Steg 2: "Egna, auktoriserade elektriker gör jobbet" — "Installationen görs av våra egna elektriker. Vi är registrerade hos Elsäkerhetsverket, det kan du kontrollera själv." *(exakt den sourcade frasen "egna, auktoriserade" i alla ACF-varianter — blanda aldrig in "certifierade")*
- **Steg 3 (BLOCK-FIX inarbetad):** "Du betalar priset efter avdrag" — "Avdraget är redan draget på fakturan. Vi skickar in ROT-ansökan till Skatteverket och begär resten därifrån. **Du behöver inte ansöka om något själv.**" *(ersätter det strukna "Du deklarerar ingenting" — kategoriskt falskt-angränsande: beloppet dyker upp i deklarationen och kan justeras, vilket blockets egen villkorstext säger)*
- `<details>`: "Gäller avdraget dig?" — äga/bo, äldre än fem år, skatteutrymme, "kan Skatteverket justera i efterhand ... därför räknar vi på ditt fall innan du bestämmer dig."
- Primär CTA: "Se ditt pris efter ROT-avdrag" · Sekundär: "Så fungerar ROT-avdraget 2026" → /rot-avdrag-2026/

**Copy GT (/batterilagring/):**
- H2: "Batterilagring med 50 % Grön Teknik-avdrag, draget direkt på fakturan"
- **Eyebrow (GRANSKNINGSFIX): "SÅ FUNKAR AVDRAGET"** *(inte "så ser det ut på fakturan" — den riktiga GT-fakturan landar på ~48,5 % via 97-procentsschablonen)*
- Rader: "Arbete och material — 100 %" / "Grön Teknik-avdrag 50 % — −50 %" / "Du betalar — 50 %"
- **Fotnot (GRANSKNINGSFIX — schablonraden tillagd, solcellsraden grindad):** "50 % gäller batterier som kopplas till din solcellsanläggning. [ÄGARGRINDAT, GAP 3: Utan solceller kan i stället ROT ge 30 % på arbetet.] Med Skatteverkets 97-procentsschablon blir det cirka 48,5 % av totalpriset. Taket är 50 000 kr per person och år, äger ni huset två kan ni använda båda. Avdraget förutsätter skatt att dra av mot."
- Steg 1: "...kollar först att du kvalificerar för 50 %. Gör du inte det säger vi det direkt, och räknar på ROT i stället." · Steg 2: samma-företag-regeln (kanoniskt §8.3-sample) · Steg 3: som ROT med "Grön Teknik-ansökan" + BLOCK-fixen.

**Mallbarhet (fixar inarbetade):** ACF-fält: `h2` + **`h2_accent` (NYTT — accentdelen som eget fält, mallen konkatenerar; ersätter odefinierad span-mekanik)**, `steg1/2/3`, `avdragstyp` (rot | gron_teknik | gt_villkorad | inget — `inget` renderar inte blocket), `villkorsrad`, `exempel_arbetskostnad` (opt-in), `ankarmal` (default per sida, ej hårdkodat). **`procentsats` som fritt talfält är BORTTAGET (granskningsfix): satsen härleds ur `avdragstyp` från EN central konstant i mallen — satsändringar och redaktörsfel ("50 på en solsida") blir omöjliga per konstruktion.** Procentläget kräver noll per-sida-data → alla 22 sidor + programmatiska fungerar dag 1. Regel: kronläget aktiveras aldrig på en sida där prisblocket visar annat belopp för samma storhet.

**Mätning:** consent-gatade events `rotgt_block_view` / `rotgt_receipt_mode` / `rotgt_details_open` / `rotgt_cta_click {anchor|article}`, alla med `page_slug`, `variant`, `experiment_id`. KPI = leads/1000 sidvisningar. **A/B-design (granskningsfix): baslinje = GAMLA blocket i NYA positionen (flytten sker ändå), därefter gamla vs nya blocket i position 2 — annars går positionseffekt inte att skilja från designeffekt.**

**Kvarstående VARNINGAR (öppet redovisade):**
1. Ankar-CTA:n kan bli en noop när prisblocket ligger en halv viewport ner — mät klickfrekvens mot prisblocks-exponering, byt mål vid hackigt mikrohopp.
2. `tabular-nums` förutsätter tnum-feature i Outfit (obekräftat i tokenkanon) — testa i byggfasen, fallback = högerställd fast kolumnbredd.
3. Kvittot kan misstas för ett erbjudande — mitigerat (procentläge utan kronor, "Räkneexempel"-etikett), men verifiera att disclaimern inte trunkeras på mobil.
4. 15 %-solsidorna ger en blekare minusrad — det är priset för candour, acceptera (15 % ritas som 15 %).
5. Mobilmålhöjden ≤587 px är rimlig men obevisad — mät i ampy-syn.
6. Redundansrisk mot heron: H2:ns jobb är mekanismen, inte procenten — håll skillnaden när per-sida-rubriker skrivs.

**Hårda grindar före bygge:** GAP 1 (fakturamodellen — H2 + steg 3 faller utan den), GAP 2 (kronbelopp), GAP 3 (solcellsraden).

---

### 3B. RIKTNING B — "TILLITSMASKINERIET" (ansvarsrailen)

**Tes.** Katch-jägaren avväpnas bara av att få haken frivilligt, se ansvaret synligt och kunna kontrollera påståendena själv. Blocket byggs om till ett tillitsmaskineri: ansvars-chips på varje steg (VI · VI · VI), en enda avvikande teal-nod ("DU: tacka ja. Det är allt!"), villkoren i öppen text under rubriken "Det här lovar vi inte", och en klickbart verifierbar proof-rad.

**Struktur:** vitt kort (behålls, skugga från token, våg utgår). Eyebrow-pill ("ROT-avdrag 2026") → H2 vänsterställd → mekanikrad → ansvarsrailen (`<ol>`, CSS-ringar, chips; DU-noden = blockets enda teal-fyllda yta) → `<details>` "Det här lovar vi inte" (**existensen mall-obligatorisk — kan aldrig redigeras bort per sida; endast innehållet är överskrivbart**) → proof-rad → CTA-stack (primär ankare till formuläret, sekundär tel-textlänk, tertiär artikellänk). Mobil: samma DOM staplad, details stängd, CTA fullbredd.

**Copy ROT (fixar inarbetade):**
- H2: "30 % ROT-avdrag när du byter elcentral. Vi tar ansvaret för att det blir rätt." (teal på "Vi tar ansvaret")
- **Mekanikrad (V1+V2-FIX — "aldrig" och "deklarerar" borttagna):** "Avdraget dras direkt på fakturan. Du betalar bara nettot och fyller inte i någon blankett själv." *(avdragstyp-keyad konstant, inte mall-fast sträng (V5-fix); hela raden grindad på GAP 1 — utan bekräftelse stryks den)*
- Steg 1 — chip VI — "Vi kollar att avdraget gäller dig": "Innan du bestämmer dig går en av våra experter igenom ditt fall: arbetskostnaden, ROT-satsen och om du har skatt att dra av mot. Ser det inte ut att räcka säger vi det direkt, inte på slutfakturan." *(operativt löfte — grindat på GAP 5; mjukas annars till "vi går igenom villkoren med dig innan du bestämmer dig")*
- **Steg 2 (B1 BLOCK-FIX inarbetad — det uppfunna ROT-villkoret ersatt):** chip VI — rubrik "Auktoriserade elektriker gör jobbet" *(V3-fix: "Egna" återinförs i rubriken först efter ägarbekräftelse att det håller rikstäckande)* — text: "**Elinstallationer får bara utföras av ett registrerat elinstallationsföretag. Ampy är registrerat hos Elsäkerhetsverket, och du kan kontrollera oss själv i deras register.**" *(originalets "Det är ett krav för att ROT-avdraget ska gälla" var ett uppfunnet skattevillkor — Elsäkerhetsverket-registrering och ROT-berättigande är två olika regelverk)*
- Steg 3 — chip VI — "Vi sköter allt med Skatteverket": "Vi drar avdraget på fakturan, samlar dokumentationen och skickar in ROT-ansökan åt dig. Du fyller inte i en blankett och du väntar inte på någon återbäring."
- DU-noden: "DU: tacka ja till offerten. Det är allt!" (variantens enda "!")
- Details "Det här lovar vi inte": 30 % av arbetskostnaden, inte materialet · tak 50 000 kr/person + ROT/RUT-samtak 75 000 · äga + skatteutrymme + "kan Skatteverket justera i efterhand, därför kollar vi det i steg 1" · 2026-korrigeringen ("det tillfälliga 50-procentsavdraget upphörde vid årsskiftet") · vid behov: "En oseriös installatör kan äventyra både försäkring och avdrag."
- Proof-rad (mall-fast): "Ampy Nordic AB · Registrerat elinstallationsföretag hos Elsäkerhetsverket (kolla själv) · F-skattsedel · Försäkrade" — registerlänken med `target="_blank" rel="noopener"` (byggfix).
- CTA: "Vi kollar om avdraget gäller dig" (ankare) · "Hellre prata? Ring 010-265 79 79" · "Så fungerar ROT-avdraget 2026". Testkandidat rank 2: "Få svar: gäller avdraget dig?".

**Copy GT:** som spec, med samma V1/V2/B1/V3-fixar speglade; details-raden bär solcellsgrind, samma-företag-regeln ("Köper du batteriet själv på nätet kan den delen av avdraget försvinna"), 15 %-solraden och skatteutrymmet — allt kanonverifierat av granskningen (inkl. 75k-samtaket och 2-ägare-100k).

**Mallbarhet (V4-fix inarbetad): 6 ACF-fält, inte 7** — `avdragstyp`, `h2` + `h2_accent` (V6-fix: två fält i stället för fri span-HTML), `steg1_text`, `steg3_text`, `villkorsrad` (defaults per avdragstyp), `cta_anchor`. **`steg2_text` är struket: steg 2 och proof-raden är mall-fasta — blockets verifierbara ryggrad får inte kunna redigeras sönder per sida** (spec:ens interna motsägelse löst till förmån för hårdkodning). `inget`-läget stänger felsöknings-defekten. Programmatiska sidor: allt faller på defaults.

**Mätning:** `block_view`, `villkor_open` (hypotes: öppnare konverterar högre), `register_click` (låg volym förväntad — existensen är signalen), `cta_click {anchor|tel|artikel}`. KPI = leads/1000 sidvisningar; samma korrigerade A/B-design som riktning A.

**Kvarstående VARNINGAR:**
1. Ankaret pekar UPPÅT (formuläret i heron) — verifiera i ampy-syn att scrollbeteendet inte känns trasigt på mobil; fallback = tel: som primär ≤767 px.
2. Audita att `heading-highlight.js` inte används av andra block innan den raderas sajtvitt.
3. "Det här lovar vi inte" är djärv — ägar-fallback: "Ärligt om villkoren" (samma innehåll).
4. Mobilmål ≤587 px obevisat — mät, lova inte.
5. Register-utlänken är en medveten exit — paradox-hypotesen (länken som vågar finnas bygger tillit hos dem som inte klickar) bevisas i data, antas inte.

**Hårda grindar:** GAP 1 (mekanikraden), GAP 5 (skatteutrymmes-kollen som operativt löfte — ett olevererat åtagande vore ett värre candour-brott än allt specen undviker), GAP 8 ("egna" rikstäckande), GAP 7 (nekat avdrag — riktningens starkaste möjliga tillägg om ägaren definierar policyn).

---

### 3C. RIKTNING C — "AVDRAGSKOLLEN" (omarbetad enligt granskning; byggklar först efter faktagrindar)

**Tes.** Besökaren bär frågan "gäller det MIG?" — låt hen besvara den själv med två tryck. Diagnostiken gör villkoren till interaktionen i stället för finstilt, ger ärliga besked (inklusive självmant lägre siffra) och rutar den varma besökaren till sidans konverteringspunkter, aldrig ut.

**Struktur:** H2 → Avdragskollen (~55 %, radio-chips + besked i `aria-live`) + steg-rail (~45 %, `<ol>`, CSS-ringar) → verdict-oberoende CTA-rad → artikel-fotrad. Alla beskedstexter server-renderade i DOM (dolda via CSS — aldrig data:-URI/JS-injektion). No-JS-fallback: statisk villkorslista + `<details>`. Mobil: chips 48 px, stegen hopfällda.

**BLOCK-FIX inarbetad — lägesmodellen utökad 4 → 6:** `rot` | `gt_batteri` | `gt_laddbox` | `gt_sol` | `gt_villkorad` | `inget`, med **egen konstant frågebank per läge**. Originalets gemensamma GT-bank ställde solcellsfrågan även på laddbox-sidor och serverade vid "Nej" ett faktiskt falskt besked (laddboxens 50 % är INTE solar-gated enligt kanon) — ett faktafel inbyggt i mallmekaniken på den näst viktigaste vertikalen. `gt_laddbox`: ägandefråga, ingen solcellsfråga. `gt_sol`: ägande, aldrig "har du solceller". Skalningsargumentet (noll ny copy per programmatisk sida) överlever fixen.

**Övriga granskningsfixar inarbetade:**
- **Inverterad GAP-default:** huvudbeskedet är den bekräftat sanna texten ("30 % av arbetskostnaden dras av, och vi sköter hela ansökan till Skatteverket"); likviditetsraden ("du ligger inte ute med pengarna") läggs till FÖRST efter GAP 1-bekräftelse — inte tvärtom.
- **Hedge på negativt besked:** "Utan solceller gäller **normalt** inte 50 % Grön Teknik för batteriet" tills §6.5-GAP:en stängts (kategoriskt "gäller inte" är samma felklass som kategoriskt "gäller").
- **CTA-arv:** när ett besked renderas ärver CTA-raden beskedets mål och etikett (verdictet = enda källan till sanning) — originalets dubbla primärer med motstridiga uppmaningar bröt en-primär-regeln.
- **Kombinationsmatrisen specad komplett:** ROT 2×3 = 6 utfall, GT 2×2 = 4 — alla definierade, ägande-nej dominerar.
- **Hyresrätts-beskedet omformulerat** mot fastighetsägaren/"hör med din hyresvärd" (originalet uppmanade hyresgästen beställa elcentralbyte — leads Ampy inte kan sälja till).
- **Röst-nits:** "Kolla **med** två tryck om det gäller dig", "vad som gäller **för** dig".
- **H2-accent:** samma tvåfältslösning som A/B (`h2` + `h2_accent`).

**Bevaras (granskningens plus-lista):** skatteutrymmes-reservationen i båda Ja+Ja-beskeden, "upp till 50 %" i GT-H2, nej-besked som inte säljer, "Nej på solceller"-beskedet som costly signal (blocket säger självmant den lägre siffran).

**Kvarstående VARNINGAR:**
1. **Signaturenheten vilar på okanoniserade fakta:** 5-årsregeln, äga/bo-kravet och BRF-förfarandet finns inte i §6.5 — tre ägar-/elektrikergrindar måste stängas innan frågebanken ens kan låsas. Detta är riktningens unika leveransrisk: den kan inte byggas klar eller A/B-testas före grindarna, vilket ingen annan riktning behöver.
2. Ärliga nej-besked kan sänka leadvolym kortsiktigt — avsiktligt (filtrerat flöde är candour-positionens poäng), men ägaren ska äga beslutet uttryckligen.
3. En andel besökare interagerar aldrig — mitigerat av verdict-oberoende CTA-rad + att H2 och stegen bär ägarmål 1–2 statiskt.
4. `form_anchor` per sidtyp (upp mot hero-form eller ner mot prisblock) avgörs i wireframe-fasen.

**Mätning:** `rotgt_answer`, `rotgt_verdict {positiv|rot_fallback|ej_berattigad|osaker}`, `rotgt_cta_click`, `rotgt_steps_open` — rikaste intent-datat av de tre riktningarna.

---

## 4. JÄMFÖRELSEMATRIS

| Dimension | A — Kvittot | B — Ansvarsrailen | C — Avdragskollen |
|---|---|---|---|
| **Tillit** | Hög: mekanismen visas i stället för påstås; villkor i fotnot + details | **Högst**: villkoren i öppen text, klickbart verifierbara bevis, DU-noden som candour-layout | Hög: villkoren ÄR interaktionen; costly-signal-besked — men vilar delvis på okanoniserade fakta |
| **Konvertering** | **Högst**: abstrakt procent → ägd siffra; primar prisblocket direkt under med exakt rätt storhet | Medel-hög: avväpnar "gäller det mig?" och rutar tillbaka; inget eget siffer-grepp | Hög: mikro-commitment + varm ruting; risk vid icke-interaktion mitigerad |
| **Byggkostnad** | Låg-medel: CSS-tabell + rail, villkorlig rendering; kronläget = enkel utbyggnad | **Lägst**: chips + rail + details, allt beprövade mönster, 6 fält | Högst: 6 lägen × frågebanker × beskedsmatris + verdict-logik + CTA-arv |
| **Risk** | Medel: GAP 1 bär H2 + steg 3; kronläget grindat; 15 %-sidor blekare | **Lägst** (efter B1-fixen): bästa faktahygienen, explicita fallbacks per grind | Högst: BLOCK åtgärdat men tre okanoniserade fakta blockerar bygget; dom = omarbeta-varvet gjort, faktagrindar kvar |
| **Mätbarhet** | Bra: receipt_mode + details_open + cta-riktning | Bra: villkor_open-korrelation + register_click som tillitsbevis | **Rikast**: answer/verdict = gratis intent-data per fråga |
| **Granskningsdom** | SHIPBAR MED FIX (fixar inarbetade ovan) | SHIPBAR MED FIX (fixar inarbetade ovan) | OMARBETA → omarbetat här; SHIPBAR först efter GAP-signeringar |

---

## 5. SAMLAD [GAP]-LISTA — ÄGARBESLUT SOM KRÄVS

**Hårda grindar (blockerar bygge av vald riktning):**
1. **Fakturamodellen på BÅDE ROT och GT** — tillämpar Ampy förhandsdrag undantagslöst? Bär A:s H2 + steg 3, B:s mekanikrad och C:s likviditetsrad. GT-sidan är regimfakta, ROT-flödet obekräftat i datalagret. *Första grinden, före allt.*
2. **Skatteutrymmes-kollen som operativt löfte** — gör säljprocessen faktiskt denna kontroll före offert? (B steg 1, A steg 1, C:s besked). Annars mjukas copyn.
3. **Standalone-batteri utan solceller** — GT-eligibility har öppen rest i §6.5; exakt kundformulering av grind + ROT-fallback ska ägargodkännas.
4. **Kanoniska prisexempel per tjänst** — §3.5 har dokumenterad intern konflikt; kronläget (A) förblir avstängt tills intervall låsts per sida.

**Grindar per riktning/innehåll:**
5. 5-årsregeln + äga/bo-kravet — finns inte i kanon; kanonisera med ägar-/elektrikersignering (blockerar C:s frågebank; berör A/B:s details-texter). Web-rate-check är förbjuden — detta är en ägargrind.
6. Policy vid nekat avdrag — topp-PAA, obesvarbar tills Ampys åtagande dokumenterats.
7. "Egna" elektriker — håller det rikstäckande (nationell verksamhet)? Annars "Auktoriserade" i mall-fast rubrik.
8. BRF/hyresrätt-beskedens juridiska formulering (C) — elektriker-/ägargranskning av samtliga beskedstexter.
9. Lastbalansering ROT-vs-GT (GAP 3 i kanon) — ingen incitamentsyta där tills avgjort; elbesiktning/felsökning = `inget` per kanonbeslut; verifiera att luftvärmepumpsidan kör ROT-variant.
10. "Lönar sig jobbet inte, säger vi det också" — sant för elcentral, okontrollerat över 22 tjänster (endast om copy-uppsättning 3-element lånas).
11. "Inte underleverantörer" — medvetet UTELÄMNAT ur all copy (krockar potentiellt med tredjepartsaffären); får bara in med ägarbekräftelse.
12. Samspel med prisblocket i position 2 — ordning block-mot-block, ankarmål per sidtyp, regeln "en siffersanning per sida". Kompositionsbeslut i nästa fas, får inte glidas förbi.
13. Tak-kommunikation — 50 000/person + 2-ägare-100k i blocket (T6b/stora projekt) eller i artikellänken? Rekommendation: blocket på GT/projekt, artikeln på småjobb.

---

## 6. NÄSTA STEG

1. **Idag, oberoende av allt:** shippa de fem defektlagningarna i ACF — "Vår experter" → "Våra experter", "ROT ansökan" → "ROT-ansökan", "rot-avdrag"/"30%" → "ROT-avdrag"/"30 %", "genom" → "med", CTA-etikett → "Så fungerar ROT-avdraget 2026". Rena lagningar av live-innehåll, inget riktningsberoende.
2. **Instrumentera dagens block** (`block_view` + `cta_click`, consent-gatat) och genomför positionsflytten → **baslinje = gamla blocket i NYA positionen** (den korrigerade A/B-designen).
3. **Stäng grind 1–2** (fakturamodell + skatteutrymmes-kollen) med ägaren — de avgör vilka bärande meningar som får finnas i alla tre riktningar.
4. **Riktningsval av Julius** (per 3-versioner-regeln). Rekommendation: A, med B:s DU-nod + proof-rad som ingredienser; B som lägsta-risk-fallback; C parkerad till grind 5+8 stängts.
5. **Avgör prisblock-samspelet** (grind 12) i wireframe-fasen innan copy låses per sida.
6. **Bygg** vald riktning med granskningsfixarna ovan (de är inarbetade i specarna — bygg mot denna rapport, inte mot originalspecarna), inklusive: audit av `heading-highlight.js`-användning sajtvitt före radering, tnum-testet, `rel="noopener"`, mobilhöjdsmätning.
7. **Verifiera i ampy-syn** (desktop + mobil, inkl. ankar-scrollbeteendet) → ampy-granskning → ampy-slutaudit → FluentSnippets/Bricks-leverans per leveranskontraktet.
8. **A/B-kör** gamla vs nya blocket i position 2, KPI = leads/1000 sidvisningar. Candour-innehållet är aldrig testvariabel. Kronläget (A) blir experiment två när första prissignaturen finns.

**BLOCK-spårbarhet:** samtliga tre BLOCK-fynd från granskningarna är åtgärdade med synlig fix i §3 — A: "Du deklarerar ingenting" ersatt (3A, steg 3); B: det uppfunna ROT-villkoret i steg 2 ersatt (3B, steg 2); C: lägesmodellen 4 → 6 med egna frågebanker (3C). Inga BLOCK-markerade fynd har tappats.