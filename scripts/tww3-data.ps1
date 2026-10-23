# Total War: Warhammer III verisi: Total War: Warhammer Wiki (totalwarwarhammer.fandom.com, CC BY-SA) → tww3/ klasörü.
#   powershell -ExecutionPolicy Bypass -File scripts/tww3-data.ps1
# Birimler (ırka göre; maliyet, bakım, can, liderlik, hız, yakın dövüş saldırı/savunma, hücum) ve efsanevi lordlar.
# Birim sayfalarındaki {{Infobox unit tw3}} + birimin "<id> main" ve "<id> general" şablonları okunur.
. "$PSScriptRoot\rehber-lib.ps1"

$API = 'https://totalwarwarhammer.fandom.com/api.php'
function Category-Titles([string]$cat) {
  $out = @(); $cont = ''
  do {
    $r = (Get-WikiText "$API`?action=query&list=categorymembers&cmtitle=$([Uri]::EscapeDataString($cat))&cmnamespace=0&cmlimit=500&format=json$cont") | ConvertFrom-Json
    $out += @($r.query.categorymembers | ForEach-Object { $_.title })
    $cont = if ($r.continue) { '&cmcontinue=' + [Uri]::EscapeDataString($r.continue.cmcontinue) } else { '' }
  } while ($cont)
  $out
}
Write-Host "Birim listesi indiriliyor…"
$titles = Category-Titles 'Category:Total War: Warhammer III units'
$lordTitles = Category-Titles 'Category:Total War: Warhammer III legendary lords'
Write-Host "Birim: $($titles.Count), efsanevi lord: $($lordTitles.Count) — sayfalar indiriliyor…"
$pages = Get-WikiPages $API @($titles + $lordTitles | Sort-Object -Unique)

# Birim kimliği → şablon adı: wh3_main_ksl_inf_x_0 → "Template:Wh3 main ksl inf x 0 general"
$units = @()
foreach ($t in ($titles + $lordTitles | Sort-Object -Unique)) {
  $text = $pages[$t]
  if (-not $text) { continue }
  $ib = Get-InfoboxParams $text 'Infobox unit tw3'
  if (-not $ib.Count) { $ib = Get-InfoboxParams $text 'Infobox unit tw1' }
  if (-not $ib.Count) { $ib = Get-InfoboxParams $text 'Infobox unit' }
  if (-not $ib['id']) { continue }
  $id = ($ib['id'] -split '<br|\n|,')[0].Trim()
  $tpl = ($id -replace '_', ' ')
  $tpl = 'Template:' + $tpl.Substring(0, 1).ToUpperInvariant() + $tpl.Substring(1)
  $units += [pscustomobject]@{ title = $t; text = $text; ib = $ib; tpl = $tpl; lord = ($lordTitles -contains $t) }
}
Write-Host "Şablonlar indiriliyor ($($units.Count) birim)…"
$tplPages = Get-WikiPages $API @($units | ForEach-Object { "$($_.tpl) main"; "$($_.tpl) general" })

function Clean-Value([string]$v) {
  if (-not $v) { return $null }
  $v = $v -replace '\{\{[^{}|]*\|?([^{}]*)\}\}', '$1' -replace '<br\s*/?>', ' / '
  $v = Clean-WikiText $v
  if ($v -match '^\s*$') { $null } else { $v }
}
$files = New-Object System.Collections.ArrayList
$RACES = [ordered]@{}
$items = foreach ($u in $units) {
  $main = Get-InfoboxParams $tplPages["$($u.tpl) main"] 'Unit main'
  $gen = Get-InfoboxParams $tplPages["$($u.tpl) general"] 'Unit general'
  $race = Clean-Value $u.ib['race']
  if (-not $race) { $race = 'Diğer' }
  $rid = Slug $race
  if (-not $RACES.Contains($rid)) { $RACES[$rid] = @($race, $race, $null) }
  $stats = @()
  foreach ($s in @(@($main, 'cost', 'Maliyet', 'Cost'), @($main, 'maint', 'Bakım (tur)', 'Upkeep'), @($main, 'tier', 'Seviye', 'Tier'), @($gen, 'health', 'Can (kişi başı)', 'Health (per entity)'), @($gen, 'leadership', 'Liderlik', 'Leadership'), @($gen, 'speed', 'Hız', 'Speed'), @($gen, 'melee attack', 'Yakın saldırı', 'Melee attack'), @($gen, 'melee defence', 'Yakın savunma', 'Melee defence'), @($gen, 'charge', 'Hücum bonusu', 'Charge bonus'), @($gen, 'ammo', 'Cephane', 'Ammo'))) {
    $v = Clean-Value $s[0][$s[1]]
    if ($v) { $stats += , @(@($s[2], $s[3]), $v) }
  }
  $size = Clean-Value $u.ib['unit size']
  if ($size -and $size -match 'Large:\s*(\d+)') { $stats += , @(@('Birim boyu (büyük)', 'Unit size (large)'), $Matches[1]) }
  $img = ImageName $u.ib['image'] $null
  if ($img) { [void]$files.Add($img) }
  $quote = if ($u.text -match '\{\{Quote\|([^|}]+)') { Clean-WikiText $Matches[1] } else { $null }
  $desc = $null
  if ($u.text -match '(?s)== *Description *==\s*(.+?)(\n==|\{\{Navbox|$)') { $desc = Clean-WikiText (($Matches[1] -replace '\{\{[^{}]*\}\}', '') -split "`n" | Where-Object { $_.Trim() } | Select-Object -First 2) }
  [ordered]@{
    id = Slug $u.title; name = $u.title; file = $img; group = $rid
    tags = @($(if ($u.lord) { 'lord' } else { 'unit' }))
    sub = (Clean-Value $u.ib['type']); quote = $quote; stats = $stats; more = $desc
  }
}
Write-Host "Resim adresleri alınıyor ($($files.Count))…"
$urls = Get-WikiImageUrls $API @($files)
$missing = 0
foreach ($x in $items) { $u = if ($x.file) { $urls[$x.file] }; if ($u) { $x.image = Thumb $u 320 } else { $missing++ }; $x.Remove('file') }
Write-Host "Resmi bulunamayan: $missing / $(@($items).Count)"

$RACE_TR = @{ 'The Empire' = 'İmparatorluk'; 'Dwarfs' = 'Cüceler'; 'Kislev' = 'Kislev'; 'Grand Cathay' = 'Büyük Cathay'; 'Bretonnia' = 'Bretonnia'; 'High Elves' = 'Yüce Elfler'; 'Dark Elves' = 'Kara Elfler'; 'Wood Elves' = 'Orman Elfleri'; 'Lizardmen' = 'Kertenkele Adamlar'; 'Skaven' = 'Skaven'; 'Tomb Kings' = 'Mezar Kralları'; 'Vampire Counts' = 'Vampir Kontları'; 'Vampire Coast' = 'Vampir Kıyısı'; 'Greenskins' = 'Yeşilderililer'; 'Ogre Kingdoms' = 'Ogre Krallıkları'; 'Norsca' = 'Norsca'; 'Beastmen' = 'Hayvan Adamlar'; 'Warriors of Chaos' = 'Kaos Savaşçıları'; 'Chaos Dwarfs' = 'Kaos Cüceleri'; 'Daemons of Chaos' = 'Kaos İblisleri'; 'Neutral' = 'Tarafsız'; 'Undead Legions' = 'Ölümsüz Lejyonlar'; 'Khorne' = 'Khorne'; 'Nurgle' = 'Nurgle'; 'Slaanesh' = 'Slaanesh'; 'Tzeentch' = 'Tzeentch' }
foreach ($k in @($RACES.Keys)) { $en = $RACES[$k][1]; if ($RACE_TR[$en]) { $RACES[$k][0] = $RACE_TR[$en] } }
$RACES_SORTED = [ordered]@{}
foreach ($k in ($RACES.Keys | Sort-Object { $RACES[$_][0] })) { $RACES_SORTED[$k] = $RACES[$k] }

$data = [ordered]@{
  game = 'Total War: Warhammer III'
  intro = @('Warhammer Fantasy dünyasında sıra tabanlı harita + gerçek zamanlı savaş. Tüm ırkların birimleri ve efsanevi lordları: ırka göre filtrele; "Efsanevi lordlar" düğmesi yalnızca lordları gösterir.', 'Turn-based campaign plus real-time battles in the Warhammer Fantasy world. Every race''s units and legendary lords, filterable by race.')
  sections = @(
    [ordered]@{ id = 'birimler'; title = @('Birimler ve lordlar', 'Units and lords'); noun = @('birim', 'units'); badge = @('Irk · Maliyet · Savaş değerleri', 'Race · Cost · Battle stats'); text = @('{n} birim ve efsanevi lord: maliyet, bakım, can, liderlik, hız ve yakın dövüş değerleri.', '{n} units and legendary lords: cost, upkeep, health, leadership, speed and melee stats.'); image = 'wide'; groups = (Groups $RACES_SORTED); tags = @([ordered]@{ id = 'lord'; label = @('Efsanevi lordlar', 'Legendary lords') }, [ordered]@{ id = 'unit'; label = @('Birimler', 'Units') }); items = @($items | Sort-Object { $_.name }) }
  )
  guide = @(
    [ordered]@{ title = @('Maliyet ve bakım', 'Cost and upkeep'); text = @('Maliyet birimi bir kez almak, bakım her tur ödenen paradır. Parantez içindeki maliyet çok oyunculu savaş fiyatıdır.', 'Cost is paid once; upkeep is paid every turn. The cost in brackets is the multiplayer battle price.') }
    [ordered]@{ title = @('Yakın saldırı ve savunma', 'Melee attack and defence'); text = @('Saldıranın yakın saldırısı, savunanın yakın savunmasından ne kadar yüksekse vuruş şansı o kadar artar. Hücum bonusu yalnızca koşarak saldırının ilk anında etkilidir.', 'The higher the attacker''s melee attack is above the defender''s melee defence, the more hits land. Charge bonus only applies at the start of a charge.') }
    [ordered]@{ title = @('Liderlik', 'Leadership'); text = @('Liderlik düşerse birlik kaçar. Kayıplar, kuşatılma ve korku etkileri liderliği düşürür; yüksek liderlikli birlikler hattı daha uzun tutar.', 'Units rout when leadership breaks. Casualties, flanking and fear lower it; high-leadership units hold the line longer.') }
  )
  footer = @(
    , @('Babuşlar, Creative Assembly, SEGA ve Games Workshop ile bağlantılı değildir. Total War: Warhammer III ve görselleri sahiplerine aittir.', 'Babuşlar is not affiliated with Creative Assembly, SEGA or Games Workshop. Total War: Warhammer III and its images belong to their owners.')
    , @('Veriler ve görseller Total War: Warhammer Wiki''den (totalwarwarhammer.fandom.com, CC BY-SA) alınır. Birim adları İngilizcedir.', 'Data and images come from the Total War: Warhammer Wiki (totalwarwarhammer.fandom.com, CC BY-SA).')
  )
}
Write-Rehber -Dir 'tww3' -Data $data -Source 'scripts/tww3-data.ps1'
