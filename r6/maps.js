const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

function render() {
  const query = normalize(search.value.trim());
  const items = R6.maps.filter((m) => !query || normalize(m.name).includes(query) || normalize(m.place).includes(query) || m.bomb.some((b) => normalize(b).includes(query)));
  count.textContent = `${items.length} harita`;
  if (!items.length) {
    showNotice(grid, "Aramana uyan harita bulunamadı.");
    return;
  }
  grid.replaceChildren(
    ...items.map((m) =>
      el(
        "a",
        { class: "r6-map-card", href: `harita.html?id=${encodeURIComponent(m.id)}` },
        m.image ? el("img", { src: thumb(m.image, 480), alt: "", loading: "lazy" }) : el("span", { class: "r6-map-noimg" }),
        el(
          "div",
          { class: "r6-map-card-body" },
          el("strong", {}, m.name),
          m.place ? el("span", { class: "tile-sub" }, m.place) : null,
          el("span", { class: "tile-sub" }, [m.floors.length ? `${m.floors.length} kat planı` : "Kat planı yok", m.bomb.length ? `${m.bomb.length} bomba yeri` : null].filter(Boolean).join(" · "))
        )
      )
    )
  );
}

search.addEventListener("input", render);
render();
