#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genererar blockmappningen (CSV) för avdragsblocken på ampy.se.

Regler (first principles):
  1. Blocktypen bestäms av VAD sidan säljer, inte av var den ligger:
     ROT            = arbete i befintlig bostad (elektriker/elinstallation/elservice)
     GT_PRODUKT     = en NAMNGIVEN produkt med pris på sidan (laddbox-/batterimodell)
     GT_GENERISK    = laddbox/batteri utan känd modell (ort- och hubbsidor)
     HEMFORSAKRING  = jobb där ROT inte gäller (eljour, felsökning)
  2. H2:n följer familjens mall: [jobb/produkt](+ i [Ort]) med [sats] % [avdragsnamn].
     Accenten (fet + understruken) är ALLTID pengafrasen i slutposition.
  3. Kvittots rad 1 namnger det som offereras. Produkt/armatur => "+ installation",
     renovering => "+ elarbete", rena arbetsjobb => enbart jobbet.
  4. Verbet i H2 måste matcha sidans intent: "Byta" (utbyte), "Installera" (nytt),
     "Elarbete i" (utrymme), jobbnamnet självt (renovering).
"""
import csv

ROT_ACCENT = "30 % ROT-avdrag"
GT_ACCENT  = "50 % Grön Teknik-avdrag"
HF_ACCENT  = "endast självrisken"

# ---------------------------------------------------------------- orter
ORTER = {
 "akersberga":"Åkersberga","alta":"Älta","alvik":"Alvik","alvsjo":"Älvsjö","arsta":"Årsta",
 "aspudden":"Aspudden","bagarmossen":"Bagarmossen","botkyrka":"Botkyrka","bromma":"Bromma",
 "danderyd":"Danderyd","ekero":"Ekerö","enskede":"Enskede","farsta":"Farsta",
 "flemingsberg":"Flemingsberg","grondal":"Gröndal","gullmarsplan":"Gullmarsplan",
 "hagersten":"Hägersten","haninge":"Haninge","hogdalen":"Högdalen","huddinge":"Huddinge",
 "jarfalla":"Järfälla","kungsangen":"Kungsängen","lidingo":"Lidingö","marsta":"Märsta",
 "nacka":"Nacka","norrtalje":"Norrtälje","nynashamn":"Nynäshamn","osteraker":"Österåker",
 "ragsved":"Rågsved","ronninge":"Rönninge","salem":"Salem","segeltorp":"Segeltorp",
 "sickla":"Sickla","sigtuna":"Sigtuna","skarholmen":"Skärholmen","skarpnack":"Skarpnäck",
 "skogas":"Skogås","skondal":"Sköndal","sodertalje":"Södertälje","sollentuna":"Sollentuna",
 "solna":"Solna","stockholm":"Stockholm","stuvsta":"Stuvsta","sundbyberg":"Sundbyberg",
 "taby":"Täby","tallkrogen":"Tallkrogen","trangsund":"Trångsund","tullinge":"Tullinge",
 "tumba":"Tumba","tyreso":"Tyresö","upplands-vasby":"Upplands Väsby",
 "upplands-bro":"Upplands-Bro","vallentuna":"Vallentuna","vallingby":"Vällingby",
 "varmdo":"Värmdö","vaxholm":"Vaxholm",
}
ELEKTRIKER_ORTER   = list(ORTER)
ELINSTALLATION_ORTER = list(ORTER)
LADDBOX_ORTER      = list(ORTER)
ELJOUR_ORTER       = list(ORTER)

# ------------------------------------------------- elservice (ROT om inget annat)
# slug: (h2_bas, kvittorad, kommentar)
ELSERVICE = {
 "elcentral":            ("Byta elcentral med",              "Elcentral + installation", ""),
 "belysning":            ("Installera belysning med",        "Belysning + installation", ""),
 "inomhusbelysning":     ("Installera inomhusbelysning med", "Inomhusbelysning + installation", ""),
 "utomhusbelysning":     ("Installera utomhusbelysning med", "Utomhusbelysning + installation", ""),
 "spotlights":           ("Installera spotlights med",       "Spotlights + installation", ""),
 "armatur":              ("Installera armatur med",          "Armatur + installation", ""),
 "glodlampa":            ("Byta lampor och armatur med",     "Lampor och armatur + installation",
                          "H2 lyft från 'glödlampa' till 'lampor och armatur': ett lampbyte är för litet för ROT-argumentet."),
 "strombrytare":         ("Byta strömbrytare med",           "Strömbrytare + installation", ""),
 "jordfelsbrytare":      ("Installera jordfelsbrytare med",  "Jordfelsbrytare + installation", ""),
 "lastbalansering":      ("Installera lastbalansering med",  "Lastbalansering + installation", ""),
 "golvvarme":            ("Installera golvvärme med",        "Golvvärme + installation", ""),
 "vitvaror":             ("Installera vitvaror med",         "Vitvaror + installation", ""),
 "ugn-spis":             ("Installera ugn och spis med",     "Ugn och spis + installation", ""),
 "luftvarmepump":        ("Installera luftvärmepump med",    "Luftvärmepump + installation",
                          "OBS: luftvärmepump kan i vissa fall gå under Grön Teknik. Ägargrind innan publicering."),
 "smarta-hem":           ("Installera smart hem med",        "Smart hem + installation", ""),
 "kok":                  ("Elarbete i köket med",            "Elarbete i kök", ""),
 "koksrenovering":       ("Köksrenovering med",              "Köksrenovering + elarbete", ""),
 "badrum":               ("Elarbete i badrummet med",        "Elarbete i badrum", ""),
 "badrumsrenovering":    ("Badrumsrenovering med",           "Badrumsrenovering + elarbete", ""),
 "elrenovering":         ("Elrenovering med",                "Elrenovering", ""),
}
# Undantag: besiktning ger varken ROT (inget åtgärdande arbete) eller normalt ersättning.
ELSERVICE_UNDANTAG = {
 "elbesiktning": ("INGET_BLOCK", "",
    "ROT gäller INTE besiktning (inget åtgärdande arbete) och besiktning täcks normalt inte av "
    "hemförsäkring (faktabas v2). Rekommendation: inget avdragsblock. Ägarbeslut."),
}

# ------------------------------------------------------------- GT-produkter
LADDBOXAR = {
 "zaptec-pro":"Zaptec Pro","zaptec-go":"Zaptec Go","zaptec-go-2":"Zaptec Go 2",
 "wallbox-pulsar-max":"Wallbox Pulsar Max","tesla-wall-connector":"Tesla Wall Connector",
 "nexblue-edge-2":"Nexblue Edge 2","go-e-gemini-flex-2-0":"go-e Gemini Flex 2.0",
 "garo-entity-pro":"Garo Entity Pro","garo-entity-home":"Garo Entity Home",
 "easee-charge-up":"Easee Charge Up","defa-power":"Defa Power",
 "charge-amps-luna":"Charge Amps Luna","charge-amps-halo":"Charge Amps Halo",
 "charge-amps-dawn":"Charge Amps Dawn","charge-amps-aura":"Charge Amps Aura",
 "amina-s":"Amina S",
}
BATTERIER = {
 "solaredge":"SolarEdge","sonnen":"Sonnen","enershare":"Enershare","eway":"Eway",
 "saj-hs3":"SAJ HS3","dyness-stack100":"Dyness Stack100","homevolt":"Homevolt",
 "pixii-home":"Pixii Home","emaldo-power-store":"Emaldo Power Store","sigenstor":"SigenStor",
}
# Batterier vars pris överstiger takets 50 000 kr för EN ägare (kräver 2-ägarraden)
TAK_VARNING = {"sonnen","sigenstor","pixii-home"}

rows = []
def add(blocktyp, url, sidtyp, h2_bas, h2_accent, kvitto, sats, kommentar=""):
    rows.append({
        "blocktyp": blocktyp, "url": url, "sidtyp": sidtyp,
        "h2_full": (h2_bas + " " + h2_accent).strip() if h2_accent else h2_bas,
        "h2_bas": h2_bas, "h2_accent": h2_accent,
        "kvitto_rad1": kvitto, "sats": sats, "kommentar": kommentar,
    })

# ---------------------------------------------------------------- ROT: hubbar
add("ROT","https://ampy.se/","Startsida","Elarbete i hemmet med",ROT_ACCENT,"Elarbete","30 %",
    "Startsidan är vertikal-agnostisk: H2 håller sig till 'elarbete i hemmet'.")
add("ROT","https://ampy.se/elektriker/","Hubb","Anlita elektriker med",ROT_ACCENT,"Elarbete","30 %")
add("ROT","https://ampy.se/elinstallation/","Hubb","Elinstallation med",ROT_ACCENT,"Elinstallation","30 %")

# ---------------------------------------------------------------- ROT: orter
for slug in ELEKTRIKER_ORTER:
    ort = ORTER[slug]
    add("ROT", f"https://ampy.se/elektriker/{slug}/", "Ortssida",
        f"Elektriker i {ort} med", ROT_ACCENT, "Elarbete", "30 %")
for slug in ELINSTALLATION_ORTER:
    ort = ORTER[slug]
    add("ROT", f"https://ampy.se/elinstallation/{slug}/", "Ortssida",
        f"Elinstallation i {ort} med", ROT_ACCENT, "Elinstallation", "30 %")

# ---------------------------------------------------------------- ROT: tjänster
for slug,(h2,kv,kom) in ELSERVICE.items():
    add("ROT", f"https://ampy.se/elservice/{slug}/", "Tjänstesida", h2, ROT_ACCENT, kv, "30 %", kom)
for slug,(typ,_,kom) in ELSERVICE_UNDANTAG.items():
    add(typ, f"https://ampy.se/elservice/{slug}/", "Tjänstesida", "", "", "", "", kom)

# ---------------------------------------------------------------- GT: hubbar (generisk)
add("GT_GENERISK","https://ampy.se/laddbox/","Hubb","Laddbox med",GT_ACCENT,
    "Laddbox + installation","50 %")
add("GT_GENERISK","https://ampy.se/batterilagring/","Hubb","Solcellsbatteri med",GT_ACCENT,
    "Solcellsbatteri + installation","50 %",
    "Solcellsgrind: batteri kräver solceller för 50 %. Villkorsraden ska bära den på batteriytor.")

# ---------------------------------------------------------------- GT: ortssidor (generisk)
for slug in LADDBOX_ORTER:
    ort = ORTER[slug]
    add("GT_GENERISK", f"https://ampy.se/laddbox/{slug}/", "Ortssida",
        f"Laddbox i {ort} med", GT_ACCENT, "Laddbox + installation", "50 %")

# ---------------------------------------------------------------- GT: produkter
for slug,namn in LADDBOXAR.items():
    add("GT_PRODUKT", f"https://ampy.se/laddboxar/{slug}/", "Produktsida",
        f"{namn} med", GT_ACCENT, f"{namn} + installation", "50 %",
        "Pris före avdrag + sajtpris fylls per produkt.")
for slug,namn in BATTERIER.items():
    kom = "Pris före avdrag + sajtpris fylls per produkt. Solcellsgrind gäller batteri."
    if slug in TAK_VARNING:
        kom += " TAK: sajtpriset överstiger 50 000 kr för en ägare — tvåägarraden krävs (ägargrind)."
    add("GT_PRODUKT", f"https://ampy.se/solcellsbatterier/{slug}/", "Produktsida",
        f"{namn} med", GT_ACCENT, f"{namn} + installation", "50 %", kom)

# ---------------------------------------------------------------- Hemförsäkring
add("HEMFORSAKRING","https://ampy.se/eljour/","Hubb","Nyttja hemförsäkringen vid eljour och betala",
    HF_ACCENT,"Eljour + reparation","")
add("HEMFORSAKRING","https://ampy.se/elservice/felsokning-av-el/","Tjänstesida",
    "Nyttja hemförsäkringen vid felsökning och betala",HF_ACCENT,"Felsökning + reparation","")
for slug in ELJOUR_ORTER:
    ort = ORTER[slug]
    add("HEMFORSAKRING", f"https://ampy.se/eljour/{slug}/", "Ortssida",
        f"Nyttja hemförsäkringen vid elfel i {ort} och betala", HF_ACCENT,
        "Eljour + reparation", "")

# ---------------------------------------------------------------- skriv CSV
FALT = ["blocktyp","url","sidtyp","h2_full","h2_bas","h2_accent","kvitto_rad1","sats","kommentar"]
with open("blockmappning.csv","w",newline="",encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=FALT, delimiter=";")
    w.writeheader(); w.writerows(rows)

from collections import Counter
c = Counter(r["blocktyp"] for r in rows)
print("Rader totalt:", len(rows))
for k,v in c.most_common(): print(f"  {k:<15} {v}")
