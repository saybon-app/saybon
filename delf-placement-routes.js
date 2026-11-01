// DELF placement results + returning-learner state, via firebase-admin (client Firestore access is denied by rules).
// Mounted from server.js: require("./delf-placement-routes")(app, { admin, db, express })
module.exports = function mountDelfPlacement(app, deps) {
  const { admin, db, express } = deps;
  const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2", "prim", "junior"];
  const ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const PASS = 0.7;
  async function uidFrom(req, res) {
    const h = req.headers.authorization || "";
    const t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) { res.status(401).json({ error: "authentication required" }); return null; }
    try { return (await admin.auth().verifyIdToken(t)).uid; }
    catch (e) { res.status(401).json({ error: "authentication failed" }); return null; }
  }
  const int = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

  app.get("/api/delf/ping", (req, res) => res.json({ ok: true, delf: true }));

  app.post("/api/delf/placement", express.json({ limit: "100kb" }), async (req, res) => {
    const uid = await uidFrom(req, res); if (!uid) return;
    try {
      const b = req.body || {};
      if (LEVELS.indexOf(b.level) < 0) return res.status(400).json({ error: "bad level" });
      const lc = int(b.listening && b.listening.correct, 200), lt = int(b.listening && b.listening.total, 200);
      const rc = int(b.reading && b.reading.correct, 200), rt = int(b.reading && b.reading.total, 200);
      const total = lt + rt, correct = Math.min(lc, lt) + Math.min(rc, rt);
      if (total < 1) return res.status(400).json({ error: "no questions scored" });
      const pct = correct / total;
      const doc = {
        level: b.level, correct, total, pct, passed: pct >= PASS,
        listening: { correct: Math.min(lc, lt), total: lt }, reading: { correct: Math.min(rc, rt), total: rt },
        writingResponse: typeof b.writingResponse === "string" && b.writingResponse ? b.writingResponse.slice(0, 8000) : null,
        writingStatus: "pending_ai_grading",
        speakingStatus: b.speakingRecorded ? "recorded_pending_ai_grading" : "not_recorded",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      const ref = await db.collection("delfPlacements").doc(uid).collection("attempts").add(doc);
      res.json({ ok: true, id: ref.id, pct, passed: doc.passed });
    } catch (e) { console.error("delfPlacement save", e); res.status(500).json({ error: "could not save" }); }
  });

  app.get("/api/delf/state", async (req, res) => {
    const uid = await uidFrom(req, res); if (!uid) return;
    try {
      const [aSnap, accSnap, mSnap] = await Promise.all([
        db.collection("delfPlacements").doc(uid).collection("attempts").orderBy("timestamp", "desc").limit(50).get(),
        db.collection("delfAccess").doc(uid).get(),
        db.collection("delfMockResults").doc(uid).collection("attempts").orderBy("createdAt", "desc").limit(20).get().catch(() => null)
      ]);
      const attempts = aSnap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id, level: x.level, pct: x.pct || 0, correct: x.correct || 0, total: x.total || 0, passed: !!x.passed,
          listening: x.listening || null, reading: x.reading || null,
          writing: x.writingResponse ? "submitted" : "skipped", speaking: x.speakingStatus === "not_recorded" ? "skipped" : "recorded",
          at: x.timestamp && x.timestamp.toMillis ? x.timestamp.toMillis() : null
        };
      });
      const acc = accSnap.exists ? accSnap.data() : {};
      const granted = Object.keys(acc).filter((k) => acc[k] && acc[k].granted);
      const mocks = mSnap ? mSnap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, mockId: x.mockId, scores: x.scores || null, total: x.total, passed: x.passed, at: x.createdAt && x.createdAt.toMillis ? x.createdAt.toMillis() : null };
      }) : [];
      let top = null;
      attempts.forEach((a) => { if (a.passed && ORDER.indexOf(a.level) >= 0 && (top === null || ORDER.indexOf(a.level) > ORDER.indexOf(top))) top = a.level; });
      const target = top ? ORDER[Math.min(ORDER.indexOf(top) + 1, ORDER.length - 1)] : "a1";
      const state = granted.length ? "enrolled" : attempts.length ? "tested" : "new";
      res.json({ state, attempts, highestCleared: top, targetExam: target, granted, mocks });
    } catch (e) { console.error("delfState", e); res.status(500).json({ error: "could not load" }); }
  });
};
