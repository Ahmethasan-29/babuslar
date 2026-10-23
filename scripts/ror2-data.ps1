# Risk of Rain 2 verisi: riskofrain2.wiki.gg Lua veri modüllerinden (Module:Items/Data, Equipment, Survivors, Skills,
# Enemies, Environments, Artifacts) ror2/data.js ve sayfalarını oluşturur. Çalıştır: powershell -ExecutionPolicy Bypass -File scripts/ror2-data.ps1
# Oyunun Türkçesi var ama dil dosyaları erişilebilir değil; eşya adları ve açıklamaları İngilizce, arayüz Türkçedir.
. "$PSScriptRoot\lua-lib.ps1"
. "$PSScriptRoot\rehber-lib.ps1"

$WIKI = "https://riskofrain2.wiki.gg"
function Get-Module([string]$name) { ConvertFrom-Lua (Get-WikiText "$WIKI/index.php?title=Module:$name/Data&action=raw") }

function FileOf([string]$name) { "$name.png" }

Write-Host "Modüller indiriliyor…"
$items = (Get-Module 'Items').items
$equipment = (Get-Module 'Equipment').equipment
$survivors = (Get-Module 'Survivors').Survivors
$skills = (Get-Module 'Skills').skills
$enemies = Get-Module 'Enemies'
$envs = (Get-Module 'Environments').Environments
$artifacts = (Get-Module 'Artifacts').artifact

# --- Eşyalar
$RARITY = [ordered]@{
  Common = @('Sıradan (beyaz)', 'Common (white)', '#e8e8e8')
  Uncommon = @('Nadir (yeşil)', 'Uncommon (green)', '#77c043')
  Legendary = @('Efsanevi (kırmızı)', 'Legendary (red)', '#e5533d')
  Boss = @('Boss (sarı)', 'Boss (yellow)', '#e6c13c')
  Lunar = @('Ay (Lunar, mavi)', 'Lunar (blue)', '#4fa3e0')
  Void = @('Boşluk (Void, mor)', 'Void (purple)', '#c158d6')
  Meal = @('Yemek', 'Meal', '#f08a4b')
  Hallowed = @('Hallowed', 'Hallowed', '#f2e7a0')
  Hex = @('Hex', 'Hex', '#9b6bd6')
  Page = @('Sayfa (Page)', 'Page', '#b0a080')
}
$CATS = [ordered]@{ Damage = @('Hasar', 'Damage'); Healing = @('İyileşme', 'Healing'); Utility = @('Yardımcı', 'Utility') }

$itemList = foreach ($name in $items.Keys) {
  $it = $items[$name]
  if (-not $RARITY.Contains([string]$it.Rarity)) { continue }
  $itemCats = @($it.Category | Where-Object { $CATS.Contains([string]$_) })
  $stats = @(foreach ($s in @($it.Stats)) {
      if (-not $s -or -not $s.Stat -or $s.Stack -eq 'ProcCoeff') { continue }
      $v = [string]$s.Value
      if ($s.Add) { $v += " [[s|($($s.Add) / $(if ($s.Stack) { $s.Stack.ToLowerInvariant() } else { 'stack' }))]]" }
      , @($s.Stat, $v)
    })
  $more = @()
  if ($it.Unlock) { $more += "Unlock: $($it.Unlock)" }
  if ($it.Corrupt) { $more += "Void: $($it.Corrupt)" }
  [ordered]@{
    id = Slug $name; name = $name; file = FileOf $name; group = [string]$it.Rarity; tags = $itemCats
    sub = @((($itemCats | ForEach-Object { $CATS["$_"][0] }) -join ' · '), (($itemCats | ForEach-Object { $CATS["$_"][1] }) -join ' · '))
    quote = Convert-WikiMarkup $it.Quote; desc = Convert-WikiMarkup $it.Desc; stats = $stats
    more = $(if ($more) { $more -join ' · ' } else { $null })
  }
}

# --- Ekipmanlar
$EQ = [ordered]@{
  'Equipment' = @('Ekipman', 'Equipment', '#f5a623')
  'Lunar Equipment' = @('Ay ekipmanı', 'Lunar equipment', '#4fa3e0')
  'Elite Equipment' = @('Elit ekipmanı', 'Elite equipment', '#e6c13c')
}
$eqList = foreach ($name in $equipment.Keys) {
  $e = $equipment[$name]
  $r = [string]$e.Rarity
  if (-not $EQ.Contains($r)) { continue }
  $stats = @()
  if ($e.Cooldown) { $stats += , @(@('Bekleme', 'Cooldown'), (Sec $e.Cooldown)) }
  if ($e.Duration) { $stats += , @(@('Süre', 'Duration'), (Sec $e.Duration)) }
  [ordered]@{ id = Slug $name; name = $name; file = FileOf $name; group = $r; quote = Convert-WikiMarkup $e.Quote; desc = Convert-WikiMarkup $e.Desc; stats = $stats; more = $(if ($e.Unlock) { "Unlock: $($e.Unlock)" }) }
}

# --- Karakterler (yetenekleriyle)
$SKILL_TYPES = @('Passive', 'Primary', 'Secondary', 'Utility', 'Special')
$survList = foreach ($name in $survivors.Keys) {
  $s = $survivors[$name]
  $own = @($skills.Values | Where-Object { $_.Survivor -eq $name -and $SKILL_TYPES -contains $_.Type })
  $own = $own | Sort-Object { $SKILL_TYPES.IndexOf([string]$_.Type) }
  $skillLines = @($own | ForEach-Object { "[[k|$($_.Type)]] $($_.Name)" + $(if ($_.Cooldown -and $_.Cooldown -ne '0') { " [[s|($($_.Cooldown) s)]]" } else { '' }) + ": " + (Convert-WikiMarkup $_.Desc) })
  [ordered]@{
    id = Slug $name; name = $name; file = $(if ($s.Image) { $s.Image } else { FileOf $name })
    desc = Convert-WikiMarkup $s.Description
    stats = @(
      , @(@('Can', 'Health'), (Lvl $s.BaseHealth $s.ScalingHealth))
      , @(@('Hasar', 'Damage'), (Lvl $s.BaseDamage $s.ScalingDamage))
      , @(@('Can yenileme', 'Regen'), (Bi "$($s.BaseHealthRegen)/sn" "$($s.BaseHealthRegen)/s"))
      , @(@('Hız', 'Speed'), (Bi "$($s.BaseSpeed) m/sn" "$($s.BaseSpeed) m/s"))
      , @(@('Zırh', 'Armor'), "$($s.BaseArmor)")
    )
    lists = @([ordered]@{ title = @('Yetenekler', 'Skills'); items = $skillLines })
  }
}

# --- Düşmanlar ve bosslar
$MT = [ordered]@{
  'Normal' = @('Düşman', 'Monster', '#9aa0a6')
  'Boss' = @('Boss', 'Boss', '#e6c13c')
  'Special Boss' = @('Özel boss', 'Special boss', '#e5533d')
}
$monList = foreach ($name in $enemies.Monsters.Keys) {
  $m = $enemies.Monsters[$name]
  $t = [string]$m.Type
  if (-not $MT.Contains($t) -or $m.DoNotInclude) { continue }
  $stats = @(
    , @(@('Can', 'Health'), (Lvl $m.BaseHealth $m.ScalingHealth))
    , @(@('Hasar', 'Damage'), (Lvl $m.BaseDamage $m.ScalingDamage))
    , @(@('Zırh', 'Armor'), "$($m.BaseArmor)")
    , @(@('Hız', 'Speed'), (Bi "$($m.BaseSpeed) m/sn" "$($m.BaseSpeed) m/s"))
  )
  if ($m.CreditsCost) { $stats += , @(@('Doğma bedeli', 'Spawn cost'), "$($m.CreditsCost)") }
  [ordered]@{ id = Slug $name; name = $(if ($m.Name) { $m.Name } else { $name }); file = $(if ($m.Image) { $m.Image } else { FileOf $name }); group = $t; sub = $m.BossName; stats = $stats; more = $(if ($m.Class) { "Class: $($m.Class)" }) }
}

# --- Haritalar (Simulacrum kopyaları hariç)
$ST = [ordered]@{}
foreach ($n in '1', '2', '3', '4', '5') { $ST[$n] = @("$n. bölüm", "Stage $n", $null) }
$ST['Final'] = @('Son bölüm', 'Final stage', '#e5533d')
$ST['Hidden Realm'] = @('Gizli diyar', 'Hidden realm', '#c158d6')
$envList = foreach ($name in $envs.Keys) {
  $e = $envs[$name]
  if ($name -match 'Simulacrum\)') { continue }
  $mons = @()
  if ($e.Monsters -is [System.Collections.IDictionary]) { $mons = @($e.Monsters.Keys) }
  [ordered]@{
    id = Slug $name; name = $name; file = $(if ($e.Image) { $e.Image } else { FileOf $name }); group = [string]$e.Stage
    sub = $e.SubName; desc = Convert-WikiMarkup $e.Description; quote = Convert-WikiMarkup $e.LunarSeer
    lists = @([ordered]@{ title = @('Çıkan düşmanlar', 'Monsters'); items = $mons })
  }
}

# --- Eserler (Artifacts)
$artList = foreach ($name in $artifacts.Keys) {
  $a = $artifacts[$name]
  [ordered]@{ id = Slug $name; name = "Artifact of $name"; file = "Artifact of $name.png"; desc = Convert-WikiMarkup $a.Desc; stats = @(, @(@('Kod', 'Code'), (@($a.Code) -join ' / '))) }
}

Write-Host "Resim adresleri alınıyor…"
$all = @($itemList) + @($eqList) + @($survList) + @($monList) + @($envList) + @($artList)
$urls = Get-WikiImageUrls "$WIKI/api.php" ($all | ForEach-Object { $_.file })
$missing = 0
foreach ($x in $all) {
  $x.image = $urls[$x.file]
  if (-not $x.image) { $missing++ }
  $x.Remove('file')
}
Write-Host "Resmi bulunamayan: $missing / $($all.Count)"

$data = [ordered]@{
  game = 'Risk of Rain 2'
  intro = @(
    'Hayatta kalanı seç, eşya topla, teleporter''ı çalıştır ve her bölümde zorlaşan düşmanlara karşı ayakta kal. Aynı eşyadan birden fazla alınca etkisi katlanır (stack).',
    'Pick a survivor, collect items, charge the teleporter and survive enemies that get harder every stage. Picking up the same item again stacks its effect.'
  )
  sections = @(
    [ordered]@{ id = 'esyalar'; title = @('Eşyalar', 'Items'); noun = @('eşya', 'items'); badge = @('Nadirlik · Etki · Stack', 'Rarity · Effect · Stacking'); text = @('{n} eşya: nadirliğe göre renkli, stack başına ne kadar arttığıyla.', '{n} items by rarity, with how much each stack adds.'); image = 'icon'; groups = (Groups $RARITY); tags = @(foreach ($k in $CATS.Keys) { [ordered]@{ id = $k; label = $CATS[$k] } }); items = @($itemList | Sort-Object { @($RARITY.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'ekipman'; title = @('Ekipmanlar', 'Equipment'); noun = @('ekipman', 'equipment'); badge = @('Bekleme süresi · Etki', 'Cooldown · Effect'); text = @('{n} ekipman: Q ile kullanılan, bekleme süreli eşyalar.', '{n} equipment: activated items with a cooldown.'); image = 'icon'; groups = (Groups $EQ); items = @($eqList | Sort-Object { @($EQ.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'karakterler'; title = @('Hayatta kalanlar', 'Survivors'); noun = @('karakter', 'survivors'); badge = @('Değerler · Yetenekler', 'Stats · Skills'); text = @('{n} oynanabilir karakter: can, hasar ve tüm yetenekleri.', '{n} playable survivors with stats and skills.'); image = 'portrait'; items = @($survList) }
    [ordered]@{ id = 'dusmanlar'; title = @('Düşmanlar ve bosslar', 'Monsters and bosses'); noun = @('düşman', 'monsters'); badge = @('Can · Hasar · Zırh', 'Health · Damage · Armor'); text = @('{n} düşman ve boss: seviye başına artan can ve hasarıyla.', '{n} monsters and bosses with per-level scaling.'); image = 'icon'; groups = (Groups $MT); items = @($monList | Sort-Object { @($MT.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'haritalar'; title = @('Haritalar', 'Environments'); noun = @('harita', 'environments'); badge = @('Bölüm · Düşmanlar', 'Stage · Monsters'); text = @('{n} harita: hangi bölümde çıktığı ve orada doğan düşmanlar.', '{n} environments: their stage and the monsters that spawn there.'); image = 'wide'; groups = (Groups $ST); items = @($envList | Sort-Object { @($ST.Keys).IndexOf($_.group) }, { $_.name }) }
    [ordered]@{ id = 'eserler'; title = @('Eserler (Artifacts)', 'Artifacts'); noun = @('eser', 'artifacts'); badge = @('Oyun kuralları · Kod', 'Run modifiers · Codes'); text = @('{n} eser: oyunu değiştiren kurallar ve açma kodları.', '{n} artifacts: run modifiers and their unlock codes.'); image = 'icon'; items = @($artList) }
  )
  guide = @(
    [ordered]@{ title = @('Stack mantığı', 'How stacking works'); text = @('Aynı eşyadan ikinci kez alınca etkisi artar. Kartlardaki gri parantez her ek kopyanın ne eklediğini gösterir. [[s|linear]] düz artar, [[s|hyperbolic]] her kopyada daha az artar (ör. Tougher Times %100''e hiç ulaşmaz).', 'Picking up another copy of an item boosts its effect. The grey brackets on the cards show what each extra copy adds. [[s|linear]] grows evenly, [[s|hyperbolic]] grows less each time (e.g. Tougher Times never reaches 100%).') }
    [ordered]@{ title = @('Teleporter''ı geciktirme', 'Don''t rush the teleporter'); text = @('Zorluk zamanla artar, ama ilk bölümlerde sandıkların çoğunu açmak sonraki bölümlerde güçlü kalmanı sağlar. Para biriktirip çok sandık açmak, hızlı geçmekten genelde daha iyidir.', 'Difficulty rises over time, but opening most chests on early stages keeps you strong later. Spending all your gold usually beats rushing.') }
    [ordered]@{ title = @('Ay (Lunar) eşyaları', 'Lunar items'); text = @('Mavi Lunar eşyalar güçlü ama bir bedeli var (ör. Shaped Glass hasarı ikiye katlar, canı yarıya indirir). Lunar Coin ile Lunar Pod''lardan ve Bazaar''dan alınır.', 'Blue Lunar items are powerful but come with a drawback (e.g. Shaped Glass doubles damage but halves health). Buy them with Lunar Coins from Lunar Pods and the Bazaar.') }
    [ordered]@{ title = @('Boşluk (Void) eşyaları', 'Void items'); text = @('Mor Void eşyaları, eşleştiği normal eşyanın tüm kopyalarını kendine çevirir. Kartın "Ayrıntılar" kısmında hangi eşyayı bozduğu yazar.', 'Purple Void items convert every copy of their paired normal item. The card''s Details show which item it corrupts.') }
    [ordered]@{ title = @('Eserleri açma', 'Unlocking artifacts'); text = @('Eserler, Sky Meadow''daki Artifact Reliquary''de 3x3 kod girilerek açılır. Kodlar Eserler sayfasında yazar.', 'Artifacts are unlocked by entering their 3x3 code at the Artifact Reliquary on Sky Meadow. Codes are listed on the Artifacts page.') }
  )
  footer = @(
    , @('Babuşlar, Hopoo Games ve Gearbox ile bağlantılı değildir. Risk of Rain 2 ve görselleri sahiplerine aittir.', 'Babuşlar is not affiliated with Hopoo Games or Gearbox. Risk of Rain 2 and its images belong to their owners.')
    , @('Veriler ve görseller Risk of Rain 2 Wiki''den (riskofrain2.wiki.gg, CC BY-NC-SA) alınır. Eşya adları ve açıklamaları İngilizcedir.', 'Data and images come from the Risk of Rain 2 Wiki (riskofrain2.wiki.gg, CC BY-NC-SA).')
  )
}
Write-Rehber -Dir 'ror2' -Data $data -Source 'scripts/ror2-data.ps1'
