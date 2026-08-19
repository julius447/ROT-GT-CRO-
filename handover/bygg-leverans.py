#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger produktionsleveransen ur de fyra godkända designfilerna.

Transformen är AVSIKTLIGT dum för att vara bevisbart säker:
  - varje varianttyps produktions-CSS tas VERBATIM (kommentarer strippade) och
    prefixas med sin variantklass
  - specificiteten höjs likformigt inom varianten => inbördes kaskadordning oförändrad
  - varianterna kan aldrig störa varandra: en sida bär exakt en variantklass
  - @font-face och @keyframes är globala och dedupliceras till en kopia
Ingen regel skrivs om, ingen slås ihop, inget "smart" sker. Pariteten kan därför mätas.
"""
import re, json, hashlib

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
OUT = _LEVROT

VARIANTER = [
    ("d2-kvittot-forst", "rot",           "ROT"),
    ("gt-produkt",       "gt-produkt",    "Grön Teknik – produktsida"),
    ("gt-generisk",      "gt-generisk",   "Grön Teknik – generisk"),
    ("hemforsakring",    "hemforsakring", "Hemförsäkring"),
]

def strip_kommentarer(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)

def prod_css(fil):
    h = open(os.path.join(SRC, fil + ".html"), encoding="utf-8").read()
    return strip_kommentarer(re.search(r'<style id="ampy-avdrag-css">(.*?)</style>', h, re.S).group(1))

def block_html(fil):
    """Wrappern .ampy-avdrag med allt innehåll (preview-krom exkluderat)."""
    h = open(os.path.join(SRC, fil + ".html"), encoding="utf-8").read()
    i = h.index('<div class="ampy-avdrag')
    depth, k = 0, i
    while k < len(h):
        if h.startswith("<div", k) or h.startswith("<section", k): depth += 1
        elif h.startswith("</div>", k):
            depth -= 1
            if depth == 0: return h[i:k+6]
        elif h.startswith("</section>", k): depth -= 1
        k += 1
    raise RuntimeError("wrapper ej sluten i " + fil)

# ------------------------------------------------------- CSS-tokenisering
def dela_toppniva(css):
    """Dela CSS i toppnivåbitar: ('at', text) för @font-face/@keyframes,
       ('grupp', prelude, innehåll) för @media/@container/@supports,
       ('regel', selektorer, deklarationer) för vanliga regler."""
    bitar, i, n = [], 0, len(css)
    while i < n:
        while i < n and css[i] in " \t\r\n": i += 1
        if i >= n: break
        j = css.find("{", i)
        if j < 0: break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == "{": depth += 1
            elif css[k] == "}": depth -= 1
            k += 1
        innehall = css[j+1:k-1]
        if re.match(r"@(font-face|keyframes)\b", prelude):
            bitar.append(("at", css[i:k]))
        elif prelude.startswith("@"):
            bitar.append(("grupp", prelude, innehall))
        else:
            bitar.append(("regel", prelude, innehall))
        i = k
    return bitar

def prefixa_selektor(sel, vk):
    sel = sel.strip()
    if not sel: return sel
    if sel.startswith(".ampy-avdrag"):
        return sel.replace(".ampy-avdrag", f".ampy-avdrag.{vk}", 1)
    return f".ampy-avdrag.{vk} {sel}"

def rendera(bitar, vk, indent=""):
    ut = []
    for b in bitar:
        if b[0] == "regel":
            sels = ",".join(prefixa_selektor(s, vk) for s in b[1].split(",") if s.strip())
            decls = " ".join(b[2].split())
            ut.append(f"{indent}{sels}{{{decls}}}")
        elif b[0] == "grupp":
            inre = rendera(dela_toppniva(b[2]), vk, indent + "  ")
            ut.append(f"{indent}{b[1]}{{\n{inre}\n{indent}}}")
    return "\n".join(ut)

delar, globala_alla = [], []
for fil, klass, namn in VARIANTER:
    bitar = dela_toppniva(prod_css(fil))
    globala_alla += [b[1] for b in bitar if b[0] == "at"]
    delar.append((namn, klass, rendera(bitar, f"ampy-avdrag--{klass}")))

sedda, globala = set(), []
for g in globala_alla:
    nyckel = hashlib.md5(re.sub(r"\s+", " ", g).encode()).hexdigest()
    if nyckel in sedda: continue
    sedda.add(nyckel); globala.append(re.sub(r"\s+", " ", g))

HUVUD = """/* ============================================================================
   Ampy — avdragsblocken (ROT · Grön Teknik · Hemförsäkring)
   Genererad av handover/bygg-leverans.py. REDIGERA INTE FÖR HAND.
   Källa: de fyra godkända designfilerna i rot-gt-cro/designs/ (kommenterad källkod).

   Allt är scopat under .ampy-avdrag. Filen innehåller INGA globala selektorer och
   kan därför inte påverka resten av sidan.

   Varianten väljs med en klass på wrappern:
     .ampy-avdrag.ampy-avdrag--rot
     .ampy-avdrag.ampy-avdrag--gt-produkt
     .ampy-avdrag.ampy-avdrag--gt-generisk
     .ampy-avdrag.ampy-avdrag--hemforsakring
   ============================================================================ */
"""

os.makedirs(os.path.join(OUT, "02-fluentsnippets"), exist_ok=True)
css_ut = HUVUD + "\n/* globala at-regler: typsnitt + animationer */\n" + "\n".join(globala) + "\n"
for namn, klass, kropp in delar:
    css_ut += f"\n/* {'='*70}\n   VARIANT: {namn}  (.ampy-avdrag--{klass})\n   {'='*70} */\n" + kropp + "\n"

sokvag = os.path.join(OUT, "02-fluentsnippets", "ampy-avdrag.css")
open(sokvag, "w", encoding="utf-8").write(css_ut)

import gzip
gz = len(gzip.compress(css_ut.encode()))
print(f"ampy-avdrag.css: {len(css_ut):,} B  ({gz:,} B gzip)")
print(f"  globala at-regler: {len(globala)} (av {len(globala_alla)} före dedupe)")
print(f"  regler totalt: {css_ut.count('{')}")

markup = {klass: block_html(fil) for fil, klass, _ in VARIANTER}
json.dump(markup, open(os.path.join(SRC, "_markup.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in markup.items():
    print(f"  markup {k:<14} {len(v):>6} B")
