/* SayBon lesson hubs (A0 Tout Public, A1 to C2): winter panning slideshow + soft falling snow.
   - Not used by the French for Professional hub (that hub keeps /levels/bg-slideshow.js).
   - All 11 photos play on every hub, in a ring that alternates lit and soft/snowy photos,
     so two lit photos are never side by side (the wrap-around from last to first is safe too).
   - Each level has its own rotation of the ring, and every page load opens on the
     3rd photo from the end of that level's order, then runs forward and loops.
   - Slow Ken Burns pan on every photo, long crossfade, nothing ever pops. */
(function () {
  if (window.__sbWinter) return;
  window.__sbWinter = 1;

  var BASE = "/assets/levels/winter/";
  /* L = lit evening photo, S = soft or bright snowy photo. Pattern: L S L S L S L S L S S (never L next to L, also when it loops). */
  var RING = [
    "louvre-night",     /* L */
    "eiffel-day",       /* S */
    "notredame-night",  /* L */
    "chalet-day",       /* S */
    "bench-lit",        /* L */
    "park-day",         /* S */
    "rink-xmas",        /* L */
    "ski-sunset",       /* S */
    "cafe-lit",         /* L */
    "rink-dusk",        /* S */
    "cafe-dusk"         /* S */
  ];
  /* Rotation per level, so each hub opens on a different photo. */
  var ROT = { A0: 0, A1: 2, A2: 4, B1: 6, B2: 8, C1: 10, C2: 1 };
  var HOLD = 9000, FADE = 2600, PAN = 18;

  var m = location.pathname.match(/\/levels\/(A0|A1|A2|B1|B2|C1|C2)(?:\/|$)/i);
  var level = m ? m[1].toUpperCase() : "A1";
  var r = ROT[level] || 0, n = RING.length;
  var ORDER = [];
  for (var i = 0; i < n; i++) ORDER.push(RING[(i + r) % n]);
  var idx = n - 3;                                   /* 3rd photo from the end, on every load */

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.id = "sbWinterCss";
  css.textContent =
    "html{background:#0b1522!important}" +
    "body::before,body::after{display:none!important;content:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}" +
    "#sbBg{position:fixed;inset:0;z-index:-3;overflow:hidden;background:#0b1522;pointer-events:none}" +
    "#sbBg .sbL{position:absolute;inset:-7%;background-size:cover;background-position:center;opacity:0;transition:opacity " + FADE + "ms ease-in-out;will-change:opacity,transform;backface-visibility:hidden}" +
    "#sbBg .sbL.on{opacity:1}" +
    "#sbBg .sbD{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,14,26,.46),rgba(6,14,26,.34) 45%,rgba(6,14,26,.5))}" +
    "#sbSnow{position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;opacity:0;transition:opacity 2.4s ease}" +
    "@keyframes sbw0{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.15) translate3d(-3%,-2%,0)}}" +
    "@keyframes sbw1{from{transform:scale(1.15) translate3d(-3%,2%,0)}to{transform:scale(1.04) translate3d(3%,0,0)}}" +
    "@keyframes sbw2{from{transform:scale(1.05) translate3d(3%,-1%,0)}to{transform:scale(1.16) translate3d(-2%,2%,0)}}" +
    "@keyframes sbw3{from{transform:scale(1.16) translate3d(2%,2%,0)}to{transform:scale(1.04) translate3d(-3%,-1%,0)}}" +
    "@media (prefers-reduced-motion:reduce){#sbBg .sbL{animation:none!important}#sbSnow{display:none}}";
  document.head.appendChild(css);

  /* ---------- slideshow ---------- */
  var layers = [], cur = 0, pan = r % 4, timer = null, started = false;

  function src(i) { return BASE + ORDER[((i % n) + n) % n] + ".webp"; }
  function load(url, cb) { var im = new Image(); im.onload = im.onerror = function () { cb(); }; im.src = url; }

  function put(layer, i) {
    layer.style.backgroundImage = "url(" + src(i) + ")";
    layer.style.animation = "none";
    void layer.offsetWidth;
    layer.style.animation = "sbw" + (pan++ % 4) + " " + PAN + "s linear forwards";
  }

  function next() {
    var ni = (idx + 1) % n;
    var from = layers[cur], to = layers[cur ^ 1];
    load(src(ni), function () {                      /* never fade to a photo that has not arrived */
      idx = ni;
      put(to, idx);
      to.classList.add("on");
      from.classList.remove("on");
      cur ^= 1;
      load(src(idx + 1), function () {});
    });
  }

  function start() { if (!timer && started) timer = setInterval(next, HOLD); }
  function stop() { clearInterval(timer); timer = null; }

  function warmRest() {                              /* quietly cache the other photos while the first ones play */
    var k = 2;
    (function step() {
      if (k >= n) return;
      load(src(idx + k), function () { k++; setTimeout(step, 700); });
    })();
  }

  /* ---------- snow (same engine as the homepage: soft round flakes + the crystal flake image), slowed down ---------- */
  function snow() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cv = document.createElement("canvas");
    cv.id = "sbSnow";
    cv.setAttribute("aria-hidden", "true");
    document.body.insertBefore(cv, document.body.firstChild);
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, dpr = 1, dots = [], crystals = [], last = 0, raf = 0, t = 0;
    var SLOW = 0.55;                                 /* overall speed: lower = slower and calmer */

    var soft = document.createElement("canvas");
    soft.width = soft.height = 48;
    var sc = soft.getContext("2d");
    var g = sc.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(.35, "rgba(255,255,255,.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    sc.fillStyle = g;
    sc.fillRect(0, 0, 48, 48);

    var flake = new Image();
    flake.src = "/assets/home/xmas/flake.webp";

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function dot(anywhere) {
      var z = rnd(.25, 1);
      return { x: rnd(0, W), y: anywhere ? rnd(-20, H) : rnd(-30, -4), z: z, r: 1.2 + z * 3.2,
               vy: (20 + z * 52) * SLOW, a: .35 + z * .55, sw: rnd(8, 28) * z, sp: rnd(.3, .8), ph: rnd(0, 6.28) };
    }
    function crystal(anywhere) {
      return { x: rnd(0, W), y: anywhere ? rnd(-40, H) : rnd(-60, -20), s: rnd(14, 28), vy: rnd(16, 34) * SLOW,
               a: rnd(.4, .75), sw: rnd(14, 34), sp: rnd(.25, .55), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-.3, .3) };
    }
    function build() {
      var nd = Math.max(45, Math.min(120, Math.round(W / 14)));
      var nc = W < 700 ? 4 : 7;
      dots = []; crystals = [];
      for (var i = 0; i < nd; i++) dots.push(dot(true));
      for (var j = 0; j < nc; j++) crystals.push(crystal(true));
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - (last || now)) / 1000, .05);
      last = now; t += dt;
      var wind = Math.sin(t * .18) * 8;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        p.y += p.vy * dt;
        p.x += (wind * p.z + Math.sin(t * p.sp + p.ph) * p.sw * .3) * dt;
        if (p.y > H + 10 || p.x < -20 || p.x > W + 20) {
          var nn = dot(false);
          if (p.x < -20) nn.x = W + rnd(0, 10); else if (p.x > W + 20) nn.x = -rnd(0, 10);
          dots[i] = nn; continue;
        }
        var d = p.r * 2.6;
        ctx.globalAlpha = p.a;
        ctx.drawImage(soft, p.x - d / 2, p.y - d / 2, d, d);
      }
      if (flake.complete && flake.naturalWidth) {
        for (var k = 0; k < crystals.length; k++) {
          var c = crystals[k];
          c.y += c.vy * dt;
          c.x += (wind * .5 + Math.sin(t * c.sp + c.ph) * c.sw * .35) * dt;
          c.rot += c.vr * dt;
          if (c.y > H + 40) { crystals[k] = crystal(false); continue; }
          ctx.save();
          ctx.globalAlpha = c.a;
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);
          ctx.drawImage(flake, -c.s / 2, -c.s / 2, c.s, c.s * flake.naturalHeight / flake.naturalWidth);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }
    function go() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function halt() { cancelAnimationFrame(raf); raf = 0; }
    size(); go();
    requestAnimationFrame(function () { requestAnimationFrame(function () { cv.style.opacity = "1"; }); });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    document.addEventListener("visibilitychange", function () { document.hidden ? halt() : go(); });
  }

  /* ---------- boot ---------- */
  function init() {
    var box = document.createElement("div");
    box.id = "sbBg";
    box.setAttribute("aria-hidden", "true");
    for (var q = 0; q < 2; q++) {
      var l = document.createElement("div");
      l.className = "sbL";
      box.appendChild(l);
      layers.push(l);
    }
    var d = document.createElement("div");
    d.className = "sbD";
    box.appendChild(d);
    document.body.insertBefore(box, document.body.firstChild);
    snow();
    load(src(idx), function () {
      put(layers[0], idx);
      layers[0].classList.add("on");
      started = true;
      load(src(idx + 1), function () { warmRest(); });
      start();
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }

  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
