# CRO-analys: ROT/Grön Teknik-processblocket i position 2 — konverteringsarkitektur

## 0. Utgångsläge: vad besökaren VET, TROR och FRUKTAR vid scroll-ögonblicket

Besökaren som ser detta block har per definition **inte konverterat i heron**. Hen har sett lead-formuläret och ring-knappen och scrollat förbi. Det är blockets hela kontext: publiken i position 2 är de som har en **oadresserad invändning**. Ur ampy-foretagsdata §7.1 vet vi exakt vilka invändningarna är, rankade: (1) "jag blir blåst på en friserad siffra", (2) "avdraget blir inte vad de lovar" (skatte-rug-pull, inverter-15%-fällan), (3) dolda kostnader, (4) oseriös firma, (5) cowboy-installatör som ogiltigförklarar försäkring och avdrag. Besökaren VET vad tjänsten är (heron sa det). Hen TROR att avdraget "nog finns men har en hake". Hen FRUKTAR att vara den som inte får avdraget eller betalar dolt påslag.

Blockets jobb i kedjan hero(form) → detta → nästa är alltså **invändningshantering nummer ett + priming**: fånga den som inte var redo, lös avdragstvivlet på plats, och skicka personen vidare NEDÅT i sidan varmare än hen kom — eller tillbaka UPP till formuläret. Dagens block gör nästan motsatsen. Fynden, rankade efter konverteringspåverkan:

---

## FYND 1 (P0): CTA:n exporterar sidans varmaste icke-konverterade trafik till en infosida — omvänd CTA-ekonomi

**Resonemang.** "Läs mer om ROT-avdrag" → /rot-avdrag-2026/ är en klassisk next-step-designmiss, och i position 2 blir den dyr på tre sätt:

1. **Vem klickar?** Den som klickar signalerar exakt "jag har avdragstvivel men är engagerad nog att agera" — det är den mest kvalificerade osäkra besökaren på hela sidan. Det är precis den person säljsidan ska behålla. I stället skickas hen till en informationssida utan tjänstespecifikt formulär, utan lokal/tjänstekontext, med utspätt konverteringsspår. Returresan tillbaka till /elservice/elcentral/ gör en minoritet.
2. **Vad köper klicket?** Informationen på målsidan som besökaren faktiskt behöver för köpbeslutet ryms i ~40 ord: 30 %, tak 50 000 kr/person/år, dras på fakturan, vi sköter ansökan. Att byta sidkontext mot 40 ord är en katastrofal CTA-ekonomi — kostnaden (tappat momentum, tappad sida) är enorm, nyttan nästan noll.
3. **Positionen förvärrar det.** På plats 2 är detta det FÖRSTA klickbara elementet efter heron. På mobil är knappen dessutom fullbredd och ser ut som sidans primära handling. Sidans mest exponerade tappbara yta är en exit.

**Så exploaterar vi det.** Invertera: **svara på avdragsfrågan inline** (kompakt faktarad eller `<details>`-accordion i blocket: sats, tak, fakturamekanism, "vi sköter ansökan") och gör blockets primära CTA till en **fortsättning av köpresan**: ankar-scroll till prisblocket/formuläret ("Se ditt pris efter ROT" ↓) eller `tel:`-klick för ring-preferenten. Degradera infosidan till en diskret textlänk längst ner ("Fördjupning: så fungerar ROT-avdraget 2026") — då behåller den sitt SEO/intern-länkvärde utan att vara blockets huvudhandling. Detta ändrar inte mallbarheten: länkmål och faktarad är redan ACF-bara.

## FYND 2 (P0): Blocket lovar sänkt kostnad men visar aldrig en krona — procenttal utan förankring konverterar inte

**Resonemang.** H2:n säger "Sänk kostnaden … genom 30% rot-avdrag" och sedan händer ingenting med pengarna. 30 % är en abstraktion; playbook-doktrinen är explicit: konverteringsögonblicket är "när den abstrakta smärtan blir en siffra besökaren äger". Ett procenttal ägs av ingen. Den analytiska besökaren (§7.1) letar dessutom efter payback/pris framför allt annat. Best practice hos svenska avdrags-kommunicerande aktörer (solar/värmepump-kategorin) är genomgående **pris-efter-avdrag i kronor**, ofta som före/efter-par — procenttalet är fotnoten, kronorna är budskapet.

**Så exploaterar vi det.** Ett per-sida ACF-datafält med ett **statiskt räkneexempel**: "Exempel: arbetskostnad 20 000 kr → ROT −6 000 kr → du betalar 14 000 kr." Före/efter-paret gör 30 % *kännbart* och kostar noll interaktivitet (web-block ska inte bära egen engine — ett statiskt exempel följer profilen). Prisdata finns i foretagsdata §3.5 men är **internt inkonsistent mellan sidor (känd RESIDUE)** → per-tjänst-exempelsiffran är en ägar-signoff-grind, inte något vi hittar på. Saknas siffra för en tjänst: [GAP], visa generisk mekanik utan belopp. OBS: kanon-beslutet "prisblock till pos 2" (befintligt ägarbeslut) betyder att detta block antingen SAMSPELAR med eller ABSORBERAR prisförankringen — de två blocken får inte dubblera eller motsäga varandras siffror; det ska avgöras i nästa fas, inte glidas förbi.

## FYND 3 (P0): Noll risk reversal på den faktiska rädslan — "får JAG avdraget?"

**Resonemang.** Ägarens mål #1 är "bygga tillit att tjänsten verkligen ger avdraget". Men avdraget är **villkorat**: det beror på personens skatteutrymme, ägande av bostaden, och för Grön Teknik-batteri dessutom på kvalificering (engine:n är solar-gated). Blocket påstår rakt av att du sänker kostnaden — exakt den kategoriska formulering som (a) marknadsföringslagen ogillar och (b) den brända besökaren misstror ("de lovar, men gäller det MIG?"). Tystnaden om villkoret är inte lugnande, den är misstänkt — den analytiska besökaren VET att det finns villkor och tolkar utelämnandet som haken.

**Så exploaterar vi det.** Gör villkoret till tjänstelöftet — Ampys starkaste kort (R11, costly signal): **"Avdraget beror på ditt skatteutrymme. Vi räknar på just ditt fall innan du bestämmer dig — räcker inte utrymmet säger vi det direkt."** Detta är risk reversal i candour-form: vi tar risken för avdragsfrågan åt dig, och vi lovar att säga nej-besked. Det kopplar dessutom ihop med steg 1 som REDAN säger "räknar ut hur mycket du kan spara" — idag hänger den meningen löst; med villkorsraden blir den ett löfte med tänder. Samma mekanik för GT-varianten: "50 % gäller batteriet 2026 — vi kollar att du kvalificerar innan du beställer." (Solar-gate-formuleringen för batteri: verifiera exakt villkor mot foretagsdata §6.5/engine innan copy låses — [GAP] på exakt kundformulering.)

## FYND 4 (P1): Steg 3 sitter på blockets största dolda tillgång — fakturamodellen — och slösar bort den på "vi skickar papper"

**Resonemang.** "Vi samlar ihop all dokumentation och skickar in ROT ansökan till Skatteverket åt dig" beskriver administration. Den verkliga kundnyttan i fakturamodellen är likviditetsbomben: **du betalar bara priset efter avdrag — du ligger aldrig ute med pengarna, du deklarerar ingenting.** Det är skillnaden mellan "de gör pappersarbete" och "jag behöver aldrig röra Skatteverket och min faktura är redan sänkt". För en 25 000 kr-central eller ett 80 000 kr-batteri är "du behöver inte ligga ute med 7 500/40 000 kr" ett tyngre argument än hela processgrafiken. [GAP: bekräfta att Ampy tillämpar fakturamodellen på både ROT och GT-utbetalning — nästan säkert ja (GT fungerar bara så), men ägarbekräfta innan copyn låses.]

**Så exploaterar vi det.** Skriv om steg 3 utfallsformulerat + mekanismförklarat (R10): "Du betalar priset efter avdrag direkt på fakturan. Vi begär resten från Skatteverket — du deklarerar ingenting." Mekanismförklaringen ("så här funkar det, därför kan du lita på det") är exakt vad som skiljer candour från påstående.

## FYND 5 (P1): Ett tillitsblock utan ett enda proof-element

**Resonemang.** Blockets uttalade jobb är tillit, men det innehåller noll bevis: ingen auktoritetsankring, ingen volym, ingen legitimitet. Det finns en kedja som är *sakligt lastbärande*, inte dekorativ: **ROT-avdrag förutsätter att utföraren har F-skattsedel, och elarbete förutsätter att företaget är registrerat hos Elsäkerhetsverket.** Att namnge F-skatt + Elsäkerhetsverket-registrering ÄR beviset för att avdraget fungerar — information scent i sin renaste form: den skeptiska besökaren kan verifiera båda själv (Ampy länkar redan "Kolla elföretaget"-deep-linken i editorial, foretagsdata §1.1). Skatteverket-badgen finns redan i sajtens badge-uppsättning (visad, rights: evident).

**Så exploaterar vi det.** En smal proof-rad i blocket: "Registrerat elinstallationsföretag hos Elsäkerhetsverket · F-skattsedel · [ev. 'över 600 centralbyten' på elcentral-sidan — sidspecifikt ACF-fält, bara där fakta finns]". Aldrig "1000+ kunder"/"5.0" (kanon-förbud). Volymsiffran "över 3000 installationer per år" är ägarbekräftad och användbar som generisk mall-siffra. Verifierbarhet slår utsmyckning: gör Elsäkerhetsverket-raden klickbar till registret — en länk UT som paradoxalt ökar konvertering, för den som klickar den kommer tillbaka övertygad (och de flesta klickar inte, de ser bara att länken vågar finnas).

## FYND 6 (P1): H2-mallen är trasig som mall — och blockets enda kända grammatikfel bor i tillitsblocket

**Resonemang.** Två separata fel: (a) "Vår experter" ligger live i ACF-mallen — på ALLA sidor som delar fältet. Den analytiska besökaren gör den orättvisa men obönhörliga inferensen: *slarvar de med texten, slarvar de med ansökan?* Ett stavfel i just det block som ber om förtroende för en myndighetsprocess är asymmetriskt dyrt. (b) H2-formeln "Sänk kostnaden för [tjänst] genom [X]% [avdrag]" producerar styltig svenska ("genom 30% rot-avdrag" — "genom" är fel preposition, "rot" gement är inkonsekvent) och skalar dåligt över 22 tjänster + programmatiska orter.

**Så exploaterar vi det.** Central ACF-fix (ett fält, alla sidor lagas samtidigt — mallens styrka). Ny H2-formel som är robust över alla sidor och siffer-ledd: "[Tjänst] med 30 % ROT-avdrag — vi sköter hela ansökan" eller ännu hellre kron-ledd när fynd 2:s exempel finns. Teal-highlight-mekaniken (sista 3 orden) behålls men läggs på nyckelfrasen, inte på slumpord.

## FYND 7 (P1): Stegtexterna beskriver Ampys process, inte besökarens utfall

**Resonemang.** "Projektledning med expert", "Installation av elektriker" är intern-processuella rubriker — organisationsschema, inte kundnytta. Besökaren i position 2 frågar inte "hur är ni organiserade?" utan "vad händer med MIG och när vet jag vad det kostar?". Dessutom: "certifierade elektriker" är fel term — det juridiskt meningsbärande är **behörig/auktoriserad elektriker + registrerat elinstallationsföretag**. Rätt term är dubbelt värd: den är candour (exakthet) och den är in-group-signal till hantverkarpubliken (Audience B, §7.2) som forwardar/rekommenderar — "certifierad" låter som marknadsföring, "auktoriserad" låter som bransch.

**Så exploaterar vi det.** Utfallsformulera stegen (behåll 3-stegs-skelettet, det är rätt):
1. "Du får en exakt siffra innan du bestämmer dig" (+ villkorsraden från fynd 3)
2. "Auktoriserad elektriker utför jobbet" (+ försäkrings/ansvars-mikrocopy — adresserar rädsla #5)
3. "Du betalar efter avdrag — vi tar resten med Skatteverket" (fynd 4)
Detta är fortfarande 100 % mall-bart: tre ACF-textfält, precis som idag.

## FYND 8 (P2): Blocket är helt passivt — inget mikro-åtagande mellan hero-asken och nästa block

**Resonemang.** Ägarmål #3 är engagemang/priming. Hero-formulärets ask är stor (kontaktuppgifter). Position 2 erbjuder idag ingenting mellan "ge oss dina uppgifter" och "läs passivt" — trappan saknar steg. Micro-commitment-doktrin: en liten, avslutad handling (se sitt exempel, expandera "så funkar avdraget", tappa ett ankare till priset) ökar sannolikheten för nästa, större handling. Dagens block har noll interaktionsytor utom exit-länken.

**Så exploaterar vi det.** Lågfriktion, ingen engine: (a) `<details>`-accordion "Så fungerar avdraget på din faktura" (mät öppningarna — gratis intent-signal), (b) ankar-CTA:n från fynd 1 ("Se ditt pris efter ROT ↓") som är ett mikro-åtagande i sig och primar nästa block exakt som ägaren vill, (c) på sidor där kalkylator/prisblock finns nedanför: en teaser-rad av deras hero-siffra. Blocket blir kedjelänken hero→pris i stället för en återvändsgränd.

## FYND 9 (P2): Avdrags-förväxlingen (ROT vs GT, 50 vs 15 %) är marknadens kända sår — blocket preempterar den inte

**Resonemang.** Rädsla #2 i målgruppsdatan är specifikt skatte-rug-pull, med inverter-15%-fällan som namngivet exempel (~35 pp gap mellan vad säljare antytt och vad Skatteverket ger). Solceller sänktes 20→15 % 2025; 60-öringen dog 2026; folk VET att satser ändras. Ett block som bara säger "50% Grön Teknik" utan att visa att Ampy kan regelverkets kanter läses av den brända som ännu en säljare som rundar uppåt. Att förekomma invändningen (Schlitz-preemption) är den starkaste tillitsbyggaren som finns i den här kategorin — och ingen konkurrent gör det, eftersom deras pitch inte överlever nyanserna.

**Så exploaterar vi det.** En preemption-rad per variant (ACF-fält per avdragstyp, inte per sida — skalar): GT-batteri: "50 % gäller batteriet, 15 % gäller solceller — vi räknar rätt sats på rätt del, och taket är 50 000 kr per person och år." ROT: "30 % på arbetskostnaden, max 50 000 kr per person och år — vi visar exakt vad som är arbete i din offert." Att nämna taket är dessutom relevansmarkör för stora jobb (batteri) och kan öppna för tvåsökande-mekaniken (upp till 100 000 kr) på GT-sidor — beslutskritisk info som signalerar "de kan reglerna bättre än Skatteverkets egen sida".

## FYND 10 (P2): Fel densitet för position 2 — en helskärm viewport för tre meningar

**Resonemang.** Position 2 är sidans näst dyraste yta. Dagens block spenderar ~en full viewport (mer på mobil, där rad-layouten staplar) på: 1 rubrik + 3 korta meningar + 1 exit-knapp. Informationstätheten per pixel är bland sidans lägsta samtidigt som positionsvärdet är näst högst. Varje extra scrollhöjd i position 2 skjuter dessutom ALLA efterföljande block (pris, proof, innehåll) nedåt — blocket beskattar hela sidans funnel.

**Så exploaterar vi det.** Komprimera vertikalt och höj densiteten: H2 + 3 steg + kron-exempel (fynd 2) + proof-rad (fynd 5) + preemption-rad (fynd 9) ska rymmas i ungefär samma höjd som dagens block. Mobil: överväg att stegen tightas (mindre ikoner, mindre luft) — dagens 55px-ikon+text-rader är luftiga för sitt informationsvärde. Detta är ett kompositionsbeslut för wireframe-fasen; CRO-kravet är bara: **mer beslutsinformation per scrollcentimeter, inte mer scroll**.

## FYND 11 (P2): Grön Teknik-varianten ärver ROT-strukturen men har en annan riskprofil — mallen får inte platta ut skillnaden

**Resonemang.** ROT-besökaren (elcentral, service) är i "trasigt/måste fixas"-läge: låg skepsis mot avdraget, hög priskänslighet. GT-besökaren (batteri ~70–100k) är i "investering"-läge: bränd av FCR-D-historien, maximal skepsis, och avdraget är halva kalkylen. Samma tre steg + samma CTA-mönster för båda behandlar två olika psykologier som en. GT-varianten behöver preemption + kvalificeringsvillkor (fynd 3/9) mycket hårdare än ROT-varianten behöver dem; ROT-varianten behöver kron-exemplet och fakturamodellen hårdare.

**Så exploaterar vi det.** Behåll EN mallstruktur (kravet) men gör två av ACF-fälten **variant-vägda**: preemption-raden och exempel-raden får olika tyngdpunkt per avdragstyp. Det är fortfarande en mall med textbyten — men textbytena är designade per riskprofil i stället för sök-ersätt av tjänstenamnet. Kommersiell prioritet (service > laddbox > batteri) betyder: optimera ROT-varianten först, den bär flest sidor.

## FYND 12 (P3): Blocket är oinstrumenterat — flytten till position 2 kan inte utvärderas och dagens CTA-läcka kan inte kvantifieras

**Resonemang.** Inga events på knappklick, ingen koppling block-exponering→lead. Vi kan alltså inte ens mäta hur stor fynd 1-läckan är (min hypotes: klickfrekvensen på "Läs mer" är låg, men de som klickar är dyra förluster — båda talen är mätbara). Utan baslinje blir positionsflytten + omdesignen okontrollerbar — vi kommer inte veta vad som gjorde vad.

**Så exploaterar vi det.** Före omdesign: instrumentera dagens block per playbook §5 (consent-gated dataLayer: `block_view`, `cta_click` med mål-typ [info-exit / anchor / tel], `details_open`, allt med `experiment_id`+`variant` och sid-slug). Kör 2 veckor baslinje. Sedan A/B: dagens block vs omkomponerat block, KPI = lead per 1000 sidvisningar (inte klick på blocket — blockets jobb är sidans lead, inte sitt eget engagemang). Candour-reglerna är aldrig testvariabler.

## FYND 13 (P3): Kannibaliserings-gränsen är feldragen åt fel håll — blocket undviker att sälja så hårt att det inte ens assisterar

**Resonemang.** Rambegränsningen "får inte kannibalisera heron" har i praktiken gjort blocket säljfritt: enda handlingen är att lämna sidan. Men komplement ≠ passivitet. Rätt gränsdragning: blocket bär **inget eget formulär** (korrekt, web-block-profilen) men det får och ska **ruta tillbaka** till sidans konverteringspunkter. En besökare som efter blocket tänker "ok, avdraget funkar, de sköter allt" och sedan möter… nästa block utan uppmaning, är en tappad varm stund. Ring-preferenten (stor andel i hantverkskategorin, särskilt 55+-segmentet på elcentral/service) har efter heron ingen ny ring-yta förrän långt ner.

**Så exploaterar vi det.** Dubbel mjuk-CTA i blockets slut: primär = ankare till pris/formulär ("Se ditt pris efter ROT"), sekundär = `tel:`-textlänk ("Hellre prata? 010-265 79 79"). Ingen av dem konkurrerar med heron — de återanvänder dess mål. Exit-länken till infosidan degraderas per fynd 1.

---

## Sammanfattande arkitekturbild (rådata till nästa fas)

Blockets nya jobbeskrivning i position 2: **"Avdragstvivel in → ägd siffra + verifierbart förtroende ut, riktning nedåt/uppåt på sidan, aldrig ut från den."** De fem strukturella flyttarna i prioritetsordning: (1) döda exit-CTA:n, ersätt med ankare+tel+inline-svar; (2) kron-exempel per sida (ägargrindad siffra, ACF); (3) villkors-/kvalificerings-raden som risk reversal; (4) fakturamodellen som steg-3-nytta; (5) proof-rad med F-skatt/Elsäkerhetsverket (verifierbar, inte dekorativ). Öppna grindar: [GAP] fakturamodell-bekräftelse (ROT + GT-utbetalning), [GAP] kanoniskt prisexempel per tjänst (känd §3.5-inkonsistens), [GAP] exakt kundformulering av GT-batteriets kvalificeringsvillkor, samspelet med det redan beslutade prisblocket i pos 2 (får inte dubblera siffror), samt "Vår experter"-fixen (central ACF-ändring, kan göras idag oberoende av allt annat).