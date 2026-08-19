#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger 04-preview/alla-fyra.html: alla fyra varianterna på SAMMA sida.

Det är kontrollen av att blocken kan samexistera — instansunika id:n (varje
block räknas upp av `static $rakn` i shortcoden), ingen variantstil som läcker
över till en annan variant, och ingen dubblerad stilmall.

Kör efter `php verifiera-php.php`, som skriver /tmp/php-out-<typ>.html.
"""
import os, re

DES = "/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs"
OUT = "/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/04-preview"

VARIANTER = [
    ("rot",           "ROT — tjänste- och ortssidor",        '[ampy_avdrag typ="rot" …]'),
    ("gt-produkt",    "Grön Teknik — produktsida (riktiga priser)", '[ampy_avdrag typ="gt-produkt" …]'),
    ("gt-generisk",   "Grön Teknik — generisk (ort/hubb)",   '[ampy_avdrag typ="gt-generisk" …]'),
    ("hemforsakring", "Hemförsäkring — eljour och felsökning", '[ampy_avdrag typ="hemforsakring" …]'),
]

krom = re.search(r'<style id="av-preview-krom">.*?</style>',
                 open(os.path.join(DES, "d2-kvittot-forst.html"), encoding="utf-8").read(), re.S).group(0)

delar = []
for typ, rubrik, sc in VARIANTER:
    php = open(f"/tmp/php-out-{typ}.html", encoding="utf-8").read().strip()
    delar.append(
        f'<div class="wf-label"><span>{rubrik}</span></div>\n'
        f'<div class="wf-sc">shortcode: <code>{sc}</code></div>\n{php}\n'
    )

open(os.path.join(OUT, "alla-fyra.html"), "w", encoding="utf-8").write(
    '<!DOCTYPE html>\n<html lang="sv-SE">\n<head>\n<meta charset="UTF-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    '<title>Ampy avdragsblock — kontrollsida, alla fyra varianter</title>\n'
    '<link rel="stylesheet" href="../02-fluentsnippets/ampy-avdrag.css">\n'
    f'{krom}\n'
    '<style>\n'
    '.wf-sc { font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; color: #5b6180;\n'
    '         margin: -6px 0 14px; }\n'
    '.wf-sc code { background: #e8eef9; padding: 2px 6px; border-radius: 4px; }\n'
    '.av-preview > .ampy-avdrag { margin-bottom: 54px; }\n'
    '</style>\n</head>\n'
    '<body>\n<div class="av-preview">\n'
    '<div class="wf-label"><span>Kontrollsida · alla fyra varianter på samma sida '
    '(testar id-unikhet)</span></div>\n'
    + "\n".join(delar) +
    '</div>\n</body>\n</html>\n'
)
print("alla-fyra.html byggd ur PHP-utdatan · %d varianter" % len(VARIANTER))
