# Megabonk verisi: Megabonk Wiki (megabonk.fandom.com, CC BY-SA) tablolarından → megabonk/ klasörü.
#   powershell -ExecutionPolicy Bypass -File scripts/megabonk-data.ps1
# Eşyalar (nadirlik, açma görevi, gümüş bedeli), silahlar, kitaplar (Tome), karakterler (silah, pasif yetenek, değerler) ve haritalar.
. "$PSScriptRoot\rehber-lib.ps1"
. "$PSScriptRoot\wikitable-lib.ps1"

$API = 'https://megabonk.fandom.com/api.php'
Write-Host "Wiki sayfaları indiriliyor…"
$pages = Get-WikiPages $API @('Items', 'Weapons', 'Tomes', 'Characters', 'Maps')

# Hücredeki ilk [[File:…]] → dosya adı; geri kalanı → ad
function Cell-File([string]$c, [string]$name) {
  if ($c -match '\[\[(?:File|Image):([^|\]]+)') { return $Matches[1].Trim() }
  if ($name) { return @("$name.png", "$name.jpg", "$name.webp") }
}
function Cell-Name([string]$c) { Clean-WikiText ($c -replace '\[\[(?:File|Image):[^\]]*\]\]', '' -replace '<br\s*/?>', ' ') }
# <span class="green-text">x</span> → şablonun vurgusu
$SPAN = @{ yellow = 'd'; green = 'h'; blue = 'k'; red = 'w'; magenta = 'u'; purple = 'u'; orange = 'd' }
function Cell-Desc([string]$c) {
  $c = [regex]::Replace($c, '<span class="(\w+)-text">(.*?)</span>', { param($m) $k = $SPAN[$m.Groups[1].Value]; if ($k) { "⟦$k|$($m.Groups[2].Value)⟧" } else { $m.Groups[2].Value } })
  (Clean-WikiText $c) -replace '⟦', '[[' -replace '⟧', ']]'
}
$unlockLabel = @('Açılış', 'Unlock')
function Unlock-Text([string]$c) { $t = Clean-WikiText $c; if ($t -match '^Unlocked by default\.?$') { Bi 'Baştan açık' 'Unlocked by default' } else { $t } }

$files = New-Object System.Collections.ArrayList

# --- Eşyalar
$RARITY = [ordered]@{
  Common = @('Sıradan (yeşil)', 'Common (green)', '#5bc85b')
  Uncommon = @('Nadir (mavi)', 'Uncommon (blue)', '#4fa3e0')
  Rare = @('Ender (pembe)', 'Rare (magenta)', '#d64fd6')
  Legendary = @('Efsanevi (sarı)', 'Legendary (yellow)', '#e6c13c')
}
$t = (Get-WikiTables $pages['Items'])[0]
$itemList = foreach ($r in $t.rows) {
  $name = Cell-Name $r[0]
  $file = Cell-File $r[0] $name; foreach ($f in @($file)) { [void]$files.Add($f) }
  $rar = (Clean-WikiText $r[2])
  $stats = @(, @($unlockLabel, (Unlock-Text $r[3])))
  $silver = Clean-WikiText $r[4]
  if ($silver -and $silver -ne 'N/A') { $stats += , @(@('Gümüş bedeli', 'Silver cost'), $silver) }
  [ordered]@{ id = Slug $name; name = $name; file = $file; group = $rar; desc = Cell-Desc $r[1]; stats = $stats }
}

# --- Silahlar
$t = (Get-WikiTables $pages['Weapons'])[0]
$weaponList = foreach ($r in $t.rows) {
  $name = Cell-Name $r[0]
  $file = Cell-File $r[0] $name; foreach ($f in @($file)) { [void]$files.Add($f) }
  [ordered]@{ id = Slug $name; name = $name; file = $file; desc = Cell-Desc $r[1]; stats = @(, @($unlockLabel, (Unlock-Text $r[2])), , @(@('Etkileyen değerler', 'Affected by'), (Clean-WikiText $r[3]))) }
}

# --- Kitaplar (Tomes)
$t = (Get-WikiTables $pages['Tomes'])[0]
$tomeList = foreach ($r in $t.rows) {
  $name = Cell-Name $r[0]
  $file = Cell-File $r[0] $name; foreach ($f in @($file)) { [void]$files.Add($f) }
  $stats = @(, @($unlockLabel, (Unlock-Text $r[2])))
  $cost = Clean-WikiText $r[3]
  if ($cost -and $cost -ne 'N/A') { $stats += , @(@('Gümüş bedeli', 'Silver cost'), $cost) }
  [ordered]@{ id = Slug $name; name = $name; file = $file; desc = Cell-Desc $r[1]; stats = $stats }
}

# --- Karakterler: "Character List" tablosu (her satır ! ile başlıyor, tablo okuyucusu başlık sanıyor; elle okunur)
#     + değer tablosu (Max HP, Damage…)
$charText = $pages['Characters']
$listStart = $charText.IndexOf('|+Character List')
$listEnd = $charText.IndexOf('|}', $listStart)
$rows = ($charText.Substring($listStart, $listEnd - $listStart) -split '\n\|-') | Select-Object -Skip 1
$statTable = (Get-WikiTables $charText) | Where-Object { $_.columns -contains 'Max HP' } | Select-Object -First 1
$statCols = @($statTable.columns)
$SHOW = [ordered]@{ 'Max HP' = @('Can', 'Max HP'); 'Damage' = @('Hasar', 'Damage'); 'Attack Speed' = @('Saldırı hızı', 'Attack speed'); 'Crit Chance' = @('Kritik şansı', 'Crit chance'); 'Armor' = @('Zırh', 'Armor'); 'Evasion' = @('Kaçınma', 'Evasion'); 'Movement Speed' = @('Hız', 'Movement speed'); 'Luck' = @('Şans', 'Luck') }
$charList = foreach ($row in $rows) {
  $lines = ($row.Trim() -split '\n')
  $headIdx = [Array]::FindIndex($lines, [Predicate[string]] { param($l) $l.StartsWith('!') })
  if ($headIdx -lt 0) { continue }
  # Başlık hücresi birkaç satıra yayılabilir (resim + ad), sonra | ile başlayan hücreler gelir
  $head = $lines[$headIdx].Substring(1)
  $cells = @(); $cur = $null
  foreach ($l in $lines[($headIdx + 1)..($lines.Count - 1)]) {
    if ($l.StartsWith('|')) { if ($null -ne $cur) { $cells += $cur }; $cur = $l.Substring(1) }
    elseif ($null -eq $cur) { $head += " $l" }
    else { $cur += " $l" }
  }
  if ($null -ne $cur) { $cells += $cur }
  $file = Cell-File $head; [void]$files.Add($file)
  $name = (Cell-Name ($head -replace '</?center>', '')).Trim()
  $passive = Clean-WikiText $cells[1]
  $stats = @(, @(@('Silah', 'Weapon'), (Clean-WikiText $cells[0])))
  $cost = Clean-WikiText $cells[3]
  if ($cost -match '^\d+$') { $stats += , @(@('Gümüş bedeli', 'Silver cost'), $cost) }
  $srow = $statTable.rows | Where-Object { (Clean-WikiText $_[0]) -eq $name } | Select-Object -First 1
  if ($srow) { foreach ($k in $SHOW.Keys) { $i = $statCols.IndexOf($k); if ($i -ge 0) { $stats += , @($SHOW[$k], (Clean-WikiText $srow[$i])) } } }
  [ordered]@{ id = Slug $name; name = $name; file = $file; desc = $passive; stats = $stats; more = $(if ((Clean-WikiText $cells[2]) -notmatch 'Unlocked by Default') { "Unlock: $(Clean-WikiText $cells[2])" }) }
}

# --- Haritalar
$t = (Get-WikiTables $pages['Maps'])[0]
$mapList = foreach ($r in $t.rows) {
  $file = Cell-File $r[0]; [void]$files.Add($file)
  $name = (Clean-WikiText $r[0]) -replace '\s*thumb\s*', ''
  if (-not $name) { $name = ($file -replace '\.[a-z]+$', '' -replace '\.jpeg$', '' -replace ' Map$', '') }
  [ordered]@{ id = Slug $name; name = $name; file = $file; desc = Cell-Desc $r[1]; more = Clean-WikiText $r[2]; stats = @(, @($unlockLabel, (Unlock-Text $r[3]))) }
}

Write-Host "Resim adresleri alınıyor ($($files.Count))…"
$urls = Get-WikiImageUrls $API @($files)
$all = @($itemList) + @($weaponList) + @($tomeList) + @($charList) + @($mapList)
$missing = @()
foreach ($x in $all) {
  $u = @($x.file | Where-Object { $_ } | ForEach-Object { $urls[$_] } | Where-Object { $_ })[0]
  if ($u) { $x.image = Thumb $u $(if ($mapList -contains $x) { 480 } else { 160 }) } else { $missing += $x.name }
  $x.Remove('file')
}
Write-Host "Resmi bulunamayan ($($missing.Count)): $($missing -join ', ')"

$data = [ordered]@{
  game = 'Megabonk'
  intro = @(
    'Vampire Survivors tarzı, üç boyutlu bir hayatta kalma oyunu: karakterin otomatik saldırır, sen dolaşıp düşmanlardan kaçar, tecrübe toplar ve her seviyede silah, kitap (Tome) ya da eşya seçersin.',
    'A 3D Vampire Survivors-style roguelike: your character attacks automatically while you move, dodge, collect XP and pick weapons, tomes and items as you level up.'
  )
  sections = @(
    [ordered]@{ id = 'esyalar'; title = @('Eşyalar', 'Items'); noun = @('eşya', 'items'); badge = @('Nadirlik · Etki · Açma görevi', 'Rarity · Effect · Unlock'); text = @('{n} eşya: nadirliği (yeşil, mavi, pembe, sarı), etkisi ve nasıl açıldığı.', '{n} items: rarity, effect and how to unlock.'); image = 'icon'; groups = (Groups $RARITY); items = @($itemList | Sort-Object { @($RARITY.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'silahlar'; title = @('Silahlar', 'Weapons'); noun = @('silah', 'weapons'); badge = @('Etki · Açma · Ölçekleme', 'Effect · Unlock · Scaling'); text = @('{n} silah: ne yaptığı, nasıl açıldığı ve hangi değerlerle güçlendiği.', '{n} weapons: what they do, how to unlock, what scales them.'); image = 'icon'; items = @($weaponList) }
    [ordered]@{ id = 'kitaplar'; title = @('Kitaplar (Tome)', 'Tomes'); noun = @('kitap', 'tomes'); badge = @('Değer artışı · Açma', 'Stat boost · Unlock'); text = @('{n} kitap: her seviyede hangi değeri artırdığı.', '{n} tomes and the stat each one boosts.'); image = 'icon'; items = @($tomeList) }
    [ordered]@{ id = 'karakterler'; title = @('Karakterler', 'Characters'); noun = @('karakter', 'characters'); badge = @('Silah · Pasif · Değerler', 'Weapon · Passive · Stats'); text = @('{n} karakter: başlangıç silahı, pasif yeteneği ve temel değerleri.', '{n} characters: starting weapon, passive and base stats.'); image = 'portrait'; items = @($charList) }
    [ordered]@{ id = 'haritalar'; title = @('Haritalar', 'Maps'); noun = @('harita', 'maps'); badge = @('Özellikler · Açma', 'Mechanics · Unlock'); text = @('{n} harita ve özellikleri.', '{n} maps and their mechanics.'); image = 'wide'; items = @($mapList) }
  )
  guide = @(
    [ordered]@{ title = @('Nadirlik renkleri', 'Rarity colours'); text = @('Eşyanın arka plan rengi nadirliğini gösterir: yeşil sıradan, mavi nadir, pembe ender, sarı efsanevi. Çoğu eşya bir görevi (Quest) bitirince açılır ve sonra gümüşle satın alınır.', 'An item''s background shows its rarity: green common, blue uncommon, magenta rare, yellow legendary. Most items unlock by finishing a quest and are then bought with Silver.') }
    [ordered]@{ title = @('Kitap mı silah mı?', 'Tome or weapon?'); text = @('Seviye atlayınca silah ya da kitap seçersin. Kitaplar bütün silahlarına birden etki eden değerleri artırır (hasar, alan, bekleme süresi); 2-3 güçlü silahtan sonra kitaplara ağırlık vermek genelde daha iyidir.', 'On level-up you choose a weapon or a tome. Tomes boost stats for all your weapons at once; after 2–3 strong weapons, investing in tomes usually pays off.') }
    [ordered]@{ title = @('Sandıklar ve tapınaklar', 'Chests and shrines'); text = @('Haritadaki sandıklar altınla açılır ve fiyatları her açılışta artar. Şarj tapınaklarının (Charge Shrine) içinde durunca dolar ve seçmeli bir değer ödülü verir.', 'Chests cost gold and get pricier each time. Stand inside a Charge Shrine to fill it and pick a stat reward.') }
  )
  footer = @(
    , @('Babuşlar, vedinad ile bağlantılı değildir. Megabonk ve görselleri sahiplerine aittir.', 'Babuşlar is not affiliated with vedinad. Megabonk and its images belong to their owners.')
    , @('Veriler ve görseller Megabonk Wiki''den (megabonk.fandom.com, CC BY-SA) alınır. Oyun içi adlar ve açıklamalar İngilizcedir.', 'Data and images come from the Megabonk Wiki (megabonk.fandom.com, CC BY-SA).')
  )
}
Write-Rehber -Dir 'megabonk' -Data $data -Source 'scripts/megabonk-data.ps1'
