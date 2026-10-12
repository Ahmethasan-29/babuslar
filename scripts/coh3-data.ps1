# Company of Heroes 3 verisi: cohstats/coh3-data deposundan (oyun dosyalarından çıkarılmış veri, MIT) coh3/data.js üretir.
#   Birlikler: üretim binalarının (spawner_ext) listesindeki mangalar; fiyat = manga içindeki askerlerin/araçların
#              fiyatı (ebps cost_ext) × sayısı + binadaki fiyat farkı. Adlar ve açıklamalar oyunun Türkçe/İngilizce metinlerinden.
#   Battlegroup'lar: battlegroup.json dalları ve yükseltmeleri (upgrade).
#   Haritalar: mp-maps.json (yalnızca lobide görünen çok oyunculu haritalar).
# Görseller coh3stats CDN'inden (cdn.coh3stats.com). Kullanım: powershell -File scripts/coh3-data.ps1
param([string]$Out = "coh3/data.js")
$ErrorActionPreference = "Stop"

$BASE = "https://raw.githubusercontent.com/cohstats/coh3-data/master/data"
$CDN = "https://cdn.coh3stats.com"
$CACHE = Join-Path $env:TEMP "babuslar-coh3-cache"
New-Item -ItemType Directory -Force $CACHE | Out-Null

function Get-Data([string]$path) {
  $file = Join-Path $CACHE ($path -replace '[\\/]', '_')
  if (-not (Test-Path $file)) {
    Write-Host "İndiriliyor: $path"
    & curl.exe -s -f -L -o $file "$BASE/$path"
    if ($LASTEXITCODE) { throw "İndirilemedi: $path" }
  }
  [IO.File]::ReadAllText($file) | ConvertFrom-Json
}

# Oyunun metinleri (locstring numarası → yazı). "\n" satır sonudur.
function Get-Loc([string]$lang) {
  $map = @{}
  foreach ($p in (Get-Data "locales/$lang-locstring.json").PSObject.Properties) { $map[$p.Name] = $p.Value }
  $map
}
$TR = Get-Loc "tr"
$EN = Get-Loc "en"

# { locstring: { value } } ya da { value } → { tr, en }. Bulunamayan ya da "0" olan metin $null.
function Text($ref) {
  if ($null -eq $ref) { return $null }
  $id = if ($ref.locstring) { if ($ref.locstring.value) { $ref.locstring.value } else { $ref.locstring } } else { $ref.value }
  if (-not $id -or $id -eq "0" -or -not $EN.ContainsKey([string]$id)) { return $null }
  $clean = { param($s) if ($s) { ($s -replace '\\n', "`n" -replace '\\r', '').Trim() } }
  $textEn = & $clean $EN[[string]$id]
  $textTr = & $clean $TR[[string]$id]
  if (-not $textEn) { return $null }
  [ordered]@{ tr = $(if ($textTr) { $textTr } else { $textEn }); en = $textEn }
}


# Bazı metinler kalıp + değerlerle saklanır ("... boyutu yüksektir (%1%)" + 6). Kalıbı iki dilde de doldurur.
function Fmt($f) {
  if (-not $f -or -not $f.formatter) { return $null }
  $base = Text $f.formatter
  if (-not $base) { return $null }
  $res = [ordered]@{ tr = $base.tr; en = $base.en }
  $i = 1
  foreach ($a in @($f.formatter_arguments)) {
    $val = if ($a.locstring_value) { Text $a.locstring_value }
    elseif ($null -ne $a.int_value) { @{ tr = [string][int]$a.int_value; en = [string][int]$a.int_value } }
    elseif ($null -ne $a.float_value) { @{ tr = ([string][Math]::Round([double]$a.float_value, 2)).Replace(".", ","); en = [string][Math]::Round([double]$a.float_value, 2) } }
    if ($val) { foreach ($lang in @("tr", "en")) { $res[$lang] = $res[$lang].Replace("%$i%", $val[$lang]) } }
    $i++
  }
  $res
}

# Arayüz metni: doğrudan yazılmışsa o, yoksa kalıptan.
function UiText($info, [string]$field) {
  $t = Text $info.$field
  if ($t) { $t } else { Fmt $info."$($field)_formatter" }
}

function Icon([string]$name) { if ($name) { "$CDN/export_flatten/$(($name -split '[\\/]')[-1]).webp" } }

# Nesnenin eklentisi (extensions içinde template_reference adı ...\$name olan).
function Ext($obj, [string]$name) {
  foreach ($e in @($obj.extensions)) {
    foreach ($p in $e.PSObject.Properties) {
      if ([string]$p.Value.template_reference.value -like "*\$name") { return $p.Value }
    }
  }
}

# "ebps/races/american/infantry/riflemen_us" gibi adresi, ırkın dosyasında bulur.
function Resolve($root, [string]$ref, [int]$skip) {
  $node = $root
  foreach ($k in ($ref -split '/' | Select-Object -Skip $skip)) {
    if ($null -eq $node) { return $null }
    $node = $node.$k
  }
  $node
}

# Ağaçtaki tüm kayıtlar (extensions'ı olan nesneler) ve adresleri.
function Walk($node, [string]$path) {
  if ($node -isnot [Management.Automation.PSCustomObject]) { return }
  if ($node.PSObject.Properties.Name -contains "extensions") { [pscustomobject]@{ path = $path; node = $node }; return }
  foreach ($p in $node.PSObject.Properties) { Walk $p.Value "$path/$($p.Name)" }
}

$RACES = [ordered]@{
  american     = @{ tr = "ABD Kuvvetleri"; en = "US Forces"; side = "allies"; color = "#6f9b4f" }
  british      = @{ tr = "İngiliz Kuvvetleri"; en = "British Forces"; side = "allies"; color = "#c9a84a" }
  german       = @{ tr = "Wehrmacht"; en = "Wehrmacht"; side = "axis"; color = "#8a8f99" }
  afrika_korps = @{ tr = "Deutsches Afrikakorps"; en = "Deutsches Afrikakorps"; side = "axis"; color = "#c08a4a" }
}
$CATS = @{ infantry = "infantry"; team_weapons = "team_weapons"; vehicles = "vehicles"; emplacements = "emplacements" }

$factions = @()
$units = @()
$battlegroups = @()
foreach ($race in $RACES.Keys) {
  Write-Host "== $race"
  $ebps = Get-Data "chunked/ebps/races/$race.json"
  $sbps = Get-Data "chunked/sbps/races/$race.json"
  $upgrades = Get-Data "chunked/upgrade/$race.json"
  $common = Get-Data "chunked/ebps/races/common.json"
  $entity = { param($ref) if ($ref -like "ebps/races/common/*") { Resolve $common $ref 3 } else { Resolve $ebps $ref 3 } }

  # Üretim binaları ve ürettikleri mangalar.
  $made = [ordered]@{}
  foreach ($b in (Walk $ebps "")) {
    $spawner = Ext $b.node "spawner_ext"
    if (-not $spawner -or -not @($spawner.spawn_items).Count) { continue }
    # Binaların ui_ext'i doğrudan, mangalarınki race_list içinde.
    $ui = Ext $b.node "ui_ext"
    if ($ui.race_list) { $ui = $ui.race_list[0].race_data.info }
    $bname = Text $ui.screen_name
    foreach ($item in @($spawner.spawn_items)) {
      $ref = [string]$item.spawn_item.squad.instance_reference
      if ($ref -notlike "sbps/races/$race/*") { continue }
      if (-not $made.Contains($ref)) { $made[$ref] = @{ buildings = @(); adjust = $item.spawn_item.item_cost_adjustment } }
      if ($bname -and -not ($made[$ref].buildings | Where-Object { $_.en -eq $bname.en })) { $made[$ref].buildings += $bname }
    }
  }

  foreach ($ref in $made.Keys) {
    $squad = Resolve $sbps $ref 3
    if (-not $squad) { continue }
    $cat = ($ref -split '/')[3]
    if (-not $CATS.ContainsKey($cat)) { continue }
    $info = Ext $squad "squad_ui_ext"
    if ($info.race_list) { $info = $info.race_list[0].race_data.info }
    $name = Text $info.screen_name
    if (-not $name) { continue }
    $cost = [ordered]@{ manpower = 0; munition = 0; fuel = 0; popcap = 0 }
    $time = 0
    $size = 0
    foreach ($u in @((Ext $squad "squad_loadout_ext").unit_list)) {
      $n = [int]$u.loadout_data.num
      $e = & $entity ([string]$u.loadout_data.type.instance_reference)
      $size += $n
      # Nüfus: askerlerin/araçların population_ext'i (manganınkiyle toplanır, bkz. aşağısı).
      $cost.popcap += $n * [double](Ext $e "population_ext").personnel_pop
      $c = (Ext $e "cost_ext").time_cost
      if (-not $c) { continue }
      foreach ($k in @("manpower", "munition", "fuel")) { $cost[$k] += $n * [double]$c.cost.$k }
      $time += $n * [double]$c.time_seconds
    }
    # Manganın kendi nüfusu (squad_population_ext) ve binadaki fiyat farkı eklenir (coh3stats ile aynı hesap).
    $cost.popcap += [double](Ext $squad "squad_population_ext").personnel_pop
    $adj = $made[$ref].adjust
    if ($adj) { foreach ($k in @("manpower", "munition", "fuel", "popcap")) { $cost[$k] += [double]$adj.$k } }
    foreach ($k in @($cost.Keys)) { $cost[$k] = [int][Math]::Round($cost[$k]) }
    $units += [ordered]@{
      id        = ($ref -split '/')[-1]
      faction   = $race
      cat       = $cat
      name      = $name
      brief     = UiText $info "brief_text"
      help      = UiText $info "help_text"
      extra     = UiText $info "extra_text"
      icon      = Icon $info.icon_name
      cost      = $cost
      time      = [int]$time
      size      = $size
      buildings = @($made[$ref].buildings)
    }
  }

  # Battlegroup'lar
  $bgs = Get-Data "chunked/battlegroup/races/$race.json"
  foreach ($p in $bgs.PSObject.Properties) {
    $t = $p.Value.techtree_bag
    if (-not $t -or $t.tech_tree_type -ne "battlegroup") { continue }
    $act = (Resolve $upgrades $t.activation_upgrade.instance_reference 2).upgrade_bag.ui_info
    $branches = @(foreach ($br in @($t.branches)) {
        $ups = @(foreach ($u in @($br.branch.upgrades)) {
            $ref = [string]$u.upgrade.instance_reference
            $ui = (Resolve $upgrades $ref 2).upgrade_bag.ui_info
            $n = Text $ui.screen_name
            if (-not $n) { continue }
            $tier = if (($ref -split '/')[-1] -match '_(\d)[ab]?_') { [int]$Matches[1] } else { 0 }
            [ordered]@{ id = ($ref -split '/')[-1]; tier = $tier; name = $n; brief = UiText $ui "brief_text"; help = UiText $ui "help_text"; icon = Icon $ui.icon_name }
          })
        [ordered]@{ name = Text $br.branch.name; upgrades = @($ups | Sort-Object { $_.tier }) }
      })
    $battlegroups += [ordered]@{
      id       = $p.Name
      faction  = $race
      name     = Text $t.name
      brief    = UiText $act "brief_text"
      help     = UiText $act "help_text"
      icon     = Icon $act.icon_name
      image    = Icon $t.image_wide
      branches = $branches
    }
  }

  $r = $RACES[$race]
  $factions += [ordered]@{ id = $race; name = [ordered]@{ tr = $r.tr; en = $r.en }; side = $r.side; color = $r.color }
}

# Haritalar
$maps = @()
foreach ($p in (Get-Data "mp-maps.json").PSObject.Properties) {
  $m = $p.Value
  if ($p.Name -eq "__meta" -or $m.category -ne "mp" -or -not $m.isLobbyVisible) { continue }
  $name = Text @{ value = $m.name.locstring }
  if (-not $name) { $name = [ordered]@{ tr = $m.name.en; en = $m.name.en } }
  $desc = Text @{ value = $m.description.locstring }
  $c = $m.resources.counts
  $maps += [ordered]@{
    id        = $m.id
    name      = $name
    desc      = $desc
    players   = [int]$m.maxPlayers
    layout    = $m.teamLayout
    community = [bool]$m.isCommunity
    author    = $(if ($m.isCommunity) { $m.author })
    points    = [ordered]@{ fuel = [int]$c.fuel; munitions = [int]$c.munitions; strategic = [int]$c.strategic; victory = [int]$c.victory }
    # İşaretli görsel: numaralı doğuş noktaları ve renkli kaynak noktaları. full: işaretsiz büyük görsel.
    image     = "$CDN/maps/$($m.id)/$($m.id).marked.colored.webp"
    full      = "$CDN/maps/$($m.id)/$($m.id).800.webp"
  }
}
$maps = @($maps | Sort-Object { $_.players }, { $_.name.en -replace '^\(\d+\)\s*', '' })

$data = [ordered]@{
  game       = "Company of Heroes 3"
  # Ortak CoH sayfalarında komutan bölümünün adı (CoH 3'te battlegroup).
  commander  = [ordered]@{ tr = "Battlegroup"; en = "Battlegroup"; plural = [ordered]@{ tr = "Battlegroup'lar"; en = "Battlegroups" } }
  factions   = $factions
  units      = @($units | Sort-Object { $_.faction }, { $_.cat }, { $_.cost.manpower })
  commanders = $battlegroups
  maps       = $maps
}
$json = $data | ConvertTo-Json -Depth 12 -Compress
$json = $json -replace '":\{\}', '":null'
$header = "// Company of Heroes 3 verisi: scripts/coh3-data.ps1 ile cohstats/coh3-data'dan (oyun dosyaları, MIT) oluşturulur, elle düzenlenmez.`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const COH = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Fraksiyon: {0}, birlik: {1}, battlegroup: {2}, harita: {3}" -f $factions.Count, $units.Count, $battlegroups.Count, $maps.Count)
