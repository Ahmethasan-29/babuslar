# Ortak oyun rehberi şablonu (assets/rehber.js) için yazıcı: oyunun data.js dosyasını ve HTML sayfalarını oluşturur.
# Kullanım:
#   . scripts/rehber-lib.ps1
#   Write-Rehber -Dir "ror2" -Data ([ordered]@{ game = "Risk of Rain 2"; sections = @(...); footer = @(...) }) -Source "scripts/ror2-data.ps1"
# Veri biçimi assets/rehber.js dosyasının başında anlatılır. Sayfalar: index.html + her bölüm için <id>.html.

$ROOT = Split-Path $PSScriptRoot
$UTF8 = New-Object System.Text.UTF8Encoding($false)

function Write-Rehber([string]$Dir, $Data, [string]$Source, [string]$Description) {
  $out = Join-Path $ROOT $Dir
  New-Item -ItemType Directory -Force $out | Out-Null
  $up = ($Dir -split '[\\/]' | Where-Object { $_ } | ForEach-Object { '..' }) -join '/'
  $game = $Data.game
  $json = ConvertTo-Json $Data -Depth 30 -Compress
  # Boş sözlükler ("{}") dizi yerine yazılmış olabilir; JS tarafı her ikisini de kaldırır.
  [IO.File]::WriteAllText((Join-Path $out 'data.js'), "// $game verisi: $Source ile oluşturulur, elle düzenlenmez.`nconst REHBER = $json;`n", $UTF8)

  $desc = if ($Description) { $Description } else { "$game rehberi: " + (($Data.sections | ForEach-Object { $_.title[0] }) -join ', ') + '.' }
  $page = {
    param($id, $title, $main)
    @"
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title · Babuşlar</title>
  <meta name="description" content="$([Net.WebUtility]::HtmlEncode($desc))">
  <meta name="referrer" content="no-referrer">
  <link rel="stylesheet" href="$up/assets/style.css">
  <script src="$up/assets/i18n.js"></script>
</head>
<body data-section="$id">
  <header class="site-header">
    <div class="container">
      <a class="brand" href="$up/"><span>Babuşlar</span></a>
      <nav class="nav" id="nav" aria-label="Ana menü"></nav>
    </div>
  </header>

  <main>
    <div class="container">
$main
    </div>
  </main>

  <footer class="site-footer">
    <div class="container" id="footer"></div>
  </footer>
  <script src="$up/assets/common.js"></script>
  <script src="data.js"></script>
  <script src="$up/assets/rehber.js"></script>
</body>
</html>
"@
  }

  $homeMain = @'
      <h1 class="page-title" id="title"></h1>
      <p class="rh-intro" id="intro"></p>
      <div class="games" id="cards"></div>
      <section id="guide" style="margin-top:32px"></section>
'@
  [IO.File]::WriteAllText((Join-Path $out 'index.html'), (& $page 'home' $game $homeMain), $UTF8)

  $list = @'
      <h1 class="page-title" id="title"></h1>
      <div class="toolbar">
        <input class="search" id="search" type="search" autocomplete="off">
        <div class="chips" id="groups" role="group" aria-label="Grup"></div>
        <div class="chips" id="tags" role="group" aria-label="Etiket"></div>
        <p class="count" id="count" aria-live="polite"></p>
      </div>
      <div class="bf-grid" id="list"></div>
'@
  foreach ($s in $Data.sections) {
    [IO.File]::WriteAllText((Join-Path $out "$($s.id).html"), (& $page $s.id "$($s.title[0]) · $game" $list), $UTF8)
  }
  Write-Host "$Dir yazıldı: data.js + $(1 + @($Data.sections).Count) sayfa"
}

# Wiki şablonlu metinleri sadeleştirir: [[Bağlantı|yazı]] → yazı, '''kalın''' → kalın, <br> → boşluk, HTML etiketleri silinir.
function Clean-WikiText([string]$t) {
  if (-not $t) { return $t }
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', '$1'
  $t = $t -replace "'{2,}", ''
  $t = $t -replace '<br\s*/?>', ' '
  $t = $t -replace '<[^>]+>', ''
  $t = [Net.WebUtility]::HtmlDecode($t)
  ($t -replace '\s+', ' ').Trim()
}

# --- Wiki yardımcıları (wiki.gg / fandom / MediaWiki)
$WIKI_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
$WIKI_TMP = [IO.Path]::GetTempFileName()

# Adresi indirir (curl: wiki.gg PowerShell'in kendi isteklerini 403 ile geri çevirir). api.php yanıtı JSON değilse
# ("Just a second..." doğrulama sayfası) bekleyip yeniden dener.
# Yanıtlar geçici klasörde saklanır (aynı gün yeniden çalıştırınca wiki yeniden yorulmaz). Temizlemek için: $env:REHBER_NOCACHE = 1
$WIKI_CACHE = Join-Path ([IO.Path]::GetTempPath()) "babuslar-rehber-cache"
New-Item -ItemType Directory -Force $WIKI_CACHE | Out-Null
$WIKI_SHA = [Security.Cryptography.SHA1]::Create()
function Get-WikiText([string]$url, [int]$tries = 8) {
  $hash = -join ($WIKI_SHA.ComputeHash([Text.Encoding]::UTF8.GetBytes($url)) | ForEach-Object { $_.ToString("x2") })
  $cached = Join-Path $WIKI_CACHE $hash
  if (-not $env:REHBER_NOCACHE -and (Test-Path $cached) -and ((Get-Item $cached).LastWriteTime -gt (Get-Date).AddHours(-20))) {
    return [IO.File]::ReadAllText($cached, [Text.Encoding]::UTF8)
  }
  foreach ($try in 1..$tries) {
    & curl.exe -s -L -m 60 -A $WIKI_UA -o $WIKI_TMP $url
    $text = [IO.File]::ReadAllText($WIKI_TMP, [Text.Encoding]::UTF8)
    if ($url -notmatch 'api\.php' -or $text.StartsWith('{')) {
      [IO.File]::WriteAllText($cached, $text, $UTF8)
      return $text
    }
    Start-Sleep -Seconds (3 * $try)
  }
  throw "Wiki yanıt vermedi: $url"
}

# Dosya adları → gerçek resim adresleri ({ "Ad.png" = url }). Olmayan dosyalar sonuçta yer almaz.
# Wikinin koruması bazı uzun istekleri geri çevirir; o zaman liste ikiye bölünüp yeniden denenir.
function Get-WikiImageUrls([string]$api, [string[]]$files) {
  $urls = @{}
  $queue = New-Object System.Collections.Queue
  $files = @($files | Where-Object { $_ } | Sort-Object -Unique)
  for ($i = 0; $i -lt $files.Count; $i += 25) { $queue.Enqueue(@($files[$i..([Math]::Min($i + 24, $files.Count - 1))])) }
  while ($queue.Count) {
    $batch = $queue.Dequeue()
    $titles = [Uri]::EscapeDataString((($batch | ForEach-Object { "File:$_" }) -join '|'))
    try { $r = (Get-WikiText "$api`?action=query&format=json&prop=imageinfo&iiprop=url&titles=$titles" 3) | ConvertFrom-Json }
    catch {
      if ($batch.Count -gt 1) { $h = [int][Math]::Floor($batch.Count / 2); $queue.Enqueue(@($batch[0..($h - 1)])); $queue.Enqueue(@($batch[$h..($batch.Count - 1)])) }
      else { Write-Host "  resim sorgulanamadı: $batch" }
      continue
    }
    $norm = @{}
    foreach ($n in @($r.query.normalized)) { if ($n) { $norm[$n.to] = $n.from } }
    foreach ($p in $r.query.pages.PSObject.Properties.Value) {
      if (-not $p.imageinfo) { continue }
      $from = if ($norm[$p.title]) { $norm[$p.title] } else { $p.title }
      # Önbellek parametresi atılır (Fandom: cb=…, wiki.gg: ?abc123); Fandom'un path-prefix'i kalmalı, yoksa 404 döner.
      $urls[$from.Substring(5)] = $p.imageinfo[0].url -creplace '([?&])cb=\d+&?', '$1' -creplace '\?[0-9a-f]{6}$', '' -creplace '[?&]$', ''
    }
  }
  $urls
}

# Wiki şablonlu metin → şablonun vurgu biçimi. {{Color|d|x}} → [[d|x]], {{Stack|x}} → [[s|x]], diğer şablonlar → son parametresi.
# Renk kodları: hasar d, iyileşme h, yardımcı u, stack s, uyarı/kırmızı w, anahtar sözcük k.
$WIKI_COLORS = @{ d = 'd'; damage = 'd'; y = 'd'; h = 'h'; g = 'h'; hp = 'h'; heal = 'h'; healing = 'h'; u = 'u'; extra = 'u'; b = 'u'; utility = 'u'; s = 's'; stack = 's'; c_stack = 's'; w = 'w'; r = 'w'; k = 'k' }
function Convert-WikiMarkup([string]$t) {
  if (-not $t) { return $null }
  $t = $t -replace '\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', '$1'
  $rx = [regex]'\{\{([^{}]*)\}\}'
  while ($rx.IsMatch($t)) {
    $t = $rx.Replace($t, {
        param($m)
        $parts = $m.Groups[1].Value -split '\|'
        $name = $parts[0].Trim().ToLowerInvariant()
        # Adlı parametreler (displayName=false, altText=…) metin sayılmaz; altText varsa gösterilen ad odur.
        $named = @{}; $pos = @()
        foreach ($p in ($parts | Select-Object -Skip 1)) { if ($p -match '^\s*(\w+)\s*=(.*)$') { $named[$Matches[1].ToLowerInvariant()] = $Matches[2] } else { $pos += $p } }
        $text = if ($named['alttext']) { $named['alttext'] } elseif ($pos.Count) { $pos[-1] } else { '' }
        if ($name -match 'link$' -and $pos.Count) { $text = $(if ($named['alttext']) { $named['alttext'] } else { $pos[0] }) }
        if (-not $text.Trim()) { return $text }
        if ($name -eq 'stack') { return "⟦s|$text⟧" }
        if ($name -eq 'color' -or $name -eq 'keyword' -or $name -eq 'colour') {
          $c = $parts[1].Trim().ToLowerInvariant()
          $cls = if ($WIKI_COLORS.ContainsKey($c)) { $WIKI_COLORS[$c] } elseif ($c -match '^#') { 'w' } else { 'u' }
          return "⟦$cls|$text⟧"
        }
        return $text
      })
  }
  $t = Clean-WikiText $t
  ($t -replace '⟦', '[[' -replace '⟧', ']]' -replace '\[\[([a-z])\|\s*\]\]', '').Trim()
}

# İki dilli değerler: [tr, en] (assets/rehber.js tx() ile seçer)
function Bi([string]$tr, [string]$en) { , @($tr, $en) }
function Sec($v) { Bi "$v sn" "$v s" }
function Lvl($base, $per) { Bi "$base [[s|(+$per/sv)]]" "$base [[s|(+$per/lvl)]]" }
function Slug([string]$t) { ($t.ToLowerInvariant() -creplace "[^a-z0-9]+", '-').Trim('-') }
# { anahtar = @(tr, en, renk) } → şablonun filtre düğmeleri
function Groups($map) { @(foreach ($k in $map.Keys) { [ordered]@{ id = $k; label = @($map[$k][0], $map[$k][1]); color = $map[$k][2] } }) }

# Sayfaların vikimetni, 50'şer: { "İstenen başlık" = metin }. Yönlendirmeler izlenir; olmayan sayfalar sonuçta yer almaz.
function Get-WikiPages([string]$api, [string[]]$titles) {
  $pages = @{}
  $titles = @($titles | Where-Object { $_ } | Sort-Object -Unique)
  for ($i = 0; $i -lt $titles.Count; $i += 50) {
    $batch = @($titles[$i..([Math]::Min($i + 49, $titles.Count - 1))])
    $q = [Uri]::EscapeDataString($batch -join '|')
    $r = (Get-WikiText "$api`?action=query&format=json&redirects=1&prop=revisions&rvprop=content&rvslots=main&titles=$q") | ConvertFrom-Json
    # İstenen başlık → son başlık (normalleştirme + yönlendirme)
    $map = @{}
    foreach ($t in $batch) { $map[$t] = $t }
    foreach ($n in @($r.query.normalized)) { if ($n) { foreach ($k in @($map.Keys)) { if ($map[$k] -eq $n.from) { $map[$k] = $n.to } } } }
    foreach ($n in @($r.query.redirects)) { if ($n) { foreach ($k in @($map.Keys)) { if ($map[$k] -eq $n.from) { $map[$k] = $n.to } } } }
    $byTitle = @{}
    foreach ($p in $r.query.pages.PSObject.Properties.Value) {
      if ($p.revisions) { $byTitle[$p.title] = $p.revisions[0].slots.main.'*' }
    }
    foreach ($k in $map.Keys) { if ($byTitle.ContainsKey($map[$k])) { $pages[$k] = $byTitle[$map[$k]] } }
  }
  $pages
}

# Vikimetindeki ilk {{Şablon ...}} çağrısının parametreleri: { ad = değer }. İç içe şablonlar korunur.
function Get-InfoboxParams([string]$text, [string]$template) {
  # "Infobox Track" ve "Infobox_Track" aynı şablondur
  $m = [regex]::Match($text, '\{\{\s*' + ([regex]::Escape($template) -creplace '\\ ', '[ _]'), 'IgnoreCase, CultureInvariant')
  if (-not $m.Success) { return @{} }
  $start = $m.Index
  $depth = 0; $i = $start; $end = -1
  while ($i -lt $text.Length - 1) {
    $two = $text.Substring($i, 2)
    if ($two -eq '{{') { $depth++; $i += 2; continue }
    if ($two -eq '}}') { $depth--; $i += 2; if ($depth -eq 0) { $end = $i; break }; continue }
    $i++
  }
  if ($end -lt 0) { return @{} }
  $body = $text.Substring($start + 2, $end - $start - 4)
  # Üst düzeydeki | işaretlerinden böl
  $parts = @(); $depth = 0; $cur = New-Object Text.StringBuilder
  for ($j = 0; $j -lt $body.Length; $j++) {
    $c = $body[$j]
    if ($j -lt $body.Length - 1 -and ($body.Substring($j, 2) -eq '{{' -or $body.Substring($j, 2) -eq '[[')) { $depth++; [void]$cur.Append($body.Substring($j, 2)); $j++; continue }
    if ($j -lt $body.Length - 1 -and ($body.Substring($j, 2) -eq '}}' -or $body.Substring($j, 2) -eq ']]')) { $depth--; [void]$cur.Append($body.Substring($j, 2)); $j++; continue }
    if ($c -eq '|' -and $depth -eq 0) { $parts += $cur.ToString(); [void]$cur.Clear(); continue }
    [void]$cur.Append($c)
  }
  $parts += $cur.ToString()
  $params = @{}
  foreach ($p in $parts | Select-Object -Skip 1) {
    $eq = $p.IndexOf('=')
    if ($eq -gt 0) { $params[$p.Substring(0, $eq).Trim().ToLowerInvariant()] = $p.Substring($eq + 1).Trim() }
  }
  $params
}

# Bilgi kutusundaki resim parametresinden dosya adı: "X.png", "[[File:X.png|200px]]", "<gallery>X.png|Seviye 1…" → "X.png"
function ImageName([string]$param, [string]$fallback) {
  if ($param -and $param -match '([^\[\]|:=\n<>]+\.(?:png|jpe?g|gif|webp))') { return $Matches[1].Trim() }
  $fallback
}

# Fandom resminin küçültülmüş hali: .../revision/latest?path-prefix=x → .../revision/latest/scale-to-width-down/160?path-prefix=x
function Thumb([string]$url, [int]$width) {
  if (-not $url) { return $null }
  if ($url -notmatch '/revision/latest') { return $url }
  $url -replace '/revision/latest(/scale-to-width-down/\d+)?', "/revision/latest/scale-to-width-down/$width"
}

# Metindeki tabloları tek tek ayırır: @{ heading = son == başlık ==; text = "{| … |}" }. İç içe tablolar dışarıdakinin parçası sayılır.
function Split-WikiTables([string]$text) {
  $out = @(); $heading = ''; $depth = 0; $buf = $null
  foreach ($line in ($text -split "`n")) {
    $l = $line.TrimEnd("`r")
    if ($depth -eq 0 -and $l -match '^\s*(=+)\s*(.+?)\s*\1\s*$') { $heading = Clean-WikiText $Matches[2]; continue }
    if ($l -match '^\s*\{\|') { if ($depth -eq 0) { $buf = New-Object Text.StringBuilder }; $depth++ }
    if ($depth -gt 0) { [void]$buf.AppendLine($l) }
    if ($l -match '^\s*\|\}') { $depth--; if ($depth -eq 0) { $out += [pscustomobject]@{ heading = $heading; text = $buf.ToString() } } }
  }
  $out
}

# Tablonun gövde satırları: her satır hücre metinleri dizisi. "rowspan=N" hücreler sonraki satırlara aynı sütunda taşınır;
# başlık (!) hücreleri atlanır. Hücre öznitelikleri (style=…|) atılır.
function Get-TableRows([string]$table) {
  $rows = @(); $carry = @{}
  $chunks = ($table -split '\n\s*\|-[^\n]*') | Select-Object -Skip 1
  foreach ($chunk in $chunks) {
    $cells = @(); $cur = $null
    foreach ($line in ($chunk -split "`n")) {
      $l = $line.TrimEnd("`r")
      if ($l -match '^\s*\|\}') { break }
      if ($l -match '^\s*!') { $cur = $null; continue }
      if ($l -match '^\s*\|(?!\})') {
        if ($null -ne $cur) { $cells += , $cur }
        $parts = @(Split-Inline ($l -replace '^\s*\|', '') '||')
        for ($k = 0; $k -lt $parts.Count - 1; $k++) { $cells += , $parts[$k] }
        $cur = $parts[-1]
      } elseif ($null -ne $cur) { $cur += "`n$l" }
    }
    if ($null -ne $cur) { $cells += , $cur }
    if (-not $cells.Count) { continue }
    # Öznitelikleri ayır, rowspan'ları uygula
    $row = New-Object System.Collections.ArrayList
    $col = 0
    foreach ($c in $cells) {
      while ($carry.ContainsKey($col)) { [void]$row.Add($carry[$col].text); $carry[$col].left -= 1; if ($carry[$col].left -le 0) { $carry.Remove($col) }; $col++ }
      $sc = Split-Cell $c
      $span = if ($sc.attrs -match 'rowspan\s*=\s*"?(\d+)') { [int]$Matches[1] } else { 1 }
      [void]$row.Add($sc.text)
      if ($span -gt 1) { $carry[$col] = @{ text = $sc.text; left = $span - 1 } }
      $col++
    }
    while ($carry.ContainsKey($col)) { [void]$row.Add($carry[$col].text); $carry[$col].left -= 1; if ($carry[$col].left -le 0) { $carry.Remove($col) }; $col++ }
    $rows += , @($row)
  }
  $rows
}

# İngilizce tarihleri Türkçeye çevirir: "October 19th, 2012" / "19 October 2012" / "Oct 19, 2012" → "19 Ekim 2012";
# yaygın ekler de çevrilir ("(launch release)" → "(çıkışla birlikte)", "(as X)" → "(X olarak)").
$TR_MONTHS = @{ jan = 'Ocak'; feb = 'Şubat'; mar = 'Mart'; apr = 'Nisan'; may = 'Mayıs'; jun = 'Haziran'; jul = 'Temmuz'; aug = 'Ağustos'; sep = 'Eylül'; oct = 'Ekim'; nov = 'Kasım'; dec = 'Aralık' }
function TrDate([string]$t) {
  if (-not $t) { return $t }
  $m = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?'
  $mon = { param($x) $TR_MONTHS[$x.Substring(0, 3).ToLowerInvariant()] }
  $t = [regex]::Replace($t, "$m\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})", { param($x) "$($x.Groups[2].Value) $(& $mon $x.Groups[1].Value) $($x.Groups[3].Value)" })
  $t = [regex]::Replace($t, "(\d{1,2})(?:st|nd|rd|th)?\s+$m,?\s+(\d{4})", { param($x) "$($x.Groups[1].Value) $(& $mon $x.Groups[2].Value) $($x.Groups[3].Value)" })
  $t -replace '\(launch release\)', '(çıkışla birlikte)' -replace '\(as ([^)]+)\)', '($1 olarak)'
}
