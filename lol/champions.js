const grid = document.getElementById("grid");
const search = document.getElementById("search");
const roles = document.getElementById("roles");
const lanes = document.getElementById("lanes");
const count = document.getElementById("count");
const patch = document.getElementById("patch");

let champions = [];
let championLanes = new Map();
let version = "";
let activeRole = "all";
let activeLane = "all";

Promise.all([ddData("champion.json"), getChampionLanes().catch(() => null)])
  .then(([{ version: v, data }, laneMap]) => {
    version = v;
    patch.textContent = `Yama ${v}`;
    champions = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name, "tr"));

    buildChips(roles, [["all", "Tüm roller"], ...Object.entries(ROLES)], () => activeRole, (key) => (activeRole = key));

    // Koridor verisi alınamazsa site yine çalışır, sadece koridor filtresi gizli kalır.
    if (laneMap) {
      championLanes = laneMap;
      buildChips(
        lanes,
        [["all", "Tüm koridorlar"], ...LANES.map((l) => [l.id, l.label])],
        () => activeLane,
        (key) => (activeLane = key)
      );
      lanes.hidden = false;
    }
    render();
  })
  .catch(() => {
    patch.textContent = "Bağlantı hatası";
    showNotice(grid, "Şampiyonlar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.");
  });

function buildChips(container, options, getActive, setActive) {
  container.replaceChildren(
    ...options.map(([key, label]) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "data-key": key,
          "aria-pressed": String(key === getActive()),
          onclick: () => {
            setActive(key);
            for (const chip of container.children) {
              chip.setAttribute("aria-pressed", String(chip.dataset.key === getActive()));
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
  const lane = LANES.find((l) => l.id === activeLane);
  const list = champions.filter(
    (c) =>
      (activeRole === "all" || c.tags.includes(activeRole)) &&
      (activeLane === "all" || (championLanes.get(c.key) || []).includes(activeLane)) &&
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
        {
          class: "tile",
          href: `sampiyon.html?id=${encodeURIComponent(c.id)}${lane ? `&koridor=${lane.slug}` : ""}`,
        },
        el("img", { src: ddImg(version, "champion", c.image.full), alt: "", loading: "lazy", width: 72, height: 72 }),
        el("span", { class: "tile-name" }, c.name),
        el("span", { class: "tile-sub" }, c.tags.map((t) => ROLES[t] || t).join(" · "))
      )
    )
  );
}

search.addEventListener("input", render);
