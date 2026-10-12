// Panel giriş sayfası: giriş yoksa anahtar formu, varsa oyun kategorileri.

// Oyunlar ve bölümleri games.js'te tanımlı.

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
          // Sitedeki oyun kartları gibi üstte oyunun görseli. Wiki görselleri yabancı sitelere referer ile verilmez.
          el(
            "div",
            { class: `admin-banner${game.top ? " top" : ""}${game.image ? "" : " plain"}` },
            game.image ? el("img", { src: game.image, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }) : null,
            el("h2", {}, game.name === "Site" ? "Site (ana sayfa, Hakkımda)" : game.name),
            el("small", {}, `${game.sections.length} bölüm`)
          ),
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
