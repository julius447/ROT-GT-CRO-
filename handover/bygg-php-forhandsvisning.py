#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger förhandsvisningarna i 04-preview/fran-php/ ur den RIKTIGA PHP-utdatan.

Poängen: det som granskas ska vara de exakta byte shortcoden skickar ut, inte en
handkopierad markup. Sidkromet (av-preview-krom) hämtas verbatim ur designfilen så
att förhandsvisningen och designen har identisk yttre miljö — annars mäter
paritetsgrindarna kromets skillnader i stället för blockets.

Kör:  php verifiera-php.php  (skriver /tmp/php-out-<typ>.html)  först.
"""
import re

import os

def _hitta(marker, *kandidater):
    """Löser en sökväg relativt SKRIPTETS plats, inte arbetskatalogen.

    Skripten finns i två exemplar: i arbetsrepot (handover/ bredvid designs/) och
    i leveransen (05-underlag/byggskript/ bredvid 07-design-kallor/). Med absoluta
    sökvägar läste leveranskopian tyst arbetsrepots designfiler — en ändring i
    07-design-kallor/ försvann utan felmeddelande.

    `marker` är en fil eller mapp som MÅSTE finnas inuti rätt katalog. Att bara
    kolla att katalogen existerar räcker inte: i arbetsrepot pekar "två nivåer upp"
    på en helt annan mapp som också finns, och skripten skrev då sin leverans dit.
    """
    for k in kandidater:
        if os.path.exists(os.path.join(k, marker)):
            return os.path.abspath(k)
    raise SystemExit(
        "hittar ingen katalog som innehåller %r. Sätt AVDRAG_DESIGN/AVDRAG_LEVERANS.\n  provade: %s"
        % (marker, ", ".join(os.path.abspath(k) for k in kandidater))
    )

_HAR = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get("AVDRAG_DESIGN") or _hitta(
    "d2-kvittot-forst.html",
    os.path.join(_HAR, "..", "designs"),                 # arbetsrepot
    os.path.join(_HAR, "..", "..", "07-design-kallor"),  # leveransen
)
_LEVROT = os.environ.get("AVDRAG_LEVERANS") or _hitta(
    "02-fluentsnippets",
    os.path.join(_HAR, "..", ".."),                                       # leveransen
    os.path.expanduser("~/Desktop/Ampy Avdragsblock — Leverans Chris"),   # arbetsrepot
)
DES = SRC
OUT = os.path.join(_LEVROT, "04-preview", "fran-php")

DESIGNFIL = {
    "rot":           "d2-kvittot-forst.html",
    "gt-produkt":    "gt-produkt.html",
    "gt-generisk":   "gt-generisk.html",
    "hemforsakring": "hemforsakring.html",
}

os.makedirs(OUT, exist_ok=True)

for typ, fil in DESIGNFIL.items():
    design = open(os.path.join(DES, fil), encoding="utf-8").read()
    m = re.search(r'<style id="av-preview-krom">.*?</style>', design, re.S)
    if not m:
        raise SystemExit(f"kromet saknas i {fil}")
    krom = m.group(0)

    php = open(f"/tmp/php-out-{typ}.html", encoding="utf-8").read().strip()

    open(os.path.join(OUT, f"{typ}.html"), "w", encoding="utf-8").write(
        '<!DOCTYPE html>\n<html lang="sv-SE">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f'<title>PHP-utdata {typ}</title>\n'
        '<link rel="stylesheet" href="../../02-fluentsnippets/ampy-avdrag.css">\n'
        f'{krom}\n</head>\n'
        f'<body>\n<div class="av-preview">\n{php}\n</div>\n</body>\n</html>\n'
    )
    print(f"fran-php/{typ}.html  ({len(php):,} B PHP-utdata)")
