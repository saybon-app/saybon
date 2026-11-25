/* SayBon auth gate. Classic (blocking) script, placed first in <head> on every signed-in page.
   It runs BEFORE the first paint, which the old module-based guard did not (that is what made pages
   paint, vanish, then paint again).
   - Returning signed-in user (hint saved by firebase-core): page is NOT hidden, it just paints once.
   - Unknown state (first visit after deploy / signed out): hidden until /js/auth-guard.js confirms.
   - Safety net: never stays hidden more than 4 seconds, even if Firebase is slow or blocked.        */
(function () {
  var known = false;
  try { known = localStorage.getItem("sb_auth") === "1"; } catch (e) {}
  if (!known) {
    document.documentElement.style.visibility = "hidden";
    setTimeout(function () { document.documentElement.style.visibility = ""; }, 4000);
  }
  // Wake the free-tier server early (it sleeps), at most once every 4 minutes.
  try {
    var t = Number(sessionStorage.getItem("sb_warm") || 0), n = Date.now();
    if (!t || n - t > 240000) {
      sessionStorage.setItem("sb_warm", String(n));
      fetch("https://saybonapp-server.onrender.com/api/activity/ping", { mode: "no-cors", keepalive: true }).catch(function () {});
    }
  } catch (e) {}
})();
