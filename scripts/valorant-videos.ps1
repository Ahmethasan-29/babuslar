# Valorant yetenek videolarının adreslerini Riot'un resmi ajan sayfalarından toplar ve valorant/videos.js dosyasını yazar.
param([string]$Out)
$ErrorActionPreference = "Stop"
# "Q - TRAILBLAZER" → "TRAILBLAZER", "COVE (COVE SMOKE)" → "COVE", "ASTRAL FORM / COSMIC DIVIDE" → "ASTRAL FORM"
function Key([string]$t) {
  $t = $t.ToUpperInvariant() -replace '^[QECX]\s*-\s*', '' -replace '\s*\(.*\)', ''
  ($t -split '/')[0].Trim()
}
$agents = (Invoke-RestMethod "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US").data | Sort-Object displayName
$result = [ordered]@{}
foreach ($a in $agents) {
  $slug = ($a.displayName.ToLowerInvariant() -replace '/', '-' -replace '[^a-z0-9-]', '')
  $html = $null
  foreach ($try in 1..5) {
    try { $html = (Invoke-WebRequest -UseBasicParsing -UserAgent "Mozilla/5.0" "https://playvalorant.com/en-us/agents/$slug/").Content; break } catch { Write-Host "  $slug deneme $try : $($_.Exception.Message)"; Start-Sleep 5 }
  }
  if (-not $html) { Write-Host "MISS page $($a.displayName)"; continue }
  $rx = '"sources":\[\{"src":"(https://[^"?]+\.mp4)[^"]*","type":"video/mp4"\}\]\},"title":"([^"]+)"'
  $found = @{}
  foreach ($m in [regex]::Matches($html, $rx)) { $k = Key $m.Groups[2].Value; if (-not $found.ContainsKey($k)) { $found[$k] = $m.Groups[1].Value } }
  $videos = [ordered]@{}
  foreach ($ab in ($a.abilities | Where-Object { $_.slot -ne 'Passive' })) {
    $k = Key $ab.displayName
    if ($found.ContainsKey($k)) { $videos[$ab.displayName] = $found[$k] } else { Write-Host "EKSIK $($a.displayName) / $($ab.displayName)" }
  }
  $result[$a.displayName] = $videos
}
$json = $result | ConvertTo-Json -Depth 4
$header = "// Yetenek videoları: Riot'un resmi ajan sayfalarından (playvalorant.com) alınan adresler.`n// Ajan adı → { yetenek adı (İngilizce): video adresi }. Yeni ajan çıkınca: powershell -File scripts/valorant-videos.ps1 -Out valorant/videos.js`n"
Set-Content -Encoding utf8 $Out ($header + "const ABILITY_VIDEOS = " + $json + ";`n")
