// Rainbow Six Siege bölüm seçimi.
const portraits = ["ash", "thermite", "mute"].map((id) => findOperator(id)?.image).filter(Boolean).map((u) => thumb(u, 400));
const sections = [
  {
    href: "operatorler.html",
    title: "Operatörler",
    badge: "Yetenekler · Ekipman · Videolar",
    text: `${R6.operators.length} operatör: özel yetenekleri, silahları ve tanıtım videoları.`,
    art: el("div", { class: "val-art r6-art", "aria-hidden": "true" }, portraits.map((src) => el("img", { src, alt: "" }))),
  },
  {
    href: "silahlar.html",
    title: "Silahlar",
    badge: "Hasar · Atış hızı · Şarjör",
    text: `${R6.weapons.length} silah ve onları kullanan operatörler.`,
    art: el("div", { class: "dd-collage r6-collage", "aria-hidden": "true" }, ["r4c", "mp5", "m590a1"].map((id) => findWeapon(id)?.image).filter(Boolean).map((u) => thumb(u, 320)).map((src) => el("img", { src, alt: "" }))),
  },
  {
    href: "haritalar.html",
    title: "Haritalar",
    badge: "Kat planları · Bomba yerleri",
    text: `${R6.maps.length} harita: kat kat planlar ve hedef odalar.`,
    art: R6.maps.find((m) => m.id === "clubhouse")?.image ? el("img", { class: "card-img", src: thumb(R6.maps.find((m) => m.id === "clubhouse").image, 800), alt: "" }) : null,
  },
];

document.getElementById("cards").replaceChildren(
  ...sections.map((s) => el("a", { class: "game-card", href: s.href }, s.art, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text)))
);
