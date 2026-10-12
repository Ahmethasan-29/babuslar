# Age of Empires IV verisi: aoe4world/data deposundan (oyun dosyalarından çıkarılmış veri) aoe4/data.js üretir.
#   Medeniyetler: civilizations/*.json (tanıtım, bonuslar, özellikler)
#   Birlikler ve teknolojiler: units/all-unified.json, technologies/all-unified.json (ilk çağdaki değerler)
# Microsoft'un Game Content Usage Rules kurallarına göre ticari olmayan kullanım. Metinler İngilizce (kaynakta Türkçe yok).
# Kullanım: powershell -File scripts/aoe4-data.ps1
param([string]$Out = "aoe4/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture

$RAW = "https://raw.githubusercontent.com/aoe4world/data/main"
function Get-Json([string]$path) {
  $text = (& curl.exe -s -f -L -m 180 "$RAW/$path") -join "`n"
  if ($LASTEXITCODE) { throw "İndirilemedi: $path" }
  $text | ConvertFrom-Json
}
function Clean([string]$s) { if ($s) { ($s -replace '\r', '').Trim() } }
# "archery-range" → "Archery Range"
# Sabit kültürle: bilgisayarın dili Türkçeyse ToTitleCase "i"yi "İ" yapar ("İmperial").
function Pretty([string]$id) { [Globalization.CultureInfo]::InvariantCulture.TextInfo.ToTitleCase(($id -replace '-', ' ')) }
function Cost($c) {
  $o = [ordered]@{}
  if (-not $c) { return $o }
  foreach ($k in @("food", "wood", "gold", "stone", "oliveoil", "vizier")) { if ($c.$k) { $o[$k] = [int]$c.$k } }
  if ($c.popcap) { $o.popcap = [int]$c.popcap }
  if ($c.time) { $o.time = [int]$c.time }
  $o
}

# ---------------------------------------------------------------- Birlikler
$units = @()
foreach ($u in (Get-Json "units/all-unified.json").data) {
  $v = @($u.variations | Sort-Object { $_.age })[0]
  if (-not $v) { continue }
  $w = @($v.weapons | Where-Object { $_.damage })[0]
  $armor = [ordered]@{}
  foreach ($a in @($v.armor)) { if ($a.type -and $a.value) { $armor[$a.type] = $a.value } }
  $units += [ordered]@{
    id       = $u.id
    name     = Clean $u.name
    civs     = @($u.civs)
    unique   = [bool]$u.unique
    classes  = @($u.displayClasses)
    age      = [int]$u.minAge
    ages     = @($u.variations | ForEach-Object { [int]$_.age } | Sort-Object -Unique)
    icon     = $u.icon
    desc     = Clean $u.description
    cost     = Cost $v.costs
    hp       = $v.hitpoints
    armor    = $armor
    weapon   = $(if ($w) { [ordered]@{ name = $w.name; type = $w.type; damage = $w.damage; speed = $w.speed; range = $(if ($w.range.max -gt 1) { $w.range.max }) } })
    speed    = $v.movement.speed
    built    = @($v.producedBy | ForEach-Object { Pretty $_ })
  }
}

# ---------------------------------------------------------------- Teknolojiler
$techs = @()
foreach ($t in (Get-Json "technologies/all-unified.json").data) {
  $v = @($t.variations | Sort-Object { $_.age })[0]
  $techs += [ordered]@{
    id      = $t.id
    name    = Clean $t.name
    civs    = @($t.civs)
    unique  = [bool]$t.unique
    classes = @($t.displayClasses)
    age     = [int]$t.minAge
    icon    = $t.icon
    desc    = Clean $t.description
    cost    = $(if ($v) { Cost $v.costs } else { [ordered]@{} })
    built   = @($(if ($v) { $v.producedBy | ForEach-Object { Pretty $_ } }))
  }
}

# ---------------------------------------------------------------- Medeniyetler
$civs = @()
$index = Get-Json "civilizations/civs-index.json"
foreach ($p in $index.PSObject.Properties) {
  $ci = $p.Value
  $c = Get-Json "civilizations/$($ci.slug).json"
  $bonuses = @()
  $features = @()
  foreach ($o in @($c.overview)) {
    if ($o.list) { $bonuses += @($o.list | ForEach-Object { Clean $_ }) }
    elseif ($o.title -and $o.description) { $features += [ordered]@{ title = Clean $o.title; desc = Clean $o.description } }
  }
  $mine = @($units | Where-Object { $_.unique -and $_.civs -contains $ci.abbr })
  $civs += [ordered]@{
    id        = $ci.abbr
    slug      = $ci.slug
    name      = Clean $c.name
    expansion = @($ci.expansion)
    desc      = Clean $c.description
    classes   = Clean $c.classes
    bonuses   = $bonuses
    features  = $features
    emblem    = $(if ($mine) { $mine[0].icon })
  }
}

$result = [ordered]@{
  civs  = @($civs | Sort-Object { $_.name })
  units = @($units | Sort-Object { $_.age }, { $_.name })
  techs = @($techs | Sort-Object { $_.age }, { $_.name })
} | ConvertTo-Json -Depth 8 -Compress
$result = $result -replace '":\{\}', '":null'
$header = "// Age of Empires IV verisi: scripts/aoe4-data.ps1 ile aoe4world/data'dan (oyun dosyaları) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const AOE4 = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Medeniyet: {0}, birlik: {1}, teknoloji: {2}" -f $civs.Count, $units.Count, $techs.Count)
