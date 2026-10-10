# Darkest Dungeon (1) verisini toplar ve dd/1/data.js dosyasını yazar.
# Kaynak: Darkest Dungeon Wiki (darkestdungeon.wiki.gg, CC BY-SA). Kahramanlar, beceriler, trinket'lar, bosslar ve eşyalar
# wikinin şablonlarından (CharacterInfobox, Heroability, CampSkills, TrinketInfobox, EnemyInfobox, monsterabilities) okunur.
# Kullanım: powershell -File scripts/dd-data.ps1 -Out dd/1/data.js
param([string]$Out = "dd/1/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")

# ---------------------------------------------------------------- Kahramanlar
Write-Host "Kahramanlar…"
$heroTitles = Category-Members "Heroes" | Where-Object { $_ -match '\(Darkest Dungeon\)$' -and $_ -notmatch '^Heroes ' }
$heroText = Get-Wikitext $heroTitles
$heroIntro = Get-Extracts $heroTitles

$toExpand = New-Object Collections.ArrayList
function Queue([string]$t) { [void]$toExpand.Add([string]$t); $toExpand.Count - 1 }

$heroes = @()
foreach ($title in $heroTitles) {
  $w = $heroText[$title]
  if (-not $w) { continue }
  $info = (Get-Templates $w "CharacterInfobox")[0]
  if (-not $info) { continue }
  $skills = @()
  foreach ($s in (Get-Templates $w "Heroability")) {
    $levels = @()
    foreach ($lv in 1..5) {
      $sfx = if ($lv -eq 1) { "" } else { "lv$lv" }
      $levels += [ordered]@{
        value    = $s["value$sfx"]
        accuracy = $s["accuracy$sfx"]
        crit     = $s["crit$sfx"]
        effect   = Queue $s["effect$sfx"]
        self     = Queue $s["self$sfx"]
      }
    }
    $skills += [ordered]@{
      name = $s["name"]; icon = $s["image"]; kind = $s["heal"]; range = $s["range"]; rank = $s["rank"]; target = $s["target"]; limit = $s["limit"]
      levels = $levels
    }
  }
  $camp = @()
  $cs = (Get-Templates $w "CampSkills")[0]
  if ($cs) {
    foreach ($i in 1..8) {
      if (-not $cs["name$i"]) { continue }
      $camp += [ordered]@{ name = $cs["name$i"]; icon = $cs["image$i"]; time = $cs["timecost$i"]; target = Queue $cs["target$i"]; description = Queue $cs["description$i"] }
    }
  }
  # Oyunun kendi tanıtım metinleri: Ata'nın sözü (kahraman kartı) ve Lonca'nın savaş tarzı açıklaması.
  $quotes = Get-Templates $w "quote"
  $ancestor = ($quotes | Where-Object { $_["2"] -match 'Ancestor' } | Select-Object -First 1)
  $guild = ($quotes | Where-Object { $_["2"] -match 'Guild' } | Select-Object -First 1)
  $name = $title -replace ' \(Darkest Dungeon\)$', ''
  $heroes += [ordered]@{
    id = Key $name; name = $name; image = FileName $info["image"]
    intro = $heroIntro[$title]
    quote = (Clean-Html $(if ($ancestor) { $ancestor["1"] }))
    style = (Clean-Html $(if ($guild) { $guild["1"] }))
    religious = $info["religious"] -eq "Yes"
    stats = [ordered]@{
      hp = $info["maxhp"]; hpPerRank = $info["maxhpperrank"]; dodge = $info["dodge"]; dodgePerRank = $info["dodgeperrank"]; prot = $info["protection"]
      spd = $info["speed"]; acc = $info["accuracy"]; crit = $info["criticalhit"]; dmg = $info["damage"]
    }
    res = [ordered]@{ stun = $info["stun"]; blight = $info["blight"]; disease = $info["disease"]; deathblow = $info["deathblow"]; move = $info["mov"]; bleed = $info["bleed"]; debuff = $info["debuff"]; trap = $info["trap"] }
    critBonus = $info["critbonus"]
    skills = $skills; camp = $camp
  }
}

# ---------------------------------------------------------------- Trinket'lar
Write-Host "Trinket'lar…"
$tplList = Get-Json "$API`?action=query&list=allpages&apnamespace=10&apprefix=Trinkets/&aplimit=500&format=json"
$tplTitles = @($tplList.query.allpages | ForEach-Object { $_.title } | Where-Object { $_ -match '^Template:Trinkets/(Hero|CC|CoM|Unique|FE)/' })
# Sınıfsız (genel) trinket'lar Trinkets sayfasında doğrudan yazılıdır.
$tplText = Get-Wikitext (@($tplTitles) + "Trinkets (Darkest Dungeon)")
$SOURCES = @{ Hero = "base"; CC = "crimson"; CoM = "color"; Unique = "trophy"; FE = "farmstead"; Page = "base" }
$trinkets = @()
$seenTrinket = @{}
foreach ($t in @($tplTitles) + "Trinkets (Darkest Dungeon)") {
  $src = if ($t -match '^Template:Trinkets/([^/]+)/') { $Matches[1] } else { "Page" }
  $w = $tplText[$t]
  if (-not $w) { continue }
  $w = $w -replace '(?s)<noinclude>.*?</noinclude>', ''
  foreach ($ti in (Get-Templates $w "TrinketInfobox")) {
    $nm = ($ti["name"] -replace "'{2,}", '').Trim()
    if (-not $nm -or $seenTrinket[$nm]) { continue }
    $seenTrinket[$nm] = $true
    $trinkets += [ordered]@{
      name = $nm; image = FileName $ti["image"]; rarity = $ti["rarity"]; class = $ti["class"]; area = $ti["area"]; set = $SOURCES[$src]
      effect = Queue $ti["effect"]; notes = Queue $ti["notes"]
    }
  }
}

# ---------------------------------------------------------------- Bosslar
Write-Host "Bosslar…"
$bossTitles = Category-Members "Bosses" | Where-Object { $_ -notmatch '^Bosses ' }
$bossText = Get-Wikitext $bossTitles
$bossIntro = Get-Extracts $bossTitles
$bosses = @()
foreach ($title in $bossTitles) {
  $w = $bossText[$title]
  if (-not $w) { continue }
  $info = (Get-Templates $w "EnemyInfobox")[0]
  if (-not $info) { $info = (Get-Templates $w "EnemyInfobox2")[0] }
  if (-not $info) { $info = (Get-Templates $w "DD_EnemyInfobox")[0] }
  if (-not $info) { continue }
  # Bazı sayfalarda yalnızca ilk seviyenin değerleri yazılıdır (dodgeA…); diğer seviyeler onu kullanır. Dirençler "stun" ya da "stunA".
  function BossStat([string]$k, [string]$v) { $x = $info["$k$v"]; if (-not $x) { $x = $info["${k}A"] }; if ($x) { ($x -replace '%', '').Trim() } }
  function BossRes([string]$k) { $x = $info[$k]; if (-not $x) { $x = $info["${k}A"] }; if ($x) { ($x -replace '%', '').Trim() } }
  $variants = @()
  foreach ($v in "A", "B", "C") {
    if (-not $info["hp$v"]) { continue }
    $variants += [ordered]@{ name = ((Clean-Html $info["var$v"]) -replace "^.*<br>", ""); hp = $info["hp$v"]; dodge = (BossStat "dodge" $v); prot = (BossStat "protection" $v); spd = (BossStat "speed" $v) }
  }
  $abilities = @()
  foreach ($ma in (Get-Templates $w "monsterabilities")) {
    $list = @()
    foreach ($i in 1..12) {
      if (-not $ma["attack${i}name"]) { continue }
      $list += [ordered]@{
        name = $ma["attack${i}name"]; type = $ma["attack${i}type"]; rank = $ma["attack${i}req"]; target = $ma["attack${i}tar"]
        accuracy = $ma["attack${i}acc"]; crit = $ma["attack${i}crit"]; damage = $ma["attack${i}damage"]
        effect = Queue $ma["attack${i}effect"]; self = Queue $ma["attack${i}self"]
      }
    }
    $abilities += , [ordered]@{ level = $ma["level"]; attacks = $list }
  }
  $name = $title -replace ' \(Darkest Dungeon\)$', ''
  $bosses += [ordered]@{
    id = Key $name; name = $name; image = FileName $info["image"]; type = (Clean-Html $info["enemyclass"]); size = $info["size"]
    intro = $bossIntro[$title]
    variants = $variants
    res = [ordered]@{ stun = (BossRes "stun"); blight = (BossRes "blight"); bleed = (BossRes "bleed"); debuff = (BossRes "debuff"); move = (BossRes "mov") }
    abilities = $abilities
  }
}

# ---------------------------------------------------------------- Eşyalar (erzak ve miras eşyaları)
Write-Host "Eşyalar…"
# Genel sayfalar (Items, Provisions, Heirlooms) ve eşya olmayan Ruby sayfası elenir.
$itemTitles = Category-Members "Items" | Where-Object { $_ -notmatch '^(Items|Heirlooms|Provisions|Ruby)$' }
$heirlooms = Category-Members "Heirlooms"
$itemIntro = Get-Extracts $itemTitles
$itemImages = Get-Json "$API`?action=query&prop=pageimages&piprop=name&pilimit=50&redirects=1&format=json&formatversion=2&titles=$([uri]::EscapeDataString(($itemTitles -join '|')))"
$itemImg = @{}
foreach ($p in $itemImages.query.pages) { if ($p.pageimage) { $itemImg[$p.title] = $p.pageimage } }
$itemText = Get-Wikitext $itemTitles
$items = @($itemTitles | ForEach-Object {
    $w = $itemText[$_]
    $pi = if ($w) { (Get-Templates $w "ProvisionInfobox")[0] } else { $null }
    # "== Use ==" bölümündeki maddeler: eşyanın hangi curio'larda ve ne için kullanıldığı.
    $uses = @()
    if ($w -match '(?s)==\s*Uses?\s*==(.*?)(\n==[^=]|\[\[Category|$)') {
      $uses = @(($Matches[1] -split "`n") | Where-Object { $_ -match '^\*' } | ForEach-Object { [ordered]@{ sub = $_ -match '^\*\*'; text = Queue ($_ -replace '^\*+\s*', '') } })
    }
    [ordered]@{
      id = Key $_; name = $_; image = $(if ($pi -and $pi["image"]) { FileName $pi["image"] } else { $itemImg[$_] })
      kind = if ($heirlooms -contains $_ -or $_ -eq "Blueprint") { "heirloom" } else { "supply" }
      intro = $itemIntro[$_]
      cost = $(if ($pi) { $pi["cost"] }); stack = $(if ($pi) { $pi["stack"] })
      effect = Queue $(if ($pi) { $pi["effect"] }); description = Queue $(if ($pi) { $pi["description"] })
      uses = $uses
    }
  })

# ---------------------------------------------------------------- Şablonları aç, görselleri çöz
Write-Host "Şablonlar açılıyor ($($toExpand.Count))…"
$expanded = Expand-Texts @($toExpand)
function X($i) { if ($null -eq $i) { return "" }; $expanded[$i] }
foreach ($h in $heroes) {
  foreach ($s in $h.skills) { foreach ($l in $s.levels) { $l.effect = X $l.effect; $l.self = X $l.self } }
  foreach ($c in $h.camp) { $c.target = X $c.target; $c.description = X $c.description }
}
foreach ($t in $trinkets) { $t.effect = X $t.effect; $t.notes = X $t.notes }
foreach ($it in $items) { $it.effect = X $it.effect; $it.description = X $it.description; foreach ($u in $it.uses) { $u.text = X $u.text } }
foreach ($b in $bosses) { foreach ($a in $b.abilities) { foreach ($at in $a.attacks) { $at.effect = X $at.effect; $at.self = X $at.self } } }

Write-Host "Görseller…"
# Görsel adresleri doğrudan kurulur: wiki.gg dosyaları /images/Dosya_Adı.png adresindedir (ilk harf büyük, boşluk yerine _).
# Görsel sorgusu (imageinfo) wikinin korumasına sık takıldığı için kullanılmaz; eksik dosyalar sayfada yer tutucuyla gösterilir.
function U($f) {
  if (-not $f) { return $null }
  $n = ($f.Trim() -replace " ", "_")
  $n = $n.Substring(0, 1).ToUpperInvariant() + $n.Substring(1)
  "https://darkestdungeon.wiki.gg/images/" + [uri]::EscapeDataString($n)
}
foreach ($h in $heroes) { $h.image = U $h.image; foreach ($s in $h.skills) { $s.icon = U $s.icon }; foreach ($c in $h.camp) { $c.icon = U $c.icon } }
foreach ($t in $trinkets) { $t.image = U $t.image }
foreach ($b in $bosses) { $b.image = U $b.image }
foreach ($it in $items) { $it.image = U $it.image }

$data = [ordered]@{
  heroes   = @($heroes | Sort-Object { $_.name })
  trinkets = @($trinkets | Sort-Object { $_.name })
  bosses   = @($bosses | Sort-Object { $_.name })
  items    = @($items | Sort-Object { $_.kind }, { $_.name })
}
$json = $data | ConvertTo-Json -Depth 10 -Compress
$header = "// Darkest Dungeon verisi: scripts/dd-data.ps1 ile Darkest Dungeon Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const DKD = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Kahraman: {0}, beceri: {1}, trinket: {2}, boss: {3}, eşya: {4}; görselsiz: kahraman {5}, trinket {6}, boss {7}" -f `
    $heroes.Count, (@($heroes | ForEach-Object { $_.skills }).Count), $trinkets.Count, $bosses.Count, $items.Count, `
    @($heroes | Where-Object { -not $_.image }).Count, @($trinkets | Where-Object { -not $_.image }).Count, @($bosses | Where-Object { -not $_.image }).Count)
