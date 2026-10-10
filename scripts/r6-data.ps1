# Rainbow Six Siege verisini toplar ve r6/data.js dosyasını yazar.
# Kaynak: Rainbow Six Wiki (rainbowsix.fandom.com, CC BY-SA). Operatörler "Gameplay Description" bölümündeki
# ekipman tablosundan (Infobox/Loadout ya da tablo), silahlar silah sayfalarının "Siege" bölümündeki Infobox/weapon
# şablonundan, haritalar "Map Layout" galerisi ve "Features" listesinden okunur. Operatör simgeleri marcopixel/r6operators
# (MIT) deposundan gelir. Tanıtım videoları wikideki video dosyalarının YouTube kimlikleridir.
# Kullanım: powershell -File scripts/r6-data.ps1 -Out r6/data.js
param([string]$Out = "r6/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://rainbowsix.fandom.com/api.php"

# Wiki metnini düz yazıya çevirir (bağlantılar, şablonlar, dipnotlar atılır).
function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<ref[^>/]*/>', '' -replace '(?s)<ref[^>]*>.*?</ref>', ''
  $t = $t -replace '(?s)<!--.*?-->', ''
  $t = $t -replace '\{\{\s*Color\s*\|[^|}]*\|([^}]*)\}\}', '$1'
  $t = $t -replace '\{\{\s*[wW]\s*\|[^|}]*\|([^}]*)\}\}', '$1' -replace '\{\{\s*[wW]\s*\|([^}]*)\}\}', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\[https?://\S+\s+([^\]]+)\]', '$1' -replace '\[https?://\S+\]', ''
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', ' ' -replace '<[^>]+>', ''
  $t = $t -replace '&nbsp;', ' ' -replace '&amp;', '&'
  ($t -replace '[ \t]+', ' ').Trim()
}
# Açıklama satırları: paragraflar olduğu gibi, madde işaretli satırlar "• " ile başlar.
function Lines([string]$t) {
  @(($t -split "`n") | ForEach-Object {
      $line = $_.Trim()
      if ($line -match '^[:;]*\*+\s*(.*)$') { $x = Plain $Matches[1]; if ($x) { "• $x" } }
      elseif ($line -match '^(\{\||\|\}|\||!|=)') { }
      else { $x = Plain $line; if ($x) { $x } }
    })
}
function Section([string]$text, [string]$pattern) {
  if ($text -match "(?s)\n==\s*($pattern)\s*==\s*\n(.*?)(?=\n==[^=]|$)") { return $Matches[2] }
  ""
}
# Galeri satırları: "Dosya.png|Açıklama" → dosya + açıklama (uzantısı olmayanlar, yani videolar, atlanır).
function Gallery([string]$t) {
  @(([regex]::Matches($t, '(?s)<gallery[^>]*>(.*?)</gallery>') | ForEach-Object { $_.Groups[1].Value -split "`n" }) | ForEach-Object {
      $line = ($_ -replace '^\s*File:', '').Trim()
      if ($line -match '^([^|]+\.(png|jpe?g|webp|gif))\s*(\|(.*))?$') { [ordered]@{ file = $Matches[1].Trim(); caption = (Plain $Matches[4]) } }
    })
}
function Dots([string]$v) { ([regex]::Matches($v, '&#9679;|●')).Count }
function FirstFile([string]$v) {
  if (-not $v) { return $null }
  if ($v -match '\[\[File:([^\]|]+)') { return $Matches[1].Trim() }
  $f = (($v -replace '(?s)</?gallery[^>]*>', '').Trim() -split "`n")[0]
  ($f -replace '^File:', '' -replace '\|.*$', '').Trim()
}
function Slug([string]$t) { ($t.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', '' -replace 'ø', 'o').ToLowerInvariant() -replace '[^a-z0-9]', '' }

# Ekipman listesi: "*[[R4-C#Siege|R4-C]]<br /><small>Assault Rifle</small>" → ad, tür, sayfa.
function Weapons([string]$v) {
  @(($v -split "`n") | Where-Object { $_ -match '^\s*\*' } | ForEach-Object {
      $line = $_
      $page = $null
      if ($line -match '\[\[([^\]|#]+)(#[^\]|]*)?(\|[^\]]*)?\]\]') { $page = $Matches[1].Trim(); $anchor = $Matches[2] }
      $type = if ($line -match '<small[^>]*>([^<]+)</small>') { $Matches[1].Trim() } else { "" }
      $name = Plain (($line -replace '<small.*$', '') -replace '^\s*\*', '')
      $count = $null
      if ($name -match '^(.*?)\s*[x×]\s*(\d+)\s*$') { $name = $Matches[1].Trim(); $count = [int]$Matches[2] }
      [ordered]@{ name = $name; type = $type; page = $page; count = $count }
    })
}
function Ability([string]$v) {
  if (-not $v) { return $null }
  $name = if ($v -match '\{\{\s*Color\s*\|[^|}]*\|([^}]*)\}\}') { Plain $Matches[1] } else { Plain ($v -replace '<small.*$', '') }
  $count = $null
  if ($name -match '^(.*?)\s*[x×]\s*(\d+)\s*$') { $name = $Matches[1].Trim(); $count = [int]$Matches[2] }
  elseif ($v -match '\}\}\s*[x×]\s*(\d+)') { $count = [int]$Matches[1] }
  $device = if ($v -match '<small[^>]*>([^<]+)</small>') { (Plain $Matches[1]) } else { "" }
  [ordered]@{ name = $name; device = $device; icon = (FirstFile $v); count = $count }
}
# Ekipman: Infobox/Loadout şablonu ya da "|Primary / |Secondary / |Gadget / |Ability" satırlı tablo.
function Loadout([string]$sec) {
  $lo = (Get-Templates $sec "Infobox/Loadout") | Select-Object -First 1
  if ($lo) {
    # Şablonun bittiği yer: iç içe şablonlar ({{Color…}}) sayılarak kapanış "}}" bulunur.
    $rest = ""
    $depth = 0; $i = $sec.IndexOf('Infobox/Loadout') - 2
    for ($j = $i; $j -lt $sec.Length - 1; $j++) {
      $two = $sec.Substring($j, 2)
      if ($two -eq '{{') { $depth++; $j++ } elseif ($two -eq '}}') { $depth--; $j++; if ($depth -eq 0) { $rest = $sec.Substring($j + 1); break } }
    }
    return @{ primary = (Weapons $lo["primary"]); secondary = (Weapons $lo["secondary"]); gadget = (Weapons $lo["gadget"]); ability = (Ability $lo["ability"]); rest = $rest }
  }
  if ($sec -match '(?s)^(.*?)\{\|(.*?)\n\|\}(.*)$') {
    # Tablonun önündeki ve arkasındaki yazı açıklamadır (sekmeli sayfalarda ilk tablo, yani güncel hâl alınır).
    $table = $Matches[2]; $rest = ($Matches[1] -replace '(?s)^.*<tabber>', '') + "`n" + $Matches[3]
    $rows = @{}
    foreach ($row in ($table -split '\n\|-')) {
      if ($row -match '(?s)^\s*\|\s*(Primary|Secondary|Gadgets?|Ability|Unique Ability|Unique Gadget)\s*\n(.*)$') { $rows[$Matches[1].ToLowerInvariant() -replace 's$', '' -replace 'unique (ability|gadget)', 'ability'] = $Matches[2] }
      # Etiketsiz son satır: "|[[File:SELMA.png]]" + "{{Color|…|Ad}} x 3" → özel yetenek.
      elseif (-not $rows["ability"] -and $row -match '\{\{\s*Color') { $rows["ability"] = ($row -replace '^\s*\|', '') }
    }
    return @{ primary = (Weapons $rows["primary"]); secondary = (Weapons $rows["secondary"]); gadget = (Weapons $rows["gadget"]); ability = (Ability $rows["ability"]); rest = $rest }
  }
  $null
}

# ---------------------------------------------------------------- Operatörler
Write-Host "Operatörler…"
$siegeChars = @{}
foreach ($t in (Category-Members "Characters of Tom Clancy's Rainbow Six Siege")) { $siegeChars[$t] = $true }
$roleOf = @{}
foreach ($role in "Attacker", "Defender") { foreach ($t in (Category-Members $role)) { if ($siegeChars[$t]) { $roleOf[$t] = $role } } }
$opText = Get-Wikitext @($roleOf.Keys)

$operators = @()
$skipped = @()
foreach ($title in ($roleOf.Keys | Sort-Object)) {
  $w = $opText[$title]
  if (-not $w) { $skipped += $title; continue }
  $info = (Get-Templates $w "Infobox/Operator") | Select-Object -First 1
  $sec = Section $w 'Gameplay Description|Gameplay Overview|Gameplay'
  $lo = if ($sec) { Loadout $sec } else { $null }
  # Bazı sayfalarda ekipman ayrı "==Loadout==" bölümündedir; açıklama o zaman oynanış bölümünün tamamıdır.
  if (-not $lo -or -not $lo.ability) {
    $alt = Loadout (Section $w 'Loadout')
    if ($alt) { $alt.rest = $sec; $lo = $alt }
  }
  if (-not $info -or -not $lo -or -not $lo.ability) { $skipped += $title; continue }
  $name = if ($w -match '\{\{DISPLAYTITLE:([^}]+)\}\}') { Plain $Matches[1] } elseif ($info["title"]) { Plain $info["title"] } else { $title -replace ' \(.*\)$', '' }
  # Açıklama: ekipman tablosundan sonraki metin, ilk alt başlığa (=== Strategies… ===) kadar.
  $desc = Lines (($lo.rest -split '\n===')[0])
  # Tabloda yalnız simge varsa ad açıklamadan alınır ("…Unique Gadget is the Kiba Barrier, …").
  if (-not $lo.ability.name -and ($desc -join " ") -match '(?i)unique gadget is (?:the )?([^,.]+)') { $lo.ability.name = $Matches[1].Trim() }
  $orgs = @(($info["organization"] -split '<br\s*/?>') | ForEach-Object { Plain $_ } | Where-Object { $_ -and $_ -notmatch 'formerly|^Rainbow$' })
  $video = FirstFile $info["video"]
  # Yeni operatörlerde bilgi kutusunda video yok; galerideki sezonun resmî "Operator Gameplay Gadget" videosu kullanılır.
  if (-not $video -or $video -notmatch 'Operator') {
    $m = [regex]::Match($w, '(?m)^(?:File:)?([^|\n\[\]=*{}<>]*(Operator Gameplay|Gadget Deep Dive|Operator Video|Operator Guide)[^|\n\[\]{}<>]*?)\s*(\|[^\n]*)?$')
    if ($m.Success) { $video = $m.Groups[1].Value.Trim() }
  }
  $quote = Plain $info["imagecaption"]
  $operators += [ordered]@{
    id         = (Slug $name)
    name       = $name
    page       = $title
    side       = $roleOf[$title]
    realname   = (Plain $info["realname"])
    birthplace = (Plain $info["birthplace"])
    org        = ($orgs -join " · ")
    armor      = (Dots $info["armor"])
    speed      = (Dots $info["speed"])
    roles      = @((Plain $info["role"]) -split '\s*,\s*' | Where-Object { $_ })
    quote      = $quote
    image      = (FirstFile $info["image"])
    icon       = (FirstFile $info["image2"])
    video      = $video
    ability    = $lo.ability
    primary    = @($lo.primary)
    secondary  = @($lo.secondary)
    gadgets    = @($lo.gadget)
    description = @($desc)
  }
}
# Aynı operatörün ikinci sayfası (ör. "Sentry" ve "Sentry (Recruit)") tek kayıt olur: ekipmanı daha dolu olan kalır.
$operators = @($operators | Group-Object { $_.id } | ForEach-Object { $_.Group | Sort-Object { - ($_.description.Count + $_.primary.Count) } | Select-Object -First 1 })

# Wikide aynı rol farklı yazılır ("Front-line", "Frontline", "Front Line"); tek ada indirgenir.
$ROLE = @{
  frontline = "Front Line"; backline = "Back Line"; antientry = "Anti-Entry"; antigadget = "Anti-Gadget"
  antiroam = "Anti-Roam"; antiroamer = "Anti-Roam"; antihardbreach = "Anti-Hard Breach"; areadenial = "Area Denial"
  areadenier = "Area Denial"; breach = "Breach"; crowdcontrol = "Crowd Control"; disable = "Disable"
  entryfrag = "Entry Fragger"; entryfragger = "Entry Fragger"; flank = "Flank"; flanker = "Flank"
  hardbreach = "Hard Breach"; heal = "Heal"; intel = "Intel"; intelgatherer = "Intel"; intelgathering = "Intel"
  inteldenial = "Intel Denial"; inteldenier = "Intel Denial"; mapcontrol = "Map Control"; roam = "Roam"
  secure = "Secure"; softbreach = "Soft Breach"; softbreacher = "Soft Breach"; support = "Support"; buff = "Support"
  trap = "Trap"; trapper = "Trap"; anchor = "Anchor"
}
$GADGET = @{ "Frag Grenades" = "Frag Grenade"; "C4" = "Nitro Cell"; "EMP Grenade" = "Impact EMP Grenade" }
foreach ($o in $operators) {
  $o.roles = @($o.roles | ForEach-Object { $_ -split '\s+(?=Intel)' } | ForEach-Object {
      $k = ($_.ToLowerInvariant() -replace '[^a-z]', '')
      if ($ROLE[$k]) { $ROLE[$k] } else { $_ }
    } | Select-Object -Unique)
  foreach ($g in $o.gadgets) { if ($GADGET[$g.name]) { $g.name = $GADGET[$g.name] } }
  # Silah türü de farklı yazılabiliyor ("Marksman rifle", "Pistol").
  foreach ($wp in @($o.primary) + @($o.secondary)) {
    $t = (Get-Culture).TextInfo.ToTitleCase(($wp.type -replace 'Pístol', 'Pistol').ToLowerInvariant())
    $wp.type = $(if ($t -eq "Pistol") { "Handgun" } else { $t })
    # Aynı silahın farklı yazılışları ("9×19VSN" / "9x19VSN", "AR-15.50 Designated Marksmans Rifle").
    $wp.name = ($wp.name -replace '×', 'x') -replace '^AR-15\.50 Designated.*$', 'AR-15.50'
    if (-not $wp.type -and $wp.name -eq 'AR-15.50') { $wp.type = "Marksman Rifle" }
  }
}

# ---------------------------------------------------------------- Silahlar
Write-Host "Silahlar…"
$weaponPages = @($operators | ForEach-Object { $_.primary + $_.secondary } | ForEach-Object { $_.page; $_.name } | Where-Object { $_ } | Sort-Object -Unique)
$weaponText = Get-Wikitext $weaponPages
$weapons = @{}
foreach ($o in $operators) {
  foreach ($slot in "primary", "secondary") {
    foreach ($wp in $o[$slot]) {
      $k = Slug $wp.name
      if (-not $weapons.ContainsKey($k)) {
        $wt = $weaponText[$wp.page]
        $box = $null
        if ($wt) {
          # Sayfada başka oyunların kutuları da olur (çoğu zaman sekmelerde); Siege kutusu {{WeaponDamage}} ya da
          # kullanıcı + hareketlilik alanlarından tanınır. Birden çok silah varsa (MP5 / MP5SD) adı tutan seçilir.
          $boxes = Get-Templates $wt "Infobox/weapon"
          $cands = @($boxes | Where-Object { $_["damage per hit"] -match 'WeaponDamage' })
          if (-not $cands.Count) { $cands = @($boxes | Where-Object { $_["users"] -and $_["mobility"] }) }
          # Bağlantı ortak sayfaya gidiyorsa (G36 → G36C) silahın kendi adlı sayfası denenir.
          if (-not $cands.Count -and $weaponText[$wp.name] -and $wp.name -ne $wp.page) { $cands = @((Get-Templates $weaponText[$wp.name] "Infobox/weapon") | Where-Object { $_["damage per hit"] -match 'WeaponDamage' }) }
          $box = $cands | Where-Object { (Slug (Plain $_["name"])) -eq $k } | Select-Object -First 1
          if (-not $box) { $box = $cands | Select-Object -First 1 }
        }
        $dmg = $null
        if ($box -and $box["damage per hit"] -match '\{\{\s*WeaponDamage\s*\|[^|]*\|\s*(\d+)') { $dmg = [int]$Matches[1] }
        elseif ($box -and $box["damage per hit"] -match '(\d+)') { $dmg = [int]$Matches[1] }
        $rof = if ($box -and $box["rate of fire"] -match '(\d+)') { [int]$Matches[1] } else { $null }
        $mob = if ($box -and $box["mobility"] -match '(\d+)') { [int]$Matches[1] } else { $null }
        $mag = $null
        foreach ($f in "capacity", "magazine", "magazine size", "mag") { if ($box -and $box[$f] -match '(\d+(\+\d+)?)') { $mag = $Matches[1]; break } }
        $weapons[$k] = [ordered]@{
          id = $k; name = $wp.name; type = $wp.type; slot = $slot
          image = $(if ($box) { FirstFile $box["image"] } else { $null })
          damage = $dmg; rof = $rof; mobility = $mob; capacity = $mag; users = @()
        }
      }
      if ($weapons[$k].users -notcontains $o.id) { $weapons[$k].users += $o.id }
    }
  }
}

# ---------------------------------------------------------------- Haritalar
Write-Host "Haritalar…"
$mapTitles = @(Category-Members "Siege Maps" | Where-Object { $_ -notmatch '^Template:|^CQB Basics$|^Close Quarter|\(Original\)' })
# Yalnız geçici etkinliklerde oynanan haritalar (Showdown, Sugar Fright) listeye alınmaz.
$mapTitles = @($mapTitles | Where-Object { $_ -notin "Fort Truth", "Neighborhood" })
$mapText = Get-Wikitext $mapTitles
# "Features" listesindeki hedefler: "Bomb" satırının altındaki daha derin maddeler.
function Objectives([string]$feat, [string]$label) {
  $lines = @($feat -split "`n" | Where-Object { $_.Trim() })
  $out = @()
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -notmatch '^([:*]+)\s*(.*)$') { continue }
    # Düzey, sonraki -match $Matches'i ezmeden önce saklanır.
    $lvl = $Matches[1].Length
    if ((Plain $Matches[2]) -match "^$label\b") {
      for ($j = $i + 1; $j -lt $lines.Count; $j++) {
        if ($lines[$j] -notmatch '^([:*]+)\s*(.*)$') { break }
        if ($Matches[1].Length -le $lvl) { break }
        $x = Plain $Matches[2]
        if ($x) { $out += $x }
      }
      if ($out.Count) { break }
    }
  }
  , $out
}
$maps = @()
foreach ($title in $mapTitles) {
  $w = $mapText[$title]
  if (-not $w) { continue }
  $info = (Get-Templates $w "Infobox/map") | Select-Object -First 1
  if (-not $info) { continue }
  $name = $title -replace ' \(Siege\)$', ''
  # Kat planları: dosya adı ya da açıklaması kat/bodrum/çatı belirten en az iki resim içeren ilk galeri
  # (yenilenmiş haritalarda güncel hâl sayfada önce gelir).
  $floorRx = '(?i)floor|basement|roof|blueprint|layout|ground|exterior|(^|[\s_-])[1-3]f([\s_.-]|$)'
  $floors = @(Gallery ([regex]::Match((Section $w 'Map Layout|Layout'), '(?s)<gallery[^>]*>.*?</gallery>').Value))
  if (-not $floors.Count) { foreach ($g in [regex]::Matches($w, '(?s)<gallery[^>]*>.*?</gallery>')) {
    $entries = @(Gallery $g.Value | Where-Object { ($_.file + " " + $_.caption) -match $floorRx -and $_.file -notmatch '(?i)thumbnail|concept|teaser' })
    if ($entries.Count -ge 2) { $floors = $entries; break }
  } }
  if (-not $floors.Count) {
    # Bazı sayfalarda kat planları sekmelerin (tabber) içinde, sağa yaslı resimler olarak durur.
    $floors = @([regex]::Matches($w, '\[\[File:([^\]|]*(floor|basement|roof|blueprint)[^\]|]*)', 'IgnoreCase') | ForEach-Object { [ordered]@{ file = $_.Groups[1].Value.Trim(); caption = "" } })
  }
  $feat = Section $w 'Features'
  $quote = (Get-Templates $w "Quote") | Select-Object -First 1
  $overview = Section $w 'Overview'
  $ovText = @(Lines (($overview -split '\n===|<tabber>')[0]) | Where-Object { $_ -notmatch '^•' }) | Select-Object -First 2
  $maps += [ordered]@{
    id        = (Slug $name)
    name      = $name
    image     = (FirstFile $info["image"])
    place     = (Plain $info["place"])
    quote     = $(if ($quote) { Plain $quote["1"] } else { "" })
    overview  = @($ovText)
    floors    = @($floors | Where-Object { $_.file } | Group-Object { $_.file } | ForEach-Object { $_.Group[0] })
    bomb      = (Objectives $w 'Bomb')
    secure    = (Objectives $w 'Secure Area')
    hostage   = (Objectives $w 'Hostage')
  }
}

# ---------------------------------------------------------------- Resimler ve videolar
Write-Host "Resimler…"
$files = @()
foreach ($o in $operators) { $files += $o.image, $o.icon, $o.ability.icon }
foreach ($w in $weapons.Values) { $files += $w.image }
foreach ($m in $maps) { $files += $m.image; $files += @($m.floors | ForEach-Object { $_.file }) }
$urls = Get-ImageUrls @($files | Where-Object { $_ })
function U($f) {
  if (-not $f) { return $null }
  $u = $urls[($f -replace '_', ' ').Trim()]
  if (-not $u) { $k = ($f -replace '_', ' ').Trim(); $u = $urls[$k.Substring(0, 1).ToUpperInvariant() + $k.Substring(1)] }
  $u
}
# Video dosyaları YouTube'a bağlıdır; kimlik dosyanın meta verisindedir.
$videoIds = @{}
foreach ($batch in (Batches @($operators | Where-Object { $_.video } | ForEach-Object { $_.video } | Sort-Object -Unique) 40)) {
  $r = Post-Json @{ action = "query"; prop = "imageinfo"; iiprop = "metadata"; redirects = "1"; format = "json"; formatversion = "2"; titles = (($batch | ForEach-Object { "File:$_" }) -join "|") }
  if ($r.query.pages | Where-Object { $_.invalid -or $_.missing }) { Write-Host ("  bulunamayan video: " + (($r.query.pages | Where-Object { $_.invalid -or $_.missing } | ForEach-Object { "$($_.title)$($_.invalidreason)" }) -join "; ")) }
  $from = @{}
  foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
  foreach ($p in $r.query.pages) {
    $id = ($p.imageinfo[0].metadata | Where-Object { $_.name -eq "videoId" } | Select-Object -First 1).value
    $prov = ($p.imageinfo[0].metadata | Where-Object { $_.name -eq "provider" } | Select-Object -First 1).value
    if (-not $id -or ($prov -and $prov -ne "youtube")) { continue }
    $t = $p.title
    for ($h = 0; $h -lt 3 -and $from.ContainsKey($t); $h++) { $t = $from[$t] }
    $videoIds[($t.Substring(5) -replace '_', ' ')] = $id
  }
}

# marcopixel/r6operators deposundaki SVG simgeler (varsa wiki simgesinin yerine).
$repo = @{}
try {
  $list = Get-Json "https://api.github.com/repos/marcopixel/r6operators/contents/operators"
  foreach ($e in $list) { if ($e.type -eq "dir") { $repo[$e.name] = $true } }
} catch { Write-Host "  r6operators listesi alınamadı, wiki simgeleri kullanılacak." }

foreach ($o in $operators) {
  $o.image = U $o.image
  $o.icon = $(if ($repo[$o.id]) { "https://cdn.jsdelivr.net/gh/marcopixel/r6operators@master/operators/$($o.id)/$($o.id).svg" } else { U $o.icon })
  $o.ability.icon = U $o.ability.icon
  $o.video = $(if ($o.video) { $videoIds[($o.video -replace '_', ' ')] } else { $null })
  foreach ($slot in "primary", "secondary") { foreach ($wp in $o[$slot]) { $wp.id = Slug $wp.name; $wp.Remove("page") } }
  foreach ($g in $o.gadgets) { $g.Remove("page"); $g.Remove("type") }
  $o.Remove("page")
}
foreach ($w in $weapons.Values) { $w.image = U $w.image }
foreach ($m in $maps) { $m.image = U $m.image; foreach ($f in $m.floors) { $f.url = U $f.file; $f.Remove("file") } ; $m.floors = @($m.floors | Where-Object { $_.url }) }

$data = [ordered]@{
  operators = @($operators | Sort-Object { $_.name })
  weapons   = @($weapons.Values | Sort-Object { $_.name })
  maps      = @($maps | Sort-Object { $_.name })
}
$json = $data | ConvertTo-Json -Depth 10 -Compress
$header = "// Rainbow Six Siege verisi: scripts/r6-data.ps1 ile Rainbow Six Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const R6 = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Operatör: {0} (atlanan: {1}), silah: {2}, harita: {3}; videosuz: {4}, açıklamasız: {5}, kat planı olmayan harita: {6}, bomba yeri olmayan: {7}" -f `
    $operators.Count, ($skipped -join ", "), $weapons.Count, $maps.Count, `
    (@($operators | Where-Object { -not $_.video } | ForEach-Object { $_.name }) -join ","), `
    (@($operators | Where-Object { -not $_.description.Count } | ForEach-Object { $_.name }) -join ","), `
    (@($maps | Where-Object { -not $_.floors.Count } | ForEach-Object { $_.name }) -join ","), `
    (@($maps | Where-Object { -not $_.bomb.Count } | ForEach-Object { $_.name }) -join ","))
