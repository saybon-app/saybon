// Background panning: if the page paints its own photo on <body> (it hides the panning layer), pan that same photo.
(function () {
  try {
    var cs = getComputedStyle(document.body), img = cs.backgroundImage;
    if (img && img !== "none") {
      var root = document.documentElement;
      root.style.setProperty("--sb-photo", img);
      root.style.setProperty("--sb-color", cs.backgroundColor);
      root.classList.add("sb-pan");
    }
  } catch (e) {}
})();

// Subtle snow: lots of tiny, soft flakes drifting down behind the cards. Pure canvas, no libraries.
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var cv = document.createElement("canvas");
  cv.id = "sbSnow"; cv.setAttribute("aria-hidden", "true");
  document.body.insertBefore(cv, document.body.firstChild);   // first child: cards and sidebar paint above it
  var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, flakes = [], raf = 0, last = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(150, Math.max(50, (W * H) / 14000)));   // ~130 on a laptop, fewer on phones
    while (flakes.length < n) flakes.push(make(true));
    flakes.length = n;
  }
  function make(anywhere) {
    var depth = Math.random();                                  // 0 far, 1 near
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : -4,
      r: 0.5 + depth * 1.2,                                     // 0.5px to 1.7px: tiny
      v: 14 + depth * 26,                                       // px per second, gentle
      a: 0.28 + depth * 0.5,                                    // soft
      sw: 0.4 + Math.random() * 0.9, ph: Math.random() * 6.28, dr: (Math.random() - 0.5) * 8
    };
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((t - (last || t)) / 1000, 0.05); last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.v * dt;
      f.x += (Math.sin(t / 1000 * f.sw + f.ph) * 10 + f.dr) * dt;
      if (f.y > H + 4 || f.x < -6 || f.x > W + 6) { flakes[i] = make(false); flakes[i].x = Math.random() * W; continue; }
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  size();
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
  });
  raf = requestAnimationFrame(frame);
})();
