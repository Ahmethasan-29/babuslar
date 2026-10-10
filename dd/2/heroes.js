const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

function render() {
  const query = normalize(search.value.trim());
  const list = DKD2.heroes.filter(
    (h) => !query || normalize(h.name).includes(query) || h.skills.some((s) => normalize(s.name).includes(query)) || h.paths.some((p) => normalize(p.name).includes(query))
  );
  count.textContent = `${list.length} kahraman`;
  if (!list.length) {
    showNotice(grid, "Aramana uyan kahraman bulunamadı.");
    return;
  }
  grid.replaceChildren(
    ...list.map((h) =>
      el(
        "a",
        { class: "tile dd-hero-tile", href: `kahraman.html?id=${encodeURIComponent(h.id)}` },
        ddImg(h.image, "", 96, "dd-portrait-sm"),
        el("span", { class: "tile-name" }, h.name),
        el("span", { class: "tile-sub" }, h.paths.filter((p) => p.name !== "Wanderer").map((p) => p.name).join(" · "))
      )
    )
  );
}

search.addEventListener("input", render);
render();
