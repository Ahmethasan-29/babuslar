#!/bin/sh
# Company of Heroes oyun klasörünün sayfalarını (index, birlikler, komutanlar, haritalar) ortak şablondan yazar.
# Kullanım: sh scripts/coh-pages.sh <klasör> "<oyun adı>" "<komutanlar menü adı>" "<kaynak notu>" [birlikler] [haritalar]
dir=$1; name=$2; cmd=$3; source=$4; units=${5:-1}; maps=${6:-1}

nav() {
  printf '        <a href="../">Ana sayfa</a>\n        <a href="./"%s>%s</a>\n' "$( [ "$1" = index ] && echo ' aria-current="page"')" "$name"
  [ "$units" = 1 ] && printf '        <a href="birlikler.html"%s>Birlikler</a>\n' "$( [ "$1" = birlikler ] && echo ' aria-current="page"')"
  printf '        <a href="komutanlar.html"%s>%s</a>\n' "$( [ "$1" = komutanlar ] && echo ' aria-current="page"')" "$cmd"
  [ "$maps" = 1 ] && printf '        <a href="haritalar.html"%s>Haritalar</a>\n' "$( [ "$1" = haritalar ] && echo ' aria-current="page"')"
}

page() { # $1 sayfa, $2 başlık, $3 ana içerik, $4 betik
  cat > "$dir/$1.html" <<HTML
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$2</title>
  <meta name="description" content="$name: birlikler, komutanlar ve haritalar.">
  <link rel="stylesheet" href="../assets/style.css">
  <script src="../assets/i18n.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="../"><span>Babuşlar</span></a>
      <nav class="nav" aria-label="Ana menü">
$(nav "$1")
      </nav>
    </div>
  </header>

  <main>
    <div class="container">
$3
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>Babuşlar, Relic Entertainment ve SEGA ile bağlantılı değildir. $name ve görselleri sahiplerine aittir.</p>
      <p>$source</p>
    </div>
  </footer>
  <script src="../assets/common.js"></script>
  <script src="data.js"></script>
  <script src="../coh/tr.js"></script>
  <script src="../coh/$4.js"></script>
</body>
</html>
HTML
}

toolbar() { # $1 arama yazısı, $2 düğme grubu id, $3 düğme grubu adı, [$4 ikinci grup id, $5 adı]
  printf '      <div class="toolbar">\n        <input class="search" id="search" type="search" placeholder="%s" aria-label="%s" autocomplete="off">\n        <div class="chips" id="%s" role="group" aria-label="%s"></div>\n' "$1" "$1" "$2" "$3"
  [ -n "$4" ] && printf '        <div class="chips" id="%s" role="group" aria-label="%s"></div>\n' "$4" "$5"
  printf '        <p class="count" id="count" aria-live="polite"></p>\n      </div>\n      <div class="bf-grid" id="list"></div>'
}

page index "$name · Babuşlar" "      <h1 class=\"page-title\">$name</h1>
      <div class=\"chips coh-factions\" id=\"factions\" aria-label=\"Fraksiyonlar\"></div>
      <div class=\"games\" id=\"cards\"></div>" home
[ "$units" = 1 ] && page birlikler "Birlikler · $name · Babuşlar" "      <h1 class=\"page-title\">Birlikler</h1>
$(toolbar "Birlik ara…" factions Fraksiyon cats "Birlik türü")" birlikler
page komutanlar "$cmd · $name · Babuşlar" "      <h1 class=\"page-title\">$cmd</h1>
$(toolbar "Ara…" factions Fraksiyon)" komutanlar
[ "$maps" = 1 ] && page haritalar "Haritalar · $name · Babuşlar" "      <h1 class=\"page-title\">Haritalar</h1>
$(toolbar "Harita ara…" sizes "Oyuncu sayısı")" haritalar
echo "$dir: sayfalar yazıldı"
