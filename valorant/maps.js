const list = document.getElementById("maps");

getMaps()
  .then((maps) =>
    list.replaceChildren(
      ...maps.map((m) =>
        el(
          "a",
          { class: "game-card", href: `harita.html?id=${m.id}` },
          el("img", { class: "card-img", src: m.photo, alt: "", loading: "lazy" }),
          el("span", { class: "badge" }, `${m.callouts.length} info`),
          el("h2", {}, m.name),
          el("p", {}, siteLabel(m.sites))
        )
      )
    )
  )
  .catch(() => showNotice(list, "Haritalar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile."));

// "A/B/C Sites" → "A, B ve C bölgeleri"
function siteLabel(text) {
  const sites = (text.match(/^([A-Z](?:\/[A-Z])*)/)?.[1] || "").split("/").filter(Boolean);
  if (!sites.length) return "";
  return sites.length === 1 ? `${sites[0]} bölgesi` : `${sites.slice(0, -1).join(", ")} ve ${sites.at(-1)} bölgeleri`;
}
