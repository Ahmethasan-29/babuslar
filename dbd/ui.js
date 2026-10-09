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

// Perk açıklaması site dilinde. Türkçe çeviride {0}, {1}… yerine güncel değerler (İngilizce metindeki kalın sayılar) konur.
// Çeviri güncel değerlerle uyuşmuyorsa (ör. oyun perke yeni bir değer eklediyse) İngilizce metin gösterilir.
function perkDescription(p) {
  const tr = !IS_EN && typeof DBD_TR_PERKS !== "undefined" ? DBD_TR_PERKS[p.name.replace(/\s+/g, " ").trim()] : null;
  if (!tr) return p.description;
  const values = [...p.description.matchAll(/<b>([\d.,/]+)<\/b>/g)].map((m) => m[1]);
  const used = new Set([...tr.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1])));
  if (used.size !== values.length || [...used].some((i) => i >= values.length)) return p.description;
  return tr.replace(/\{(\d+)\}/g, (_, i) => `<b>${values[i].replace(/\./g, ",")}</b>`);
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
    el("div", {}, el("h3", {}, p.name), owner, el("div", { class: "desc" }, richText(perkDescription(p))), perkVideo(p))
  );
}

// Perkin oyun içi videosu (wikiden). Tıklanınca yüklenir ve döngüde oynar; "Büyüt" ile büyük pencerede açılır.
function perkVideo(p) {
  if (!p.video) return null;
  const button = el("button", { class: "chip perk-play", type: "button" }, "▶ Oyun içi videoyu izle");
  button.addEventListener("click", () =>
    button.replaceWith(
      el(
        "div",
        { class: "perk-video-wrap" },
        el("video", { class: "video-frame perk-video", src: p.video, autoplay: "", loop: "", muted: "", playsinline: "", controls: "" }),
        el("button", { class: "chip perk-zoom", type: "button", onclick: () => openVideoDialog(p.name, p.video) }, "⛶ Büyüt")
      )
    )
  );
  return button;
}

// Büyük video penceresi: kartlardaki küçük videoların tam boy hali. Kapatınca video durur.
let videoDialog;

function openVideoDialog(title, src) {
  if (!videoDialog) {
    videoDialog = el(
      "dialog",
      { class: "video-dialog", "aria-label": "Video" },
      el("button", { class: "close", type: "button", "aria-label": "Kapat", onclick: () => videoDialog.close() }, "×"),
      el("h2", { class: "video-dialog-title" }),
      el("video", { class: "video-frame", autoplay: "", loop: "", muted: "", playsinline: "", controls: "" })
    );
    videoDialog.addEventListener("click", (event) => {
      if (event.target === videoDialog) videoDialog.close();
    });
    videoDialog.addEventListener("close", () => videoDialog.querySelector("video").removeAttribute("src"));
    document.body.append(videoDialog);
  }
  videoDialog.querySelector(".video-dialog-title").textContent = title;
  const video = videoDialog.querySelector("video");
  video.src = src;
  videoDialog.showModal();
  video.play().catch(() => {});
}
