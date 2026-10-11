// Cyberpunk 2077 silahları (Cyberpunk Wiki, Infobox Weapon2077): türe göre süzme, arama, ikonik silahların klipleri.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const params = new URLSearchParams(location.search);
const TYPES = [...new Set(CP.weapons.map((w) => w.type).filter(Boolean))].sort((a, b) => (CP_TR.typeOrder.indexOf(a) + 1 || 99) - (CP_TR.typeOrder.indexOf(b) + 1 || 99) || a.localeCompare(b));
let kind = "iconic";
let type = "all";
let open = params.get("silah");

function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}

function update() {
  document.getElementById("kinds").replaceChildren(
    chip(L(`İkonik (${CP.weapons.filter((w) => w.iconic).length})`, `Iconic (${CP.weapons.filter((w) => w.iconic).length})`), kind === "iconic", () => ((kind = "iconic"), update())),
    chip(L(`Hepsi (${CP.weapons.length})`, `All (${CP.weapons.length})`), kind === "all", () => ((kind = "all"), update()))
  );
  document.getElementById("types").replaceChildren(
    chip(L("Her tür", "Every type"), type === "all", () => ((type = "all"), update())),
    ...TYPES.filter((t) => CP.weapons.some((w) => w.type === t && (kind === "all" || w.iconic))).map((t) => chip(typeName(t), type === t, () => ((type = t), update())))
  );
  render();
}

function card(w) {
  const isOpen = open === w.id;
  const node = el(
    "article",
    { class: `build-card cp-weapon${isOpen ? " open" : ""}`, id: `w-${w.id}` },
    isOpen
      ? [el("button", { class: "chip cp-close", type: "button", onclick: () => ((open = null), render()) }, L("Kapat", "Close")), ...weaponDetail(w, { mapLink: true })]
      : el(
          "button",
          { class: "cp-weapon-head", type: "button", onclick: () => ((open = w.id), history.replaceState(null, "", `?silah=${w.id}`), render(), document.getElementById(`w-${w.id}`).scrollIntoView({ block: "nearest" })) },
          w.image ? el("img", { class: "cp-weapon-img", src: thumb(w.image, 240), alt: "", loading: "lazy" }) : el("span", { class: "dd-noimg cp-weapon-img" }),
          el(
            "span",
            { class: "cp-weapon-text" },
            el("strong", {}, w.name),
            el("span", { class: "tile-sub" }, [typeName(w.type), w.maker].filter(Boolean).join(" · ")),
            w.quest ? el("span", { class: "tile-sub cp-quest-line" }, questLabel(w.quest)) : null,
            w.iconic ? el("span", { class: "tile-sub cp-has" }, [w.yt ? "▶ Video" : null, w.at ? L("📍 Haritada", "📍 On the map") : null].filter(Boolean).join(" · ")) : null
          )
        )
  );
  return node;
}

function render() {
  const q = normalize(search.value.trim());
  const items = CP.weapons.filter(
    (w) => (kind === "all" || w.iconic) && (type === "all" || w.type === type) && (!q || normalize(`${w.name} ${w.type} ${typeName(w.type)} ${w.maker} ${w.source} ${w.quest?.name || ""}`).includes(q))
  );
  count.textContent = L(`${items.length} silah`, `${items.length} weapons`);
  if (!items.length) {
    showNotice(list, L("Aramana uyan silah bulunamadı.", "No weapons match your search."));
    return;
  }
  list.replaceChildren(...items.map(card));
}

search.addEventListener("input", render);
// Bağlantıyla gelen silah (ör. haritadan) hangi süzgeçte olursa olsun görünsün.
const target = CP.weapons.find((w) => w.id === open);
if (target && !target.iconic) kind = "all";
update();
if (target) document.getElementById(`w-${target.id}`)?.scrollIntoView({ block: "center" });
