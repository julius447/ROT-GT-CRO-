#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kontrollerar varje radhänvisning i handover-dokumentationen mot den riktiga filen.

Bakgrund: PHP-filen byggdes om fyra gånger under arbetet. Varje ombygge flyttade
radnumren, och dokumentationen pekade tyst på fel rader. Ingen läsare upptäcker det
— de öppnar filen, ser något som nästan stämmer, och tror sig ha fel själva.

Metoden: dokumentet får bära ett facit. Skriv hänvisningen som

    (php rad 90: `wp_enqueue_style`)      ← kolon + backtickat kännetecken

så kan skriptet läsa rad 90 i filen och kontrollera att kännetecknet står där.
Hänvisningar utan kännetecken listas som "okontrollerbara" — de är inte fel,
men de kan inte bevisas.

Kör:  python3 kontrollera-radhanvisningar.py
Utfall: exit 0 om alla kontrollerbara hänvisningar stämmer, annars 1.
"""
import os
import re
import sys


def _hitta(marker, *kandidater):
    for k in kandidater:
        if os.path.exists(os.path.join(k, marker)):
            return os.path.abspath(k)
    raise SystemExit("hittar ingen katalog som innehåller %r" % marker)


_HAR = os.path.dirname(os.path.abspath(__file__))
LEV = os.environ.get("AVDRAG_LEVERANS") or _hitta(
    "02-fluentsnippets",
    os.path.join(_HAR, "..", ".."),
    os.path.expanduser("~/Desktop/Ampy Avdragsblock — Leverans Chris"),
)

FILER = {
    "php": os.path.join(LEV, "02-fluentsnippets", "ampy-avdrag.php"),
    "css": os.path.join(LEV, "02-fluentsnippets", "ampy-avdrag.css"),
}
RADER = {k: open(v, encoding="utf-8").read().splitlines() for k, v in FILER.items()}

# "php rad 90: `wp_enqueue_style`"  ·  "css rad 17: `@font-face`"
MED_FACIT = re.compile(r"\b(php|css) rad (\d+): `([^`]+)`")
# varje övrig radhänvisning till php/css
UTAN_FACIT = re.compile(r"\b(php|css) rad (\d+)")

DOK = os.path.join(LEV, "01-dokumentation")
fel, kontrollerade, okontrollerbara = [], 0, 0

for namn in sorted(os.listdir(DOK)):
    if not namn.endswith(".md"):
        continue
    for i, rad in enumerate(open(os.path.join(DOK, namn), encoding="utf-8"), 1):
        med = {m.start() for m in MED_FACIT.finditer(rad)}
        for m in MED_FACIT.finditer(rad):
            fil, nr, facit = m.group(1), int(m.group(2)), m.group(3)
            kontrollerade += 1
            rader = RADER[fil]
            if nr < 1 or nr > len(rader):
                fel.append(f"{namn}:{i} — {fil} rad {nr} finns inte (filen har {len(rader)} rader)")
            elif facit not in rader[nr - 1]:
                fel.append(
                    f"{namn}:{i} — {fil} rad {nr} skulle innehålla {facit!r}\n"
                    f"    men innehåller: {rader[nr - 1].strip()[:90]!r}"
                )
        for m in UTAN_FACIT.finditer(rad):
            if m.start() not in med:
                okontrollerbara += 1

print(f"kontrollerade hänvisningar : {kontrollerade}")
print(f"utan facit (obevisbara)    : {okontrollerbara}")
print(f"fel                        : {len(fel)}")
for f in fel:
    print("  " + f)
sys.exit(1 if fel else 0)
