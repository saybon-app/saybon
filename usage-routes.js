// SayBon usage tracker (server side). Counts only. Stores anonymous user IDs, never names or emails.
//   POST /api/usageEvent        (Bearer user token) { event:"active"|"placement_open", src?, path? }
//   GET  /api/adminUsageSummary (admin)             -> counts and series only
// Also watches two existing routes (no edits to them) and logs:
//   placement_done  when POST /api/level succeeds
//   lesson_complete when POST /api/levelProgressComplete succeeds
module.exports = function (app, ctx) {
  var admin = ctx.admin, db = ctx.db, express = ctx.express;
  var FV = admin.firestore.FieldValue;
  var SRC_OK = /^[a-z0-9_-]{1,24}$/;
  var hits = {};
  function limited(key, max) {
    var now = Date.now(), e = hits[key];
    if (!e || now > e.reset) e = hits[key] = { n: 0, reset: now + 60000 };
    return ++e.n > max;
  }
  setInterval(function () { var n = Date.now(); for (var k in hits) if (hits[k].reset < n) delete hits[k]; }, 300000).unref();
  function today() { return new Date().toISOString().slice(0, 10); }
  function safeId(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120); }
  async function once(id, data) { // create only if missing, so the first time is kept
    try { await db.collection("usageEvents").doc(id).create(data); } catch (e) { if (!(e && (e.code === 6 || /ALREADY_EXISTS/.test(String(e.message))))) console.error("usage once", e.message); }
  }
  async function touchUser(uid, src) {
    var ref = db.collection("usageUsers").doc(uid);
    try { await ref.create({ firstSeen: FV.serverTimestamp(), src: src || "direct" }); } catch (e) { /* already there */ }
  }
  async function userFromReq(req) {
    var h = req.headers.authorization || "", t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) return null;
    try { return (await admin.auth().verifyIdToken(t)).uid; } catch (e) { return null; }
  }

  app.post("/api/usageEvent", express.json({ limit: "2kb" }), async function (req, res) {
    try {
      var uid = await userFromReq(req);
      if (!uid) return res.status(401).json({ error: "sign in first" });
      if (limited("ue:" + uid, 30)) return res.status(429).json({ error: "slow down" });
      var b = req.body || {}, ev = String(b.event || "");
      var src = SRC_OK.test(String(b.src || "")) ? String(b.src) : "direct";
      var day = today();
      if (ev === "active") {
        await touchUser(uid, src);
        try { await db.collection("usageDaily").doc(safeId(uid + "_" + day)).create({ uid: uid, day: day, ts: FV.serverTimestamp() }); } catch (e) { /* already counted today */ }
      } else if (ev === "placement_open") {
        await touchUser(uid, src);
        await once("po_" + safeId(uid), { type: "po", uid: uid, day: day, ts: FV.serverTimestamp() });
      } else return res.status(400).json({ error: "unknown event" });
      res.json({ ok: true });
    } catch (e) { console.error("usageEvent", e.message); res.status(500).json({ error: "not recorded" }); }
  });


  // French for Professionals: which field and level someone chose (anonymous ID only).
  var PF_FIELDS = ["banking", "logistics", "health", "hospitality", "defence", "business", "__other"];
  var PF_LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
  app.post("/api/professionalProfile", express.json({ limit: "2kb" }), async function (req, res) {
    try {
      var uid = await userFromReq(req);
      if (!uid) return res.status(401).json({ error: "sign in first" });
      if (limited("pp:" + uid, 20)) return res.status(429).json({ error: "slow down" });
      var b = req.body || {}, f = String(b.field || ""), lv = String(b.level || "").toUpperCase();
      if (!(f === "__other" || /^[a-z0-9-]{2,40}$/.test(f)) || PF_LEVELS.indexOf(lv) < 0) return res.status(400).json({ error: "unknown field or level" });
      var other = f === "__other" ? String(b.other || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) : "";
      if (f === "__other" && other.length < 2) return res.status(400).json({ error: "type your field" });
      var tg = String(b.target || "").toUpperCase(), pc = String(b.pace || ""); if (PF_LEVELS.indexOf(tg) < 0 || PF_LEVELS.indexOf(tg) < PF_LEVELS.indexOf(lv)) tg = ""; if (["relaxed", "steady", "intensive"].indexOf(pc) < 0) pc = "";
      await db.collection("professionalSelections").doc(uid).set({ field: f, other: other, level: lv, target: tg, pace: pc, updatedAt: FV.serverTimestamp() }, { merge: true });
      res.json({ ok: true });
    } catch (e) { console.error("professionalProfile", e.message); res.status(500).json({ error: "not saved" }); }
  });

  // Watch existing routes without touching them: log after a successful response.
  app.use(function (req, res, next) {
    if (req.method === "POST" && (req.path === "/api/levelProgressComplete" || req.path === "/api/level")) {
      res.on("finish", function () {
        if (res.statusCode !== 200) return;
        (async function () {
          try {
            var day = today(), b = req.body || {};
            if (req.path === "/api/levelProgressComplete") {
              var u = String(b.uid || ""), lv = String(b.level || ""), ls = String(b.lesson || "");
              if (!u || !lv || !ls) return;
              await once("lc_" + safeId(u + "_" + lv + "_" + ls), { type: "lc", uid: u, level: lv, lesson: ls, day: day, ts: FV.serverTimestamp() });
            } else {
              var u2 = await userFromReq(req); if (!u2) return;
              await once("pd_" + safeId(u2), { type: "pd", uid: u2, day: day, ts: FV.serverTimestamp() });
            }
          } catch (e) { console.error("usage watch", e.message); }
        })();
      });
    }
    next();
  });

  async function allAuthUsers() {
    var out = [], token;
    do {
      var r = await admin.auth().listUsers(1000, token);
      r.users.forEach(function (u) { out.push(new Date(u.metadata.creationTime).toISOString().slice(0, 10)); });
      token = r.pageToken;
    } while (token && out.length < 200000);
    return out;
  }
  function addDays(d, n) { var x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }

  // Admin only. Same check the other admin routes use (email present in accessControl).
  app.get("/api/adminUsageSummary", async function (req, res) {
    try {
      var h = req.headers.authorization || "", t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
      if (!t) return res.status(401).json({ error: "authentication required" });
      var dec = await admin.auth().verifyIdToken(t);
      var snap = await db.collection("accessControl").where("email", "==", (dec.email || "").toLowerCase()).limit(1).get();
      if (snap.empty) return res.status(403).json({ error: "not authorized" });

      var now = today(), month = now.slice(0, 7);
      var signups = await allAuthUsers();
      var daily = await db.collection("usageDaily").select("uid", "day").get();
      var ev = await db.collection("usageEvents").select("type", "uid", "day").get();
      var users = await db.collection("usageUsers").select("src", "firstSeen").get();

      // sign-ups by day, last 90 days, plus running total
      var byDay = {}; signups.forEach(function (d) { byDay[d] = (byDay[d] || 0) + 1; });
      var total = signups.length, start = addDays(now, -89), before = 0, k;
      for (k in byDay) if (k < start) before += byDay[k];
      var series = [], run = before;
      for (var i = 0; i < 90; i++) { var d = addDays(start, i); run += byDay[d] || 0; series.push({ day: d, signups: byDay[d] || 0, total: run }); }

      // active this month
      var actMonth = {}, firstActive = {}, daysByUser = {};
      daily.forEach(function (x) {
        var v = x.data(); if (v.day.slice(0, 7) === month) actMonth[v.uid] = 1;
        (daysByUser[v.uid] = daysByUser[v.uid] || []).push(v.day);
      });
      for (var u in daysByUser) { daysByUser[u].sort(); firstActive[u] = daysByUser[u][0]; }

      // returning next week: among learners first seen 14+ days ago, share active 7 to 14 days after first day
      var eligible = 0, back = 0, cutoff = addDays(now, -14);
      for (var u2 in firstActive) {
        if (firstActive[u2] > cutoff) continue;
        eligible++;
        var lo = addDays(firstActive[u2], 7), hi = addDays(firstActive[u2], 14);
        if (daysByUser[u2].some(function (dd) { return dd >= lo && dd <= hi; })) back++;
      }

      // lessons and funnel
      var lessons = 0, lessonsMonth = 0, perUser = {}, placed = {}, opened = {};
      ev.forEach(function (x) {
        var v = x.data();
        if (v.type === "lc") { lessons++; if (v.day.slice(0, 7) === month) lessonsMonth++; perUser[v.uid] = (perUser[v.uid] || 0) + 1; }
        else if (v.type === "pd") placed[v.uid] = 1;
        else if (v.type === "po") opened[v.uid] = 1;
      });
      var first = Object.keys(perUser).length, ten = 0;
      for (var p in perUser) if (perUser[p] >= 10) ten++;

      var sources = {};
      users.forEach(function (x) { var s = x.data().src || "direct"; sources[s] = (sources[s] || 0) + 1; });

      var pro = { total: 0, byField: {}, byLevel: {}, others: {} };
      try {
        var ps = await db.collection("professionalSelections").select("field", "other", "level").get();
        ps.forEach(function (x) { var v = x.data(); pro.total++; pro.byField[v.field] = (pro.byField[v.field] || 0) + 1; pro.byLevel[v.level] = (pro.byLevel[v.level] || 0) + 1; if (v.other) { var k = v.other.toLowerCase(); pro.others[k] = (pro.others[k] || 0) + 1; } });
      } catch (e) { console.error("pro summary", e.message); }
      var firstLogDay = null;
      daily.forEach(function (x) { var dd = x.data().day; if (!firstLogDay || dd < firstLogDay) firstLogDay = dd; });

      res.json({
        generated: now, trackingSince: firstLogDay,
        professional: { total: pro.total, byField: Object.keys(pro.byField).map(function (k) { return { field: k, n: pro.byField[k] }; }).sort(function (a, b) { return b.n - a.n; }), byLevel: Object.keys(pro.byLevel).map(function (k) { return { level: k, n: pro.byLevel[k] }; }).sort(function (a, b) { return a.level < b.level ? -1 : 1; }), others: Object.keys(pro.others).map(function (k) { return { text: k, n: pro.others[k] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 30) },
        signupsTotal: total,
        activeThisMonth: Object.keys(actMonth).length,
        lessonsTotal: lessons, lessonsThisMonth: lessonsMonth,
        returning: { eligible: eligible, back: back },
        series: series,
        funnel: [
          { step: "Signed up", n: total },
          { step: "Opened placement", n: Object.keys(opened).length },
          { step: "Finished placement", n: Object.keys(placed).length },
          { step: "Finished a lesson", n: first },
          { step: "Finished ten lessons", n: ten }
        ],
        sources: Object.keys(sources).map(function (s) { return { src: s, n: sources[s] }; }).sort(function (a, b) { return b.n - a.n; })
      });
    } catch (e) { console.error("adminUsageSummary", e.message); res.status(500).json({ error: "could not build summary" }); }
  });
};
