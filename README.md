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

## Yerelde çalıştırma

Site sade HTML, CSS ve JavaScript'ten oluşur, kurulum gerektirmez.
Klasörü herhangi bir statik sunucuyla açmak yeterlidir.

## Yeni oyun ekleme

1. Oyun için `oyun-adi/` adında bir klasör aç.
2. Ana sayfadaki (`index.html`) "Oyunlar" listesine yeni bir kart ekle.

---

Babuşlar, Riot Games tarafından onaylanmamıştır ve Riot Games'in ya da League of Legends'ın
yapımında veya yönetiminde resmi olarak yer alan kişilerin görüşlerini yansıtmaz.
League of Legends ve Riot Games, Riot Games, Inc.'in ticari markaları veya tescilli ticari markalarıdır.
