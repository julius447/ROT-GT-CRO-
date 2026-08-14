Grounding utförd: `ampy-foretagsdata.md` (§1.1–1.2, §3.5, §3.7, §6.5, §8.1–8.3, §11), `ampy-rost/SKILL.md` (R1–R12, självcheck), `ampy-webb-playbook/SKILL.md` (§1–§5, web-block-profilen), klonerna `rot-gt-cro/rot.html` + `gron-teknik.html` (verifierat: "Vår experter" i båda, `data-highlight="last-3"` bara ROT, GT-pilen, JS-linjerna — spec:ens grounding stämmer).

# GRANSKNING — RIKTNING A "Kvittot"

## 1. CANDOUR-GRINDEN — VARNING (en formulering på gränsen till BLOCK)

Ingen fejk-urgency, ingen scarcity, inget påhittat socialt bevis, ingen rea-semiotik (spec:en fäller själv genomstruket pris — korrekt). Kronläget är rätt grindat bakom ägarsignatur med "Räkneexempel"-etikett och den etablerade EV-disclaimern. Men:

- **BLOCK-kandidat: "Du deklarerar ingenting."** Absolut påstående om skatteprocess utan "kan". ROT-/GT-beloppet dyker upp i köparens inkomstdeklaration (förtryckt), och `<details>`-texten säger själv "Skatteverket kan justera avdraget i efterhand" — vilket sker just via deklaration/beslut. Meningen motsäger blockets egen villkorstext och är demonstrerbart-falsk-angränsande. **Fix:** stryk, eller ersätt med "Du behöver inte ansöka om något själv." (sant, verifierbart, samma lugnande jobb).
- **VARNING: kvitto-eyebrown "SÅ SER DET UT PÅ FAKTURAN" lovar mer än raderna håller.** För GT visar den riktiga fakturan ~48,5 % av totalpriset (Skatteverkets 97 %-schablon — Ampys egen kanoniska sträng: "Avdraget är 50 % av arbete och material. Med Skatteverkets schablon på 97 % blir det cirka 48,5 % av totalpriset", §8.3/§4.7). Ett kvitto som säger "Du betalar — 50 %" och kallar sig fakturans utseende är exakt den avvikelse den disconfirmation-sökande köparen (§7.1) hittar när fakturan sen kommer. **Fix:** antingen (a) GT-fotnoten får schablonraden ("Med Skatteverkets 97 %-schablon blir det cirka 48,5 % av totalpriset") eller (b) byt eyebrow till "SÅ FUNKAR AVDRAGET" på GT-varianten. ROT-varianten klarar sig — basen "av arbetskostnaden" står i själva raden och fotnoten säger "inte materialet".

## 2. FAKTA — VARNING (satserna rätt; två precisionsbrister + en GAP-läcka i copyn)

Mot kanon: ROT 30 % ✓, GT batteri 50 % ✓, laddbox 50 % ✓, sol 15 % (aldrig default-50, spec:en säger det själv) ✓, tak 50 000 kr/person/år + två ägare → 100 000 ✓, ROT = enbart arbetskostnad ✓, GT = arbete + material ✓, samma-företag-regeln för 50 % på material ✓ (§6.5 + §8.3-samplet, korrekt sourcad). Kronexemplet 20 000 → -6 000 → 14 000 räknar rätt. Elsäkerhetsverket-registreringen ("det kan du kontrollera själv") är [FACT] §1.1 och ett äkta costly-signal-drag. Tre brister:

- **VARNING: ROT-fotnoten blandar ihop två olika tak.** "förutsätter att du har skatt att dra av mot, upp till 50 000 kr per person och år" läser som att skatteutrymmet är 50 000 kr. 50 000 är ROT-*taket*; skatteutrymmet är din faktiskt betalda skatt (en annan, personlig gräns). **Fix:** två meningar: "Taket är 50 000 kr per person och år. Avdraget förutsätter dessutom att du har betalat tillräckligt med skatt. Det räknar vi på i steg 1."
- **VARNING: "Utan solceller gäller i stället ROT, 30 % på arbetet"** står som faktum i kundcopyn medan §6.5 bär [GAP] på standalone-batteriets GT-berättigande (Rättslig vägledning oläst). Spec:en påstår i Risk 3 att "min copy påstår det inte" — det stämmer inte, villkorsraden påstår precis inversen. Riktningen är candour-säker (understatement), men en [GAP]-gatad sakuppgift får inte stå ogrindad i copy. **Fix:** villkorsraden ägargrindas ihop med GAP 3 (spec:ens egen §7.3-mekanism, bara ärligt bokförd).
- **Notering (rätt hanterad):** Risk 1-GAP:en om fakturamodellen på BÅDE ROT och GT är korrekt identifierad som blockets bärande mening — "draget direkt på fakturan" i H2 + steg 3 får inte byggas före ägarbekräftelsen. Spec:en grindar den själv; behåll den som hård launch-gate, inte "verifiera sen".

## 3. RÖST — PASS (en putsning)

Du-tilltal genomgående ✓. "kan" på justeringsrisken ✓. Inga tank-/halvstreck i strängarna (leader-punkterna som CSS, inte tecken — rätt läsning av R12) ✓. "!"-budget 0 i high-stakes-register är ett korrekt registerval (§8.1c). "Vår experter"-fixen ✓. Steg 3-rubriken "Du betalar priset efter avdrag" och steg 1 "innan du bestämmer dig" är äkta candour-relief (§8.1b). GT-steg 1 "Gör du inte det säger vi det direkt, och räknar på ROT i stället" är R11 (tala ner kunden) på sin bästa plats. Putsning: "Egna, auktoriserade elektriker" — behåll exakt den sourcade frasen (§1.3), byt inte tillbaka till "certifierade" i någon ACF-variant; blanda inte termerna över 22 sidor.

## 4. MALLBARHET — VARNING (två strukturella hål)

Skalningsbeviset håller i princip: procentläget kräver noll per-sida-data, `inget`-läget implementerar ULTIMATA-STRUKTUREN-beslutet, kronläget degraderar aldrig. Men:

- **VARNING: `procentsats` som fritt talfält är en rate-drift-fotgun.** ROT har bytt sats två gånger på två år; en redaktör kan sätta 50 på en solsida; 22+ sidor gånger ett siffervärde = 22+ ställen att glömma vid nästa satsändring. Regel 3-hygienen kräver EN sanning. **Fix:** härled procentsatsen ur `avdragstyp` (+ ev. vertikal-select) ur EN central konstant i PHP/mallen; ta bort det fria talfältet helt. "defaulten får ALDRIG vara 50" är en instruktion till människor — gör den till kod.
- **VARNING: accent-mekanismen för H2 är odefinierad.** H2 är fri ACF-text per sida; mallen kan inte veta var "mekanismfrasen" börjar. Utan definierad mekanism återuppstår dagens `data-highlight="last-3"`-slumpord (som spec:en med rätta dödar). **Fix:** antingen ett andra fält `h2_accent` (accentdelen som egen sträng, mallen konkatenerar) eller en dokumenterad delimiter-konvention — och granskningsregeln "accenten ska sitta på mekanismen, inte procenten" skrivs in i ACF-fältets hjälptext.
- Notering: hopfällda stegtexter på mobil gömmer ägarmål 2 (processförklaringen) för majoritetstrafiken — acceptabelt eftersom rubrikerna bär budskapet själva, men verifiera i granskningsfasen att rubrikraderna är läsbara utan expansion.

## 5. KONVERTERING — PASS (två verifieringar)

Kannibaliserar inte heron: inget formulär i blocket, web-block-profilens "routes onward" följs, exakt EN primär CTA ✓. CTA-ekonomin är strikt bättre än dagens: dagens enda knapp är en exit till artikeln; här blir artikeln sekundär textlänk och primären pekar framåt i funneln. Kvittot uppfyller playbookens konverteringsögonblick (abstrakt procent → ägd siffra) och primar prisblocket med exakt den storhet det skördar. Två saker att verifiera:

- **VARNING: ankar-CTA:n kan bli en noop.** Kanon-sekvensen lägger prisblocket direkt under detta block; "Se ditt pris efter ROT-avdrag" ankar-scrollar då en halv viewport. Inte skadligt, men mät `rotgt_cta_click` mot faktisk prisblocks-exponering — om klickfrekvensen är låg för att folk bara scrollar är det OK; om klicket ger ett hackigt mikrohopp, byt scroll-behavior eller peka på formulärets ankare i stället. Definiera `ankarmal`-defaulten per sida i mallen, inte hårdkodat.
- **VARNING: A/B-baslinjen är konfunderad.** Blocket byter position OCH design samtidigt; "2 veckors baslinje" på gamla blocket i gamla positionen mäter fel sak. **Fix:** baslinje = gamla blocket i NYA positionen (flytten sker ändå), sedan A/B gamla vs nya blocket i position 2. Annars kan ni inte skilja positionseffekt från designeffekt.

Mätplanen i övrigt: konsent-gatad, `experiment_id`, bucketing, KPI = leads/1000 visningar, candour aldrig testvariabel — allt per playbook §5/§5.1 ✓. `rotgt_details_open` som gratis intent-signal är en bra idé.

## 6. BYGGBARHET — PASS (en teknisk verifiering)

Att ersätta `connector-lines.js` med CSS-dashed border och `heading-highlight.js` med server-renderad span är en ren förbättring (färre runtime-beroenden, redaktören ser accenten). `<details>` server-renderad i DOM ✓ (data:-URI-lärdomen respekterad). Kvitto som riktig tabellmarkup + `--shadow-primary` explicit definierad (§11.4-defekten ärvs inte) ✓. Villkorlig rendering per ACF-select är standard-Bricks. En verifiering: **`font-variant-numeric: tabular-nums` förutsätter att Outfit har tnum-featuren — obekräftat i tokenkanon (§9.4 noterar t.o.m. mono-font som GAP).** Testa i byggfasen; saknas tnum, lös radjusteringen med högerställd fast kolumnbredd i stället. Mobilmålhöjden ≤587 px är ett rimligt men overifierat mål — mät i ampy-syn-passet.

---

# TOTALBEDÖMNING: SHIPBAR MED FIX

Tesen är rätt: kvittot är en äkta signaturenhet (dramatiserar rankad rädsla #1, dubblerar inte heron, matar prisblocket), spec:en är ovanligt ärligt själv-riskflaggad, och satserna stämmer mot kanon. Inget kräver omarbetning av strukturen. Före bygge måste dock: (1) "Du deklarerar ingenting" strykas/ersättas, (2) GT-kvittots 48,5 %-schablon in i fotnoten eller eyebrow-omformulering, (3) fakturamodell-GAP:en (Risk 1) bekräftas av ägaren — den är blockets bärande mening och H2 + steg 3 faller utan den, (4) `procentsats` göras härledd i stället för fritt fält, (5) H2-accentmekanismen definieras, (6) ROT-fotnotens tak/skatteutrymmes-sammanblandning delas i två meningar, (7) villkorsraden "utan solceller gäller ROT" grindas på §6.5-GAP:en. Punkt 1–3 är hårda grindar; 4–7 är spec-fixar som inte rubbar riktningen.