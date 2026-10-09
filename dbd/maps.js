// Haritalar diyarlarına (realm) göre gruplanır.
const realms = new Map();
for (const m of DBD.maps) {
  if (!realms.has(m.realm)) realms.set(m.realm, []);
  realms.get(m.realm).push(m);
}

document.getElementById("maps").replaceChildren(
  ...[...realms].map(([realm, maps]) =>
    el(
      "section",
      { class: "section" },
      el("h2", {}, realm),
      el(
        "div",
        { class: "games" },
        maps.map((m) =>
          el(
            "a",
            { class: "game-card", href: `harita.html?id=${encodeURIComponent(m.id)}` },
            m.image ? el("img", { class: "card-img", src: m.image, alt: "", loading: "lazy" }) : null,
            el("span", { class: "badge" }, !m.layouts.length ? "Şema yok" : m.layoutKind === "outline" ? "Harita planı" : "Üstten şema"),
            el("h2", {}, m.name)
          )
        )
      )
    )
  )
);
