# The Witcher 3 verisini toplar ve witcher3/data.js dosyasını yazar.
# Kaynaklar:
#  - Harita işaretleri: witcher3map projesi (github.com/witcher3map/witcher3map, CC BY-NC-SA) mapdata-*.js ve İngilizce
#    dil dosyaları. Konumlar, scripts/witcher3-maps.ps1 ile aynı karolardan birleştirilen resimlere göre yüzdeye çevrilir.
#  - Canavarlar: The Witcher Wiki (witcher.fandom.com, CC BY-SA) "The Witcher 3 bestiary" kategorisi, Infobox Bestiary.
# Kullanım: powershell -File scripts/witcher3-data.ps1 -Out witcher3/data.js
param([string]$Out = "witcher3/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://witcher.fandom.com/api.php"
$SRC = "https://raw.githubusercontent.com/witcher3map/witcher3map/master/assets"

function Raw([string]$path) {
  $file = Join-Path $CACHE ("w3map-" + ($path -replace '[\\/]', '-'))
  if (-not (Test-Path $file)) {
    foreach ($try in 1..4) { & curl.exe -s -f -m 60 -o $file "$SRC/$path"; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep 3 }
    if ($LASTEXITCODE -ne 0) { Remove-Item $file -ErrorAction SilentlyContinue; throw "İndirilemedi: $path" }
  }
  [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
}

# ---------------------------------------------------------------- Dil dosyaları ve $.t(...) çözümleyici
$locales = @{}
# ConvertFrom-Json büyük-küçük harf farklı aynı anahtarları ("WildKingdom" / "wildkingdom") kabul etmez; JavaScriptSerializer eder.
Add-Type -AssemblyName System.Web.Extensions
$SER = New-Object Web.Script.Serialization.JavaScriptSerializer
$SER.MaxJsonLength = 50MB
foreach ($ns in "general", "k", "s", "t", "v", "w") { $locales[$ns] = $SER.DeserializeObject((Raw "locales/en/$ns.json")) }
function Lookup([string]$key, [string]$ns) {
  if ($key -match '^(\w+):(.+)$') { $ns = $Matches[1]; $key = $Matches[2] }
  foreach ($space in @($ns, "general")) {
    $node = $locales[$space]
    foreach ($part in $key -split '\.') { if ($node -isnot [Collections.IDictionary] -or -not $node.ContainsKey($part)) { $node = $null; break }; $node = $node[$part] }
    if ($node -is [string]) { return $node }
  }
  ""
}
# Basit bir ifade çözümleyici: "metin" + $.t("anahtar", {ad: ifade}) + 'metin' …
function Eval-Expr([string]$s, [string]$ns) {
  $script:pos = 0; $script:expr = $s
  $v = Parse-Sum $ns
  $v
}
function Skip { while ($script:pos -lt $script:expr.Length -and $script:expr[$script:pos] -match '\s') { $script:pos++ } }
function Parse-Sum($ns) {
  $out = Parse-Term $ns
  while ($true) {
    Skip
    if ($script:pos -lt $script:expr.Length -and $script:expr[$script:pos] -eq '+') { $script:pos++; $out += Parse-Term $ns } else { break }
  }
  $out
}
function Parse-String {
  $q = $script:expr[$script:pos]; $script:pos++
  $sb = New-Object Text.StringBuilder
  while ($script:pos -lt $script:expr.Length -and $script:expr[$script:pos] -ne $q) {
    if ($script:expr[$script:pos] -eq '\') { $script:pos++ }
    [void]$sb.Append($script:expr[$script:pos]); $script:pos++
  }
  $script:pos++
  $sb.ToString()
}
function Parse-Term($ns) {
  Skip
  if ($script:pos -ge $script:expr.Length) { return "" }
  $c = $script:expr[$script:pos]
  if ($c -eq '"' -or $c -eq "'") { return Parse-String }
  if ($script:expr.Substring($script:pos) -match '^\$\.t\(') {
    $script:pos += 4; Skip
    $key = Parse-String
    $vars = @{}
    Skip
    if ($script:expr[$script:pos] -eq ',') {
      $script:pos++; Skip
      if ($script:expr[$script:pos] -eq '{') {
        $script:pos++
        while ($true) {
          Skip
          if ($script:expr[$script:pos] -eq '}') { $script:pos++; break }
          $m = [regex]::Match($script:expr.Substring($script:pos), '^(\w+)\s*:')
          if (-not $m.Success) { break }
          $script:pos += $m.Length
          $vars[$m.Groups[1].Value] = Parse-Sum $ns
          Skip
          if ($script:expr[$script:pos] -eq ',') { $script:pos++ }
        }
      }
      Skip
    }
    if ($script:expr[$script:pos] -eq ')') { $script:pos++ }
    $text = Lookup $key $ns
    foreach ($k in $vars.Keys) { $text = $text.Replace("__$($k)__", $vars[$k]) }
    return $text
  }
  # Tanınmayan parça: satır sonuna kadar atla.
  $script:pos = $script:expr.Length
  ""
}
function Clean([string]$t) { ((($t -replace '<br\s*/?>', ' ') -replace '<[^>]+>', '') -replace '\s+', ' ').Trim() }

# ---------------------------------------------------------------- Harita işaretleri
# Bölgeler: dil ad alanı, koordinat sistemi ve birleştirilmiş resmin kapsadığı alan (yakınlaştırma 4, 256 piksel karo).
$MAPINFO = [ordered]@{
  white_orchard = @{ ns = "w"; crs = "merc"; cols = 10; rows = 8; rowOffset = 8 }
  velen         = @{ ns = "v"; crs = "simple"; latMax = 256; lngMax = 224 }
  skellige      = @{ ns = "s"; crs = "merc"; cols = 15; rows = 15; rowOffset = 1 }
  kaer_morhen   = @{ ns = "k"; crs = "simple"; latMax = 160; lngMax = 128 }
  toussaint     = @{ ns = "t"; crs = "simple"; latMax = 144; lngMax = 144 }
}
function Project($r, [double]$lat, [double]$lng) {
  if ($r.crs -eq "simple") { return @(($lng / $r.lngMax * 100), ((1 - $lat / $r.latMax) * 100)) }
  $world = 4096
  $px = ($lng + 180) / 360 * $world
  $rad = $lat * [Math]::PI / 180
  $py = (1 - [Math]::Log([Math]::Tan([Math]::PI / 4 + $rad / 2)) / [Math]::PI) / 2 * $world
  @(($px / ($r.cols * 256) * 100), (($py - $r.rowOffset * 256) / ($r.rows * 256) * 100))
}

$regions = @()
foreach ($name in $MAPINFO.Keys) {
  $r = $MAPINFO[$name]
  $js = Raw "scripts/custom/mapdata-$name.js"
  # Kategori başlangıçları: "\tmonsternest: [{"
  $cats = [regex]::Matches($js, '(?m)^\t(\w+):\s*\[')
  $markers = @()
  for ($i = 0; $i -lt $cats.Count; $i++) {
    $cat = $cats[$i].Groups[1].Value
    $end = if ($i + 1 -lt $cats.Count) { $cats[$i + 1].Index } else { $js.Length }
    $body = $js.Substring($cats[$i].Index, $end - $cats[$i].Index)
    # Her işaret grubu: coords: [...], label: …, popup: …
    foreach ($m in [regex]::Matches($body, '(?s)coords\s*:\s*\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*,\s*\n(.*?)(?=\n\s*\}\s*(?:,|\]))')) {
      $coords = @([regex]::Matches(($m.Groups[1].Value -replace '//[^\n]*', ''), '\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]') | ForEach-Object { , @([double]$_.Groups[1].Value, [double]$_.Groups[2].Value) })
      $props = @{}
      foreach ($line in ($m.Groups[2].Value -split '\n')) {
        if ($line -match '^\s*(label|popup|popupTitle)\s*:\s*(.*?),?\s*$') { $props[$Matches[1]] = Clean (Eval-Expr $Matches[2] $r.ns) }
      }
      foreach ($c in $coords) {
        $xy = Project $r $c[0] $c[1]
        if ($xy[0] -lt 0 -or $xy[0] -gt 100 -or $xy[1] -lt 0 -or $xy[1] -gt 100) { continue }
        $markers += [ordered]@{ c = $cat; x = [Math]::Round($xy[0], 2); y = [Math]::Round($xy[1], 2); l = $props["label"]; d = $(if ($props["popup"]) { $props["popup"] } else { $props["popupTitle"] }) }
      }
    }
  }
  $title = Lookup "maps.$name" "general"
  $regions += [ordered]@{ id = $name; name = $title; image = "maps/$name.jpg"; width = $(if ($r.crs -eq "simple") { $r.lngMax * 16 } else { $r.cols * 256 }); height = $(if ($r.crs -eq "simple") { $r.latMax * 16 } else { $r.rows * 256 }); markers = $markers }
  Write-Host ("  {0}: {1} işaret" -f $title, $markers.Count)
}
$categoryNames = [ordered]@{}
foreach ($k in $locales["general"]["sidebar"].Keys) { $categoryNames[$k] = $locales["general"]["sidebar"][$k] }

# ---------------------------------------------------------------- Canavarlar
Write-Host "Canavarlar…"
$CLASSES = "Beast", "Cursed One", "Draconid", "Elementa", "Hybrid", "Insectoid", "Necrophage", "Ogroid", "Relict", "Specter", "Vampire"
$titles = @(Category-Members "The Witcher 3 bestiary" | Where-Object { $_ -notin $CLASSES -and $_ -notmatch '^(The Witcher 3|Ghost$|Cat \(creature\)|Chicken|Cow|Dog|Goat|Frog|Crab|Deer|Horse|Pig|Rabbit|Sheep|Goose|Hare|Fox|Seagull|Rooster|Wild boar$|Bear$|Wolf$)' })
$texts = Get-Wikitext $titles
$monsters = @()
foreach ($t in ($titles | Sort-Object)) {
  $w = $texts[$t]
  if (-not $w) { continue }
  # Önce Witcher 3 bölümündeki bilgi kutusu; sayfa yalnız Witcher 3 için ise ilk bilgi kutusu.
  $sec = if ($w -match '(?s)==\s*\{\{tw3\}\}\s*==(.*?)(?=\n==[^=]|$)') { $Matches[1] } else { $w }
  $box = (Get-Templates $sec "Infobox Bestiary") | Select-Object -First 1
  if (-not $box) { continue }
  $list = { param($v) @((($v -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1') -split '<br\s*/?>|\n|,') | ForEach-Object { (($_ -replace '<[^>]+>', '') -replace "'{2,}", '' -replace '^\s*\*\s*', '').Trim() } | Where-Object { $_ -and $_ -notmatch ':$' }) }
  # Savaş taktikleri: paragraflar (virgülle bölünmez), dosya bağlantıları ve şablonlar atılır.
  $tactics = @()
  if ($sec -match '(?s)===\s*Combat tactics\s*===(.*?)(?=\n==|$)') {
    $tactics = @(($Matches[1] -replace '\[\[File:[^\]]*\]\]', '' -replace '\{\{[^{}]*\}\}', '' -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1' -replace "'{2,}", '' -replace '<[^>]+>', '') -split '\n' | ForEach-Object { ($_ -replace '^\s*[*:]+\s*', '').Trim() } | Where-Object { $_.Length -gt 20 } | Select-Object -First 6)
  }
  # Sınıf adı tekile çevrilir ("Vampires" → "Vampire").
  $cls = (& $list $box["class"]) | Select-Object -First 1
  $alias = @{ "Vampires" = "Vampire"; "Ogroids" = "Ogroid"; "Beasts" = "Beast"; "Cursed one" = "Cursed One" }
  if ($cls -and $alias[$cls]) { $cls = $alias[$cls] }
  $monsters += [ordered]@{
    id      = ($t.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    name    = $(if ($box["name"]) { ($box["name"] -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1').Trim() } else { $t })
    page    = $t
    class   = $cls
    weak    = @((& $list $box["susceptibility"]) | ForEach-Object { $_ -replace ' sign$', '' } | Select-Object -Unique)
    where   = (($box["occurrence"] -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1' -replace '<br\s*/?>', ', ' -replace '<[^>]+>', '') -replace '\s+', ' ').Trim()
    image   = (FileName $box["image"])
    tactics = $tactics
  }
}
$imgs = Get-ImageUrls @($monsters | ForEach-Object { $_.image } | Where-Object { $_ })
foreach ($m in $monsters) { $m.image = $(if ($m.image) { $imgs[($m.image -replace '_', ' ')] } else { $null }); $m.Remove("page") }

$data = [ordered]@{ categories = $categoryNames; regions = $regions; monsters = @($monsters | Where-Object { $_.weak.Count -or $_.class }) }
$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// The Witcher 3 verisi: scripts/witcher3-data.ps1 ile witcher3map (CC BY-NC-SA) ve The Witcher Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const W3 = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Bölge: {0}, işaret: {1}, canavar: {2}; zayıflığı yazılmamış canavar: {3}" -f $regions.Count, (($regions | ForEach-Object { $_.markers.Count }) | Measure-Object -Sum).Sum, $data.monsters.Count, (@($data.monsters | Where-Object { -not $_.weak.Count } | ForEach-Object { $_.name }) -join ","))
