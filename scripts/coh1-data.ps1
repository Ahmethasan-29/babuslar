# Company of Heroes (1) verisi: Company of Heroes Wiki'den (companyofheroes.fandom.com, CC BY-SA) coh1/data.js üretir.
#   Birlikler: fraksiyonların birlik kategorilerindeki sayfalar ve {{Infobox …}} bilgileri (fiyat, nüfus, asker sayısı, üretim binası).
#   Doktrinler: 12 komuta ağacının {{CommandTree}} şablonu (dallar, komuta puanı, açıklama).
# Oyun artık güncelleme almadığı için veri sabittir. Kullanım: powershell -File scripts/coh1-data.ps1
param([string]$Out = "coh1/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://companyofheroes.fandom.com/api.php"

$FACTIONS = [ordered]@{
  american     = @{ tr = "ABD Kuvvetleri"; en = "United States"; side = "allies"; color = "#6f9b4f"; cat = "American Units"; doctrines = @("Infantry Company", "Airborne Company", "Armor Company") }
  wehrmacht    = @{ tr = "Wehrmacht"; en = "Wehrmacht"; side = "axis"; color = "#8a8f99"; cat = "Wehrmacht Units"; doctrines = @("Defensive Doctrine", "Blitzkrieg Doctrine", "Terror Doctrine") }
  british      = @{ tr = "İngiliz Kuvvetleri"; en = "British Commonwealth"; side = "allies"; color = "#c9a84a"; cat = "British Units"; doctrines = @("Royal Artillery Support", "Royal Engineers Support", "Royal Commandos Support") }
  panzer_elite = @{ tr = "Panzer Elite"; en = "Panzer Elite"; side = "axis"; color = "#4f6b8a"; cat = "Panzer Elite Units"; doctrines = @("Luftwaffe Tactics", "Tank Destroyer Tactics", "Scorched Earth Tactics") }
}

function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', '' -replace '(?s)<ref[^>]*>.*?</ref>', '' -replace '<ref[^>]*/>', ''
  # Kaynak şablonları yazıya: {{Manpower|270}} → 270 MP
  $t = $t -replace '\{\{\s*Manpower\s*\|\s*([^}|]+)\}\}', '$1 MP' -replace '\{\{\s*Munitions\s*\|\s*([^}|]+)\}\}', '$1 MU' -replace '\{\{\s*Fuel\s*\|\s*([^}|]+)\}\}', '$1 FU'
  $t = $t -replace '\{\{\s*PopCap\s*\|\s*([^}|]+)\}\}', '$1 POP' -replace '\{\{\s*CommandPoints\s*\|\s*([^}|]+)\}\}', '$1 CP' -replace '\{\{\s*Cover\s*\|\s*([^}|]+)\}\}', '$1' -replace '\{\{\s*Health\s*\|\s*([^}|]+)\}\}', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\[https?://\S+\s+([^\]]+)\]', '$1'
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', "`n" -replace '<[^>]+>', '' -replace '&nbsp;', ' ' -replace '&amp;', '&'
  (($t -split "`n" | ForEach-Object { ($_ -replace '^\s*[\*:]+\s*', '' -replace '[ \t]+', ' ').Trim() } | Where-Object { $_ }) -join "`n")
}
function FileOf([string]$t) { if ($t -match '([^\[\]|:=\n]+\.(?:png|jpg|jpeg|gif|webp))') { $Matches[1].Trim() } }
# Sayfanın giriş yazısı: ilk başlıktan önceki paragraflar (şablonlar ve dosyalar atılır).
function Intro([string]$text) {
  $head = ($text -split '(?m)^==')[0]
  $head = $head -replace '(?s)\{\{(?:[^{}]|\{\{[^{}]*\}\})*\}\}', ''
  (@((Plain $head) -split "`n" | Where-Object { $_.Length -gt 40 }) | Select-Object -First 2) -join "`n"
}
# {{Manpower|270}}<br>{{PopCap|6}} → { manpower, munition, fuel, popcap }
function Cost([string]$t) {
  $c = [ordered]@{ manpower = 0; munition = 0; fuel = 0; popcap = 0 }
  foreach ($p in @(@("Manpower", "manpower"), @("Munitions", "munition"), @("Fuel", "fuel"), @("PopCap", "popcap"))) {
    if ($t -match ('\{\{\s*' + $p[0] + '\s*\|\s*(\d+)')) { $c[$p[1]] = [int]$Matches[1] }
  }
  $c
}
$pair = { param($s) if ($s) { [ordered]@{ tr = $s; en = $s } } }

# Get-Wikitext'in büyük/küçük harfe duyarlı hali: wikide "Riflemen Squad" (CoH 1) ve "Riflemen squad" ayrı sayfalar,
# PowerShell'in normal tablosunda ise aynı anahtar olurlar.
function Get-WikitextExact([string[]]$titles) {
  $map = New-Object 'Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
  foreach ($batch in (Batches @($titles | Sort-Object -Unique) 50)) {
    $r = Post-Json @{ action = "query"; prop = "revisions"; rvprop = "content"; rvslots = "main"; format = "json"; formatversion = "2"; titles = ($batch -join "|") }
    foreach ($p in $r.query.pages) { if ($p.revisions) { $map[$p.title] = $p.revisions[0].slots.main.content } }
  }
  $map
}
# Yalnızca harf büyüklüğü farklı sayfalardan Başlık Biçimindeki ("Riflemen Squad") kalır.
function Distinct-Titles([string[]]$titles) {
  $seen = @{}
  foreach ($t in ($titles | Sort-Object { ($_ -split ' ' | Where-Object { $_ -cmatch '^[a-z]' }).Count })) {
    if (-not $seen.ContainsKey($t)) { $seen[$t] = $true; $t }
  }
}

# ---------------------------------------------------------------- Birlikler
$units = @()
$images = @{}
foreach ($fid in $FACTIONS.Keys) {
  $f = $FACTIONS[$fid]
  $titles = @(Distinct-Titles @(Category-Members $f.cat | Where-Object { $_ -notmatch '\((?:COH|CoH) ?2\)|Company of Heroes 2' }))
  $texts = Get-WikitextExact $titles
  foreach ($title in $titles) {
    $w = $texts[$title]
    if (-not $w -or $w -match '\[\[Category:Company of Heroes 2\]\]') { continue }
    if ($w -notmatch '\{\{\s*Infobox[ _]([^|\n}]+)') { continue }
    $kind = $Matches[1].Trim()
    $box = (Get-Templates $w "Infobox $kind")[0]
    if (-not $box) { continue }
    $cost = Cost $box["unit_cost"]
    if (-not ($cost.manpower + $cost.munition + $cost.fuel)) { continue }
    $name = ($title -replace '\s*\((?:American|British|Wehrmacht|Panzer Elite|Company of Heroes|CoH|COH)\)$', '')
    $cat = if ($name -match 'Emplacement|Bunker|Nest|Pit|Battery|Pak 43') { "emplacements" }
    elseif ($kind -match 'vehicle|tank|armou?r') { "vehicles" }
    elseif ($name -match 'Machine Gun|Mortar|Anti[- ]Tank Gun|\bPak\b|Flak|Howitzer|Nebelwerfer|Vickers|Team$') { "team_weapons" }
    else { "infantry" }
    $file = FileOf $box["image"]
    if ($file) { $images[$file] = $true }
    $role = Plain $box["role"]
    $units += [ordered]@{
      id        = "$fid-$(Key $title)"
      faction   = $fid
      cat       = $cat
      name      = & $pair $name
      help      = & $pair $role
      brief     = & $pair (Intro $w)
      file      = $file
      cost      = $cost
      size      = $(if ($box["num_men"] -match '^\s*(\d+)') { [int]$Matches[1] } else { 0 })
      health    = Plain $box["health"]
      weapon    = Plain $box["weapon"]
      buildings = @($(if ($box["production_struc"]) { foreach ($b in ((Plain $box["production_struc"]) -split "`n|,\s*")) { if ($b) { & $pair $b.Trim() } } }))
      prereq    = $(if ((Plain $box["prereq"]) -and (Plain $box["prereq"]) -ne "None") { & $pair (Plain $box["prereq"]) })
    }
  }
}

# ---------------------------------------------------------------- Doktrinler
$commanders = @()
foreach ($fid in $FACTIONS.Keys) {
  $texts = Get-Wikitext $FACTIONS[$fid].doctrines
  foreach ($title in $FACTIONS[$fid].doctrines) {
    $w = $texts[$title]
    if (-not $w) { Write-Warning "Doktrin bulunamadı: $title"; continue }
    $tree = (Get-Templates $w "CommandTree")[0]
    if (-not $tree) { Write-Warning "CommandTree yok: $title"; continue }
    $banner = FileOf $tree["banner"]
    if ($banner) { $images[$banner] = $true }
    $branches = @(foreach ($side in @("left", "center", "right")) {
        if (-not $tree["${side}branch_name"] -and -not $tree["${side}branch_1_name"]) { continue }
        $ups = @(for ($n = 1; $n -le 6; $n++) {
            $nm = Plain $tree["${side}branch_${n}_name"]
            if (-not $nm) { continue }
            $icon = FileOf $tree["${side}branch_${n}_image"]
            if ($icon) { $images[$icon] = $true }
            [ordered]@{ id = Key $nm; tier = $n; cp = $(if ($tree["${side}branch_${n}_cost"] -match '(\d+)') { [int]$Matches[1] }); name = & $pair $nm; brief = & $pair (Plain $tree["${side}branch_${n}_data"]); file = $icon }
          })
        [ordered]@{ name = & $pair (Plain $tree["${side}branch_name"]); upgrades = $ups }
      })
    $commanders += [ordered]@{ id = Key $title; faction = $fid; name = & $pair $title; brief = & $pair (Intro $w); file = $banner; branches = $branches }
  }
}

# Görsel adresleri (küçültülmüş). Bu wikide görseller ?path-prefix=en olmadan yer tutucu döner; yabancı sitelere
# referer ile de verilmediğinden sayfalarda no-referrer kullanılır.
$urls = Get-ImageUrls @($images.Keys)
function Img([string]$file, [int]$w) { if ($file -and $urls[($file -replace '_', ' ')]) { "$($urls[($file -replace '_', ' ')])/scale-to-width-down/$($w)?path-prefix=en" } }
foreach ($u in $units) { $u.icon = Img $u.file 200; $u.Remove("file") }
foreach ($c in $commanders) {
  $c.image = Img $c.file 600; $c.Remove("file")
  foreach ($b in $c.branches) { foreach ($a in $b.upgrades) { $a.icon = Img $a.file 96; $a.Remove("file") } }
}

$data = [ordered]@{
  game       = "Company of Heroes"
  commander  = [ordered]@{ tr = "Doktrin"; en = "Doctrine"; plural = [ordered]@{ tr = "Doktrinler"; en = "Doctrines" } }
  factions   = @(foreach ($k in $FACTIONS.Keys) { $f = $FACTIONS[$k]; [ordered]@{ id = $k; name = [ordered]@{ tr = $f.tr; en = $f.en }; side = $f.side; color = $f.color } })
  units      = $units
  commanders = $commanders
  maps       = @()
}
$result = $data | ConvertTo-Json -Depth 10 -Compress
$result = $result -replace '":\{\}', '":null'
$header = "// Company of Heroes verisi: scripts/coh1-data.ps1 ile Company of Heroes Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const COH = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Birlik: {0}, doktrin: {1}, görselsiz birlik: {2}" -f $units.Count, $commanders.Count, @($units | Where-Object { -not $_.icon }).Count)
