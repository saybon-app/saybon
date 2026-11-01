/* SayBon activity tracker.
   <script src="/js/activity-tracker.js" data-type="lesson|game|music|exam" defer></script>
   Counts seconds only while the tab is visible and the learner was active in the last 90s
   (music: only while actually playing, via SayBonActivity.setPlaying(true/false)).
   Sends to the Render server; never throws into the host page. */
(function () {
  if (window.SayBonActivity) return;
  var API = "https://saybonapp-server.onrender.com";
  var me = document.currentScript;
  var TYPE = (me && me.getAttribute("data-type")) || "lesson";
  var MANUAL = TYPE === "music";          // music needs explicit play state
  var IDLE_MS = 90000, FLUSH_S = 30;
  var pending = 0, lastInput = Date.now(), playing = false, token = null, tokenAt = 0, user = null;
  var listeners = [];

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function active() {
    if (document.visibilityState !== "visible") return false;
    if (MANUAL) return playing;
    return Date.now() - lastInput < IDLE_MS;
  }
  ["pointerdown", "keydown", "touchstart", "scroll", "mousemove", "click"].forEach(function (e) {
    window.addEventListener(e, function () { lastInput = Date.now(); }, { passive: true });
  });

  var authReady = import("/js/firebase-init.js").then(function (m) {
    return new Promise(function (resolve) {
      var first = true;
      m.auth.onAuthStateChanged(function (u) { user = u; if (first) { first = false; resolve(); } });
    });
  }).catch(function () {});

  function getToken() {
    return authReady.then(function () {
      if (!user) return null;
      if (token && Date.now() - tokenAt < 45 * 60000) return token;
      return user.getIdToken().then(function (t) { token = t; tokenAt = Date.now(); return t; });
    }).catch(function () { return null; });
  }

  function send(body, keepalive) {
    return getToken().then(function (t) {
      if (!t) return null;
      return fetch(API + "/api/activity/log", {
        method: "POST", keepalive: !!keepalive,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + t },
        body: JSON.stringify(body)
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (j) listeners.forEach(function (f) { try { f(j); } catch (e) {} });
        return j;
      });
    }).catch(function () { return null; });
  }

  function flush(keepalive) {
    if (pending < 1) return Promise.resolve(null);
    var s = Math.min(pending, 180); pending -= s;
    return send({ day: today(), type: TYPE, seconds: s }, keepalive);
  }

  var ticks = 0;
  setInterval(function () {
    if (!active()) return;
    pending += 1; ticks += 1;
    if (ticks >= FLUSH_S) { ticks = 0; flush(false); }
  }, 1000);

  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(true); });
  window.addEventListener("pagehide", function () { flush(true); });

  window.SayBonActivity = {
    type: TYPE,
    setPlaying: function (v) { playing = !!v; if (!v) flush(false); },
    // event: lesson_complete | game_complete | exam_complete
    complete: function (event, extraType) {
      var secs = Math.min(pending, 180); pending -= secs;
      return send({ day: today(), type: extraType || TYPE, seconds: secs, event: event }, true);
    },
    flush: function () { return flush(false); },
    onUpdate: function (f) { listeners.push(f); },
    today: today
  };
})();
