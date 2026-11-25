// Runs at the very top of <body>, BEFORE the first paint (the stylesheets are already applied by then).
// If the page paints its own photo on <body>, pan that same photo. Doing it here (instead of at the end of
// the page) removes the visible background jump that used to happen after load.
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
