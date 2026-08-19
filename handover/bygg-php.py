#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger ampy-avdrag.php (FluentSnippets) ur den godkända markupen.

Principen: markupen är LÅST. Det enda som varierar per landningssida är de fält
blockmappningen (blockmappning.csv) pekar ut:
    h2_bas · h2_accent · kvitto_rad1 · sats · produkt · ort · belopp
Allt annat är identiskt inom varianten och får inte redigeras per sida.
"""
import json, os, re, html as htmlmod

SRC = "/Users/juliuscallahan/Desktop/Claude Code/rot-gt-cro/designs"
OUT = "/Users/juliuscallahan/Desktop/Ampy Avdragsblock — Leverans Chris/02-fluentsnippets"
markup = json.load(open(os.path.join(SRC, "_markup.json"), encoding="utf-8"))

def byt_innehall(h, oppen_regex, nytt, antal=1):
    """Byter ut ett elements HELA innehåll — fram till dess EGEN sluttagg.

    En lat regex (`.*?</span>`) stannar vid NÄRMASTE sluttagg. I
    `<span class="av-lbl"><span data-slot="tjanst">Elcentral</span> + installation</span>`
    är den närmaste `</span>` det inre spannets — resten (" + installation")
    blev kvar som en föräldralös textnod, alltså ett eget flex-item, och
    kvittoraden bröt till två rader (+31,5 px). Därför räknar vi djup i stället.
    """
    ut, pos, gjorda = [], 0, 0
    for m in re.finditer(oppen_regex, h):
        if gjorda >= antal or m.start() < pos:
            continue
        namn = m.group('tag')
        tagg = re.compile(r'</?(?:%s)\b[^>]*?(/?)>' % namn, re.I)
        djup, k, t = 1, m.end(), None
        while djup:
            t = tagg.search(h, k)
            if not t:
                raise ValueError('obalanserad <%s> i markupen' % namn)
            if t.group(0).startswith('</'):
                djup -= 1
            elif t.group(1) != '/':
                djup += 1
            k = t.end()
        ut += [h[pos:m.end()], nytt, t.group(0)]
        pos, gjorda = k, gjorda + 1
    ut.append(h[pos:])
    return ''.join(ut)


def strip_kommentarer(h):
    """Tar bort HTML-kommentarerna ur den publika utdatan.

    Designfilerna bär ägardirektiv, [GAP]-noteringar och intern motivering i
    kommentarer. De hör hemma i designfilen — inte i sidkällan på 278 publika
    sidor, där de mätte upp till 58 % av blockets HTML (gt-produkt: 13,6 kB av
    23,4 kB). Kommentarer renderar ingenting, så paritetsgrindarna ska vara
    oförändrat gröna efteråt; blir de inte det har något annat gått sönder.

    Markupen innehåller varken <script>, <style> eller villkorskommentarer
    (verifierat), så en rak strykning är säker här.
    """
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    # kommentaren lämnar en tom rad efter sig — städa bort den
    return re.sub(r'\n[ \t]*\n(?:[ \t]*\n)+', '\n\n', h)


def php_mall(klass, h):
    """Gör om den låsta markupen till en PHP-heredoc med platshållare."""
    h = strip_kommentarer(h)
    # variantklass på wrappern
    h = h.replace('<div class="ampy-avdrag"', f'<div class="ampy-avdrag ampy-avdrag--{klass}"', 1)
    # instansunikt id (AUDIT P0-6): id + aria-labelledby paras ihop
    h = re.sub(r'id="([a-z0-9-]+)"', r'id="{$uid}-\1"', h)
    h = re.sub(r'aria-labelledby="([a-z0-9-]+)"', r'aria-labelledby="{$uid}-\1"', h)
    # slots → PHP-variabler
    h = re.sub(r'(<h2[^>]*class="av-h2"[^>]*>).*?(<span class="av-accent">)(.*?)(</span>\s*</h2>)',
               lambda m: m.group(1) + '{$h2_bas} ' + m.group(2) + '{$h2_accent}' + m.group(4), h, flags=re.S)
    h = byt_innehall(h, r'<(?P<tag>span) class="av-lbl">', '{$rad1}')
    # escapa $ som inte är våra variabler
    return h

DOC = '''<?php
/**
 * Ampy — avdragsblocken (ROT · Grön Teknik · Hemförsäkring)
 * FluentSnippets: typ "PHP Content", kör överallt (Run everywhere).
 *
 * Registrerar shortcoden [ampy_avdrag] och köar stilmallen.
 * Stilmallen laddas ENDAST på sidor där shortcoden faktiskt renderas.
 *
 * ANVÄNDNING (attributen kommer ur blockmappning.csv):
 *   [ampy_avdrag typ="rot"
 *                h2="Byta elcentral med"
 *                accent="30 % ROT-avdrag"
 *                rad1="Elcentral + installation"]
 *
 *   [ampy_avdrag typ="gt-produkt" h2="Zaptec Pro med" accent="50 % Grön Teknik-avdrag"
 *                rad1="Zaptec Pro + installation" pris_fore="10 000:-" pris_efter="5 000:-"]
 *
 *   [ampy_avdrag typ="gt-generisk" h2="Laddbox i Täby med" accent="50 % Grön Teknik-avdrag"
 *                rad1="Laddbox + installation"]
 *
 *   [ampy_avdrag typ="hemforsakring" h2="Nyttja hemförsäkringen vid elfel i Täby och betala"
 *                accent="endast självrisken" rad1="Eljour + reparation"]
 *
 * CTA-mål sätts centralt nedan (AMPY_AVDRAG_CTA_URL) — inte per sida.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'AMPY_AVDRAG_VER', '1.0.0' );          // höj vid varje CSS-ändring (cache-bust)
define( 'AMPY_AVDRAG_CTA_URL', '/offert/' );   // [GRIND] bekräfta mål innan lansering
define( 'AMPY_AVDRAG_TEL', '+46102657979' );


/* -------------------------------------------------------------- typografi */
/**
 * Skyddar tal från radbrytning: "30 %" · "50 000 kr" · "5 000:-" hålls ihop.
 * Körs EFTER escaping, så redaktören kan skriva vanliga mellanslag och ändå
 * få typografiskt korrekt resultat. Skriv aldrig &nbsp; för hand i attributen.
 */
function ampy_avdrag_nbsp( $s ) {
    // 1. explicit markör: skriv ~ i attributet där ett hårt mellanslag krävs
    $s = str_replace( '~', '&nbsp;', $s );
    // 2. tal och enhet hålls alltid ihop: 30 % · 50 kr · 5 000:-
    $s = preg_replace( '/(\\d)\\s+(%|kr\\b|:-)/u', '$1&nbsp;$2', $s );
    // 3. tusentalsgrupper: 50 000 bryts aldrig
    $s = preg_replace( '/(\\d)\\s+(?=\\d{3}\\b)/u', '$1&nbsp;', $s );
    // 4. varumärkestermen delas aldrig över två rader
    $s = str_replace( 'Grön Teknik', 'Grön&nbsp;Teknik', $s );
    return $s;
}

/* ---------------------------------------------------------------- stilmall */
add_action( 'wp_enqueue_scripts', function () {
    wp_register_style(
        'ampy-avdrag',
        content_url( 'uploads/ampy/ampy-avdrag.css' ),   // ladda upp filen hit
        array(),
        AMPY_AVDRAG_VER
    );
} );

/* ---------------------------------------------------------------- shortcode */
add_shortcode( 'ampy_avdrag', function ( $atts ) {
    $a = shortcode_atts( array(
        'typ'        => 'rot',        // rot | gt-produkt | gt-generisk | hemforsakring
        'h2'         => '',
        'accent'     => '',
        'rad1'       => '',
        'pris_fore'  => '',           // endast gt-produkt
        'pris_efter' => '',           // endast gt-produkt
    ), $atts, 'ampy_avdrag' );

    $tillatna = array( 'rot', 'gt-produkt', 'gt-generisk', 'hemforsakring' );
    if ( ! in_array( $a['typ'], $tillatna, true ) ) {
        return '';                                  // okänd typ = rendera inget
    }
    if ( $a['h2'] === '' || $a['accent'] === '' || $a['rad1'] === '' ) {
        return '';                                  // ofullständig konfiguration = rendera inget
    }

    wp_enqueue_style( 'ampy-avdrag' );

    // instansunikt id-prefix (AUDIT P0-6: två block på samma sida delade id)
    static $rakn = 0;
    $rakn++;
    $uid = 'av-' . $rakn;

    $h2_bas    = ampy_avdrag_nbsp( esc_html( $a['h2'] ) );
    $h2_accent = ampy_avdrag_nbsp( esc_html( $a['accent'] ) );
    $rad1      = ampy_avdrag_nbsp( esc_html( $a['rad1'] ) );
    $cta_url   = esc_url( AMPY_AVDRAG_CTA_URL );
    $tel       = esc_attr( AMPY_AVDRAG_TEL );
    $pris_fore = ampy_avdrag_nbsp( esc_html( $a['pris_fore'] ) );
    $pris_efter= ampy_avdrag_nbsp( esc_html( $a['pris_efter'] ) );

    ob_start();
    switch ( $a['typ'] ) {
%%CASES%%
    }
    return ob_get_clean();
} );
'''

case_mall = '''        case '%s':
            ?>
%s
            <?php
            break;
'''

cases = []
for klass in ["rot", "gt-produkt", "gt-generisk", "hemforsakring"]:
    h = php_mall(klass, markup[klass])
    # PHP-echo av variabler
    h = h.replace("{$h2_bas}", "<?php echo $h2_bas; ?>")
    h = h.replace("{$h2_accent}", "<?php echo $h2_accent; ?>")
    h = h.replace("{$rad1}", "<?php echo $rad1; ?>")
    h = h.replace('{$uid}-', '<?php echo $uid; ?>-')
    h = re.sub(r'href="#"', 'href="<?php echo $cta_url; ?>"', h)
    h = h.replace('tel:+46102657979', 'tel:<?php echo $tel; ?>')
    if klass == "gt-produkt":
        h = h.replace("10&nbsp;000:-", "<?php echo $pris_fore ?: '10&nbsp;000:-'; ?>")
        h = h.replace("5&nbsp;000:-", "<?php echo $pris_efter ?: '5&nbsp;000:-'; ?>")
    h = "\n".join("            " + rad for rad in h.splitlines())
    cases.append(case_mall % (klass, h))

php = DOC.replace("%%CASES%%", "".join(cases))
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "ampy-avdrag.php"), "w", encoding="utf-8").write(php)
print(f"ampy-avdrag.php: {len(php):,} B")
print("  varianter:", ", ".join(markup.keys()))
