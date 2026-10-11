// Battlefield oyun sayfası: silahlar ve haritalar kartları.
const pick = (list) => list.find((x) => x.image)?.image;
document.getElementById("cards").replaceChildren(
  ...[
    {
      href: "silahlar.html",
      title: L("Silahlar", "Weapons"),
      badge: L("Sınıflar · Hasar · Atış hızı", "Classes · Damage · Fire rate"),
      text: L(`${BF.weapons.filter((w) => !HIDDEN_GROUP.test(w.group)).length} silah: sınıfı, hasarı, atış hızı, şarjörü ve nasıl açıldığı.`, `${BF.weapons.filter((w) => !HIDDEN_GROUP.test(w.group)).length} weapons: class, damage, fire rate, magazine and unlock.`),
      img: pick(BF.weapons),
    },
    {
      href: "haritalar.html",
      title: L("Haritalar", "Maps"),
      badge: L("Modlar · Yer · Tarih", "Modes · Place · Date"),
      text: L(`${BF.maps.length} harita: hangi modlarda oynandığı, nerede geçtiği, ana oyun mu DLC mi olduğu.`, `${BF.maps.length} maps: modes, setting and whether they're base game or DLC.`),
      img: pick(BF.maps),
    },
  ].map((s) => el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img", src: thumb(s.img, 600), alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text)))
);
