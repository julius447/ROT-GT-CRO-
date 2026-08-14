## LINS: VISUELL KRAFT & DIFFERENTIERING — analys av ROT/GT-blocket

### 0. Vad jag faktiskt läst (grounding)
- Klonerna: `rot-gt-cro/rot.html` + `gron-teknik.html` + `source/extracted-*-live.html` + `inline-elcentral.css`/`inline-batterilagring.css` (blockets riktiga CSS: `.rot__container` = vitt kort, `box-shadow: 0 0 16px rgba(190,190,190,.19)`, våg-SVG `programmatic-bg-overlay-blue.svg` bottom-right 80%, `apspace-3xl`-padding, H2 max-width 70% centrerad, ringar = 6 separata SVG-filer (95px desktop + 55px mobil per steg), streckade linjer ritas av `connector-lines.js`, highlight av `heading-highlight.js`).
- `ampy-foretagsdata.md` (satser §6.5, priser §3.5 med intern konflikt, §11 kanoniska block: 5-punktsribban, signaturenhetstabellen, de två layoutfamiljerna, token-defektlistan).
- `ampy-rost/SKILL.md` (candour + värme, "kan" på skatt, R11 costly signal).
- `ampy-webb-playbook/SKILL.md` (webb-block = lättare ryggrad, EN signaturenhet, en routing-CTA).

---

### 1. Osminkad dom över dagens block: GENERISKT, inte minnesvärt

**Det här är ett "hur"-block som låtsas vara ett "varför"-block.** H2:n lovar pengar ("Sänk kostnaden … 30% rot-avdrag") men allt visuellt under den visar process. Pengarna — det enda unika — syns aldrig. Punkt för punkt:

1. **Tre steg med sifferringar och streckade linjer är branschens mest utslitna mönster.** Varje elfirma, flyttfirma och takläggare i Sverige har exakt detta. Det klarar inte foretagsdata §11.1:s slutfråga: *"om det kunde ligga oförändrat på en generisk konkurrents sajt är det inte Ampy än"* — det kunde det, ordagrant.
2. **Blocket har ingen signaturenhet alls.** De handritade ringarna är ornament, inte enhet — de dramatiserar ingenting. Vågen nere till höger är ren dekoration (webb-playbook §2: "a decorative gradient … dilutes the one device"). Enligt §11.2-doktrinen ska ETT grepp bära blocket; idag bär inget någonting.
3. **Procentsiffran — den faktiska huvudpersonen — är begravd som löptext i H2:n.** "30%" i samma teckengrad som resten av rubriken. Det starkaste ordet på hela ytan behandlas som en bisats.
4. **Steg 3 ("Vi hanterar ansökan") är blockets bästa säljargument och ser exakt likadant ut som steg 1 och 2.** Visuell demokrati där det borde vara hierarki. Att Ampy tar Skatteverket-pappret är differentieringen; den får en tredjedels rad.
5. **Tekniska/hantverksmässiga defekter:** rot-variantens H2-gradient är `color-7 → color-7` (en gradient som inte graderar — död kod); skuggan sitter på legacy-`#bebebe`-familjen (kanoniserad token-defekt, §11.4); 6 separata ring-SVG:er (desktop+mobil per steg) = underhållssmet; connector-linjerna är JS-beroende och försvinner tyst om skriptet dör; ROT-knappen saknar pil-SVG:n som GT-knappen har (inkonsekvens); "Vår experter" ligger live. Blocket ser dessutom *nästan* likadant ut som "Vår process"-blocket och main-CTA — samma vita kort, samma skugga, samma våg. Position 2 kräver ett block man minns; detta smälter in.

**Betyg minnesvärdhet: 2/10.** Kompetent, städat, osynligt.

**Vad som faktiskt är unikt och ska dramatiseras:** (a) *staten betalar 30–50 % och det dras direkt på fakturan* — du ligger aldrig ute med pengarna; (b) *Ampy gör hela pappersarbetet* — din enda uppgift är att tacka ja. Ingen av dessa två sanningar har idag någon visuell form.

---

### 2. Utforskade visuella riktningar (7 st)

Bedömda mot: **(T)** Ampy-tokens teal/midnight/Outfit/ap*, **(M)** mallbarhet över 22 sidor + programmatiska (bara ACF-text + ev. motiverat datafält), **(B)** byggbarhet i Bricks, **(C)** candour-grinden.

**A. KVITTOT — avdraget draget direkt på fakturan** *(kvitto/faktura-metafor)*
Ett midnight-mörkt "fakturakort" (kontrast mot dagens vita hav) med tre rader: "Arbetskostnad", en teal minusrad **"ROT-avdrag −30%"** (Skatteverket-märkt), och "Du betalar"-raden. Metaforen är *bokstavligen sann* — ROT/GT dras på fakturan, kunden ligger aldrig ute — så den är candour-perfekt. De tre stegen komprimeras till en smal rad/rail bredvid eller under kvittot.
- T: utmärkt — midnight-yta + teal-minusrad + Outfit-tabular på siffrorna är rakt ur tokensystemet; kvittot blir en naturlig släkting till batteri-streams-baren (§11.2-DNA).
- M: **stark i procentform, farlig i kronform.** Kronbelopp per sida kräver per-sida-priskanon som inte finns städad (§3.5 har dokumenterad intern priskonflikt → [GAP]). Lösning: kvittots rader är *procentuella/schematiska* ("Arbetskostnad 100 %" → "−30 %" → "Du betalar 70 %"), med valfritt ACF-fält `exempelbelopp` som PER SIDA kan slå på riktiga kronor när ägaren signerat siffran. Avdrag beror på skatteutrymme → raden får en "kan"-fotnot ("upp till 50 000 kr/person och år").
- B: ren HTML/CSS (divar + border-radius + en perforeringskant i CSS), ingen canvas. Enkel Bricks-struktur.
- C: passerar — inget påhittat, mekanismen visas i stället för påstås (rost R10).
- Risk: kvitto-estetik kan bli gimmick om den illustreras för bokstavligt (perforering, "stämpel"). Håll den som *typografisk tabell*, inte clipart.

**B. STATEN-BETALAR-STAPELN — kostnadsbaren där statens del lyfts ur** *(procent-split)*
En horisontell totalkostnadsbar där 30 %/50 %-segmentet färgas teal och etiketteras "Den här delen står staten för" — segmentet kan animeras ut/lossna vid enterView (interaktionstriggern finns redan i blocket). Resten av baren = "din del". Stegen under som stödrad.
- T: direkt arv från battery-streams-baren — Ampys mest etablerade enhets-DNA. Teal på midnight eller teal på vitt, båda funkar.
- M: perfekt — enda variabeln är procenttalet (30/50/15) + H2. Noll kronberoende. Programmatiska sidor gratis.
- B: två divar med flex-bredd + en CSS-transition. Trivialt i Bricks.
- C: passerar; procenten är kanon. OBS solceller = 15 % — baren måste tåla att se ärlig ut även när segmentet är litet (15 % får inte ritas fetare än det är).
- Risk: lägre emotionell temperatur än kvittot — en bar är abstraktare än en faktura man känner igen.

**C. PROCENT-MONOLITEN — siffran som hero-element**
"30 %" i ~180–240px Outfit weight 500, teal-gradient, som blockets visuella ankare; H2 blir stödrad; stegen radas kompakt bredvid/under. Tänk typografisk affisch, inte infografik.
- T: maximal token-renhet — bokstavligen bara Outfit + teal/midnight.
- M: bäst i klassen — ETT ACF-fält (procenttalet) driver hela variationen; 22 sidor + programmatiska utan nya assets.
- B: trivial (en heading med clamp-typografi).
- C: passerar, men kräver disciplin: en jättesiffra utan kontext lutar mot plakat-reklam; den behöver sin "dras direkt på fakturan, vi sköter ansökan"-underrad tätt intill för att vara candour och inte bara volym.
- Risk: minst berättande av alla — siffran säger *vad*, inte *hur/varför tryggt*. Och 15 %-sidorna (solceller) ger en svagare affisch.

**D. "DIN ENDA UPPGIFT"-TIDSLINJEN — ansvarsasymmetrin som grepp**
Behåll tre steg men byt dramaturgi: en tidslinje/rail där varje steg äger en **ansvars-tagg** — "Ampy" / "Ampy" / "Ampy + Skatteverket" — och en enda markerad punkt "DU: tacka ja". Det visuella påståendet blir "du gör en sak, vi gör resten", vilket är sant och är blockets egentliga sälj.
- T: god — taggar som teal-chips, rail i midnight, "DU"-punkten som den enda ljusa.
- M: utmärkt — stegtexterna är redan ACF; taggarna är statiska i mallen.
- B: enkel (flex-rail + pseudo-element-linje i CSS, dödar JS-beroendet connector-lines.js på köpet).
- C: passerar — inga siffror alls behövs.
- Risk: är fortfarande "tre steg i rad" på håll; differentieringen sitter i detaljen, inte i silhuetten. Bäst som *komponent i* A eller B snarare än ensam huvudenhet.

**E. SKATTEVERKET-DOKUMENTET — blanketten Ampy fyller i**
En stiliserad ansökningsblankett (SVG-illustration) som fylls i/bockas av, med Ampy-penna; "vi skickar in till Skatteverket åt dig" som payoff.
- T: hanterbar men illustrationstung — kräver ny asset-familj utanför bolt/"a"-motivet (foretagsdata: geometrin ska härledas ur bolt/a — en blankett-illustration bryter ornamentkanonen).
- M: ok (samma illustration alla sidor).
- B: ok (statisk SVG).
- C: gränsfall — får inte se ut som en riktig Skatteverket-blankett (myndighetsimitation = trovärdighetsrisk åt fel håll).
- Risk: **störst slop-risk av alla.** Dokument-illustrationer blir clipart fort; eljour-v1 underkändes för exakt den sortens AI-slop. Rankas lågt.

**F. FÖRE/EFTER-PRISDRAMATURGIN — två priser, ett överstruket**
"12 000 kr" genomstruket → "8 400 kr efter ROT". Emotionellt starkast på pappret.
- M/C: **fälls.** Kräver äkta kronbelopp per tjänst × 22 sidor + programmatiska orter; priskanonen har dokumenterade interna konflikter (§3.5: 12 600–24 500 vs 18 500–30 000 osv) och ingen ägarsignerad per-sida-tabell finns → [GAP] i industriell skala. Genomstruket pris är dessutom rea-semiotik (urgency-lukt) som skaver mot candour-registret. Kan återuppstå PER SIDA där ägaren signerar beloppet — inte som mall-default.

**G. AVDRAGSRÄKNAREN-TEASER — mikrointeraktiv procentrad**
En enradig slider/inmatning ("din arbetskostnad" → avdraget räknas). Fälls som mall-block: kannibaliserar heron/lead-magneterna (blocket ska prime:a, inte bli ett verktyg), kräver engine + per-vertikal logik (GT-material-schablon 97 %, solar-gate) = för tungt för position 2 på 22 sidor. Rätt idé, fel block.

---

### 3. RANKAT UTLÅTANDE

**1. KVITTOT (A) med "DIN ENDA UPPGIFT"-railen (D) som stegrad — rekommenderad riktning.**
Enda konceptet som dramatiserar BÅDA de unika sanningarna i ett grepp: minusraden visar att staten betalar och att det dras *direkt på fakturan* (tillit, mål 1), railen visar att Ampy gör allt utom att tacka ja (process + engagemang, mål 2–3). Procentform gör den mall-säker idag; ett valfritt ACF-`exempelbelopp` ger en kron-uppgradering sida för sida när priser signerats. Midnight-kortet bryter dessutom det vita enformighetshavet på tjänstesidorna — position 2 får en egen temperatur. Byggbar som ren CSS-tabell i Bricks.

**2. STATEN-BETALAR-STAPELN (B).** Säkraste valet: etablerat Ampy-enhets-DNA, en enda ACF-variabel, trivialt bygge, noll [GAP]-exponering. Väljs om ägaren vill ha lägst risk och snabbast leverans. Svagare berättelse än kvittot — visar *att* staten betalar men inte *hur friktionsfritt* det sker.

**3. PROCENT-MONOLITEN (C).** Bäst mallbarhet, mest visuell kraft per byggd timme, renaste token-uttrycket. Men den är plakat, inte argument — kombinera alltid med "dras direkt på fakturan / vi sköter ansökan"-underraden, och acceptera att solar-15 %-sidorna blir blekare. Stark kandidat som *mobilkomprimering* av riktning 1 eller 2.

**4. TIDSLINJEN (D) ensam.** Ärlig, billig, dödar JS-linjerna — men behåller dagens silhuett och löser inte minnesvärdheten själv. Bäst som ingrediens.

**5. DOKUMENTET (E).** Rätt insikt (ansökan = differentieringen), fel medium — illustrationstung, utanför ornamentkanonen, hög slop- och myndighetsimitationsrisk.

**6. FÖRE/EFTER-PRISER (F) och RÄKNAR-TEASERN (G).** Fällda som mall: F på [GAP]-priser + rea-semiotik, G på kannibalisering + vikt. Båda kan återkomma som sido-specifika undantag bakom ägargrind.

**Tvärgående krav oavsett val:** (i) procentsiffran lyfts ALLTID ur brödrubriken till egen visuell nivå; (ii) exakt EN signaturenhet — vågen och de handritade ringarna utgår (ringarna är dekoration, och deras 6-filers SVG-set är underhållsskuld); (iii) ersätt connector-lines.js med CSS; (iv) skugga får inte ärva `#bebebe`-defekten (§11.4); (v) "Vår experter"-felet och den döda `color-7→color-7`-gradienten fixas i samma svep; (vi) avdragstak-fotnoten skrivs med "kan" (50 000 kr/person/år, beror på skatteutrymme); (vii) mobilen behåller vertikal rad-logik men enheten (minusraden/stapeln) måste överleva 480px i full styrka — den är blocket nu.