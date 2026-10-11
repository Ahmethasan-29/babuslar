# Bir Battlefield oyununun silah ve harita verisini toplar ve <klasör>/data.js dosyasını yazar.
# Kaynak: Battlefield Wiki (battlefield.fandom.com, CC BY-SA).
# - Silah ve harita listesi oyunun gezinme şablonlarından (Template:Weapons/BF1, Template:Maps/BF1): grup = silah sınıfı / DLC.
# - Her silahın o oyundaki bölümü ("==Battlefield 1==", "Sayfa#Bölüm" ya da "Sayfa/Battlefield 6") ve içindeki
#   {{Infobox/weapon…}} bilgileri; oyundaki açıklama ({{Quote|…|In-game description}}).
# - Haritalarda {{Infobox/map}} ve resmî tanıtım yazısı.
# Kullanım: powershell -File scripts/bf-data.ps1 -Game BF1   (BF1, BF2, BF3, BF4, BFV, BF6)
param([Parameter(Mandatory = $true)][ValidateSet("BF1", "BF2", "BF3", "BF4", "BFV", "BF6")][string]$Game)
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://battlefield.fandom.com/api.php"

$GAMES = @{
  BF1 = @{ title = "Battlefield 1"; nav = "BF1"; dir = "bf1" }
  BF2 = @{ title = "Battlefield 2"; nav = "BF2"; dir = "bf2" }
  BF3 = @{ title = "Battlefield 3"; nav = "BF3"; dir = "bf3" }
  BF4 = @{ title = "Battlefield 4"; nav = "BF4"; dir = "bf4" }
  BFV = @{ title = "Battlefield V"; nav = "BF5"; dir = "bfv" }
  BF6 = @{ title = "Battlefield 6"; nav = "BF6"; dir = "bf6" }
}
$G = $GAMES[$Game]

$KITS = 'Assault|Medic|Support|Scout|Engineer|Recon|Sniper|Anti-Tank|Special Forces|Spec Ops|Tanker|Pilot|Cavalry|Elite|Sentry|Flame Trooper|Tank Hunter|Trench Raider|Infiltrator|Sentry|All'
function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', '' -replace '(?s)<ref[^>]*>.*?</ref>', '' -replace '<ref[^>]*/>', ''
  $t = $t -replace "\{\{\s*(?:BF\w*\s+)?($KITS)\s*\}\}", '$1'
  $t = $t -replace '\{\{\s*Warbonds\s*\|\s*(\d+)[^}]*\}\}', '$1 Warbonds'
  $t = $t -replace '\{\{\s*(?:unknown|Unknown)\s*\}\}', '?'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\[https?://\S+\s+([^\]]+)\]', '$1'
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', "`n" -replace '<[^>]+>', '' -replace '&nbsp;', ' ' -replace '&amp;', '&'
  (($t -split "`n" | ForEach-Object { ($_ -replace '^\s*\*\s*', '' -replace '[ \t]+', ' ').Trim() } | Where-Object { $_ }) -join "`n")
}
function First([string]$t) { ((Plain $t) -split "`n")[0] }
function FileOf([string]$t) { if ($t -match '([^\[\]|:=\n]+\.(?:png|jpg|jpeg|gif|webp))') { $Matches[1].Trim() } }
function Section([string]$text, [string]$title) {
  $rx = '(?ms)^(=+)\s*' + [regex]::Escape($title) + '\s*\1\s*$(.*?)(?=^\1[^=]|\z)'
  if ($text -match $rx) { return $Matches[2] }
  $null
}

# Gezinme şablonundaki gruplar ve bağlantılar.
function NavGroups([string]$tpl) {
  $wt = [string](Get-Wikitext @($tpl))[$tpl]
  $box = (Get-Templates $wt "navbox") | Select-Object -First 1
  $groups = @()
  foreach ($k in ($box.Keys | Where-Object { $_ -match '^list(\d+)$' } | Sort-Object { [int]($_ -replace '\D', '') })) {
    $n = $k -replace '\D', ''
    $list = $box[$k] -replace '(?s)<small>.*?</small>', ''
    $links = @([regex]::Matches($list, '\[\[([^\]|]+)(?:\|([^\]]+))?\]\]') | ForEach-Object {
        $target = $_.Groups[1].Value.Trim()
        $label = $(if ($_.Groups[2].Success) { Plain $_.Groups[2].Value } else { $target -replace '\s*\(.*\)$', '' -replace '/.*$', '' -replace '#.*$', '' })
        if ($target -notmatch '^(File|Category):') { @{ target = $target; label = $label } }
      })
    # Alt gruplar (iç içe navbox) da düz listeye katılır.
    $groups += @{ name = (Plain $box["group$n"]); links = $links }
  }
  $groups
}

# Sayfanın bu oyuna ait kısmı.
function GamePart([string]$target, [hashtable]$texts) {
  $page, $anchor = $target -split '#', 2
  $wt = [string]$texts[$page.Trim()]
  if (-not $wt) { return "" }
  if ($anchor) { $s = Section $wt $anchor.Trim(); if ($s) { return $s } }
  if ($page -match '/') { return $wt }
  $s = Section $wt $G.title
  if ($s) { return $s }
  $wt
}
function Infobox([string]$part, [string]$prefix) {
  if ($part -match ('\{\{\s*(' + $prefix + '[a-z0-9]*)\s*[\|\n]')) { (Get-Templates $part $Matches[1]) | Select-Object -First 1 }
}
function Quote([string]$part, [string]$who) {
  foreach ($q in (Get-Templates $part "Quote")) { if ((Plain $q["2"]) -match $who) { return Plain $q["1"] } }
  $null
}

# --- Silahlar -------------------------------------------------------------------------------------------------
$wgroups = NavGroups "Template:Weapons/$($G.nav)"
$pages = @($wgroups | ForEach-Object { $_.links } | ForEach-Object { ($_.target -split '#')[0].Trim() } | Sort-Object -Unique)
$texts = Get-Wikitext $pages
$weapons = @()
$seen = @{}
foreach ($grp in $wgroups) {
  foreach ($l in $grp.links) {
    if ($seen.ContainsKey($l.target)) { continue }
    $seen[$l.target] = 1
    $part = GamePart $l.target $texts
    $box = Infobox $part 'infobox/weapon'
    if (-not $box) { continue }
    $img = FileOf $box["image"]
    if (-not $img) { $img = FileOf $box["hud"] }
    $desc = Quote $part 'In-game|in-game|Codex|Battlepack'
    if (-not $desc) { $p1 = @($part -split "`n" | Where-Object { $_ -match "^The '''|^'''" } | Select-Object -First 1); $desc = $(if ($p1) { Plain $p1[0] } else { "" }) }
    $weapons += [ordered]@{
      name     = $(if ($box["name"]) { First $box["name"] } else { $l.label })
      group    = $grp.name
      image    = $img
      kit      = (Plain $box["kit"]) -replace "`n", ", "
      fire     = (Plain $box["fire"]) -replace "`n", ", "
      rof      = First $(if ($box["rof"]) { $box["rof"] } else { $box["rate"] })
      magazine = First $box["magazine"]
      damage   = First $box["damage"]
      velocity = First $(if ($box["velocity"]) { $box["velocity"] } else { $box["vel"] })
      ammo     = First $box["ammotype"]
      unlock   = First $(if ($box["level"]) { $box["level"] } else { $box["unlock"] })
      desc     = $desc
    }
  }
}

# --- Haritalar ------------------------------------------------------------------------------------------------
$mgroups = NavGroups "Template:Maps/$($G.nav)"
$mpages = @($mgroups | ForEach-Object { $_.links } | ForEach-Object { ($_.target -split '#')[0].Trim() } | Sort-Object -Unique)
$mtexts = Get-Wikitext $mpages
$maps = @()
$mseen = @{}
foreach ($grp in $mgroups) {
  foreach ($l in $grp.links) {
    if ($mseen.ContainsKey($l.target)) { continue }
    $mseen[$l.target] = 1
    $part = GamePart $l.target $mtexts
    $box = Infobox $part 'infobox/map'
    if (-not $box) { continue }
    $desc = Quote $part 'Official|official|description|Description|briefing|Briefing'
    if (-not $desc) { $p1 = @($part -split "`n" | Where-Object { $_ -match "^'''" } | Select-Object -First 1); $desc = $(if ($p1) { Plain $p1[0] } else { "" }) }
    $maps += [ordered]@{
      name    = $(if ($box["name"]) { First $box["name"] } else { $l.label })
      group   = $grp.name
      image   = FileOf $box["image"]
      modes   = @((Plain $box["modes"]) -split "`n" | ForEach-Object { $_ -replace '\s*\(.*\)$', '' } | Where-Object { $_ })
      place   = First $(if ($box["place"]) { $box["place"] } else { $box["location"] })
      date    = First $box["date"]
      terrain = First $box["terrain"]
      desc    = $desc
    }
  }
}

$imgs = Get-ImageUrls @($weapons + $maps | ForEach-Object { $_.image } | Where-Object { $_ })
foreach ($x in @($weapons + $maps)) { $x.image = $(if ($x.image) { $imgs[($x.image -replace '_', ' ')] } else { $null }) }

$data = [ordered]@{ game = $G.title; weapons = $weapons; maps = $maps }
$json = $data | ConvertTo-Json -Depth 6 -Compress
$Out = "$($G.dir)/data.js"
$header = "// $($G.title) verisi: scripts/bf-data.ps1 -Game $Game ile Battlefield Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const BF = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("{0}: silah {1} (resimsiz {2}, açıklamasız {3}; gruplar: {4}), harita {5} (resimsiz {6})" -f $G.title, $weapons.Count, @($weapons | Where-Object { -not $_.image }).Count, @($weapons | Where-Object { -not $_.desc }).Count, (($weapons | Group-Object { $_.group } | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "), $maps.Count, @($maps | Where-Object { -not $_.image }).Count)
