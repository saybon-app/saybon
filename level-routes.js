// Saves the learner's placement level on their account, so it survives new tabs, devices and logins.
//   GET  /api/level            (Bearer) -> { level }
//   POST /api/level {level}    (Bearer) -> { ok, level }
module.exports = function (app, ctx) {
  var admin = ctx.admin, db = ctx.db, express = ctx.express;
  var VALID = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  async function uid(req, res) {
    var h = req.headers.authorization || "", t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) { res.status(401).json({ error: "authentication required" }); return null; }
    try { return (await admin.auth().verifyIdToken(t)).uid; } catch (e) { res.status(401).json({ error: "authentication failed" }); return null; }
  }
  app.get("/api/level", async function (req, res) {
    var u = await uid(req, res); if (!u) return;
    try { var s = await db.collection("learnerLevels").doc(u).get(); res.json({ level: s.exists ? (s.data().level || null) : null }); }
    catch (e) { console.error("level get", e); res.status(500).json({ error: "could not load level" }); }
  });
  app.post("/api/level", express.json({ limit: "2kb" }), async function (req, res) {
    var u = await uid(req, res); if (!u) return;
    var lv = String((req.body && req.body.level) || "").toUpperCase();
    if (VALID.indexOf(lv) < 0) return res.status(400).json({ error: "unknown level" });
    try { await db.collection("learnerLevels").doc(u).set({ level: lv, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }); res.json({ ok: true, level: lv }); }
    catch (e) { console.error("level set", e); res.status(500).json({ error: "could not save level" }); }
  });
};
