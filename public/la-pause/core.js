/* La Pause core: shared audio manager, vocabulary card, shared music panel, home world and hub screens.
   Activities register themselves with LP.register(hubId, activityId, { start(container, api) }). */
(function () {
  "use strict";
  var D = window.LP_DATA, EMBED = /[?&]embed=1/.test(location.search);
  var LP = window.LP = { hubs: D.hubs, activities: {}, embed: EMBED };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- audio file naming: one convention for the manifest and the app ---------- */
  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }
  function audioPath(folder, prefix, fr) { return "/assets/audio/la-pause/" + folder + "/" + prefix + "_" + slug(fr) + ".mp3"; }
  LP.slug = slug; LP.audioPath = audioPath;
  D.hubs.forEach(function (h) {
    var pre = h.id.replace(/-/g, "_");
    h.audio = audioPath(h.folder, pre + "_hub", h.fr);
    h.activities.forEach(function (a) { a.audio = audioPath(h.folder, pre + "_" + a.id, a.fr); });
  });

  /* ---------- audio manager: one French clip at a time, music ducks underneath ---------- */
  var voice = new Audio(), curRes = null, unlocked = false, music = null;
  function fin(ok) { if (!curRes) return; var r = curRes; curRes = null; unduck(); r(ok); }
  function playClip(src) {
    if (!src) return Promise.resolve(false);
    if (curRes) fin(false);
    return new Promise(function (res) {
      curRes = res;
      voice.onended = function () { fin(true); };
      voice.onerror = function () { fin(false); };       /* a missing file never breaks the activity */
      try { voice.pause(); voice.src = src; duck(); var p = voice.play(); if (p && p.catch) p.catch(function () { fin(false); }); }
      catch (e) { fin(false); }
    });
  }
  function stopClip() { try { voice.pause(); } catch (e) {} fin(false); }
  function duck() { if (music && !music.paused) music.volume = Math.max(0, vol * 0.25); }
  function unduck() { if (music) music.volume = vol; }
  document.addEventListener("pointerdown", function once() {
    if (unlocked) return; unlocked = true;
    document.removeEventListener("pointerdown", once, true);
  }, true);
  LP.audio = { play: playClip, stop: stopClip };

  /* ---------- vocabulary card: SEE, CLICK, HEAR, EXPLORE. Never a test. ---------- */
  var card = null, cardT = null, cardItem = null;
  function ensureCard() {
    if (card) return card;
    var root = el("div", "lp-word", '<div class="lp-word-txt"><b></b><i></i></div><button type="button" class="lp-word-play" aria-label="Hear it again"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg></button>');
    root.setAttribute("role", "status");
    document.body.appendChild(root);
    card = { root: root, fr: root.querySelector("b"), en: root.querySelector("i"), btn: root.querySelector("button") };
    card.btn.onclick = function () { if (cardItem) { playClip(cardItem.audio); keep(); } };
    root.addEventListener("pointerenter", function () { clearTimeout(cardT); });
    root.addEventListener("pointerleave", keep);
    return card;
  }
  function keep() { clearTimeout(cardT); cardT = setTimeout(hideWord, 5200); }
  function hideWord() { if (card) card.root.classList.remove("on"); }
  /* item: { fr, en, audio } */
  function showWord(item) {
    var c = ensureCard();
    cardItem = item; c.fr.textContent = item.fr; c.en.textContent = item.en || "";
    c.root.classList.add("on"); keep();
    playClip(item.audio);
  }
  LP.say = showWord;

  /* ---------- icons ---------- */
  var IC = {
    bag: "M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2",
    gear: "M12 9a3 3 0 1 0 .01 0M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1",
    house: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
    puzzle: "M8 4h3a2 2 0 1 1 4 0h3v4a2 2 0 1 0 0 4v4h-4a2 2 0 1 0-4 0H6v-4a2 2 0 1 1 0-4V4z",
    hanger: "M12 7a2 2 0 1 1 2 2l-2 2 9 6a1 1 0 0 1-.6 1.8H3.6A1 1 0 0 1 3 17l9-6",
    cart: "M3 4h2l2.5 11h10L20 7H6.5M9 20h.01M17 20h.01",
    scissors: "M6 4.5a2.5 2.5 0 1 0 .01 0M6 14.5a2.5 2.5 0 1 0 .01 0M8 8.5L20 17M8 15.5L20 7",
    lipstick: "M9 21v-8h6v8H9zM10 13V7l4-3v9",
    car: "M3 15l2-6h14l2 6v3H3v-3zM3 15h18M7 18v1M17 18v1",
    brick: "M3 6h18v12H3zM3 12h18M9 6v6M15 12v6",
    bridge: "M2 16h20M4 16V9M20 16V9M4 9q8 6 16 0M8 16v-5M12 16v-3M16 16v-5",
    robot: "M6 8h12v10H6zM12 8V4M9 12h.01M15 12h.01M9 15h6M3 12v3M21 12v3",
    bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11z",
    sofa: "M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 2-2M6 16v2M18 16v2",
    flower: "M12 22V12M12 12c-4 0-6-3-6-6 4 0 6 2 6 6M12 12c4 0 6-3 6-6-4 0-6 2-6 6",
    broom: "M15 3l-5 10M6 13h9l4 8H3z",
    bench: "M4 10h16M5 10v8M19 10v8M4 14h16M6 6h12",
    cards: "M4 7l8-3 3 10-8 3zM12 20l8-3-2-8",
    letters: "M4 19L8 5l4 14M5.5 14h5M17.5 5v14M15 5h5",
    grid: "M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "lp-ic") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (IC[name] || IC.puzzle) + '"/></svg>';
  }
  LP.icon = icon;

  /* ---------- hub facades, drawn in vector ---------- */
  function facade(h) {
    var id = "f" + h.id.replace(/-/g, ""), i, st = "", sc = "", bulbs = "";
    for (i = 0; i < 6; i++) {
      var x = 30 + i * 40, f = i % 2 ? "url(#" + id + "c)" : "url(#" + id + "t)";
      st += '<rect x="' + x + '" y="118" width="40.5" height="30" fill="' + f + '"/>';
      sc += '<path d="M' + x + ' 148 a20 20 0 0 0 40 0Z" fill="' + f + '"/>';
      bulbs += '<circle class="lp-bulb" style="animation-delay:' + (-(i * 0.43)).toFixed(2) + 's" cx="' + (x + 20) + '" cy="172" r="3.4" fill="#ffe9a6"/>';
    }
    function lantern(cx) {
      return '<g><line x1="' + cx + '" y1="206" x2="' + cx + '" y2="220" stroke="#caa24a" stroke-width="2"/>' +
        '<path d="M' + (cx - 8) + ' 220h16l-2 28h-12z" fill="url(#' + id + 'g)"/><rect x="' + (cx - 5) + '" y="224" width="10" height="20" rx="2" fill="#fff3c9"/>' +
        '<circle cx="' + cx + '" cy="234" r="24" fill="url(#' + id + 'l)"/></g>';
    }
    var emblem = '<path d="' + (IC[h.emblem] || IC.puzzle) + '"/>';
    return '<svg class="lp-facade" viewBox="0 0 300 400" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + h.tone.a + '"/><stop offset="1" stop-color="' + h.tone.b + '"/></linearGradient>' +
      '<linearGradient id="' + id + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + h.tone.a + '"/><stop offset="1" stop-color="' + h.tone.b + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e8dcc4"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8cbb0"/><stop offset=".4" stop-color="#fbf4e4"/><stop offset="1" stop-color="#cdbf9f"/></linearGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#d9a940"/><stop offset="1" stop-color="#8f6a1c"/></linearGradient>' +
      '<linearGradient id="' + id + 'in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c4"/><stop offset=".5" stop-color="#ffcf7e"/><stop offset="1" stop-color="#f09a4a"/></linearGradient>' +
      '<radialGradient id="' + id + 'l"><stop offset="0" stop-color="#ffe9a6" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a6" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + 'a"><path d="M100 366V250a50 50 0 0 1 100 0v116z"/></clipPath></defs>' +
      '<ellipse cx="150" cy="386" rx="132" ry="9" fill="#000" opacity=".3"/>' +
      '<rect x="14" y="52" width="272" height="14" rx="5" fill="url(#' + id + 's)"/>' +
      '<rect x="22" y="66" width="256" height="304" rx="6" fill="url(#' + id + 'b)"/>' +
      '<g opacity=".14" stroke="#fff"><path d="M22 215H278M22 290H278"/></g>' +
      '<rect x="86" y="74" width="128" height="32" rx="7" fill="url(#' + id + 'g)"/><rect x="90" y="78" width="120" height="24" rx="5" fill="#0d2f3a"/>' +
      '<svg x="138" y="79" width="24" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8dc8a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + emblem + '</svg>' +
      st + sc + '<rect x="30" y="118" width="240" height="4" fill="#fff" opacity=".35"/>' + bulbs +
      '<path d="M92 366V250a58 58 0 0 1 116 0v116" fill="none" stroke="url(#' + id + 's)" stroke-width="12"/>' +
      '<g clip-path="url(#' + id + 'a)"><rect x="100" y="190" width="100" height="180" fill="url(#' + id + 'in)"/>' +
      '<polygon points="150,200 110,366 150,366" fill="#fff" opacity=".13"/><polygon points="150,200 190,366 168,366" fill="#fff" opacity=".1"/>' +
      '<svg x="120" y="236" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">' + emblem + '</svg>' +
      '<rect x="100" y="334" width="100" height="32" fill="#e9a65a" opacity=".55"/></g>' +
      lantern(52) + lantern(248) +
      '<rect x="84" y="366" width="132" height="10" rx="3" fill="url(#' + id + 's)"/></svg>';
  }

  /* ---------- the home world and hub screens ---------- */
  var home, hubScr, current = null;
  function buildHome() {
    var street = $("street");
    D.hubs.forEach(function (h) {
      var b = el("div", "lp-hub");
      b.style.setProperty("--tone", h.tone.a);
      var enter = el("button", "lp-hub-door"); enter.type = "button";
      enter.setAttribute("aria-label", "Enter " + h.en);
      enter.innerHTML = facade(h);
      var plaque = el("div", "lp-plaque");
      var name = el("button", "lp-plaque-name"); name.type = "button";
      name.innerHTML = "<b></b><i></i>"; name.firstChild.textContent = h.fr; name.lastChild.textContent = h.en;
      name.setAttribute("aria-label", "Hear: " + h.fr);
      plaque.appendChild(name);
      b.appendChild(enter); b.appendChild(plaque); street.appendChild(b);
      enter.onclick = function () { showWord(h); setTimeout(function () { openHub(h.id, true); }, 450); };
      name.onclick = function () { showWord(h); };
    });
  }
  function hubById(id) { for (var i = 0; i < D.hubs.length; i++) if (D.hubs[i].id === id) return D.hubs[i]; return null; }

  function openHub(id, push) {
    var h = hubById(id); if (!h) return goHome(push);
    current = h;
    hubScr.style.setProperty("--tone", h.tone.a); hubScr.style.setProperty("--tone2", h.tone.b);
    $("hubTitle").innerHTML = "<b></b><i></i>"; $("hubTitle").firstChild.textContent = h.fr; $("hubTitle").lastChild.textContent = h.en;
    $("hubTitle").onclick = function () { showWord(h); };
    var grid = $("acts"); grid.innerHTML = "";
    h.activities.forEach(function (a) {
      var built = !!LP.activities[h.id + "/" + a.id];
      var t = el("button", "lp-act" + (built ? "" : " soon")); t.type = "button";
      t.innerHTML = '<span class="lp-act-ic">' + icon(a.emblem) + '</span><span class="lp-act-t"><b></b><i></i><em class="lp-act-s"></em></span>';
      t.querySelector("b").textContent = a.fr; t.querySelector("i").textContent = a.en;
      t.querySelector(".lp-act-s").textContent = built ? "Enter" : "Opening soon";
      t.onclick = function () { showWord(a); if (built) setTimeout(function () { startActivity(h, a); }, 350); };
      grid.appendChild(t);
    });
    if (push) history.pushState({ hub: id }, "", "#" + id);
    home.classList.add("away"); hubScr.hidden = false;
    requestAnimationFrame(function () { hubScr.classList.add("on"); });
    $("backBtnLbl").textContent = "La Pause";
    window.scrollTo(0, 0);
  }
  function goHome(push) {
    current = null; stopClip(); hideWord();
    hubScr.classList.remove("on"); home.classList.remove("away");
    setTimeout(function () { if (!current) hubScr.hidden = true; }, 500);
    if (push) history.pushState({}, "", location.pathname + location.search);
    $("backBtnLbl").textContent = EMBED ? "Back to the game" : "Back to Talkletics";
  }
  function startActivity(h, a) {
    var def = LP.activities[h.id + "/" + a.id];
    if (def && def.start) def.start($("stage"), { hub: h, activity: a, say: showWord, close: function () { openHub(h.id, false); } });
  }
  LP.register = function (hubId, actId, def) { LP.activities[hubId + "/" + actId] = def; };

  function leave() {
    stopClip(); if (music) { try { music.pause(); } catch (e) {} }
    if (EMBED && window.parent !== window) window.parent.postMessage({ lapause: "exit" }, location.origin);
    else location.href = "/talkletics/map.html";
  }
  function back() { if (current) { history.length > 1 && history.state && history.state.hub ? history.back() : goHome(true); } else leave(); }

  /* ---------- the shared music panel: SayBon Music's own library, no duplicate database ---------- */
  var vol = parseFloat(lsGet("lpVol", "0.7")); if (!(vol >= 0 && vol <= 1)) vol = 0.7;
  var tracks = null, shown = [], genre = "All", nowV = null, loading = false;
  function buildMusic() {
    var btn = el("button", "lp-music-btn", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><span class="lp-eq"><i></i><i></i><i></i></span>');
    btn.type = "button"; btn.setAttribute("aria-label", "Music"); btn.id = "musicBtn";
    var panel = el("section", "lp-music", '' +
      '<header><div><b>SayBon Music</b><small id="mNow">Pick something to play</small></div><button type="button" class="lp-m-close" aria-label="Close music">×</button></header>' +
      '<div class="lp-chips" id="mChips"></div><div class="lp-tracks" id="mList"></div>' +
      '<footer><img id="mCover" alt="" hidden><div class="lp-m-ctl"><button type="button" id="mPrev" aria-label="Previous">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg></button>' +
      '<button type="button" id="mPlay" class="big" aria-label="Play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>' +
      '<button type="button" id="mNext" aria-label="Next"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg></button></div>' +
      '<label class="lp-vol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z"/></svg><input id="mVol" type="range" min="0" max="1" step="0.02" aria-label="Volume"></label></footer>');
    panel.hidden = true;
    document.body.appendChild(btn); document.body.appendChild(panel);

    music = document.createElement("video");
    music.setAttribute("playsinline", ""); music.preload = "none"; music.style.display = "none"; music.volume = vol;
    document.body.appendChild(music);
    $("mVol").value = vol;

    function open() { panel.hidden = false; requestAnimationFrame(function () { panel.classList.add("on"); }); btn.classList.add("open"); load(); }
    function close() { panel.classList.remove("on"); btn.classList.remove("open"); setTimeout(function () { if (!panel.classList.contains("on")) panel.hidden = true; }, 300); }
    btn.onclick = function () { panel.classList.contains("on") ? close() : open(); };
    panel.querySelector(".lp-m-close").onclick = close;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("on")) close(); });

    $("mVol").oninput = function () { vol = parseFloat(this.value); music.volume = curRes ? vol * 0.25 : vol; lsSet("lpVol", String(vol)); };
    $("mPlay").onclick = function () { if (!nowV) { if (shown.length) playTrack(shown[0]); } else if (music.paused) music.play().catch(function () {}); else music.pause(); };
    $("mNext").onclick = function () { step(1); };
    $("mPrev").onclick = function () { step(-1); };
    music.onplay = music.onpause = function () { syncUi(); };
    music.onended = function () { if (window.SBM && nowV) SBM.track(nowV, 100); step(1); };
    music.onerror = function () { $("mNow").textContent = "That track could not be played"; syncUi(); };
    window.addEventListener("pagehide", function () { try { music.pause(); } catch (e) {} });
  }
  function load() {
    if (tracks || loading) return;
    loading = true; $("mList").innerHTML = '<p class="lp-m-msg">Loading the library…</p>';
    var get = window.SBM ? SBM.getAll() : Promise.resolve([]);
    get.then(function (all) {
      loading = false;
      tracks = (all || []).filter(function (v) { return v && v.fileUrl; });   /* SayBon-hosted tracks only */
      if (!tracks.length) { tracks = null; $("mList").innerHTML = '<p class="lp-m-msg">The music library is waking up. <button type="button" id="mRetry">Try again</button></p>'; $("mRetry").onclick = load; return; }
      renderChips(); renderList();
    });
  }
  function renderChips() {
    var seen = {}, g = ["All"];
    tracks.forEach(function (v) { if (v.genre && !seen[v.genre]) { seen[v.genre] = 1; g.push(v.genre); } });
    var box = $("mChips"); box.innerHTML = "";
    g.forEach(function (name) {
      var c = el("button", "lp-chip" + (name === genre ? " on" : "")); c.type = "button"; c.textContent = name;
      c.onclick = function () { genre = name; renderChips(); renderList(); };
      box.appendChild(c);
    });
  }
  function renderList() {
    shown = tracks.filter(function (v) { return genre === "All" || v.genre === genre; });
    var box = $("mList"); box.innerHTML = "";
    shown.forEach(function (v) {
      var r = el("button", "lp-track" + (nowV && nowV.id === v.id ? " on" : "")); r.type = "button";
      r.innerHTML = '<span class="lp-cov"></span><span class="lp-tt"><b></b><i></i></span>';
      r.querySelector("b").textContent = v.title || "Untitled"; r.querySelector("i").textContent = v.artist || v.genre || "";
      if (v.thumbnailUrl) r.querySelector(".lp-cov").style.backgroundImage = "url(\"" + String(v.thumbnailUrl).replace(/"/g, "%22") + "\")";
      r.onclick = function () { playTrack(v); };
      box.appendChild(r);
    });
  }
  function playTrack(v) {
    nowV = v; music.src = v.fileUrl; music.volume = curRes ? vol * 0.25 : vol;
    var p = music.play(); if (p && p.catch) p.catch(function () {});
    if (window.SBM) SBM.track(v);
    $("mNow").textContent = (v.title || "Untitled") + (v.artist ? " · " + v.artist : "");
    var cv = $("mCover"); if (v.thumbnailUrl) { cv.src = v.thumbnailUrl; cv.hidden = false; } else cv.hidden = true;
    if (tracks) renderList();
    syncUi();
  }
  function step(d) {
    if (!shown.length) return;
    var i = -1; for (var k = 0; k < shown.length; k++) if (nowV && shown[k].id === nowV.id) i = k;
    playTrack(shown[(i + d + shown.length) % shown.length]);
  }
  function syncUi() {
    var playing = music && !music.paused && !music.ended;
    $("musicBtn").classList.toggle("playing", !!playing);
    $("mPlay").innerHTML = playing ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    $("mPlay").setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  /* ---------- start ---------- */
  function init() {
    home = $("home"); hubScr = $("hubScreen");
    buildHome(); buildMusic();
    $("backBtn").onclick = back;
    $("backBtnLbl").textContent = EMBED ? "Back to the game" : "Back to Talkletics";
    window.addEventListener("popstate", function (e) {
      var id = (e.state && e.state.hub) || location.hash.slice(1);
      if (id && hubById(id)) openHub(id, false); else goHome(false);
    });
    var start = location.hash.slice(1);
    if (start && hubById(start)) { history.replaceState({ hub: start }, ""); openHub(start, false); }
    document.body.classList.add("ready");
    if (EMBED && window.parent !== window) window.parent.postMessage({ lapause: "ready" }, location.origin);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
