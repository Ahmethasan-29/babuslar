# Risk of Rain (2013) ve Risk of Rain Returns (2023) verisi: wikilerin Lua veri modüllerinden ror1/ ya da rorr/ klasörünü oluşturur.
#   powershell -ExecutionPolicy Bypass -File scripts/ror-classic-data.ps1 -Game ROR1
#   powershell -ExecutionPolicy Bypass -File scripts/ror-classic-data.ps1 -Game RORR
# Kaynaklar: riskofrain.wiki.gg (Module:Items/Data), riskofrainreturns.wiki.gg (Items, Enemies, Skills). Metinler İngilizcedir.
param([ValidateSet('ROR1', 'RORR')][string]$Game = 'RORR')
. "$PSScriptRoot\lua-lib.ps1"
. "$PSScriptRoot\rehber-lib.ps1"

$WIKI = if ($Game -eq 'ROR1') { 'https://riskofrain.wiki.gg' } else { 'https://riskofrainreturns.wiki.gg' }
$API = "$WIKI/api.php"
function Get-Module([string]$name) { ConvertFrom-Lua (Get-WikiText "$WIKI/index.php?title=Module:$name/Data&action=raw") }

$RARITY = [ordered]@{
  Common = @('Sıradan (beyaz)', 'Common (white)', '#e8e8e8')
  Uncommon = @('Nadir (yeşil)', 'Uncommon (green)', '#77c043')
  Rare = @('Efsanevi (kırmızı)', 'Rare (red)', '#e5533d')
  Boss = @('Boss (sarı)', 'Boss (yellow)', '#e6c13c')
  Equipment = @('Ekipman (turuncu)', 'Use item (orange)', '#f5a623')
  Special = @('Özel (mor)', 'Special (purple)', '#c158d6')
}
$CATS = [ordered]@{ Damage = @('Hasar', 'Damage'); Healing = @('İyileşme', 'Healing'); Utility = @('Yardımcı', 'Utility') }

Write-Host "$Game modülleri indiriliyor…"
$items = (Get-Module 'Items').items
$itemList = foreach ($name in $items.Keys) {
  $it = $items[$name]
  if (-not $RARITY.Contains([string]$it.Rarity)) { continue }
  $itemCats = @($it.Category | Where-Object { $CATS.Contains([string]$_) } | ForEach-Object { [string]$_ })
  $stats = @()
  if ($it.Cooldown) { $stats += , @(@('Bekleme', 'Cooldown'), (Sec $it.Cooldown)) }
  $more = @()
  if ($it.Unlock) { $more += "Unlock: $(Clean-WikiText $it.Unlock)" }
  if ($it.From) { $more += "From: $(Clean-WikiText $it.From)" }
  [ordered]@{
    id = Slug $name; name = $name; file = @("$name Icon.png", $it.Icon, "$name.png"); group = [string]$it.Rarity; tags = $itemCats
    sub = @((($itemCats | ForEach-Object { $CATS[$_][0] }) -join ' · '), (($itemCats | ForEach-Object { $CATS[$_][1] }) -join ' · '))
    quote = Convert-WikiMarkup $it.Pickup; desc = Convert-WikiMarkup $it.Desc; stats = $stats
    more = $(if ($more) { $more -join ' · ' } else { $null })
  }
}
$sections = @(
  [ordered]@{ id = 'esyalar'; title = @('Eşyalar', 'Items'); noun = @('eşya', 'items'); badge = @('Nadirlik · Etki', 'Rarity · Effect'); text = @('{n} eşya ve ekipman: nadirliğe göre renkli.', '{n} items and use items, coloured by rarity.'); image = 'icon'; groups = (Groups $RARITY); tags = @(foreach ($k in $CATS.Keys) { [ordered]@{ id = $k; label = $CATS[$k] } }); items = @($itemList | Sort-Object { @($RARITY.Keys).IndexOf($_.group) }, { $_.name }) }
)
$all = @($itemList)

if ($Game -eq 'RORR') {
  # Karakterler: yetenek modülünden (her yeteneğin Survivor alanı)
  $skills = (Get-Module 'Skills').skills
  $ORDER = @('Passive', 'Primary', 'Secondary', 'Utility', 'Special')
  $survNames = @($skills.Values | ForEach-Object { [string]$_.Survivor } | Where-Object { $_ -and $_ -ne 'Multiplayer Drone' } | Select-Object -Unique)
  $survList = foreach ($s in $survNames) {
    $own = @($skills.Keys | Where-Object { $skills[$_].Survivor -eq $s } | Sort-Object { $i = $ORDER.IndexOf([string]$skills[$_].Type); if ($i -lt 0) { 9 } else { $i } })
    $lines = @($own | ForEach-Object { $k = $skills[$_]; "[[k|$($k.Type)]] $_" + $(if ($k.Cooldown) { " [[s|($($k.Cooldown) s)]]" } else { '' }) + ': ' + (Convert-WikiMarkup $k.Desc) })
    [ordered]@{ id = Slug $s; name = $s; file = @("$($s -creplace '[^A-Za-z]')Portrait0.png", "$($s -creplace '[^A-Za-z]')Portrait.png", "$s.png"); lists = @([ordered]@{ title = @('Yetenekler', 'Skills'); items = $lines }) }
  }
  $MT = [ordered]@{
    Normal = @('Düşman', 'Monster', '#9aa0a6')
    Boss = @('Boss', 'Boss', '#e6c13c')
    SpecialBoss = @('Özel boss', 'Special boss', '#e5533d')
    Special = @('Özel', 'Special', '#c158d6')
  }
  $enemies = (Get-Module 'Enemies').enemies
  $monList = foreach ($name in $enemies.Keys) {
    $m = $enemies[$name]
    if (-not $MT.Contains([string]$m.Type)) { continue }
    $stats = @(
      , @(@('Can', 'Health'), "$($m.BaseHealth)")
      , @(@('Hasar', 'Damage'), "$($m.BaseDamage)")
      , @(@('Hız', 'Speed'), "$($m.BaseSpeed)")
    )
    [ordered]@{ id = Slug $name; name = $name; file = $(if ($m.Portrait) { $m.Portrait } elseif ($m.Icon) { $m.Icon } else { $m.Sprite }); group = [string]$m.Type; stats = $stats }
  }
  $sections += [ordered]@{ id = 'karakterler'; title = @('Hayatta kalanlar', 'Survivors'); noun = @('karakter', 'survivors'); badge = @('Yetenekler', 'Skills'); text = @('{n} karakter ve tüm yetenekleri (birincil, ikincil, yardımcı, özel).', '{n} survivors and all their skills.'); image = 'portrait'; items = @($survList) }
  $sections += [ordered]@{ id = 'dusmanlar'; title = @('Düşmanlar ve bosslar', 'Monsters and bosses'); noun = @('düşman', 'monsters'); badge = @('Can · Hasar · Hız', 'Health · Damage · Speed'); text = @('{n} düşman ve boss: temel can ve hasar değerleri.', '{n} monsters and bosses with base stats.'); image = 'icon'; groups = (Groups $MT); items = @($monList | Sort-Object { @($MT.Keys).IndexOf($_.group) }, { $_.name }) }
  $all += @($survList) + @($monList)
}

Write-Host "Resim adresleri alınıyor…"
$urls = Get-WikiImageUrls $API ($all | ForEach-Object { $_.file } | ForEach-Object { $_ })
$missing = @()
foreach ($x in $all) { $x.image = @($x.file | ForEach-Object { $urls[$_] } | Where-Object { $_ })[0]; if (-not $x.image) { $missing += $x.name }; $x.Remove('file') }
Write-Host "Resmi bulunamayan ($($missing.Count)): $($missing -join ', ')"

if ($Game -eq 'ROR1') {
  $data = [ordered]@{
    game = 'Risk of Rain'
    intro = @('2013''te çıkan ilk oyun: iki boyutlu, zamanla zorlaşan bir hayatta kalma oyunu. Eşyalar üst üste biner (stack) ve her bölümde teleporter''ı bulup boss''u yenmek gerekir.', 'The original 2013 game: a 2D roguelike where difficulty rises over time. Items stack, and each stage ends by finding the teleporter and beating its boss.')
    sections = $sections
    guide = @(
      [ordered]@{ title = @('Zaman düşmanın', 'Time is the enemy'); text = @('Sağ üstteki zorluk çubuğu dakika dakika yükselir. Sandıkları açmak için oyalanmak eşya kazandırır ama düşmanları da güçlendirir: dengeyi iyi kur.', 'The difficulty bar rises every minute. Opening chests gets you items but makes enemies stronger: find the balance.') }
      [ordered]@{ title = @('Ekipmanlar', 'Use items'); text = @('Turuncu ekipmanlar bir tuşla kullanılır ve bekleme süreleri vardır. Aynı anda yalnızca bir ekipman taşınır.', 'Orange use items are activated with a key and have a cooldown. You can only carry one at a time.') }
      [ordered]@{ title = @('Remake var', 'There is a remake'); text = @('Risk of Rain Returns (2023) bu oyunun yenilenmiş hali: aynı eşyalar, yeni karakterler ve dengelemeler.', 'Risk of Rain Returns (2023) is the remake of this game: the same items plus new survivors and balance changes.') }
    )
    links = @([ordered]@{ label = @('Risk of Rain Returns', 'Risk of Rain Returns'); href = '../rorr/' }, [ordered]@{ label = @('Risk of Rain 2', 'Risk of Rain 2'); href = '../ror2/' })
    footer = @(
      , @('Babuşlar, Hopoo Games ve Chucklefish ile bağlantılı değildir. Risk of Rain ve görselleri sahiplerine aittir.', 'Babuşlar is not affiliated with Hopoo Games or Chucklefish. Risk of Rain and its images belong to their owners.')
      , @('Veriler ve görseller Risk of Rain Wiki''den (riskofrain.wiki.gg, CC BY-NC-SA) alınır. Eşya adları ve açıklamaları İngilizcedir.', 'Data and images come from the Risk of Rain Wiki (riskofrain.wiki.gg, CC BY-NC-SA).')
    )
  }
  Write-Rehber -Dir 'ror1' -Data $data -Source 'scripts/ror-classic-data.ps1 -Game ROR1'
} else {
  $data = [ordered]@{
    game = 'Risk of Rain Returns'
    intro = @('İlk Risk of Rain''in 2023 yenilemesi: aynı iki boyutlu hayatta kalma oyunu, yeni karakterler (Robomando, Drifter), yeni eşyalar ve Providence Trials.', 'The 2023 remake of the original: the same 2D roguelike with new survivors (Robomando, Drifter), new items and Providence Trials.')
    sections = $sections
    guide = @(
      [ordered]@{ title = @('Stack mantığı', 'How stacking works'); text = @('Aynı eşyadan bir daha alınca gri parantezde yazan kadar güçlenir. Sıradan (beyaz) eşyaları çok toplamak çoğu zaman tek bir kırmızı eşyadan daha değerlidir.', 'Each extra copy adds what the grey brackets say. Stacking many common (white) items often beats a single red item.') }
      [ordered]@{ title = @('Teleporter ve zaman', 'Teleporter and time'); text = @('Zorluk her dakika artar. Bölümdeki sandıkları açıp teleporter''ı öyle çalıştırmak, sonraki bölümlerde ayakta kalmanı sağlar.', 'Difficulty rises every minute. Opening the stage''s chests before charging the teleporter keeps you alive later.') }
      [ordered]@{ title = @('Karakter açma', 'Unlocking survivors'); text = @('Karakterlerin çoğu bir görevi tamamlayınca açılır (ör. Huntress için ilk bölümleri geçmek). Karakterler sayfasında her birinin yetenekleri var.', 'Most survivors unlock by completing a challenge. The Survivors page lists every skill.') }
    )
    links = @([ordered]@{ label = @('Risk of Rain (2013)', 'Risk of Rain (2013)'); href = '../ror1/' }, [ordered]@{ label = @('Risk of Rain 2', 'Risk of Rain 2'); href = '../ror2/' })
    footer = @(
      , @('Babuşlar, Hopoo Games ve Gearbox ile bağlantılı değildir. Risk of Rain Returns ve görselleri sahiplerine aittir.', 'Babuşlar is not affiliated with Hopoo Games or Gearbox. Risk of Rain Returns and its images belong to their owners.')
      , @('Veriler ve görseller Risk of Rain Returns Wiki''den (riskofrainreturns.wiki.gg, CC BY-NC-SA) alınır. Eşya adları ve açıklamaları İngilizcedir.', 'Data and images come from the Risk of Rain Returns Wiki (riskofrainreturns.wiki.gg, CC BY-NC-SA).')
    )
  }
  Write-Rehber -Dir 'rorr' -Data $data -Source 'scripts/ror-classic-data.ps1 -Game RORR'
}
