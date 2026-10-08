# Kendi atış videolarımız (reklamsız)

Bu klasördeki videolar YouTube parçalarının yerine oynar: reklam yok, tam istenen uzunlukta.

## Dosya adı

`harita-bölge-atış.mp4`, örneğin `dust2-a-ct-smoke.mp4`, `mirage-b-apps-flash.mp4`.

## Siteye bağlama

`cs2/maps.js` içinde ilgili atışa `clip` eklenir; `yt` yedek olarak kalabilir:

```js
{ site: "A", type: "smoke", name: "CT smoke", clip: "clips/dust2-a-ct-smoke.mp4", yt: ["Bc0WFG-fU4w", 36, 74], by: "CS Tactics" },
```

## Video ayarları

- 5–15 saniye: nişan alma noktası, atış ve granatın düştüğü yer
- 1280×720, H.264 MP4, sessiz ya da kısık ses
- Dosya başına 1–3 MB (GitHub Pages'ta hızlı açılsın)
