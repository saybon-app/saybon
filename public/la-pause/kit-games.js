/* La Pause kit, Mind Games: jigsaw, memory, words, pattern. No scores, timers or penalties: a wrong choice just wiggles.
   Needs kit.js (shell, word, sceneSvg, sparkle) and art.js (LP.artCtx). */
(function () {
  "use strict";
  var LP = window.LP, K = LP.kit, el = K.el, word = K.word, ENG = K.engines;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wiggle(n) { n.classList.remove("lp-wig"); void n.offsetWidth; n.classList.add("lp-wig"); }
  function intro(sh, h, a, def, api) {
    if (!def.intro) return null;
    var b = el("button", "lp-intro"); b.type = "button"; b.innerHTML = "<b></b><i></i>";
    b.firstChild.textContent = def.intro.fr; b.lastChild.textContent = def.intro.en;
    b.onclick = function () { api.say(word(h, a, def.intro)); }; sh.body.appendChild(b); return b;
  }
  function nextBtn(label, fn) { var b = el("button", "lp-next", "<span></span><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='9 6 15 12 9 18'/></svg>"); b.type = "button"; b.firstChild.textContent = label; b.hidden = true; b.onclick = fn; return b; }
  function strip(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  K.shuffle = shuffle;

  /* ---------------- jigsaw: pictures from the scene library ---------------- */
  ENG.jigsaw = function (h, a, def, api) {
    var sh = K.shell(h, a, "mind", api), cur = null, nxt;
    intro(sh, h, a, def, api);
    var pick = el("div", "lp-jpick"), wrap = el("div", "lp-jwrap"), board = el("div", "lp-jboard"), tray = el("div", "lp-jtray");
    nxt = nextBtn("Suivant", function () { load((cur + 1) % def.items.length); });
    var thumbs = def.items.map(function (it, i) {
      var b = el("button", "lp-jthumb"); b.type = "button"; b.innerHTML = '<span class="lp-jt-art">' + K.sceneSvg(it.scene, false) + '</span><span class="lp-jt-n"></span>';
      b.querySelector(".lp-jt-n").textContent = it.fr; b.setAttribute("aria-label", it.fr + " — " + it.en);
      b.onclick = function () { api.say(word(h, a, it)); load(i); }; pick.appendChild(b); return b;
    });
    wrap.appendChild(board); wrap.appendChild(nxt); sh.body.appendChild(pick); sh.body.appendChild(wrap); sh.body.appendChild(tray);
    function pieceSvg(scene, c, r, cols, rows) {
      var s = K.sceneSvg(scene, false), w = 400 / cols, hh = 300 / rows;
      return s.replace('viewBox="0 0 400 300"', 'viewBox="' + (c * w) + " " + (r * hh) + " " + w + " " + hh + '"').replace('preserveAspectRatio="xMidYMid meet"', 'preserveAspectRatio="none"');
    }
    function load(i) {
      cur = i; var it = def.items[i], g = it.grid || [3, 2], cols = g[0], rows = g[1], sel = null, left = cols * rows;
      thumbs.forEach(function (t, j) { t.classList.toggle("on", j === i); });
      nxt.hidden = true; board.className = "lp-jboard"; board.innerHTML = ""; tray.innerHTML = "";
      board.style.setProperty("--cols", cols); board.style.setProperty("--rows", rows);
      var ref = el("div", "lp-jref", K.sceneSvg(it.scene, false)); board.appendChild(ref);
      var pieces = [], r, c;
      for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) (function (r, c) {
        var cell = el("button", "lp-jcell"); cell.type = "button"; cell.style.gridColumn = c + 1; cell.style.gridRow = r + 1;
        cell.setAttribute("aria-label", "slot " + (r * cols + c + 1));
        cell.onclick = function () {
          if (cell.classList.contains("on")) return;
          if (!sel) { wiggle(cell); return; }
          if (sel.r === r && sel.c === c) {
            cell.innerHTML = sel.svg; cell.classList.add("on", "lp-drop"); sel.btn.remove(); sel = null; left--;
            if (!left) done();
          } else { wiggle(cell); wiggle(sel.btn); }
        };
        board.appendChild(cell);
        var pb = el("button", "lp-jpiece"); pb.type = "button"; pb.style.aspectRatio = (400 / cols) + "/" + (300 / rows);
        var svg = pieceSvg(it.scene, c, r, cols, rows); pb.innerHTML = svg;
        pb.onclick = function () { if (sel && sel.btn === pb) { pb.classList.remove("sel"); sel = null; return; } if (sel) sel.btn.classList.remove("sel"); sel = { r: r, c: c, svg: svg, btn: pb }; pb.classList.add("sel"); };
        pieces.push(pb);
      })(r, c);
      shuffle(pieces).forEach(function (p) { tray.appendChild(p); });
    }
    function done() {
      board.classList.add("whole"); K.sparkle(board);
      setTimeout(function () { api.say(word(h, a, def.items[cur])); nxt.hidden = false; }, 500);
    }
    load(0);
  };

  /* ---------------- memory: picture <-> word pairs ---------------- */
  ENG.memory = function (h, a, def, api) {
    var sh = K.shell(h, a, "mind", api), si = 0, first = null, lock = false, left = 0;
    intro(sh, h, a, def, api);
    var title = el("button", "lp-mtitle"); title.type = "button"; title.innerHTML = "<b></b><i></i>";
    var grid = el("div", "lp-mgrid"), nxt = nextBtn("Encore !", function () { load((si + 1) % def.sets.length); });
    sh.body.appendChild(title); sh.body.appendChild(grid); sh.body.appendChild(nxt);
    function card(pair, kind) {
      var b = el("button", "lp-mcard"); b.type = "button";
      b.innerHTML = '<span class="lp-mc-in"><span class="lp-mc-back"></span><span class="lp-mc-front ' + kind + '"></span></span>';
      var f = b.querySelector(".lp-mc-front");
      if (kind === "pic") f.innerHTML = LP.art(pair.art, LP.artDefault[pair.art]); else f.textContent = pair.fr;
      b.setAttribute("aria-label", "card");
      b.pair = pair; return b;
    }
    function load(i) {
      si = i; var set = def.sets[i]; first = null; lock = false; left = set.pairs.length; nxt.hidden = true; grid.innerHTML = "";
      title.firstChild.textContent = set.title.fr; title.lastChild.textContent = set.title.en; title.onclick = function () { api.say(word(h, a, set.title)); };
      var cards = [];
      set.pairs.forEach(function (p) { cards.push(card(p, "pic")); cards.push(card(p, "word")); });
      shuffle(cards).forEach(function (c) { grid.appendChild(c); c.onclick = function () { flip(c); }; });
    }
    function flip(c) {
      if (lock || c.classList.contains("up") || c.classList.contains("ok")) return;
      c.classList.add("up"); api.say(word(h, a, c.pair));
      if (!first) { first = c; return; }
      var b = first; first = null;
      if (b.pair === c.pair) {
        b.classList.add("ok"); c.classList.add("ok"); left--;
        if (!left) setTimeout(function () { K.sparkle(grid.parentNode); api.say(word(h, a, def.done)); nxt.hidden = false; }, 1500);
      } else {
        lock = true; setTimeout(function () { b.classList.remove("up"); c.classList.remove("up"); lock = false; }, 1400);
      }
    }
    load(0);
  };

  /* ---------------- words: spell it from scrambled letters ---------------- */
  ENG.words = function (h, a, def, api) {
    var sh = K.shell(h, a, "mind", api), wi = 0, it, target, pos, tiles, slots;
    intro(sh, h, a, def, api);
    var stage = el("div", "lp-wstage"), pic = el("button", "lp-wpic"), en = el("div", "lp-wen"), slotsEl = el("div", "lp-wslots"), tilesEl = el("div", "lp-wtiles"),
        nxt = nextBtn("Suivant", function () { load((wi + 1) % def.items.length); });
    pic.type = "button"; stage.appendChild(pic); stage.appendChild(en); stage.appendChild(slotsEl); stage.appendChild(tilesEl); stage.appendChild(nxt); sh.body.appendChild(stage);
    function core(fr) { return fr.replace(/^(le |la |les |l'|l’)/i, ""); }
    function load(i) {
      wi = i; it = def.items[i]; target = Array.from(core(it.fr)); pos = 0; nxt.hidden = true; slotsEl.innerHTML = ""; tilesEl.innerHTML = "";
      pic.innerHTML = LP.art(it.art, LP.artDefault[it.art]); pic.onclick = function () { api.say(word(h, a, it)); };
      en.textContent = it.en; slotsEl.classList.remove("full");
      slots = target.map(function () { var s = el("span", "lp-wslot"); slotsEl.appendChild(s); return s; });
      tiles = K.shuffle(target.map(function (ch, k) { return { ch: ch, used: false }; })).map(function (t) {
        var b = el("button", "lp-wtile"); b.type = "button"; b.textContent = t.ch; t.btn = b;
        b.onclick = function () { tryLetter(t); }; tilesEl.appendChild(b); return t;
      });
    }
    function tryLetter(t) {
      if (pos >= target.length || t.used) return;
      if (t.ch === target[pos]) { place(t); } else { wiggle(t.btn); }
    }
    function place(t) {
      t.used = true; t.btn.classList.add("used"); slots[pos].textContent = target[pos]; slots[pos].classList.add("on"); pos++;
      if (pos === target.length) {
        slotsEl.classList.add("full"); K.sparkle(stage);
        setTimeout(function () { api.say(word(h, a, it)); nxt.hidden = false; }, 450);
      }
    }
    function findTile(ch) { for (var i = 0; i < tiles.length; i++) if (!tiles[i].used && tiles[i].ch === ch) return tiles[i]; return null; }
    function onKey(e) {
      if (!document.body.contains(stage) || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || pos >= target.length) return;
      var k = strip(e.key), i, t;
      if (k === strip(target[pos])) { t = findTile(target[pos]); if (t) place(t); return; }
      for (i = 0; i < tiles.length; i++) if (!tiles[i].used && strip(tiles[i].ch) === k) { wiggle(tiles[i].btn); return; }
    }
    document.addEventListener("keydown", onKey);
    var obs = new MutationObserver(function () { if (!document.body.contains(stage)) { document.removeEventListener("keydown", onKey); obs.disconnect(); } });
    obs.observe(document.body, { childList: true, subtree: true });
    load(0);
  };

  /* ---------------- pattern: what comes next / which one is different ---------------- */
  var COL = { red: "#e0453d", blue: "#3f7fd4", green: "#3fa35a", yellow: "#f2c83a", purple: "#8e5bc4", orange: "#f08a2a", pink: "#ee7fae" };
  function star() { var p = [], i, r; for (i = 0; i < 10; i++) { r = i % 2 ? 19 : 42; p.push((50 + Math.sin(i * Math.PI / 5) * r).toFixed(1) + " " + (52 - Math.cos(i * Math.PI / 5) * r).toFixed(1)); } return "M" + p.join(" L") + " Z"; }
  var SHAPES = {
    circle: function (d, f) { return d.E(50, 52, 38, 38, f); },
    square: function (d, f) { return d.R(16, 18, 68, 68, 11, f); },
    triangle: function (d, f) { return d.P("M50 14 L88 82 H12 Z", f, 'stroke="' + "none" + '"'); },
    star: function (d, f) { return d.P(star(), f); },
    heart: function (d, f) { return d.P("M50 86 C10 58 6 28 28 20 C40 16 48 24 50 32 C52 24 60 16 72 20 C94 28 90 58 50 86 Z", f); },
    diamond: function (d, f) { return d.P("M50 8 L88 50 L50 92 L12 50 Z", f); }
  };
  function shapeSvg(tok) {
    var p = tok.split(":"), k = LP.artCtx(), c = COL[p[1]] || "#888", d = LP.draw, f = k.r(c);
    var body = (SHAPES[p[0]] || SHAPES.circle)(d, f) + d.E(38, 34, 11, 6, "#fff", 'opacity=".32" transform="rotate(-30 38 34)"');
    return k.wrap(body);
  }
  K.shapeSvg = shapeSvg;
  ENG.pattern = function (h, a, def, api) {
    var sh = K.shell(h, a, "mind", api), pi = 0, p, solved;
    intro(sh, h, a, def, api);
    var q = el("button", "lp-lq"); q.type = "button"; q.innerHTML = "<b></b><i></i>";
    var seq = el("div", "lp-lseq"), opts = el("div", "lp-lopts"), nxt = nextBtn("Suivant", function () { load((pi + 1) % def.puzzles.length); });
    sh.body.appendChild(q); sh.body.appendChild(seq); sh.body.appendChild(opts); sh.body.appendChild(nxt);
    function nm(tok) { return def.names[tok]; }
    function load(i) {
      pi = i; p = def.puzzles[i]; solved = false; nxt.hidden = true; seq.innerHTML = ""; opts.innerHTML = "";
      var pr = def.prompts[p.kind]; q.firstChild.textContent = pr.fr; q.lastChild.textContent = pr.en; q.onclick = function () { api.say(word(h, a, pr)); };
      var slot = null;
      if (p.kind === "next") {
        p.seq.forEach(function (t) { var c = el("div", "lp-lcell", shapeSvg(t)); seq.appendChild(c); });
        slot = el("div", "lp-lcell lp-lslot", "<span>?</span>"); seq.appendChild(slot);
      } else {
        var row = [];
        p.seq.forEach(function (t) { var c = el("button", "lp-lcell lp-lpick"); c.type = "button"; c.innerHTML = shapeSvg(t); c.tok = t; row.push(c); seq.appendChild(c); });
        row.forEach(function (c) { c.onclick = function () { choose(c, c.tok === p.answer, null); }; });
        return;
      }
      K.shuffle(p.options).forEach(function (t) {
        var b = el("button", "lp-lopt"); b.type = "button"; b.innerHTML = shapeSvg(t); b.tok = t;
        b.onclick = function () { choose(b, t === p.answer, slot); }; opts.appendChild(b);
      });
    }
    function choose(btn, ok, slot) {
      if (solved) return;
      api.say(word(h, a, nm(btn.tok)));
      if (!ok) { wiggle(btn); return; }
      solved = true; btn.classList.add("right");
      if (slot) { slot.innerHTML = shapeSvg(btn.tok); slot.classList.remove("lp-lslot"); slot.classList.add("lp-drop"); }
      K.sparkle(sh.body); nxt.hidden = false;
    }
    load(0);
  };
})();
