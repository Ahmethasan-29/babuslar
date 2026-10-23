# Bloons TD 4, Bloons TD 5 ve Bloons TD Battles 2: kuleler ve yükseltme yolları → btd4/, btd5/, btdb2/ klasörleri.
#   powershell -ExecutionPolicy Bypass -File scripts/btd-classic-data.ps1 -Game BTD5   (BTD4 | BTD5 | BTDB2)
# Kaynak: Bloons Wiki (bloons.fandom.com, CC BY-SA). Kule sayfalarındaki {{Upgrade}} şablonları (yol yol, ad, fiyat, açıklama).
param([ValidateSet('BTD4', 'BTD5', 'BTDB2')][string]$Game = 'BTD5')
. "$PSScriptRoot\rehber-lib.ps1"

$API = 'https://bloons.fandom.com/api.php'
$INFO = @{
  BTD4 = @{ dir = 'btd4'; name = 'Bloons TD 4'; main = 'Bloons TD 4'; steam = $null
    intro = @('2010''da çıkan dördüncü oyun: her kulenin 2 yolu ve her yolda 2 yükseltmesi var; dört yükseltmenin hepsi alınabilir.', 'The 2010 fourth game: each tower has 2 paths of 2 upgrades, and all four can be bought.') }
  BTD5 = @{ dir = 'btd5'; name = 'Bloons TD 5'; main = 'Bloons TD 5'
    extra = @('Dart Monkey', 'Tack Shooter', 'Sniper Monkey', 'Boomerang Thrower', 'Ninja Monkey', 'Bomb Tower', 'Ice Tower', 'Glue Gunner', 'Monkey Buccaneer', 'Monkey Ace', 'Super Monkey', 'Monkey Apprentice', 'Monkey Village', 'Banana Farm', 'Mortar Tower', 'Dartling Gun', 'Spike Factory', 'Heli Pilot', 'Monkey Engineer', 'Bloonchipper', 'Monkey Sub')
    intro = @('2011''de çıkan beşinci oyun: her kulenin 2 yolu ve her yolda 4 yükseltmesi var. Bir yol sonuna kadar, diğeri en fazla 2. seviyeye kadar alınabilir.', 'The 2011 fifth game: each tower has 2 paths of 4 upgrades. One path can go all the way, the other up to tier 2.') }
  BTDB2 = @{ dir = 'btdb2'; name = 'Bloons TD Battles 2'; main = 'Bloons TD Battles 2'
    intro = @('İki oyuncunun karşı karşıya oynadığı BTD: kendi balonlarını patlatırken rakibine balon gönderirsin. Kuleler BTD6''daki gibi 3 yol × 5 seviye; fiyatlar savaş modundaki fiyatlardır.', 'Head-to-head BTD: pop your own bloons while sending bloons to your opponent. Towers have 3 paths × 5 tiers like BTD6; costs are battle-mode costs.') }
}
$g = $INFO[$Game]
$suffix = " ($Game)"

# Aday sayfalar: ana sayfadaki "(OYUN)" bağlantıları + bilinen kule adları
Write-Host "$($g.name) sayfaları indiriliyor…"
$mainText = (Get-WikiPages $API @($g.main))[$g.main]
$cands = @([regex]::Matches($mainText, "\[\[([^\]|]+\($Game\))") | ForEach-Object { $_.Groups[1].Value })
if ($g.extra) { $cands += @($g.extra | ForEach-Object { "$_$suffix" }) }
$pages = Get-WikiPages $API @($cands | Sort-Object -Unique)

function Get-Quote([string]$text) { if ($text -match '\{\{Quote\|([^|}]+)\|') { Clean-WikiText $Matches[1] } }
function Clean-Param([string]$v) {
  if (-not $v) { return $null }
  $v = $v -replace '\{\{#[Ii]nvoke:[^}]*\}\}', '' -replace '\{\{[^{}|]*\|?([^{}]*)\}\}', '$1' -replace '\{\{[^{}]*\}\}', '' -replace '<br\s*/?>', ' / '
  $v = (Clean-WikiText $v) -replace '\s*/?\s*\(Game Grid Units\)', ''
  if ($v -match '^(N/A|)$') { $null } else { $v }
}
$money = { param($n) '$' + ('{0:N0}' -f [int]$n).Replace(',', '.') }

# {{Upgrade ...}} şablonları, hangi "Path" başlığının altında olduklarıyla
function Get-Upgrades([string]$text) {
  $start = $text.IndexOf('==Upgrades==')
  if ($start -lt 0) { $start = $text.IndexOf('== Upgrades ==') }
  if ($start -lt 0) { $start = 0 }
  $body = $text.Substring($start)
  $out = @(); $path = 'Path 1'
  $rx = [regex]'(?m)^===\s*([^=]+?)\s*===|\{\{Upgrade\b'
  foreach ($m in $rx.Matches($body)) {
    if ($m.Groups[1].Success) { $path = $m.Groups[1].Value; continue }
    $p = Get-InfoboxParams $body.Substring($m.Index) 'Upgrade'
    if ($p['name']) { $out += [pscustomobject]@{ path = $path; p = $p } }
  }
  $out
}

$files = New-Object System.Collections.ArrayList
$towerList = foreach ($title in ($pages.Keys | Sort-Object)) {
  $text = $pages[$title]
  if ($text -notmatch '\{\{\s*Infobox[ _]Tower') { continue }
  $ups = @(Get-Upgrades $text)
  if ($ups.Count -lt 2) { continue }
  # Bazı sayfalarda "Path" başlığı yok: yükseltmeler sırayla yol yol (BTD4'te 2'şer, BTD5'te 4'er, Battles 2'de 5'er) bölünür.
  $tiers = @{ BTD4 = 2; BTD5 = 4; BTDB2 = 5 }[$Game]
  if (@($ups | Select-Object -ExpandProperty path -Unique).Count -eq 1 -and $ups.Count -gt $tiers) {
    for ($k = 0; $k -lt $ups.Count; $k++) { $ups[$k].path = "Path $([Math]::Floor($k / $tiers) + 1)" }
  }
  $ib = Get-InfoboxParams $text 'Infobox Tower'
  $name = $title -replace ' \([A-Z0-9]+\)$', ''
  $img = ImageName $ib['image'] "$name.png"
  [void]$files.Add($img)
  # Fiyat: "$200 (Medium)" varsa o, yoksa ilk $ sayısı
  $costText = $ib['cost']
  $cost = if ($costText -match '\$([\d,]+)\s*\(\[\[Medium') { $Matches[1] } elseif ($costText -match '\$([\d,]+)') { $Matches[1] } else { $null }
  $stats = @()
  if ($cost) { $stats += , @(@('Fiyat', 'Cost'), (& $money ($cost -replace ',', ''))) }
  foreach ($f in @(@('damage', 'Hasar', 'Damage'), @('pierce', 'Delme', 'Pierce'), @('attackspeed', 'Saldırı hızı', 'Attack speed'), @('range', 'Menzil', 'Range'), @('camo', 'Kamuflaj', 'Camo'))) {
    $v = Clean-Param $ib[$f[0]]
    if ($v -and $v.Length -lt 80) { $stats += , @(@($f[1], $f[2]), $v) }
  }
  $lists = foreach ($grp in ($ups | Group-Object path)) {
    # Aynı yolda Flash ve Mobile sürümleri art arda yazılmış olabilir: ad tekrar edince ilk sürümde durulur.
    $n = 0; $seen = @{}
    $lines = foreach ($u in $grp.Group) {
      $un = Clean-WikiText $u.p["name"]
      if ($seen[$un]) { break }
      $seen[$un] = 1
      $n++
      $c = ($u.p['cost'] -replace '[^\d]', '')
      $d = Clean-WikiText ($u.p['description'] -replace '\{\{[^{}|]*\|?([^{}]*)\}\}', '$1')
      "[[k|$n]] $(Clean-WikiText $u.p['name'])" + $(if ($c) { " [[d|$(& $money $c)]]" } else { '' }) + $(if ($d) { ": $d" } else { '' })
    }
    $label = $grp.Name -replace '^Path (\d)$', '$1. yol'
    [ordered]@{ title = @($label, ($grp.Name)); items = @($lines) }
  }
  [ordered]@{ id = Slug $name; name = $name; file = $img; quote = Get-Quote $text; stats = $stats; lists = @($lists) }
}
Write-Host "Kule: $(@($towerList).Count)"

Write-Host "Resim adresleri alınıyor ($($files.Count))…"
$urls = Get-WikiImageUrls $API @($files)
$missing = @()
foreach ($x in $towerList) { $u = if ($x.file) { $urls[$x.file] }; if ($u) { $x.image = Thumb $u 160 } else { $missing += $x.name }; $x.Remove('file') }
Write-Host "Resmi bulunamayan ($($missing.Count)): $($missing -join ', ')"

$data = [ordered]@{
  game = $g.name
  intro = $g.intro
  sections = @(
    [ordered]@{ id = 'kuleler'; title = @('Kuleler ve yükseltmeler', 'Towers and upgrades'); noun = @('kule', 'towers'); badge = @('Yükseltme yolları · Fiyatlar', 'Upgrade paths · Costs'); text = @('{n} kule: her yükseltmenin adı, fiyatı ve ne yaptığı.', '{n} towers: every upgrade with its cost and effect.'); image = 'portrait'; items = @($towerList) }
  )
  links = @([ordered]@{ label = @('Bloons TD 6', 'Bloons TD 6'); href = '../btd6/' })
  footer = @(
    , @("Babuşlar, Ninja Kiwi ile bağlantılı değildir. $($g.name) ve görselleri Ninja Kiwi'ye aittir.", "Babuşlar is not affiliated with Ninja Kiwi. $($g.name) and its images belong to Ninja Kiwi.")
    , @('Veriler ve görseller Bloons Wiki''den (bloons.fandom.com, CC BY-SA) alınır. Kule ve yükseltme adları İngilizcedir.', 'Data and images come from the Bloons Wiki (bloons.fandom.com, CC BY-SA).')
  )
}
Write-Rehber -Dir $g.dir -Data $data -Source "scripts/btd-classic-data.ps1 -Game $Game"
