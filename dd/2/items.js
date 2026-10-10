// Savaş eşyaları türlerine göre (wikideki başlıklar): No Tags, Flammable, Powder, Restorative…
const groups = [...new Set(DKD2.items.map((i) => i.group))];

document.getElementById("list").replaceChildren(
  ...groups.map((g) =>
    el(
      "section",
      { class: "section" },
      el("h2", {}, g === "No Tags" ? "Etiketsiz" : g),
      el("div", { class: "dd-trinkets" }, DKD2.items.filter((i) => i.group === g).map((i) => itemCard2(i)))
    )
  )
);
