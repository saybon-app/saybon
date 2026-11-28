/* La Pause invitation for Talkletics.
   The game calls `await window.laPause.safeMoment()` only between two items
   (nothing is playing, nothing is being recorded). It resolves when the learner
   is back and the game can carry on. Nothing in the game is touched or reset. */
(function () {
  "use strict";
  if (window.laPause) return;

  var DEF = {
    minPlayMinutes: 3, minItems: 1, declineCooldownMinutes: 25, afterVisitCooldownMinutes: 30,
    headline: "YOU'RE DOING SO WELL!", sub: "Fancy a little break?",
    accept: "VISIT LA PAUSE", decline: "Maybe later",
    spoken: "You're doing so well! I think you could use a little break. Would you like to visit La Pause?",
    audio: "/assets/audio/la-pause/invitation/invite_welcome.mp3"
  };
  var CFG = DEF;
  var cfgReady = fetch("/la-pause/config.json?v=2").then(function (r) { return r.json(); })
    .then(function (j) { CFG = Object.assign({}, DEF, j && j.invite); }).catch(function () {});

  var KEY = "lpState", lastCall = Date.now(), busy = false;
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function force() { try { return localStorage.getItem("lpForce") === "1"; } catch (e) { return false; } }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* a first tap anywhere (the Start button) lets this page play sound later, even on phones */
  var voice = new Audio(), unlocked = false,
      SIL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      voice.src = SIL;
      var p = voice.play();
      if (p && p.catch) p.catch(function () { unlocked = false; });
    } catch (e) {}
    document.removeEventListener("pointerdown", unlock, true);
  }
  document.addEventListener("pointerdown", unlock, true);

  function fonts() {
    if (document.getElementById("lpiFonts")) return;
    var l = el("link");
    l.id = "lpiFonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Cormorant+Garamond:ital,wght@1,600&family=Poppins:wght@500;600&display=swap";
    document.head.appendChild(l);
    var c = el("link");
    c.rel = "stylesheet"; c.href = "/la-pause/invite.css?v=2";
    document.head.appendChild(c);
    return new Promise(function (res) { c.onload = c.onerror = res; setTimeout(res, 1500); });
  }

  /* ---------- the scene: a lit pavilion at dusk, drawn entirely in vector ---------- */
  function scene() {
    var i, stripes = "", scal = "", bulbs = "", cobbles = "", motes = "", pend = "";
    for (i = 0; i < 12; i++) {
      var x = 130 + i * 45, f = i % 2 ? "url(#lpiCream)" : "url(#lpiTeal2)";
      stripes += '<rect x="' + x + '" y="214" width="45.5" height="44" fill="' + f + '"/>';
      scal += '<path d="M' + x + ' 258 a22.5 22.5 0 0 0 45 0 Z" fill="' + f + '"/>';
      bulbs += '<circle class="lpi-bulb" style="animation-delay:' + (-(i * 0.37) % 2.6).toFixed(2) + 's" cx="' + (x + 22.5) +
        '" cy="287" r="4.2" fill="#ffe9a6"/><circle cx="' + (x + 22.5) + '" cy="287" r="11" fill="url(#lpiBulbGlow)"/>';
    }
    for (i = 0; i < 7; i++) {
      cobbles += '<path d="M' + (292 + i * 31) + ' 652 L' + (192 + i * 69) + ' 750" stroke="#8b6d44" stroke-opacity=".28" stroke-width="1.2" fill="none"/>';
    }
    for (i = 0; i < 5; i++) {
      var yy = 668 + i * 20;
      cobbles += '<path d="M' + (284 - (yy - 652) * 1.01) + ' ' + yy + ' H' + (516 + (yy - 652) * 1.01) + '" stroke="#8b6d44" stroke-opacity=".26" stroke-width="1.2"/>';
    }
    for (i = 0; i < 12; i++) {
      motes += '<circle class="lpi-mote" style="animation-delay:' + (-(i * 0.6)).toFixed(1) + 's;animation-duration:' + (5 + (i % 4)) +
        's" cx="' + (330 + (i * 37) % 140) + '" cy="' + (560 - (i * 23) % 90) + '" r="' + (1.4 + (i % 3) * 0.5) + '" fill="#fff3c4"/>';
    }
    pend = '<g stroke="#caa24a" stroke-width="2"><line x1="352" y1="372" x2="352" y2="408"/><line x1="448" y1="372" x2="448" y2="396"/></g>' +
      '<g><path d="M334 408 a18 15 0 0 1 36 0 Z" fill="url(#lpiGold)"/><circle cx="352" cy="410" r="9" fill="#fffbe6"/><circle cx="352" cy="412" r="26" fill="url(#lpiBulbGlow)"/>' +
      '<path d="M430 396 a18 15 0 0 1 36 0 Z" fill="url(#lpiGold)"/><circle cx="448" cy="398" r="9" fill="#fffbe6"/><circle cx="448" cy="400" r="26" fill="url(#lpiBulbGlow)"/></g>';

    function lantern(cx, delay, rope) {
      return '<g>' + (rope ? '<path d="M' + cx + ' 452 V474" stroke="#caa24a" stroke-width="2" stroke-dasharray="2 2"/><circle cx="' + cx + '" cy="474" r="3" fill="#d9a940"/>' : '') +
        '<line x1="' + cx + '" y1="360" x2="' + cx + '" y2="392" stroke="#caa24a" stroke-width="3"/>' +
        '<path d="M' + (cx - 14) + ' 392 h28 l-4 54 h-20 Z" fill="url(#lpiGold)"/>' +
        '<rect x="' + (cx - 10) + '" y="398" width="20" height="42" rx="3" fill="#fff3c9" opacity=".95"/>' +
        '<ellipse class="lpi-flame" style="animation-delay:' + delay + 's" cx="' + cx + '" cy="420" rx="5" ry="9" fill="#ffb347"/>' +
        '<circle cx="' + cx + '" cy="420" r="40" fill="url(#lpiBulbGlow)"/>' +
        '<path d="M' + (cx - 16) + ' 446 h32 l-3 6 h-26 Z" fill="#8f6a1c"/></g>';
    }
    function planter(cx) {
      return '<g><ellipse cx="' + cx + '" cy="650" rx="40" ry="7" fill="#000" opacity=".25"/>' +
        '<circle cx="' + cx + '" cy="590" r="36" fill="url(#lpiBush)"/>' +
        '<ellipse cx="' + (cx - 12) + '" cy="578" rx="9" ry="13" fill="#fff" opacity=".18" transform="rotate(-25 ' + (cx - 12) + ' 578)"/>' +
        '<rect x="' + (cx - 6) + '" y="620" width="12" height="14" fill="#6b4a2a"/>' +
        '<path d="M' + (cx - 30) + ' 630 h60 l-8 22 h-44 Z" fill="url(#lpiPot)"/>' +
        '<rect x="' + (cx - 34) + '" y="624" width="68" height="10" rx="4" fill="url(#lpiPot)"/></g>';
    }

    var defs =
      '<radialGradient id="lpiAura" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ffd890" stop-opacity=".75"/><stop offset=".6" stop-color="#ffb866" stop-opacity=".22"/><stop offset="1" stop-color="#ffb866" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="lpiTeal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b6b80"/><stop offset="1" stop-color="#0a3a4a"/></linearGradient>' +
      '<linearGradient id="lpiTeal2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a8aa1"/><stop offset="1" stop-color="#145a6e"/></linearGradient>' +
      '<linearGradient id="lpiCream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e8dcc4"/></linearGradient>' +
      '<linearGradient id="lpiStone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8cbb0"/><stop offset=".35" stop-color="#fbf4e4"/><stop offset="1" stop-color="#cdbf9f"/></linearGradient>' +
      '<linearGradient id="lpiGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#d9a940"/><stop offset="1" stop-color="#8f6a1c"/></linearGradient>' +
      '<linearGradient id="lpiRib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf5"/><stop offset="1" stop-color="#f1e5c8"/></linearGradient>' +
      '<linearGradient id="lpiInside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c4"/><stop offset=".45" stop-color="#ffcf7e"/><stop offset="1" stop-color="#f09a4a"/></linearGradient>' +
      '<linearGradient id="lpiFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0"/><stop offset="1" stop-color="#e9a65a"/></linearGradient>' +
      '<linearGradient id="lpiPath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d9a0"/><stop offset="1" stop-color="#b89560"/></linearGradient>' +
      '<radialGradient id="lpiBulbGlow"><stop offset="0" stop-color="#ffe9a6" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a6" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="lpiBush" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#8fd36c"/><stop offset=".6" stop-color="#3b8f45"/><stop offset="1" stop-color="#1c5a2e"/></radialGradient>' +
      '<linearGradient id="lpiPot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1eadf"/><stop offset=".6" stop-color="#d4c9b5"/><stop offset="1" stop-color="#a99c86"/></linearGradient>' +
      '<radialGradient id="lpiSpill" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffe3a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="lpiArch"><path d="M290 650 V440 A110 110 0 0 1 510 440 V650 Z"/></clipPath>';

    return '<svg class="lpi-svg" viewBox="0 0 800 760" role="img" aria-label="The entrance to La Pause" preserveAspectRatio="xMidYMax meet"><defs>' + defs + '</defs>' +
      '<ellipse cx="400" cy="420" rx="420" ry="360" fill="url(#lpiAura)"/>' +
      '<ellipse cx="400" cy="746" rx="360" ry="16" fill="#000" opacity=".28"/>' +
      '<path d="M270 650 L530 650 L650 756 L150 756 Z" fill="url(#lpiPath)"/>' + cobbles +
      '<ellipse cx="400" cy="668" rx="210" ry="70" fill="url(#lpiSpill)" opacity=".85"/>' +
      '<rect x="112" y="150" width="576" height="500" rx="10" fill="url(#lpiTeal)"/>' +
      '<g opacity=".16" stroke="#fff" stroke-width="1"><path d="M112 300 H688M112 380 H688M112 460 H688M112 540 H688M112 620 H688"/></g>' +
      '<rect x="104" y="140" width="592" height="16" rx="6" fill="url(#lpiStone)"/>' +
      '<g><rect x="104" y="156" width="34" height="494" fill="url(#lpiStone)"/><rect x="662" y="156" width="34" height="494" fill="url(#lpiStone)"/>' +
      '<g stroke="#b9a981" stroke-opacity=".55" stroke-width="1.2"><path d="M114 160V648M124 160V648M132 160V648M668 160V648M676 160V648M686 160V648"/></g>' +
      '<rect x="98" y="640" width="46" height="14" rx="3" fill="url(#lpiStone)"/><rect x="656" y="640" width="46" height="14" rx="3" fill="url(#lpiStone)"/></g>' +
      '<g><rect x="262" y="160" width="276" height="46" rx="9" fill="url(#lpiGold)"/><rect x="267" y="165" width="266" height="36" rx="6" fill="#0d4254"/>' +
      '<text x="400" y="192" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-weight="600" font-size="30" letter-spacing="6" fill="#f8dc8a">La Pause</text></g>' +
      '<g class="lpi-awn">' + stripes + scal +
      '<rect x="130" y="214" width="540" height="6" fill="#fff" opacity=".35"/><ellipse cx="400" cy="284" rx="290" ry="9" fill="#000" opacity=".16"/>' + bulbs + '</g>' +
      '<path d="M272 650 V440 A128 128 0 0 1 528 440 V650" fill="none" stroke="url(#lpiStone)" stroke-width="22"/>' +
      '<path d="M283 650 V440 A117 117 0 0 1 517 440 V650" fill="none" stroke="url(#lpiGold)" stroke-width="3"/>' +
      '<g clip-path="url(#lpiArch)"><g class="lpi-door"><path d="M290 650 V440 A110 110 0 0 1 510 440 V650 Z" fill="url(#lpiInside)"/>' +
      '<polygon points="400,330 250,650 330,650" fill="#fff" opacity=".13"/><polygon points="400,330 470,650 560,650" fill="#fff" opacity=".1"/><polygon points="400,330 380,650 420,650" fill="#fff" opacity=".12"/>' +
      '<rect x="290" y="574" width="220" height="76" fill="url(#lpiFloor)"/><ellipse cx="400" cy="602" rx="90" ry="12" fill="#fff" opacity=".4"/></g>' + pend +
      '<g opacity=".9"><path d="M300 610 q-14 -40 8 -62 q10 18 4 62 Z" fill="#2c7a45"/><path d="M312 612 q6 -44 30 -58 q2 28 -14 58 Z" fill="#3b9055"/><rect x="302" y="606" width="24" height="26" rx="4" fill="#d9cdb6"/></g>' +
      '<g opacity=".82"><rect x="440" y="548" width="62" height="64" rx="5" fill="#8d5b32" opacity=".5"/><rect x="448" y="556" width="46" height="9" rx="2" fill="#fff4cf" opacity=".7"/><rect x="448" y="574" width="46" height="9" rx="2" fill="#fff4cf" opacity=".55"/></g>' +
      motes + '<g stroke="#f4e6c1" stroke-width="3" fill="none" opacity=".75"><path d="M400 330 V650"/><path d="M290 450 H510"/><path d="M290 560 H510"/></g></g>' +
      lantern(174, 0, false) + lantern(626, -0.8, true) + planter(176) + planter(624) +
      '<g class="lpi-ribbon"><path d="M92 26 H708 L688 70 L708 114 H92 L112 70 Z" fill="#0a2f3c" opacity=".35" transform="translate(0 5)"/>' +
      '<path d="M92 24 H708 L688 68 L708 112 H92 L112 68 Z" fill="url(#lpiRib)" stroke="url(#lpiGold)" stroke-width="3"/>' +
      '<path d="M92 24 L64 40 L92 56 Z M708 24 L736 40 L708 56 Z" fill="#d9c9a0"/><path d="M112 34 H688 M112 102 H688" stroke="#d9a940" stroke-width="1" opacity=".7"/></g>' +
      '</svg>';
  }

  /* ---------- timing ---------- */
  function due(s, now) {
    if (force()) return true;
    if (s.coolUntil && now < s.coolUntil) return false;
    return (s.items || 0) >= CFG.minItems && (s.playMs || 0) >= CFG.minPlayMinutes * 60000;
  }
  function gateOpen() { var g = document.getElementById("gateBox"); return g && !g.hidden; }

  function safeMoment() {
    var now = Date.now(), s = load();
    var gap = Math.min(now - lastCall, 180000);
    lastCall = now;
    if (!document.hidden) s.playMs = (s.playMs || 0) + gap;
    s.items = (s.items || 0) + 1;
    save(s);
    if (busy || document.hidden || gateOpen()) return Promise.resolve(false);
    return cfgReady.then(function () {
      if (!due(s, Date.now())) return false;
      return run();
    });
  }
  /* shows the invitation and records the answer (used by the timer and by the side button) */
  function run() {
    busy = true;
    return offer().then(function (ans) {
      var t = Date.now(), st = load();
      if (ans === "accept") { st.coolUntil = t + CFG.afterVisitCooldownMinutes * 60000; st.playMs = 0; st.items = 0; }
      else { st.coolUntil = t + CFG.declineCooldownMinutes * 60000; }
      save(st);
      lastCall = Date.now();
      busy = false;
      return ans === "accept";
    }, function () { busy = false; return false; });
  }

  /* ---------- small side button: open the invitation any time ---------- */
  function sideButton() {
    if (document.getElementById("lpiSide")) return;
    var b = document.createElement("button");
    b.id = "lpiSide"; b.type = "button"; b.className = "lpi-side";
    b.setAttribute("aria-label", "La Pause"); b.title = "La Pause";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l2-5h14l2 5M3 9h18M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5"/></svg>';
    if (!document.querySelector('link[href^="/la-pause/invite.css"]')) { var c = document.createElement("link"); c.rel = "stylesheet"; c.href = "/la-pause/invite.css?v=2"; document.head.appendChild(c); }
    b.onclick = function () {
      if (busy || gateOpen()) return;
      cfgReady.then(function () { if (!busy) run(); });
    };
    document.body.appendChild(b);
  }
  if (document.body) sideButton(); else document.addEventListener("DOMContentLoaded", sideButton);

  /* ---------- the invitation ---------- */
  function offer() {
    return Promise.resolve(fonts()).then(function () {
      return new Promise(function (resolve) {
        var root = el("div", "lpi-root"), dim = el("div", "lpi-dim"), stage = el("div", "lpi-stage"), sc = el("div", "lpi-scene");
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-label", "A little break at La Pause");
        sc.innerHTML = scene();
        var msg = el("div", "lpi-msg", "<b></b><i></i>");
        msg.firstChild.textContent = CFG.headline;
        msg.lastChild.textContent = CFG.sub;
        var hit = el("button", "lpi-hit"); hit.type = "button"; hit.setAttribute("aria-label", CFG.accept);
        var cta = el("button", "lpi-cta"); cta.type = "button"; cta.textContent = CFG.accept;
        var tag = el("div", "lpi-tag"), later = el("button"); later.type = "button"; later.textContent = CFG.decline; tag.appendChild(later);
        var spk = el("button", "lpi-speak", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>');
        spk.type = "button"; spk.setAttribute("aria-label", "Hear the invitation again");
        [msg, hit, cta, tag, spk].forEach(function (n) { sc.appendChild(n); });
        var flash = el("div", "lpi-flash");
        stage.appendChild(sc); root.appendChild(dim); root.appendChild(stage); root.appendChild(flash);
        document.body.appendChild(root);

        var played = false, done = false;
        function speak(again) {
          if (played && !again) return;
          played = true;
          try { voice.onerror = null; voice.src = CFG.audio; var p = voice.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
        }
        function stopVoice() { try { voice.pause(); } catch (e) {} }
        function end(ans) {
          if (done) return;
          done = true;
          stopVoice();
          document.removeEventListener("keydown", onKey, true);
          if (ans === "later") {
            root.classList.add("out");
            sleep(1400).then(function () { root.remove(); resolve("later"); });
          } else {
            root.classList.add("enter");
            sleep(1500).then(function () { return openWorld(root); }).then(function () { resolve("accept"); });
          }
        }
        function onKey(e) { if (e.key === "Escape") { e.preventDefault(); end("later"); } }
        document.addEventListener("keydown", onKey, true);
        hit.onclick = cta.onclick = function () { end("accept"); };
        later.onclick = function () { end("later"); };
        spk.onclick = function () { speak(true); };

        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("in"); }); });
        sleep(1500).then(function () { if (!done) { speak(); try { cta.focus({ preventScroll: true }); } catch (e) {} } });
      });
    });
  }

  /* La Pause itself opens on top of the waiting game; the game loop is simply paused until it closes */
  function openWorld(inviteRoot) {
    return new Promise(function (resolve) {
      var w = el("div", "lpi-world"), f = el("iframe"), back = el("button", "lpi-back");
      back.type = "button"; back.textContent = "Back to the game";
      f.title = "La Pause"; f.setAttribute("allow", "autoplay"); f.src = "/la-pause/?embed=1";
      w.appendChild(f); w.appendChild(back); document.body.appendChild(w);
      var closed = false, ready = false;
      function close() {
        if (closed) return;
        closed = true;
        window.removeEventListener("message", onMsg);
        w.classList.remove("on");
        sleep(800).then(function () { w.remove(); if (inviteRoot) inviteRoot.remove(); resolve(); });
      }
      function onMsg(e) {
        if (e.origin !== location.origin || !e.data) return;
        if (e.data.lapause === "ready") ready = true;
        if (e.data.lapause === "exit") close();
      }
      window.addEventListener("message", onMsg);
      back.onclick = close;
      f.onload = function () { w.classList.add("on"); setTimeout(function () { if (inviteRoot) inviteRoot.style.visibility = "hidden"; }, 900); };
      /* La Pause has its own exit; this button only appears if the world fails to load */
      setTimeout(function () { if (!closed && !ready) w.classList.add("slow"); }, 4000);
      setTimeout(function () { if (!closed) w.classList.add("on"); }, 9000);
    });
  }

  window.laPause = { safeMoment: safeMoment, _offer: function () { return offer(); } };
})();
