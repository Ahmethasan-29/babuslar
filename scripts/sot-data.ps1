# Sea of Thieves verisini toplar ve sot/data.js dosyasını yazar.
# Kaynak: Sea of Thieves Wiki (seaofthieves.fandom.com, CC BY-SA). "Islands", "Outposts", "Seaposts", "Sea Forts" ve
# "Siren Shrines" sayfalarındaki tablolar (ad, ızgara koordinatı "G-16", bölge); her yerin sayfasındaki ilk resim ve giriş paragrafı.
# Kullanım: powershell -File scripts/sot-data.ps1 -Out sot/data.js
param([string]$Out = "sot/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
. (Join-Path $PSScriptRoot "wikitable-lib.ps1")
$API = "https://seaofthieves.fandom.com/api.php"

function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', '' -replace '(?s)<ref[^>]*>.*?</ref>', '' -replace '<ref[^>]*/>', ''
  $t = $t -replace '\{\{\s*ilink\s*\|([^}|]*)(\|[^}]*)?\}\}', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', ' ' -replace '<[^>]+>', '' -replace '&nbsp;', ' ' -replace '&amp;', '&'
  ($t -replace '\s+', ' ').Trim()
}
function Page([string]$title) { ([string](Get-Wikitext @($title))[$title]) }
function LinkTarget([string]$t) { if ($t -match '\[\[([^\]|#]+)') { $Matches[1].Trim() } else { Plain $t } }

$places = @()
$sources = @(
  @{ page = "Islands"; kinds = @{ "Large Islands" = "large"; "Small Islands" = "small"; "Fortresses" = "fortress"; "List of uncharted & other islands" = "other" } },
  @{ page = "Outposts"; kinds = @{ "List of Outposts" = "outpost" } },
  @{ page = "Seaposts"; kinds = @{ "List of Seaposts" = "seapost" } },
  @{ page = "Sea Forts"; kinds = @{ "List of Sea Forts" = "seafort" } },
  @{ page = "Siren Shrines"; kinds = @{ "List of Shrines" = "shrine" } }
)
foreach ($s in $sources) {
  foreach ($t in (Get-WikiTables (Page $s.page))) {
    $kind = $s.kinds[$t.section]
    if (-not $kind) { continue }
    foreach ($r in $t.rows) {
      $grid = (Plain $r[1]) -replace '\s', ''
      if ($grid -notmatch '^([A-Z])-(\d{1,2})$') { continue }
      $col = [int][char]$Matches[1] - [int][char]'A'; $row = [int]$Matches[2]
      $animals = @()
      if ($t.columns.Count -ge 6) { foreach ($i in 3..5) { if ($r[$i] -match '✔') { $animals += @("chicken", "pig", "snake")[$i - 3] } } }
      $places += [ordered]@{
        name    = LinkTarget $r[0]
        kind    = $kind
        grid    = $grid
        x       = [Math]::Round(($col + 0.5) / 26 * 100, 3)
        y       = [Math]::Round(($row - 0.5) / 26 * 100, 3)
        region  = (Plain $r[2]) -replace '^No associated region$', ''
        animals = $animals
        note    = $(if ($t.columns -contains "Notes") { Plain $r[3] } else { "" })
      }
    }
  }
}

# Her yerin sayfası: ilk resim ve giriş paragrafı.
$text = Get-Wikitext @($places | ForEach-Object { $_.name })
foreach ($p in $places) {
  $wt = [string]$text[$p.name]
  # Resim: bilgi kutusundaki "image", yoksa sayfadaki ilk dosya. Ada haritası: galerideki "… Map.png" (harita masasındaki görünüm).
  $box = (Get-Templates $wt "infobox") | Select-Object -First 1
  $p.image = $(if ($box -and $box["image"]) { ($box["image"] -replace '^File:', '').Trim() } elseif ($wt -match '\[\[File:([^\]|]+\.(?:png|jpg|jpeg))') { $Matches[1].Trim() } else { $null })
  # Harita masası görünümü "CannonCove_Map.png" / "PlunderValley Map.png" biçiminde (tek parça ad + Map);
  # "CannonCove_EndOfPier_Map.png" gibi bilmece haritaları alınmaz.
  $p.map = $(if ($wt -match "(?<![\w'’-])([A-Za-z'’-]+[ _]Map\.(?:png|jpg))") { $Matches[1].Trim() } else { $null })
  # "Features" bölümündeki maddeler (hayvanlar ayrıca tutuluyor).
  $feat = if ($wt -match '(?s)\n==\s*Features\s*==\s*\n(.*?)(?=\n==[^=]|$)') { $Matches[1] } else { "" }
  # Bilmeceler ({{Riddle|clue=|riddle=|image=|map=}}): bilmece haritasındaki cümle, cevabın ekran görüntüsü ve haritadaki yeri.
  $p.riddles = @(foreach ($r in (Get-Templates $wt "Riddle")) {
      $rtext = Plain $r["riddle"]
      if (-not $rtext) { continue }
      [ordered]@{ clue = Plain $r["clue"]; text = $rtext; image = (($r["image"] + "") -replace '^File:', '').Trim(); map = (($r["map"] + "") -replace '^File:', '').Trim() }
    })
  $p.features = @(foreach ($line in ($feat -split "`n")) {
      if ($line -notmatch '^(\*+)\s*(.*)$') { continue }
      $depth = $Matches[1].Length; $x = Plain $Matches[2]
      if ($x -and $x -notmatch '^(Chickens?|Pigs?|Snakes?)$') { $(if ($depth -gt 1) { "— $x" } else { $x }) }
    })
}
# Bilgi kutusunda resmi olmayan yerler için wikinin sayfa resmi (pageimages).
$noImg = @($places | Where-Object { -not $_.image } | ForEach-Object { $_.name })
foreach ($batch in (Batches $noImg 40)) {
  $r = Post-Json @{ action = "query"; prop = "pageimages"; piprop = "name"; redirects = "1"; format = "json"; formatversion = "2"; titles = ($batch -join "|") }
  foreach ($pg in $r.query.pages) { if ($pg.pageimage) { $hit = $places | Where-Object { $_.name -eq $pg.title } | Select-Object -First 1; if ($hit -and $pg.pageimage -ne $hit.map) { $hit.image = $pg.pageimage } } }
}
# Harita masası görünümü sayfada yoksa adı tahmin edilir: "Salty Sands" → "SaltySands_Map.png".
$guess = @{}
foreach ($p in ($places | Where-Object { -not $_.map })) { $guess[$p.name] = (($p.name -replace '\s*\(.*\)$', '' -replace "[\s'’\-]", '') + "_Map.png") }
$found = Get-ImageUrls @($guess.Values)
foreach ($p in ($places | Where-Object { -not $_.map })) { if ($found[($guess[$p.name] -replace '_', ' ')]) { $p.map = $guess[$p.name] } }
$imgs = Get-ImageUrls @($places | ForEach-Object { $_.image; $_.map; $_.riddles | ForEach-Object { $_.image; $_.map } } | Where-Object { $_ })
foreach ($p in $places) { foreach ($r in $p.riddles) { $r.image = $(if ($r.image) { $imgs[($r.image -replace '_', ' ')] } else { $null }); $r.map = $(if ($r.map) { $imgs[($r.map -replace '_', ' ')] } else { $null }) } }
foreach ($p in $places) {
  $p.image = $(if ($p.image) { $imgs[($p.image -replace '_', ' ')] } else { $null })
  $p.map = $(if ($p.map) { $imgs[($p.map -replace '_', ' ')] } else { $null })
}

$data = [ordered]@{ places = @($places | Sort-Object { $_.name }) }
$json = $data | ConvertTo-Json -Depth 6 -Compress
$header = "// Sea of Thieves verisi: scripts/sot-data.ps1 ile Sea of Thieves Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const SOT = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Yer: {0} ({1}); resimsiz: {2}" -f $places.Count, (($places | Group-Object { $_.kind } | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "), (@($places | Where-Object { -not $_.image } | ForEach-Object { $_.name }) -join ", "))
