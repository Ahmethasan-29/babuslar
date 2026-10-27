// Ana sayfa arka planı: oyunların resmi fragmanlarından birkaç saniyelik kesitler sırayla, sessizce oynar.
// Kesitler assets/arkaplan/data.js'te (ARKAPLAN). Fragmanlar HLS akışıdır: Safari kendisi oynatır,
// diğer tarayıcılar için hls.js gerektiğinde yüklenir.
// Hareketi azalt ayarı, veri tasarrufu ya da dar ekranda (telefon) hiç çalışmaz; yalnızca sabit arka plan kalır.

(() => {
  const CLIP_SECONDS = 8;
  const FADE_MS = 1200;
  const HLS_JS = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.light.min.js";

  if (typeof ARKAPLAN === "undefined" || !ARKAPLAN.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection?.saveData) return;
  if (!matchMedia("(min-width: 760px)").matches) return;

  const probe = document.createElement("video");
  const nativeHls = !!probe.canPlayType("application/vnd.apple.mpegurl");
  if (!nativeHls && !window.MediaSource) return;

  const clips = [...ARKAPLAN].sort(() => Math.random() - 0.5);
  let index = 0;

  const layer = document.createElement("div");
  layer.className = "bg-video";
  layer.setAttribute("aria-hidden", "true");
  const players = [0, 1].map(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.disablePictureInPicture = true;
    layer.append(video);
    return { video, hls: null };
  });
  const label = document.createElement("a");
  label.className = "bg-video-label";
  label.hidden = true;
  document.body.prepend(layer);
  document.body.append(label);

  let active = 0;
  let timer = null;

  function loadHls() {
    if (nativeHls || window.Hls) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = HLS_JS;
      s.onload = resolve;
      s.onerror = reject;
      document.head.append(s);
    });
  }

  // Kesiti oyuncuya yükler; başlangıç noktasında oynamaya hazır olunca çözülür.
  function prepare(player, clip) {
    return new Promise((resolve, reject) => {
      const { video } = player;
      if (player.hls) player.hls.destroy();
      player.hls = null;
      const fail = setTimeout(() => reject(new Error("zaman aşımı")), 10000);
      const ready = () => {
        clearTimeout(fail);
        resolve();
      };
      video.addEventListener("playing", ready, { once: true });
      if (nativeHls) {
        video.src = clip.src;
        video.addEventListener("loadedmetadata", () => { video.currentTime = clip.start; video.play().catch(reject); }, { once: true });
      } else {
        const hls = new Hls({ startPosition: clip.start, maxBufferLength: CLIP_SECONDS + 4, maxMaxBufferLength: CLIP_SECONDS + 6, capLevelToPlayerSize: true });
        player.hls = hls;
        hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) { clearTimeout(fail); reject(new Error(data.details)); } });
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(reject));
        hls.loadSource(clip.src);
        hls.attachMedia(video);
      }
    });
  }

  function stop(player) {
    player.video.pause();
    if (player.hls) player.hls.destroy();
    player.hls = null;
    player.video.removeAttribute("src");
    player.video.load();
  }

  // Sıradaki kesiti arkadaki oyuncuda hazırlar, hazır olunca üste alır. Açılmayan kesit atlanır.
  async function next(tries = 0) {
    if (tries >= clips.length) return;
    const clip = clips[index++ % clips.length];
    const back = players[1 - active];
    try {
      await prepare(back, clip);
    } catch {
      stop(back);
      return next(tries + 1);
    }
    const front = players[active];
    back.video.classList.add("on");
    front.video.classList.remove("on");
    active = 1 - active;
    label.href = clip.href;
    label.textContent = clip.game;
    label.hidden = false;
    setTimeout(() => stop(front), FADE_MS);
    timer = setTimeout(next, CLIP_SECONDS * 1000);
  }

  // Sekme arka plandayken durur.
  document.addEventListener("visibilitychange", () => {
    const video = players[active].video;
    if (document.hidden) {
      clearTimeout(timer);
      video.pause();
    } else if (video.src || players[active].hls) {
      video.play().catch(() => {});
      timer = setTimeout(next, CLIP_SECONDS * 1000);
    }
  });

  // Sayfa açılışını yavaşlatmasın diye kartlar yüklendikten sonra başlar.
  const begin = () => loadHls().then(() => next()).catch(() => layer.remove());
  if (document.readyState === "complete") setTimeout(begin, 300);
  else addEventListener("load", () => setTimeout(begin, 300), { once: true });
})();
