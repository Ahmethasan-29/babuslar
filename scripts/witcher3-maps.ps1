# The Witcher 3 bölge haritalarını witcher3map projesinin harita karolarından (github.com/witcher3map/witcher3map-maps,
# CC BY-NC-SA; harita görüntüleri CD PROJEKT RED'e aittir) birleştirip witcher3/maps/<bölge>.jpg olarak kaydeder.
# Karolar TMS düzenindedir (y = 0 en alttaki satır). Yakınlaştırma düzeyi 4 kullanılır.
# Kullanım: powershell -File scripts/witcher3-maps.ps1
param([string]$OutDir = "witcher3/maps", [int]$Zoom = 4, [int]$Quality = 78)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$BASE = "https://raw.githubusercontent.com/witcher3map/witcher3map-maps/master"
$CACHE = Join-Path ([IO.Path]::GetTempPath()) "babuslar-w3-tiles"
New-Item -ItemType Directory -Force $CACHE, (Join-Path (Get-Location) $OutDir) | Out-Null

# Bölge → karo sütun ve satır sayısı (yakınlaştırma 4'te).
$MAPS = [ordered]@{ white_orchard = @(10, 8); velen = @(14, 16); skellige = @(15, 15); kaer_morhen = @(8, 10); toussaint = @(9, 9) }

foreach ($name in $MAPS.Keys) {
  $cols, $rows = $MAPS[$name]
  Write-Host "$name ($cols×$rows karo)…"
  $bmp = New-Object Drawing.Bitmap ($cols * 256), ($rows * 256)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.Clear([Drawing.Color]::FromArgb(255, 28, 24, 20))
  for ($x = 0; $x -lt $cols; $x++) {
    for ($y = 0; $y -lt $rows; $y++) {
      $file = Join-Path $CACHE "$name-$Zoom-$x-$y.png"
      if (-not (Test-Path $file)) {
        & curl.exe -s -f -m 60 -o $file "$BASE/$name/$Zoom/$x/$y.png"
        if ($LASTEXITCODE -ne 0) { Remove-Item $file -ErrorAction SilentlyContinue; continue }
      }
      $tile = [Drawing.Image]::FromFile($file)
      # TMS: y = 0 en alt satır, resimde en altta durur.
      $g.DrawImage($tile, $x * 256, ($rows - 1 - $y) * 256, 256, 256)
      $tile.Dispose()
    }
  }
  $g.Dispose()
  $codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), ([long]$Quality)
  $out = Join-Path (Join-Path (Get-Location) $OutDir) "$name.jpg"
  $bmp.Save($out, $codec, $params)
  # Kartlarda kullanılan 800 piksellik küçük önizleme.
  $h = [int]($bmp.Height * 800 / $bmp.Width)
  $small = New-Object Drawing.Bitmap 800, $h
  $sg = [Drawing.Graphics]::FromImage($small)
  $sg.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $sg.DrawImage($bmp, 0, 0, 800, $h)
  $sg.Dispose()
  $small.Save((Join-Path (Join-Path (Get-Location) $OutDir) "$name-small.jpg"), $codec, $params)
  $small.Dispose()
  $bmp.Dispose()
  Write-Host ("  {0} KB" -f [Math]::Round((Get-Item $out).Length / 1KB))
}
