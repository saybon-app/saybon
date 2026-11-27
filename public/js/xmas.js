/* Homepage Christmas: fades in the festive layer and runs a real snowfall on a canvas. */
(function () {
  var shell = document.querySelector(".home-shell");
  if (!shell) return;
  var layer = document.querySelector(".xmas-layer");
  setTimeout(function () { if (layer) layer.classList.add("on"); }, 1400);

  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cv = document.createElement("canvas");
  cv.className = "xmas-snow";
  cv.setAttribute("aria-hidden", "true");
  shell.appendChild(cv);
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1, dots = [], crystals = [], last = 0, raf = 0, t = 0;

  /* soft round flake, drawn once and reused */
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
    var z = rnd(.25, 1);                       /* depth: small and slow = far, big and fast = near */
    return {
      x: rnd(0, W), y: anywhere ? rnd(-20, H) : rnd(-30, -4),
      z: z, r: 1.2 + z * 3.4,
      vy: 20 + z * 52, a: .35 + z * .6,
      sw: rnd(8, 28) * z, sp: rnd(.4, 1.1), ph: rnd(0, 6.28)
    };
  }
  function crystal(anywhere) {
    var s = rnd(14, 30);
    return {
      x: rnd(0, W), y: anywhere ? rnd(-40, H) : rnd(-60, -20),
      s: s, vy: rnd(16, 34), a: rnd(.45, .8),
      sw: rnd(14, 34), sp: rnd(.3, .7), ph: rnd(0, 6.28),
      rot: rnd(0, 6.28), vr: rnd(-.5, .5)
    };
  }

  function build() {
    var nd = Math.max(55, Math.min(150, Math.round(W / 12)));
    var nc = W < 700 ? 5 : 9;
    dots = []; crystals = [];
    for (var i = 0; i < nd; i++) dots.push(dot(true));
    for (var j = 0; j < nc; j++) crystals.push(crystal(true));
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = shell.clientWidth; H = shell.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((now - (last || now)) / 1000, .05);
    last = now; t += dt;
    var wind = Math.sin(t * .22) * 10;         /* slow breeze shared by every flake */
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < dots.length; i++) {
      var p = dots[i];
      p.y += p.vy * dt;
      p.x += (wind * p.z + Math.sin(t * p.sp + p.ph) * p.sw * .35) * dt;
      if (p.y > H + 10 || p.x < -20 || p.x > W + 20) {
        var n = dot(false);
        if (p.x < -20) n.x = W + rnd(0, 10); else if (p.x > W + 20) n.x = -rnd(0, 10);
        dots[i] = n; continue;
      }
      var d = p.r * 2.6;
      ctx.globalAlpha = p.a;
      ctx.drawImage(soft, p.x - d / 2, p.y - d / 2, d, d);
    }

    if (flake.complete && flake.naturalWidth) {
      for (var k = 0; k < crystals.length; k++) {
        var c = crystals[k];
        c.y += c.vy * dt;
        c.x += (wind * .6 + Math.sin(t * c.sp + c.ph) * c.sw * .4) * dt;
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

  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  size();
  start();
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
})();
