// DBD seçim ekranı: Katiller, Survivor'lar, Haritalar. Kart görselleri veriden seçilir.
const pick = (list, name) => list.find((x) => x.name === name && x.portrait) || list.find((x) => x.portrait);
const firstMap = DBD.maps.find((m) => m.layouts.length && m.image);

const sections = [
  { href: "karakterler.html?rol=katil", title: "Katiller", badge: "Güçler · Perkler", text: `${DBD.killers.length} katil: güçleri ve perkleri.`, img: pick(DBD.killers, "The Trapper")?.portrait },
  { href: "karakterler.html?rol=survivor", title: "Survivor'lar", badge: "Perkler", text: `${DBD.survivors.length} survivor ve perkleri.`, img: pick(DBD.survivors, "Dwight Fairfield")?.portrait },
  { href: "haritalar.html", title: "Haritalar", badge: "Üstten şemalar", text: `${DBD.maps.length} harita ve üstten şemaları.`, img: firstMap?.image },
];

document.getElementById("sections").replaceChildren(
  ...sections.map((s) =>
    el(
      "a",
      { class: "game-card", href: s.href },
      s.img ? el("img", { class: "card-img dbd-card-img", src: s.img, alt: "" }) : null,
      el("span", { class: "badge" }, s.badge),
      el("h2", {}, s.title),
      el("p", {}, s.text)
    )
  )
);
