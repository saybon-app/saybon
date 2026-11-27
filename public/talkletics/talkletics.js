(function () {
  "use strict";

  var stage = document.getElementById("tkStage");
  var frame = document.getElementById("tkFrame");
  var startBtn = document.getElementById("tkStartBtn");
  var logo = frame.querySelector(".tk-logo");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  startBtn.addEventListener("click", function () {
    window.location.href = "map.html";
  });

  /* ---------- story board ----------
     golf: upright -> swing -> celebrate, then basketball, then football, then golf again.
     holds = how long each pose stays (ms). */
  var SCENES = [
    { name: "golf",   poses: ["up", "swing", "cele"], holds: [3600, 3400, 3600], dir: 1 },
    { name: "basket", poses: null, holds: [5800], dir: -1 },
    { name: "soccer", poses: null, holds: [5800], dir: 1 }
  ];

  /* ---------- timing (keep in step with talkletics.css) ----------
     A scene change is strictly one thing at a time:
       1. the character leaves completely            (OUT)
       2. the background crossfades, nobody on stage (BG)
       3. the new character arrives                  (IN)
     so a leaving and an arriving character are never visible together. */
  var OUT = 1300;         // character fade-out   (.tk-char.out)
  var BG = 1200;          // background crossfade (.tk-bg.on)
  var IN = 1500;           // character fade-in    (.tk-char.on)
  var GAP = 300;          // breathing room between steps
  var POSE_OUT = 550;     // a pose fades out completely before the next one fades in
  var PAN_DUR = 15000;    // original drift
  var PAN_MAX_VW = 0.6;

  var bgs = {}, chars = {};
  SCENES.forEach(function (s) {
    bgs[s.name] = stage.querySelector('.tk-bg[data-scene="' + s.name + '"]');
    chars[s.name] = frame.querySelector('.tk-char[data-scene="' + s.name + '"]');
  });

  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  /* ---------- background panning ---------- */
  function panVars(bg, dir, durMs) {
    var img = bg.querySelector("img");
    var ox = Math.max(0, img.offsetWidth - stage.clientWidth);
    var travel = Math.min(ox * 0.92, stage.clientWidth * PAN_MAX_VW);
    var mid = -ox / 2;
    var a = mid + (dir * travel) / 2;      // dir 1: image drifts left, -1: drifts right
    var b = mid - (dir * travel) / 2;
    bg.style.setProperty("--p0", a.toFixed(1) + "px");
    bg.style.setProperty("--p1", b.toFixed(1) + "px");
    bg.style.setProperty("--pan-dur", Math.round(durMs) + "ms");
  }
  function startPan(bg, dir, durMs) {
    bg.classList.remove("pan");
    panVars(bg, dir, durMs);
    void bg.offsetWidth;                    // restart the animation
    if (!reduce) bg.classList.add("pan");
  }
  /* ---------- logo clearance (portrait): characters are sized to sit below the logo ---------- */
  function measureLogo() {
    var fr = frame.getBoundingClientRect();
    var r = logo.getBoundingClientRect();
    if (r.height > 0) frame.style.setProperty("--logo-bot", (r.bottom - fr.top + 8).toFixed(1) + "px");
  }

  /* ---------- scene machine ---------- */
  var current = -1, timers = [], restLoaded = false;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  function resetPoses(scene) {
    if (!scene.poses) return;
    chars[scene.name].querySelectorAll(".tk-pose").forEach(function (p) {
      p.classList.add("snap");
      p.classList.toggle("on", p.dataset.pose === scene.poses[0]);
    });
    void chars[scene.name].offsetWidth;
    chars[scene.name].querySelectorAll(".tk-pose").forEach(function (p) { p.classList.remove("snap"); });
  }

  function setPose(scene, pose) {
    var poses = chars[scene.name].querySelectorAll(".tk-pose");
    var next = null, prev = null;
    poses.forEach(function (p) {
      if (p.dataset.pose === pose) next = p;
      if (p.classList.contains("on")) prev = p;
    });
    if (!next || next === prev) return;
    if (prev) prev.classList.remove("on");                                      // old pose leaves completely...
    later(function () { next.classList.add("on"); }, prev ? POSE_OUT + 60 : 0); // ...then the new one arrives
  }

  function enter(i) {
    var scene = SCENES[i], prev = SCENES[current] || null;
    var t = 0;

    // 1) the previous character leaves completely
    if (prev) {
      var pch = chars[prev.name];
      pch.classList.remove("on"); pch.classList.add("out");
      t += OUT + GAP;
      later(function () { pch.classList.remove("out"); resetPoses(prev); }, OUT + 40);
    }

    // 2) background crossfade, with no character on stage
    later(function () {
      var bg = bgs[scene.name];
      if (prev) {
        var pbg = bgs[prev.name];
        pbg.classList.remove("on");
        pbg.classList.add("under");                 // stays fully opaque under the new one
        later(function () { pbg.classList.remove("under", "pan"); }, BG + 80);
      }
      startPan(bg, scene.dir, PAN_DUR);
      bg.classList.add("on");
      frame.setAttribute("data-scene", scene.name);
    }, t);
    t += (prev ? BG : 500) + GAP;

    // 3) the new character arrives
    later(function () { chars[scene.name].classList.add("on"); }, t);
    t += IN;

    // 4) poses / hold, then on to the next scene
    scene.holds.forEach(function (hold, k) {
      t += hold;
      if (scene.poses && k < scene.poses.length - 1) {
        (function (pose, at) { later(function () { setPose(scene, pose); }, at); })(scene.poses[k + 1], t);
      }
    });
    current = i;
    later(function next() {
      // never start a change until the next scene's pictures are loaded (slow networks)
      if (!restLoaded) { later(next, 300); return; }
      enter((i + 1) % SCENES.length);
    }, t);
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
    measureLogo();
    // preload everything else so no scene ever pops in
    var portrait = matchMedia("(orientation:portrait)").matches;
    ready([
      base + "golf-swing.webp", base + "golf-cele.webp", base + "basket.webp", base + "soccer.webp",
      base + (portrait ? "basket-bg-mob.webp" : "basket-bg-desk.webp"),
      base + (portrait ? "soccer-bg-mob.webp" : "soccer-bg-desk.webp")
    ]).then(function () { restLoaded = true; });
    enter(0);
  });
  if (logo.complete) measureLogo(); else logo.addEventListener("load", measureLogo);

  /* ---------- keep pan range and logo clearance right when the window changes ---------- */
  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      measureLogo();
      if (current < 0) return;
      var s = SCENES[current], bg = bgs[s.name];
      var running = bg.classList.contains("pan");
      panVars(bg, s.dir, PAN_DUR);
      if (running) { bg.classList.remove("pan"); void bg.offsetWidth; bg.classList.add("pan"); }
    }, 150);
  });
})();
