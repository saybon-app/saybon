// DELF mock exam routes. Added alongside server.js; mounted with:
//   require("./delf-mock-routes")(app, { admin, db, express });
const RUBRICS = require("./delf-rubrics.js");

module.exports = function mountDelfMockRoutes(app, deps) {
  const admin = deps.admin, db = deps.db, express = deps.express;

  async function getUid(req) {
    const h = req.headers.authorization || "";
    const token = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!token) return null;
    try { const d = await admin.auth().verifyIdToken(token); return d.uid; } catch (e) { return null; }
  }

  // Plain speech-to-text for exam answers (no pronunciation reference text).
  app.post("/api/delfTranscribe", express.raw({ type: () => true, limit: "10mb" }), async (req, res) => {
    try {
      const audio = req.body;
      if (!audio || !audio.length) return res.status(400).json({ error: "Audio is required" });
      const region = process.env.AZURE_SPEECH_REGION, key = process.env.AZURE_SPEECH_KEY;
      if (!region || !key) return res.status(500).json({ error: "Azure Speech is not configured on the server yet" });
      const url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=fr-FR&format=detailed";
      const r = await fetch(url, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000", "Accept": "application/json" },
        body: audio
      });
      const data = await r.json();
      if (!r.ok) return res.status(500).json({ error: "Transcription failed" });
      const best = data.NBest && data.NBest[0];
      const text = (best && (best.Display || best.Lexical)) || data.DisplayText || "";
      const conf = best && best.Confidence != null ? best.Confidence : null;
      res.json({ text: text, confidence: conf, status: data.RecognitionStatus || null });
    } catch (e) { console.error("delfTranscribe", e); res.status(500).json({ error: "Could not transcribe" }); }
  });

  // Rubric grading of a written or spoken production.
  app.post("/api/gradeDelfMock", express.json({ limit: "200kb" }), async (req, res) => {
    try {
      const b = req.body || {};
      const rubric = RUBRICS[b.rubric];
      if (!rubric) return res.status(400).json({ error: "unknown rubric" });
      const responses = Array.isArray(b.responses) ? b.responses.slice(0, 8) : [];
      const text = responses.map(function (r, i) {
        return "TASK " + (i + 1) + ": " + String(r.task || "").slice(0, 600) + "\nCANDIDATE " + (rubric.kind === "po" ? "(speech transcript)" : "") + ": " + String(r.response || "").slice(0, 4000);
      }).join("\n\n");
      if (!text.trim() || responses.every(function (r) { return !String(r.response || "").trim(); })) {
        return res.json(zero(rubric, "No answer was given."));
      }
      const ep = process.env.AZURE_OPENAI_ENDPOINT, key = process.env.AZURE_OPENAI_KEY, dep = process.env.AZURE_OPENAI_DEPLOYMENT;
      if (!ep || !key || !dep) return res.status(500).json({ error: "Azure OpenAI is not configured on the server yet" });

      const crit = rubric.criteria.map(function (c) { return '- "' + c.k + '" (0 to ' + c.max + "): " + c.l + ". " + c.d; }).join("\n");
      const sys = "You are an experienced DELF examiner marking a practice exam at CEFR level " + String(rubric.level).toUpperCase() + " (" + (rubric.kind === "po" ? "oral production, spoken transcript produced by speech recognition: do not penalise punctuation, capitalisation or minor recognition errors" : "written production") + "). " +
        "Mark strictly but fairly against the official DELF grid, for the level only. Answer in English except for French quotations. " +
        "Score each criterion with a whole number between 0 and its maximum. If the response is off-topic, far too short or mostly not French, score low. " +
        'Reply ONLY with JSON: {"scores":{<key>:<number>,...},"strengths":"2-3 sentences","improvements":"2-3 sentences","correction":"one short corrected phrase taken from the candidate or empty"}\nCriteria:\n' + crit;
      const url = ep.replace(/\/$/, "") + "/openai/deployments/" + dep + "/chat/completions?api-version=2024-08-01-preview";
      const r = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json", "api-key": key },
        body: JSON.stringify({ messages: [{ role: "system", content: sys }, { role: "user", content: text }], temperature: 0.2, max_tokens: 600, response_format: { type: "json_object" } })
      });
      const data = await r.json();
      if (!r.ok) { console.error("gradeDelfMock azure", data); return res.status(500).json({ error: "Grading request failed" }); }
      const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      let p; try { p = JSON.parse(raw); } catch (e) { return res.status(500).json({ error: "Could not parse grading result" }); }
      const scores = {}; let total = 0;
      rubric.criteria.forEach(function (c) {
        let v = Number(p && p.scores && p.scores[c.k]); if (!isFinite(v)) v = 0;
        v = Math.max(0, Math.min(c.max, Math.round(v))); scores[c.k] = v; total += v;
      });
      const max = rubric.criteria.reduce(function (a, c) { return a + c.max; }, 0);
      res.json({ rubric: b.rubric, scores: scores, total: total, max: max, strengths: String(p.strengths || ""), improvements: String(p.improvements || ""), correction: String(p.correction || ""), criteria: rubric.criteria.map(function (c) { return { k: c.k, l: c.l, max: c.max }; }) });
    } catch (e) { console.error("gradeDelfMock", e); res.status(500).json({ error: "Could not grade" }); }
  });

  function zero(rubric, msg) {
    const scores = {}; rubric.criteria.forEach(function (c) { scores[c.k] = 0; });
    return { rubric: null, scores: scores, total: 0, max: rubric.criteria.reduce(function (a, c) { return a + c.max; }, 0), strengths: "", improvements: msg, correction: "", criteria: rubric.criteria.map(function (c) { return { k: c.k, l: c.l, max: c.max }; }) };
  }

  // Save one finished attempt for the signed-in candidate.
  app.post("/api/delfMockSave", express.json({ limit: "400kb" }), async (req, res) => {
    try {
      const uid = await getUid(req);
      if (!uid) return res.status(401).json({ error: "authentication required" });
      const b = req.body || {};
      if (!/^(tp|jr|pr)-(a11|a1|a2|b1|b2)-\d{2}$/.test(String(b.mockId || ""))) return res.status(400).json({ error: "bad mock id" });
      const num = function (x) { x = Number(x); return isFinite(x) ? Math.max(0, Math.min(25, Math.round(x * 10) / 10)) : 0; };
      const sc = { co: num(b.scores && b.scores.co), ce: num(b.scores && b.scores.ce), pe: num(b.scores && b.scores.pe), po: num(b.scores && b.scores.po) };
      const total = Math.round((sc.co + sc.ce + sc.pe + sc.po) * 10) / 10;
      const passed = total >= 50 && sc.co >= 5 && sc.ce >= 5 && sc.pe >= 5 && sc.po >= 5;
      const doc = {
        mockId: b.mockId, scores: sc, total: total, passed: passed,
        feedback: { pe: b.feedback && b.feedback.pe || null, po: b.feedback && b.feedback.po || null },
        answers: String(JSON.stringify(b.answers || {})).slice(0, 60000),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const ref = await db.collection("delfMockResults").doc(uid).collection("attempts").add(doc);
      res.json({ ok: true, id: ref.id, total: total, passed: passed });
    } catch (e) { console.error("delfMockSave", e); res.status(500).json({ error: "Could not save" }); }
  });

  app.get("/api/delfMockHistory", async (req, res) => {
    try {
      const uid = await getUid(req);
      if (!uid) return res.status(401).json({ error: "authentication required" });
      const snap = await db.collection("delfMockResults").doc(uid).collection("attempts").orderBy("createdAt", "desc").limit(100).get();
      const items = snap.docs.map(function (d) {
        const x = d.data(); return { id: d.id, mockId: x.mockId, scores: x.scores, total: x.total, passed: x.passed, at: x.createdAt && x.createdAt.toMillis ? x.createdAt.toMillis() : null };
      });
      res.json({ items: items });
    } catch (e) { console.error("delfMockHistory", e); res.status(500).json({ error: "Could not load" }); }
  });
};
