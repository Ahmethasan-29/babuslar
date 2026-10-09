const grid = document.getElementById("grid");
const search = document.getElementById("search");
const roles = document.getElementById("roles");
const count = document.getElementById("count");
const title = document.getElementById("title");

// Adres çubuğunda ?rol=katil | survivor
let role = new URLSearchParams(location.search).get("rol") === "survivor" ? "survivor" : "killer";

function setRole(next) {
  role = next;
  const url = new URL(location.href);
  url.searchParams.set("rol", role === "killer" ? "katil" : "survivor");
  history.replaceState(null, "", url);
  title.textContent = ROLE_LABELS[role];
  document.title = `${ROLE_LABELS[role]} · Dead by Daylight · Babuşlar`;
  for (const chip of roles.children) chip.setAttribute("aria-pressed", String(chip.dataset.key === role));
  for (const link of document.querySelectorAll(".nav a")) {
    const r = new URL(link.href).searchParams.get("rol");
    if (r) (r === "katil" ? "killer" : "survivor") === role ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
  }
  render();
}

roles.replaceChildren(
  ...Object.entries(ROLE_LABELS).map(([key, label]) =>
    el("button", { class: "chip", type: "button", "data-key": key, onclick: () => setRole(key) }, label)
  )
);

function render() {
  const query = normalize(search.value.trim());
  const list = (role === "killer" ? DBD.killers : DBD.survivors).filter(
    (c) => !query || normalize(c.name).includes(query) || c.perks.some((p) => normalize(p.name).includes(query))
  );
  count.textContent = `${list.length} karakter`;
  if (!list.length) {
    showNotice(grid, "Aramana uyan karakter bulunamadı.");
    return;
  }
  grid.replaceChildren(
    ...list.map((c) =>
      el(
        "a",
        { class: "tile", href: `karakter.html?id=${encodeURIComponent(c.id)}` },
        portraitImg(c, 72),
        el("span", { class: "tile-name" }, c.name),
        c.power ? el("span", { class: "tile-sub" }, c.power.name) : null
      )
    )
  );
}

search.addEventListener("input", render);
setRole(role);
