// Bosslar kartlar halinde; kartta bölgesi ve canı yazar.
document.getElementById("list").replaceChildren(
  ...DKD2.bosses.map((b) =>
    el(
      "a",
      { class: "game-card dd-boss-card", href: `boss.html?id=${encodeURIComponent(b.id)}` },
      b.image ? el("img", { class: "card-img dd-card-img", src: b.image, alt: "", loading: "lazy" }) : null,
      b.region ? el("span", { class: "badge" }, b.region) : null,
      el("h2", {}, b.name),
      b.variants.length ? el("p", {}, `Can: ${b.variants.map((v) => v.hp).join(" / ")}`) : null
    )
  )
);
