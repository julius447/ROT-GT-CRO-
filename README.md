# ROT + Grön Teknik — 1:1 kloner (basen för CRO-arbetet)

Pixeltrogna kloner av de två processblocken ("Sänk kostnaden … genom X% avdrag")
som ligger på alla 22 tjänstesidor + de programmatiska sidorna på ampy.se.
Detta repo är **baslinjen**: originalet, återskapat i en fristående miljö,
så att allt kommande redesign-arbete har en exakt referens att mätas emot.

## Preview

| Sida | Innehåll |
|---|---|
| `index.html` | Startsida med länkar till båda blocken |
| `rot.html` | ROT-blocket — klonat från live `/elservice/elcentral/` |
| `gron-teknik.html` | Grön Teknik-blocket — klonat från live `/batterilagring/` |

Testa både desktop och mobil (≤767 px byter layouten till vertikala rader med
mobilikonerna och vertikala connector-linjer).

## Hur klonen är byggd (provenance)

Inget är återskapat "på känn" — varje lager är hämtat från produktionssajten 2026-08-14:

- **Markup**: den faktiska server-renderade Bricks-HTML:en för respektive sektion,
  extraherad ur live-sidorna (sparade i `source/live-source-*.html`).
- **CSS**: sajtens riktiga kaskad, bytekopierad: `global-variables` (ap*-variablerna),
  `theme-style-ampy`, Bricks `frontend`, FluentSnippet `site-css`, sid-specifika
  `post-15042/15096/15498/15545` (element-CSS för blocken) samt **alla inline
  `<style>`-block** från respektive live-sida (globala klasser, ampy-cc-vars m.m.).
- **Skript**: sajtens två block-relevanta skript, kopierade ordagrant:
  - `js/connector-lines.js` — ritar de streckade gradient-linjerna mellan processikonerna
    (de finns INTE i Bricks-JSON:en; de injiceras av detta sajt-skript).
  - `js/heading-highlight.js` — läser `data-highlight="last-3"` på ROT-rubriken och
    flyttar gradienten till de sista 3 orden (basen blir mörk). Utan detta skript blir
    hela ROT-rubriken teal — det är så Bricks-CSS:en faktiskt ser ut.
- **Ikoner/typsnitt**: de riktiga SVG-filerna + Outfit variable-font, self-hostade i `assets/`.
- **Bricks-JSON**: originalexporterna ligger orörda i `source/*.bricks.json`.

## Kända avvikelser (finns på live också — inte klon-fel)

1. `Vector-2-2.svg` (Grön Teknik-kortets bakgrundsvåg) **404:ar på live** →
   GT-kortet renderas utan bakgrundsbild både live och här.
2. `Icon-3.svg` (ROT-knappens pil-ikon i Bricks-JSON) **404:ar på live** →
   ROT-knappen renderas utan ikon både live och här (GT-knappen har sin pil, inline-SVG).
3. FadeIn-interaktionen (enterView) körs av Bricks JS på live; klonen visar blockets
   slutläge statiskt.

## Struktur

```
index.html            – startsida
rot.html              – ROT-klonen
gron-teknik.html      – Grön Teknik-klonen
assets/               – SVG-ikoner + Outfit (self-hostade)
css/                  – sajtens CSS, bytekopierad (font-/ikon-URL:er lokaliserade)
js/                   – connector-lines.js + heading-highlight.js (sajtens egna)
source/               – Bricks-JSON-original + live-HTML-källorna + extraherade sektioner
```
