// Dead by Daylight sayfalarında ortak yardımcılar. Veri: data.js (scripts/dbd-data.ps1 ile oluşturulur).

const ROLE_LABELS = { killer: "Katiller", survivor: "Survivor'lar" };

// Oyun metinlerindeki basit biçimlendirme (<b>, <i>, <br>, liste) korunur; geri kalan her şey düz metne çevrilir.
// DOMParser betik çalıştırmaz; yalnızca izin verilen etiketler yeniden oluşturulur.
const ALLOWED_TAGS = new Set(["B", "I", "BR", "UL", "LI", "P"]);

function richText(html) {
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
  const copy = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const children = [...node.childNodes].map(copy).filter(Boolean);
    if (!ALLOWED_TAGS.has(node.tagName)) return children;
    const out = document.createElement(node.tagName.toLowerCase());
    out.append(...children.flat());
    return out;
  };
  const wrap = el("div", { class: "rich" });
  wrap.append(...[...doc.body.childNodes].map(copy).flat(Infinity).filter(Boolean));
  return wrap;
}

function findCharacter(id) {
  for (const role of ["killer", "survivor"]) {
    const list = role === "killer" ? DBD.killers : DBD.survivors;
    const c = list.find((x) => x.id === id);
    if (c) return { ...c, role };
  }
  return null;
}

// Görsel yoksa adın baş harfleriyle bir yer tutucu gösterilir.
function portraitImg(c, size) {
  if (c.portrait) return el("img", { src: c.portrait, alt: "", loading: "lazy", width: size, height: size });
  const initials = c.name.replace(/^The /, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
  return el("span", { class: "dbd-placeholder", style: `width:${size}px;height:${size}px` }, initials);
}

// Perk kartı. withOwner: perkin hangi karaktere ait olduğunu da gösterir (Perkler sayfası).
function perkCard(p, withOwner = false) {
  const owner = !withOwner
    ? null
    : p.owner
      ? el("a", { class: "perk-owner", href: `karakter.html?id=${encodeURIComponent(p.owner.id)}` }, p.owner.name)
      : el("span", { class: "perk-owner" }, "Genel perk (herkes kullanabilir)");
  return el(
    "article",
    { class: "ability perk" },
    el("div", { class: "perk-icon" }, p.icon ? el("img", { src: p.icon, alt: "", width: 72, height: 72, loading: "lazy" }) : null),
    el("div", {}, el("h3", {}, p.name), owner, el("div", { class: "desc" }, richText(p.description)), perkVideo(p))
  );
}

// Perkin oyun içi videosu (wikiden). Tıklanınca yüklenir ve döngüde oynar.
function perkVideo(p) {
  if (!p.video) return null;
  const button = el("button", { class: "chip perk-play", type: "button" }, "▶ Oyun içi videoyu izle");
  button.addEventListener("click", () =>
    button.replaceWith(el("video", { class: "video-frame perk-video", src: p.video, autoplay: "", loop: "", muted: "", playsinline: "", controls: "" }))
  );
  return button;
}
