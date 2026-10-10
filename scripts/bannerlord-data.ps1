# Mount & Blade II: Bannerlord verisini toplar ve mb/bannerlord/data.js dosyasını yazar.
# Kaynak: Mount & Blade Wiki (mountandblade.fandom.com, CC BY-SA):
#  - yerleşimler: "Bannerlord Towns / Castles / Villages" kategorilerindeki sayfaların Fief box / Village box şablonları,
#  - birlikler: kültür kategorilerindeki (Vlandian troops…) sayfaların Troop box şablonu ve beceri tablosu,
#  - harita: wikideki siyasi Calradia haritası (Vesper'in hazırladığı, "Bannerlord Calradia Political map.png").
# Kullanım: powershell -File scripts/bannerlord-data.ps1 -Out mb/bannerlord/data.js
param([string]$Out = "mb/bannerlord/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://mountandblade.fandom.com/api.php"

function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '\{\{\s*BL\s*\|([^}|]+)\}\}', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', '' -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1' -replace "'{2,}", '' -replace '<br\s*/?>', ', ' -replace '<[^>]+>', ''
  (($t -replace '\s+', ' ') -replace '(,\s*)+', ', ').Trim(' ', ',')
}
function Links([string]$t) { @([regex]::Matches([string]$t, '\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]|\{\{\s*BL\s*\|([^}|]+)\}\}') | ForEach-Object { if ($_.Groups[1].Success) { $_.Groups[1].Value.Trim() } else { $_.Groups[2].Value.Trim() } }) }
function Slug([string]$t) { ($t.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', '').ToLowerInvariant() -replace '[^a-z0-9]+', '-' -replace '^-|-$', '' }
# Sayfaların kategorileri (bazıları şablonlardan geldiği için wikitext'te görünmez).
function Get-Categories([string[]]$titles) {
  $map = @{}
  foreach ($batch in (Batches @($titles | Sort-Object -Unique) 50)) {
    $r = Post-Json @{ action = "query"; prop = "categories"; cllimit = "500"; format = "json"; formatversion = "2"; titles = ($batch -join "|") }
    foreach ($p in $r.query.pages) { $map[$p.title] = @($p.categories | ForEach-Object { $_.title -replace '^Category:', '' }) }
  }
  $map
}

$KINGDOMS = [ordered]@{
  "Vlandia" = "#b8432f"; "Sturgia" = "#4f6d8c"; "Battania" = "#4e9a2f"; "Khuzait" = "#7fb3c8"; "Aserai" = "#d6c25a"
  "Northern Empire" = "#8a2d63"; "Western Empire" = "#c98a3c"; "Southern Empire" = "#8b6db8"
}
function Kingdom([string]$v) {
  $p = Plain $v
  foreach ($k in $KINGDOMS.Keys) { if ($p -match [regex]::Escape($k)) { return $k } }
  if ($p -match 'Khuzait') { return "Khuzait" }
  $null
}

# ---------------------------------------------------------------- Yerleşimler
Write-Host "Yerleşimler…"
$placeTitles = @{}
foreach ($pair in @(@("Bannerlord Towns", "town"), @("Bannerlord Castles", "castle"), @("Bannerlord Villages", "village"))) {
  foreach ($t in (Category-Members $pair[0])) { if ($t -notmatch '^(Towns|Castles|Villages)') { $placeTitles[$t] = $pair[1] } }
}
$placeText = Get-Wikitext @($placeTitles.Keys)
$places = @()
foreach ($title in ($placeTitles.Keys | Sort-Object)) {
  $w = $placeText[$title]
  if (-not $w) { continue }
  $type = $placeTitles[$title]
  # Köy sayfalarının bir kısmı Village box, bir kısmı Fief box kullanır.
  $box = @((Get-Templates $w "Village box") + (Get-Templates $w "Fief box")) | Select-Object -First 1
  if (-not $box) { continue }
  $name = if ($box["box title"]) { Plain $box["box title"] } else { $title -replace ' \(Bannerlord\)$', '' }
  $intro = (($w -split '\n==')[0] -replace '(?s)\{\{.*?\}\}', '')
  # Köyün ürünü: "...known to produce Grapes." / "...produces Horses, specifically Desert Horses." → tek ad.
  $produce = $null
  if ($type -eq "village" -and $intro -match 'produc\w*\s+([^.\n(]+)') {
    $produce = ((Plain $Matches[1]) -replace '^(the |a |of |is the raising of )+', '').Trim()
    if ($produce -match 'specifically (.+)$') { $produce = $Matches[1] }
    $alias = @{ "Pigs" = "Hogs"; "Iron" = "Iron Ore" }
    if ($alias[$produce]) { $produce = $alias[$produce] }
  }
  $villages = @()
  if ($box["villages"]) { $villages = @((Plain $box["villages"]) -split '\s*(?:,|\band\b)\s*' | Where-Object { $_ }) }
  $places += [ordered]@{
    id       = (Slug $name)
    name     = $name
    type     = $type
    kingdom  = (Kingdom $box["kingdom"])
    bound    = $(if ($type -eq "village") { Plain $box["fortification"] } else { $null })
    villages = $villages
    produce  = $produce
    port     = [bool]($box["port"] -match '^\s*Yes')
  }
}
# Köy listesi yalnız köy sayfasında ya da yalnız şehir/kale sayfasında yazılı olabilir; iki yön birleştirilir.
foreach ($p in $places | Where-Object { $_.type -ne "village" }) {
  foreach ($v in $p.villages) { $vp = $places | Where-Object { $_.type -eq "village" -and $_.name -eq $v } | Select-Object -First 1; if ($vp -and -not $vp.bound) { $vp.bound = $p.name } }
}
foreach ($p in $places | Where-Object { $_.type -ne "village" }) {
  $p.villages = @(@($p.villages) + @($places | Where-Object { $_.type -eq "village" -and $_.bound -eq $p.name } | ForEach-Object { $_.name }) | Sort-Object -Unique)
}
foreach ($v in $places | Where-Object { $_.type -eq "village" -and -not $_.kingdom -and $_.bound }) {
  $v.kingdom = ($places | Where-Object { $_.name -eq $v.bound } | Select-Object -First 1).kingdom
}

# ---------------------------------------------------------------- Birlikler
Write-Host "Birlikler…"
$CULTURES = [ordered]@{
  "Vlandia" = "Vlandian troops"; "Sturgia" = "Sturgian troops"; "Battania" = "Battanian troops"
  "Khuzait" = "Khuzait troops"; "Aserai" = "Aserai troops"; "Empire" = "Imperial troops"
}
$troopTitles = @{}
foreach ($c in $CULTURES.Keys) { foreach ($t in (Category-Members $CULTURES[$c])) { if ($t -notmatch 'Multiplayer|^Category:|^(Vlandia|Sturgia|Battania|Khuzait|Aserai|Empire)$') { $troopTitles[$t] = $c } } }
$troopText = Get-Wikitext @($troopTitles.Keys)
$troopCats = Get-Categories @($troopTitles.Keys)
$WORDS = @{ one = 1; two = 2; three = 3; four = 4; five = 5; six = 6 }
$troops = @()
foreach ($title in ($troopTitles.Keys | Sort-Object)) {
  $w = $troopText[$title]
  if (-not $w) { continue }
  $box = (Get-Templates $w "Troop box") | Select-Object -First 1
  if (-not $box) { continue }
  $culture = $troopTitles[$title]
  # Haydutlar (Bandits) ve başka kültürlerin birlikleri kategoriye karışabiliyor: Troop box'taki kültür esas alınır.
  $boxCulture = Plain $box["culture"]
  if ($boxCulture -and $boxCulture -notmatch [regex]::Escape($culture) -and -not ($culture -eq "Empire" -and $boxCulture -match 'Empire|Imperial|Calradic')) { continue }
  $name = if ($box["box title"]) { Plain $box["box title"] } else { $title -replace ' \(Bannerlord\)$', '' }
  $tier = if ($w -match "tier[- ](one|two|three|four|five|six|\d)") { $x = $Matches[1]; if ($WORDS[$x]) { $WORDS[$x] } else { [int]$x } } else { $null }
  $cats = @($troopCats[$title])
  $kind = if ($cats -contains "Bannerlord Horse Archers") { "horsearcher" } elseif ($cats -contains "Bannerlord Cavalry") { "cavalry" } elseif ($cats -contains "Bannerlord Archers") { "ranged" } elseif ($cats -contains "Bannerlord Infantry") { "infantry" } else { $null }
  $skills = [ordered]@{}
  foreach ($m in [regex]::Matches($w, '!(One Handed|Two Handed|Polearm|Bow|Crossbow|Throwing|Riding|Athletics)\s*\n\|\s*(\d+)')) { $skills[$m.Groups[1].Value] = [int]$m.Groups[2].Value }
  $wage = if ($box["wages"] -match '(\d+)') { [int]$Matches[1] } else { $null }
  $troops += [ordered]@{
    id      = (Slug $name)
    name    = $name
    culture = $culture
    tier    = $tier
    kind    = $kind
    noble   = [bool]($w -match "tier[- ]\w+ noble" -or (Plain $box["acquired from"]) -match 'noble|\(rare\)')
    wage    = $wage
    image   = (FileName $box["image file"])
    up      = @(Links $box["upgrades to"] | ForEach-Object { Slug ($_ -replace ' \(Bannerlord\)$', '') })
    skills  = $skills
  }
}
# Aynı birliğin eski sürüm sayfası da olabilir ("Vlandian Crossbowman" iki kez): kademesi yazılı olan kalır.
$troops = @($troops | Group-Object { $_.id } | ForEach-Object { $_.Group | Sort-Object { -[int][bool]$_.tier }, { -$_.skills.Count } | Select-Object -First 1 })
# Bilinmeyen hedefler (sayfası olmayan birlikler) ağaçtan atılır.
$known = @{}; foreach ($t in $troops) { $known[$t.id] = $true }
foreach ($t in $troops) { $t.up = @($t.up | Where-Object { $known[$_] } | Select-Object -Unique) }
$imgs = Get-ImageUrls @($troops | ForEach-Object { $_.image } | Where-Object { $_ })
foreach ($t in $troops) { $t.image = $(if ($t.image) { $imgs[($t.image -replace '_', ' ')] } else { $null }) }

# ---------------------------------------------------------------- Harita
$mapInfo = (Get-Json "$API`?action=query&titles=File:Bannerlord%20Calradia%20Political%20map.png&prop=imageinfo&iiprop=url|size&format=json&formatversion=2").query.pages[0].imageinfo[0]

$data = [ordered]@{
  map      = [ordered]@{ url = ($mapInfo.url -replace '\?.*$', ''); width = $mapInfo.width; height = $mapInfo.height }
  kingdoms = @($KINGDOMS.Keys | ForEach-Object { [ordered]@{ id = $_; color = $KINGDOMS[$_] } })
  places   = @($places | Sort-Object { $_.name })
  troops   = $troops
}
$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// Mount & Blade II: Bannerlord verisi: scripts/bannerlord-data.ps1 ile Mount & Blade Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const BL = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
$byType = $places | Group-Object { $_.type } | ForEach-Object { "$($_.Name)=$($_.Count)" }
Write-Host ("Yerleşim: {0}; krallığı bilinmeyen: {1}; bağlı olduğu yer bilinmeyen köy: {2}; birlik: {3}; türü bilinmeyen: {4}; kademesi bilinmeyen: {5}" -f `
    ($byType -join " "), (@($places | Where-Object { -not $_.kingdom } | ForEach-Object { $_.name }) -join ","), `
    @($places | Where-Object { $_.type -eq "village" -and -not $_.bound }).Count, $troops.Count, `
    (@($troops | Where-Object { -not $_.kind } | ForEach-Object { $_.name }) -join ","), (@($troops | Where-Object { -not $_.tier } | ForEach-Object { $_.name }) -join ","))
