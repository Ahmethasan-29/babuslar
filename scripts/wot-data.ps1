# World of Tanks verisi: tanks.gg'nin herkese açık JSON'undan (api/list + api/tank/<slug>) → wot/ klasörü.
#   powershell -ExecutionPolicy Bypass -File scripts/wot-data.ps1
# Teknoloji ağacındaki tanklar (kredi fiyatı olan, etkinlik/gizli olmayan); her tankın en üst donanımındaki değerler.
# Görseller: assets.tanks.gg. Tank verisi Wargaming'e aittir.
. "$PSScriptRoot\rehber-lib.ps1"

$API = 'https://tanks.gg/api'
Write-Host "Tank listesi indiriliyor…"
$list = (Get-WikiText "$API/list") | ConvertFrom-Json
$skip = 'secret|bob|fallout|event_battles|epicBattle|battleRoyale|comp7|clanWarsBattles|lockedInRandomBattles|testTank|special_event|halloween|offensive|steelHunter|mapsTraining|story'
$tanks = @($list.tanks | Where-Object { $_.tags -notmatch $skip -and $_.type -in 'light', 'medium', 'heavy', 'td', 'spg' -and ($_.price -gt 0 -or $_.tier -eq 1) -and -not $_.not_in_shop })
$tanks = @($tanks | Group-Object id | ForEach-Object { $_.Group[0] })
Write-Host "Tank: $($tanks.Count) — ayrıntılar indiriliyor (önbellekli)…"

$NATIONS = [ordered]@{
  germany = @('Almanya', 'Germany'); ussr = @('SSCB', 'U.S.S.R.'); usa = @('ABD', 'U.S.A.'); uk = @('İngiltere', 'U.K.'); france = @('Fransa', 'France')
  china = @('Çin', 'China'); japan = @('Japonya', 'Japan'); czech = @('Çekoslovakya', 'Czechoslovakia'); sweden = @('İsveç', 'Sweden'); poland = @('Polonya', 'Poland'); italy = @('İtalya', 'Italy')
}
$TYPES = [ordered]@{
  light = @('Hafif tank', 'Light tank', '#77c043'); medium = @('Orta tank', 'Medium tank', '#e6c13c'); heavy = @('Ağır tank', 'Heavy tank', '#e5533d')
  td = @('Tank avcısı', 'Tank destroyer', '#4fa3e0'); spg = @('Topçu', 'SPG (artillery)', '#c158d6')
}
$ROMAN = @('', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI')
$num = { param($n, $d = 0) if ($null -eq $n -or $n -eq '') { '' } else { ([double]$n).ToString("N$d", [Globalization.CultureInfo]'tr-TR') } }
$SHELL = @{ ARMOR_PIERCING = 'AP'; ARMOR_PIERCING_CR = 'APCR'; HIGH_EXPLOSIVE = 'HE'; HOLLOW_CHARGE = 'HEAT'; ARMOR_PIERCING_HE = 'APHE'; FLAME = 'Alev' }

$i = 0
$items = foreach ($t in $tanks) {
  $i++
  if ($i % 50 -eq 0) { Write-Host "  $i / $($tanks.Count)" }
  $d = $null
  try { $d = ((Get-WikiText "$API/tank/$($t.slug)") | ConvertFrom-Json).tank } catch { }
  $stats = @(, @(@('Seviye', 'Tier'), $ROMAN[[int]$t.tier]))
  if ($t.price) { $stats += , @(@('Fiyat', 'Price'), "$(& $num $t.price) kredi") }
  if ($d) {
    $turret = @($d.turrets | Sort-Object { [int]$_.tier }, { [double]$_.view_range })[-1]
    $guns = @($d.guns | Where-Object { -not $turret -or $_.turret_id -eq $turret.id })
    if (-not $guns.Count) { $guns = @($d.guns) }
    $gun = @($guns | Sort-Object { [int]$_.tier }, { [double]$_.price })[-1]
    $shells = @($d.shells | Where-Object { $gun -and $_.gun_id -eq $gun.id })
    $engine = @($d.engines | Sort-Object { [double]$_.power })[-1]
    $hp = [int]$d.health + $(if ($turret) { [int]$turret.health } else { 0 })
    $stats += , @(@('Can', 'Hit points'), (& $num $hp))
    $stats += , @(@('Gövde zırhı', 'Hull armor'), "$(& $num $d.armor_front) / $(& $num $d.armor_side) / $(& $num $d.armor_rear)")
    if ($turret -and $turret.armor_front -gt 0) { $stats += , @(@('Kule zırhı', 'Turret armor'), "$(& $num $turret.armor_front) / $(& $num $turret.armor_side) / $(& $num $turret.armor_rear)") }
    $stats += , @(@('Hız', 'Top speed'), "$(& $num $d.forward_speed 1) / -$(& $num $d.reverse_speed) km/sa")
    if ($engine) { $stats += , @(@('Motor', 'Engine'), "$(& $num $engine.power) hp") }
    if ($turret -and $turret.view_range) { $stats += , @(@('Görüş', 'View range'), "$(& $num $turret.view_range) m") }
    if ($gun) {
      $first = $shells | Select-Object -First 1
      if ($first) { $stats += , @(@('Hasar', 'Damage'), (& $num $first.damage)) }
      if ($shells.Count) { $stats += , @(@('Delme', 'Penetration'), (($shells | ForEach-Object { "$(& $num $_.penetration) $($SHELL[$_.type])" }) -join ' / ')) }
      if ($gun.clip_size -gt 1) {
        $stats += , @(@('Şarjör', 'Magazine'), (Bi "$($gun.clip_size) mermi, $(& $num $gun.reload_time 1) sn dolum" "$($gun.clip_size) shells, $(& $num $gun.reload_time 1) s reload"))
      } elseif ($gun.reload_time -gt 0) {
        $stats += , @(@('Dolum süresi', 'Reload'), (Sec (& $num $gun.reload_time 2)))
        if ($first) { $stats += , @(@('Dakikada hasar', 'DPM'), (& $num ([double]$first.damage * 60 / [double]$gun.reload_time))) }
      }
      $stats += , @(@('Nişan / dağılım', 'Aim time / dispersion'), "$(& $num $gun.aim_time 1) sn / $(& $num $gun.dispersion 2)")
    }
  }
  $role = if ($d -and $d.vehicle_role_desc) { $d.vehicle_role_desc } else { $null }
  [ordered]@{
    id = $t.slug; name = $t.name; group = $t.type; tags = @($t.nation)
    image = "https://assets.tanks.gg/icons/tanks/standard/$($t.nation)-$($t.id).png"
    sub = @(("$($NATIONS[$t.nation][0]) · Seviye $($ROMAN[[int]$t.tier])" + $(if ($role) { " · $role" } else { '' })), ("$($NATIONS[$t.nation][1]) · Tier $($ROMAN[[int]$t.tier])" + $(if ($role) { " · $role" } else { '' })))
    stats = $stats
    more = $(if ($d) { $d.description })
    sort = "$(@($NATIONS.Keys).IndexOf($t.nation)) $(@($TYPES.Keys).IndexOf($t.type)) $('{0:D2}' -f [int]$t.tier)"
  }
}
$items = @($items | Sort-Object { $_.sort })
foreach ($x in $items) { $x.Remove('sort') }

$data = [ordered]@{
  game = 'World of Tanks'
  intro = @('15''e 15 tank savaşı. Teknoloji ağacındaki tüm tanklar: ülkeye ve sınıfa göre filtrele, seviyeyi aramaya yaz (ör. "Seviye X"). Değerler tankın en üst donanımı (en iyi kule, top ve motor) içindir.', 'Every tech-tree tank in the 15-vs-15 tank game, filterable by nation and class (search e.g. "Tier X"). Stats are for the fully upgraded configuration.')
  sections = @(
    [ordered]@{ id = 'tanklar'; title = @('Tanklar', 'Tanks'); noun = @('tank', 'tanks'); badge = @('Ülke · Sınıf · Seviye · Değerler', 'Nation · Class · Tier · Stats'); text = @('{n} tank: can, zırh, hız, görüş, hasar, delme, dolum süresi ve dakikada hasar.', '{n} tanks: HP, armor, speed, view range, damage, penetration, reload and DPM.'); image = 'wide'; groups = (Groups $TYPES); tags = @(foreach ($k in $NATIONS.Keys) { [ordered]@{ id = $k; label = $NATIONS[$k] } }); items = $items }
  )
  guide = @(
    [ordered]@{ title = @('Zırh değerleri', 'Reading armor'); text = @('Zırh "ön / yan / arka" sırasıyla, milimetre cinsindendir. Delme değeri, karşı tankın o yüzündeki zırhtan büyükse mermi işler; açılı vurursan zırh daha kalın sayılır.', 'Armor is front / side / rear in millimetres. A shell penetrates if its penetration beats the armor at that spot; angled hits count as thicker armor.') }
    [ordered]@{ title = @('Mermi türleri', 'Shell types'); text = @('Delme satırında mermiler sırasıyla yazar: ilki standart (çoğunlukla AP), ikincisi özel/premium mermi (APCR, HEAT), üçüncüsü HE. HE düşük delmelidir ama delmese de bir miktar hasar verir.', 'The penetration line lists shells in order: standard (usually AP), premium (APCR/HEAT), then HE. HE has low penetration but deals some damage even without penetrating.') }
    [ordered]@{ title = @('Dakikada hasar (DPM)', 'Damage per minute'); text = @('DPM = hasar × 60 / dolum süresi. Uzun süren çatışmalarda DPM, tek atış hasarından daha önemlidir. Şarjörlü toplarda dolum süresi bütün şarjörün dolmasıdır.', 'DPM = damage × 60 / reload. In long fights DPM matters more than alpha damage. For autoloaders the reload is for the whole magazine.') }
  )
  footer = @(
    , @('Babuşlar, Wargaming ile bağlantılı değildir. World of Tanks ve görselleri Wargaming''e aittir.', 'Babuşlar is not affiliated with Wargaming. World of Tanks and its images belong to Wargaming.')
    , @('Tank değerleri ve görselleri tanks.gg''den alınır. Tank adları İngilizcedir.', 'Tank stats and images come from tanks.gg.')
  )
}
Write-Rehber -Dir 'wot' -Data $data -Source 'scripts/wot-data.ps1'
