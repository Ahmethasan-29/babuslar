// Panel giriş sayfası: giriş yoksa anahtar formu, varsa oyun kategorileri.

// Her oyun bir kategori; içindeki bölümler ayrı panellerdir. Paneli olmayan bölümler "Yakında" görünür.
const GAMES = [
  {
    name: "Counter-Strike 2",
    sections: [
      { label: "Haritalar ve infolar", href: "cs2.html?panel=haritalar" },
      { label: "Atış videoları", href: "cs2.html?panel=atislar" },
    ],
  },
  { name: "League of Legends", sections: [{ label: "Eşya dizilimleri" }] },
  { name: "Valorant", sections: [{ label: "Yetenek videoları" }] },
  { name: "Dead by Daylight", sections: [{ label: "Türkçe perk metinleri" }, { label: "Jeneratör yerleri" }] },
  { name: "Darkest Dungeon", sections: [{ label: "Türkçe metinler" }] },
  { name: "Rainbow Six Siege", sections: [{ label: "Türkçe metinler" }] },
  { name: "Mount & Blade", sections: [{ label: "Türkçe metinler" }] },
  { name: "The Witcher 3", sections: [{ label: "Türkçe metinler" }] },
  { name: "Cyberpunk 2077", sections: [{ label: "İkonik silah metinleri" }] },
  { name: "Project Zomboid", sections: [{ label: "Türkçe metinler" }] },
  { name: "Sea of Thieves", sections: [{ label: "Türkçe metinler" }] },
  { name: "Brotato", sections: [{ label: "Türkçe metinler" }] },
  { name: "Battlefield", sections: [{ label: "Türkçe metinler" }] },
  { name: "Site", sections: [{ label: "Ana sayfa kartları" }, { label: "Hakkımda" }] },
];

const app = document.getElementById("app");

start();

async function start() {
  if (!Panel.token()) return showLogin();
  try {
    await Panel.login();
  } catch (e) {
    return showLogin(e.status === 401 ? "Anahtar geçersiz ya da süresi dolmuş. Yeni bir anahtarla giriş yap." : e.message);
  }
  await Panel.guard();
  showGames();
}

function showLogin(error) {
  const input = el("input", { type: "password", class: "search", placeholder: "github_pat_…", autocomplete: "off", "aria-label": "GitHub erişim anahtarı" });
  const message = el("p", { class: "form-error" }, error || "");
  const form = el(
    "form",
    { class: "login-card" },
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, "Panele yalnızca bu sitenin GitHub deposunda düzenleme yetkisi olanlar girebilir."),
    el(
      "ol",
      { class: "login-steps" },
      el("li", {}, el("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener" }, "GitHub'da yeni bir erişim anahtarı (fine-grained token) oluştur"), "."),
      el("li", {}, "Repository access: ", el("b", {}, "Only select repositories → babuslar"), "."),
      el("li", {}, "Permissions: ", el("b", {}, "Contents"), " ve ", el("b", {}, "Pull requests"), " için ", el("b", {}, "Read and write"), "."),
      el("li", {}, "Oluşan anahtarı aşağıya yapıştır. Anahtar yalnızca bu tarayıcıda saklanır.")
    ),
    input,
    el("button", { type: "submit", class: "btn-primary" }, "Giriş yap"),
    message
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Panel.setToken(input.value.trim());
    message.textContent = "Kontrol ediliyor…";
    try {
      await Panel.login();
      location.reload();
    } catch (err) {
      Panel.setToken(null);
      message.textContent = err.status === 401 ? "Anahtar geçersiz." : err.message;
    }
  });
  app.replaceChildren(form);
}

function showGames() {
  app.replaceChildren(
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, `Hoş geldin ${Panel.user.name || Panel.user.login}. Düzenlemek istediğin oyunu ve bölümü seç.`),
    el(
      "div",
      { class: "admin-games" },
      GAMES.map((game) =>
        el(
          "section",
          { class: "admin-game" },
          el("h2", {}, game.name),
          el(
            "div",
            { class: "admin-sections" },
            game.sections.map((s) =>
              s.href ? el("a", { class: "admin-section", href: s.href }, s.label) : el("span", { class: "admin-section soon" }, s.label, el("small", {}, "Yakında"))
            )
          )
        )
      )
    )
  );
}
