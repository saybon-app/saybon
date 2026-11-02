// DELF placement: real marking of the writing and speaking answers.
//   POST /api/delf/grade-writing   { attemptId, level, prompt }            (JSON)
//   POST /api/delf/grade-speaking?attemptId=..&level=..&prompt=..          (body: audio/wav, 16 kHz mono)
// Writing: an AI examiner (Claude if ANTHROPIC_API_KEY is set, otherwise Azure OpenAI) scores it 0-100 for the level.
// Speaking: Azure Speech transcribes + rates pronunciation; the AI examiner scores the content; the two are blended.
module.exports = function (app, ctx) {
  var admin = ctx.admin, db = ctx.db, express = ctx.express;
  var LEVELS = ["a1","a2","b1","b2","c1","c2","prim","junior"];

  async function uidFrom(req, res) {
    var h = req.headers.authorization || "";
    var t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) { res.status(401).json({ error: "authentication required" }); return null; }
    try { return (await admin.auth().verifyIdToken(t)).uid; }
    catch (e) { res.status(401).json({ error: "authentication failed" }); return null; }
  }
  function attemptRef(uid, id) { return db.collection("delfPlacements").doc(uid).collection("attempts").doc(String(id)); }
  var clamp = function (n) { n = Math.round(Number(n)); return isFinite(n) ? Math.max(0, Math.min(100, n)) : null; };

  function parseJson(text) {
    try { return JSON.parse(String(text).replace(/```json|```/g, "").trim()); } catch (e) {}
    var m = String(text).match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
    return null;
  }

  async function llmJson(system, user) {
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        var r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 400, system: system, messages: [{ role: "user", content: user }] })
        });
        var d = await r.json();
        if (r.ok && d.content && d.content[0]) { var p = parseJson(d.content[0].text); if (p) return p; }
        else console.error("grading: Anthropic error", r.status, JSON.stringify(d).slice(0, 200));
      } catch (e) { console.error("grading: Anthropic failed", e.message); }
    }
    var ep = process.env.AZURE_OPENAI_ENDPOINT, key = process.env.AZURE_OPENAI_KEY, dep = process.env.AZURE_OPENAI_DEPLOYMENT;
    if (ep && key && dep) {
      try {
        var r2 = await fetch(ep.replace(/\/$/, "") + "/openai/deployments/" + dep + "/chat/completions?api-version=2024-08-01-preview", {
          method: "POST", headers: { "Content-Type": "application/json", "api-key": key },
          body: JSON.stringify({ messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.3, max_tokens: 400 })
        });
        var d2 = await r2.json();
        var txt = d2.choices && d2.choices[0] && d2.choices[0].message && d2.choices[0].message.content;
        if (r2.ok && txt) { var p2 = parseJson(txt); if (p2) return p2; }
        else console.error("grading: Azure OpenAI error", r2.status, JSON.stringify(d2).slice(0, 200));
      } catch (e) { console.error("grading: Azure OpenAI failed", e.message); }
    }
    return null;
  }

  var SYSTEM = function (level, skill) {
    return "You are a kind, fair DELF examiner marking a placement-test " + skill + " answer at CEFR level " + String(level).toUpperCase() + ". " +
      "Judge it against what is expected at THAT level, and be generous: reward communication and effort, do not nitpick small errors. " +
      "Score from 0 to 100 (about 50 means a pass at that level). " +
      "Reply with ONLY valid JSON, no markdown: {\"score\": <integer 0-100>, \"feedback\": \"<two or three short, encouraging sentences in English: one strength, one thing to improve, and one corrected example if useful>\"}";
  };

  app.post("/api/delf/grade-writing", express.json({ limit: "50kb" }), async function (req, res) {
    var uid = await uidFrom(req, res); if (!uid) return;
    try {
      var b = req.body || {}, level = String(b.level || "").toLowerCase();
      if (LEVELS.indexOf(level) < 0 || !b.attemptId) return res.status(400).json({ error: "bad request" });
      var ref = attemptRef(uid, b.attemptId), snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "attempt not found" });
      var text = String((snap.data() || {}).writingResponse || "").trim();
      if (!text) { await ref.update({ writingStatus: "skipped" }); return res.json({ ok: true, status: "skipped" }); }
      var g = await llmJson(SYSTEM(level, "writing"), "Task given to the candidate: " + String(b.prompt || "").slice(0, 600) + "\n\nCandidate's answer:\n" + text.slice(0, 4000));
      var score = g ? clamp(g.score) : null;
      if (score == null) { await ref.update({ writingStatus: "ungraded" }); return res.json({ ok: true, status: "ungraded" }); }
      var fb = String(g.feedback || "").slice(0, 700);
      await ref.update({ writingScore: score, writingFeedback: fb, writingStatus: "graded" });
      res.json({ ok: true, status: "graded", score: score });
    } catch (e) { console.error("grade-writing", e); res.status(500).json({ error: "could not grade writing" }); }
  });

  app.post("/api/delf/grade-speaking", express.raw({ type: ["audio/wav", "audio/x-wav", "application/octet-stream"], limit: "8mb" }), async function (req, res) {
    var uid = await uidFrom(req, res); if (!uid) return;
    try {
      var level = String(req.query.level || "").toLowerCase(), id = req.query.attemptId;
      if (LEVELS.indexOf(level) < 0 || !id) return res.status(400).json({ error: "bad request" });
      var audio = req.body;
      if (!Buffer.isBuffer(audio) || audio.length < 4000) return res.status(400).json({ error: "recording too short" });
      var ref = attemptRef(uid, id), snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "attempt not found" });
      var region = process.env.AZURE_SPEECH_REGION, key = process.env.AZURE_SPEECH_KEY;
      if (!region || !key) { await ref.update({ speakingStatus: "ungraded" }); return res.json({ ok: true, status: "ungraded" }); }
      var base = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=fr-FR&format=detailed";
      var hdr = { "Ocp-Apim-Subscription-Key": key, "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000", "Accept": "application/json" };

      // 1. what was said
      var r1 = await fetch(base, { method: "POST", headers: hdr, body: audio });
      var d1 = await r1.json().catch(function () { return {}; });
      if (!r1.ok) { console.error("grade-speaking STT", r1.status, JSON.stringify(d1).slice(0, 200)); await ref.update({ speakingStatus: "ungraded" }); return res.json({ ok: true, status: "ungraded" }); }
      var best = d1.NBest && d1.NBest[0];
      var transcript = String((best && (best.Display || best.Lexical)) || d1.DisplayText || "").trim();
      if (!transcript) {
        await ref.update({ speakingScore: 0, speakingTranscript: "", speakingStatus: "no_speech", speakingFeedback: "We could not hear any speech in this recording. Try again in a quiet place, close to the microphone." });
        return res.json({ ok: true, status: "no_speech" });
      }

      // 2. how clearly it was said (pronunciation / fluency), scored against what was recognised
      var pron = null;
      try {
        var cfg = { ReferenceText: transcript, GradingSystem: "HundredMark", Granularity: "Word", Dimension: "Comprehensive", EnableMiscue: false };
        var h2 = Object.assign({}, hdr, { "Pronunciation-Assessment": Buffer.from(JSON.stringify(cfg)).toString("base64") });
        var r2 = await fetch(base, { method: "POST", headers: h2, body: audio });
        var d2 = await r2.json().catch(function () { return {}; });
        var b2 = r2.ok && d2.NBest && d2.NBest[0];
        if (b2) {
          var raw = (b2.AccuracyScore || 0) * 0.5 + (b2.CompletenessScore || 0) * 0.3 + (b2.FluencyScore || 0) * 0.2;
          pron = raw <= 0 ? 0 : Math.min(100, Math.round(100 * Math.pow(raw / 100, 0.75)));
        }
      } catch (e) { console.error("grade-speaking PA", e.message); }

      // 3. what was said, judged by the examiner
      var g = await llmJson(SYSTEM(level, "speaking") + " The answer is a transcript of a spoken answer, so ignore punctuation and capital letters.",
        "Task given to the candidate: " + String(req.query.prompt || "").slice(0, 600) + "\n\nTranscript of the candidate's spoken answer:\n" + transcript.slice(0, 3000));
      var content = g ? clamp(g.score) : null;

      var final = (pron != null && content != null) ? Math.round(pron * 0.4 + content * 0.6) : (content != null ? content : pron);
      if (final == null) { await ref.update({ speakingStatus: "ungraded", speakingTranscript: transcript }); return res.json({ ok: true, status: "ungraded" }); }
      var fb = g && g.feedback ? String(g.feedback).slice(0, 700) : "Your pronunciation was scored. Detailed feedback is not available right now.";
      await ref.update({ speakingScore: final, speakingPronunciation: pron, speakingContent: content, speakingTranscript: transcript.slice(0, 2000), speakingFeedback: fb, speakingStatus: "graded" });
      res.json({ ok: true, status: "graded", score: final });
    } catch (e) { console.error("grade-speaking", e); res.status(500).json({ error: "could not grade speaking" }); }
  });
};
