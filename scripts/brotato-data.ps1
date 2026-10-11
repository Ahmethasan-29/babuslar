# Brotato verisini toplar ve brotato/data.js dosyasını yazar.
# Kaynak: Brotato Wiki (brotato.wiki.spellsandguns.com, CC BY-SA). Karakter, silah ve eşya bilgileri wikinin
# "Template:Character Data", "Template:Weapon Data" ve "Template:Item Data" şablonlarında {{#switch:…}} tabloları olarak durur:
# her kayıt "|ad = {{#switch:… |alan=değer …}}", silahlarda seviyeye göre değişen alanlar "|1|common=… |2|rare=…".
# Metindeki {{Color|green|+8}} → <b class="pos">, {{StatIcon|MeleeDamage}} → ⟨MeleeDamage⟩ (sayfada stat adına çevrilir).
# Kullanım: powershell -File scripts/brotato-data.ps1 -Out brotato/data.js
param([string]$Out = "brotato/data.js")
$ErrorActionPreference = "Stop"
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
. (Join-Path $PSScriptRoot "wikigg-lib.ps1")
$API = "https://brotato.wiki.spellsandguns.com/api.php"

# Wiki biçimini sade HTML'e çevirir.
function Markup([string]$t) {
  if (-not $t) { return "" }
  $t = $t -replace '(?s)<!--.*?-->', ''
  $t = $t -replace '\{\{\s*StatIcon\s*\|\s*([^}|]+?)\s*\}\}', '⟨$1⟩'
  $t = $t -replace '\{\{\s*Color\s*\|\s*green\s*\|([^{}]*)\}\}', '<b class="pos">$1</b>'
  $t = $t -replace '\{\{\s*Color\s*\|\s*red\s*\|([^{}]*)\}\}', '<b class="neg">$1</b>'
  $t = $t -replace '\{\{\s*Color\s*\|\s*(tier\d)\s*\|([^{}]*)\}\}', '<b class="$1">$2</b>'
  $t = $t -replace '\{\{\s*Color\s*\|[^|}]*\|([^{}]*)\}\}', '$1'
  $t = $t -replace '<span style="color:\s*rgb\(0,\s*255,\s*0\);?">', '<b class="pos">' -replace '<span style="color:\s*rgb\(244,\s*0,\s*0\);?">', '<b class="neg">' -replace '<span[^>]*>', '<b>' -replace '</span>', '</b>'
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace "'{2,}", '' -replace '<br\s*/?>', '<br>'
  ($t -replace '[ \t]+', ' ').Trim()
}
function Plain([string]$t) { ((Markup $t) -replace '<[^>]+>', '' -replace '⟨[^⟩]*⟩', '').Trim() }

# {{#switch:{{lc:{{{1|}}}}} |ad = {{#switch:{{lc:{{{2|}}}}} … }} …}} → @{ ad = @{ alan = değer | @(tier1..4) } }
function Parse-DataTemplate([string]$text) {
  $out = [ordered]@{}
  $rx = New-Object regex '(?m)^\|\s*([^=|\r\n]+?)\s*=\s*\{\{#switch:\{\{lc:\{\{\{2\|\}\}\}\}\}', 'None'
  $ms = $rx.Matches($text)
  for ($i = 0; $i -lt $ms.Count; $i++) {
    $name = $ms[$i].Groups[1].Value.Trim()
    $start = $ms[$i].Index + $ms[$i].Length
    $end = if ($i + 1 -lt $ms.Count) { $ms[$i + 1].Index } else { $text.Length }
    $body = $text.Substring($start, $end - $start)
    $fields = [ordered]@{}
    $cur = $null; $tiers = $null
    foreach ($line in ($body -split "`n")) {
      $l = $line.Trim()
      if ($null -ne $tiers) {
        if ($l -match '^\|(\d)\|[a-z]+\s*=(.*)$') { $tiers[[int]$Matches[1] - 1] = $Matches[2].Trim(); continue }
        if ($l -match '^\|#default') { $fields[$cur] = $tiers; $tiers = $null; continue }
      }
      if ($l -match '^\|([a-z0-9_]+)\s*=\s*\{\{#switch:\{\{lc:\{\{\{3\|\}\}\}\}\}\s*$') { $cur = $Matches[1]; $tiers = @($null, $null, $null, $null); continue }
      if ($l -match '^\|([a-z0-9_]+)\s*=(.*)$' -and $Matches[1] -ne '#default') { $fields[$Matches[1]] = $Matches[2].Trim(); continue }
    }
    $out[$name] = $fields
  }
  $out
}

$src = Get-Wikitext @("Template:Character Data", "Template:Weapon Data", "Template:Item Data")
$chars = Parse-DataTemplate $src["Template:Character Data"]
$weps = Parse-DataTemplate $src["Template:Weapon Data"]
$its = Parse-DataTemplate $src["Template:Item Data"]

# Sayfa adları (büyük harf) için wikideki gerçek başlıklar: kategori yerine tablo anahtarlarını başlık biçimine çeviririz
# ve resim adları "Ad.png" olarak denenir.
function Title([string]$k) { (Get-Culture).TextInfo.ToTitleCase($k) }
$TI = (New-Object Globalization.CultureInfo "en-US").TextInfo

$characters = @(foreach ($k in $chars.Keys) {
    $f = $chars[$k]
    [ordered]@{
      name     = $TI.ToTitleCase($k)
      stats    = Markup $f["stats"]
      unlock   = Plain $f["unlockedby"]
      unlocks  = (Plain $f["unlocks"])
      wants    = Plain $f["wantedtags"]
      weapons  = @((Plain $f["startingwpns"]) -split '\s*,\s*' | Where-Object { $_ })
      dlc      = ($f["isdlc"] -and $f["isdlc"] -ne "-")
    }
  })
$weapons = @(foreach ($k in $weps.Keys) {
    $f = $weps[$k]
    $tier = { param($x) @($x | ForEach-Object { Markup $_ }) }
    [ordered]@{
      name    = $TI.ToTitleCase($k)
      rarity  = [int]("0" + ($f["rarity"] -replace '\D', ''))
      classes = @((Plain $f["types"]) -split '\s*,\s*' | Where-Object { $_ })
      damage  = & $tier $f["damage"]
      speed   = @($f["attackspeed"] | ForEach-Object { Plain $_ })
      dps     = & $tier $f["dps"]
      crit    = @($f["crit"] | ForEach-Object { Plain $_ })
      range   = @($f["range"] | ForEach-Object { Plain $_ })
      price   = @($f["price"] | ForEach-Object { Plain $_ })
      special = Markup $f["special"]
      type    = $(if ($f["attacktype"]) { Plain $f["attacktype"] } else { "" })
      unlock  = Plain $f["unlockedby"]
      dlc     = ($f["isdlc"] -and $f["isdlc"] -ne "-")
    }
  })
$items = @(foreach ($k in $its.Keys) {
    $f = $its[$k]
    [ordered]@{
      name   = $TI.ToTitleCase($k)
      rarity = [int]("0" + ($f["rarity"] -replace '\D', ''))
      stats  = Markup $f["stats"]
      price  = Plain $f["price"]
      limit  = Plain $f["limit"]
      unique = ($f["unique"] -eq "true")
      tags   = @((Plain $f["tags"]) -split '\s*,\s*' | Where-Object { $_ })
      unlock = Plain $f["unlockedby"]
      dlc    = ($f["isdlc"] -and $f["isdlc"] -ne "-")
    }
  })

# Resimler: "Ad.png" (wiki dosya adları sayfa adıyla aynı). Büyük/küçük harf için wikinin sayfa başlıklarını kullanırız.
$allNames = @($characters + $weapons + $items | ForEach-Object { $_.name })
# Wikideki bütün sayfa başlıkları: küçük harfli anahtar → gerçek yazım ("smg" → "SMG", "captain’s sword" → "Captain's Sword").
function Key2([string]$s) { ($s.ToLowerInvariant() -replace "[’']", "'") }
$titles = @{}
$cont = ""
do {
  $r = Get-Json "$API`?action=query&list=allpages&apnamespace=0&aplimit=500&format=json$cont"
  foreach ($p in $r.query.allpages) { $titles[(Key2 $p.title)] = $p.title }
  $cont = $(if ($r.continue.apcontinue) { "&apcontinue=" + [uri]::EscapeDataString($r.continue.apcontinue) } else { "" })
} while ($cont)
foreach ($x in @($characters + $weapons + $items)) { $k = Key2 $x.name; if ($titles[$k]) { $x.name = $titles[$k] } else { $x.name = $x.name -replace "’S\b", "'s" } }
$imgs = Get-ImageUrls @($characters + $weapons + $items | ForEach-Object { "$($_.name).png" })
foreach ($x in @($characters + $weapons + $items)) { $x.icon = $imgs["$($x.name).png"] }

$data = [ordered]@{ characters = @($characters | Sort-Object { $_.name }); weapons = @($weapons | Sort-Object { $_.name }); items = @($items | Sort-Object { $_.name }) }
$json = $data | ConvertTo-Json -Depth 6 -Compress
$header = "// Brotato verisi: scripts/brotato-data.ps1 ile Brotato Wiki'den (CC BY-SA) oluşturulur, elle düzenlenmez.`n"
New-Item -ItemType Directory -Force (Split-Path (Join-Path (Get-Location) $Out)) | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $header + "const BRO = " + $json + ";`n", (New-Object Text.UTF8Encoding $false))
Write-Host ("Karakter: {0}, silah: {1}, eşya: {2}; resimsiz: {3}" -f $characters.Count, $weapons.Count, $items.Count, (@($characters + $weapons + $items | Where-Object { -not $_.icon } | ForEach-Object { $_.name }) -join ", "))
