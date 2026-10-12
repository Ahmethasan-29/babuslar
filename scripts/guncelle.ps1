# Hâlâ yama alan oyunların verisini wikilerden yeniden çeker (.github/workflows/oyun-verileri.yml her hafta çalıştırır).
# Bir oyunun betiği hata verirse ya da veri dosyası belirgin şekilde küçülürse (wiki engeli, yarım sayfa…)
# o oyunun dosyaları eski hâline döndürülür; böylece bozuk veri siteye çıkmaz.
param([string[]]$Only)

$games = @(
  @{ name = "Dead by Daylight"; script = "dbd-data.ps1"; dir = "dbd" }
  @{ name = "Rainbow Six Siege"; script = "r6-data.ps1"; dir = "r6" }
  @{ name = "Battlefield 6"; script = "bf-data.ps1"; args = @{ Game = "BF6" }; dir = "bf6" }
  @{ name = "Project Zomboid"; script = "pz-data.ps1"; dir = "pz" }
  @{ name = "Sea of Thieves"; script = "sot-data.ps1"; dir = "sot" }
  @{ name = "Brotato"; script = "brotato-data.ps1"; dir = "brotato" }
  @{ name = "Bannerlord"; script = "bannerlord-data.ps1"; dir = "mb/bannerlord" }
  @{ name = "Darkest Dungeon II"; script = "dd2-data.ps1"; dir = "dd/2" }
)
if ($Only) { $games = @($games | Where-Object { $Only -contains $_.dir }) }

# Git satır sonu uyarılarını stderr'e yazar; Actions'taki PowerShell bunu hata sayıp durur. Uyarılar kapatılır.
function Invoke-Git { $ErrorActionPreference = "Continue"; & git -c core.safecrlf=false @args 2>$null }

$report = @()
foreach ($g in $games) {
  $file = "$($g.dir)/data.js"
  $before = (Get-Item $file).Length
  Write-Host "::group::$($g.name)"
  $err = $null
  try {
    $a = if ($g.args) { $g.args } else { @{} }
    & (Join-Path $PSScriptRoot $g.script) @a
  } catch { $err = $_.Exception.Message }
  Write-Host "::endgroup::"
  $after = if (Test-Path $file) { (Get-Item $file).Length } else { 0 }
  if (-not $err -and $after -lt $before * 0.9) { $err = "veri dosyası küçüldü ($before → $after bayt)" }
  if ($err) {
    Invoke-Git checkout -- $g.dir
    Invoke-Git clean -fdq -- $g.dir
    $report += "- ❌ $($g.name): $err — eski veri korundu"
    Write-Host "::warning::$($g.name): $err"
  } else {
    # Yalnızca satır sonu farkı olan dosyalar git add sonrası değişmiş sayılmaz.
    Invoke-Git add -- $g.dir
    $changed = Invoke-Git diff --cached --name-only -- $g.dir
    $report += $(if ($changed) { "- ✅ $($g.name): güncellendi" } else { "- ➖ $($g.name): değişiklik yok" })
  }
}
$report -join "`n" | Tee-Object -FilePath (Join-Path $env:TEMP "oyun-verileri-rapor.md")
