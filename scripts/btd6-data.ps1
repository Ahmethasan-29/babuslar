# Bloons TD 6 verisi: kuleler, yükseltmeler (3 yol × 5 seviye), kahramanlar ve haritalar → btd6/ klasörü.
#   powershell -ExecutionPolicy Bypass -File scripts/btd6-data.ps1
# Kule/kahraman listesi ve fiyatlar (Orta zorluk): hemisemidemipresent/cyberquincy (jsons/costs.json, tower_pages.json, heroes.json,
# aliases/). Oyun içi açıklamalar, değerler ve görseller: Bloons Wiki (bloons.fandom.com, CC BY-SA). Metinler İngilizcedir.
. "$PSScriptRoot\rehber-lib.ps1"

$API = 'https://bloons.fandom.com/api.php'
$CQ = 'https://raw.githubusercontent.com/hemisemidemipresent/cyberquincy/master'
function Get-CQ([string]$path) { (Get-WikiText "$CQ/$path") | ConvertFrom-Json }

Write-Host "Kule listesi ve fiyatlar indiriliyor…"
$costs = Get-CQ 'jsons/costs.json'
$pagesJson = Get-CQ 'jsons/tower_pages.json'
$heroCosts = Get-CQ 'jsons/heroes.json'
$tree = (Get-WikiText 'https://api.github.com/repos/hemisemidemipresent/cyberquincy/git/trees/master?recursive=1') | ConvertFrom-Json
$classOf = @{}
foreach ($t in $tree.tree) { if ($t.path -match '^aliases/towers/(\w+)/(\w+)\.json$') { $classOf[$Matches[2]] = $Matches[1] } }

$CLASSES = [ordered]@{
  primary = @('Birincil', 'Primary', '#e5533d')
  military = @('Askerî', 'Military', '#77c043')
  magic = @('Büyü', 'Magic', '#c158d6')
  support = @('Destek', 'Support', '#e6c13c')
}
$PATHS = [ordered]@{ top_path = @('1. yol (üst)', 'Path 1 (top)'); middle_path = @('2. yol (orta)', 'Path 2 (middle)'); bottom_path = @('3. yol (alt)', 'Path 3 (bottom)') }

# Sayfalar: kule sayfaları + tüm yükseltme sayfaları
$towerKeys = @($costs.PSObject.Properties.Name | Where-Object { $pagesJson.$_.pageName })
$titles = foreach ($k in $towerKeys) {
  ($pagesJson.$k.pageName -replace '_', ' ')
  foreach ($p in $PATHS.Keys) { foreach ($tier in 1..5) { $pagesJson.$k.upgrades.$p."$tier" } }
}
Write-Host "Wiki sayfaları indiriliyor ($(@($titles).Count))…"
$pages = Get-WikiPages $API $titles

# {{Quote|Oyun içi açıklama|In-game description}} → açıklama
function Get-Quote([string]$text) {
  if ($text -match '\{\{Quote\|([^|}]+)\|[^}]*[Ii]n-?game') { return (Clean-WikiText $Matches[1]) }
  return $null
}
function Clean-Param([string]$v) {
  if (-not $v) { return $null }
  $v = $v -replace '\{\{#[Ii]nvoke:[^}]*\}\}', '' -replace '\{\{[^{}|]*\|?([^{}]*)\}\}', '$1' -replace '\{\{[^{}]*\}\}', ''
  $v = Clean-WikiText ($v -replace "''For specific.*$", '')
  if ($v -match '^(N/A|)$') { return $null }
  $v
}
$money = { param($n) '$' + ('{0:N0}' -f [int]$n).Replace(',', '.') }

$files = New-Object System.Collections.ArrayList
$towerList = foreach ($k in $towerKeys) {
  $page = $pagesJson.$k.pageName -replace '_', ' '
  $text = $pages[$page]
  if (-not $text) { Write-Host "  sayfa yok: $page"; continue }
  $ib = Get-InfoboxParams $text 'Infobox Tower'
  $name = $page -replace ' \(BTD6\)$', ''
  $lists = foreach ($p in $PATHS.Keys) {
    $lines = foreach ($tier in 1..5) {
      $up = $pagesJson.$k.upgrades.$p."$tier"
      $cost = $costs.$k.upgrades.$p."$tier"
      $q = if ($pages[$up]) { Get-Quote $pages[$up] } else { $null }
      "[[k|$tier]] $($up -replace ' \(BTD6\)$', '') [[d|$(& $money $cost)]]" + $(if ($q) { ": $q" } else { '' })
    }
    [ordered]@{ title = $PATHS[$p]; items = @($lines) }
  }
  # Bir yolun tamamı (5 yükseltme) ne kadar tutar
  $full = foreach ($p in $PATHS.Keys) { $sum = 0; foreach ($tier in 1..5) { $sum += [int]$costs.$k.upgrades.$p."$tier" }; $sum }
  $stats = @(, @(@('Fiyat', 'Cost'), (& $money $costs.$k.cost)))
  foreach ($f in @(@('damage', 'Hasar', 'Damage'), @('pierce', 'Delme', 'Pierce'), @('attackspeed', 'Saldırı hızı', 'Attack speed'), @('range', 'Menzil', 'Range'), @('camo', 'Kamuflaj', 'Camo'))) {
    $v = Clean-Param $ib[$f[0]]
    if ($v) { $stats += , @(@($f[1], $f[2]), $v) }
  }
  $stats += , @(@('5. seviyeye kadar', 'Full path cost'), (($full | ForEach-Object { & $money $_ }) -join ' / '))
  $img = ImageName $ib['image'] "000-$($name -creplace ' ', '').png"
  [void]$files.Add($img)
  [ordered]@{ id = Slug $name; name = $name; file = $img; group = $classOf[$k]; quote = Get-Quote $text; stats = $stats; lists = @($lists) }
}

# --- Kahramanlar
$HERO_PAGES = @{ brickell = 'Admiral Brickell'; churchill = 'Captain Churchill'; gwen = 'Gwendolin'; jones = 'Striker Jones'; obyn = 'Obyn Greenfoot'; pat = 'Pat Fusty'; psi = 'Psi' }
$heroKeys = @($heroCosts.PSObject.Properties.Name)
$heroTitle = @{}
foreach ($h in $heroKeys) { $n = if ($HERO_PAGES[$h]) { $HERO_PAGES[$h] } else { (Get-Culture).TextInfo.ToTitleCase($h) }; $heroTitle[$h] = "$n (BTD6)" }
$heroPages = Get-WikiPages $API @($heroTitle.Values)
$heroList = foreach ($h in $heroKeys) {
  $text = $heroPages[$heroTitle[$h]]
  if (-not $text) { Write-Host "  kahraman sayfası yok: $($heroTitle[$h])"; continue }
  $ib = Get-InfoboxParams $text 'Infobox Hero'
  $name = $heroTitle[$h] -replace ' \(BTD6\)$', ''
  $stats = @(, @(@('Fiyat', 'Cost'), (& $money $heroCosts.$h.cost)))
  foreach ($f in @(@('damage', 'Hasar', 'Damage'), @('pierce', 'Delme', 'Pierce'), @('attackspeed', 'Saldırı hızı', 'Attack speed'), @('range', 'Menzil', 'Range'))) {
    $v = Clean-Param $ib[$f[0]]
    if ($v) { $stats += , @(@($f[1], $f[2]), $v) }
  }
  $img = ImageName $ib["image"] "$name.png"
  [void]$files.Add($img)
  [ordered]@{ id = Slug $name; name = $name; file = $img; quote = Get-Quote $text; stats = $stats }
}

# --- Haritalar (zorluğa göre)
$DIFF = [ordered]@{
  beginner = @('Başlangıç', 'Beginner', '#77c043')
  intermediate = @('Orta', 'Intermediate', '#e6c13c')
  advanced = @('İleri', 'Advanced', '#f5a623')
  expert = @('Uzman', 'Expert', '#e5533d')
}
$MAP_NAMES = @{ kartsndarts = 'Karts N Darts'; '#ouch' = '#Ouch'; x_factor = 'X Factor'; in_the_loop = 'In The Loop'; bloonarius_prime = 'Bloonarius Prime' }
$small = @('of', 'the', 'and', 'n')
$mapEntries = foreach ($d in $DIFF.Keys) {
  $j = Get-CQ "aliases/maps/$d-maps.json"
  foreach ($key in $j.PSObject.Properties.Name) {
    $name = if ($MAP_NAMES[$key]) { $MAP_NAMES[$key] } else {
      $w = $key -split '_'
      ((0..($w.Count - 1)) | ForEach-Object { if ($_ -gt 0 -and $small -contains $w[$_]) { $w[$_] } else { $w[$_].Substring(0, 1).ToUpperInvariant() + $w[$_].Substring(1) } }) -join ' '
    }
    [pscustomobject]@{ key = $key; name = $name; diff = $d }
  }
}
# Sayfa adı bazen "(BTD6)" ekli ya da boşluksuzdur; önce "(BTD6)"lı sayfa denenir (çok oyunlu sayfalar BTD5 resmini gösterir).
$noSpace = { param($n) $n -creplace '[^A-Za-z0-9]', '' }
$mapPages = Get-WikiPages $API @($mapEntries | ForEach-Object { $_.name; "$($_.name) (BTD6)"; (& $noSpace $_.name) })
$mapList = foreach ($m in $mapEntries) {
  $text = @("$($m.name) (BTD6)", $m.name, (& $noSpace $m.name) | ForEach-Object { $mapPages[$_] } | Where-Object { $_ -match 'Infobox[ _]Track' })[0]
  $ib = if ($text) { Get-InfoboxParams $text 'Infobox Track' } else { @{} }
  $img = ImageName $ib["image"] "$(& $noSpace $m.name)_No_UI.png"
  [void]$files.Add($img)
  [ordered]@{ id = Slug $m.name; name = $m.name; file = $img; group = $m.diff; desc = $(if ($text) { Get-Quote $text }) }
}

Write-Host "Resim adresleri alınıyor ($($files.Count))…"
$urls = Get-WikiImageUrls $API @($files)
$all = @($towerList) + @($heroList) + @($mapList)
$missing = @()
foreach ($x in $all) {
  $u = if ($x.file) { $urls[$x.file] }
  if ($u) { $x.image = Thumb $u $(if ($mapList -contains $x) { 480 } else { 160 }) } else { $missing += $x.name }
  $x.Remove('file')
}
Write-Host "Resmi bulunamayan ($($missing.Count)): $($missing -join ', ')"

$data = [ordered]@{
  game = 'Bloons TD 6'
  intro = @(
    'Balonları (bloon) yoldan geçmeden patlatan maymun kuleleri kur. Her kulenin 3 yükseltme yolu var: bir kulede yalnızca iki yol yükseltilebilir ve bunlardan yalnızca biri 3. seviyenin üstüne çıkabilir.',
    'Place monkey towers to pop bloons before they get through. Every tower has 3 upgrade paths: you can upgrade two of them, and only one can go past tier 2.'
  )
  sections = @(
    [ordered]@{ id = 'kuleler'; title = @('Kuleler ve yükseltmeler', 'Towers and upgrades'); noun = @('kule', 'towers'); badge = @('3 yol × 5 seviye · Fiyatlar', '3 paths × 5 tiers · Costs'); text = @('{n} kule: tüm yükseltmelerin adı, fiyatı (Orta zorluk) ve oyun içi açıklaması.', '{n} towers: every upgrade with its cost (Medium) and in-game description.'); image = 'portrait'; groups = (Groups $CLASSES); items = @($towerList | Sort-Object { @($CLASSES.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'kahramanlar'; title = @('Kahramanlar', 'Heroes'); noun = @('kahraman', 'heroes'); badge = @('Fiyat · Değerler', 'Cost · Stats'); text = @('{n} kahraman: fiyatı ve temel değerleri.', '{n} heroes with cost and base stats.'); image = 'portrait'; items = @($heroList | Sort-Object { $_.name }) }
    [ordered]@{ id = 'haritalar'; title = @('Haritalar', 'Maps'); noun = @('harita', 'maps'); badge = @('Başlangıç · Orta · İleri · Uzman', 'Beginner · Intermediate · Advanced · Expert'); text = @('{n} harita, zorluk sırasıyla.', '{n} maps by difficulty.'); image = 'wide'; groups = (Groups $DIFF); items = @($mapList) }
  )
  guide = @(
    [ordered]@{ title = @('Yükseltme kuralı', 'The upgrade rule'); text = @('Bir kulede en fazla iki yol yükseltilir; biri 5. seviyeye kadar, diğeri en fazla 2. seviyeye kadar çıkar (ör. 0-2-5 ya da 4-0-2). Kartlardaki listeler her yolun 5 seviyesini fiyatıyla gösterir.', 'A tower can use at most two paths: one up to tier 5 and the other up to tier 2 (e.g. 0-2-5 or 4-0-2). The lists on each card show all 5 tiers with costs.') }
    [ordered]@{ title = @('Kamuflaj ve kurşun', 'Camo and lead'); text = @('Kamuflaj (camo) balonları her kule göremez: kartlarda "Kamuflaj" satırı hangi yükseltmeyle görebildiğini yazar. Kurşun (lead) balonlar keskin (sharp) hasardan etkilenmez; bomba, büyü ya da ateş gerekir.', 'Not every tower can see camo bloons: the "Camo" line tells which upgrade grants it. Lead bloons ignore sharp damage; use explosions, magic or fire.') }
    [ordered]@{ title = @('Ekonomi', 'Economy'); text = @('Erken turlarda Banana Farm ya da Benjamin gibi para kazandıran seçenekler ileride çok daha güçlü kuleler almanı sağlar. Fiyatlar Orta zorluktadır; Kolay %15 daha ucuz, Zor %8 ve Impoppable %20 daha pahalıdır.', 'Early income (Banana Farm, Benjamin) pays for much stronger towers later. Costs are for Medium; Easy is 15% cheaper, Hard 8% and Impoppable 20% more expensive.') }
    [ordered]@{ title = @('MOAB sınıfı balonlar', 'MOAB-class bloons'); text = @('MOAB, BFB, ZOMG, DDT ve BAD çok canlıdır ve patlayınca içinden yeni balonlar çıkar. Bunlara karşı "MOAB hasarı" veren yükseltmeler (ör. Dartling Gunner, Bomb Shooter''ın MOAB yolu) şarttır.', 'MOAB, BFB, ZOMG, DDT and BAD have lots of health and release more bloons when popped. Upgrades that deal bonus MOAB damage are a must.') }
  )
  footer = @(
    , @('Babuşlar, Ninja Kiwi ile bağlantılı değildir. Bloons TD 6 ve görselleri Ninja Kiwi''ye aittir.', 'Babuşlar is not affiliated with Ninja Kiwi. Bloons TD 6 and its images belong to Ninja Kiwi.')
    , @('Fiyatlar cyberquincy projesinden (GitHub), açıklamalar ve görseller Bloons Wiki''den (bloons.fandom.com, CC BY-SA) alınır. Kule ve yükseltme adları İngilizcedir.', 'Costs come from the cyberquincy project (GitHub); descriptions and images from the Bloons Wiki (bloons.fandom.com, CC BY-SA).')
  )
}
Write-Rehber -Dir 'btd6' -Data $data -Source 'scripts/btd6-data.ps1'
