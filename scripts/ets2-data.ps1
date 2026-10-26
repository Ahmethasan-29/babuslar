# Euro Truck Simulator 2 verisi: Truck Simulator Wiki (truck-simulator.fandom.com, CC BY-SA) → ets2/ klasörü.
#   powershell -ExecutionPolicy Bypass -File scripts/ets2-data.ps1
# Tırlar (kabin, şasi, motor, şanzıman fiyatları ve açılma seviyeleri), bayiler, garaj kurulabilen şehirler ve DLC'ler.
. "$PSScriptRoot\rehber-lib.ps1"
. "$PSScriptRoot\wikitable-lib.ps1"

$API = 'https://truck-simulator.fandom.com/api.php'
Write-Host "Wiki sayfaları indiriliyor…"
$main = Get-WikiPages $API @('Euro Truck Simulator 2 Trucks', 'Euro Truck Simulator 2 Truck Dealers', 'Garage', 'Downloadable Content')

# Tır listesi: "Models" tablosundaki kalın bağlantılar ('''[[Sayfa|Ad]]''' ya da [[Sayfa|'''Ad''']])
$models = $main['Euro Truck Simulator 2 Trucks']
$models = $models.Substring($models.IndexOf('== Models'))
$models = $models.Substring(0, $models.IndexOf('|}'))
$truckPages = [ordered]@{}
foreach ($m in [regex]::Matches($models, "'''\[\[([^\]|]+)(?:\|([^\]]+))?\]\]'''|\[\[([^\]|]+)\|'''([^']+)'''\]\]")) {
  $page = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[3].Value }
  $label = if ($m.Groups[2].Success) { $m.Groups[2].Value } elseif ($m.Groups[4].Success) { $m.Groups[4].Value } else { $page }
  if (-not $truckPages.Contains($page)) { $truckPages[$page] = $label }
}
Write-Host "Tır sayfaları indiriliyor ($($truckPages.Count))…"
$tp = Get-WikiPages $API @($truckPages.Keys)

$BRANDS = [ordered]@{
  DAF = @('DAF', 'DAF', '#e5533d')
  Iveco = @('Iveco', 'Iveco', '#4fa3e0')
  MAN = @('MAN', 'MAN', '#9aa0a6')
  'Mercedes-Benz' = @('Mercedes-Benz', 'Mercedes-Benz', '#c0c0c0')
  Renault = @('Renault Trucks', 'Renault Trucks', '#e6c13c')
  Scania = @('Scania', 'Scania', '#c158d6')
  Volvo = @('Volvo', 'Volvo', '#77c043')
}
function Brand-Of([string]$name) { foreach ($b in $BRANDS.Keys) { if ($name -like "$b*") { return $b } }; $null }
function Price([string]$t) { if ($t -match '(\d{1,3}(?:[.,]\d{3})+|\d+)') { [int]($Matches[1] -replace '[.,]', '') } else { $null } }
$euro = { param($n) '€' + ('{0:N0}' -f $n).Replace(',', '.') }

$files = New-Object System.Collections.ArrayList
$truckList = foreach ($page in $truckPages.Keys) {
  $text = $tp[$page]
  if (-not $text) { Write-Host "  sayfa yok: $page"; continue }
  $ib = Get-InfoboxParams $text 'Infobox Truck'
  $name = $truckPages[$page] -replace "'", ''
  $img = ImageName $ib['image1'] "$page.png"
  [void]$files.Add($img)
  $stats = @()
  if ($ib['engine']) { $stats += , @(@('Motor gücü', 'Engine power'), (Clean-WikiText $ib['engine'])) }
  if ($ib['date_added']) { $en = Clean-WikiText ($ib['date_added'] -replace '<sup>.*?</sup>', ''); $stats += , @(@('Oyuna geldiği tarih', 'Added'), (Bi (TrDate $en) $en)) }
  # Yükseltme tabloları: Cabin / Chassis / Engine / Transmission (ad, fiyat, açılma seviyesi)
  $lists = @(); $min = 0; $complete = $true
  $tables = Get-WikiTables $text
  foreach ($part in @(@('Cabin', 'Kabinler', 'Cabins'), @('Chassis', 'Şasiler', 'Chassis'), @('Engine', 'Motorlar', 'Engines'), @('Transmission', 'Şanzımanlar', 'Transmissions'))) {
    $t = $tables | Where-Object { $_.section -match "^$($part[0])" -and $_.columns -contains 'Price' } | Select-Object -First 1
    if (-not $t) { $complete = $false; continue }
    $pi = [Array]::IndexOf($t.columns, 'Price'); $li = [Array]::IndexOf($t.columns, 'Unlock Level')
    $rows = @($t.rows | Where-Object { Price $_[$pi] })
    if (-not $rows.Count) { $complete = $false; continue }
    $min += (($rows | ForEach-Object { Price $_[$pi] }) | Measure-Object -Minimum).Minimum
    $lines = $rows | ForEach-Object {
      $lvl = if ($li -ge 0) { Clean-WikiText $_[$li] } else { '' }
      $base = "$(Clean-WikiText $_[0]) [[d|$(& $euro (Price $_[$pi]))]]"
      if ($lvl -match '^\d+$' -and $lvl -ne '0') { Bi "$base [[s|(sv. $lvl)]]" "$base [[s|(lvl $lvl)]]" } else { $base }
    }
    $lists += [ordered]@{ title = @($part[1], $part[2]); items = @($lines) }
  }
  if ($complete -and $min) { $stats = @(, @(@('En ucuz yapılandırma', 'Cheapest build'), (& $euro $min))) + $stats }
  [ordered]@{ id = Slug $name; name = $name; file = $img; group = (Brand-Of $name); stats = $stats; lists = $lists; price = $(if ($complete) { $min } else { 99999999 }) }
}

# --- Bayiler (marka marka)
# Tablolar marka başlıklarının altında; sütunlar: Ülke | Şehir | Boyut | Şart. Ülke hücresi birkaç satıra yayılabildiği için
# satır yayılmasını bilen Get-TableRows kullanılır.
$dealerList = foreach ($t in (Split-WikiTables $main['Euro Truck Simulator 2 Truck Dealers'])) {
  $brandName = Clean-WikiText $t.heading
  $b = Brand-Of ($brandName -replace 'Volvo Trucks', 'Volvo' -replace 'Renault Trucks', 'Renault')
  if (-not $b) { continue }
  $ki = 0; $ci = 1; $si = 2; $ri = 3
  # Hücrelerdeki dipnotlar (<ref>…</ref>) ve bayrak şablonları ({{Estonian}}) atılır; boyut iki dilli yazılır.
  $cellText = { param($c) Clean-WikiText (($c -replace '(?s)<ref[^>]*>.*?</ref>', '' -replace '<ref[^>]*/>', '') -replace '\{\{[^{}]*\}\}', '') }
  $SIZE_NAMES = @{ Small = @('Küçük', 'Small'); Large = @('Büyük', 'Large'); Medium = @('Orta', 'Medium') }
  $lines = Get-TableRows $t.text | Where-Object { $_.Count -ge 3 } | ForEach-Object {
    $req = & $cellText $_[$ri]
    $base = "$(& $cellText $_[$ci]), $(& $cellText $_[$ki])"
    $size = & $cellText $_[$si]
    $tail = $(if ($req -and $req -ne '-') { " [[k|$req]]" } else { '' })
    if ($SIZE_NAMES[$size]) { Bi "$base [[s|($($SIZE_NAMES[$size][0]))]]$tail" "$base [[s|($($SIZE_NAMES[$size][1]))]]$tail" }
    else { "$base$(if ($size -and $size -ne '-') { " [[s|($size)]]" })$tail" }
  }
  [ordered]@{ id = "bayi-$(Slug $b)"; name = $BRANDS[$b][0]; group = $b; stats = @(, @(@('Bayi sayısı', 'Dealers'), "$(@($lines).Count)")); lists = @([ordered]@{ title = @('Şehirler', 'Cities'); items = @($lines) }) }
}

# --- Garaj kurulabilen şehirler (ülke ülke)
$g = (Get-WikiTables $main['Garage']) | Where-Object { $_.section -eq 'Euro Truck Simulator 2' } | Select-Object -First 1
$byCountry = [ordered]@{}
foreach ($r in $g.rows) {
  $country = Clean-WikiText ($r[1] -replace '\{\{[^}]*\}\}', '')
  if (-not $byCountry.Contains($country)) { $byCountry[$country] = New-Object System.Collections.ArrayList }
  $dlc = Clean-WikiText $r[2]
  [void]$byCountry[$country].Add("$(Clean-WikiText $r[0])" + $(if ($dlc -and $dlc -notmatch '^(Base game|-|)$') { " [[s|($dlc)]]" } else { '' }))
}
$garageList = foreach ($c in ($byCountry.Keys | Sort-Object)) {
  [ordered]@{ id = "garaj-$(Slug $c)"; name = $c; stats = @(, @(@('Garaj kurulabilen şehir', 'Garage cities'), "$($byCountry[$c].Count)")); lists = @([ordered]@{ title = @('Şehirler', 'Cities'); items = @($byCountry[$c]) }) }
}

# --- DLC'ler (kategoriye göre)
$d = (Get-WikiTables $main['Downloadable Content']) | Where-Object { $_.section -match 'Euro Truck Simulator 2' } | Select-Object -First 1
$DLC = [ordered]@{
  'Map expansion' = @('Harita genişlemesi', 'Map expansion', '#77c043')
  'Cargo pack' = @('Yük paketi', 'Cargo pack', '#e6c13c')
  'Truck' = @('Tır', 'Truck', '#4fa3e0')
  'Trailer' = @('Dorse', 'Trailer', '#f5a623')
  'Paint jobs' = @('Boya', 'Paint jobs', '#c158d6')
  'Tuning pack' = @('Modifiye', 'Tuning pack', '#e5533d')
  'Other' = @('Diğer', 'Other', '#9aa0a6')
}
$col = { param($n) [Array]::IndexOf($d.columns, $n) }
$dlcList = foreach ($r in $d.rows) {
  $name = Clean-WikiText $r[(& $col 'Name')]
  $cat = Clean-WikiText $r[(& $col 'Category')]
  $grp = @($DLC.Keys | Where-Object { $cat -like "$_*" })[0]
  if (-not $grp) { $grp = 'Other' }
  [ordered]@{
    id = "dlc-$(Slug $name)"; name = ($name -replace '^Euro Truck Simulator 2: ', ''); group = $grp; sub = $cat
    desc = Clean-WikiText $r[(& $col 'Contents')]
    stats = @(, @(@('Fiyat', 'Price'), (Clean-WikiText $r[(& $col 'Price (EUR)')])), , @(@('Çıkış', 'Released'), (& { $rd = Clean-WikiText $r[(& $col 'Release Date')]; Bi (TrDate $rd) $rd })))
  }
}

Write-Host "Resim adresleri alınıyor ($($files.Count))…"
$urls = Get-WikiImageUrls $API @($files)
$missing = @()
foreach ($x in $truckList) {
  $u = if ($x.file) { $urls[$x.file] }
  if ($u) { $x.image = Thumb $u 480 } else { $missing += $x.name }
  $x.Remove('file')
}
Write-Host "Resmi bulunamayan ($($missing.Count)): $($missing -join ', ')"
$truckSorted = @($truckList | Sort-Object { @($BRANDS.Keys).IndexOf($_.group) }, { $_.price })
foreach ($x in $truckSorted) { $x.Remove('price') }

$data = [ordered]@{
  game = 'Euro Truck Simulator 2'
  intro = @(
    'Avrupa''da tır şoförlüğü: yük taşı, para kazan, kendi tırını ve garajını al, şoför tutup şirketini büyüt. Fiyatlar oyundaki bayi fiyatlarıdır (€); "sv." parçanın açıldığı seviyedir.',
    'Drive trucks across Europe: haul cargo, earn money, buy your own trucks and garages, hire drivers and grow your company. Prices are in-game dealer prices (€); "lvl" is the level a part unlocks at.'
  )
  sections = @(
    [ordered]@{ id = 'tirlar'; title = @('Tırlar ve fiyatlar', 'Trucks and prices'); noun = @('tır', 'trucks'); badge = @('Kabin · Şasi · Motor · Şanzıman', 'Cabin · Chassis · Engine · Gearbox'); text = @('{n} tır: her parçanın fiyatı ve açılma seviyesi, en ucuz yapılandırmayla.', '{n} trucks: every part''s price and unlock level, plus the cheapest build.'); image = 'wide'; groups = (Groups $BRANDS); items = $truckSorted }
    [ordered]@{ id = 'bayiler'; title = @('Bayiler', 'Truck dealers'); noun = @('marka', 'brands'); badge = @('Marka · Şehir', 'Brand · City'); text = @('Her markanın bayisi hangi şehirlerde var.', 'Which cities have each brand''s dealer.'); image = 'icon'; groups = (Groups $BRANDS); items = @($dealerList) }
    [ordered]@{ id = 'garajlar'; title = @('Garajlar', 'Garages'); noun = @('ülke', 'countries'); badge = @('Ülke · Şehir', 'Country · City'); text = @('Garaj alınabilen şehirler, ülke ülke. Bir garaj €180.000.', 'Cities where you can buy a garage, by country. A garage costs €180,000.'); image = 'icon'; items = @($garageList) }
    [ordered]@{ id = 'dlc'; title = @('DLC''ler', 'DLCs'); noun = @('DLC', 'DLCs'); badge = @('Harita · Yük · Tır · Fiyat', 'Map · Cargo · Truck · Price'); text = @('{n} DLC: harita genişlemeleri, yük paketleri ve diğerleri, fiyat ve çıkış tarihiyle.', '{n} DLCs with price and release date.'); image = 'icon'; groups = (Groups $DLC); items = @($dlcList) }
  )
  guide = @(
    [ordered]@{ title = @('İlk tır ne zaman?', 'When to buy your first truck'); text = @('Başta Quick Job (hazır tırla iş) yap; seviye ve para birikince bankadan kredi çekip ilk tırını alabilirsin. Tırlar sayfasında her tırın en ucuz yapılandırması yazar.', 'Start with Quick Jobs (company truck). Once you have some money and levels, take a bank loan and buy your first truck. The Trucks page shows each truck''s cheapest build.') }
    [ordered]@{ title = @('Garaj ve şoförler', 'Garages and drivers'); text = @('Bir garaj €180.000; büyütünce daha çok tır ve şoför sığar. Şoförler senin yerine yük taşıyıp para kazandırır; şehri yük yoğun yerlerden seçmek kazancı artırır.', 'A garage costs €180,000; upgrading it fits more trucks and drivers. Drivers haul cargo and earn money for you; pick busy cities.') }
    [ordered]@{ title = @('Beceri puanları', 'Skill points'); text = @('Her seviyede bir beceri puanı gelir. İlk puanları ADR (tehlikeli yük) ve uzun mesafeye vermek genelde en çok parayı getirir.', 'You get a skill point every level. Putting early points into ADR (hazardous cargo) and long distance usually pays the most.') }
    [ordered]@{ title = @('Hangi DLC?', 'Which DLC?'); text = @('Haritayı büyüten DLC''ler (Going East!, Scandinavia, Italia, Iberia…) en çok içerik ekler.', 'Map expansions (Going East!, Scandinavia, Italia, Iberia…) add the most content.') }
  )
  footer = @(
    , @('Babuşlar, SCS Software ile bağlantılı değildir. Euro Truck Simulator 2 ve görselleri SCS Software''a aittir.', 'Babuşlar is not affiliated with SCS Software. Euro Truck Simulator 2 and its images belong to SCS Software.')
    , @('Veriler ve görseller Truck Simulator Wiki''den (truck-simulator.fandom.com, CC BY-SA) alınır.', 'Data and images come from the Truck Simulator Wiki (truck-simulator.fandom.com, CC BY-SA).')
  )
}
Write-Rehber -Dir 'ets2' -Data $data -Source 'scripts/ets2-data.ps1'
