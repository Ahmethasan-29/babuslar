const grid = document.getElementById("grid");
const search = document.getElementById("search");
const roles = document.getElementById("roles");
const count = document.getElementById("count");
const patch = document.getElementById("patch");

let champions = [];
let version = "";
let activeRole = "all";

ddData("champion.json")
  .then(({ version: v, data }) => {
    version = v;
    patch.textContent = `Yama ${v}`;
    champions = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name, "tr"));
    buildRoleChips();
    render();
  })
  .catch(() => {
    patch.textContent = "Bağlantı hatası";
    showNotice(grid, "Şampiyonlar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.");
  });

function buildRoleChips() {
  const options = [["all", "Tümü"], ...Object.entries(ROLES)];
  roles.replaceChildren(
    ...options.map(([key, label]) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "data-role": key,
          "aria-pressed": String(key === activeRole),
          onclick: () => {
            activeRole = key;
            for (const chip of roles.children) {
              chip.setAttribute("aria-pressed", String(chip.dataset.role === activeRole));
            }
            render();
          },
        },
        label
      )
    )
  );
}

function render() {
  const query = normalize(search.value.trim());
  const list = champions.filter(
    (c) =>
      (activeRole === "all" || c.tags.includes(activeRole)) &&
      (!query || normalize(c.name).includes(query) || normalize(c.title).includes(query))
  );

  count.textContent = `${list.length} şampiyon`;

  if (!list.length) {
    showNotice(grid, "Aramana uyan şampiyon bulunamadı.");
    return;
  }

  grid.replaceChildren(
    ...list.map((c) =>
      el(
        "a",
        { class: "tile", href: `sampiyon.html?id=${encodeURIComponent(c.id)}` },
        el("img", { src: ddImg(version, "champion", c.image.full), alt: "", loading: "lazy", width: 72, height: 72 }),
        el("span", { class: "tile-name" }, c.name),
        el("span", { class: "tile-sub" }, c.tags.map((t) => ROLES[t] || t).join(" · "))
      )
    )
  );
}

search.addEventListener("input", render);
