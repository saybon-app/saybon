(function () {
  "use strict";

  var stage = document.getElementById("tkStage");
  var frame = document.getElementById("tkFrame");
  var startBtn = document.getElementById("tkStartBtn");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  startBtn.addEventListener("click", function () {
    window.location.href = "map.html";
  });

  /* ---------- story board ----------
     golf: upright -> swing -> celebrate (smooth crossfades)
     then basketball, then football, then back to golf. */
  var SCENES = [
    { name: "golf",   poses: ["up", "swing", "cele"], holds: [3600, 3400, 3600], dir: 1 },
    { name: "basket", poses: null, holds: [5800], dir: -1 },
    { name: "soccer", poses: null, holds: [5800], dir: 1 }
  ];
  var PAN_DUR = 15000;      // ms, slow cinematic drift
  var PAN_MAX_VW = 0.6;     // never drift more than 60% of the screen width

  var bgs = {}, chars = {};
  SCENES.forEach(function (s) {
    bgs[s.name] = stage.querySelector('.tk-bg[data-scene="' + s.name + '"]');
    chars[s.name] = frame.querySelector('.tk-char[data-scene="' + s.name + '"]');
  });

  /* ---------- background panning ---------- */
  function panVars(bg, dir) {
    var img = bg.querySelector("img");
    var ox = Math.max(0, img.offsetWidth - stage.clientWidth);
    var travel = Math.min(ox * 0.92, stage.clientWidth * PAN_MAX_VW);
    var mid = -ox / 2;
    var a = mid + (dir * travel) / 2;      // dir 1: image drifts left, -1: drifts right
    var b = mid - (dir * travel) / 2;
    bg.style.setProperty("--p0", a.toFixed(1) + "px");
    bg.style.setProperty("--p1", b.toFixed(1) + "px");
    bg.style.setProperty("--pan-dur", PAN_DUR + "ms");
  }
  function startPan(bg, dir) {
    bg.classList.remove("pan");
    panVars(bg, dir);
    void bg.offsetWidth;                    // restart the animation
    if (!reduce) bg.classList.add("pan");
  }

  /* ---------- scene machine ---------- */
  var current = -1, timers = [], panCleanup = null;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function setPose(scene, pose) {
    var box = chars[scene.name];
    var poses = box.querySelectorAll(".tk-pose");
    var next = null, prev = null;
    poses.forEach(function (p) {
      if (p.dataset.pose === pose) next = p;
      if (p.classList.contains("on")) prev = p;
    });
    if (next === prev) return;
    next.classList.add("on");
    // keep the old pose visible a beat longer so the body never goes see-through
    if (prev) later(function () { prev.classList.remove("on"); }, 380);
  }

  function enter(i) {
    var scene = SCENES[i], prev = SCENES[current];
    // backgrounds
    if (prev) {
      var pbg = bgs[prev.name];
      pbg.classList.remove("on");
      later(function () { pbg.classList.remove("pan"); }, 1500);
      var pch = chars[prev.name];
      pch.classList.remove("on"); pch.classList.add("out");
      later(function () { pch.classList.remove("out"); }, 1300);
    }
    var bg = bgs[scene.name];
    startPan(bg, scene.dir);
    bg.classList.add("on");
    // layout (logo + button glide to this scene's reference position)
    frame.setAttribute("data-scene", scene.name);
    // character
    var ch = chars[scene.name];
    if (scene.poses) {
      ch.querySelectorAll(".tk-pose").forEach(function (p) {
        p.classList.toggle("on", p.dataset.pose === scene.poses[0]);
      });
    }
    ch.classList.remove("out");
    void ch.offsetWidth;
    later(function () { ch.classList.add("on"); }, prev ? 350 : 0);
    current = i;

    // timeline of this scene
    var t = prev ? 350 : 0;
    scene.holds.forEach(function (hold, k) {
      t += hold;
      if (scene.poses && k < scene.poses.length - 1) {
        (function (pose) { later(function () { setPose(scene, pose); }, t); })(scene.poses[k + 1]);
      }
    });
    later(function () { enter((i + 1) % SCENES.length); }, t);
  }

  /* ---------- boot: wait for the first scene's pixels ---------- */
  function ready(srcs) {
    return Promise.all(srcs.map(function (src) {
      return new Promise(function (res) {
        var im = new Image(); im.onload = im.onerror = function () { res(); }; im.src = src;
      });
    }));
  }
  var base = "/assets/talkletics/landing/";
  var first = ready([base + "golf-bg.webp", base + "golf-up.webp", base + "logo.webp", base + "pill.webp"]);
  var fonts = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]) : Promise.resolve();

  Promise.all([first, fonts]).then(function () {
    enter(0);
    // warm the cache for the next scenes
    ready([base + "golf-swing.webp", base + "golf-cele.webp", base + "basket.webp", base + "soccer.webp"]);
    var portrait = matchMedia("(orientation:portrait)").matches;
    ready([base + (portrait ? "basket-bg-mob.webp" : "basket-bg-desk.webp"), base + (portrait ? "soccer-bg-mob.webp" : "soccer-bg-desk.webp")]);
  });

  /* ---------- keep pan range right when the window changes ---------- */
  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (current < 0) return;
      var s = SCENES[current], bg = bgs[s.name];
      var running = bg.classList.contains("pan");
      panVars(bg, s.dir);
      if (running) { bg.classList.remove("pan"); void bg.offsetWidth; bg.classList.add("pan"); }
    }, 150);
  });
})();
