Grundning genomförd: läst `ampy-foretagsdata.md` (§1, §3.5, §6.5–6.7, §7, §8), `ampy-rost/SKILL.md`, `ampy-webb-playbook/SKILL.md` samt klonerna `rot.html`/`gron-teknik.html` + source-listningen. Här är granskningen.

# GRANSKNING — RIKTNING C "Vad gör jag NU?"

## 1. CANDOUR-GRINDEN — VARNING

Ingen fejk-urgency, ingen scarcity, inget påhittat socialt bevis. Diagnostiken som villkors-yta är tvärtom candour-mekanikens starkaste tillämpning hittills i det här blocket, och "Nej på solceller"-beskedet (självmant säga den lägre siffran) är äkta costly signal per R11. Men två rader bryter mot grinden i den form spec:en faktiskt levererar dem:

- **"du ligger aldrig ute med pengarna" (ROT Ja+Ja).** Kategoriskt "aldrig" på en faktura-/skattemekanik som spec:en själv erkänner är obekräftad ([GAP] risk #1). Spec:en har rätt hantering ("utan bekräftelse stryks raden") men fel default: den ogrindade copyn står som huvudtext och den grindade som fallback. **Fix:** invertera. Huvudtexten i spec:en ska vara den bekräftat sanna ("30 % av arbetskostnaden dras av, och vi sköter hela ansökan till Skatteverket"); likviditetsraden läggs som `[GAP: fakturamodell — läggs till efter ägarbekräftelse]`. En spec som skickas till build i befintligt skick shippar det ogrindade löftet.
- **"Utan solceller gäller inte 50 % Grön Teknik för batteriet" — kategoriskt negativt besked.** Solar-gaten är [FACT] (§6.5 rad 580), men rad 587 flaggar standalone-eligibility som öppen [GAP] (Rättslig vägledning blockerad). R8-logiken gäller åt båda håll: ett kategoriskt "gäller inte" som kan visa sig fel är samma sorts fel som ett kategoriskt "gäller". **Fix:** "Utan solceller gäller normalt inte 50 % Grön Teknik för batteriet" tills GAP 3 är stängd. ROT-fallbacken (30 % på arbetet) är [FACT] och står sig.

Positivt som ska bevaras: skatteutrymmes-reservationen finns i BÅDA Ja+Ja-beskeden ("förutsätter att du har skatt att räkna av mot"), "upp till 50 %" i GT-H2 hedgar tak/utrymme korrekt, och nej-beskeden säljer inte.

## 2. FAKTA — VARNING (en BLOCK-kandidat gömd i mallbarheten, se §4)

Kontrollerat rad för rad mot kanon:

| Påstående | Kanon | Verdict |
|---|---|---|
| ROT 30 % av arbetskostnaden | §6.5 ✓ | PASS |
| GT batteri 50 % arbete + material | §6.5 ✓ | PASS |
| Tak 50 000 kr/person/år, 2 ägare → 100 000 | §6.5 ✓ (exakt kanonformulering) | PASS |
| Batteri utan sol → ROT 30 % på arbetet | §6.5 [FACT] ✓ | PASS (med hedge-fixen ovan) |
| "egna, auktoriserade elektriker, registrerade hos Elsäkerhetsverket" | §1.1 + §1.3 ✓ | PASS |
| 010-265 79 79 | §1.2 ✓ | PASS |
| "kostnadsfri genomgång" | §1.2 ("kostnadsfri konsultation" live) ✓ | PASS |
| **5-årsregeln** ("bostad äldre än fem år") | **FINNS INTE i kanon** | VARNING — korrekt [GAP]-märkt (risk #2), men se nedan |
| **"äger och bor"-kravet** | Finns inte i kanon | VARNING — ingår inte ens i spec:ens GAP-lista som eget villkor; risk #2 nämner det i parentes, bra, men beskedet "kräver att du äger OCH BOR" svarar på ett villkor frågan aldrig ställde ("Äger du bostaden?" fångar inte uthyrd bostad) |
| "det är föreningen eller fastighetsägaren som söker" (GT bostadsrätt) | Finns inte i kanon | VARNING — kategoriskt juridiskt påstående utan [GAP]-tagg i själva copyn; risk #4 täcker det men copyn måste bära `[GAP]`-markering tills elektriker-/ägargranskning skett |

Strukturellt problem: **riktningens hela signaturenhet vilar på två fakta som inte är kanon** (5-årsregeln + äga/bo). Spec:en är hederlig om det (risk #2 är föredömligt formulerad, web-check korrekt avstådd), men det betyder att riktningen inte kan A/B-testas eller ens byggas klart före en ägargrind som ingen annan riktning behöver. Det är en leveransrisk, inte ett faktafel — men den ska stå i totalbedömningen.

## 3. RÖST — PASS (två nits)

Du-tilltal genomgående, korta deklarativer, "kan" på varje skatteutfall, R11-candour i tre av sju besked, värme där sanningen är god ("Goda nyheter", "Helt okej, det är vanligt" — precis §8.1b-registret), noll tank-/halvstreck i UI-strängarna (verifierat mot R12), "!"-budget efterlevs (faktiskt noll). "utan överraskningar på slutfakturan" ekar §8.3-samplet korrekt.

- Nit 1: "Kolla **på** två tryck om det gäller dig" — "med två tryck" är naturligare svenska; "på två tryck" läser som anglicism.
- Nit 2: "Två frågor visar vad som gäller **dig**" (GT-H2) — "vad som gäller **för** dig".

## 4. MALLBARHET — BLOCK

**Den gemensamma `gron_teknik`-frågebanken är faktiskt fel för laddbox och sol.** Spec §5 mappar "laddbox/batteri/sol → `gron_teknik`" och hanterar bara procentvariabeln (15/50). Men frågebanken är template-konstant per avdragstyp, och GT-bankens fråga 1 är "Har du solceller, eller installerar du i samband med batteriet?" med beskedet "Utan solceller gäller inte 50 % …". Enligt kanon §6.5 är **laddningspunkt 50 % INTE solar-gated** — bara batteriet är det. Som spec:ad skulle /laddbox/-sidan alltså ställa en irrelevant solcellsfråga och vid "Nej" servera ett **faktiskt falskt** besked (att laddboxens 50 % kräver solceller). På /solceller/-sidor är frågan dessutom nonsens. Detta är exakt den sortens fel som mallar producerar i tysthet på sidor ingen granskar.

**Fix (kontenta, liten):** utöka `avdragstyp` från 4 till 6 lägen — `rot` | `gt_batteri` | `gt_laddbox` | `gt_sol` | `gron_teknik_villkorad` | `inget` — med egen konstant frågebank per läge. `gt_laddbox`: stryk solcellsfrågan (behåll ägandefrågan + ev. "villa eller bostadsrätt?"). `gt_sol`: ägande + ev. takfråga, aldrig "har du solceller". Skalningsargumentet ("noll ny copy per programmatisk sida") överlever fixen intakt.

Två mindre mallbarhetsfynd:
- **Kombinationsmatrisen är ofullständig.** ROT har 2×3 = 6 utfall, fyra besked definierade; GT har 2×2 = 4 utfall, tre definierade. Prioritetsordningen (ägande-nej dominerar?) måste specas explicit, annars uppfinner byggaren den. VARNING.
- H2 "med span-markering för teal" i ACF kräver att redaktören handskriver markup i ett textfält, eller en parseregel som inte är specad (dagens `data-highlight="last-3"` är faktiskt en robustare redaktörskontrakt än fritt span-HTML). Definiera konventionen. VARNING (lätt).

## 5. KONVERTERING — VARNING

Grundekonomin är rätt och klart bättre än dagens block: dagens enda klickbara handling är en exit till infosidan; här stannar 100 % av klickvägarna på sidan (ankare/tel) med artikeln demoterad till fotrad. KPI:n är korrekt vald (leads/1000 visningar, inte blockengagemang), instrumenteringen följer playbook §5 (consent-gatad, experiment_id, buckets, candour aldrig testvariabel), och den verdict-oberoende CTA-raden löser icke-interaktörsproblemet. Ankare uppåt till hero-formen kompletterar i stället för kannibaliserar — besökaren som just fått "du kan använda ROT" rutas till formuläret hen nyss skrollade förbi, nu med ett skäl.

Men: **efter interaktion visar blocket två primära handlingar samtidigt.** Besked-CTA:n ("Få ditt pris efter ROT-avdrag", teal) OCH den alltid synliga primära pillen (samma eller annan etikett) står båda i viewport — och vid nej-besked pekar de åt olika håll (besked säger "Ring", primären säger "Få ditt pris"), vilket bryter playbookens en-primär-CTA-regel (§1 beat 5) och ger motstridiga uppmaningar exakt när besökaren är som varmast. **Fix:** när ett besked renderas ärver CTA-raden beskedets mål och etikett (en källa till sanning: verdictet styr båda), eller så tonas radens primär ner till sekundär så länge ett besked är synligt. Statiskt läge (ingen interaktion) behåller dagens rad.

Mindre: hyresrätts-beskedet ("Jobbet går förstås att göra ändå. Ring oss…") uppmanar en hyresgäst att beställa elcentralbyte — normalt fastighetsägarens ansvar. Rutan riskerar att generera leads Ampy inte kan sälja till. Ingår i risk #4-granskningen; formulera mot fastighetsägaren/"hör med din hyresvärd".

## 6. BYGGBARHET — PASS

Bricks/FluentSnippets-pipelinen bär detta utan nyheter: riktiga `<input type="radio">` + labels, server-renderade besked dolda med CSS (SEO-lärdomen från leadmagnet-auditen korrekt tillämpad — ingen data:-URI), no-JS-fallback som statisk villkorslista, `<ol>` + CSS-ringar ersätter 6 SVG:er + `connector-lines.js` + `heading-highlight.js` (tre beroenden bort, en mekanik in — nettokomplexiteten sjunker faktiskt). `<details>`-mobilen och aria-live är standard. Enda byggfrågan är kombinationslogiken (§4-fyndet) och form_anchor-per-sidtyp — båda är specfrågor, inte teknikrisk.

---

## TOTALBEDÖMNING: **OMARBETA (en avgränsad varv) — därefter stark**

Riktningen är konceptuellt den bästa läsning av position-2-ögonblicket jag sett för det här blocket: den identifierar rätt obesvarad fråga ("gäller det MIG?"), gör villkoren till interaktionen i stället för finstilt, och stänger exit-läckan. Röst, instrumentering och byggbarhet är i princip klara.

Men den kan inte gå till build som spec:ad, av tre skäl som tillsammans motiverar OMARBETA snarare än SHIPBAR MED FIX:
1. **BLOCK i §4:** den gemensamma GT-banken producerar ett falskt besked på laddbox-sidor — ett faktafel inbyggt i själva mallmekaniken, på blockets näst viktigaste kommersiella vertikal (service > laddbox > batteri). Kräver omdesign av lägesmodellen (4 → 6 lägen + banker), inte en textändring.
2. **Signaturenheten vilar på okanoniserade fakta** (5-årsregeln, äga/bo, BRF-förfarandet) — tre ägar-/elektrikergrindar måste stängas innan frågebanken ens kan låsas.
3. **CTA-dubbleringen efter interaktion** bryter en-primär-regeln och behöver en definierad arvsmekanik.

Omarbetningen är liten (uppskattningsvis en spec-iteration: lägesmodell, kombinationsmatris, CTA-arv, inverterad [GAP]-default på fakturaraden, två röst-nits) och ingenting i kärntesen behöver röras. Efter det varvet: SHIPBAR, gated på GAP 1–4-signeringarna som spec:en själv redan listar.