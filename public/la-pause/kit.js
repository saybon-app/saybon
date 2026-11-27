/* La Pause kit: activity shell, vocabulary lookup and the engines. Activities are described in vocab/<hub>.json;
   an activity that names an `engine` in data.js is registered here automatically. No scores, timers or penalties anywhere. */
(function () {
  "use strict";
  var LP = window.LP, D = window.LP_DATA, ENG = {}, cache = {}, manifest = null;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- vocabulary: the manifest decides which file each French text uses (identical text = one file) ---------- */
  function loadManifest() {
    if (manifest) return Promise.resolve(manifest);
    return fetch("/la-pause/manifest.json?v=1").then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
      .then(function (m) { manifest = m.clips || {}; return manifest; });
  }
  function clip(h, a, fr) {
    var pre = h.id.replace(/-/g, "_") + "_" + a.id;
    return (manifest && manifest[fr]) || LP.audioPath(h.folder, pre, fr);
  }
  function word(h, a, o) { return { fr: o.fr, en: o.en || "", audio: clip(h, a, o.fr) }; }
  function loadHub(h) {
    if (cache[h.id]) return cache[h.id];
    return (cache[h.id] = Promise.all([fetch("/la-pause/vocab/" + h.id + ".json?v=1").then(function (r) { if (!r.ok) throw 0; return r.json(); }), loadManifest()])
      .then(function (r) { return r[0]; }).catch(function () { delete cache[h.id]; return null; }));
  }
  LP.kit = { el: el, word: word, loadHub: loadHub, clip: clip, engines: ENG };

  /* ---------- shell: full-screen activity with its own back button ---------- */
  function shell(h, a, theme, api) {
    var root = el("section", "lp-as lp-scene-" + theme);
    root.style.setProperty("--tone", h.tone.a); root.style.setProperty("--tone2", h.tone.b);
    root.innerHTML = '<header class="lp-as-top"><button type="button" class="lp-as-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg><span></span></button>' +
      '<button type="button" class="lp-as-title"><b></b><i></i></button></header><div class="lp-as-body"></div>';
    root.querySelector(".lp-as-back span").textContent = h.fr;
    root.querySelector(".lp-as-title b").textContent = a.fr; root.querySelector(".lp-as-title i").textContent = a.en;
    root.querySelector(".lp-as-title").onclick = function () { api.say(a); };
    function close() { document.body.classList.remove("lp-in-act"); document.removeEventListener("keydown", esc); LP.audio.stop(); root.classList.remove("on"); setTimeout(function () { root.remove(); }, 260); api.close(); }
    function esc(e) { if (e.key === "Escape") close(); }
    root.querySelector(".lp-as-back").onclick = close;
    document.addEventListener("keydown", esc);
    document.body.classList.add("lp-in-act"); document.getElementById("stage").appendChild(root);
    requestAnimationFrame(function () { root.classList.add("on"); });
    return { root: root, body: root.querySelector(".lp-as-body"), close: close };
  }
  LP.kit.shell = shell;

  /* ---------- engine: explore (see it, click it, hear it) ---------- */
  ENG.explore = function (h, a, def, api) {
    var sh = shell(h, a, def.scene || "boutique", api), seen = {};
    if (def.intro) {
      var intro = el("button", "lp-intro"); intro.type = "button";
      intro.innerHTML = "<b></b><i></i>"; intro.firstChild.textContent = def.intro.fr; intro.lastChild.textContent = def.intro.en;
      intro.onclick = function () { api.say(word(h, a, def.intro)); };
      sh.body.appendChild(intro);
    }
    var wrap = el("div", "lp-shelves"); sh.body.appendChild(wrap);
    def.rows.forEach(function (row) {
      var r = el("div", "lp-shelf");
      var tag = el("button", "lp-shelf-tag"); tag.type = "button"; tag.innerHTML = "<b></b><i></i>";
      tag.firstChild.textContent = row.label.fr; tag.lastChild.textContent = row.label.en;
      tag.onclick = function () { api.say(word(h, a, row.label)); };
      var line = el("div", "lp-shelf-items");
      row.items.forEach(function (it) {
        var b = el("button", "lp-obj"); b.type = "button";
        b.innerHTML = '<span class="lp-obj-art">' + LP.art(it.art, it.color || LP.artDefault[it.art]) + '</span><span class="lp-obj-name"></span>';
        b.querySelector(".lp-obj-name").textContent = it.fr;
        b.setAttribute("aria-label", it.fr + " — " + it.en);
        b.onclick = function () {
          api.say(word(h, a, it)); seen[it.fr] = 1; b.classList.add("seen");
          b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
        };
        line.appendChild(b);
      });
      r.appendChild(tag); r.appendChild(line); r.appendChild(el("div", "lp-board"));
      wrap.appendChild(r);
    });
  };

  /* ---------- scenes: LP.scenes[name](k) -> {bg, parts[]}; rendered whole, or as ghost/placed layers ---------- */
  function sceneSvg(name, layers) {
    var f = LP.scenes && LP.scenes[name]; if (!f) return "";
    var k = LP.artCtx(), s = f(k);
    var body = s.bg + s.parts.map(function (p) { return layers ? '<g class="lp-part lp-ghost" data-id="' + p.id + '">' + p.svg + "</g>" : p.svg; }).join("");
    return '<svg class="lp-scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img"><defs>' + k.defs() + "</defs>" + body + "</svg>";
  }
  function thumb(name, id) {
    var k = LP.artCtx(), s = LP.scenes[name](k), part = null, host, svg, bb, pad = 6;
    s.parts.forEach(function (p) { if (p.id === id) part = p; });
    if (!part) return "";
    host = el("div"); host.style.cssText = "position:absolute;left:-9999px;top:0;width:400px;height:300px;visibility:hidden";
    host.innerHTML = '<svg viewBox="0 0 400 300" width="400" height="300"><defs>' + k.defs() + '</defs><g>' + part.svg + "</g></svg>";
    document.body.appendChild(host);
    try { bb = host.querySelector("g").getBBox(); } catch (e) { bb = { x: 0, y: 0, width: 400, height: 300 }; }
    host.remove();
    if (!bb.width || !bb.height) bb = { x: 0, y: 0, width: 400, height: 300 };
    return '<svg viewBox="' + [bb.x - pad, bb.y - pad, bb.width + pad * 2, bb.height + pad * 2].map(function (v) { return Math.round(v * 10) / 10; }).join(" ") + '" aria-hidden="true"><defs>' + k.defs() + "</defs>" + part.svg + "</svg>";
  }
  LP.kit.sceneSvg = sceneSvg; LP.kit.thumb = thumb;
  function sparkle(host) {
    var b = el("div", "lp-sparkle"), i;
    for (i = 0; i < 16; i++) { var s = el("i"); s.style.setProperty("--a", (i * 22.5) + "deg"); s.style.setProperty("--d", (70 + (i % 3) * 36) + "px"); s.style.animationDelay = (i % 4) * 40 + "ms"; b.appendChild(s); }
    host.appendChild(b); setTimeout(function () { b.remove(); }, 1800);
  }
  LP.kit.sparkle = sparkle;

  /* ---------- engine: build (pick a part from the tray, it flies into place) ---------- */
  ENG.build = function (h, a, def, api) {
    var sh = shell(h, a, def.theme || "workshop", api), placed = {}, count = 0, total = def.parts.length, timer = 0;
    if (def.intro) {
      var intro = el("button", "lp-intro"); intro.type = "button";
      intro.innerHTML = "<b></b><i></i>"; intro.firstChild.textContent = def.intro.fr; intro.lastChild.textContent = def.intro.en;
      intro.onclick = function () { api.say(word(h, a, def.intro)); };
      sh.body.appendChild(intro);
    }
    var wrap = el("div", "lp-build"), stage = el("div", "lp-bstage"), tray = el("div", "lp-tray"), again = el("button", "lp-again", "Encore !");
    again.type = "button"; again.hidden = true;
    stage.innerHTML = sceneSvg(def.scene, true); stage.appendChild(again);
    wrap.appendChild(stage); wrap.appendChild(tray); sh.body.appendChild(wrap);
    var btns = {};
    def.parts.forEach(function (p) {
      var b = el("button", "lp-piece"); b.type = "button";
      b.innerHTML = '<span class="lp-piece-art">' + thumb(def.scene, p.id) + '</span><span class="lp-piece-name"></span>';
      b.querySelector(".lp-piece-name").textContent = p.fr; b.setAttribute("aria-label", p.fr + " — " + p.en);
      b.onclick = function () { pick(p); }; btns[p.id] = b; tray.appendChild(b);
    });
    function layer(id) { return stage.querySelector('[data-id="' + id + '"]'); }
    function pick(p) {
      var g = layer(p.id); if (!g) return;
      api.say(word(h, a, p));
      if (placed[p.id]) { g.classList.remove("lp-drop"); void g.getBoundingClientRect(); g.classList.add("lp-drop"); return; }
      placed[p.id] = 1; count++; g.classList.remove("lp-ghost"); g.classList.add("lp-drop"); btns[p.id].classList.add("done");
      if (count === total) finish();
    }
    function finish() {
      timer = setTimeout(function () { sparkle(stage); if (def.done) api.say(word(h, a, def.done)); again.hidden = false; }, 1500);
    }
    stage.addEventListener("click", function (e) {
      var g = e.target.closest && e.target.closest(".lp-part"); if (!g) return;
      var id = g.getAttribute("data-id"); def.parts.forEach(function (p) { if (p.id === id) pick(p); });
    });
    again.onclick = function () {
      clearTimeout(timer); placed = {}; count = 0; again.hidden = true;
      stage.querySelectorAll(".lp-part").forEach(function (g) { g.classList.remove("lp-drop"); g.classList.add("lp-ghost"); });
      def.parts.forEach(function (p) { btns[p.id].classList.remove("done"); });
    };
  };

  /* ---------- register every activity that names an engine ---------- */
  D.hubs.forEach(function (h) {
    h.activities.forEach(function (a) {
      if (!a.engine) return;
      LP.register(h.id, a.id, { start: function (container, api) {
        loadHub(h).then(function (data) {
          var def = data && data.activities && data.activities[a.id];
          if (!def || !ENG[a.engine]) { api.say({ fr: "Bientôt !", en: "Coming soon" }); return; }
          ENG[a.engine](h, a, def, api);
        });
      }});
    });
  });
})();
