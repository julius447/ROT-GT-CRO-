#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger förhandsvisningarna i 04-preview/fran-php/ ur den RIKTIGA PHP-utdatan.

Poängen: det som granskas ska vara de exakta byte shortcoden skickar ut, inte en
handkopierad markup. Sidkromet (av-preview-krom) hämtas verbatim ur designfilen så
att förhandsvisningen och designen har identisk yttre miljö — annars mäter
paritetsgrindarna kromets skillnader i stället för blockets.

Kör:  php /tmp/wp-stub.php  (skriver /tmp/php-out-<typ>.html)  först.
"""
import os, re

DES = "/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs"
OUT = "/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview/fran-php"

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
