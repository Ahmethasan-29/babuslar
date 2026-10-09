# Dead by Daylight verisini toplar ve dbd/data.js dosyasını yazar.
#   Karakterler, katil güçleri, perkler, haritalar: dbd.tricky.lol (oyun dosyalarından çıkarılmış, İngilizce)
#   Görseller, harita şemaları ve perk animasyonları: Dead by Daylight Wiki (deadbydaylight.fandom.com)
# Yeni bölüm çıkınca: powershell -File scripts/dbd-data.ps1 -Out dbd/data.js
param([string]$Out = "dbd/data.js")
$ErrorActionPreference = "Stop"
# Sayılar her zaman "1.25" biçiminde yazılsın (Türkçe Windows'ta "1,25" olurdu).
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
$UA ="Mozilla/5.0 (Babuslar fan sitesi)"
$WIKI = "https://deadbydaylight.fandom.com/api.php"

function Get-Json($url) {
  foreach ($try in 1..4) {
    try { return Invoke-RestMethod -UserAgent $UA $url } catch { Start-Sleep 3 }
  }
  throw "Alınamadı: $url"
}

function Values($obj) { if ($obj) { $obj.PSObject.Properties | ForEach-Object { $_.Value } } }

# Wiki dosya adlarını indirilebilir adreslere çevirir (50'şer). Bulunamayanlar sonuçta yer almaz.
function Resolve-WikiFiles([string[]]$names) {
  $map = @{}
  $list = @($names | Where-Object { $_ } | Sort-Object -Unique)
  for ($i = 0; $i -lt $list.Count; $i += 50) {
    $batch = $list[$i..([Math]::Min($i + 49, $list.Count - 1))]
    $titles = ($batch | ForEach-Object { [uri]::EscapeDataString("File:$_") }) -join '|'
    $r = Get-Json "$WIKI`?action=query&prop=imageinfo&iiprop=url&format=json&titles=$titles"
    foreach ($page in (Values $r.query.pages)) {
      if ($page.imageinfo) { $map[$page.title.Substring(5)] = ($page.imageinfo[0].url -replace '\?cb=\d+$', '') }
    }
  }
  $map
}

# MediaWiki devam bilgisi: yanıttaki "continue" alanlarının tamamı bir sonraki isteğe eklenir.
function Continue-Query($r) {
  if (-not $r.continue) { return "" }
  ($r.continue.PSObject.Properties | ForEach-Object { "&" + $_.Name + "=" + [uri]::EscapeDataString([string]$_.Value) }) -join ""
}

function All-WikiFiles([string]$prefix) {
  $names = @(); $cont = ""
  do {
    $r = Get-Json "$WIKI`?action=query&list=allimages&aiprefix=$prefix&ailimit=500&format=json$cont"
    $names += $r.query.allimages | ForEach-Object { $_.name -replace '_', ' ' }
    $cont = Continue-Query $r
  } while ($cont)
  $names
}

# Wiki dosyalarını sadeleştirilmiş adlarına göre dizinler: "IconPerks hexPentimento.png" → "hexpentimento"
function Index-WikiFiles([string]$prefix, [string]$strip) {
  $index = @{}
  foreach ($f in (All-WikiFiles $prefix)) {
    $k = Key (($f -replace '\.\w+$', '') -replace $strip, '')
    if ($k -and -not $index.ContainsKey($k)) { $index[$k] = $f }
  }
  $index
}

# Oyun dosyası yolunun sade adı: ".../T_UI_iconPerks_HelpWanted" → "helpwanted"
function PathKey([string]$path, [string]$strip) {
  if (-not $path) { return "" }
  Key (((($path -split '/')[-1] -replace '\.png$', '') -replace '^T_UI_', '') -replace $strip, '')
}

function First($index, [string[]]$keys) {
  foreach ($k in $keys) { if ($k -and $index.ContainsKey($k)) { return $index[$k] } }
  $null
}

function Key([string]$text) { ($text.ToLowerInvariant() -replace '[^a-z0-9]', '') }

# "{Tunable.S02P02.Haste%}" → "50", "{Keyword.Exhausted}" → "Exhausted"; değerler kademelere göre "60/50/40".
function Fill-Description([string]$text, $tunables) {
  if (-not $text) { return "" }
  $text = [regex]::Replace($text, '\{Tunable\.[^}]*?\.([^.}]+)\}', {
      param($m)
      $key = $m.Groups[1].Value.ToLowerInvariant()
      $prop = if ($tunables) { $tunables.PSObject.Properties[$key] } else { $null }
      if ($prop) { '<b>' + (@($prop.Value) -join '/') + '</b>' } else { '?' }
    })
  $text = [regex]::Replace($text, '\{(?:Keyword|Input)\.([^}]+)\}', {
      param($m) '<b>' + ($m.Groups[1].Value -creplace '([a-z])([A-Z])', '$1 $2') + '</b>'
    })
  $text -replace '\{[^}]*\}', ''
}

Write-Host "Veriler alınıyor…"
$characters = Get-Json "https://dbd.tricky.lol/api/characters"
$perks = Get-Json "https://dbd.tricky.lol/api/perks"
$items = Get-Json "https://dbd.tricky.lol/api/items?role=killer"
$maps = Get-Json "https://dbd.tricky.lol/api/maps"

# Wiki'deki görseller, sade adlarına göre dizinlenir (oyun dosyası adları ile wiki adları her zaman aynı değil).
$charList = $characters.PSObject.Properties | ForEach-Object { @{ index = $_.Name; c = $_.Value } }
$perkList = Values $perks
$powerOf = @{}
foreach ($c in $charList) { if ($c.c.item -and $items.PSObject.Properties[$c.c.item]) { $powerOf[$c.index] = $items.PSObject.Properties[$c.c.item].Value } }

Write-Host "Wiki görselleri dizinleniyor…"
$perkIcons = Index-WikiFiles "IconPerks" '^IconPerks '
$powerIcons = Index-WikiFiles "IconPowers" '^IconPowers '
$mapIcons = Index-WikiFiles "IconMap" '^IconMap '
$portraits = @{}
foreach ($p in @("K", "S")) {
  foreach ($f in (All-WikiFiles $p)) {
    if ($f -match '^[KS]\d+ (.+) Portrait\.(png|webp)$') { $k = Key $Matches[1]; if (-not $portraits.ContainsKey($k)) { $portraits[$k] = $f } }
  }
}
# Perk animasyonları: "PerkAnimation Adrenaline WhileInjured.mp4" → "adrenaline" (ilk çeşit kullanılır)
$animations = @{}
foreach ($f in (All-WikiFiles "PerkAnimation")) {
  $k = Key (($f -replace '^PerkAnimation ', '' -replace '\.\w+$', '') -split ' ')[0]
  if (-not $animations.ContainsKey($k)) { $animations[$k] = $f }
}
$layouts = All-WikiFiles "AltMapOutline"

# Elle eşleştirilen birkaç perk (wiki adı farklı yazılmış).
$perkAlias = @{ "barbecuechili" = "barbecueandchilli" }

$pick = @{}
function PerkIcon($p) { First $perkIcons @((Key $p.name), $perkAlias[(Key $p.name)], (PathKey $p.image '^icons?Perks_'), ((Key $p.name) -replace '^(hex|boon|scourgehook|invocation)', '')) }
function PerkAnim($p) { First $animations @((Key $p.name), (PathKey $p.image '^icons?Perks_'), ((Key $p.name) -replace '^(hex|boon|scourgehook|invocation)', '')) }
function Portrait($c) { First $portraits @((Key $c.name), (Key ($c.name -replace '^The ', '')), (PathKey $c.image '^[KS]\d+_|_Portrait$')) }
function PowerIcon($item) { First $powerIcons @((PathKey $item.image '^iconPowers_'), (Key $item.name)) }
function MapIcon($v) { $k = PathKey $v.image '^iconMap_'; First $mapIcons @($k, ($k -replace '\d$', ''), (Key $v.name)) }

$wanted = @()
# Bazı perk videoları wikide yalnızca perk adıyla durur: "Hangman's Trick" → "HangmansTrick.mp4" (oyun içi görüntü)
function PerkMp4($p) { ($p.name -replace "[^A-Za-z0-9]", "") + ".mp4" }
$wanted += $perkList | ForEach-Object { PerkIcon $_; PerkAnim $_ }
$wanted += $perkList | Where-Object { -not (PerkAnim $_) } | ForEach-Object { PerkMp4 $_ }

# Hâlâ videosu olmayan perklerde, perkin wiki sayfasında kullanılan .mp4 dosyası aranır.
function PageVideos([string[]]$titles) {
  $found = @{}
  $list = @($titles | Sort-Object -Unique)
  for ($i = 0; $i -lt $list.Count; $i += 50) {
    $batch = $list[$i..([Math]::Min($i + 49, $list.Count - 1))]
    $q = ($batch | ForEach-Object { [uri]::EscapeDataString($_) }) -join '|'
    $cont = ""
    do {
      $r = Get-Json "$WIKI`?action=query&prop=images&imlimit=500&redirects=1&format=json&titles=$q$cont"
      $from = @{}
      foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
      foreach ($page in (Values $r.query.pages)) {
        $t = $page.title
        for ($hop = 0; $hop -lt 3 -and $from.ContainsKey($t); $hop++) { $t = $from[$t] }
        foreach ($img in @($page.images)) {
          if ($img -and $img.title -match '\.mp4$') {
            $file = $img.title.Substring(5)
            # Sayfada birden çok video varsa adı perke en çok benzeyen seçilir.
            if (-not $found.ContainsKey($t) -or ((Key $file) -like "*$(Key $t)*")) { $found[$t] = $file }
          }
        }
      }
      $cont = Continue-Query $r
    } while ($cont)
  }
  $found
}
$pageVideos = PageVideos @($perkList | Where-Object { -not (PerkAnim $_) } | ForEach-Object { $_.name })
$wanted += $pageVideos.Values
$wanted += $charList | ForEach-Object { Portrait $_.c }
$wanted += $powerOf.Values | ForEach-Object { PowerIcon $_ }
$mapEntries = $maps.PSObject.Properties | Where-Object { $_.Value.name -and $_.Value.name -notmatch '^@#' }
$wanted += $mapEntries | ForEach-Object { MapIcon $_.Value }
$wanted += $layouts
Write-Host "Adresler çözülüyor…"
$urls = Resolve-WikiFiles $wanted
function Url($name) { if ($name) { $urls[$name] } else { $null } }
function FirstUrl([object[]]$list) { foreach ($u in $list) { if ($u) { return $u } }; return $null }

function Perk($p) {
  [ordered]@{
    name        = $p.name
    description = Fill-Description $p.description $p.tunables
    icon        = Url (PerkIcon $p)
    video       = FirstUrl @((Url (PerkAnim $p)), (Url (PerkMp4 $p)), (Url $pageVideos[$p.name]))
  }
}

$perksByChar = @{}
$general = @{ survivor = @(); killer = @() }
foreach ($p in $perkList) {
  if ($null -ne $p.character -and $p.character -ge 0) {
    $k = [string]$p.character
    if (-not $perksByChar[$k]) { $perksByChar[$k] = @() }
    $perksByChar[$k] += , (Perk $p)
  } elseif ($p.role) {
    $general[$p.role] += , (Perk $p)
  }
}

$killers = @(); $survivors = @()
foreach ($c in $charList) {
  $entry = [ordered]@{
    id       = (Key $c.c.name)
    name     = $c.c.name
    bio      = $c.c.bio
    portrait = Url (Portrait $c.c)
    perks    = @($perksByChar[$c.index] | Sort-Object { $_.name })
  }
  if ($c.c.role -eq 'killer') {
    $power = $powerOf[$c.index]
    if ($power) {
      $entry.power = [ordered]@{ name = $power.name; description = $power.description; icon = Url (PowerIcon $power) }
    }
    $killers += , $entry
  } elseif ($c.c.role -eq 'survivor') {
    $survivors += , $entry
  }
}

# Aynı adlı harita çeşitleri (Coal Tower I/II) tek haritada toplanır.
$mapOut = [ordered]@{}
foreach ($m in $mapEntries) {
  $v = $m.Value
  $name = $v.name.Trim()
  $id = Key $name
  # Şema adı: "Ind_CoalTower02" → "AltMapOutline Ind CoalTower", "Fin_Hideout" → "... Fin Hideout up/down"
  $base = ($m.Name -replace '0\d$', '' -replace '_Level_', '_Level' -replace '_', ' ')
  $schemes = $layouts | Where-Object { (Key ($_ -replace '^AltMapOutline ', '' -replace '\.png$', '' -replace ' (up|down)$', '')) -eq (Key $base) }
  if (-not $mapOut.Contains($id)) {
    $image = Url (MapIcon $v)
    $mapOut[$id] = [ordered]@{ id = $id; name = $name; realm = $v.realm; description = $v.description; image = $image; layouts = @(); layoutKind = "schema" }
  }
  foreach ($s in $schemes) {
    $url = $urls[$s]
    if ($url -and $mapOut[$id].layouts -notcontains $url) { $mapOut[$id].layouts += $url }
  }
}

# Görseli bulunamayan karakter ve haritalarda wiki sayfasının ana görseli kullanılır.
function PageImages([string[]]$titles) {
  $map = @{}
  $list = @($titles | Where-Object { $_ } | Sort-Object -Unique)
  for ($i = 0; $i -lt $list.Count; $i += 50) {
    $batch = $list[$i..([Math]::Min($i + 49, $list.Count - 1))]
    $q = ($batch | ForEach-Object { [uri]::EscapeDataString($_) }) -join '|'
    $r = Get-Json "$WIKI`?action=query&prop=pageimages&piprop=original&redirects=1&format=json&titles=$q"
    $from = @{}
    foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
    foreach ($page in (Values $r.query.pages)) {
      if (-not $page.original) { continue }
      $t = $page.title
      for ($hop = 0; $hop -lt 3 -and $from.ContainsKey($t); $hop++) { $t = $from[$t] }
      $map[$t] = $page.original.source -replace '/revision/latest.*$', ''
    }
  }
  $map
}
$missing = @($killers + $survivors | Where-Object { -not $_.portrait }) + @($mapOut.Values | Where-Object { -not $_.image })
$fallback = PageImages ($missing | ForEach-Object { $_.name; $_.name -replace ' [IVX]+$', '' })
foreach ($x in $missing) {
  $img = $fallback[$x.name]; if (-not $img) { $img = $fallback[($x.name -replace ' [IVX]+$', '')] }
  if ($x.Contains('portrait')) { $x.portrait = $img } else { $x.image = $img }
}

# Üstten şeması (AltMapOutline) olmayan haritalarda wiki sayfasındaki harita planı ("...Outline.png") kullanılır.
# Kapalı haritalarda kat planıdır; açık haritalarda yalnızca dış sınırı ve büyüklüğü gösterir. Eski sürümler elenir.
$noLayout = @($mapOut.Values | Where-Object { -not $_.layouts.Count })
$titleOf = @{}
foreach ($m in $noLayout) {
  # "Azarov’s" → "Azarov's", "Badham Preschool III" → "Badham Preschool"
  $titleOf[$m.id] = ($m.name.Replace([string][char]0x2019, "'") -replace ' [IVX]+$', '').Trim()
}
$outlines = @{}
$list = @($titleOf.Values | Sort-Object -Unique)
for ($i = 0; $i -lt $list.Count; $i += 50) {
  $batch = $list[$i..([Math]::Min($i + 49, $list.Count - 1))]
  $q = ($batch | ForEach-Object { [uri]::EscapeDataString($_) }) -join '|'
  $cont = ""
  do {
    $r = Get-Json "$WIKI`?action=query&prop=images&imlimit=500&redirects=1&format=json&titles=$q$cont"
    $from = @{}
    foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
    foreach ($page in (Values $r.query.pages)) {
      $t = $page.title
      for ($hop = 0; $hop -lt 3 -and $from.ContainsKey($t); $hop++) { $t = $from[$t] }
      foreach ($img in @($page.images)) {
        $f = if ($img) { $img.title.Substring(5) } else { "" }
        if ($f -match 'Outline' -and $f -notmatch 'AltMapOutline|old|\d\.\d|v\d|\(2v8\)') {
          if (-not $outlines[$t]) { $outlines[$t] = @() }
          if ($outlines[$t] -notcontains $f) { $outlines[$t] += $f }
        }
      }
    }
    $cont = Continue-Query $r
  } while ($cont)
}
$outlineUrls = Resolve-WikiFiles @($outlines.Values | ForEach-Object { $_ })
foreach ($m in $noLayout) {
  $files = @($outlines[$titleOf[$m.id]] | Sort-Object)
  # Numaralı çeşitler (Badham Preschool IV) kendi planını ("...IVOutline") kullanır; yoksa ve "I" ise numarasız planı.
  if ($m.name -match ' ([IVX]+)$') {
    $roman = $Matches[1]
    $own = @($files | Where-Object { $_ -cmatch "[a-z]$roman ?Outline" })
    $files = if ($own.Count) { $own } else { @($files | Where-Object { $_ -cmatch '[a-z] ?Outline' -and $_ -cnotmatch '[a-z](I|II|III|IV|V) ?Outline' }) }
  }
  foreach ($f in $files) {
    $url = $outlineUrls[$f]
    if ($url -and $m.layouts -notcontains $url) { $m.layouts += $url; $m.layoutKind = "outline" }
  }
}

$data = [ordered]@{
  killers   = @($killers | Sort-Object { $_.name -replace '^The ', '' })
  survivors = @($survivors | Sort-Object { $_.name })
  perks     = [ordered]@{ survivor = @($general.survivor | Sort-Object { $_.name }); killer = @($general.killer | Sort-Object { $_.name }) }
  maps      = @($mapOut.Values | Sort-Object { $_.realm }, { $_.name })
}

$json = $data | ConvertTo-Json -Depth 8 -Compress
$header = "// Dead by Daylight verisi: scripts/dbd-data.ps1 ile oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const DBD = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))

$noPortrait = @($killers + $survivors | Where-Object { -not $_.portrait }).Count
$allPerks = @($perksByChar.Values | ForEach-Object { $_ }) + $general.survivor + $general.killer
Write-Host ("Katil: {0}, Survivor: {1}, Perk: {2} (ikonsuz {3}, animasyonlu {4}), Harita: {5} (görselli {6}), portresiz karakter: {7}" -f `
    $killers.Count, $survivors.Count, $allPerks.Count, @($allPerks | Where-Object { -not $_.icon }).Count, @($allPerks | Where-Object { $_.video }).Count, `
    $mapOut.Count, @($mapOut.Values | Where-Object { $_.layouts.Count }).Count, $noPortrait)
