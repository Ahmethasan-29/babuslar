# Babuşlar

Oyunlardaki karakterlerin, yeteneklerin ve eşyaların ne işe yaradığını anlatan Türkçe rehber sitesi.

## Oyunlar

- **League of Legends:** şampiyonlar, pasif ve Q/W/E/R yetenekleri, eşyalar.
  Veriler Riot Games'in Data Dragon servisinden Türkçe olarak çekilir; oyuna yama geldiğinde site kendiliğinden güncellenir.

## Klasör yapısı

```
index.html          Ana sayfa (oyun kartları)
assets/style.css    Ortak tasarım (koyu, pembe tema)
assets/common.js    Ortak yardımcılar (Data Dragon, metin temizleme)
lol/index.html      Şampiyon listesi
lol/sampiyon.html   Şampiyon ayrıntısı (pasif, Q/W/E/R)
lol/esyalar.html    Eşya listesi
```

- **Counter-Strike 2:** Mirage, Dust 2 ve Inferno için radar üzerinde infolar (callout'lar) ve A/B bomba taktikleri
  (smoke, molotof, flash, giriş yolları, bomba yeri). Veriler `cs2/maps.js` dosyasındadır; konumlar radarın 0–1 oranıdır.
  Radar görüntüleri oyun dosyalarından çıkarılmıştır ([2mlml/cs2-radar-images](https://github.com/2mlml/cs2-radar-images)) ve Valve Corporation'a aittir.

## Maç istatistikleri

Rün ve eşya dizilimleri, Riot API'den toplanan gerçek maçlardan hesaplanır:

- `.github/workflows/lol-istatistik.yml` her gece çalışır; Türkiye ve Batı Avrupa sunucularındaki
  Usta ve üstü oyuncuların dereceli maçlarını toplar (`scripts/collect.mjs`).
- Her şampiyon / koridor / temel rün için en sık rün sayfası, büyüler, başlangıç eşyaları ve
  gerçek satın alma sırasına göre 6 eşya, maç sayısı ve kazanma oranıyla hesaplanır (`scripts/aggregate.mjs`).
- Sonuç `istatistik` dalına yazılır (`stats.json`); site bu dosyayı okur. Yeterli veri olmayan
  koridorlarda Riot'un oyun içi önerisi gösterilir.

Kurulum: https://developer.riotgames.com adresinden alınan **Personal API Key**, depo ayarlarında
*Settings → Secrets and variables → Actions* altına `RIOT_API_KEY` adıyla eklenir.
Görev, *Actions → LoL maç istatistikleri → Run workflow* ile elle de başlatılabilir.

## Yerelde çalıştırma

Site sade HTML, CSS ve JavaScript'ten oluşur, kurulum gerektirmez.
Klasörü herhangi bir statik sunucuyla açmak yeterlidir.
Yerelde (`localhost`) site, istatistikleri depo kökündeki `stats.local.json` dosyasından okur (git'e eklenmez).

## Yeni oyun ekleme

1. Oyun için `oyun-adi/` adında bir klasör aç.
2. Ana sayfadaki (`index.html`) "Oyunlar" listesine yeni bir kart ekle.

---

Babuşlar, Riot Games tarafından onaylanmamıştır ve Riot Games'in ya da League of Legends'ın
yapımında veya yönetiminde resmi olarak yer alan kişilerin görüşlerini yansıtmaz.
League of Legends ve Riot Games, Riot Games, Inc.'in ticari markaları veya tescilli ticari markalarıdır.
