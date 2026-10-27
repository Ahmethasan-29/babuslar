# Hâlâ yama alan oyunların verisini wikilerden yeniden çeker (.github/workflows/oyun-verileri.yml her hafta çalıştırır).
# Bir oyunun betiği hata verirse ya da veri dosyası belirgin şekilde küçülürse (wiki engeli, yarım sayfa…)
# o oyunun dosyaları eski hâline döndürülür; böylece bozuk veri siteye çıkmaz.
param([string[]]$Only)

$games = @(
  @{ name = "Dead by Daylight"; script = "dbd-data.ps1"; dir = "dbd"; const = "DBD" }
  @{ name = "Rainbow Six Siege"; script = "r6-data.ps1"; dir = "r6"; const = "R6" }
  @{ name = "Battlefield 6"; script = "bf-data.ps1"; args = @{ Game = "BF6" }; dir = "bf6"; const = "BF" }
  @{ name = "Project Zomboid"; script = "pz-data.ps1"; dir = "pz"; const = "PZ" }
  @{ name = "Sea of Thieves"; script = "sot-data.ps1"; dir = "sot"; const = "SOT" }
  @{ name = "Brotato"; script = "brotato-data.ps1"; dir = "brotato"; const = "BRO" }
  @{ name = "Bannerlord"; script = "bannerlord-data.ps1"; dir = "mb/bannerlord"; const = "BL" }
  @{ name = "Darkest Dungeon II"; script = "dd2-data.ps1"; dir = "dd/2"; const = "DKD2" }
  @{ name = "Company of Heroes 3"; script = "coh3-data.ps1"; dir = "coh3"; const = "COH" }
  @{ name = "Age of Empires II"; script = "aoe2-data.ps1"; dir = "aoe2"; const = "AOE2" }
  @{ name = "Age of Empires IV"; script = "aoe4-data.ps1"; dir = "aoe4"; const = "AOE4" }
  @{ name = "Risk of Rain 2"; script = "ror2-data.ps1"; dir = "ror2"; const = "REHBER" }
  @{ name = "Risk of Rain Returns"; script = "ror-classic-data.ps1"; args = @{ Game = "RORR" }; dir = "rorr"; const = "REHBER" }
  @{ name = "Bloons TD Battles 2"; script = "btd-classic-data.ps1"; args = @{ Game = "BTDB2" }; dir = "btdb2"; const = "REHBER" }
  @{ name = "Bloons TD 6"; script = "btd6-data.ps1"; dir = "btd6"; const = "REHBER" }
  @{ name = "Megabonk"; script = "megabonk-data.ps1"; dir = "megabonk"; const = "REHBER" }
  @{ name = "Euro Truck Simulator 2"; script = "ets2-data.ps1"; dir = "ets2"; const = "REHBER" }
  @{ name = "World of Tanks"; script = "wot-data.ps1"; dir = "wot"; const = "REHBER" }
  @{ name = "Total War: Warhammer III"; script = "tww3-data.ps1"; dir = "tww3"; const = "REHBER" }
  @{ name = "Ana sayfa arka plan videoları"; script = "arkaplan-data.ps1"; dir = "assets/arkaplan"; const = "ARKAPLAN" }
)
if ($Only) { $games = @($games | Where-Object { $Only -contains $_.dir }) }

# Git satır sonu uyarılarını stderr'e yazar; Actions'taki PowerShell bunu hata sayıp durur. Uyarılar kapatılır.
function Invoke-Git { $ErrorActionPreference = "Continue"; & git -c core.safecrlf=false @args 2>$null }
function Invoke-Node { $ErrorActionPreference = "Continue"; & node @args 2>&1 | ForEach-Object { Write-Host $_ } }

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
  # Panelden yapılan düzeltmeler (duzeltmeler.json) yeni veriye yeniden uygulanır.
  if (-not $err -and (Test-Path "$($g.dir)/duzeltmeler.json")) {
    Invoke-Node scripts/duzeltmeler.mjs $file $g.const
    if ($LASTEXITCODE) { $err = "panel düzeltmeleri uygulanamadı" }
  }
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
