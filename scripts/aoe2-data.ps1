# Age of Empires II: Definitive Edition verisi: SiegeEngineers/aoe2techtree deposundan (MIT) aoe2/data.js üretir.
#   Medeniyetler: ad, bonuslar (oyunun Türkçe/İngilizce metinleri), özel birlik ve teknolojiler.
#   Birlikler ve teknolojiler: medeniyetlerin teknoloji ağaçlarındaki (data/trees/*.json) kayıtlar + data.json'daki değerler.
# Görseller depodan jsDelivr üzerinden. Kullanım: powershell -File scripts/aoe2-data.ps1
param([string]$Out = "aoe2/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture

$REPO = "SiegeEngineers/aoe2techtree"
$RAW = "https://raw.githubusercontent.com/$REPO/master"
$CDN = "https://cdn.jsdelivr.net/gh/$REPO@master/img"

function Get-Json([string]$url) {
  $text = (& curl.exe -s -f -L -m 120 $url) -join "`n"
  if ($LASTEXITCODE) { throw "İndirilemedi: $url" }
  $text | ConvertFrom-Json
}
function Strings([string]$lang) {
  $map = @{}
  foreach ($p in (Get-Json "$RAW/data/locales/$lang/strings.json").PSObject.Properties) { $map[$p.Name] = $p.Value }
  $map
}
$TR = Strings "tr"
$EN = Strings "en"

# Oyun metnini sadeleştirir: <br> satır sonu, diğer etiketler ve ‹cost› gibi yer tutucular atılır.
function Clean([string]$s) {
  if (-not $s) { return $null }
  $s = $s -replace '\s*\(‹[^›]*›\)', '' -replace '‹[^›]*›', ''
  $s = $s -replace '<br\s*/?>', "`n" -replace '<[^>]+>', ''
  (($s -split "`n" | ForEach-Object { $_.Trim() }) -join "`n" -replace "`n{3,}", "`n`n").Trim()
}
function Text($id) {
  $k = [string]$id
  if (-not $id -or -not $EN.ContainsKey($k)) { return $null }
  $textEn = Clean $EN[$k]
  if (-not $textEn) { return $null }
  $textTr = Clean $TR[$k]
  [ordered]@{ tr = $(if ($textTr) { $textTr } else { $textEn }); en = $textEn }
}
# Adlar tek satır ("Elit<br>Yeniçeri" → "Elit Yeniçeri").
function Name($id) {
  $t = Text $id
  if ($t) { foreach ($k in @("tr", "en")) { $t[$k] = $t[$k] -replace '\s*\n+\s*', ' ' } }
  $t
}
# Yardım metninin ilk satırı "Okçu oluştur" gibi bir komuttur; atılır.
function Help($helpId) {
  $t = Text ($helpId - 79000)
  if (-not $t) { return $null }
  foreach ($k in @("tr", "en")) { $t[$k] = (($t[$k] -split "`n" | Select-Object -Skip 1) -join "`n").Trim() }
  if (-not $t.en) { return $null }
  $t
}
function Cost($c) {
  $o = [ordered]@{}
  foreach ($k in @("Food", "Wood", "Gold", "Stone")) { if ($c.$k) { $o[$k.ToLowerInvariant()] = [int]$c.$k } }
  $o
}

$data = Get-Json "$RAW/data/data.json"

$civs = @()
$units = [ordered]@{}
$techs = [ordered]@{}
foreach ($cp in $data.civs.PSObject.Properties) {
  $civ = $cp.Value
  $key = $cp.Name
  $tree = Get-Json "$RAW/data/trees/$($key.ToUpperInvariant()).json"
  # Bina adları ağacın kendi bina listesinden (building_id → ad).
  $bnames = @{}
  foreach ($b in @($tree.buildings)) { $bnames[[string]$b.building_id] = $b.name_string_id }
  $uniqueUnits = @()
  $uniqueTechs = @()
  foreach ($n in @($tree.units_techs)) {
    if ($n.node_status -eq "NotAvailable") { continue }
    $id = [string]$n.node_id
    $bname = if ($bnames.ContainsKey([string]$n.building_id)) { Name $bnames[[string]$n.building_id] } else { $null }
    if ($n.node_type -in @("Unit", "UnitUpgrade", "UniqueUnit", "RegionalUnit")) {
      $u = $data.data.Unit.$id
      if (-not $u) { continue }
      if (-not $units.Contains($id)) {
        $units[$id] = [ordered]@{
          id       = [int]$id
          name     = Name $n.name_string_id
          help     = Help $n.help_string_id
          age      = [int]$n.age_id
          building = $bname
          unique   = $n.node_type -eq "UniqueUnit"
          regional = $n.node_type -eq "RegionalUnit"
          civs     = @()
          cost     = Cost $u.Cost
          hp       = $u.HP
          attack   = $u.Attack
          melee    = $u.MeleeArmor
          pierce   = $u.PierceArmor
          range    = $u.Range
          speed    = $u.Speed
          los      = $u.LineOfSight
          time     = $u.TrainTime
          image    = "$CDN/Unit/$($n.picture_index).png"
        }
      }
      $units[$id].civs += $key
      if ($n.node_type -eq "UniqueUnit") { $uniqueUnits += [int]$id }
    }
    elseif ($n.node_type -in @("Research", "UniqueTech")) {
      $t = $data.data.Tech.$id
      if (-not $techs.Contains($id)) {
        $techs[$id] = [ordered]@{
          id       = [int]$id
          name     = Name $n.name_string_id
          help     = Help $n.help_string_id
          age      = [int]$n.age_id
          building = $bname
          unique   = $n.node_type -eq "UniqueTech"
          civs     = @()
          cost     = $(if ($t) { Cost $t.Cost } else { [ordered]@{} })
          time     = $(if ($t) { $t.ResearchTime })
          image    = "$CDN/Tech/$($n.picture_index).png"
        }
      }
      $techs[$id].civs += $key
      if ($n.node_type -eq "UniqueTech") { $uniqueTechs += [int]$id }
    }
  }
  $civs += [ordered]@{
    id          = $key
    name        = Name $civ.name_string_id
    bonuses     = Text $civ.help_string_id
    era         = $civ.era
    emblem      = "$CDN/Civs/$($key.ToLowerInvariant()).png"
    uniqueUnits = @($uniqueUnits | Sort-Object -Unique)
    uniqueTechs = @($uniqueTechs | Sort-Object -Unique)
  }
  Write-Host "$key"
}
# Yalnızca bir kısım medeniyette olan birlik ve teknolojilerde hangi medeniyetler olduğu tutulur; herkesteyse boş.
$allCivs = $civs.Count
foreach ($x in @($units.Values) + @($techs.Values)) { if ($x.civs.Count -ge $allCivs) { $x.civs = @() } }

$result = [ordered]@{
  ages  = [ordered]@{ "1" = Text 4201; "2" = Text 4202; "3" = Text 4203; "4" = Text 4204 }
  civs  = @($civs | Sort-Object { $_.name.tr })
  units = @($units.Values | Where-Object { $_.name } | Sort-Object { $_.age }, { $_.name.en })
  techs = @($techs.Values | Where-Object { $_.name } | Sort-Object { $_.age }, { $_.name.en })
} | ConvertTo-Json -Depth 8 -Compress
$result = $result -replace '":\{\}', '":null'
$header = "// Age of Empires II: DE verisi: scripts/aoe2-data.ps1 ile SiegeEngineers/aoe2techtree'den (MIT, oyunun Türkçe metinleri) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const AOE2 = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Medeniyet: {0}, birlik: {1}, teknoloji: {2}" -f $civs.Count, $units.Count, $techs.Count)
