# Darkest Dungeon II verisini toplar ve dd/2/data.js dosyasını yazar.
# Kaynak: Darkest Dungeon Wiki (darkestdungeon.wiki.gg, CC BY-SA). Kahraman ve boss istatistikleri wikinin Cargo tablolarından
# (HeroStats2, EnemyStats2), beceriler HeroSkill2, trinket'lar Trinket, savaş eşyaları CombatItem şablonlarından okunur.
# Kullanım: powershell -File scripts/dd2-data.ps1 -Out dd/2/data.js
param([string]$Out = "dd/2/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")

$toExpand = New-Object Collections.ArrayList
function Queue([string]$t) { [void]$toExpand.Add([string]$t); $toExpand.Count - 1 }

function Cargo([string]$table, [string]$fields, [string]$where) {
  $url = "$API`?action=cargoquery&format=json&limit=500&tables=$table&fields=$([uri]::EscapeDataString($fields))"
  if ($where) { $url += "&where=$([uri]::EscapeDataString($where))" }
  @((Get-Json $url).cargoquery | ForEach-Object { $_.title })
}

# Sayfanın düz metni (tüm bölümler, tablolar hariç); bölüm başlıkları "== Başlık ==" olarak kalır.
function Get-Plain([string[]]$titles) {
  $map = @{}
  foreach ($t in $titles) {
    $r = Get-Json "$API`?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&format=json&formatversion=2&titles=$([uri]::EscapeDataString($t))"
    foreach ($p in $r.query.pages) { $map[$t] = $p.extract }
  }
  $map
}
# Düz metinden tek bir bölümü (başlığa göre) alır.
function Section([string]$text, [string]$pattern) {
  if (-not $text) { return "" }
  if ($text -match "(?s)==\s*($pattern)\s*==\s*\n(.*?)(\n==[^=]|$)") { return ($Matches[2] -replace '\n{2,}', "`n").Trim() }
  ""
}
function Intro([string]$text) { if (-not $text) { return "" }; (($text -split "\n==")[0] -replace '\n{2,}', "`n").Trim() }

# "<span class="item-nameline-dd2">'''Ad'''</span>" gibi satırlardan düz bilgi.
function Strip([string]$t) { ((($t -replace '<[^>]+>', '') -replace "'{2,}", '') -replace '\s+', ' ').Trim() }

# ---------------------------------------------------------------- Kahramanlar
Write-Host "Kahramanlar…"
$heroTitles = @(Category-Members "Heroes (Darkest Dungeon II)" | Where-Object { $_ -match '\(Darkest Dungeon II\)$' -and $_ -notmatch '^Heroes ' })
$heroText = Get-Wikitext $heroTitles
$heroStats = Cargo "HeroStats2" "_pageName,name,hp,speed,stun,move,blight,bleed,burn,disease,debuff,deathblow" ""
$heroInfo = Cargo "HeroStats2Info" "name,article,image,icon" ""

$heroes = @()
foreach ($title in $heroTitles) {
  $w = $heroText[$title]
  if (-not $w) { continue }
  $name = $title -replace ' \(Darkest Dungeon II\)$', ''
  $st = $heroStats | Where-Object { $_.name -eq $name } | Select-Object -First 1
  $inf = $heroInfo | Where-Object { $_.name -eq $name } | Select-Object -First 1
  $quotes = Get-Templates $w "Quote"
  $academic = $quotes | Where-Object { $_["2"] -match 'Academic' } | Select-Object -First 1
  $crossroads = $quotes | Where-Object { $_["2"] -match 'Crossroads' } | Select-Object -First 1
  # Açıklama bölümündeki etiketler: "*FRONT RANK", "*DURABLE"…
  $tags = @()
  if ($w -match '(?s)==\s*Description\s*==(.*?)\n==') { $tags = @(($Matches[1] -split "`n") | Where-Object { $_ -match '^\*\s*[A-Z]' } | ForEach-Object { ($_ -replace '^\*\s*', '').Trim() }) }
  # Yollar (Path): PathSkillsTable başlıkları ve kısa açıklamaları.
  $paths = @()
  $pst = (Get-Templates $w "PathSkillsTable")[0]
  if ($pst) {
    $names = @(); $i = 1
    while ($pst["$i"] -and $pst["$i"] -ne '-') { $names += $pst["$i"].Trim(); $i++ }
    $descs = @()
    $i++
    while ($pst["$i"]) { $descs += $pst["$i"]; $i++ }
    for ($k = 0; $k -lt $names.Count; $k++) {
      $d = if ($k -lt $descs.Count) { $descs[$k] } else { "" }
      $motto = (Get-Templates $d "Quote")[0]
      $text = ($d -replace '\[\[File:[^\]]*\]\]', '' -replace '(?s)\{\{Quote\|.*?\}\}', '' -replace '\{\{-\}\}', '').Trim()
      $paths += [ordered]@{ name = $names[$k]; motto = $(if ($motto) { Strip $motto["1"] } else { "" }); text = Queue $text }
    }
  }
  $skills = @()
  foreach ($s in (Get-Templates $w "HeroSkill2")) {
    $sn = $s["name"]
    $path = if ($sn -match '\(([^)]+)\)\s*$') { $Matches[1] } else { "" }
    $skills += [ordered]@{
      name = ($sn -replace '\s*\([^)]+\)\s*$', ''); path = $path; icon = $s["icon"]; tags = $s["tags"]; rank = $s["rank"]; target = $s["target"]
      damage = $s["damage"]; damageUp = $s["upgraded_damage"]; crit = $s["crit"]; critUp = $s["upgraded_crit"]
      heal = $s["heal"]; healUp = $s["upgraded_heal"]; cooldown = $s["cooldown"]; uses = $s["uses"]
      effect = Queue $s["effect"]; effectUp = Queue $s["upgraded_effect"]; self = Queue $s["self"]; selfUp = Queue $s["upgraded_self"]
    }
  }
  $heroes += [ordered]@{
    id = Key ($name -replace ' \(Darkest Dungeon II\)$', ''); name = $name
    image = $(if ($inf -and $inf.image) { $inf.image } else { $null })
    quote = $(if ($academic) { Clean-Html $academic["1"] } else { "" })
    description = $(if ($crossroads) { Clean-Html $crossroads["1"] } else { "" })
    tags = $tags
    stats = $(if ($st) { [ordered]@{ hp = $st.hp; spd = $st.speed } } else { $null })
    res = $(if ($st) { [ordered]@{ stun = $st.stun; move = $st.move; blight = $st.blight; bleed = $st.bleed; burn = $st.burn; disease = $st.disease; debuff = $st.debuff; deathblow = $st.deathblow } } else { $null })
    paths = $paths; skills = $skills
  }
}

# ---------------------------------------------------------------- Trinket'lar ve savaş eşyaları
# Liste sayfalarında her şablon çağrısının üstündeki başlık, grubun adıdır (kahraman, nadirlik ya da eşya türü).
function Grouped-Templates([string]$page, [string]$prefix) {
  $w = (Get-Wikitext @($page))[$page]
  $out = @(); $heading = ""
  foreach ($line in ($w -split "`n")) {
    if ($line -match '^(=+)\s*(.+?)\s*\1\s*$') { $heading = ($Matches[2] -replace '\[\[File:[^\]]*\]\]', '' -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1' -replace '\{\{[^}]*\}\}', '').Trim(); continue }
    foreach ($m in [regex]::Matches($line, '\{\{\s*(' + $prefix + '[^}|]*)\}\}')) { $out += [ordered]@{ template = "Template:" + $m.Groups[1].Value.Trim(); group = $heading } }
  }
  $out
}
function Parse-ItemTemplate([string]$w, [string]$tplName) {
  $t = (Get-Templates $w $tplName)[0]
  if (-not $t) { return @() }
  $list = @()
  for ($i = 1; $i -lt 40; $i++) {
    if (-not $t["trinket$i"]) { continue }
    $head = $t["trinket$i"]
    $nm = if ($head -match "item-nameline-dd2[^>]*>\s*'''(.+?)'''") { $Matches[1] } else { Strip $head }
    $rarity = if ($head -match 'class="trinket-([a-z]+)-dd2"[^>]*>([^<]+)<') { $Matches[2].Trim() } else { "" }
    $cost = if ($head -match '\{\{(Bauble|Relic)\|(\d+)\}\}') { "$($Matches[2]) $($Matches[1])" } elseif ($head -match "'''(\d+)'''\s*\{\{(Bauble|Relic)") { "$($Matches[1]) $($Matches[2])" } else { "" }
    $stack = if ($head -match 'Stacks (\d+)') { $Matches[1] } else { "" }
    $targets = if ($head -match "item-discardline-dd2[^>]*>\s*'''(\[[^\]]+\])'''") { $Matches[1] } else { "" }
    $list += [ordered]@{ name = (Strip $nm); image = (FileName $t["image$i"]); rarity = $rarity; cost = $cost; stack = $stack; target = $targets; effect = Queue $t["description$i"] }
  }
  $list
}

Write-Host "Trinket'lar…"
$trinketRefs = Grouped-Templates "Trinkets (Darkest Dungeon II)" "Trinkets"
$trinketText = Get-Wikitext @($trinketRefs | ForEach-Object { $_.template })
$trinkets = @()
$seen = @{}
foreach ($ref in $trinketRefs) {
  $w = $trinketText[$ref.template]
  if (-not $w) { continue }
  foreach ($t in (Parse-ItemTemplate $w "Trinket")) {
    if ($seen[$t.name]) { continue }
    $seen[$t.name] = $true
    $t.group = $ref.group
    $trinkets += $t
  }
}

Write-Host "Savaş eşyaları…"
$itemRefs = Grouped-Templates "Combat Items" "Combat"
$itemText = Get-Wikitext @($itemRefs | ForEach-Object { $_.template })
$items = @()
foreach ($ref in $itemRefs) {
  $w = $itemText[$ref.template]
  if (-not $w) { continue }
  foreach ($t in (Parse-ItemTemplate $w "CombatItem")) { $t.group = $ref.group; $items += $t }
}

# ---------------------------------------------------------------- Bosslar
Write-Host "Bosslar…"
$bossTitles = @(Category-Members "Bosses (Darkest Dungeon II)" | Where-Object { $_ -notmatch '^Bosses ' -and $_ -notmatch '/' })
$bossRows = Cargo "EnemyStats2" "_pageName,name,article,image,region,is_boss,hp,speed,death_armor,bleed,blight,burn,stun,move,debuff,size,turns" ""
$bossText = Get-Wikitext $bossTitles
$bossPlain = Get-Plain $bossTitles
$bosses = @()
foreach ($title in $bossTitles) {
  $w = $bossText[$title]
  $name = $title -replace ' \(Darkest Dungeon II\)$', ''
  # Bossun biçimleri (ör. Librarian / Librarian (Ignited)): sayfadaki EnemyStats2/Infoboxes çağrısındaki adlar.
  $forms = @()
  $ib = if ($w) { (Get-Templates $w "EnemyStats2/Infoboxes")[0] } else { $null }
  # Çağrıda biçim etiketleri (Regular, Ignited…) ve satır adları karışık durur; yalnızca istatistik tablosunda olan adlar alınır.
  if ($ib) { foreach ($k in ($ib.Keys | Where-Object { $_ -match '^\d+$' } | Sort-Object { [int]$_ })) { $v = "$($ib[$k])".Trim(); if ($v -and ($bossRows | Where-Object { $_.name -eq $v })) { $forms += $v } } }
  if (-not $forms.Count) { $forms = @($name) }
  $variants = @()
  foreach ($f in $forms) {
    $row = $bossRows | Where-Object { $_.name -eq $f } | Select-Object -First 1
    if (-not $row) { continue }
    $variants += [ordered]@{
      name = $f; image = $row.image; region = $row.region; hp = $row.hp; spd = $row.speed; size = $row.size; turns = $row.turns; deathArmor = $row."death armor"
      res = [ordered]@{ stun = $row.stun; move = $row.move; blight = $row.blight; bleed = $row.bleed; burn = $row.burn; debuff = $row.debuff }
    }
  }
  $quote = if ($w) { (Get-Templates $w "Quote") | Where-Object { $_["2"] -match 'Academic' } | Select-Object -First 1 } else { $null }
  $plain = $bossPlain[$title]
  $behavior = Section $plain 'Overview|Description|Behaviou?r and Skills|Behaviou?r|Mechanics'
  $bosses += [ordered]@{
    id = Key $name; name = $name
    image = $(if ($variants.Count) { $variants[0].image } else { $null })
    region = $(if ($variants.Count) { $variants[0].region } else { "" })
    quote = $(if ($quote) { Clean-Html $quote["1"] } else { "" })
    intro = Intro $plain
    behavior = $behavior
    variants = $variants
  }
}

# ---------------------------------------------------------------- Şablonları aç, görselleri kur
Write-Host "Şablonlar açılıyor ($($toExpand.Count))…"
$expanded = Expand-Texts @($toExpand)
function X($i) { if ($null -eq $i) { return "" }; $expanded[$i] }
foreach ($h in $heroes) {
  foreach ($p in $h.paths) { $p.text = X $p.text }
  foreach ($s in $h.skills) { $s.effect = X $s.effect; $s.effectUp = X $s.effectUp; $s.self = X $s.self; $s.selfUp = X $s.selfUp }
}
foreach ($t in $trinkets) { $t.effect = X $t.effect }
foreach ($t in $items) { $t.effect = X $t.effect }

function U($f) {
  if (-not $f) { return $null }
  $n = ($f.Trim() -replace " ", "_")
  $n = $n.Substring(0, 1).ToUpperInvariant() + $n.Substring(1)
  "https://darkestdungeon.wiki.gg/images/" + [uri]::EscapeDataString($n)
}
foreach ($h in $heroes) { $h.image = U $h.image; foreach ($s in $h.skills) { $s.icon = U $s.icon } }
foreach ($t in $trinkets) { $t.image = U $t.image }
foreach ($t in $items) { $t.image = U $t.image }
foreach ($b in $bosses) { $b.image = U $b.image; foreach ($v in $b.variants) { $v.image = U $v.image } }

$data = [ordered]@{
  heroes   = @($heroes | Sort-Object { $_.name })
  trinkets = $trinkets
  items    = $items
  bosses   = @($bosses | Sort-Object { $_.name })
}
$json = $data | ConvertTo-Json -Depth 10 -Compress
$header = "// Darkest Dungeon II verisi: scripts/dd2-data.ps1 ile Darkest Dungeon Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const DKD2 = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Kahraman: {0}, beceri: {1}, trinket: {2}, savaş eşyası: {3}, boss: {4}; statsız kahraman: {5}, biçimsiz boss: {6}" -f `
    $heroes.Count, (@($heroes | ForEach-Object { $_.skills }).Count), $trinkets.Count, $items.Count, $bosses.Count, `
    @($heroes | Where-Object { -not $_.stats }).Count, @($bosses | Where-Object { -not $_.variants.Count }).Count)
