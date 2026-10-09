const root = document.getElementById("agent");
const id = new URLSearchParams(location.search).get("id");

getAgents()
  .then((agents) => {
    const a = agents.find((x) => x.id === id);
    if (!a) {
      showNotice(root, "Ajan bulunamadı. Listeden bir ajan seç.");
      return;
    }
    render(a);
  })
  .catch(() => showNotice(root, "Ajan yüklenemedi. Bağlantını kontrol edip sayfayı yenile."));

function render(a) {
  document.title = `${a.name} · Valorant · Babuşlar`;

  const videos = ABILITY_VIDEOS[a.name] || {};

  // Ajanın tam boy görseli, kendi renk geçişli arka planının önünde.
  const [c1, c2] = a.colors.map((c) => `#${c.slice(0, 6)}`);
  const hero = el(
    "section",
    { class: "champ-hero agent-hero" },
    el("img", { class: "agent-portrait", src: a.portrait, alt: "" }),
    el(
      "div",
      { class: "champ-hero-body" },
      el("h1", {}, a.name),
      el("div", { class: "tags" }, el("span", { class: "badge" }, a.role)),
      el("p", { class: "agent-desc" }, a.description)
    )
  );
  if (c1) hero.style.backgroundImage = `url("${a.background}"), linear-gradient(135deg, ${c1}, ${c2 || c1})`;

  const abilities = el(
    "section",
    { class: "section" },
    el("h2", {}, "Yetenekler"),
    el(
      "div",
      { class: "abilities val-abilities" },
      a.abilities.map((ab) =>
        el(
          "article",
          { class: "ability" },
          el(
            "div",
            { class: "ability-icon" },
            el("img", { src: ab.icon, alt: "", width: 64, height: 64, loading: "lazy" }),
            el("span", { class: "ability-key" }, ab.key)
          ),
          el(
            "div",
            {},
            el("h3", {}, ab.name),
            ab.trName && normalize(ab.trName) !== normalize(ab.name)
              ? el("div", { class: "meta" }, el("span", {}, `Türkçe: ${ab.trName}`))
              : null,
            el("p", { class: "desc" }, ab.description),
            abilityVideo(videos[ab.name], ab.name)
          )
        )
      )
    )
  );

  root.replaceChildren(hero, abilities);
}

// Yetenek videosu (Riot'un resmi sitesinden). İlk kare önizleme olarak görünür; tıklanınca oynar ve kısa olduğu için döngüde tekrar eder.
function abilityVideo(src, name) {
  if (!src) return null;
  const frame = el(
    "button",
    { class: "video-thumb ability-video", type: "button", "aria-label": `${name} videosunu oynat` },
    el("video", { src: `${src}#t=1`, preload: "metadata", muted: "", playsinline: "", tabindex: -1 }),
    el("span", { class: "play", "aria-hidden": "true" }, "▶")
  );
  frame.addEventListener("click", () =>
    frame.replaceWith(el("video", { class: "video-frame ability-video", src, controls: "", autoplay: "", loop: "", playsinline: "" }))
  );
  return frame;
}
