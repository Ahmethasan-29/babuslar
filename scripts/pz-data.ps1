# Project Zomboid verisini toplar ve pz/data.js dosyasını yazar.
# Kaynaklar:
# - PZwiki (pzwiki.net, CC BY-SA): "Occupation" ve "Trait" tabloları, "Weapon" ve "Firearm" silah tabloları,
#   "Knox Country" sayfasındaki kasabalar ve kasaba sayfalarındaki Infobox region (coordinates = oyun içi kare koordinatı).
# - Oyunun resmî çevirileri (TheIndieStone/ProjectZomboidTranslations): meslek, özellik, beceri ve eşya adlarının Türkçesi.
# Kullanım: powershell -File scripts/pz-data.ps1 -Out pz/data.js
param([string]$Out = "pz/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
. (Join-Path $PSScriptRoot "wikitable-lib.ps1")
$API = "https://pzwiki.net/w/api.php"
$TRANS = "https://raw.githubusercontent.com/TheIndieStone/ProjectZomboidTranslations/HEAD"

function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', '' -replace '(?s)<ref[^>]*>.*?</ref>', ''
  $t = $t -replace '\{\{\s*ll\s*\|[^|}]*\|([^}]*)\}\}', '$1' -replace '\{\{\s*ll\s*\|([^}]*)\}\}', '$1'
  $t = $t -replace '\{\{\s*Tooltip\s*\|([^|}]*)\|[^}]*\}\}', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', "`n" -replace '<[^>]+>', '' -replace '&times;', '×' -replace '&nbsp;|&hairsp;', ' ' -replace '&amp;', '&'
  (($t -split "`n" | ForEach-Object { ($_ -replace '[ \t]+', ' ').Trim() } | Where-Object { $_ }) -join "`n")
}
function FirstFile([string]$t) { if ($t -match '\[\[File:([^\]|]+)') { $Matches[1].Trim() } }
function Num([string]$t) { $x = (Plain $t) -replace '[×%]', '' -replace ',', '.'; if ($x -match '^-?\d+(\.\d+)?$') { [double]$x } else { $null } }
function Page([string]$title) { ([string](Get-Wikitext @($title))[$title]) }
function Cells($table, $row) { $h = @{}; for ($i = 0; $i -lt $table.columns.Count; $i++) { $h[$table.columns[$i]] = $(if ($i -lt $row.Count) { $row[$i] } else { "" }) }; $h }

# --- Resmî çeviriler -----------------------------------------------------------------------------------------
function Get-Strings([string]$path) {
  $map = @{}
  & curl.exe -s -L -m 60 -o $TMP "$TRANS/$path"
  foreach ($line in [IO.File]::ReadAllLines($TMP, [Text.Encoding]::UTF8)) {
    if ($line -match '^\s*([A-Za-z0-9_.\-]+)\s*=\s*"(.*)",?\s*$') { $map[$Matches[1].ToLowerInvariant()] = $Matches[2] }
  }
  $map
}
$enUI = Get-Strings "EN/UI_EN.txt"; $trUI = Get-Strings "TR/UI_TR.txt"
$enIG = Get-Strings "EN/IG_UI_EN.txt"; $trIG = Get-Strings "TR/IG_UI_TR.txt"
$trItems = Get-Strings "TR/ItemName_TR.txt"
# İngilizce ad → anahtar (ör. "Burger Flipper" → ui_prof_burgerflipper)
function KeyOf($en, [string]$prefix, [string]$name) {
  foreach ($kv in $en.GetEnumerator()) { if ($kv.Key.StartsWith($prefix) -and -not $kv.Key.EndsWith("desc") -and $kv.Value -ieq $name) { return $kv.Key } }
  $null
}
function Tr($tr, [string]$key) { if ($key -and $tr[$key]) { $tr[$key] } else { $null } }

# --- Meslekler -----------------------------------------------------------------------------------------------
$occ = @()
$t = (Get-WikiTables (Page "Occupation")) | Where-Object { $_.section -eq "List of occupations" } | Select-Object -First 1
foreach ($r in $t.rows) {
  $c = Cells $t $r
  $name = (Plain $c["Occupation"]) -replace '\n', ' '
  $key = KeyOf $enUI "ui_prof_" $name
  $skills = @((Plain $c["Skills"]) -split "`n" | Where-Object { $_ -match '^\+(\d+)\s+(.+)$' } | ForEach-Object {
      $n = [int]$Matches[1]; $sk = $Matches[2].Trim()
      [ordered]@{ skill = $sk; tr = (Tr $trIG (KeyOf $enIG "igui_perks_" $sk)); n = $n }
    })
  $occ += [ordered]@{
    name   = $name
    tr     = (Tr $trUI $key)
    icon   = (FirstFile $c["Occupation"])
    points = (Num $c["Starting points"])
    skills = $skills
    traits = @((Plain $c["Traits"]) -split "`n" | Where-Object { $_ -and $_ -ne "-" })
    desc   = $(if ((Plain $c["In-game description"]) -ne "-") { Plain $c["In-game description"] } else { "" })
    descTr = (Tr $trUI $(if ($key) { "${key}desc" }))
  }
}

# --- Özellikler ----------------------------------------------------------------------------------------------
$traits = @()
foreach ($t in ((Get-WikiTables (Page "Trait")) | Where-Object { $_.section -in "Positives", "Negatives", "Occupation exclusive traits" })) {
  foreach ($r in $t.rows) {
    $c = Cells $t $r
    $rawName = $c["Name"]
    $id = $(if ($rawName -match 'id\s*=\s*"trait([A-Za-z0-9]+)"') { $Matches[1] } else { $null })
    $name = (Plain ($rawName -replace '^.*?id\s*=\s*"[^"]*"\s*\|', '')) -replace '\n', ' '
    $key = $(if ($id -and $enUI.ContainsKey("ui_trait_$($id.ToLowerInvariant())")) { "ui_trait_$($id.ToLowerInvariant())" } else { KeyOf $enUI "ui_trait_" $name })
    $traits += [ordered]@{
      name   = $name
      tr     = (Tr $trUI $key)
      icon   = (FirstFile $r[0])
      points = $(if ($t.section -eq "Occupation exclusive traits") { $null } else { Num $c["Points"] })
      kind   = @{ "Positives" = "positive"; "Negatives" = "negative"; "Occupation exclusive traits" = "occupation" }[$t.section]
      occ    = $(if ($c["Occupation"]) { (Plain $c["Occupation"]) -replace '\n', ', ' } else { $null })
      desc   = (Plain $c["Description"])
      descTr = (Tr $trUI $(if ($key) { "${key}desc" }))
      effect = (Plain $(if ($c.ContainsKey("Effects")) { $c["Effects"] } else { $c["Effect"] }))
    }
  }
}

# --- Silahlar ------------------------------------------------------------------------------------------------
$weapons = @()
function ItemTr([string]$id) { if ($id) { Tr $trItems ("itemname_" + $id.ToLowerInvariant()) } }
foreach ($t in (Get-WikiTables (Page "Weapon"))) {
  if (-not ($t.columns -contains "Name")) { continue }
  foreach ($r in $t.rows) {
    $c = Cells $t $r
    $id = Plain $c["Item ID"]
    $weapons += [ordered]@{
      name   = (Plain $c["Name"]) -replace '\n', ' '
      tr     = (ItemTr $id)
      icon   = (FirstFile $c["Icon"])
      cat    = $t.section
      hands  = (Plain $c["Equipped"]) -replace '\*', ''
      weight = (Num $c["Encumbrance"])
      dmg    = @((Num $c["Damage: Minimum damage"]), (Num $c["Damage: Maximum damage"]))
      range  = (Num $c["Range: Maximum range"])
      speed  = (Num $c["Attack speed"])
      crit   = (Num $c["Crit: Critical hit chance"])
      cond   = (Num $c["Condition: Max condition"])
      door   = (Num $c["Damage: Door damage"])
      tree   = (Num $c["Damage: Tree damage"])
      id     = $id
    }
  }
}
foreach ($t in (Get-WikiTables (Page "Firearm"))) {
  if (-not ($t.columns -contains "Name")) { continue }
  foreach ($r in $t.rows) {
    $c = Cells $t $r
    $id = Plain $c["Item ID"]
    $weapons += [ordered]@{
      name   = (Plain $c["Name"]) -replace '\n', ' '
      tr     = (ItemTr $id)
      icon   = (FirstFile $c["Icon"])
      cat    = $t.section
      hands  = (Plain $c["Equipped"]) -replace '\*', ''
      weight = (Num $c["Encumbrance"])
      dmg    = @((Num $c["Damage: Minimum damage"]), (Num $c["Damage: Maximum damage"]))
      range  = (Num $c["Range: Maximum range"])
      crit   = (Num $c["Critical hit chance"])
      ammo   = (Plain $c["Ammunition"]) -replace '\n', ' '
      cap    = (Plain $c["Magazine capacity"])
      noise  = (Num $c["Noise radius"])
      acc    = (Num $c["Accuracy"])
      id     = $id
    }
  }
}

# --- Kasabalar -----------------------------------------------------------------------------------------------
$knox = Page "Knox Country"
$townNames = @([regex]::Matches($knox, '\{\{Main\|([^}|]+)\}\}') | ForEach-Object { $_.Groups[1].Value.Trim() } | Select-Object -Unique)
$townText = Get-Wikitext $townNames
$towns = @()
foreach ($n in $townNames) {
  $wt = [string]$townText[$n]
  $box = (Get-Templates $wt "Infobox region") | Select-Object -First 1
  if (-not $box -or $box["coordinates"] -notmatch '(\d+)\s*[x×,]\s*(\d+)') { continue }
  # $Matches sonraki -match çağrılarında değişir: koordinat hemen alınır.
  $cx = [int]$Matches[1]; $cy = [int]$Matches[2]
  $quote = (Get-Templates $wt "Quote") | Select-Object -First 1
  $intro = ($wt -replace '(?s)\{\{[^{}]*\}\}', '' -replace '(?s)\{\{[^{}]*\}\}', '' -split "`n" | Where-Object { $_ -match "^'''" } | Select-Object -First 1)
  $towns += [ordered]@{
    name  = $n
    x     = $cx; y = $cy
    type  = Plain $box["type"]
    pop   = Plain $box["pop"]
    image = $(if ($box["image"]) { $box["image"].Trim() } else { $null })
    map   = $(if ($box["map"]) { $box["map"].Trim() } else { $null })
    quote = $(if ($quote) { Plain $quote["text"] } else { "" })
    intro = Plain $intro
  }
}

# --- Resimler ------------------------------------------------------------------------------------------------
$files = @($occ | ForEach-Object { $_.icon }) + @($traits | ForEach-Object { $_.icon }) + @($weapons | ForEach-Object { $_.icon }) + @($towns | ForEach-Object { $_.image; $_.map })
$imgs = Get-ImageUrls @($files | Where-Object { $_ })
function U($f) { if ($f) { $imgs[($f -replace '_', ' ')] } }
foreach ($x in $occ) { $x.icon = U $x.icon }
foreach ($x in $traits) { $x.icon = U $x.icon }
foreach ($x in $weapons) { $x.icon = U $x.icon }
foreach ($x in $towns) { $x.image = U $x.image; $x.map = U $x.map }

$data = [ordered]@{ occupations = $occ; traits = $traits; weapons = $weapons; towns = $towns }
$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// Project Zomboid verisi: scripts/pz-data.ps1 ile PZwiki'den (CC BY-SA) ve oyunun resmî çevirilerinden oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const PZ = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Meslek: {0} (TR: {1}), özellik: {2} (TR: {3}), silah: {4} (TR: {5}), kasaba: {6} ({7})" -f $occ.Count, @($occ | Where-Object { $_.tr }).Count, `
    $traits.Count, @($traits | Where-Object { $_.descTr }).Count, $weapons.Count, @($weapons | Where-Object { $_.tr }).Count, $towns.Count, (($towns | ForEach-Object { $_.name }) -join ", "))
