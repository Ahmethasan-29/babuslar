// Eşyalar: erzak (zindana götürülenler) ve miras eşyaları (Hamlet'i geliştirmek için).
const GROUPS = [
  ["supply", "Erzak", "Zindana girmeden önce alınan ve yolda kullanılan eşyalar."],
  ["heirloom", "Miras eşyaları", "Zindanlardan toplanan, Hamlet'teki binaları geliştirmek için harcanan eşyalar."],
];

document.getElementById("list").replaceChildren(
  ...GROUPS.map(([kind, title, text]) => {
    const items = DKD.items.filter((i) => i.kind === kind);
    if (!items.length) return null;
    return el(
      "section",
      { class: "section" },
      el("h2", {}, title),
      el("p", { class: "page-sub" }, text),
      el("div", { class: "dd-items" }, items.map(itemCard))
    );
  }).filter(Boolean)
);

function itemCard(i) {
  const description = ddText("items", i.name, "description", i.description || (i.intro || "").split("\n")[0]);
  const effect = ddText("items", i.name, "effect", i.effect);
  // Wikide fiyatı olmayan eşyalarda "0" ya da "none" yazar; yalnızca gerçek fiyat gösterilir.
  const cost = /^[1-9]\d*$/.test(i.cost || "") ? i.cost : null;
  return el(
    "article",
    { class: "ability dd-item" },
    ddImg(i.image, "", 56, "dd-item-img"),
    el(
      "div",
      {},
      el("h3", {}, i.name),
      cost || i.stack
        ? el("div", { class: "meta" }, cost ? el("span", {}, "Fiyat: ", el("b", { class: "gold" }, `${cost} altın`)) : null, i.stack ? el("span", {}, "Yığın: ", el("b", {}, i.stack)) : null)
        : null,
      effect ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Etki: "), ddRich(effect)) : null,
      description ? el("div", { class: "dd-effect" }, ddRich(description)) : null,
      // Hangi curio'larda kullanıldığı (wikiden, İngilizce adlarla).
      i.uses && i.uses.length
        ? el(
            "details",
            { class: "dd-uses" },
            el("summary", {}, `Kullanıldığı yerler (${i.uses.length})`),
            el("ul", {}, i.uses.map((u) => el("li", { class: u.sub ? "sub" : "" }, ddRich(u.text))))
          )
        : null
    )
  );
}
