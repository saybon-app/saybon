/* SayBon level hubs: smooth panning background slideshow with a clear dark overlay.
   Buildings and offices are interleaved (never two buildings in a row).
   Every page load starts on a different picture than the one before. */
(function () {
  if (window.__sbBg) return;
  window.__sbBg = 1;

  var BASE = "/assets/levels/bg/bg-";
  /* b = building, o = office. Pattern keeps buildings apart, including when the loop wraps. */
  var ORDER = ["b1", "o1", "o2", "b2", "o3", "o4", "b3", "o5", "o6"];
  var HOLD = 8000, FADE = 2200, PAN = 15;

  var css = document.createElement("style");
  css.id = "sbBgCss";
  css.textContent =
    "html{background:#0a1216!important}" +
    "body::before,body::after{display:none!important;content:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}" +
    "#sbBg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:#0a1216;pointer-events:none}" +
    "#sbBg .sbL{position:absolute;inset:-6%;background-size:cover;background-position:center;opacity:0;transition:opacity " + FADE + "ms ease-in-out;will-change:opacity,transform;backface-visibility:hidden}" +
    "#sbBg .sbL.on{opacity:1}" +
    "#sbBg .sbD{position:absolute;inset:0;background:rgba(4,10,14,.55)}" +
    "@keyframes sbk0{from{transform:scale(1.02) translate3d(0,0,0)}to{transform:scale(1.14) translate3d(-3%,-2%,0)}}" +
    "@keyframes sbk1{from{transform:scale(1.14) translate3d(-3%,2%,0)}to{transform:scale(1.03) translate3d(3%,0,0)}}" +
    "@keyframes sbk2{from{transform:scale(1.04) translate3d(3%,-1%,0)}to{transform:scale(1.15) translate3d(-2%,2%,0)}}" +
    "@keyframes sbk3{from{transform:scale(1.15) translate3d(2%,2%,0)}to{transform:scale(1.03) translate3d(-3%,-1%,0)}}" +
    "@media (prefers-reduced-motion:reduce){#sbBg .sbL{animation:none!important}}";
  document.head.appendChild(css);

  var last = -1;
  try { last = parseInt(localStorage.getItem("sb_bg_last"), 10); if (isNaN(last)) last = -1; } catch (e) {}
  var idx;
  do { idx = Math.floor(Math.random() * ORDER.length); } while (idx === last && ORDER.length > 1);
  try { localStorage.setItem("sb_bg_last", String(idx)); } catch (e) {}

  var box, layers = [], cur = 0, pan = Math.floor(Math.random() * 4), timer = null;

  function src(i) { return BASE + ORDER[((i % ORDER.length) + ORDER.length) % ORDER.length] + ".webp"; }
  function load(url, cb) { var im = new Image(); im.onload = im.onerror = function () { cb(); }; im.src = url; }

  function put(layer, i) {
    layer.style.backgroundImage = "url(" + src(i) + ")";
    layer.style.animation = "none";
    void layer.offsetWidth;
    layer.style.animation = "sbk" + (pan++ % 4) + " " + PAN + "s linear forwards";
  }

  function next() {
    idx = (idx + 1) % ORDER.length;
    var from = layers[cur], to = layers[cur ^ 1];
    load(src(idx), function () {
      put(to, idx);
      to.classList.add("on");
      from.classList.remove("on");
      cur ^= 1;
      load(src(idx + 1), function () {});
    });
  }

  function start() {
    if (timer) return;
    timer = setInterval(next, HOLD);
  }
  function stop() { clearInterval(timer); timer = null; }

  function init() {
    box = document.createElement("div");
    box.id = "sbBg";
    box.setAttribute("aria-hidden", "true");
    for (var n = 0; n < 2; n++) {
      var l = document.createElement("div");
      l.className = "sbL";
      box.appendChild(l);
      layers.push(l);
    }
    var d = document.createElement("div");
    d.className = "sbD";
    box.appendChild(d);
    document.body.insertBefore(box, document.body.firstChild);
    load(src(idx), function () {
      put(layers[0], idx);
      layers[0].classList.add("on");
      load(src(idx + 1), function () {});
      start();
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }

  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
