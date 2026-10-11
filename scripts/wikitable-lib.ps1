# Wiki tablolarını ({| … |}) okuyan ortak yardımcı. Başlıklardaki rowspan/colspan (iki satırlı başlık) çözülür,
# hücrelerdeki stil öznitelikleri ("style=… | değer") atılır. scripts/pz-data.ps1 ve diğerleri dot-source ile yükler.

# Hücre metnindeki öznitelik kısmını ayırır: 'style="x" | 8' → @{ attrs = 'style="x"'; text = '8' }.
function Split-Cell([string]$c) {
  $depth = 0
  for ($i = 0; $i -lt $c.Length - 1; $i++) {
    $two = $c.Substring($i, 2)
    if ($two -eq '[[' -or $two -eq '{{') { $depth++; $i++; continue }
    if ($two -eq ']]' -or $two -eq '}}') { $depth--; $i++; continue }
    if ($c[$i] -eq '|' -and $depth -eq 0) {
      $attrs = $c.Substring(0, $i)
      if ($attrs -match '=' -and $attrs -notmatch '[\[\{]') { return @{ attrs = $attrs; text = $c.Substring($i + 1).Trim() } }
      break
    }
  }
  @{ attrs = ""; text = $c.Trim() }
}

# Bir satırı "||" / "!!" ayraçlarından böler (bağlantı ve şablon içindekiler hariç).
function Split-Inline([string]$line, [string]$sep) {
  $out = @(); $depth = 0; $cur = New-Object Text.StringBuilder
  for ($i = 0; $i -lt $line.Length; $i++) {
    $two = if ($i + 1 -lt $line.Length) { $line.Substring($i, 2) } else { "" }
    if ($two -eq '[[' -or $two -eq '{{') { $depth++; [void]$cur.Append($two); $i++; continue }
    if ($two -eq ']]' -or $two -eq '}}') { $depth--; [void]$cur.Append($two); $i++; continue }
    if ($two -eq $sep -and $depth -eq 0) { $out += $cur.ToString(); [void]$cur.Clear(); $i++; continue }
    [void]$cur.Append($line[$i])
  }
  $out += $cur.ToString()
  $out
}

# Başlık hücresinin adı: "[[File:x.png|32px|link=|Minimum damage]]" → "Minimum damage", düz yazı olduğu gibi.
function Header-Name([string]$t) {
  if ($t -match '\[\[File:[^\]]*\]\]') {
    $parts = @(($Matches[0].Trim('[', ']') -split '\|') | Select-Object -Skip 1 | Where-Object { $_ -notmatch '^\s*(\d+(x\d+)?px|link=.*|alt=.*)\s*$' })
    if ($parts.Count) { return $parts[-1].Trim() }
  }
  ($t -replace '\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', '$1' -replace "'{2,}", '' -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim()
}

# Metindeki tüm tablolar: @{ section = son başlık; columns = @(ad…); rows = @(@(hücre…)…) }.
function Get-WikiTables([string]$text) {
  $tables = @()
  $section = ""
  $lines = $text -split "`n"
  $in = $false
  foreach ($raw in $lines) {
    $line = $raw.TrimEnd("`r")
    if (-not $in) {
      if ($line -match '^\s*(=+)\s*(.*?)\s*\1') { $section = ($Matches[2] -replace '<!--.*?-->', '').Trim(); continue }
      if ($line -match '^\s*\{\|') { $in = $true; $hdr = @(); $rows = @(); $cur = $null; $isHeader = $false; continue }
      continue
    }
    if ($line -match '^\s*\|\}') {
      if ($cur) { if ($isHeader) { $hdr += , $cur } else { $rows += , $cur } }
      # Başlık satırlarından sütun adları (rowspan/colspan).
      $cols = @()
      if ($hdr.Count -ge 2) {
        $second = @($hdr[1]); $k = 0
        foreach ($h in $hdr[0]) {
          $span = if ($h.attrs -match 'colspan\s*=\s*"?(\d+)') { [int]$Matches[1] } else { 1 }
          $rs = $h.attrs -match 'rowspan'
          if ($span -gt 1 -or -not $rs) { for ($s = 0; $s -lt $span; $s++) { $cols += ("{0}: {1}" -f (Header-Name $h.text), (Header-Name $second[$k].text)); $k++ } }
          else { $cols += (Header-Name $h.text) }
        }
      }
      elseif ($hdr.Count -eq 1) { $cols = @($hdr[0] | ForEach-Object { Header-Name $_.text }) }
      $tables += [pscustomobject]@{ section = $section; columns = $cols; rows = @($rows | ForEach-Object { , @($_ | ForEach-Object { $_.text }) }) }
      $in = $false; continue
    }
    if ($line -match '^\s*\|\+') { continue }
    if ($line -match '^\s*\|-') {
      if ($cur) { if ($isHeader) { $hdr += , $cur } else { $rows += , $cur } }
      $cur = @(); $isHeader = $false; continue
    }
    if ($line -match '^\s*!(.*)$') {
      if ($null -eq $cur) { $cur = @() }
      $isHeader = $true
      foreach ($c in (Split-Inline $Matches[1] '!!')) { $cur += (Split-Cell $c) }
      continue
    }
    if ($line -match '^\s*\|(.*)$') {
      if ($null -eq $cur) { $cur = @() }
      foreach ($c in (Split-Inline $Matches[1] '||')) { $cur += (Split-Cell $c) }
      continue
    }
    # Devam satırı: son hücreye eklenir.
    if ($cur -and $cur.Count) { $last = $cur[-1]; $last.text = ($last.text + "`n" + $line).Trim() }
  }
  , $tables
}
