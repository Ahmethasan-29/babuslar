# Hearts of Iron II, III ve IV verisi → hoi2/, hoi3/, hoi4/ klasörleri.
#   powershell -ExecutionPolicy Bypass -File scripts/hoi-data.ps1 -Game HOI4 -Dump hoi4-pages.json
# Paradox wikileri (hoiN.paradoxwikis.com, CC BY-SA) betik isteklerini "Client Challenge" sayfasıyla engeller; bu yüzden sayfalar
# tarayıcıdan alınır: wikide bir sayfa açıp konsolda api.php ile sayfaların vikimetnini çekip { "Başlık": "metin" } JSON'u olarak
# kaydet ve -Dump ile ver. Gereken sayfalar:
#   HOI4: Countries, Land units, Equipment, Achievements
#   HOI3: Country statistics, Land/Air/Naval unit statistics by unit, Command structure (Top military leaders)
#   HOI2: Ground unit statistics, Air unit statistics, Naval unit statistics, List of countries
param([ValidateSet('HOI2', 'HOI3', 'HOI4')][string]$Game = 'HOI4', [Parameter(Mandatory)][string]$Dump)
. "$PSScriptRoot\wikitable-lib.ps1"
. "$PSScriptRoot\rehber-lib.ps1"

$pages = [IO.File]::ReadAllText($Dump, [Text.Encoding]::UTF8) | ConvertFrom-Json
if ($pages.PSObject.Properties.Name -contains $Game.ToLowerInvariant()) { $pages = $pages.($Game.ToLowerInvariant()) }
function Page([string]$t) { $p = $pages.$t; if (-not $p) { throw "Dökümde sayfa yok: $t" }; $p }

# Hücre metni: simgeler atılır, {{şablon|…|metin}} → metin, bağlantılar sadeleşir
function Cell([string]$c) {
  if (-not $c) { return '' }
  $c = $c -replace '\[\[(?:File|Image):[^\]]*\]\]', '' -replace '(?i)\{\{icon\|[^{}]*\}\}', '' -replace '(?i)\{\{(Cite[^{}]*|ref[^{}]*)\}\}', '' -replace '<ref[^>]*/>', '' -replace '(?s)<ref.*?</ref>', ''
  $rx = [regex]'\{\{([^{}]*)\}\}'
  while ($rx.IsMatch($c)) { $c = $rx.Replace($c, { param($m) $p = $m.Groups[1].Value -split '\|'; if ($p.Count -gt 1) { $p[-1] } else { '' } }) }
  ((Clean-WikiText ($c -replace '&nbsp;', ' ' -replace '<br\s*/?>', ', ')) -replace '^[,\s]+|[,\s]+$', '' -replace '^\+(?=\d)', '')
}

# Tablonun sütun adları: iki satırlı başlıkta rowspan=2 hücreler doğrudan, colspan=N hücreler ikinci satırdaki adlarla doldurulur
function Get-Header([string]$table) {
  $hrows = @(); $cur = @()
  foreach ($line in ($table -split "`n")) {
    $l = $line.TrimEnd("`r")
    if ($l -match '^\s*\|-') { if ($cur.Count) { $hrows += , $cur; $cur = @() }; continue }
    if ($l -match '^\s*!') { foreach ($h in (Split-Inline ($l -replace '^\s*!', '') '!!')) { $cur += , (Split-Cell $h) } }
    elseif ($l -match '^\s*\|' -and $hrows.Count + [int][bool]$cur.Count -ge 1 -and $cur.Count -eq 0 -and $l -notmatch '^\s*\|\+') { if ($hrows.Count) { break } }
  }
  if ($cur.Count) { $hrows += , $cur }
  if (-not $hrows.Count) { return @() }
  $names = New-Object System.Collections.ArrayList; $slots = @()
  foreach ($h in $hrows[0]) {
    $span = if ($h.attrs -match 'colspan\s*=\s*"?(\d+)') { [int]$Matches[1] } else { 1 }
    if ($span -gt 1 -and $hrows.Count -gt 1) { for ($k = 0; $k -lt $span; $k++) { $slots += $names.Count; [void]$names.Add($null) } }
    else { [void]$names.Add((HeadName $h.text)) }
  }
  if ($hrows.Count -gt 1) { $k = 0; foreach ($h in $hrows[1]) { if ($k -lt $slots.Count) { $names[$slots[$k]] = HeadName $h.text; $k++ } } }
  @($names)
}
# Başlık adı: [[File:x.png|Başlık]] → Başlık (wikitable-lib), yoksa hücre metni
function HeadName([string]$t) { $n = Header-Name $t; if ($n -match "^{{") { $n = Cell $t }; if (-not $n) { $n = Cell $t }; $n }
function Col($names, [string[]]$want) { for ($i = 0; $i -lt $names.Count; $i++) { foreach ($w in $want) { if ($names[$i] -like $w) { return $i } } }; -1 }
function StatsFrom($row, $names, $spec) {
  $out = @()
  foreach ($s in $spec) {
    $i = Col $names $s[0]
    if ($i -ge 0 -and $i -lt $row.Count) { $v = Cell $row[$i]; if ($v -and $v -notmatch '^(0|0\.0|-|—)?$') { $out += , @(@($s[1], $s[2]), $v) } }
  }
  $out
}

$sections = @(); $guide = @(); $intro = $null; $name = $null
$IDEOLOGIES = [ordered]@{
  democratic = @('Demokratik', 'Democratic', '#4fa3e0'); fascism = @('Faşist', 'Fascist', '#8a6d3b')
  communism = @('Komünist', 'Communist', '#e5533d'); neutrality = @('Tarafsız', 'Non-aligned', '#9aa0a6')
}

if ($Game -eq 'HOI4') {
  $name = 'Hearts of Iron IV'
  $intro = @('1936''dan başlayan İkinci Dünya Savaşı strateji oyunu: bir ülkeyi seç, ulusal odak ağacıyla yönet, fabrika kur, ordunu tasarla ve cepheleri yönet.', 'A WWII grand strategy game from 1936: pick a country, follow its national focus tree, build factories, design your army and run the fronts.')
  # Ülkeler (1936 başlangıcı)
  $t = (Split-WikiTables (Page 'Countries'))[0]
  $names = Get-Header $t.text
  $countries = foreach ($r in (Get-TableRows $t.text)) {
    $n = Cell $r[0]; if (-not $n) { continue }
    $ideo = if ($r[2] -match 'democra') { 'democratic' } elseif ($r[2] -match 'fascis') { 'fascism' } elseif ($r[2] -match 'communis') { 'communism' } else { 'neutrality' }
    $stats = StatsFrom $r $names @(
      @('States', 'Eyalet', 'States'), @('Research slots', 'Araştırma yuvası', 'Research slots'), @('Core population', 'Nüfus', 'Core population'),
      @('Total factories', 'Toplam fabrika', 'Total factories'), @('Total resources', 'Toplam kaynak', 'Total resources'), @('Building slots', 'İnşaat yuvası', 'Building slots')
    )
    # Fabrika türleri ve kaynaklar ikonlu başlıklarda: sıradan bulunur (askerî / tersane / sivil)
    $fi = Col $names @('Building slots')
    if ($fi -ge 0) { $stats += , @(@('Askerî / tersane / sivil fabrika', 'Military / naval / civilian'), "$(Cell $r[$fi + 1]) / $(Cell $r[$fi + 2]) / $(Cell $r[$fi + 3])") }
    [ordered]@{ id = Slug $n; name = $n; sub = (Cell $r[1]); group = $ideo; stats = $stats; more = $(if ($r.Count -gt 23) { Cell $r[23] }) }
  }
  # Kara birlikleri
  $units = foreach ($t in (Split-WikiTables (Page 'Land units'))) {
    $names = Get-Header $t.text
    foreach ($r in (Get-TableRows $t.text)) {
      $n = Cell $r[0]; if (-not $n) { continue }
      $stats = StatsFrom $r $names @(
        @('HP', 'Can (HP)', 'HP'), @('Org.', 'Organizasyon', 'Organization'), @('Width', 'Cephe genişliği', 'Combat width'), @('Soft Atk.', 'Yumuşak saldırı', 'Soft attack'),
        @('Hard Atk.', 'Sert saldırı', 'Hard attack'), @('Defence', 'Savunma', 'Defense'), @('Breakthr.', 'Yarma', 'Breakthrough'), @('Armor', 'Zırh', 'Armor'),
        @('Pierce', 'Delme', 'Piercing'), @('Speed', 'Hız', 'Speed'), @('Manpower*', 'İnsan gücü', 'Manpower'), @('Training', 'Eğitim (gün)', 'Training (days)'), @('Equip.', 'Ekipman', 'Equipment')
      )
      $mi = 11
      if (-not ($stats | Where-Object { $_[0][0] -eq 'İnsan gücü' }) -and $r.Count -gt $mi) { $v = Cell $r[$mi]; if ($v -match '^\d') { $stats += , @(@('İnsan gücü', 'Manpower'), $v) } }
      $fx = Col $names @('Special Effects')
      [ordered]@{ id = Slug $n; name = $n; group = (Slug $t.heading); stats = $stats; more = $(if ($fx -ge 0) { Cell $r[$fx] }) }
    }
  }
  $UNIT_GROUPS = [ordered]@{}
  foreach ($t in (Split-WikiTables (Page 'Land units'))) { $UNIT_GROUPS[(Slug $t.heading)] = @($t.heading, $t.heading, $null) }
  $UNIT_TR = @{ 'Infantry Battalions' = 'Piyade taburları'; 'Mobile Battalions' = 'Hareketli taburlar'; 'Combat Support Battalions' = 'Muharebe destek taburları'; 'Mobile Combat Support Battalions' = 'Hareketli destek taburları'; 'Armored Battalions' = 'Zırhlı taburlar'; 'Armored Combat Support Battalions' = 'Zırhlı destek taburları'; 'Support Companies' = 'Destek bölükleri'; 'Railway Artillery' = 'Demiryolu topçusu' }
  foreach ($k in @($UNIT_GROUPS.Keys)) { $en = $UNIT_GROUPS[$k][1]; if ($UNIT_TR[$en]) { $UNIT_GROUPS[$k][0] = $UNIT_TR[$en] } }
  # Ekipman
  $EQ_GROUPS = [ordered]@{}
  $equip = foreach ($t in (Split-WikiTables (Page 'Equipment'))) {
    $names = Get-Header $t.text
    foreach ($r in (Get-TableRows $t.text)) {
      $type = Cell $r[0]; $n = Cell $r[1]; if (-not $n) { continue }
      $g = Slug $type; if (-not $EQ_GROUPS.Contains($g)) { $EQ_GROUPS[$g] = @($type, $type, $null) }
      $stats = StatsFrom $r $names @(
        @('soft attack', 'Yumuşak saldırı', 'Soft attack'), @('hard attack', 'Sert saldırı', 'Hard attack'), @('air attack', 'Hava saldırısı', 'Air attack'), @('defense', 'Savunma', 'Defense'),
        @('breakthrough', 'Yarma', 'Breakthrough'), @('Armor', 'Zırh', 'Armor'), @('Pierc.', 'Delme', 'Piercing'), @('Speed*', 'Hız (km/sa)', 'Speed (km/h)'), @('Reli.', 'Güvenilirlik', 'Reliability'), @('production cost', 'Üretim bedeli', 'Production cost')
      )
      [ordered]@{ id = Slug "$type $n"; name = $n; sub = $type; group = $g; stats = $stats }
    }
  }
  # Başarımlar (DLC'ye göre)
  $DIFFICULTY = @{ VE = @('Çok kolay', 'Very easy'); E = @('Kolay', 'Easy'); M = @('Orta', 'Medium'); H = @('Zor', 'Hard'); VH = @('Çok zor', 'Very hard'); I = @('Çılgın', 'Insane') }
  $ACH_GROUPS = [ordered]@{}
  $ach = foreach ($t in (Split-WikiTables (Page 'Achievements'))) {
    $g = Slug $t.heading; $ACH_GROUPS[$g] = @($(if ($t.heading -eq 'Base game') { 'Ana oyun' } else { $t.heading }), $t.heading, $null)
    foreach ($r in (Get-TableRows $t.text)) {
      if ($r[0] -notmatch '\{\{Iconbox\|([^|}]+)\|([^|}]*)') { continue }
      $n = Clean-WikiText $Matches[1]; $d = Cell $Matches[2]
      $di = if (($r -join ' ') -match '\{\{DI\|(\w+)') { $DIFFICULTY[$Matches[1]] } else { $null }
      $stats = @()
      if ($di) { $stats += , @(@('Zorluk', 'Difficulty'), $di) }
      $start = Cell $r[1]; if ($start) { $stats += , @(@('Başlangıç', 'Start'), $start) }
      [ordered]@{ id = Slug "$g $n"; name = $n; group = $g; desc = $d; stats = $stats; lists = @([ordered]@{ title = @('Koşullar', 'Requirements'); items = @(((Cell $r[2]) -split '\s*\*\s*' | Where-Object { $_ })) }); more = (Cell $r[3]) }
    }
  }
  $sections = @(
    [ordered]@{ id = 'ulkeler'; title = @('Ülkeler (1936)', 'Countries (1936)'); noun = @('ülke', 'countries'); badge = @('İdeoloji · Fabrika · Kaynak', 'Ideology · Factories · Resources'); text = @('1936 başlangıcındaki {n} ülke: ideoloji, eyalet, fabrika ve kaynaklar.', '{n} countries at the 1936 start: ideology, states, factories and resources.'); image = 'none'; groups = (Groups $IDEOLOGIES); items = @($countries | Sort-Object { $_.name }) }
    [ordered]@{ id = 'birlikler'; title = @('Kara birlikleri', 'Land units'); noun = @('birlik', 'units'); badge = @('Tabur değerleri', 'Battalion stats'); text = @('{n} tabur ve destek bölüğü: saldırı, savunma, genişlik ve maliyet.', '{n} battalions and support companies with their stats.'); image = 'none'; groups = (Groups $UNIT_GROUPS); items = @($units) }
    [ordered]@{ id = 'ekipman'; title = @('Ekipman', 'Equipment'); noun = @('ekipman', 'equipment'); badge = @('Saldırı · Zırh · Maliyet', 'Attack · Armor · Cost'); text = @('{n} ekipman modeli, türüne göre.', '{n} equipment models by type.'); image = 'none'; groups = (Groups $EQ_GROUPS); items = @($equip) }
    [ordered]@{ id = 'basarimlar'; title = @('Başarımlar', 'Achievements'); noun = @('başarım', 'achievements'); badge = @('DLC · Zorluk · Koşullar', 'DLC · Difficulty · Requirements'); text = @('{n} başarım: hangi DLC''de, ne kadar zor ve nasıl yapılır.', '{n} achievements: DLC, difficulty and how to get them.'); image = 'none'; groups = (Groups $ACH_GROUPS); items = @($ach) }
  )
  $guide = @(
    [ordered]@{ title = @('İlk oyun için', 'For your first game'); text = @('İlk oyunda büyük ve güvenli bir ülke seç (ör. ABD ya da İngiltere). Ülkeler sayfasında her ülkenin başlangıç fabrikaları ve kaynakları var: çok sivil fabrika (CIC) hızlı büyümek demektir.', 'Pick a big, safe country first (e.g. the USA or the UK). The Countries page lists each country''s starting factories and resources; lots of civilian factories means fast growth.') }
    [ordered]@{ title = @('Tümen tasarımı', 'Division design'); text = @('Cephe genişliği (width) savaşa ne kadar asker sokabileceğini belirler. Kara birlikleri sayfasında her taburun genişliği, saldırısı ve savunması var; piyadeyi topçu ve destek bölükleriyle güçlendir.', 'Combat width decides how many troops fight at once. The Land units page lists width, attack and defense for each battalion; back infantry with artillery and support companies.') }
    [ordered]@{ title = @('Zırh ve delme', 'Armor and piercing'); text = @('Bir birliğin zırhı rakibin delmesinden yüksekse ciddi avantaj kazanır. Ekipman sayfasında zırh ve delme değerleri yan yana.', 'If a unit''s armor is higher than the enemy''s piercing, it gets a big advantage. The Equipment page shows armor and piercing side by side.') }
    [ordered]@{ title = @('Başarımlar ve demir adam', 'Achievements and ironman'); text = @('Başarımlar yalnızca Ironman modunda, normal zorlukta ya da daha zorunda ve oyun kuralları değiştirilmeden açılır.', 'Achievements only unlock in Ironman mode, on Normal or harder, with default game rules.') }
  )
}

if ($Game -eq 'HOI3') {
  $name = 'Hearts of Iron III'
  $intro = @('2009''da çıkan üçüncü oyun: çok ayrıntılı il haritası, tugay tugay kurulan tümenler, bakanlar ve komutanlar. Değerler oyunun yıllara göre teknolojileriyle değişir.', 'The 2009 third game: a detailed province map, divisions built brigade by brigade, ministers and commanders. Stats change with yearly technology.')
  $t = (Split-WikiTables (Page 'Country statistics'))[0]
  $names = Get-Header $t.text
  $countries = foreach ($r in (Get-TableRows $t.text)) {
    $n = Cell $r[0]; if (-not $n) { continue }
    [ordered]@{ id = Slug $n; name = $n; stats = (StatsFrom $r $names @(@('IC', 'Sanayi (IC)', 'Industry (IC)'), @('Leadership', 'Liderlik', 'Leadership'), @('Manpower', 'İnsan gücü', 'Manpower'), @('Victory Points', 'Zafer puanı', 'Victory points'), @('Energy', 'Enerji', 'Energy'), @('Metal', 'Metal', 'Metal'), @('Rare Materials', 'Nadir madde', 'Rare materials'), @('Crude Oil', 'Ham petrol', 'Crude oil'), @('National Unity', 'Ulusal birlik', 'National unity'), @('Neutrality', 'Tarafsızlık', 'Neutrality'))) }
  }
  $countries = @($countries | Group-Object { $_.name } | ForEach-Object { $_.Group[0] })
  # Birlikler: her birimin tablosu yıllara göre; en son yılın değerleri gösterilir, yıllar listede
  $KIND = [ordered]@{ land = @('Kara', 'Land', '#77c043'); air = @('Hava', 'Air', '#4fa3e0'); naval = @('Deniz', 'Naval', '#6ec6ff') }
  $units = foreach ($k in @(@('land', 'Land unit statistics by unit'), @('air', 'Air unit statistics by unit'), @('naval', 'Naval unit statistics by unit'))) {
    foreach ($t in (Split-WikiTables (Page $k[1]))) {
      if ($t.heading -match 'Derived') { continue }
      $names = Get-Header $t.text
      $rows = @(Get-TableRows $t.text | Where-Object { (Cell $_[0]) -match '^\d{4}$' })
      if (-not $rows.Count) { continue }
      $last = $rows[-1]
      $spec = @(@('IC', 'Üretim (IC)', 'Cost (IC)'), @('Time', 'Süre (gün)', 'Build time (days)'), @('MP', 'İnsan gücü', 'Manpower'), @('Soft Att.', 'Yumuşak saldırı', 'Soft attack'), @('Hard Att.', 'Sert saldırı', 'Hard attack'), @('Air Att.', 'Hava saldırısı', 'Air attack'), @('Sea Att.', 'Deniz saldırısı', 'Sea attack'), @('Def.', 'Savunma', 'Defense'), @('Org', 'Organizasyon', 'Organization'), @('Width', 'Genişlik', 'Width'))
      $lines = foreach ($r in $rows) { $st = @(StatsFrom $r $names ($spec | Select-Object -Skip 3 -First 5)); $h = "[[k|$(Cell $r[0])]] "; Bi ($h + (($st | ForEach-Object { "$($_[0][0]) $($_[1])" }) -join ", ")) ($h + (($st | ForEach-Object { "$($_[0][1]) $($_[1])" }) -join ", ")) }
      [ordered]@{ id = Slug $t.heading; name = $t.heading; sub = @("$(Cell $last[0]) değerleri", "$(Cell $last[0]) stats"); group = $k[0]; stats = (StatsFrom $last $names $spec); lists = @([ordered]@{ title = @('Yıllara göre', 'By year'); items = @($lines) }) }
    }
  }
  $t = (Split-WikiTables (Page 'Command structure'))
  $LT = [ordered]@{ land = @('Kara', 'Land', '#77c043'); sea = @('Deniz', 'Sea', '#6ec6ff'); air = @('Hava', 'Air', '#4fa3e0') }
  $leaders = foreach ($tb in $t) {
    $names = Get-Header $tb.text
    foreach ($r in (Get-TableRows $tb.text)) {
      $n = Cell $r[0]; if (-not $n) { continue }
      [ordered]@{ id = Slug "$n $(Cell $r[2])"; name = $n; sub = (Cell $r[2]); group = (Cell $r[1]).ToLowerInvariant(); stats = (StatsFrom $r $names @(@('Skill', 'Beceri', 'Skill'), @('Max Skill', 'En yüksek beceri', 'Max skill'), @('Start Date', 'Göreve başlama', 'Available from'))); desc = (Cell $r[5]) }
    }
  }
  $leaders = @($leaders | Group-Object { $_.id } | ForEach-Object { $_.Group[0] })
  $sections = @(
    [ordered]@{ id = 'ulkeler'; title = @('Ülkeler', 'Countries'); noun = @('ülke', 'countries'); badge = @('IC · Liderlik · Kaynak', 'IC · Leadership · Resources'); text = @('{n} ülke: sanayi, liderlik, insan gücü ve kaynaklar.', '{n} countries: industry, leadership, manpower and resources.'); image = 'none'; items = @($countries | Sort-Object { $_.name }) }
    [ordered]@{ id = 'birlikler'; title = @('Birlikler', 'Units'); noun = @('birlik', 'units'); badge = @('Kara · Hava · Deniz', 'Land · Air · Naval'); text = @('{n} birlik türü: yıllara göre değerleri.', '{n} unit types with stats by year.'); image = 'none'; groups = (Groups $KIND); items = @($units) }
    [ordered]@{ id = 'komutanlar'; title = @('Komutanlar', 'Commanders'); noun = @('komutan', 'commanders'); badge = @('Beceri · Özellikler', 'Skill · Traits'); text = @('En iyi {n} komutan: becerisi ve özellikleri.', 'The top {n} commanders with skill and traits.'); image = 'none'; groups = (Groups $LT); items = @($leaders) }
  )
  $guide = @(
    [ordered]@{ title = @('Tugay ve tümen', 'Brigades and divisions'); text = @('HOI3''te tümenler tugaylardan kurulur (en fazla 4-5 tugay). Birlikler sayfasındaki yumuşak/sert saldırı değerleri, rakibin ne kadar zırhlı olduğuna göre hangi tugayın işe yarayacağını gösterir.', 'Divisions are built from brigades. Soft/hard attack on the Units page shows which brigade fits against soft or armored enemies.') }
    [ordered]@{ title = @('Liderlik puanı', 'Leadership'); text = @('Liderlik; araştırma, diplomasi, casusluk ve subay üretimine dağıtılır. Ülkeler sayfasındaki liderlik değeri ne kadar araştırma yapabileceğini belirler.', 'Leadership is split between research, diplomacy, espionage and officers. A country''s leadership value decides how much it can research.') }
  )
}

if ($Game -eq 'HOI2') {
  $name = 'Hearts of Iron II'
  $intro = @('2005''te çıkan ikinci oyun (Doomsday ve Armageddon eklentileriyle): bölge haritası, teknoloji ekipleri, bakanlar ve tümen + tugay sistemi.', 'The 2005 second game (with Doomsday and Armageddon): province map, tech teams, ministers and the division + brigade system.')
  $t = (Split-WikiTables (Page 'List of countries'))[0]
  $REG = [ordered]@{}
  $countries = foreach ($r in (Get-TableRows $t.text)) {
    $n = Cell $r[0]; if (-not $n) { continue }
    $region = Cell $r[2]; if ($region -and -not $REG.Contains((Slug $region))) { $REG[(Slug $region)] = @($region, $region, $null) }
    [ordered]@{ id = Slug $n; name = $n; sub = (Cell $r[1]); group = (Slug $region); stats = @(, @(@('Başkent', 'Capital'), (Cell $r[3])), , @(@('1936 / 1939 / 1941 / 1944', '1936 / 1939 / 1941 / 1944'), "$(Cell $r[4]) / $(Cell $r[5]) / $(Cell $r[6]) / $(Cell $r[7])")) }
  }
  $KIND = [ordered]@{ land = @('Kara', 'Land', '#77c043'); air = @('Hava', 'Air', '#4fa3e0'); naval = @('Deniz', 'Naval', '#6ec6ff') }
  $units = foreach ($k in @(@('land', 'Ground unit statistics'), @('air', 'Air unit statistics'), @('naval', 'Naval unit statistics'))) {
    foreach ($t in (Split-WikiTables (Page $k[1]))) {
      $names = Get-Header $t.text
      $rows = @(Get-TableRows $t.text | Where-Object { Cell $_[0] })
      if (-not $rows.Count) { continue }
      $spec = @(@('Soft Attack', 'Yumuşak', 'Soft'), @('Hard Attack', 'Sert', 'Hard'), @('Air Attack', 'Hava', 'Air'), @('Sea Attack', 'Deniz', 'Sea'), @('Naval Attack', 'Deniz', 'Naval'), @('Defens*', 'Savunma', 'Defense'), @('Cost', 'Bedel', 'Cost'))
      $lines = foreach ($r in $rows) { $st = @(StatsFrom $r $names $spec); $h = "[[k|$(Cell $r[0])]] "; Bi ($h + (($st | ForEach-Object { "$($_[0][0]) $($_[1])" }) -join ", ")) ($h + (($st | ForEach-Object { "$($_[0][1]) $($_[1])" }) -join ", ")) }
      $last = $rows[-1]
      [ordered]@{ id = Slug $t.heading; name = $t.heading; sub = (Cell $last[0]); group = $k[0]; stats = (StatsFrom $last $names @(@('Default ORG', 'Organizasyon', 'Organization'), @('Morale', 'Moral', 'Morale'), @('Soft Attack', 'Yumuşak saldırı', 'Soft attack'), @('Hard Attack', 'Sert saldırı', 'Hard attack'), @('Air Attack', 'Hava saldırısı', 'Air attack'), @('Sea Attack', 'Deniz saldırısı', 'Sea attack'), @('Cost', 'Bedel', 'Cost'))); lists = @([ordered]@{ title = @('Modeller', 'Models'); items = @($lines) }) }
    }
  }
  $sections = @(
    [ordered]@{ id = 'ulkeler'; title = @('Ülkeler', 'Countries'); noun = @('ülke', 'countries'); badge = @('Bölge · Başkent · Taraf', 'Region · Capital · Alignment'); text = @('{n} ülke: bölgesi, başkenti ve 1936-1944 arası tarafı.', '{n} countries: region, capital and alignment from 1936 to 1944.'); image = 'none'; groups = (Groups $REG); items = @($countries | Sort-Object { $_.name }) }
    [ordered]@{ id = 'birlikler'; title = @('Birlikler', 'Units'); noun = @('birlik', 'units'); badge = @('Kara · Hava · Deniz', 'Land · Air · Naval'); text = @('{n} birlik türü ve tüm modelleri.', '{n} unit types and all their models.'); image = 'none'; groups = (Groups $KIND); items = @($units) }
  )
  $guide = @(
    [ordered]@{ title = @('Tümen + tugay', 'Division + brigade'); text = @('HOI2''de her tümene bir tugay eklenir (topçu, tanksavar, mühendis…). Birlikler sayfasında her tugayın modellerinin değerleri yan yana.', 'Each division gets one attached brigade (artillery, anti-tank, engineers…). The Units page lists every model''s stats.') }
  )
}

$data = [ordered]@{
  game = $name; intro = $intro; sections = $sections; guide = $guide
  links = @(@('hoi2', 'Hearts of Iron II'), @('hoi3', 'Hearts of Iron III'), @('hoi4', 'Hearts of Iron IV') | Where-Object { $_[1] -ne $name } | ForEach-Object { [ordered]@{ label = @($_[1], $_[1]); href = "../$($_[0])/" } })
  footer = @(
    , @("Babuşlar, Paradox Interactive ile bağlantılı değildir. $name ve görselleri Paradox Interactive'e aittir.", "Babuşlar is not affiliated with Paradox Interactive. $name belongs to Paradox Interactive.")
    , @("Veriler $name Wiki'den ($($Game.ToLowerInvariant()).paradoxwikis.com, CC BY-SA) alınır. Birim ve ülke adları İngilizcedir.", "Data comes from the $name Wiki ($($Game.ToLowerInvariant()).paradoxwikis.com, CC BY-SA).")
  )
}
Write-Rehber -Dir $Game.ToLowerInvariant() -Data $data -Source "scripts/hoi-data.ps1 -Game $Game"
foreach ($s in $sections) { Write-Host "  $($s.id): $(@($s.items).Count)" }
