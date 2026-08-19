<?php
define('ABSPATH', '/tmp/');
$GLOBALS['__shortcodes'] = [];
$GLOBALS['__styles'] = [];
function add_action($h, $f, $p = 10, $a = 1) {}
function add_shortcode($tag, $fn) { $GLOBALS['__shortcodes'][$tag] = $fn; }
function shortcode_atts($pairs, $atts, $sc = '') { $atts = (array)$atts; $out = [];
  foreach ($pairs as $k => $d) { $out[$k] = array_key_exists($k, $atts) ? $atts[$k] : $d; } return $out; }
function esc_html($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function esc_attr($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function esc_url($s) { return $s; }
function content_url($p = '') { return 'https://ampy.se/wp-content/' . $p; }
function wp_register_style(...$a) { }
function wp_enqueue_style($h) { $GLOBALS['__styles'][] = $h; }

// PHP-filen hittas relativt DET HÄR skriptets plats: fungerar både i arbetsrepot
// (handover/) och i leveransen (05-underlag/byggskript/).
$kandidater = [
  __DIR__ . '/../../02-fluentsnippets/ampy-avdrag.php',                                        // leveransen
  getenv('HOME') . '/Desktop/Ampy Avdragsblock — Leverans Chris/02-fluentsnippets/ampy-avdrag.php', // arbetsrepot
];
$php = null;
foreach ($kandidater as $k) { if (file_exists($k)) { $php = $k; break; } }
if (!$php) { fwrite(STDERR, "hittar inte ampy-avdrag.php\n"); exit(1); }
require $php;

$fn = $GLOBALS['__shortcodes']['ampy_avdrag'];
$fall = [
  ['typ'=>'rot','h2'=>'Byta elcentral med','accent'=>'30 % ROT-avdrag','rad1'=>'Elcentral + installation'],
  ['typ'=>'gt-produkt','h2'=>'Subtech Go med','accent'=>'50 % Grön Teknik-avdrag','rad1'=>'Subtech~Go + installation','pris_fore'=>'10 000:-','pris_efter'=>'5 000:-'],
  ['typ'=>'gt-generisk','h2'=>'Laddbox i [Ort] med','accent'=>'50 % Grön Teknik-avdrag','rad1'=>'Laddbox + installation'],
  ['typ'=>'hemforsakring','h2'=>'Nyttja hemförsäkringen vid ett elfel och betala','accent'=>'endast självrisken','rad1'=>'Felsökning + reparation'],
];
foreach ($fall as $i => $a) {
  $h = $fn($a);
  file_put_contents("/tmp/php-out-{$a['typ']}.html", $h);
  printf("%-15s %6d B | wrapper:%s | uid:%s | h2:%s | rad1:%s\n", $a['typ'], strlen($h),
    (strpos($h, 'ampy-avdrag--'.$a['typ']) !== false ? 'OK' : 'SAKNAS'),
    (preg_match('/id="av-\d+-/', $h) ? 'OK' : 'SAKNAS'),
    // jämför mot det TRANSFORMERADE värdet — ~ blir &nbsp; i utdatan
    (strpos($h, ampy_avdrag_nbsp(esc_html($a['h2']))) !== false ? 'OK' : 'SAKNAS'),
    (strpos($h, ampy_avdrag_nbsp(esc_html($a['rad1']))) !== false ? 'OK' : 'SAKNAS'));
}
// felfall
printf("\nokänd typ  → %s\n", $fn(['typ'=>'trams','h2'=>'x','accent'=>'y','rad1'=>'z']) === '' ? 'renderar inget (rätt)' : 'FEL');
printf("gt utan pris→ %s\n", $fn(['typ'=>'gt-produkt','h2'=>'x','accent'=>'y','rad1'=>'z']) === '' ? 'renderar inget (rätt)' : 'FEL: platshållarpris skulle publiceras');
printf("tomt h2    → %s\n", $fn(['typ'=>'rot','h2'=>'','accent'=>'y','rad1'=>'z']) === '' ? 'renderar inget (rätt)' : 'FEL');
printf("kommentarer→ %s\n", array_sum(array_map(fn($t) => substr_count(file_get_contents("/tmp/php-out-$t.html"), '<!--'), ['rot','gt-produkt','gt-generisk','hemforsakring'])) === 0 ? 'noll i utdatan (rätt)' : 'LÄCKER');
printf("stilmall   → %s\n", count($GLOBALS['__styles']) > 0 ? 'köad ' . count($GLOBALS['__styles']) . '×' : 'EJ KÖAD');
