# Mount & Blade: Warband verisini toplar ve mb/warband/data.js dosyasını yazar.
# Kaynaklar:
#  - Oyunun resmî Module System dosyaları (Native 1.171, github.com/int19h/mb_warband_module_system aynası):
#    yerleşimlerin harita koordinatları (module_parties.py), şehir/kalelerin başlangıç krallıkları ve köylerin
#    bağlandığı yerleşim (module_scripts.py), birlik ağaçları (module_troops.py), yoldaşların dost/düşman ilişkileri.
#  - Mount & Blade Wiki (mountandblade.fandom.com, CC BY-SA): dünya haritası resmi ve yoldaşların itiraz ettiği davranışlar.
# Kullanım: powershell -File scripts/warband-data.ps1 -Out mb/warband/data.js
param([string]$Out = "mb/warband/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://mountandblade.fandom.com/api.php"
$SRC = "https://raw.githubusercontent.com/int19h/mb_warband_module_system/master/Module_system%201.171"

function Source([string]$file) {
  $path = Join-Path $CACHE "warband-$file"
  if (-not (Test-Path $path)) { & curl.exe -s -m 120 -o $path "$SRC/$file"; if ($LASTEXITCODE -ne 0) { throw "İndirilemedi: $file" } }
  [IO.File]::ReadAllText($path)
}
function Nice([string]$t) { ($t -replace '_', ' ').Trim() }

# ---------------------------------------------------------------- Krallıklar
$factionText = Source "module_factions.py"
$factions = [ordered]@{}
foreach ($m in [regex]::Matches($factionText, '(?m)^\s*\("(kingdom_\d)",\s*"([^"]+)".*?,\s*(0x[0-9A-Fa-f]{6})\)')) {
  $factions[$m.Groups[1].Value] = [ordered]@{ id = $m.Groups[1].Value; name = $m.Groups[2].Value; color = "#" + $m.Groups[3].Value.Substring(2).ToLowerInvariant() }
}

# ---------------------------------------------------------------- Yerleşimler
$parties = Source "module_parties.py"
$places = [ordered]@{}
foreach ($m in [regex]::Matches($parties, '(?m)^\s*\("((town|castle|village)_\d+)",\s*"([^"]+)",[^\n]*?\(\s*([-\d\.]+)\s*,\s*([-\d\.]+)\s*\)')) {
  $places[$m.Groups[1].Value] = [ordered]@{
    id = $m.Groups[1].Value; name = (Nice $m.Groups[3].Value); type = $m.Groups[2].Value
    x = [double]$m.Groups[4].Value; y = [double]$m.Groups[5].Value; faction = $null; bound = $null
  }
}
$scripts = Source "module_scripts.py"
foreach ($m in [regex]::Matches($scripts, 'script_give_center_to_faction_aux",\s*"p_((town|castle)_\d+)",\s*"fac_(kingdom_\d)"')) {
  if ($places.Contains($m.Groups[1].Value)) { $places[$m.Groups[1].Value].faction = $m.Groups[3].Value }
}
# Köylerin bağlanması oyundaki gibi yapılır (module_scripts.py, game_start):
#  1) her kale sırayla kendine en yakın boştaki köyü alır, 2) kalan köyler en yakın şehre bağlanır.
function Dist($a, $b) { [Math]::Sqrt([Math]::Pow($a.x - $b.x, 2) + [Math]::Pow($a.y - $b.y, 2)) }
$towns = @($places.Values | Where-Object { $_.type -eq "town" })
$castles = @($places.Values | Where-Object { $_.type -eq "castle" })
$villages = @($places.Values | Where-Object { $_.type -eq "village" })
foreach ($c in $castles) {
  $best = $villages | Where-Object { -not $_.bound } | Sort-Object { Dist $_ $c } | Select-Object -First 1
  if ($best) { $best.bound = $c.id }
}
foreach ($v in ($villages | Where-Object { -not $_.bound })) { $v.bound = ($towns | Sort-Object { Dist $v $_ } | Select-Object -First 1).id }
foreach ($v in $villages) { $v.faction = $places[$v.bound].faction }

# Dünya haritası resmi (wiki: WarbandWorldMap.jpg, 2400×1800). Oyun koordinatı → resim üzerindeki yüzde konum.
# Ölçek ve kayma, resimde adı yazan 22 şehrin konumundan bulundu; iki eksende de aynı ölçek (≈7.06 piksel/birim).
$MAP_W = 2400; $MAP_H = 1800; $SCALE = 7.06; $OX = 1089; $OY = 934
foreach ($p in $places.Values) {
  $p.px = [Math]::Round(($OX + $SCALE * $p.x) / $MAP_W * 100, 2)
  $p.py = [Math]::Round(($OY - $SCALE * $p.y) / $MAP_H * 100, 2)
  $p.Remove("x"); $p.Remove("y")
}
$mapUrl = (Get-Json "$API`?action=query&titles=File:WarbandWorldMap.jpg&prop=imageinfo&iiprop=url&format=json&formatversion=2").query.pages[0].imageinfo[0].url -replace '\?.*$', ''

# ---------------------------------------------------------------- Birlikler
$troopText = Source "module_troops.py"
$troops = [ordered]@{}
foreach ($m in [regex]::Matches($troopText, '(?s)\n\s*\["([a-z0-9_]+)",\s*"([^"]+)",\s*"[^"]*",\s*([^,]+),[^,]*,[^,]*,\s*fac_(kingdom_\d),(.*?)level\((\d+)\)')) {
  $flags = $m.Groups[3].Value
  # Tür, birliğe verilen ekipmandan bulunur: atlı (tf_guarantee_horse ya da tf_mounted + listede at) ve menzilli silah garantisi.
  $mounted = $flags -match 'tf_guarantee_horse' -or ($flags -match 'tf_mounted' -and $m.Groups[5].Value -match 'itm_\w*(horse|courser|hunter|charger|steed)\b')
  $kind = if ($mounted) { "cavalry" } elseif ($flags -match 'tf_guarantee_ranged') { "ranged" } else { "infantry" }
  if ($kind -eq "cavalry" -and ($flags -match 'tf_guarantee_ranged' -or $m.Groups[2].Value -match 'Archer')) { $kind = "horsearcher" }
  $troops[$m.Groups[1].Value] = [ordered]@{ id = $m.Groups[1].Value; name = $m.Groups[2].Value; faction = $m.Groups[4].Value; level = [int]$m.Groups[6].Value; kind = $kind; up = @() }
}
foreach ($m in [regex]::Matches($troopText, '(?m)^upgrade2?\(troops,\s*"([^"]+)",\s*"([^"]+)"(?:,\s*"([^"]+)")?\)')) {
  $from = $m.Groups[1].Value
  if (-not $troops.Contains($from)) { continue }
  foreach ($g in 2, 3) { if ($m.Groups[$g].Success -and $troops.Contains($m.Groups[$g].Value)) { $troops[$from].up += $m.Groups[$g].Value } }
}
# Her krallığın ağacı: başka bir birlikten yükseltilmeyen ama yükseltilebilen birlik köktür (ör. Swadian Recruit).
$targets = @{}
foreach ($t in $troops.Values) { foreach ($u in $t.up) { $targets[$u] = $true } }
foreach ($f in $factions.Values) {
  $f.roots = @($troops.Values | Where-Object { $_.faction -eq $f.id -and $_.up.Count -and -not $targets[$_.id] } | ForEach-Object { $_.id })
}
# Ağaçta yer alan birlikler (lord, kral gibi tek kişilik karakterler dışarıda kalır).
$inTree = @{}
function Walk($id) { if ($inTree[$id]) { return }; $inTree[$id] = $true; foreach ($u in $troops[$id].up) { Walk $u } }
foreach ($f in $factions.Values) { foreach ($r in $f.roots) { Walk $r } }
$troopList = @($troops.Values | Where-Object { $inTree[$_.id] } | ForEach-Object { $_.Remove("faction"); $_ })

# ---------------------------------------------------------------- Yoldaşlar
$companions = [ordered]@{}
foreach ($m in [regex]::Matches($troopText, '\["(npc\d+)",\s*"([^"]+)"')) { $companions[$m.Groups[1].Value] = [ordered]@{ id = $m.Groups[1].Value; name = $m.Groups[2].Value } }
foreach ($m in [regex]::Matches($scripts, 'troop_set_slot,\s*"trp_(npc\d+)",\s*slot_troop_(personalityclash_object|personalityclash2_object|personalitymatch_object|home|payment_request|town_with_contacts),\s*"?([a-z0-9_]+)"?')) {
  $c = $companions[$m.Groups[1].Value]
  if (-not $c) { continue }
  $v = $m.Groups[3].Value -replace '^trp_|^p_', ''
  switch ($m.Groups[2].Value) {
    "personalitymatch_object" { $c.friend = $v }
    "personalityclash_object" { $c.enemies = @(@($c.enemies) + $v | Where-Object { $_ }) }
    "personalityclash2_object" { $c.enemies = @(@($c.enemies) + $v | Where-Object { $_ }) }
    "home" { $c.home = $places[$v].name }
    "payment_request" { $c.cost = [int]$v }
    "town_with_contacts" { $c.contacts = $places[$v].name }
  }
}
# Wikideki yoldaş tablosu: öne çıkan beceriler, itiraz ettikleri davranışlar, soylu olup olmadıkları, başlangıç seviyesi.
$heroes = (Get-Wikitext @("Heroes"))["Heroes"]
$table = [regex]::Match($heroes, '(?s)==List of Heroes==.*?\{\|(.*?)\n\|\}').Groups[1].Value
foreach ($row in ($table -split '\n\|-') | Select-Object -Skip 1) {
  $cells = @(($row -split '\n\|') | Select-Object -Skip 1 | ForEach-Object { $_.Trim() })
  if ($cells.Count -lt 9) { continue }
  $name = if ($cells[0] -match '^\[\[([^\]|]+)') { $Matches[1] } else { continue }
  $c = $companions.Values | Where-Object { $_.name -eq $name } | Select-Object -First 1
  if (-not $c) { continue }
  $plain = { param($s) ((($s -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1') -replace '<[^>]+>', ' ') -replace '\s+', ' ').Trim() }
  $c.skills = @((& $plain $cells[1]) -split '\s*,\s*' | Where-Object { $_ })
  $c.objections = @((& $plain $cells[4]) -split '\s*,\s*' | Where-Object { $_ })
  $c.noble = $cells[6] -match '✔'
  $c.level = [int](($cells[8] -replace '\D', '') + "0") / 10
  $c.image = FileName $(if ($cells[0] -match '\[\[File:([^\]|]+)') { $Matches[1] } else { $null })
}
$imgs = Get-ImageUrls @($companions.Values | ForEach-Object { $_.image } | Where-Object { $_ })
foreach ($c in $companions.Values) { if ($c.image) { $c.image = $imgs[($c.image -replace '_', ' ')] } }

$data = [ordered]@{
  map        = [ordered]@{ url = $mapUrl; width = $MAP_W; height = $MAP_H }
  factions   = @($factions.Values)
  places     = @($places.Values)
  troops     = $troopList
  companions = @($companions.Values)
}
$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// Mount & Blade: Warband verisi: scripts/warband-data.ps1 ile oyunun Module System dosyalarından ve Mount & Blade Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const WB = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Krallık: {0}, şehir: {1}, kale: {2}, köy: {3}, birlik: {4}, yoldaş: {5}; krallığı olmayan şehir/kale: {6}; wikide bulunmayan yoldaş: {7}" -f `
    $factions.Count, $towns.Count, $castles.Count, $villages.Count, $troopList.Count, $companions.Count, `
    (@($places.Values | Where-Object { $_.type -ne "village" -and -not $_.faction } | ForEach-Object { $_.name }) -join ","), `
    (@($companions.Values | Where-Object { -not $_.objections } | ForEach-Object { $_.name }) -join ","))
