/* Wakes the sleeping server early on pages that do NOT use the auth gate (home, login). */
(function () {
  try {
    var t = Number(sessionStorage.getItem("sb_warm") || 0), n = Date.now();
    if (!t || n - t > 240000) {
      sessionStorage.setItem("sb_warm", String(n));
      fetch("https://saybonapp-server.onrender.com/api/activity/ping", { mode: "no-cors", keepalive: true }).catch(function () {});
    }
  } catch (e) {}
})();
