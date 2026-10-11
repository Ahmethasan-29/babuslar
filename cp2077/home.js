// Cyberpunk 2077 bölüm seçimi.
const iconics = CP.weapons.filter((w) => w.iconic);
const sections = [
  {
    href: "harita.html",
    title: L("Night City haritası", "Night City map"),
    badge: L("Önemli yerler · İkonik silahlar", "Landmarks · Iconic weapons"),
    text: L(
      `${CP.map.places.length} önemli yer ve haritada yeri belli ${iconics.filter((w) => w.at).length} ikonik silah. Silaha tıklayınca nerede ve nasıl alındığını gösteren kısa video açılır.`,
      `${CP.map.places.length} landmarks and ${iconics.filter((w) => w.at).length} iconic weapons with a spot on the map. Click a weapon for a short video showing where and how to get it.`
    ),
    img: "https://static.wikia.nocookie.net/cyberpunk/images/4/42/Night_City_Map_2076_CEMK.jpg/revision/latest/scale-to-width-down/800",
  },
  {
    href: "silahlar.html",
    title: L("Silahlar", "Weapons"),
    badge: L("İkonikler · Türler · Değerler", "Iconics · Types · Stats"),
    text: L(
      `${CP.weapons.length} silah, ${iconics.length} tanesi ikonik: özel etkileri, nasıl alındıkları ve ${iconics.filter((w) => w.yt).length} tanesi için kısa video.`,
      `${CP.weapons.length} weapons, ${iconics.length} of them iconic: their special effects, how to get them and short videos for ${iconics.filter((w) => w.yt).length}.`
    ),
    img: iconics.find((w) => w.id === "malorian-arms-3516")?.image?.replace(/\/revision\/latest.*$/, "/revision/latest/scale-to-width-down/600"),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
  )
);
