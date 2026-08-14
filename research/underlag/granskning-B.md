Jag har läst kanonen (ampy-foretagsdata §1.1–1.5, §6.5–6.7, §7.1), ampy-rost, ampy-webb-playbook och klonen (rot.html bekräftar: `data-highlight="last-3"`, connector-lines.js/heading-highlight.js, "Vår experter"-defekten). Här är granskningen.

---

# GRANSKNING — RIKTNING B "Tillitsmaskineriet"

## 1. CANDOUR-GRIND — **VARNING**

Ingen fejk-urgency, ingen påhittad scarcity, inga uppfunna kunder eller recensioner. "Det här lovar vi inte"-raden är R11 i sin renaste form. Men två kategoriska formuleringar klarar inte "kan"-doktrinen:

- **V1: "Du ligger aldrig ute med pengarna"** (mekanikraden, båda varianter). "Aldrig" är kategoriskt om ett skatteutfall du inte kontrollerar: nekar Skatteverket avdraget i efterhand fakturerar Ampy rimligen mellanskillnaden, och då låg kunden i praktiken ute med pengarna. Detta är exakt GAP-5-scenariot som specen själv erkänner att den inte besvarar. **Fix:** "Du ligger inte ute med pengarna" (presens, processbeskrivning) eller "Avdraget dras direkt på fakturan, du betalar bara nettot" — och lås aldrig "aldrig" innan GAP-5-policyn finns.
- **V2: "du deklarerar ingenting själv"** — nästan sant (utföraren begär utbetalningen), men avdraget dyker upp i kundens deklaration och ska godkännas där. **Fix:** "du fyller inte i någon blankett själv" (samma löfte, sant utan rest).
- **Notering (ej fel):** spänningen mellan "DU: tacka ja. Det är allt!" och details-radens "förutsätter att du äger bostaden och har betalat skatt" är designad och löses av att villkoren står en centimeter under. Godkänt — men bara så länge details-raden aldrig kan tas bort per sida (se punkt 4).

## 2. FAKTA — **BLOCK** (en punkt), resten stämmer mot kanon

Verifierat korrekt mot §6.5: ROT 30 % (reverterat 50→30 1 jan 2026) ✓ · tak 50 000/person + **ROT+RUT samlat 75 000** ✓ (rad 576 — jag trodde själv detta var påhitt tills jag kollade; det står i kanon) · GT batteri 50 %/laddbox 50 %/solceller 15 % sedan 1 jul 2025 ✓ · 2 ägare → 100 000 ✓ · solcellsgrinden + ROT-30 %-fallback för batteri utan solceller ✓ (rad 581–582) · samma-företag-regeln för material ✓ (rad 582 + citat rad 764) · foretag=12047521 ✓ (§1.1) · 010-265 79 79 ✓ · F-skatt/försäkring ✓ (självuppgivet, OK). GAP-1–5 är korrekt märkta, och 5-årsregeln är korrekt UTELÄMNAD (finns inte i kanon). Utmärkt proveniens-hygien — utom en punkt:

- **B1 (BLOCK): "Det är ett krav för att ROT-avdraget ska gälla"** (steg 2, båda varianter). Detta är ett kategoriskt juridiskt påstående som INTE finns i kanon. ROT-berättigande kräver F-skatt hos utföraren; Elsäkerhetsverket-registreringen är kravet för att lagligen *utföra elinstallationsarbete* — två olika regelverk. Kanon säger "registrerat elinstallationsföretag" (§1.1) och "behörig-elektriker-kravet som skydd" (§7.1 fear 5), aldrig att registreringen är ett ROT-villkor. För GT finns delstöd (materialregeln kräver "same authorized company", rad 582) men även där är formuleringen bredare än källan. Som skrivet är det ett uppfunnet skattevillkor — värsta sortens fel i ett block vars hela tes är verifierbarhet, eftersom det är just det påståendet katch-jägaren kommer att googla. **Fix (behåller hela retoriska kraften):** *"Elinstallationer får bara utföras av ett registrerat elinstallationsföretag. Ampy är registrerat hos Elsäkerhetsverket, och du kan kontrollera oss själv i deras register."* + i ROT-details-raden vid behov: *"En oseriös installatör kan äventyra både försäkring och avdrag"* ("kan", R8, kanon-backat som audience-fear).
- **V3: "Egna auktoriserade elektriker"** som mall-fast rubrik på ALLA 22+ sidor. Kanon bär "egna, auktoriserade elektriker" som [FACT self-stated, **ASSUMPTION on truth**] (§1.3). Ampy är nu nationell — om något jobb utanför Stockholm körs via partner är "egna" bevisbart falskt på just den sidan, och specen har gjort raden oredigerbar per sida. **Fix:** ägarbekräfta att "egna" håller rikstäckande, annars rubrik "Auktoriserade elektriker gör jobbet".

## 3. RÖST — **PASS**

Du-tilltal genomgående ✓. "!"-budget: exakt en per variant (DU-noden), buren av en sann rad ✓. Inga tank-/halvstreck i UI-strängarna (middot · är tillåtet) ✓. "kan" används korrekt i details-raden ✓ (defekterna ovan ligger i mekanikraden, redan flaggade). "Ser det inte ut att räcka säger vi det direkt, inte på slutfakturan" är R11-guld. H2:n öppnar i läsarens pengar och landar i ansvar — outside-in ✓. Specen fixar dessutom "Vår experter"-grammatikfelet i förbifarten (borde nämnas explicit i leveransen så Chris inte klistrar tillbaka ACF-originalet). Enda smakanmärkningen: CTA-verbet "Vi kollar om avdraget gäller dig" är ett vi-verb på en knapp besökaren trycker på; det är medvetet (ekar steg 1) och godkänns, men sätt "Få svar: gäller avdraget dig?" som testkandidat i §5.1-rank-2-facket.

## 4. MALLBARHET — **VARNING**

Skalningsbeviset håller: defaults per avdragstyp = noll ny per-sida-kostnad, `inget`-typen stänger felsöknings-defekten (blocket som idag lovar 30 % på en sida vars FAQ nekar ROT), och satslösa mall-strängar gör 15 %-solceller gratis. Men:

- **V4 (intern motsägelse):** §2/§5 listar `steg2_text` som ACF-fält, sedan säger §5 "Steg 2 … är mall-fast (varierar aldrig)". Båda kan inte vara sanna. **Fix:** stryk `steg2_text` ur fältlistan (6 fält, inte 7) — steg 2 är ryggraden och ska vara hårdkodad i mallen, precis som §5-prosan vill.
- **V5:** "Mekanikraden är mall-fast" — men den har två olika lydelser (ROT resp. GT "gäller både arbete och material"). Den är avdragstyp-keyad, inte mall-fast. Skriv det, annars bygger Chris en sträng.
- **V6:** HTML (`<span class="accent">`) inne i ett ACF-textfält är en redaktörs-fotgun (en borttappad `</span>` bryter 22 sidor). **Fix:** två fält (`h2_del1` + `h2_accent`) eller markörsyntax som mallen renderar. Behåll principen server-renderad, aldrig last-3-JS — den är rätt.
- **Kravet att details-raden alltid renderas** (villkorsradens *innehåll* är överskrivbart, dess *existens* inte) måste stå explicit — annars kan en sida "redigeras ärlig-fri".

## 5. KONVERTERING — **PASS**

Rätt analys av pos 2: blocket ber inte om något själv, det tar "gäller det MIG?"-risken och skickar hetta uppåt till hero-formuläret (ankare) eller till telefonen — komplement, inte kannibal. CTA-ekonomin är strikt bättre än idag: dagens ENDA handling är en exit till artikeln; specen demoterar artikeln till tertiär textlänk och mäter läckan (`cta_click target:artikel`). Register-utlänken är en medveten, mätt exit med rimlig paradox-hypotes — godkänd eftersom den ska bevisas i data, inte antas. Mätplanen följer playbook §5 (consent-gatad, prefix, experiment_id, KPI = leads/1000 sidvisningar, candour aldrig testvariabel). En anmärkning: ankaret pekar UPPÅT (formuläret ligger i heron ovanför) — ovanligt scrollmönster men kort avstånd; verifiera i ampy-syn att scrollbeteendet inte känns trasigt på mobil, annars fallback `tel:` som primär på ≤767 px.

## 6. BYGGBARHET — **PASS** (två noteringar)

CSS-ringar med tal som text, streckade pseudo-element, `<details>`-mönstret (beprövat i elcentral-kollen), ACF-villkorad rendering inkl. `inget` — allt trivialt i Bricks/FluentSnippets, och att riva connector-lines.js/heading-highlight.js dödar F9-buggarna. Noteringar: (a) **audita att heading-highlight.js inte används av ANDRA block** innan den raderas sajtvitt — `data-highlight` kan sitta på fler rubriker än denna mall; (b) `target="_blank"` på registerlänken kräver `rel="noopener"`; (c) mobilmålet ≤587 px med mer innehåll är rimligt med stängd details men obevisad — mät i ampy-syn, lova det inte i specen.

---

## TOTALBEDÖMNING: **SHIPBAR MED FIX**

Riktningen är stark: tesen matchar §7.1 exakt, signaturenheten är EN och dramatiserar blockets verkliga argument, faktahygienen är ovanligt god (75k-taket, solcellsgrinden och ROT-fallbacken stämmer alla mot kanon), och GAP-disciplinen är föredömlig. Blockeraren är en enda mening — det uppfunna ROT-villkoret i steg 2 (B1) — vilket är ironiskt i ett block byggt på verifierbarhet, och den måste fixas före allt annat. Därtill fem VARNINGAR: "aldrig"-kategorin (V1), deklarations-raden (V2), "egna" som oredigerbart nationellt påstående (V3), steg2_text-motsägelsen (V4) och mekanikrad/H2-fältmekaniken (V5/V6). Alla har konkreta fixar ovan; ingen kräver omarbetning av strukturen. GAP-1, GAP-2 och GAP-5 förblir hårda ägargrindar före copy-lås — särskilt GAP-2, där ett olevererat operativt löfte vore ett värre candour-brott än allt specen redan undvikit.