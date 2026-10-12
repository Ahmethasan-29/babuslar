# Elden Ring verisi: Elden Ring Fan API'den (eldenring.fanapis.com, deliton/eldenring-api, açık kaynak) eldenring/data.js üretir.
#   bosslar, silahlar, kalkanlar, büyüler (sorcery + incantation), tılsımlar, ruh külleri, savaş külleri, başlangıç sınıfları.
# Kaynak yalnızca ana oyunu kapsar (Shadow of the Erdtree DLC'si yok). Metinler İngilizce (oyunun Türkçesi yok).
# Kullanım: powershell -File scripts/eldenring-data.ps1
param([string]$Out = "eldenring/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture

$API = "https://eldenring.fanapis.com/api"

# Bir kategorinin tüm kayıtları (100'erli sayfalar).
function Get-All([string]$category) {
  $all = @()
  for ($page = 0; $page -lt 20; $page++) {
    $text = (& curl.exe -s -f -L -m 60 "$API/$category`?limit=100&page=$page") -join "`n"
    if ($LASTEXITCODE) { throw "İndirilemedi: $category sayfa $page" }
    $r = $text | ConvertFrom-Json
    $all += @($r.data)
    if ($all.Count -ge $r.total -or -not @($r.data).Count) { break }
  }
  Write-Host "$category`: $($all.Count)"
  # Aynı ad iki kez gelebiliyor; ilki kalır.
  $seen = @{}
  @($all | Where-Object { $_.name -and -not $seen.ContainsKey($_.name) -and ($seen[$_.name] = $true) })
}

# Kaynaktaki yazım hataları.
$REGION_FIX = @{ "Mountaintop of the Giants" = "Mountaintops of the Giants"; "Liunia of the Lakes" = "Liurnia of the Lakes" }
function Clean([string]$s) { if ($s) { ($s -replace '\s+', ' ').Trim() } }
function Key([string]$s) { ($s.ToLowerInvariant() -replace "['']", '' -replace '[^a-z0-9]+', '-').Trim('-') }
# [{ name, amount }] → { name: amount } (sıfırlar atılır)
function Stats($list, [string]$valueKey = "amount") {
  $o = [ordered]@{}
  foreach ($x in @($list)) { if ($x.name -and $x.$valueKey -and $x.$valueKey -ne 0 -and $x.$valueKey -ne "-") { $o[$x.name] = $x.$valueKey } }
  $o
}

$bosses = @(Get-All "bosses" | ForEach-Object {
    $region = Clean $_.region
    if ($REGION_FIX.ContainsKey($region)) { $region = $REGION_FIX[$region] }
    [ordered]@{
      id       = Key $_.name
      name     = Clean $_.name
      region   = $region
      location = Clean $_.location
      hp       = $(if ($_.healthPoints -and $_.healthPoints -notmatch '^\?+$') { Clean $_.healthPoints })
      drops    = @($_.drops | ForEach-Object { Clean $_ } | Where-Object { $_ })
      desc     = Clean $_.description
      image    = $_.image
    }
  } | Sort-Object { $_.region }, { $_.name })

function Armament($w, [string]$kind) {
  # Kaynakta tür bazen boş ya da çoğul ("Small Shields") yazılmış.
  $category = (Clean $w.category) -replace '^Small Shields$', 'Small Shield'
  if (-not $category -and $kind -eq "shield") { $category = if ($w.name -match 'Greatshield') { "Greatshield" } else { "Medium Shield" } }
  [ordered]@{
    id       = Key $w.name
    name     = Clean $w.name
    kind     = $kind
    category = $category
    weight   = $w.weight
    attack   = Stats $w.attack
    guard    = Stats $w.defence
    scaling  = Stats $w.scalesWith "scaling"
    requires = Stats $w.requiredAttributes
    desc     = Clean $w.description
    image    = $w.image
  }
}
$weapons = @(@(Get-All "weapons" | ForEach-Object { Armament $_ "weapon" }) + @(Get-All "shields" | ForEach-Object { Armament $_ "shield" }) | Sort-Object { $_.category }, { $_.name })

$spells = @(@(Get-All "sorceries") + @(Get-All "incantations") | ForEach-Object {
    [ordered]@{
      id       = Key $_.name
      name     = Clean $_.name
      type     = $(if ($_.type -match 'Incant') { "incantation" } else { "sorcery" })
      fp       = $_.cost
      slots    = $_.slots
      requires = Stats $_.requires
      effect   = Clean $_.effects
      desc     = Clean $_.description
      image    = $_.image
    }
  } | Sort-Object { $_.type }, { $_.name })

$talismans = @(Get-All "talismans" | ForEach-Object { [ordered]@{ id = Key $_.name; name = Clean $_.name; effect = Clean $_.effect; desc = Clean $_.description; image = $_.image } } | Sort-Object { $_.name })

$spirits = @(Get-All "spirits" | ForEach-Object {
    [ordered]@{ id = Key $_.name; name = Clean $_.name; fp = $(if ($_.fpCost -and $_.fpCost -ne "0") { $_.fpCost }); hp = $(if ($_.hpCost -and $_.hpCost -ne "0") { $_.hpCost }); effect = Clean $_.effect; desc = Clean $_.description; image = $_.image }
  } | Sort-Object { $_.name })

$ashes = @(Get-All "ashes" | ForEach-Object {
    [ordered]@{ id = Key $_.name; name = (Clean $_.name) -replace '^Ash [Oo]f War:\s*', ''; affinity = Clean $_.affinity; skill = Clean $_.skill; desc = Clean $_.description; image = $_.image }
  } | Sort-Object { $_.name })

# Kaynakta ağ testinden kalma, oyunda olmayan sınıflar da var (Enchanted Knight…); yalnızca oyundaki 10 sınıf alınır.
$REAL_CLASSES = @("Vagabond", "Warrior", "Hero", "Bandit", "Astrologer", "Prophet", "Samurai", "Prisoner", "Confessor", "Wretch")
$classes = @(Get-All "classes" | Where-Object { $REAL_CLASSES -contains $_.name } | ForEach-Object {
    $s = $_.stats
    [ordered]@{
      id    = Key $_.name
      name  = Clean $_.name
      desc  = Clean $_.description
      image = $_.image
      stats = [ordered]@{ level = [int]$s.level; vigor = [int]$s.vigor; mind = [int]$s.mind; endurance = [int]$s.endurance; strength = [int]$s.strength; dexterity = [int]$s.dexterity; intelligence = [int]$s.intelligence; faith = [int]$s.faith; arcane = [int]$s.arcane }
    }
  } | Sort-Object { $_.stats.level })

$data = [ordered]@{ bosses = $bosses; weapons = $weapons; spells = $spells; talismans = $talismans; spirits = $spirits; ashes = $ashes; classes = $classes }
$result = $data | ConvertTo-Json -Depth 8 -Compress
$result = $result -replace '":\{\}', '":null'
$header = "// Elden Ring verisi: scripts/eldenring-data.ps1 ile Elden Ring Fan API'den (eldenring.fanapis.com) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const ER = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Boss: {0}, silah/kalkan: {1}, büyü: {2}, tılsım: {3}, ruh külü: {4}, savaş külü: {5}, sınıf: {6}" -f $bosses.Count, $weapons.Count, $spells.Count, $talismans.Count, $spirits.Count, $ashes.Count, $classes.Count)
