# Age of Empires I (DE), Age of Empires III (DE) ve Age of Mythology verisi: Age of Empires Wiki'den
# (ageofempires.fandom.com, CC BY-SA) <klasör>/data.js üretir.
#   AOE1 / AOE3: medeniyet sayfaları; AOM: ana tanrı (major god) sayfaları.
#   Her sayfadan: {{Infobox …}} bilgileri, giriş yazısı ve "Characteristics"/"Attributes" altındaki bölümler (bonuslar,
#   özel birlikler, takım bonusu, tanrı gücü…). Metinler İngilizce (wikinin Türkçesi yok).
# Kullanım: powershell -File scripts/aoe-wiki-data.ps1 -Game AOE3   (AOE1, AOE3, AOM)
param([Parameter(Mandatory = $true)][ValidateSet("AOE1", "AOE3", "AOM")][string]$Game)
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://ageofempires.fandom.com/api.php"

$GAMES = @{
  AOE1 = @{ dir = "aoe1"; title = "Age of Empires"; cat = "Civilizations (Age of Empires)"; box = "Infobox civilization"; parent = "Characteristics"
    fields = [ordered]@{ Focus = "Odak"; Arch = "Mimari"; Continent = "Kıta"; Time = "Dönem" } }
  AOE3 = @{ dir = "aoe3"; title = "Age of Empires III"; cat = "Civilizations (Age of Empires III)"; box = "Infobox civilization"; parent = "Characteristics"
    fields = [ordered]@{ Continent = "Kıta"; Features = "Özellikler"; Unit = "Özel birlikler"; Building = "Özel bina"; Royal = "Muhafız birlikleri"; HomeCity = "Ana şehir"; Personality = "Lider"; Revolution = "Devrimler" } }
  AOM  = @{ dir = "aom"; title = "Age of Mythology"; cat = "Major gods"; box = "Infobox god"; parent = "Attributes"
    fields = [ordered]@{ Civilization = "Medeniyet"; Role = "Rolü"; Focus = "Odak"; ClassicalAge = "Klasik Çağ tanrıları"; HeroicAge = "Kahramanlık Çağı tanrıları"; MythicAge = "Efsanevi Çağ tanrıları"; "God power" = "Tanrı gücü"; Technology = "Mit teknolojisi"; Human = "Özel birlik"; Hero = "Kahramanlar" } }
}
$G = $GAMES[$Game]

# Wiki metnini düz yazıya çevirir; simge şablonları ({{3icons|Janissary}}) ada, ipuçları ({{tt|20%|…}}) ilk metne,
# kaynak/saldırı şablonları ({{Resources|gold=+2}}) "+2 gold" biçimine dönüşür.
function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', '' -replace '(?s)<ref[^>]*>.*?</ref>', '' -replace '<ref[^>]*/>', '' -replace '(?s)<gallery>.*?</gallery>', ''
  for ($i = 0; $i -lt 5; $i++) {
    $before = $t
    $t = [regex]::Replace($t, '\{\{\s*tt\s*\|([^{}|]*)(?:\|[^{}]*)?\}\}', '$1')
    $t = [regex]::Replace($t, '\{\{\s*(?:[0-9A-Za-z]*icons|Mtech|Micon|Icon)\s*\|([^{}|]+)(?:\|[^{}]*)?\}\}', '$1')
    $t = [regex]::Replace($t, '\{\{\s*(?:Resources|resources|Attack|attack|Armor|armor)\s*\|([^{}]*)\}\}', {
        param($m)
        (($m.Groups[1].Value -split '\|' | ForEach-Object { if ($_ -match '^\s*([^=]+?)\s*=\s*(.+?)\s*$') { "$($Matches[2]) $($Matches[1].ToLowerInvariant())" } else { $_.Trim() } }) -join ", ")
      })
    if ($t -eq $before) { break }
  }
  # {{tt|*|…}} dipnot işaretleri ("Yoruk*") atılır.
  $t = $t -replace '(?<=[\w\).%])\*', ''
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\[https?://\S+\s+([^\]]+)\]', '$1'
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', "`n" -replace '<[^>]+>', '' -replace '&nbsp;', ' ' -replace '&amp;', '&'
  (($t -split "`n" | ForEach-Object { ($_ -replace '^\s*[\*:#]+\s*', '' -replace '[ \t]+', ' ').Trim() } | Where-Object { $_ }) -join "`n")
}
function FirstFile([string]$t) { if ($t -match '([^\[\]|:=\n<>]+\.(?:png|jpg|jpeg|gif|webp))') { $Matches[1].Trim() } }

# "== Characteristics ==" altındaki "=== Başlık ===" bölümleri → [{ title, items[] }]
function Sections([string]$text, [string]$parent) {
  $out = @()
  $in = $false
  $cur = $null
  foreach ($line in ($text -split "`n")) {
    if ($line -match '^==\s*([^=].*?)\s*==\s*$') {
      if ($cur) { $out += $cur; $cur = $null }
      $in = $Matches[1] -eq $parent
      continue
    }
    if (-not $in) { continue }
    if ($line -match '^===\s*(.+?)\s*===\s*$') {
      if ($cur) { $out += $cur }
      $cur = [ordered]@{ title = Plain $Matches[1]; items = @() }
      continue
    }
    if ($cur -and $line -match '^\s*[\*:]') {
      $item = Plain $line
      if ($item) { $cur.items += $item }
    }
  }
  if ($cur) { $out += $cur }
  @($out | Where-Object { $_.items.Count })
}
# Giriş: kutudan ve alıntıdan sonra, ilk başlıktan önceki paragraf.
function Intro([string]$text) {
  $head = ($text -split '(?m)^==')[0]
  $head = $head -replace '(?s)\{\{(?:[^{}]|\{\{(?:[^{}]|\{\{[^{}]*\}\})*\}\})*\}\}', ''
  (@((Plain $head) -split "`n" | Where-Object { $_.Length -gt 60 }) | Select-Object -First 2) -join "`n"
}

$titles = @(Category-Members $G.cat | Where-Object { $_ -notmatch '^(Category|Template):' })
$texts = Get-Wikitext $titles
$files = @{}
$civs = @()
foreach ($title in $titles) {
  $w = $texts[$title]
  if (-not $w) { continue }
  $box = (Get-Templates $w $G.box)[0]
  if (-not $box) { Write-Warning "Kutu yok: $title"; continue }
  $info = @(foreach ($k in $G.fields.Keys) {
      $v = Plain $box[$k.ToLowerInvariant()]
      if ($v) { [ordered]@{ label = $G.fields[$k]; key = $k; value = $v } }
    })
  $img = FirstFile $box["image"]
  if (-not $img) { $img = FirstFile $box["icon"] }
  if ($img) { $files[$img] = $true }
  $name = if ($box["name"]) { Plain $box["name"] } else { $title -replace '\s*\(.*\)$', '' }
  $civs += [ordered]@{
    id       = Key $title
    name     = $name
    page     = $title
    intro    = Intro $w
    info     = $info
    sections = @(Sections $w $G.parent)
    file     = $img
  }
}
# Aynı tanrının ayrı sayfaları ("Fu Xi" / "Fuxi"): bölümü çok olan kalır.
$norm = { param($s) ($s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD) -replace '[^a-z]', '') }
$civs = @($civs | Group-Object { & $norm $_.name } | ForEach-Object { $_.Group | Sort-Object { -$_.sections.Count } | Select-Object -First 1 })
$urls = Get-ImageUrls @($files.Keys)
foreach ($c in $civs) {
  $u = if ($c.file) { $urls[($c.file -replace '_', ' ')] }
  $c.image = $(if ($u) { "$u/scale-to-width-down/300" })
  $c.Remove("file")
}

$result = [ordered]@{ game = $G.title; civs = @($civs | Sort-Object { $_.name }) } | ConvertTo-Json -Depth 8 -Compress
$result = $result -replace '":\{\}', '":null'
New-Item -ItemType Directory -Force $G.dir | Out-Null
$header = "// $($G.title) verisi: scripts/aoe-wiki-data.ps1 -Game $Game ile Age of Empires Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) "$($G.dir)/data.js"), $header + "const AOEW = " + $result + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("{0}: {1} kayıt, görselsiz {2}" -f $G.title, $civs.Count, @($civs | Where-Object { -not $_.image }).Count)
