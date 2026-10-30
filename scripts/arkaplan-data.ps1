# Ana sayfanın arka planında oynayan kesitler: her oyunun Steam'deki resmi fragmanından birkaç saniye.
# Steam fragmanları HLS olarak verir (CORS açık); sesi olmayan 480p video akışı kullanılır, tarayıcıda hls.js oynatır.
# Çıktı: assets/arkaplan/data.js (const ARKAPLAN). Fragman adresleri zamanla değiştiği için haftalık güncellemede de çalışır.
#   powershell -File scripts/arkaplan-data.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

# [klasör, Steam uygulama no, adı]. Steam'de olmayanlar (LoL, BF2, BTD4) aşağıda.
$GAMES = @(
  @("cs2", 730, "Counter-Strike 2"),
  @("dbd", 381210, "Dead by Daylight"),
  @("dd/1", 262060, "Darkest Dungeon"),
  @("dd/2", 1940340, "Darkest Dungeon II"),
  @("r6", 359550, "Rainbow Six Siege"),
  @("mb/bannerlord", 261550, "Mount & Blade II: Bannerlord"),
  @("mb/warband", 48700, "Mount & Blade: Warband"),
  @("witcher3", 292030, "The Witcher 3"),
  @("cp2077", 1091500, "Cyberpunk 2077"),
  @("pz", 108600, "Project Zomboid"),
  @("sot", 1172620, "Sea of Thieves"),
  @("brotato", 1942280, "Brotato"),
  @("bf1", 1238840, "Battlefield 1"),
  @("bf3", 1238820, "Battlefield 3"),
  @("bf4", 1238860, "Battlefield 4"),
  @("bfv", 1238810, "Battlefield V"),
  @("bf6", 2807960, "Battlefield 6"),
  @("coh1", 228200, "Company of Heroes"),
  @("coh2", 231430, "Company of Heroes 2"),
  @("coh3", 1677280, "Company of Heroes 3"),
  @("eldenring", 1245620, "Elden Ring"),
  @("aoe1", 1017900, "Age of Empires"),
  @("aoe2", 813780, "Age of Empires II"),
  @("aoe3", 933110, "Age of Empires III"),
  @("aoe4", 1466860, "Age of Empires IV"),
  @("aom", 1934680, "Age of Mythology"),
  @("ror1", 248820, "Risk of Rain"),
  @("rorr", 1337520, "Risk of Rain Returns"),
  @("ror2", 632360, "Risk of Rain 2"),
  @("btd5", 306020, "Bloons TD 5"),
  @("btdb2", 1276390, "Bloons TD Battles 2"),
  @("btd6", 960090, "Bloons TD 6"),
  @("megabonk", 3405340, "Megabonk"),
  @("ets2", 227300, "Euro Truck Simulator 2"),
  @("wot", 1407200, "World of Tanks"),
  @("tww3", 1142710, "Total War: Warhammer III")
)

# Steam'de olmayan oyunlar: yayıncının kendi sitesindeki resmi tanıtım videosu (YouTube kullanılmaz). [klasör, adres, adı, başlangıç sn]
# LoL: leagueoflegends.com ana sayfasındaki oyun tanıtım videosu ("A free-for-all war for supremacy"). BF2 ve BTD4'ün
# YouTube dışında resmi videosu yok, onlar arka planda yer almıyor.
$FILES = @(
  ,@("lol", "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/1f5b2cf01a1cf2afa1ce61febee6e2e900808347.mp4", "League of Legends", 0)
)
$clips = @()
foreach ($g in $GAMES) {
  $dir, $app, $name = $g
  $json = curl.exe -s "https://store.steampowered.com/api/appdetails?appids=$app&filters=basic,movies&l=english" | ConvertFrom-Json
  $data = $json."$app".data
  if (-not $data -or -not $data.movies) { Write-Warning "$name ($app): fragman yok"; continue }
  Write-Host ("{0,-30} -> {1}" -f $name, $data.name)

  # Öne çıkan ilk fragman; logo/yazı bölümlerine denk gelmesin diye ortasından başlanır.
  $movie = @($data.movies | Where-Object { $_.highlight }) + @($data.movies) | Where-Object { $_.hls_h264 } | Select-Object -First 1
  if (-not $movie) { Write-Warning "$name ($app): HLS fragman yok"; continue }
  $base = $movie.hls_h264 -replace '[^/]+$', ''
  $master = curl.exe -s $movie.hls_h264
  # 854x480 akışı; yoksa en küçükten bir büyüğü.
  $variants = @()
  for ($i = 0; $i -lt $master.Count; $i++) {
    if ($master[$i] -cmatch 'RESOLUTION=(\d+)x(\d+)') { $variants += [pscustomobject]@{ h = [int]$Matches[2]; uri = $master[$i + 1] } }
  }
  $variant = $variants | Where-Object { $_.h -le 480 } | Sort-Object h -Descending | Select-Object -First 1
  if (-not $variant) { $variant = $variants | Sort-Object h | Select-Object -First 1 }
  $playlist = curl.exe -s ($base + $variant.uri)
  $duration = ($playlist | Where-Object { $_ -cmatch '^#EXTINF:([\d.]+)' } | ForEach-Object { [double]($_ -replace '^#EXTINF:([\d.]+).*', '$1') } | Measure-Object -Sum).Sum
  if ($duration -lt 20) { Write-Warning "$name ($app): fragman çok kısa ($duration sn)"; continue }

  $clips += [ordered]@{
    game = $name
    href = "$dir/"
    src = $base + $variant.uri
    poster = ($movie.thumbnail -replace '\?.*$', '')
    start = [math]::Round($duration * 0.35)
  }
}

foreach ($f in $FILES) {
  $dir, $url, $name, $start = $f
  if ((curl.exe -s -o NUL -w "%{http_code}" -r 0-0 $url) -notmatch '^20') { Write-Warning "$name videosu açılmıyor: $url"; continue }
  $clips += [ordered]@{ game = $name; href = "$dir/"; file = $url; start = $start }
}
$out = "// scripts/arkaplan-data.ps1 tarafından üretildi: Steam'deki resmi fragmanlardan kesitler.`nconst ARKAPLAN = " + (ConvertTo-Json @($clips) -Depth 4) + ";`n"
[IO.File]::WriteAllText((Join-Path $root "assets/arkaplan/data.js"), $out, (New-Object Text.UTF8Encoding $false))
Write-Host "$($clips.Count) kesit yazıldı."
