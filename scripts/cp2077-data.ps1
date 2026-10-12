# Cyberpunk 2077 verisini toplar ve cp2077/data.js dosyasını yazar.
# Kaynaklar:
# - Cyberpunk Wiki (cyberpunk.fandom.com, CC BY-SA): "Map:Night City 2077" etkileşimli haritası (resim + önemli yerler),
#   silah sayfalarındaki "Infobox Weapon2077" şablonu, ikonik silahların "Acquisition" bölümü ve görev/yer sayfaları.
# - İkonik silah klipleri: Big Dan Gaming'in "How to Get ALL ICONIC WEAPONS Location Guide" videosunun bölümleri
#   (her silah kendi bölümünün başından bir sonraki bölümün başına kadar oynatılır).
# İkonik silahın haritadaki yeri: alındığı görevin/yerin wiki sayfasındaki konum haritadaki bir önemli yere denk geliyorsa
# o yer ("exact"), değilse o alt bölgedeki (sub-district) önemli yerlerin ortası ("area") kullanılır.
# Kullanım: powershell -File scripts/cp2077-data.ps1 -Out cp2077/data.js
param([string]$Out = "cp2077/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://cyberpunk.fandom.com/api.php"
$VIDEO = "klLl_53w2ns"

# Wiki metnini düz yazıya çevirir (bağlantılar, şablonlar, dipnotlar atılır). {{R|I|Cottonmouth}} gibi renkli adlar korunur.
function Plain([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<ref[^>/]*/>', '' -replace '(?s)<ref[^>]*>.*?</ref>', ''
  $t = $t -replace '(?s)<!--.*?-->', ''
  $t = $t -replace '\{\{\s*R\s*\|[^|}]*\|([^}|]*)(\|[^}]*)?\}\}', '$1'
  $t = $t -replace '\{\{\s*CP\s*\|\s*2077\s*\}\}', 'Cyberpunk 2077' -replace '\{\{\s*CP\s*\|\s*PL\s*\}\}', 'Phantom Liberty'
  $t = $t -replace '\{\{\s*(?:Bug|Note)[^{}]*\}\}', ''
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\[https?://\S+\s+([^\]]+)\]', '$1' -replace '\[https?://\S+\]', ''
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', ' ' -replace '<[^>]+>', ''
  $t = $t -replace '&nbsp;', ' ' -replace '&amp;', '&'
  ($t -replace '[ \t]+', ' ').Trim()
}
function Lines([string]$t) {
  @(($t -split "`n") | ForEach-Object {
      $line = $_.Trim()
      # Alt maddeler bazen "**- …" diye yazılır: baştaki tire atılır.
      if ($line -match '^[:;]*\*+\s*(.*)$') { $x = (Plain $Matches[1]) -replace '^[-–]\s*', ''; if ($x) { $x } }
      elseif ($line -match '^(\{\||\|\}|\||!|=|<gallery|</gallery)') { }
      # Kategori ve diller arası bağlantı satırları ("[[Category:…]]", "[[uk:…]]") bölümün sonuna yapışabilir.
      elseif ($line -match '^\[\[(Category|[a-z]{2,3}(-[a-z]+)?):') { }
      else { $x = Plain $line; if ($x) { $x } }
    })
}
function Section([string]$text, [string]$pattern) {
  if ($text -match "(?s)\n==\s*($pattern)\s*==\s*\n(.*?)(?=\n==[^=]|$)") { return $Matches[2] }
  ""
}
# Metindeki wiki bağlantılarının hedefleri ("[[Japantown (2077)|Japantown]]" → "Japantown (2077)").
function Links([string]$t) { @([regex]::Matches([string]$t, '\[\[([^\]|#]+)') | ForEach-Object { $_.Groups[1].Value.Trim() } | Where-Object { $_ -notmatch '^(File|Category|Image):' }) }
function Norm([string]$t) { ($t.ToLowerInvariant() -replace '\((?:2077|2020|2045|cyberpunk 2077|location)\)', '' -replace '[^a-z0-9]', '') }
function Num([string]$v) { $x = (Plain $v) -replace ',', ''; if ($x -match '^-?[0-9]+(\.[0-9]+)?$') { [double]$x } else { $null } }

# --- Harita ---------------------------------------------------------------------------------------------------
$mapPage = Get-Wikitext @("Map:Night City 2077")
$map = $mapPage["Map:Night City 2077"] | ConvertFrom-Json
$mapW = [double]$map.mapBounds[1][0]; $mapH = [double]$map.mapBounds[1][1]
$catNames = @{}; foreach ($c in $map.categories) { $catNames[[string]$c.id] = $c.name.Trim() }
$places = @()
foreach ($m in $map.markers) {
  $px = [Math]::Round($m.position[0] / $mapW * 100, 3)
  # Haritanın başlangıç noktası sol alt köşe: y yukarı doğru artar.
  $py = [Math]::Round((1 - $m.position[1] / $mapH) * 100, 3)
  $places += [ordered]@{ name = $m.popup.title.Trim(); page = $(if ($m.popup.link.url) { $m.popup.link.url } else { $m.popup.title.Trim() }); cat = $catNames[[string]$m.categoryId]; x = $px; y = $py }
}
$mapImg = (Get-ImageUrls @($map.mapImage))[($map.mapImage -replace '_', ' ')]

# Bölge alanı birden çok dönemi sayabilir ("[[Santo Domingo (2045)]]<br>[[Arroyo (2077)]]"): 2077 olan, yoksa sonuncusu alınır.
function AreaName([string]$v) {
  # Bağlantı hedefi tutulur ("[[Arroyo (2077)|Arroyo]]" → "Arroyo (2077)"), çünkü dönem bilgisi orada.
  $v = $v -replace '\[\[([^\]|]*)\|[^\]]*\]\]', '[[$1]]'
  $parts = @(($v -replace '<br\s*/?>', '|' -replace '\]\]\s*\[\[', ']]|[[') -split '\|' | ForEach-Object { Plain $_ } | Where-Object { $_ })
  if (-not $parts.Count) { return "" }
  $pick = @($parts | Where-Object { $_ -match '2077' })[0]
  if (-not $pick) { $pick = $parts[-1] }
  ($pick -replace '\s*\((?:2077|2045|2020)\)', '').Trim()
}
# Önemli yerlerin bölgeleri (Infobox Location: district / sub_district) → bölge ortaları.
$placeText = Get-Wikitext @($places | ForEach-Object { $_.page })
$byNorm = @{}
foreach ($p in $places) {
  $byNorm[(Norm $p.page)] = $p; $byNorm[(Norm $p.name)] = $p
  $box = (Get-Templates ([string]$placeText[$p.page]) "Infobox Location") | Select-Object -First 1
  $p.district = $(if ($box) { AreaName $box["district"] } else { "" })
  $p.sub = $(if ($box) { AreaName $box["sub_district"] } else { "" })
}
$centers = @{}
foreach ($kind in "sub", "district") {
  foreach ($g in ($places | Where-Object { $_[$kind] } | Group-Object { Norm $_[$kind] })) {
    $centers[$g.Name] = @{ x = [Math]::Round((($g.Group | ForEach-Object { $_.x }) | Measure-Object -Average).Average, 3); y = [Math]::Round((($g.Group | ForEach-Object { $_.y }) | Measure-Object -Average).Average, 3); name = $g.Group[0][$kind] }
  }
}

# --- Silahlar -------------------------------------------------------------------------------------------------
function Members-Deep([string]$cat, [hashtable]$seen) {
  if ($seen.ContainsKey($cat)) { return @() }
  $seen[$cat] = 1
  $r = Get-Json "$API`?action=query&list=categorymembers&cmtitle=Category:$([uri]::EscapeDataString($cat))&cmlimit=500&cmtype=page|subcat&format=json"
  $out = @()
  foreach ($x in $r.query.categorymembers) {
    if ($x.ns -eq 14) { $out += Members-Deep ($x.title -replace '^Category:', '') $seen }
    elseif ($x.ns -eq 0) { $out += $x.title }
  }
  $out
}
$cats = "Cyberpunk 2077 Pistols", "Cyberpunk 2077 Revolvers", "Cyberpunk 2077 SMGs", "Cyberpunk 2077 Assault Rifles", "Cyberpunk 2077 Shotguns",
"Cyberpunk 2077 Light Machine Guns", "Cyberpunk 2077 Heavy Machine Guns", "Cyberpunk 2077 Precision Rifles", "Cyberpunk 2077 Sniper Rifles",
"Cyberpunk 2077 Melee weapons", "Cyberpunk 2077 Miscellaneous weapons", "Cyberpunk 2077 Iconic weapons"
$seen = @{}
$titles = @($cats | ForEach-Object { Members-Deep $_ $seen } | Sort-Object -Unique)
$iconicSet = @{}; foreach ($t in (Members-Deep "Cyberpunk 2077 Iconic weapons" @{})) { $iconicSet[$t] = 1 }
$text = Get-Wikitext $titles

$TI = (New-Object Globalization.CultureInfo "en-US").TextInfo
$weapons = @()
foreach ($t in $titles) {
  $wt = [string]$text[$t]
  $box = (Get-Templates $wt "Infobox Weapon2077") | Select-Object -First 1
  if (-not $box) { continue }
  $quality = Plain $box["quality"]
  $iconic = $iconicSet.ContainsKey($t) -or $quality -match 'Iconic'
  $acq = Section $wt 'Acquisition|Location|Locations|How to obtain'
  $gallery = [regex]::Matches((Section $wt 'Gallery'), '(?m)^\s*([^|\n<]+\.(?:png|jpg|jpeg|webp))\s*\|\s*([^\n]*)$') | Where-Object { $_.Groups[2].Value -match 'Location' } | Select-Object -First 1
  $stats = [ordered]@{}
  foreach ($k in "damage_per_hit", "attack_speed", "reload_speed", "effective_range", "ammo_capacity", "headshot_damage_multiplier", "weapon_handling", "armor_penetration", "weight") {
    $v = Num $box[$k]; if ($null -ne $v) { $stats[$k] = $v }
  }
  $weapons += [ordered]@{
    id       = ($t.ToLowerInvariant() -replace '\(.*?\)', '' -replace '[^a-z0-9]+', '-').Trim('-')
    name     = $(if ($box["title"]) { Plain $box["title"] } else { $t })
    page     = $t
    # Wikide aynı tür farklı yazılabiliyor ("One-handed Club" / "One-Handed Club").
    type     = $TI.ToTitleCase((Plain $box["type"]).ToLowerInvariant())
    maker    = ((@(($box["manufacturer"] -split '<br\s*/?>') | ForEach-Object { Plain $_ } | Where-Object { $_ })) -join ", ")
    tech     = Plain $box["technology"]
    iconic   = $iconic
    effect   = Plain $box["iconic"]
    stats    = $stats
    source   = Plain $box["source"]
    how      = @(Lines $acq)
    image    = (FileName $box["image"])
    spot     = $(if ($gallery) { $gallery.Groups[1].Value.Trim() } else { $null })
    raw      = @(@($acq -split "`n" | Where-Object { $_ -match '^\s*\*' -and $_ -notmatch 'Herold Lowe' }) + @($box["source"]) | Where-Object { $_ })
    rawAll   = @($acq -split "`n" | Where-Object { $_ -match '^\s*\*' })
  }
}

# --- İkonik silahların haritadaki yeri ------------------------------------------------------------------------
# Satırlar sırayla denenir; satıcı satırları (Phantom Liberty'de Herold Lowe'dan satın alma) atlanır.
# Bir satırda bağlantı verilen ya da adı geçen önemli yer → tam yer ("exact"); yoksa adı geçen alt bölge, bağlantı verilen
# yerin ya da görevin alt bölgesi → bölgedeki önemli yerlerin ortası. Görevin konumundan bina tahmin edilmez (çoğu görev birden çok yerde geçer).
$linked = @($weapons | Where-Object { $_.iconic } | ForEach-Object { $_.raw | ForEach-Object { Links $_ } } | Sort-Object -Unique)
$linkText = Get-Wikitext $linked
# Metinde adı aranacak yerler: haritada birden çok kez geçen ya da genel adlar ("Ripperdoc", "Black Market dealer") hariç.
$generic = "Black Market", "Ripperdoc", "Fashion", "Motel", "Parking Garage", "Pharmaceuticals", "Stylishy", "2nd Amendment", "Bull House"
$dupes = @($places | Group-Object { $_.name } | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
$named = @($places | Where-Object { $_.name.Length -ge 6 -and $_.name -notin $generic -and $_.name -notin $dupes } | Sort-Object { - $_.name.Length })
$areaNames = @(@($places | ForEach-Object { Norm $_.sub } | Where-Object { $_ } | Sort-Object -Unique) + @($places | ForEach-Object { Norm $_.district } | Where-Object { $_ } | Sort-Object -Unique) | Where-Object { $centers.ContainsKey($_) })
function Area($box) {
  foreach ($k in "sub_district", "district") { $a = Norm (AreaName $box[$k]); if ($a -and $centers.ContainsKey($a)) { return $a } }
  $null
}
function Locate([string]$line) {
  $links = @(Links $line)
  foreach ($l in $links) { if ($byNorm.ContainsKey((Norm $l))) { return @{ place = $byNorm[(Norm $l)] } } }
  $plain = Plain $line
  # Ad metinde kısaltılmış da geçebilir: "Night City Municipal Landfill" → "Municipal Landfill".
  foreach ($p in $named) { if ($plain -match ('\b' + [regex]::Escape(($p.name -replace '^Night City ', '')) + '\b')) { return @{ place = $p } } }
  # Satırda adı geçen alt bölge ("in Kabuki, Watson", "Longshore Stacks, Dogtown"); önce alt bölgeler, sonra bölgeler.
  foreach ($k in $areaNames) { if ($plain -match ('\b' + [regex]::Escape($centers[$k].name) + '\b')) { return @{ area = $k } } }
  # Bağlantı verilen yer sayfasının alt bölgesi. Görev sayfasının bölgesi kullanılmaz: görevler çoğu zaman birkaç bölgede geçer.
  foreach ($l in $links) {
    $wt = [string]$linkText[$l]
    if (-not $wt) { continue }
    $loc = (Get-Templates $wt "Infobox Location") | Select-Object -First 1
    if ($loc) { $a = Area $loc; if ($a) { return @{ area = $a } } }
  }
  $null
}
foreach ($w in ($weapons | Where-Object { $_.iconic })) {
  foreach ($line in $w.raw) {
    $r = Locate $line
    if (-not $r) { continue }
    if ($r.place) { $w.at = [ordered]@{ x = $r.place.x; y = $r.place.y; place = $r.place.name; exact = $true } }
    else { $c = $centers[$r.area]; $w.at = [ordered]@{ x = $c.x; y = $c.y; place = $c.name; exact = $false } }
    break
  }
}

# --- Görev ödülü ikonikler -----------------------------------------------------------------------------------
# Silahın alındığı görev: satırdaki ilk görev (Infobox Quest) bağlantısı. Haritada yeri yukarıda bulunamayan silah,
# görevin "location" alanındaki ilk önemli yere, yoksa görevin (ya da görev yerlerinin) bölgesine konur ("quest").
# V'nin zulasına (stash) gelenler V'nin dairesine, adı geçmeyen airdrop silahları Dogtown'a konur.
$allLinks = @($weapons | Where-Object { $_.iconic } | ForEach-Object { $_.rawAll | ForEach-Object { Links $_ } } | Where-Object { -not $linkText.ContainsKey($_) } | Sort-Object -Unique)
foreach ($kv in (Get-Wikitext $allLinks).GetEnumerator()) { $linkText[$kv.Key] = $kv.Value }
function QuestBox([string]$page) { $wt = [string]$linkText[$page]; if ($wt) { (Get-Templates $wt "Infobox Quest") | Select-Object -First 1 } }
$questLocs = @($weapons | Where-Object { $_.iconic } | ForEach-Object { $_.raw | Select-Object -First 1 | ForEach-Object { Links $_ } } | ForEach-Object { $q = QuestBox $_; if ($q) { Links $q["location"] } } | Where-Object { -not $linkText.ContainsKey($_) } | Sort-Object -Unique)
foreach ($kv in (Get-Wikitext $questLocs).GetEnumerator()) { $linkText[$kv.Key] = $kv.Value }
$vHome = $byNorm[(Norm "Megabuilding H10")]
foreach ($w in ($weapons | Where-Object { $_.iconic })) {
  $first = @($w.raw)[0]
  foreach ($l in (Links $first)) {
    $q = QuestBox $l
    if ($q) { $w.quest = [ordered]@{ name = ($l -replace '\s*\((?:quest|2077|Cyberpunk 2077)\)$', ''); type = Plain $q["type"] }; $w.qbox = $q; break }
  }
  if ($w.at) { continue }
  $all = Plain (@($w.rawAll) -join " ")
  if ($all -match 'Airdrop') { $c = $centers["dogtown"]; $w.at = [ordered]@{ x = $c.x; y = $c.y; place = $c.name; exact = $false; kind = "airdrop" }; continue }
  if ($all -match "V's [Ss]tash|added to (?:V's |the |your )?[Ss]tash") { $w.at = [ordered]@{ x = $vHome.x; y = $vHome.y; place = $vHome.name; exact = $true; kind = "stash" }; continue }
  if ($w.qbox) {
    # Afterlife pek Ã§ok gÃ¶revin yalnÄ±zca buluÅma yeri: baÅka Ã¶nemli yer varsa o seÃ§ilir.
    $cands = @(Links $w.qbox["location"] | Where-Object { $byNorm.ContainsKey((Norm $_)) } | ForEach-Object { $byNorm[(Norm $_)] })
    $p = @(@($cands | Where-Object { $_.name -ne "The Afterlife" }) + $cands)[0]
    if ($p) { $w.at = [ordered]@{ x = $p.x; y = $p.y; place = $p.name; exact = $true; kind = "quest" }; continue }
    $a = Area $w.qbox
    if (-not $a) { foreach ($l in (Links $w.qbox["location"])) { $wt = [string]$linkText[$l]; $loc = $(if ($wt) { (Get-Templates $wt "Infobox Location") | Select-Object -First 1 }); if ($loc) { $a = Area $loc; if ($a) { break } } } }
    if ($a) { $c = $centers[$a]; $w.at = [ordered]@{ x = $c.x; y = $c.y; place = $c.name; exact = $false; kind = "quest" }; continue }
  }
  # Görevi olup yeri haritada bulunamayan (ör. Badlands'teki görevler) satıcıya düşürülmez; haritada gösterilmez.
  if ($w.qbox) { continue }
  # Son çare: satıcı satırları da dahil adı geçen yer (ör. yalnızca Herold Lowe'dan satılan Order → EBM Petrochem Stadium).
  foreach ($line in $w.rawAll) { $r = Locate $line; if ($r) { if ($r.place) { $w.at = [ordered]@{ x = $r.place.x; y = $r.place.y; place = $r.place.name; exact = $true; kind = "vendor" } } else { $c = $centers[$r.area]; $w.at = [ordered]@{ x = $c.x; y = $c.y; place = $c.name; exact = $false; kind = "vendor" } }; break } }
}
foreach ($w in $weapons) { if ($w.at -and -not $w.at.kind) { $w.at.kind = "world" } }

# --- Badlands haritası ----------------------------------------------------------------------------------------
# Wiki haritası yalnızca şehri kapsar. Badlands için NC Zoning Board'un (nczoning/nc-zoning-board) uydu haritası kullanılır:
# satellite_8k.webp oyun dünyasının tamamı (CET X -6298..5815, Y -7684..4427; kuzey yukarıda), alt bölge sınırları
# data/subdistricts.json'da aynı koordinatlarla. Resmin kenarlardaki boş (siyah) kısmı kırpılıp küçültülerek
# cp2077/maps/badlands.jpg yazılır. Badlands'teki görevlerin silahları görevin alt bölgesinin ortasına konur.
$NCZ = "https://raw.githubusercontent.com/nczoning/nc-zoning-board/main"
$WX0 = -6298; $WX1 = 5815; $WY0 = -7684; $WY1 = 4427
$CROP = @{ x = 160; y = 80; w = 7424; h = 6896 }   # 8192 px resimde dolu alan
$SCALE = 0.4
$satFile = Join-Path $CACHE "satellite_8k.webp"
if (-not (Test-Path $satFile)) { & curl.exe -s -L -o $satFile "$NCZ/assets/img/satellite_8k.webp" }
$subs = (Get-Json "$NCZ/data/subdistricts.json").districts | Where-Object { $_.name -eq "Badlands" } | ForEach-Object { $_.subdistricts }
$outImg = Join-Path (Get-Location) "cp2077/maps/badlands.jpg"
New-Item -ItemType Directory -Force (Split-Path $outImg) | Out-Null
Add-Type -AssemblyName PresentationCore, WindowsBase
$fs = [IO.File]::OpenRead($satFile)
$frame = [Windows.Media.Imaging.BitmapDecoder]::Create($fs, 0, [Windows.Media.Imaging.BitmapCacheOption]::OnLoad).Frames[0]
$cropped = New-Object Windows.Media.Imaging.CroppedBitmap($frame, (New-Object Windows.Int32Rect($CROP.x, $CROP.y, $CROP.w, $CROP.h)))
$small = New-Object Windows.Media.Imaging.TransformedBitmap($cropped, (New-Object Windows.Media.ScaleTransform($SCALE, $SCALE)))
$enc = New-Object Windows.Media.Imaging.JpegBitmapEncoder; $enc.QualityLevel = 78
$enc.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($small))
$os = [IO.File]::Create($outImg); $enc.Save($os); $os.Close(); $fs.Close()
$px = $frame.PixelWidth
# Oyun koordinatı → kırpılmış resimde yüzde.
function WorldPct([double]$x, [double]$y) {
  $ix = ($x - $WX0) / ($WX1 - $WX0) * $px - $CROP.x
  $iy = ($WY1 - $y) / ($WY1 - $WY0) * $px - $CROP.y
  @{ x = [Math]::Round($ix / $CROP.w * 100, 3); y = [Math]::Round($iy / $CROP.h * 100, 3) }
}
$badAreas = @(foreach ($sd in $subs) {
    $pts = @($sd.polygon | Where-Object { $_ -and $_.Count -eq 2 })
    if (-not $pts.Count) { continue }
    $c = WorldPct (($pts | ForEach-Object { [double]$_[0] }) | Measure-Object -Average).Average (($pts | ForEach-Object { [double]$_[1] }) | Measure-Object -Average).Average
    [ordered]@{ name = $sd.name; key = (Norm $sd.name); x = $c.x; y = $c.y }
  })
# "Rocky Ridge Plains" → "Rocky Ridge" gibi: alt bölge adı polygon adıyla başlıyorsa eşleşir.
function BadArea([string]$name) {
  $k = Norm $name
  if (-not $k) { return $null }
  @($badAreas | Where-Object { $k.StartsWith($_.key) -or $_.key.StartsWith($k) })[0]
}
# Birden çok alt bölge yazılmışsa ilk eşleşen alınır ("[[Rocky Ridge Plains]]<br>[[Red Peaks]]" → Rocky Ridge).
function BadFirst([string]$v) {
  foreach ($part in (($v -replace '<br\s*/?>', '|' -replace '\]\]\s*\[\[', ']]|[[') -split '\|')) { $a = BadArea (Plain $part); if ($a) { return $a } }
  $null
}
foreach ($w in ($weapons | Where-Object { $_.iconic -and -not $_.at })) {
  $hit = $null
  $plain = Plain (@($w.rawAll) -join " ")
  foreach ($a in $badAreas) { if ($plain -match ('\b' + [regex]::Escape($a.name) + '\b')) { $hit = $a; break } }
  if (-not $hit -and $w.qbox) {
    $hit = BadFirst $w.qbox["sub_district"]
    if (-not $hit) {
      foreach ($l in (Links $w.qbox["location"])) {
        $wt = [string]$linkText[$l]
        if (-not $wt) { $wt = [string](Get-Wikitext @($l))[$l]; $linkText[$l] = $wt }
        $loc = $(if ($wt) { (Get-Templates $wt "Infobox Location") | Select-Object -First 1 })
        if ($loc) { $hit = BadFirst ($loc["sub_district"] + "|" + $loc["subregion"]); if ($hit) { break } }
      }
    }
  }
  if ($hit) { $w.at = [ordered]@{ map = "badlands"; x = $hit.x; y = $hit.y; place = $hit.name; exact = $false; kind = $(if ($w.qbox) { "quest" } else { "vendor" }) } }
}

# --- Video bölümleri ------------------------------------------------------------------------------------------
& curl.exe -s -m 60 -A $UA -H "Accept-Language: en-US" -o $TMP "https://www.youtube.com/watch?v=$VIDEO"
$html = [IO.File]::ReadAllText($TMP, [Text.Encoding]::UTF8)
$chapters = @()
foreach ($m in [regex]::Matches($html, 'macroMarkersListItemRenderer":\{"title":\{"simpleText":"([^"]*)"\},"timeDescription":\{"accessibility":\{[^}]*\}\},"simpleText":"([^"]*)"')) {
  $s = 0; foreach ($p in ($m.Groups[2].Value -split ':')) { $s = $s * 60 + [int]$p }
  if (-not ($chapters | Where-Object { $_.start -eq $s })) { $chapters += @{ title = [regex]::Unescape($m.Groups[1].Value); start = $s } }
}
if ($chapters.Count -lt 50) { throw "Video bölümleri okunamadı ($($chapters.Count))" }
$chapters = @($chapters | Sort-Object { $_.start })
$length = if ($html -match '"lengthSeconds":"(\d+)"') { [int]$Matches[1] } else { $chapters[-1].start + 120 }
$clip = @{}
for ($i = 0; $i -lt $chapters.Count; $i++) {
  $end = if ($i + 1 -lt $chapters.Count) { $chapters[$i + 1].start } else { $length }
  # "Chaos / Sir John Phallustiff / Doom Doom", "Ol' Reliable and Riskit", "Mox (Judy Shotgun)" → tek tek adlar.
  $t = $chapters[$i].title -replace [char]0x2019, "'" -replace '\(.*?\)', '' -replace '\s+Location$', ''
  foreach ($n in ($t -split '\s*/\s*|\s+and\s+')) { $k = Norm $n; if ($k -and -not $clip[$k]) { $clip[$k] = @($VIDEO, $chapters[$i].start, $end) } }
}
$noClip = @()
foreach ($w in ($weapons | Where-Object { $_.iconic })) {
  $k = Norm ($w.name -replace [char]0x2019, "'")
  $c = $clip[$k]
  if (-not $c) { $c = $clip[(Norm ($w.name -replace '\s*X-MOD2$', ''))] }
  # Videoda ad biraz farklı olabilir: "NDI Osprey", "Malorian Arms 3516", "Tsunami Rasetsu", "Borzhaya".
  if (-not $c) { foreach ($key in $clip.Keys) { if ($key.Length -ge 4 -and ($k.StartsWith($key) -or $key.StartsWith($k) -or $key.EndsWith($k))) { $c = $clip[$key]; break } } }
  if (-not $c -and $k -eq "borzaya") { $c = $clip["borzhaya"] }
  if ($c) { $w.yt = $c } else { $noClip += $w.name }
}

# --- Resimler ve çıktı ----------------------------------------------------------------------------------------
$imgs = Get-ImageUrls @($weapons | ForEach-Object { $_.image; $_.spot } | Where-Object { $_ })
foreach ($w in $weapons) {
  $w.image = $(if ($w.image) { $imgs[($w.image -replace '_', ' ')] } else { $null })
  $w.spot = $(if ($w.spot) { $imgs[($w.spot -replace '_', ' ')] } else { $null })
  $w.Remove("raw"); $w.Remove("rawAll"); $w.Remove("qbox"); $w.Remove("page")
  if (-not $w.iconic) { $w.Remove("effect"); $w.Remove("how"); $w.Remove("spot") }
}
foreach ($p in $places) { $p.Remove("page") }
$data = [ordered]@{
  map     = [ordered]@{ image = $mapImg; width = [int]$mapW; height = [int]$mapH; places = @($places | Sort-Object { $_.name }) }
  badlands = [ordered]@{ image = "maps/badlands.jpg"; width = [int]($CROP.w * $SCALE); height = [int]($CROP.h * $SCALE); areas = @($badAreas | ForEach-Object { $_.Remove("key"); $_ }) }
  weapons = @($weapons | Sort-Object { $_.name })
}
$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// Cyberpunk 2077 verisi: scripts/cp2077-data.ps1 ile Cyberpunk Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const CP = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
$ic = @($weapons | Where-Object { $_.iconic })
Write-Host ("Yer: {0}, silah: {1} (ikonik: {2}; tam yer: {3}, bölge: {4}, yersiz: {5}; klipsiz: {6})" -f $places.Count, $weapons.Count, $ic.Count, `
  @($ic | Where-Object { $_.at -and $_.at.exact }).Count, @($ic | Where-Object { $_.at -and -not $_.at.exact }).Count, (@($ic | Where-Object { -not $_.at } | ForEach-Object { $_.name }) -join ", "), ($noClip -join ", "))
