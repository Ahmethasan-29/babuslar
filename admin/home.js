// Panel giriş sayfası: giriş yoksa kullanıcı adı/şifre formu, varsa oyun kategorileri (?hesap: hesabım ve kullanıcılar).

// Oyunlar ve bölümleri games.js'te tanımlı.

const app = document.getElementById("app");

start();

async function start() {
  const params = new URLSearchParams(location.search);
  if (!Panel.token()) {
    // Sahip hesabı henüz açılmadıysa ilk kurulum ekranı gelir.
    const status = await Panel.call("/").catch(() => null);
    return status?.setup ? showSetup() : showLogin();
  }
  try {
    await Panel.login();
  } catch (e) {
    if (e.status === 401) Panel.setToken(null);
    return showLogin(e.message);
  }
  await Panel.guard();
  if (params.has("hesap")) return showAccount();
  showGames();
}

const field = (label, attrs) => el("label", { class: "login-field" }, el("span", {}, label), el("input", { class: "search", ...attrs }));

function showLogin(error) {
  const username = field("Kullanıcı adı", { name: "username", autocomplete: "username", required: true, autocapitalize: "off" });
  const password = field("Şifre", { name: "password", type: "password", autocomplete: "current-password", required: true });
  const message = el("p", { class: "form-error" }, error || "");
  const form = el(
    "form",
    { class: "login-card" },
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, "Kullanıcı adın ve şifrenle giriş yap. Hesabın yoksa site sahibinden iste."),
    username,
    password,
    el("button", { type: "submit", class: "btn-primary" }, "Giriş yap"),
    message
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Kontrol ediliyor…";
    try {
      await Panel.signIn(form.username.value, form.password.value);
      location.reload();
    } catch (err) {
      message.textContent = err.message;
    }
  });
  app.replaceChildren(form);
  form.username.focus();
}

// İlk kurulum: henüz site sahibi yoksa gelir; burada açılan hesap site sahibi olur (bir kez).
function showSetup() {
  const message = el("p", { class: "form-error" });
  const form = el(
    "form",
    { class: "login-card" },
    el("h1", { class: "page-title" }, "Site sahibi hesabı"),
    el("p", { class: "page-sub" }, "Panel ilk kez açılıyor. Kendine kullanıcı adı ve şifre seç; bu hesap site sahibi olur ve kullanıcıları yalnızca o ekleyip silebilir."),
    field("Kullanıcı adı", { name: "username", autocomplete: "username", required: true, autocapitalize: "off" }),
    field("Şifre (en az 8 karakter)", { name: "password", type: "password", autocomplete: "new-password", minlength: 8, required: true }),
    el("button", { type: "submit", class: "btn-primary" }, "Hesabı kaydet"),
    message
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Kontrol ediliyor…";
    try {
      await Panel.call("/setup", { method: "POST", body: { username: form.username.value, password: form.password.value } });
      await Panel.signIn(form.username.value, form.password.value);
      location.href = "?hesap";
    } catch (err) {
      message.textContent = err.message;
    }
  });
  app.replaceChildren(form);
}

// Hesabım: şifre değiştirme; site sahibi için kullanıcı listesi (ekle, şifre sıfırla, sil).
async function showAccount() {
  document.title = "Hesabım · Yönetim paneli · Babuşlar";
  const passMessage = el("p", { class: "form-error" });
  const passForm = el(
    "form",
    { class: "login-card account-card" },
    el("h2", {}, "Şifremi değiştir"),
    field("Şu anki şifre", { name: "old", type: "password", autocomplete: "current-password", required: true }),
    field("Yeni şifre (en az 8 karakter)", { name: "password", type: "password", autocomplete: "new-password", minlength: 8, required: true }),
    el("button", { type: "submit", class: "btn-primary" }, "Şifreyi değiştir"),
    passMessage
  );
  passForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    passMessage.textContent = "Kaydediliyor…";
    try {
      await Panel.call("/password", { method: "POST", body: { old: passForm.old.value, password: passForm.password.value } });
      passForm.reset();
      passMessage.textContent = "Şifren değişti.";
    } catch (err) {
      passMessage.textContent = err.message;
    }
  });

  fill(
    app,
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), " / Hesabım"),
    el("h1", { class: "page-title" }, Panel.user.name),
    el("p", { class: "page-sub" }, `Kullanıcı adın: ${Panel.user.login}${Panel.user.owner ? " · site sahibi" : ""}`),
    Panel.user.owner ? await usersCard() : null,
    passForm
  );
}

async function usersCard() {
  const list = el("ul", { class: "user-list" });
  const message = el("p", { class: "form-error" });

  async function load() {
    const users = await Panel.call("/users");
    fill(
      list,
      users.map((u) =>
        el(
          "li",
          {},
          el("span", {}, el("b", {}, u.name), ` · ${u.login}`, u.owner ? el("small", { class: "admin-tag" }, "sahip") : null),
          u.owner
            ? null
            : el(
                "span",
                { class: "user-actions" },
                el("button", { type: "button", class: "chip", onclick: () => resetPassword(u) }, "Şifre sıfırla"),
                el("button", { type: "button", class: "chip", onclick: () => removeUser(u) }, "Sil")
              )
        )
      )
    );
  }

  async function resetPassword(u) {
    const password = prompt(`${u.name} için yeni şifre (en az 8 karakter):`);
    if (!password) return;
    try {
      await Panel.call("/users", { method: "POST", body: { username: u.login, password } });
      message.textContent = `${u.name} kullanıcısının şifresi değişti.`;
    } catch (err) {
      message.textContent = err.message;
    }
  }

  async function removeUser(u) {
    if (!confirm(`${u.name} (${u.login}) silinsin mi? Panele bir daha giremez.`)) return;
    try {
      await Panel.call(`/users/${encodeURIComponent(u.login)}`, { method: "DELETE" });
      message.textContent = `${u.name} silindi.`;
      await load();
    } catch (err) {
      message.textContent = err.message;
    }
  }

  const form = el(
    "form",
    { class: "user-add" },
    field("Görünen ad", { name: "display", placeholder: "ör. Mehmet", required: true }),
    field("Kullanıcı adı", { name: "username", placeholder: "ör. mehmet", autocapitalize: "off", required: true }),
    field("Şifre (en az 8 karakter)", { name: "password", type: "text", autocomplete: "off", minlength: 8, required: true }),
    el("button", { type: "submit", class: "btn-primary" }, "Kullanıcı ekle")
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Kaydediliyor…";
    try {
      const user = await Panel.call("/users", { method: "POST", body: { display: form.display.value, username: form.username.value, password: form.password.value } });
      message.textContent = `${user.name} eklendi. Kullanıcı adı: ${user.login}. Şifreyi kendisine ilet.`;
      form.reset();
      await load();
    } catch (err) {
      message.textContent = err.message;
    }
  });

  await load();
  return el(
    "section",
    { class: "login-card account-card" },
    el("h2", {}, "Kullanıcılar"),
    el("p", { class: "hint" }, "Eklediğin herkes bütün oyunları düzenleyebilir. Kullanıcı ekleyip silmeyi yalnızca sen yapabilirsin."),
    list,
    form,
    message
  );
}

// Oyunun görseli ve adı (sitedeki oyun kartları gibi). Wiki görselleri yabancı sitelere referer ile verilmez.
const banner = (game, big) =>
  el(
    "div",
    { class: `admin-banner${game.top ? " top" : ""}${game.image ? "" : " plain"}${big ? " big" : ""}` },
    game.image ? el("img", { src: game.image, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }) : null,
    el(big ? "h1" : "h2", {}, game.name === "Site" ? "Site (ana sayfa, Hakkımda)" : game.name),
    el("small", {}, `${game.sections.length} bölüm`)
  );

// Ana sayfa yalnızca oyun kartlarını gösterir; bölümler oyuna tıklayınca açılır (index.html?oyun=<kısa ad>).
// Tek bölümlü oyunlar doğrudan o bölüme gider.

function showGame(game) {
  document.title = `${game.name} · Yönetim paneli · Babuşlar`;
  fill(
    app,
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), ` / ${game.name}`),
    el("div", { class: "admin-game single" }, banner(game, true)),
    el("p", { class: "page-sub" }, "Düzenlemek istediğin bölümü seç."),
    el("div", { class: "admin-sections grid" }, game.sections.map((s) => el("a", { class: "admin-section", href: s.href }, s.label)))
  );
}

// Arama: büyük/küçük harf ve Türkçe karakter farkı gözetmez ("sampiyon" = "Şampiyon").
const fold = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// Kartta yazmayan ama aranabilecek kısa adlar.
const ALIASES = { cs2: "cs csgo counter", lol: "league sampiyon esya build", dbd: "dead", dd1: "dd", dd2: "dd", r6: "rainbow siege", bannerlord: "mb mount blade", warband: "mb mount blade", witcher3: "w3 witcher", cp2077: "cp cyberpunk", pz: "zomboid", sot: "sea thieves", site: "hakkımda ana sayfa", bf: "battlefield bf" };

// Ana sayfa yalnızca oyun kartlarını gösterir; bölümler oyuna tıklayınca açılır (index.html?oyun=<kısa ad>).
// Tek bölümlü oyunlar doğrudan o bölüme gider. Arama kutusu oyunları süzer ve eşleşen bölümleri doğrudan listeler.
function showGames() {
  const game = GAMES.find((g) => g.id === new URLSearchParams(location.search).get("oyun"));
  if (game) return showGame(game);

  const cards = GAMES.map((g) => ({
    g,
    text: fold(`${g.name} ${g.id} ${ALIASES[g.id] || ""}`),
    node: el("a", { class: "admin-game", href: g.sections.length === 1 ? g.sections[0].href : `?oyun=${g.id}` }, banner(g)),
  }));
  const sections = GAMES.flatMap((g) => g.sections.map((s) => ({ g, s, text: fold(`${s.label} ${g.name} ${g.id} ${ALIASES[g.id] || ""}`) })));

  const results = el("div", { class: "search-results" });
  const empty = el("p", { class: "hint" }, "Aramana uyan oyun ya da bölüm yok.");
  const search = el("input", { class: "search admin-search", type: "search", placeholder: "Oyun ya da bölüm ara… (ör. perk, silah, harita, dbd)", autocomplete: "off", "aria-label": "Panelde ara" });

  function run() {
    const words = fold(search.value).split(/\s+/).filter(Boolean);
    // Her aranan kelime, bir kelimenin başıyla eşleşmeli ("mb" Mount & Blade'i bulur, Zomboid'i değil).
    const match = (text) => words.every((w) => text.split(/[^a-z0-9]+/).some((t) => t.startsWith(w)));
    for (const c of cards) c.node.hidden = words.length > 0 && !match(c.text) && !sections.some((x) => x.g === c.g && match(x.text));
    const hits = words.length ? sections.filter((x) => match(x.text)) : [];
    fill(
      results,
      hits.length
        ? [
            el("h2", { class: "results-title" }, `Bölümler (${hits.length})`),
            el("div", { class: "admin-sections grid" }, hits.slice(0, 60).map((x) => el("a", { class: "admin-section", href: x.s.href }, x.s.label, el("small", {}, x.g.name)))),
          ]
        : null,
      words.length && !hits.length && cards.every((c) => c.node.hidden) ? empty : null
    );
  }
  search.addEventListener("input", run);
  // Enter: tek sonuç varsa doğrudan oraya git.
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = results.querySelector("a.admin-section") || cards.find((c) => !c.node.hidden)?.node;
    if (first) location.href = first.getAttribute("href");
  });

  fill(
    app,
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, `Hoş geldin ${Panel.user.name}. Düzenlemek istediğin oyunu seç ya da ara.`, Panel.user.owner ? [" ", el("a", { href: "?hesap" }, "Kullanıcıları yönet")] : null),
    search,
    results,
    el("div", { class: "admin-games" }, cards.map((c) => c.node))
  );
  search.focus();
}
