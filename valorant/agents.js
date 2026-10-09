const grid = document.getElementById("grid");
const search = document.getElementById("search");
const roles = document.getElementById("roles");
const count = document.getElementById("count");

let agents = [];
let activeRole = "all";

getAgents()
  .then((list) => {
    agents = list;
    const roleNames = [...new Set(agents.map((a) => a.role))].sort((a, b) => a.localeCompare(b, "tr"));
    roles.replaceChildren(
      ...[["all", "Tüm roller"], ...roleNames.map((r) => [r, r])].map(([key, label]) =>
        el(
          "button",
          {
            class: "chip",
            type: "button",
            "data-key": key,
            "aria-pressed": String(key === activeRole),
            onclick: () => {
              activeRole = key;
              for (const chip of roles.children) chip.setAttribute("aria-pressed", String(chip.dataset.key === activeRole));
              render();
            },
          },
          label
        )
      )
    );
    render();
  })
  .catch(() => showNotice(grid, "Ajanlar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile."));

function render() {
  const query = normalize(search.value.trim());
  const list = agents.filter(
    (a) => (activeRole === "all" || a.role === activeRole) && (!query || normalize(a.name).includes(query))
  );

  count.textContent = `${list.length} ajan`;

  if (!list.length) {
    showNotice(grid, "Aramana uyan ajan bulunamadı.");
    return;
  }

  grid.replaceChildren(
    ...list.map((a) =>
      el(
        "a",
        { class: "tile", href: `ajan.html?id=${encodeURIComponent(a.id)}` },
        el("img", { src: a.icon, alt: "", loading: "lazy", width: 72, height: 72 }),
        el("span", { class: "tile-name" }, a.name),
        el("span", { class: "tile-sub" }, a.role)
      )
    )
  );
}

search.addEventListener("input", render);
