# Company of Heroes 2 verisi: cohstats/coh2stats deposundan (MIT) coh2/data.js üretir.
#   Komutanlar: packages/web/src/coh/data/cu2021/commanderData.json (son büyük güncelleme: 2021 Commander Update)
#   Haritalar:  packages/web/src/coh/maps.ts (adlar, oyuncu sayısı) ve public/resources/map-images görselleri
# İkonlar ve görseller depodan jsDelivr üzerinden. Oyun artık güncelleme almadığı için veri sabittir.
# Kullanım: powershell -File scripts/coh2-data.ps1
param([string]$Out = "coh2/data.js")
$ErrorActionPreference = "Stop"

$REPO = "cohstats/coh2stats"
$RAW = "https://raw.githubusercontent.com/$REPO/master/packages/web"
$CDN = "https://cdn.jsdelivr.net/gh/$REPO@master/packages/web/public/resources"

function Get-Text([string]$url) {
  $text = (& curl.exe -s -f -L $url) -join "`n"
  if ($LASTEXITCODE) { throw "İndirilemedi: $url" }
  $text
}

$FACTIONS = [ordered]@{
  soviet   = @{ tr = "Sovyet Ordusu"; en = "Soviet Union"; side = "allies"; color = "#c0443a" }
  wermacht = @{ tr = "Ostheer (Wehrmacht)"; en = "Ostheer (Wehrmacht)"; side = "axis"; color = "#8a8f99" }
  usf      = @{ tr = "ABD Kuvvetleri"; en = "US Forces"; side = "allies"; color = "#6f9b4f" }
  wgerman  = @{ tr = "Oberkommando West"; en = "Oberkommando West"; side = "axis"; color = "#4f6b8a" }
  british  = @{ tr = "İngiliz Kuvvetleri"; en = "British Forces"; side = "allies"; color = "#c9a84a" }
}
$pair = { param($s) if ($s) { [ordered]@{ tr = $s; en = $s } } }

# Komutanlar: yetenekler komuta puanına (CP) göre sıralı.
$commanders = @()
$json = Get-Text "$RAW/src/coh/data/cu2021/commanderData.json" | ConvertFrom-Json
foreach ($c in $json.PSObject.Properties.Value) {
  $race = [string]@($c.races)[0]
  if (-not $FACTIONS.Contains($race) -or -not @($c.abilities).Count) { continue }
  $abilities = @(foreach ($a in @($c.abilities)) {
      [ordered]@{ cp = [int]$a.commandPoints; name = & $pair $a.name; brief = & $pair $a.description; icon = $(if ($a.icon) { "$CDN/exportedIcons/$($a.icon).png" }) }
    })
  $commanders += [ordered]@{
    id       = [string]$c.serverID
    faction  = $race
    name     = & $pair $c.commanderName
    brief    = & $pair $c.description
    icon     = $(if ($c.iconlarge) { "$CDN/exportedIcons/$($c.iconlarge).png" })
    branches = @([ordered]@{ name = $null; upgrades = @($abilities | Sort-Object { $_.cp }) })
  }
}
$commanders = @($commanders | Sort-Object { @($FACTIONS.Keys).IndexOf($_.faction) }, { $_.name.en })

# Haritalar: maps.ts içindeki "anahtar": { type: [...], displayName: "...", autoMatch: ..., maxPlayers: N }
$maps = @()
# Yalnızca depoda görseli olan haritalar alınır.
$tree = Get-Text "https://api.github.com/repos/$REPO/git/trees/master?recursive=1" | ConvertFrom-Json
$images = @{}
foreach ($t in $tree.tree) { if ($t.path -match 'public/resources/map-images/(.+)_x300\.webp$') { $images[$Matches[1]] = $true } }
# Depoda olmayan yetenek ikonları: bilinenler benzeriyle değiştirilir, diğerleri boş kalır (sayfada boş kutu).
$iconFiles = @{}
foreach ($t in $tree.tree) { if ($t.path -match 'public/resources/exportedIcons/(.+)$') { $iconFiles[$Matches[1]] = $true } }
$ICON_FIX = @{ "Icons_units_unit_german_m1910_hmg.png" = "Icons_intel_bulletins_hmg_ger_mg42_rof.png" }
foreach ($c in $commanders) {
  foreach ($a in $c.branches[0].upgrades) {
    if (-not $a.icon) { continue }
    $file = ($a.icon -split '/')[-1]
    if ($iconFiles.ContainsKey($file)) { continue }
    $a.icon = $(if ($ICON_FIX.ContainsKey($file)) { "$CDN/exportedIcons/$($ICON_FIX[$file])" })
    Write-Host "Eksik ikon: $file"
  }
}
$ts = Get-Text "$RAW/src/coh/maps.ts"
foreach ($m in [regex]::Matches($ts, '"([^"]+)":\s*\{\s*type:\s*\[([^\]]*)\],\s*displayName:\s*"([^"]+)",\s*autoMatch:\s*(true|false),\s*maxPlayers:\s*(\d+)')) {
  $key = $m.Groups[1].Value
  if (-not $images.ContainsKey($key)) { continue }
  $maps += [ordered]@{
    id        = $key
    name      = & $pair $m.Groups[3].Value
    players   = [int]$m.Groups[5].Value
    layout    = (($m.Groups[2].Value -replace '"', '' -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }) -join ", "
    automatch = $m.Groups[4].Value -eq "true"
    image     = "$CDN/map-images/$($key)_x300.webp"
  }
}
$maps = @($maps | Sort-Object { $_.players }, { $_.name.en })

$data = [ordered]@{
  game       = "Company of Heroes 2"
  commander  = [ordered]@{ tr = "Komutan"; en = "Commander"; plural = [ordered]@{ tr = "Komutanlar"; en = "Commanders" } }
  factions   = @(foreach ($k in $FACTIONS.Keys) { $f = $FACTIONS[$k]; [ordered]@{ id = $k; name = [ordered]@{ tr = $f.tr; en = $f.en }; side = $f.side; color = $f.color } })
  units      = @()
  commanders = $commanders
  maps       = $maps
}
$result = $data | ConvertTo-Json -Depth 10 -Compress
$result = $result -replace '":\{\}', '":null'
$header = "// Company of Heroes 2 verisi: scripts/coh2-data.ps1 ile cohstats/coh2stats'tan (MIT) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const COH = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Komutan: {0}, harita: {1}" -f $commanders.Count, $maps.Count)
