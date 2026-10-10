# Darkest Dungeon Wiki (darkestdungeon.wiki.gg) için ortak yardımcılar: istekler, önbellek, şablon ayrıştırıcı.
# scripts/dd-data.ps1 ve scripts/dd2-data.ps1 bu dosyayı dot-source ile yükler.
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
$API = "https://darkestdungeon.wiki.gg/api.php"

# İstekler curl ile yapılır: wikinin koruması PowerShell'in kendi bağlantısını (Invoke-RestMethod) 403 ile geri çevirir.
# Yanıt dosyaya yazılıp UTF-8 olarak okunur (konsol kod sayfası Türkçe/özel karakterleri bozmasın diye).
$TMP = [IO.Path]::GetTempFileName()
$BODYFILE = [IO.Path]::GetTempFileName()
# Wiki çok sık istekte "Just a second..." doğrulama sayfası döndürür; istekler arası kısa bekleme yapılır,
# doğrulama sayfası gelirse daha uzun beklenip yeniden denenir.
# Yanıtlar geçici klasörde saklanır: betik yarıda kalırsa bir sonraki çalıştırmada aynı istekler yeniden yapılmaz.
$CACHE = Join-Path ([IO.Path]::GetTempPath()) "babuslar-dd-cache"
New-Item -ItemType Directory -Force $CACHE | Out-Null
$SHA = [Security.Cryptography.SHA1]::Create()
function Curl-Json([string[]]$extra) {
  $sig = (($extra | ForEach-Object { $_ -replace '^@.*', '@body' }) -join ' ') + $(if ($extra -contains "--data-binary") { [IO.File]::ReadAllText($BODYFILE) } else { "" })
  $hash = -join ($SHA.ComputeHash([Text.Encoding]::UTF8.GetBytes($sig)) | ForEach-Object { $_.ToString("x2") })
  $cached = Join-Path $CACHE "$hash.json"
  if (Test-Path $cached) { return [IO.File]::ReadAllText($cached, [Text.Encoding]::UTF8) | ConvertFrom-Json }
  foreach ($try in 1..10) {
    Start-Sleep -Milliseconds 2000
    & curl.exe -s -m 60 -A $UA -o $TMP @extra
    if ($LASTEXITCODE -eq 0) {
      $text = [IO.File]::ReadAllText($TMP, [Text.Encoding]::UTF8)
      if ($text.StartsWith("{")) {
        [IO.File]::WriteAllText($cached, $text, (New-Object Text.UTF8Encoding $false))
        return $text | ConvertFrom-Json
      }
      Write-Host "  wiki bekletiyor, yeniden denenecek… ($($text.Length) bayt: $($text.Substring(0, [Math]::Min(300, $text.Length))))"
    }
    Start-Sleep 45
  }
  throw "Alınamadı: $($extra -join ' ')"
}
function Get-Json($url) { Curl-Json @($url) }
function Post-Json($body) {
  $form = ($body.GetEnumerator() | Sort-Object Key | ForEach-Object { "$($_.Key)=$([uri]::EscapeDataString([string]$_.Value))" }) -join '&'
  [IO.File]::WriteAllText($BODYFILE, $form, (New-Object Text.UTF8Encoding $false))
  Curl-Json @("--data-binary", "@$BODYFILE", "-H", "Content-Type: application/x-www-form-urlencoded", $API)
}
function Values($obj) { if ($obj) { $obj.PSObject.Properties | ForEach-Object { $_.Value } } }
function Batches($list, $size) { for ($i = 0; $i -lt $list.Count; $i += $size) { , @($list[$i..([Math]::Min($i + $size - 1, $list.Count - 1))]) } }

# Sayfaların ham wikitext'i (50'şer).
function Get-Wikitext([string[]]$titles) {
  $map = @{}
  foreach ($batch in (Batches @($titles | Sort-Object -Unique) 50)) {
    $r = Post-Json @{ action = "query"; prop = "revisions"; rvprop = "content"; rvslots = "main"; redirects = "1"; format = "json"; formatversion = "2"; titles = ($batch -join "|") }
    $from = @{}
    foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
    foreach ($p in $r.query.pages) {
      if (-not $p.revisions) { continue }
      $t = $p.title
      for ($h = 0; $h -lt 3 -and $from.ContainsKey($t); $h++) { $t = $from[$t] }
      $map[$t] = $p.revisions[0].slots.main.content
      $map[$p.title] = $p.revisions[0].slots.main.content
    }
  }
  $map
}

# Sayfaların giriş paragrafı (düz metin).
function Get-Extracts([string[]]$titles) {
  $map = @{}
  foreach ($batch in (Batches @($titles | Sort-Object -Unique) 20)) {
    $r = Post-Json @{ action = "query"; prop = "extracts"; exintro = "1"; explaintext = "1"; exlimit = "20"; redirects = "1"; format = "json"; formatversion = "2"; titles = ($batch -join "|") }
    $from = @{}
    foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
    foreach ($p in $r.query.pages) {
      $t = $p.title
      for ($h = 0; $h -lt 3 -and $from.ContainsKey($t); $h++) { $t = $from[$t] }
      $map[$t] = ($p.extract -replace '\s+\n', "`n" -replace '\n{2,}', "`n").Trim()
    }
  }
  $map
}

# Dosya adları → indirilebilir adresler.
function Get-ImageUrls([string[]]$files) {
  $map = @{}
  $list = @($files | Where-Object { $_ } | ForEach-Object { ($_ -replace '_', ' ').Trim() } | Sort-Object -Unique)
  foreach ($batch in (Batches $list 50)) {
    $r = Get-Json ("$API`?action=query&prop=imageinfo&iiprop=url&redirects=1&format=json&formatversion=2&titles=" + [uri]::EscapeDataString((($batch | ForEach-Object { "File:$_" }) -join "|")))
    $from = @{}
    foreach ($n in @($r.query.normalized) + @($r.query.redirects)) { if ($n) { $from[$n.to] = $n.from } }
    foreach ($p in $r.query.pages) {
      if (-not $p.imageinfo) { continue }
      $t = $p.title
      for ($h = 0; $h -lt 3 -and $from.ContainsKey($t); $h++) { $t = $from[$t] }
      $map[$t.Substring(5)] = $p.imageinfo[0].url -replace '\?.*$', ''
    }
  }
  $map
}

# Wiki şablonlarını wikinin kendisine açtırır (BuffEffect, EnemyEffect…) ve sonucu sade HTML'e çevirir.
$SEP = "@@SEP@@"
function Expand-Texts([string[]]$texts) {
  $out = @()
  foreach ($batch in (Batches $texts 60)) {
    $r = Post-Json @{ action = "expandtemplates"; prop = "wikitext"; format = "json"; formatversion = "2"; text = ($batch -join $SEP) }
    $out += ($r.expandtemplates.wikitext -split [regex]::Escape($SEP))
  }
  $out | ForEach-Object { Clean-Html $_ }
}

# Yalnızca kalın yazı ve etki renkleri (span class) korunur; dosya, bağlantı ve stil kalıntıları temizlenir.
function Clean-Html([string]$t) {
  if (-not $t) { return "" }
  # Oyun simgeleri (Stress, Burn, Combo…) yazı olarak kalsın: "[[File:x.png|20px|alt=Stress]]" → <span class="tok">Stress</span>
  $t = $t -replace '\[\[File:[^\]]*?\|alt=([^\]|]+)[^\]]*\]\]', '<span class="tok">$1</span>'
  $t = $t -replace '\[\[File:[^\]]*\]\]', ''
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1'
  # Simgenin hemen ardından aynı ad yazı olarak da geliyorsa ("Candles of Hope Candles of Hope") tek kez kalsın.
  $t = $t -replace '<span class="tok">([^<]+)</span>\s*\1', '<span class="tok">$1</span>'
  $t = $t -replace "'''''(.+?)'''''", '<b>$1</b>' -replace "'''(.+?)'''", '<b>$1</b>' -replace "''(.+?)''", '<i>$1</i>'
  # Ayrı satırlar (<div>…) satır sonu olarak korunur; art arda ya da baştaki/sondaki satır sonları atılır.
  $t = $t -replace '<div[^>]*>', '<br>' -replace '</div>', ''
  $t = $t -replace '<span style="[^"]*">', '<span>'
  $t = $t -replace '<br\s*/?>', '<br>'
  $t = $t -replace '\{\{[^{}]*\}\}', ''
  $t = $t -replace '^\s*\*\s*', '' -replace '\n\s*\*\s*', '<br>'
  $t = ($t -replace '\s+', ' ').Trim()
  $t = $t -replace '(\s*<br>\s*)+', '<br>'
  ($t -replace '^<br>', '' -replace '<br>$', '').Trim()
}

# Şablon ayrıştırıcı: metindeki {{Ad|a=b|...}} çağrılarını iç içe şablonları bozmadan parametre tablosuna çevirir.
function Get-Templates([string]$text, [string]$name) {
  $result = @()
  # MediaWiki şablon adlarında büyük-küçük harf fark etmez ("heroability" = "Heroability").
  # "Template:" öneki ve ad içindeki boşluk/alt çizgi farkı da tanınır ("{{Template:CampSkills", "DD EnemyInfobox").
  $pattern = ([regex]::Escape($name) -replace '(\\ |_)', '[ _]')
  $rx = New-Object regex ('\{\{\s*(?:Template:)?' + $pattern + '\s*[\|\}]'), 'IgnoreCase'
  $pos = 0
  while ($true) {
    $m = $rx.Match($text, $pos)
    if (-not $m.Success) { break }
    $start = $m.Index + 2
    $depth = 1; $sq = 0; $i = $start
    $parts = @(); $cur = New-Object Text.StringBuilder
    while ($i -lt $text.Length -and $depth -gt 0) {
      $two = if ($i + 1 -lt $text.Length) { $text.Substring($i, 2) } else { "" }
      if ($two -eq '{{') { $depth++; [void]$cur.Append($two); $i += 2; continue }
      if ($two -eq '}}') { $depth--; if ($depth -eq 0) { break }; [void]$cur.Append($two); $i += 2; continue }
      if ($two -eq '[[') { $sq++; [void]$cur.Append($two); $i += 2; continue }
      if ($two -eq ']]') { $sq--; [void]$cur.Append($two); $i += 2; continue }
      $c = $text[$i]
      if ($c -eq '|' -and $depth -eq 1 -and $sq -le 0) { $parts += $cur.ToString(); [void]$cur.Clear() } else { [void]$cur.Append($c) }
      $i++
    }
    $parts += $cur.ToString()
    $params = @{}
    $n = 0
    foreach ($p in ($parts | Select-Object -Skip 1)) {
      # (?s): değer birden çok satıra yayılabilir (ör. trinket etkileri madde madde yazılır).
      if ($p -match '(?s)^\s*([^=\n]+?)\s*=(.*)$') { $params[$Matches[1].Trim().ToLowerInvariant()] = $Matches[2].Trim() }
      else { $n++; $params["$n"] = $p.Trim() }
    }
    $result += , $params
    $pos = $i + 2
  }
  , $result
}

function Category-Members([string]$cat) {
  $r = Get-Json "$API`?action=query&list=categorymembers&cmtitle=Category:$([uri]::EscapeDataString($cat))&cmlimit=500&cmnamespace=0&format=json"
  @($r.query.categorymembers | ForEach-Object { $_.title })
}

function Key([string]$t) { ($t.ToLowerInvariant() -replace '\(darkest dungeon\)', '' -replace '[^a-z0-9]', '') }
function FileName([string]$v) {
  if (-not $v) { return $null }
  if ($v -match '\[\[File:([^\]|]+)') { return $Matches[1].Trim() }
  $v.Trim()
}

