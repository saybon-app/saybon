// DELF journey: strict step-by-step course per level, plus multi-voice listening audio.
//   GET  /api/delf/journey?level=a2                         (Bearer) -> steps with status, scores
//   POST /api/delf/journey/lesson      {level, step}        (Bearer) -> marks an OPEN lesson done
//   POST /api/delf/journey/skill-mock  {level, skill, mockId, score}   score is out of 25
//   POST /api/delf/journey/skip-remedial {level, skill}
//   POST /api/delf/narrate {text}   -> English teacher voice (mp3)
//   POST /api/delf/tts-lines {lines:[{v:"F"|"H"|"N", t}], level}   -> audio/mpeg (one file, several voices)
// Order per level: for each skill (co, ce, pe, po): lessons 1-4, skill mock, then (only if the mock is under 50%)
// two optional extra lessons, then the next skill. Finally full mock 1 and full mock 2. Only the next step is open.
module.exports = function (app, ctx) {
  var admin = ctx.admin, db = ctx.db, express = ctx.express;
  var LEVELS = ["a1", "a2", "b1", "b2", "c1"];
  var SKILLS = ["co", "ce", "pe", "po"];
  var PASS = 12.5;                                     // 50% of a 25-point paper
  var SKILL_MOCK_N = { co: 1, ce: 2, pe: 3, po: 4 };   // tp-<level>-01..04 give the single-paper mocks
  var FULL_N = [5, 6];                                 // tp-<level>-05 and -06 are the two full mocks
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var mockId = function (level, n) { return "tp-" + level + "-" + pad(n); };

  async function auth(req, res) {
    var h = req.headers.authorization || "";
    if (h.indexOf("Bearer ") !== 0) { res.status(401).json({ error: "authentication required" }); return null; }
    try { return await admin.auth().verifyIdToken(h.slice(7)); } catch (e) { res.status(401).json({ error: "authentication failed" }); return null; }
  }
  async function owns(uid, level) {
    try { var s = await db.collection("delfAccess").doc(uid).get(); var d = s.exists ? s.data() : {}; return !!(d[level] && d[level].granted); } catch (e) { return false; }
  }
  async function loadProgress(uid, level) {
    var s = await db.collection("delfJourney").doc(uid).get(); var all = s.exists ? s.data() : {};
    var p = all[level] || {}; return { done: p.done || {}, skillMocks: p.skillMocks || {}, skipped: p.skipped || {} };
  }
  async function saveProgress(uid, level, p) {
    var o = {}; o[level] = p; await db.collection("delfJourney").doc(uid).set(o, { merge: true });
  }
  async function fullResults(uid, level) {
    var ids = FULL_N.map(function (n) { return mockId(level, n); }), out = {};
    try {
      var snap = await db.collection("delfMockResults").doc(uid).collection("attempts").where("mockId", "in", ids).limit(40).get();
      snap.docs.forEach(function (d) { var x = d.data(); if (!out[x.mockId] || x.total > out[x.mockId].total) out[x.mockId] = { total: x.total, passed: !!x.passed }; });
    } catch (e) { console.error("journey fullResults", e.message); }
    return out;
  }

  // Build the ordered list with a status for every step.
  function build(level, p, full) {
    var steps = [], prevOk = true;                    // prevOk: everything before is done (and any extra-lesson choice resolved)
    SKILLS.forEach(function (sk) {
      var lessonDone = true;
      for (var n = 1; n <= 4; n++) {
        var id = level + "-" + sk + "-" + n, done = !!p.done[id];
        steps.push({ id: id, kind: "lesson", skill: sk, n: n, status: done ? "done" : (prevOk ? "open" : "locked") });
        if (done) { /* stays ok */ } else { prevOk = false; lessonDone = false; }
      }
      var mid = level + "-" + sk + "-mock", sm = p.skillMocks[sk], mdone = !!(sm && p.done[mid]);
      steps.push({ id: mid, kind: "skillmock", skill: sk, mockId: mockId(level, SKILL_MOCK_N[sk]), status: mdone ? "done" : (prevOk ? "open" : "locked"),
        score: sm ? sm.score : null, pct: sm ? Math.round(sm.score / 25 * 100) : null, passed: sm ? sm.score >= PASS : null });
      if (!mdone) prevOk = false;
      var need = !!(sm && sm.score < PASS);
      var r1 = level + "-" + sk + "-r1", r2 = level + "-" + sk + "-r2";
      var r1d = !!p.done[r1], r2d = !!p.done[r2], skipped = !!p.skipped[sk];
      steps.push({ id: r1, kind: "remedial", skill: sk, n: 1, hidden: !need, status: r1d ? "done" : (need && mdone ? "open" : "locked") });
      steps.push({ id: r2, kind: "remedial", skill: sk, n: 2, hidden: !need, status: r2d ? "done" : (need && mdone && r1d ? "open" : "locked") });
      var resolved = !need || (r1d && r2d) || skipped;
      if (need && !resolved) prevOk = false;           // the learner must choose: take the extra lessons or skip them
      steps[steps.length - 1].choice = need && mdone && !resolved ? true : undefined;
    });
    FULL_N.forEach(function (n, i) {
      var id = mockId(level, n), r = full[id], done = !!r;
      steps.push({ id: "full" + (i + 1), kind: "full", mockId: id, status: done ? "done" : (prevOk ? "open" : "locked"), score: r ? r.total : null, passed: r ? r.passed : null });
      if (!done) prevOk = false;
    });
    return steps;
  }
  function find(steps, id) { for (var i = 0; i < steps.length; i++) if (steps[i].id === id) return steps[i]; return null; }
  async function guard(req, res) {
    var who = await auth(req, res); if (!who) return null;
    var level = String((req.body && req.body.level) || req.query.level || "").toLowerCase();
    if (LEVELS.indexOf(level) < 0) { res.status(400).json({ error: "unknown level" }); return null; }
    if (!(await owns(who.uid, level))) { res.status(403).json({ error: "this level is not unlocked" }); return null; }
    return { uid: who.uid, level: level };
  }

  app.get("/api/delf/journey", async function (req, res) {
    try {
      var g = await guard(req, res); if (!g) return;
      var p = await loadProgress(g.uid, g.level), full = await fullResults(g.uid, g.level);
      res.json({ level: g.level, passPct: 50, steps: build(g.level, p, full) });
    } catch (e) { console.error("journey get", e); res.status(500).json({ error: "could not load your journey" }); }
  });

  app.post("/api/delf/journey/lesson", express.json({ limit: "2kb" }), async function (req, res) {
    try {
      var g = await guard(req, res); if (!g) return;
      var id = String(req.body.step || "");
      var p = await loadProgress(g.uid, g.level), steps = build(g.level, p, await fullResults(g.uid, g.level)), st = find(steps, id);
      if (!st || (st.kind !== "lesson" && st.kind !== "remedial")) return res.status(400).json({ error: "unknown lesson" });
      if (st.status === "locked") return res.status(409).json({ error: "finish the previous step first" });
      if (st.status !== "done") { p.done[id] = Date.now(); await saveProgress(g.uid, g.level, p); }
      res.json({ ok: true });
    } catch (e) { console.error("journey lesson", e); res.status(500).json({ error: "could not save" }); }
  });

  app.post("/api/delf/journey/skill-mock", express.json({ limit: "2kb" }), async function (req, res) {
    try {
      var g = await guard(req, res); if (!g) return;
      var sk = String(req.body.skill || ""), score = Number(req.body.score);
      if (SKILLS.indexOf(sk) < 0 || !isFinite(score)) return res.status(400).json({ error: "bad request" });
      score = Math.max(0, Math.min(25, Math.round(score * 10) / 10));
      var p = await loadProgress(g.uid, g.level), steps = build(g.level, p, await fullResults(g.uid, g.level)), st = find(steps, g.level + "-" + sk + "-mock");
      if (!st || st.status === "locked") return res.status(409).json({ error: "finish the lessons first" });
      var prev = p.skillMocks[sk];
      p.skillMocks[sk] = { score: score, mockId: String(req.body.mockId || "").slice(0, 20), at: Date.now() };
      p.done[g.level + "-" + sk + "-mock"] = Date.now();
      if (score >= PASS || (prev && prev.score < PASS && score >= PASS)) { delete p.skipped[sk]; }
      await saveProgress(g.uid, g.level, p);
      res.json({ ok: true, score: score, pct: Math.round(score / 25 * 100), passed: score >= PASS });
    } catch (e) { console.error("journey skill-mock", e); res.status(500).json({ error: "could not save" }); }
  });

  app.post("/api/delf/journey/skip-remedial", express.json({ limit: "2kb" }), async function (req, res) {
    try {
      var g = await guard(req, res); if (!g) return;
      var sk = String(req.body.skill || ""), p = await loadProgress(g.uid, g.level);
      if (SKILLS.indexOf(sk) < 0 || !p.skillMocks[sk] || p.skillMocks[sk].score >= PASS) return res.status(400).json({ error: "nothing to skip" });
      p.skipped[sk] = true; await saveProgress(g.uid, g.level, p); res.json({ ok: true });
    } catch (e) { console.error("journey skip", e); res.status(500).json({ error: "could not save" }); }
  });

  // ---- multi-voice listening audio ----
  var cache = new Map(), CACHE_MAX = 200;
  var RATE = { a1: "-18%", a2: "-12%", b1: "-6%", b2: "0%", c1: "0%" };
  var VOICE = { F: "fr-FR-DeniseNeural", H: "fr-FR-HenriNeural", N: "fr-FR-DeniseNeural" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function ssml(lines, level, plain) {
    var rate = RATE[level] || "-10%";
    // the pause sits INSIDE each voice element: that is the form Azure accepts
    var body = lines.map(function (l) {
      var inner = plain ? esc(l.t) : '<prosody rate="' + rate + '">' + esc(l.t) + "</prosody>";
      var br = plain ? "" : '<break time="' + (l.v === "N" ? "700ms" : "400ms") + '"/>';
      return '<voice name="' + (VOICE[l.v] || VOICE.F) + '">' + inner + br + "</voice>";
    }).join("");
    return '<speak version="1.0" xml:lang="fr-FR" xmlns="http://www.w3.org/2001/10/synthesis">' + body + "</speak>";
  }
  app.post("/api/delf/tts-lines", express.json({ limit: "40kb" }), async function (req, res) {
    try {
      var who = await auth(req, res); if (!who) return;
      var lines = Array.isArray(req.body && req.body.lines) ? req.body.lines.slice(0, 40) : [];
      lines = lines.map(function (l) { return { v: String(l.v || "F").toUpperCase().charAt(0), t: String(l.t || "").trim() }; }).filter(function (l) { return l.t; });
      var total = lines.reduce(function (a, l) { return a + l.t.length; }, 0);
      if (!lines.length || total > 4000) return res.status(400).json({ error: "text missing or too long" });
      var level = String(req.body.level || "").toLowerCase();
      var key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) return res.status(500).json({ error: "speech service is not configured" });
      var ck = level + "|" + JSON.stringify(lines), hit = cache.get(ck);
      if (!hit) {
        var r = null, variants = [ssml(lines, level, false), ssml(lines, level, true)];
        for (var i = 0; i < variants.length; i++) {
          r = await fetch("https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1", {
            method: "POST",
            headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "saybon-delf-tts" },
            body: variants[i]
          });
          if (r.ok) break;
          var msg = ""; try { msg = (await r.text()).slice(0, 300); } catch (e) {}
          console.error("DELF tts-lines Azure error", r.status, "variant", i, msg);
          if (r.status !== 400) break;
        }
        if (!r.ok) return res.status(502).json({ error: "speech synthesis failed (" + r.status + ")" });
        hit = Buffer.from(await r.arrayBuffer());
        if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
        cache.set(ck, hit);
      }
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": hit.length, "Cache-Control": "private, max-age=86400" });
      res.send(hit);
    } catch (e) { console.error("DELF tts-lines", e); res.status(500).json({ error: "could not create audio" }); }
  });
  // ---- English teacher voice for the lessons (French words in «guillemets» are spoken in French) ----
  var ncache = new Map();
  function nSsml(text, mode) {
    var t = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var voice = mode === 2 ? "en-GB-SoniaNeural" : "en-US-AvaMultilingualNeural";
    if (mode === 0) t = t.replace(/«\s*([^»]+?)\s*»/g, '<lang xml:lang="fr-FR">$1</lang>');
    else t = t.replace(/[«»]/g, "");
    return '<speak version="1.0" xml:lang="en-US" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="' + voice + '"><prosody rate="-8%">' + t + "</prosody></voice></speak>";
  }
  app.post("/api/delf/narrate", express.json({ limit: "8kb" }), async function (req, res) {
    try {
      var who = await auth(req, res); if (!who) return;
      var text = String((req.body && req.body.text) || "").trim();
      if (!text || text.length > 1200) return res.status(400).json({ error: "text missing or too long" });
      var key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) return res.status(500).json({ error: "speech service is not configured" });
      var hit = ncache.get(text);
      if (!hit) {
        var r = null;
        for (var m = 0; m < 3; m++) {
          r = await fetch("https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1", {
            method: "POST",
            headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "saybon-delf-narrate" },
            body: nSsml(text, m)
          });
          if (r.ok) break;
          var msg = ""; try { msg = (await r.text()).slice(0, 300); } catch (e) {}
          console.error("DELF narrate Azure error", r.status, "variant", m, msg);
          if (r.status !== 400) break;
        }
        if (!r.ok) return res.status(502).json({ error: "speech synthesis failed (" + r.status + ")" });
        hit = Buffer.from(await r.arrayBuffer());
        if (ncache.size >= 150) ncache.delete(ncache.keys().next().value);
        ncache.set(text, hit);
      }
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": hit.length, "Cache-Control": "private, max-age=86400" });
      res.send(hit);
    } catch (e) { console.error("DELF narrate", e); res.status(500).json({ error: "could not create audio" }); }
  });
};
