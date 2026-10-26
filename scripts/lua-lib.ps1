# Wikilerin Lua veri modüllerini (Module:.../Data) PowerShell nesnelerine çeviren küçük ayrıştırıcı.
# Yalnızca veri tanımlarını anlar: tablolar, metinler, sayılar, true/false/nil, "local x = ...", "t[k] = ...",
# "t.k = ..." ve "return ...". İlk "function" sözcüğüne gelince durur (modüllerin geri kalanı yalnızca kod).
# Kullanım: . scripts/lua-lib.ps1; $data = ConvertFrom-Lua $metin
#   Sonuç: "return" edilen değer; yoksa tanımlanan tüm "local" değişkenler (ad → değer).
#   Lua tabloları [ordered] sözlük olur; yalnızca sıralı öğelerden oluşan tablolar dizi olur.

$script:LuaTokenRx = New-Object regex '(?s)--\[(=*)\[.*?\]\1\]|--[^\n]*|\[(=*)\[(.*?)\]\2\]|"((?:\\.|[^"\\])*)"|''((?:\\.|[^''\\])*)''|0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+|[A-Za-z_][A-Za-z0-9_]*|\.\.\.|\.\.|==|~=|<=|>=|\S'

function Unescape-Lua([string]$s) {
  $s -replace '\\r', '' -replace '\\n', "`n" -replace '\\t', "`t" -replace '\\"', '"' -replace "\\'", "'" -replace '\\\\', '\'
}

function ConvertFrom-Lua([string]$text) {
  $tokens = New-Object System.Collections.Generic.List[object]
  foreach ($m in $script:LuaTokenRx.Matches($text)) {
    $v = $m.Value
    if ($v.StartsWith('--')) { continue }
    if ($m.Groups[3].Success) { $tokens.Add(@{ t = 's'; v = ($m.Groups[3].Value -replace '^\r?\n', '') }); continue }
    if ($m.Groups[4].Success) { $tokens.Add(@{ t = 's'; v = (Unescape-Lua $m.Groups[4].Value) }); continue }
    if ($m.Groups[5].Success) { $tokens.Add(@{ t = 's'; v = (Unescape-Lua $m.Groups[5].Value) }); continue }
    if ($v -cmatch '^(0[xX][0-9a-fA-F]+|\d|\.\d)') {
      $n = if ($v -cmatch '^0[xX]') { [Convert]::ToInt64($v.Substring(2), 16) } else { [double]::Parse($v, [Globalization.CultureInfo]::InvariantCulture) }
      $tokens.Add(@{ t = 'n'; v = $n }); continue
    }
    if ($v -cmatch '^[A-Za-z_]') { $tokens.Add(@{ t = 'id'; v = $v }); continue }
    $tokens.Add(@{ t = 'p'; v = $v })
  }
  $script:lt = $tokens
  $script:li = 0
  $script:lvars = [ordered]@{}
  $result = $null
  $hasReturn = $false
  while ($script:li -lt $tokens.Count) {
    $tok = $tokens[$script:li]
    if ($tok.t -eq 'id' -and $tok.v -eq 'function') { break }
    if ($tok.t -eq 'id' -and $tok.v -eq 'return') {
      $script:li++
      $result = Lua-Expr
      $hasReturn = $true
      break
    }
    if ($tok.t -eq 'id' -and $tok.v -eq 'local') {
      $script:li++
      if ($tokens[$script:li].v -eq 'function') { break }
      $name = $tokens[$script:li].v; $script:li++
      if ($tokens[$script:li].v -eq '=') { $script:li++; $script:lvars[$name] = Lua-Expr } else { $script:lvars[$name] = $null }
      continue
    }
    if ($tok.t -eq 'id') {
      # t[k] = v / t.k = v / x = v
      $target = $tok.v; $script:li++
      $path = @()
      while ($script:li -lt $tokens.Count -and ($tokens[$script:li].v -eq '[' -or $tokens[$script:li].v -eq '.')) {
        if ($tokens[$script:li].v -eq '[') { $script:li++; $path += , (Lua-Expr); $script:li++ }
        else { $script:li++; $path += , $tokens[$script:li].v; $script:li++ }
      }
      if ($tokens[$script:li].v -ne '=') { $script:li++; continue }
      $script:li++
      $value = Lua-Expr
      if (-not $path.Count) { $script:lvars[$target] = $value; continue }
      # Boş "{}" dizi olarak okunur; içine anahtarla değer yazılınca sözlüğe çevrilir.
      if ($script:lvars[$target] -isnot [System.Collections.IDictionary]) { $script:lvars[$target] = [ordered]@{} }
      $holder = $script:lvars[$target]
      for ($k = 0; $k -lt $path.Count - 1; $k++) {
        if ($holder["$($path[$k])"] -isnot [System.Collections.IDictionary]) { $holder["$($path[$k])"] = [ordered]@{} }
        $holder = $holder["$($path[$k])"]
      }
      $holder["$($path[-1])"] = $value
      continue
    }
    $script:li++
  }
  if ($hasReturn -and $result -isnot [string]) { return , $result }
  return , $script:lvars
}

function Lua-Expr {
  $v = Lua-Value
  while ($script:li -lt $script:lt.Count -and $script:lt[$script:li].v -eq '..') {
    $script:li++
    $v = "$v$(Lua-Value)"
  }
  return , $v
}

function Lua-Value {
  $tok = $script:lt[$script:li]; $script:li++
  switch ($tok.t) {
    's' { return $tok.v }
    'n' { return $tok.v }
    'p' {
      if ($tok.v -eq '{') { return , (Lua-Table) }
      if ($tok.v -eq '-') { return - (Lua-Value) }
      if ($tok.v -eq '(') { $v = Lua-Expr; $script:li++; return , $v }
      return $null
    }
    'id' {
      if ($tok.v -eq 'true') { return $true }
      if ($tok.v -eq 'false') { return $false }
      if ($tok.v -eq 'nil') { return $null }
      # Değişken adı: tanımlıysa değeri, değilse adın kendisi (ör. Category = { Masterless })
      $v = if ($script:lvars.Contains($tok.v)) { $script:lvars[$tok.v] } else { $tok.v }
      while ($script:li -lt $script:lt.Count -and $script:lt[$script:li].v -eq '.') { $script:li += 2 }
      return , $v
    }
  }
}

function Lua-Table {
  $named = [ordered]@{}
  $list = New-Object System.Collections.ArrayList
  while ($script:lt[$script:li].v -ne '}') {
    $tok = $script:lt[$script:li]
    if ($tok.v -eq ',' -or $tok.v -eq ';') { $script:li++; continue }
    if ($tok.v -eq '[') {
      $script:li++
      $key = Lua-Expr
      $script:li += 2  # ] =
      $named["$key"] = Lua-Expr
    } elseif ($tok.t -eq 'id' -and $script:lt[$script:li + 1].v -eq '=') {
      $script:li += 2
      $named[$tok.v] = Lua-Expr
    } else {
      [void]$list.Add((Lua-Expr))
    }
  }
  $script:li++
  if ($named.Count -eq 0) { return , @($list) }
  for ($i = 0; $i -lt $list.Count; $i++) { $named["$($i + 1)"] = $list[$i] }
  return , $named
}
