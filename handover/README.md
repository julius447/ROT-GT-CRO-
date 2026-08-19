# Blockmappning — avdragsblocken på ampy.se

Det här är underlaget för att rulla ut avdragsblocken på rätt landningssida med rätt copy.
En rad per sida, 278 sidor totalt.

**Fil:** `blockmappning.csv` (semikolon-separerad, UTF-8 med BOM → öppnas direkt i Excel)
**Genererad av:** `generera-mappning.py` (kör om skriptet om något ska ändras systematiskt,
redigera inte CSV:n för hand — då tappar vi reglerna)

---

## 1. De fyra blocken

| Blocktyp | Används när | Preview |
|---|---|---|
| `ROT` | Arbete i befintlig bostad (elektriker, elinstallation, elservice) | [d2-kvittot-forst.html](../designs/d2-kvittot-forst.html) |
| `GT_PRODUKT` | En **namngiven produkt** med pris på sidan (laddbox-/batterimodell) | [gt-produkt.html](../designs/gt-produkt.html) |
| `GT_GENERISK` | Laddbox/batteri **utan känd modell** (ort- och hubbsidor) | [gt-generisk.html](../designs/gt-generisk.html) |
| `HEMFORSAKRING` | Jobb där ROT inte gäller (eljour, felsökning) | [hemforsakring.html](../designs/hemforsakring.html) |

**Fördelning:** ROT 135 · GT_GENERISK 58 · HEMFORSAKRING 58 · GT_PRODUKT 26 · utan block 1

---

## 2. Kolumnerna, och var de hamnar i blocket

| Kolumn | Vad det är | Var i blocket |
|---|---|---|
| `blocktyp` | Vilket av de fyra blocken sidan ska ha | — |
| `url` | Landningssidan | — |
| `sidtyp` | Startsida / Hubb / Ortssida / Tjänstesida / Produktsida | — |
| `h2_full` | Hela rubriken, för korrekturläsning | — |
| `h2_bas` | Rubrikens **första del** (svart, normal vikt) | `<h2>` före `<span class="accent">` |
| `h2_accent` | Rubrikens **pengafras** (fetare + understruken) | `<span class="accent">` |
| `kvitto_rad1` | Etiketten på kvittots första rad | `.r-row .lbl` (första raden) |
| `sats` | 30 % / 50 % | `data-slot="sats"` |
| `kommentar` | Grindar och varningar för just den sidan | — |

Allt annat i blocket (steg 1-2-3, totalplattan, finstilten, CTA) är **identiskt på alla
sidor inom samma blocktyp** och behöver inte fyllas per sida.

---

## 3. Reglerna bakom rubrikerna

Mallen är densamma i hela familjen: **[jobb/produkt] (+ i [Ort]) med [sats] % [avdragsnamn]**,
där pengafrasen alltid står sist och bär accenten. Hemförsäkringsblocket är familjens enda
verbform men följer samma skelett: jobbet först, pengafrasen accentuerad sist.

**Verbet i ROT-rubriken följer sidans intent** — det är den enda platsen där rubrikerna
skiljer sig på riktigt:

| Intent | Verb | Exempel |
|---|---|---|
| Byta ut något befintligt | *Byta* | "Byta elcentral med 30 % ROT-avdrag" |
| Installera något nytt | *Installera* | "Installera ugn och spis med 30 % ROT-avdrag" |
| Arbete i ett utrymme | *Elarbete i* | "Elarbete i badrummet med 30 % ROT-avdrag" |
| Ett helt projekt | jobbnamnet självt | "Köksrenovering med 30 % ROT-avdrag" |
| Anlita någon (ort/hubb) | yrket/tjänsten | "Elektriker i Täby med 30 % ROT-avdrag" |

**Kvittots rad 1** namnger det som offereras: produkt eller armatur får `+ installation`,
renoveringsprojekt får `+ elarbete`, rena arbetsjobb står ensamma ("Elarbete", "Elrenovering").

---

## 4. Sidor som INTE ska ha något block

Allt som inte finns i CSV:n ska sakna avdragsblock. Konkret gäller det dessa sitemaps:

- `post-sitemap1.xml` (blogg/artiklar)
- `page-sitemap1.xml` — **utom** de fem hubbar som finns i CSV:n
  (`/`, `/elektriker/`, `/elinstallation/`, `/laddbox/`, `/batterilagring/`, `/eljour/`)
- `elektriker-for-x-sitemap1.xml`
- `team-member-sitemap1.xml`
- `lead-magnet-sitemap1.xml`

`service-sitemap1.xml`, `elektriker-i-`, `elinstallation-i-`, `eljour-i-`, `laddbox-i-`,
`ev-product-` och `battery-product-` är däremot **helt inkluderade** i CSV:n.

---

## 5. Grindar som måste stängas före publicering

**Blockerande för hela utrullningen:**

1. **CTA-målets URL.** Alla block har `href="#"` som platshållare. Bestäm destination:
   offertformuläret eller ankare till hero-formuläret. Hemförsäkringsblockets CTA är
   telefon (`tel:`) och är redan klar.
2. **Fakturamodellen.** Steg 3 säger "Avdraget dras direkt på fakturan". Bekräfta att det
   gäller undantagslöst på både ROT och Grön Teknik.

**Blockerande för GT_PRODUKT (26 sidor):**

3. **50 % eller 48,5 %?** Sajten räknar flat ×2, men Skatteverkets 97-procentsschablon ger
   ~48,5 % av totalen. Kvittot visar "pris före avdrag → −50 % → sajtpris" och behöver ett
   låst svar innan riktiga belopp fylls i.
4. **Priserna per produkt.** Varje produktsida behöver sitt pris före avdrag och sitt
   sajtpris. Placeholders i previewen är 10 000:- → 5 000:-.
5. **Tvåägarraden** för Sonnen, SigenStor och Pixii Home — deras priser överstiger takets
   50 000 kr för en ägare, vilket sajten inte säger idag.

**Enskilda sidor (se `kommentar`-kolumnen):**

6. **`/elservice/elbesiktning/` — inget block.** ROT gäller inte besiktning (inget
   åtgärdande arbete) och besiktning täcks normalt inte av hemförsäkring. Ägarbeslut:
   antingen inget block eller en egen variant.
7. **`/elservice/luftvarmepump/`** kan i vissa fall gå under Grön Teknik i stället för ROT.
8. **`/elservice/glodlampa/`** — rubriken är lyft från "glödlampa" till "lampor och
   armatur"; ett lampbyte är för litet för att bära ROT-argumentet.
9. **Batterisidor** bär solcellsgrinden (50 % kräver solceller). Laddboxsidor gör det
   ALDRIG — grinden får inte läcka dit.

---

## 6. Så använder du filen

1. Öppna `blockmappning.csv` i Excel. Filtrera på `blocktyp` för att jobba med en blocktyp
   i taget.
2. Klistra in rätt block på sidan (Bricks-mallen per blocktyp).
3. Fyll i `h2_bas`, `h2_accent` och `kvitto_rad1` från raden. Övrigt innehåll är mall-fast.
4. För GT_PRODUKT: fyll även pris före avdrag och sajtpris när grind 3–4 är stängda.
5. Läs `kommentar` innan du publicerar sidan — där står allt som är sidspecifikt.
