import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
/* SayBon reading lesson engine (A1-C2). Config in READ below, keyed "<level>-<lesson>". */
var uid = null; onAuthStateChanged(auth, function(u){ uid = u ? u.uid : null; });
var API = "https://saybonapp-server.onrender.com", AU = "/assets/audio/lessons/";
var pp = location.pathname.split("/").filter(Boolean), LEVEL = (pp[1] || "a1").toLowerCase();
var LESSON = parseInt((location.pathname.match(/lesson(\d+)\.html/) || [null, "6"])[1]);
var KEY = LEVEL + "-" + LESSON;
var READ = {}, C = null;
var root = document.getElementById("lsRoot");
var EN = (LEVEL === "a1" || LEVEL === "a2");
var T = EN ? { start: "Start", rec: "Record", stop: "Stop", skip: "Skip", again: "Try again", next: "Next", nextP: "Next passage", fin: "Finish", redo: "Redo lesson", back: "Back to lessons",
  hear: "I couldn't hear you. Try again.", err: "Could not score. Try again.", scoring: "Scoring...", good: "Very good!", fix: "Listen to the correct version.", done: "Lesson complete", well: "Well done.", passage: "Passage", all: "Read the whole text now.", overall: "Overall", fixing: "Let's fix these lines.", yourScore: "Your reading", perfect: "Nothing to correct. Excellent.", mic: "Microphone blocked. Allow it, then try again.", listen: "Listen..." }
 : { start: "Commencer", rec: "Enregistrer", stop: "Arrêter", skip: "Passer", again: "Réessayer", next: "Suivant", nextP: "Texte suivant", fin: "Terminer", redo: "Refaire la leçon", back: "Retour aux leçons",
  hear: "Je ne vous ai pas entendu. Réessayez.", err: "Évaluation impossible. Réessayez.", scoring: "Évaluation…", good: "Très bien !", fix: "Écoutez la bonne version.", done: "Leçon terminée", well: "Bien joué.", passage: "Texte", all: "Lisez maintenant tout le texte.", overall: "Note globale", fixing: "Corrigeons ces phrases.", yourScore: "Votre lecture", perfect: "Rien à corriger. Excellent.", mic: "Micro bloqué. Autorisez-le, puis réessayez.", listen: "Écoutez…" };
var LEN = { a1: { g: .77, f: 28 }, a2: { g: .86, f: 17 } }[LEVEL] || null;
var THR = { a1: 60, a2: 65, b1: 70, b2: 75, c1: 80, c2: 82 }[LEVEL] || 70;
var st = document.createElement("style");
st.textContent = ".rd{max-width:760px;margin:0 auto;padding:84px 18px 40px;color:#fff;font-family:Manrope,system-ui,sans-serif}.rd h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:1.5rem;margin:0 0 6px}.rd .sub{opacity:.7;margin:0 0 16px;font-size:.95rem}.rd .card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px 20px;margin:0 0 16px}.rd .txt{font-size:1.22rem;line-height:1.75}.rd .txt s{text-decoration:none}.rd .sn{display:inline;padding:2px 4px;border-radius:6px;transition:background .2s}.rd .sn.cur{background:rgba(255,255,255,.16)}.rd .sn.ok{color:#9be7b0}.rd .w.bad{color:#ff9d9d;text-decoration:underline wavy #ff9d9d}.rd .bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px}.rd button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:12px 22px;cursor:pointer;background:rgba(255,255,255,.14);color:#fff}.rd button.pri{background:#fff;color:#1a1a2e}.rd button.rec{background:#e5484d;color:#fff}.rd button:disabled{opacity:.5}.rd .big{font-size:2.6rem;font-weight:800;margin:4px 0}.rd .st{min-height:1.4em;opacity:.85;margin:8px 0}.rd .row{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.95rem}.rd .row b{white-space:nowrap}";
document.head.appendChild(st);
function esc(s) { return String(s).replace(/[&<>"]/g, function(c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
var curAudio = null;
function play(name) { return new Promise(function(res) { try { var a = new Audio(AU + name + ".mp3?v=1"); curAudio = a; a.onended = a.onerror = function() { res(); }; var p = a.play(); if (p && p.catch) p.catch(function() { res(); }); } catch (e) { res(); } }); }
/* ---- audio to 16 kHz wav (same as the other lessons) ---- */
function decode16(blob) { return blob.arrayBuffer().then(function(ab) { var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); return new Promise(function(res, rej) { ac.decodeAudioData(ab, res, rej); }).then(function(buf) { try { ac.close(); } catch (e) {} var len = Math.max(1, Math.ceil(buf.duration * 16000)), oc = new OfflineAudioContext(1, len, 16000), src = oc.createBufferSource(); src.buffer = buf; src.connect(oc.destination); src.start(); return oc.startRendering(); }); }).then(function(o) { return o.getChannelData(0); }); }
function pcmToWav(d) { var n = d.length, pk = 0, i; for (i = 0; i < n; i++) { var a = Math.abs(d[i]); if (a > pk) pk = a; } var gain = (pk > 0.005 && pk < 0.7) ? 0.85 / pk : 1; var bf = new ArrayBuffer(44 + n * 2), v = new DataView(bf); function w(o, t) { for (var k = 0; k < t.length; k++) v.setUint8(o + k, t.charCodeAt(k)); } w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true); for (i = 0; i < n; i++) { var x = Math.max(-1, Math.min(1, d[i] * gain)); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); } var wb = new Blob([bf], { type: "audio/wav" }); wb.pk = pk; return wb; }
function pickScore(d) { var keys = ["finalScore", "score", "AccuracyScore", "accuracyScore", "pronunciationScore", "PronScore", "pronScore", "overallScore", "OverallScore", "overall", "total"]; function num(v) { return typeof v === "number" && isFinite(v) ? v : (typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : null); } function look(o, dep) { if (!o || typeof o !== "object" || dep > 4) return null; for (var i = 0; i < keys.length; i++) { var n = num(o[keys[i]]); if (n !== null) return n; } for (var k in o) { if (o[k] && typeof o[k] === "object") { var r = look(o[k], dep + 1); if (r !== null) return r; } } return null; } return look(d, 0); }
/* ---- microphone ---- */
var stream = null;
function getStream() { if (stream && stream.active) return Promise.resolve(stream); return navigator.mediaDevices.getUserMedia({ audio: true }).then(function(s) { stream = s; return s; }); }
function stopStream() { try { if (stream) stream.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {} stream = null; }
/* shows a Record/Stop/Skip bar in `bar`; resolves with a blob, or null when skipped */
function record(bar, capMs, status) {
  return new Promise(function(resolve) {
    bar.innerHTML = '<button class="rec" id="rdRec">' + T.rec + '</button><button id="rdSkip">' + T.skip + '</button>';
    var rb = bar.querySelector("#rdRec"), sb = bar.querySelector("#rdSkip"), mr = null, chunks = [], timer = null, done = false;
    function fin(b) { if (done) return; done = true; clearTimeout(timer); bar.innerHTML = ""; resolve(b); }
    sb.onclick = function() { try { if (mr && mr.state === "recording") { mr.onstop = null; mr.stop(); } } catch (e) {} fin(null); };
    rb.onclick = function() {
      if (mr && mr.state === "recording") { mr.stop(); return; }
      getStream().then(function(s) {
        chunks = []; mr = new MediaRecorder(s);
        mr.ondataavailable = function(e) { if (e.data && e.data.size) chunks.push(e.data); };
        mr.onstop = function() { fin(new Blob(chunks, { type: mr.mimeType || "audio/webm" })); };
        mr.start(); rb.textContent = T.stop; if (status) status.textContent = "";
        timer = setTimeout(function() { try { if (mr.state === "recording") mr.stop(); } catch (e) {} }, capMs);
      }).catch(function() { if (status) status.textContent = T.mic; });
    };
  });
}
/* grade a recording against reference text -> {v, marks:[bool bad], quiet, err} */
function grade(blob, ref) {
  return decode16(blob).then(pcmToWav).then(function(wb) {
    if (wb.pk < 0.012) return { quiet: true };
    return fetch(API + "/api/assessPronunciation?referenceText=" + encodeURIComponent(ref), { method: "POST", body: wb }).then(function(r) { return r.json(); }).then(function(j) {
      var items = (j && j.wordFeedback) || [], non = items.filter(function(x) { return x && x.errorType !== "Insertion"; }), rw = ref.split(/\s+/).filter(Boolean), raw, marks = null;
      if (non.length && non.length === rw.length) {
        var sc = non.map(function(x) { return x.errorType === "Omission" ? 0 : (typeof x.accuracyScore === "number" ? x.accuracyScore : 0); });
        raw = sc.reduce(function(a, b) { return a + b; }, 0) / sc.length; marks = sc.map(function(s) { return s < 60; });
      } else { raw = pickScore(j); if (raw === null) raw = 0; }
      var v = Math.round(raw);
      if (raw < 8) return { quiet: true };
      if (LEN) { v = Math.max(Math.round(100 * Math.pow(Math.min(100, raw) / 100, LEN.g)), LEN.f); }
      return { v: Math.min(100, v), marks: marks };
    });
  }).catch(function() { return { err: true }; });
}
function words(t, marks) { var ws = t.split(/(\s+)/), k = 0; return ws.map(function(w) { if (/^\s+$/.test(w) || !w) return w; var bad = marks && marks[k]; k++; return '<span class="w' + (bad ? " bad" : "") + '">' + esc(w) + "</span>"; }).join(""); }
function complete() { try { if (uid) fetch(API + "/api/levelProgressComplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: uid, level: LEVEL, lesson: LESSON }) }).catch(function() {}); } catch (e) {} stopStream();
  root.innerHTML = '<div class="rd"><div class="card" style="text-align:center"><h2>' + T.done + '</h2><p class="sub">' + T.well + '</p><div class="bar" style="justify-content:center"><button class="pri" id="rdRedo">' + T.redo + '</button><button id="rdBack">' + T.back + '</button></div></div></div>';
  document.getElementById("rdRedo").onclick = function() { location.reload(); }; document.getElementById("rdBack").onclick = function() { location.href = "./"; }; }
/* one graded reading of `ref`. Returns the result; loops on quiet/err until a grade or a skip (null) */
async function readOnce(ref, bar, status, cap) {
  for (;;) {
    var b = await record(bar, cap, status);
    if (!b) return null;
    status.textContent = T.scoring;
    var g = await grade(b, ref);
    if (g.quiet) { status.textContent = T.hear; continue; }
    if (g.err) { status.textContent = T.err; continue; }
    status.textContent = ""; return g;
  }
}
function view(html) { root.innerHTML = '<div class="rd">' + html + "</div>"; return root.firstChild; }
async function intro() {
  var el = view('<h2>' + esc(C.title) + '</h2><p class="sub">' + esc(C.sub) + '</p><div class="card"><div class="bar"><button class="pri" id="rdGo">' + T.start + '</button></div></div>');
  await new Promise(function(r) { document.getElementById("rdGo").onclick = r; });
  el.querySelector(".card").innerHTML = '<p class="sub">' + T.listen + "</p>";
  await play(C.intro);
}
/* ---------- guided mode (A1, A2) ---------- */
async function guided() {
  for (var pi = 0; pi < C.passages.length; pi++) {
    var P = C.passages[pi], S = P.sents, sc = new Array(S.length), el;
    function draw(cur, marksArr) { el.querySelector(".txt").innerHTML = S.map(function(s, i) { return '<span class="sn' + (i === cur ? " cur" : "") + (sc[i] >= THR ? " ok" : "") + '">' + words(s.t, marksArr && marksArr[i]) + "</span>"; }).join(" "); }
    el = view('<h2>' + T.passage + " " + (pi + 1) + "/" + C.passages.length + '</h2><div class="card"><div class="txt"></div></div><div class="st" id="rdSt"></div><div class="card" id="rdBarC"><div class="bar" id="rdBar"></div></div>');
    var status = el.querySelector("#rdSt"), bar = el.querySelector("#rdBar"), marks = [];
    draw(-1, marks);
    if (pi === 0) await play("R_en_start");
    status.textContent = T.listen; await play(P.audio); status.textContent = "";
    for (var i = 0; i < S.length; i++) {
      draw(i, marks);
      if (i === 0) { status.textContent = T.listen; await play(S[0].a); await play("R_en_readme"); status.textContent = ""; }
      else await play("R_en_alone");
      var g = await readOnce(S[i].t, bar, status, 30000);
      if (g === null) continue;
      sc[i] = g.v; marks[i] = g.marks;
      if (g.v < THR) {
        draw(i, marks); status.textContent = T.fix; await play("R_en_fix"); await play(S[i].a); await play("R_en_again"); status.textContent = "";
        var g2 = await readOnce(S[i].t, bar, status, 30000);
        if (g2) { sc[i] = g2.v; marks[i] = g2.marks; }
      } else { status.textContent = T.good + " " + g.v + "%"; await play("R_en_good"); }
    }
    draw(-1, marks);
    /* whole passage, graded */
    var whole = S.map(function(s) { return s.t; }).join(" "), res, ok = false;
    status.textContent = T.all; await play("R_en_all"); status.textContent = "";
    for (;;) {
      res = await readOnce(whole, bar, status, 60000);
      var last = pi === C.passages.length - 1;
      el.querySelector("#rdBarC").innerHTML = '<div class="big">' + (res ? res.v + "%" : "—") + '</div><div class="bar"><button id="rdAg">' + T.again + '</button><button class="pri" id="rdNx">' + (last ? T.fin : T.nextP) + "</button></div>";
      if (res && res.marks && res.marks.length) { var mm = [], kk = 0; S.forEach(function(s, j) { var n = s.t.split(/\s+/).filter(Boolean).length; mm[j] = res.marks.slice(kk, kk + n); kk += n; }); draw(-1, mm); }
      var act = await new Promise(function(r) { el.querySelector("#rdAg").onclick = function() { r("again"); }; el.querySelector("#rdNx").onclick = function() { r("next"); }; });
      if (act === "next") break;
      el.querySelector("#rdBarC").innerHTML = '<div class="bar" id="rdBar"></div>'; bar = el.querySelector("#rdBar");
    }
  }
  complete();
}
/* ---------- full-text mode (B1 - C2): read it all, strict grading, then corrections ---------- */
async function full() {
  var S = C.sents, sc = new Array(S.length), marks = new Array(S.length), el;
  function draw(cur) { el.querySelector(".txt").innerHTML = S.map(function(s, i) { return '<span class="sn' + (i === cur ? " cur" : "") + '">' + words(s.t, marks[i]) + "</span>"; }).join(" "); }
  el = view('<h2>' + esc(C.title) + '</h2><div class="card"><div class="txt"></div></div><div class="st" id="rdSt"></div><div class="card" id="rdBarC"><div class="bar" id="rdBar"></div></div>');
  var status = el.querySelector("#rdSt"), bar = el.querySelector("#rdBar");
  draw(-1); await play("R_fr_start");
  for (var i = 0; i < S.length; i++) { draw(i); var g = await readOnce(S[i].t, bar, status, 40000); if (g) { sc[i] = g.v; marks[i] = g.marks; } else sc[i] = 0; }
  draw(-1);
  var bad = [];
  S.forEach(function(s, i) { if (sc[i] < THR) bad.push(i); });
  if (bad.length) {
    status.textContent = T.fixing; await play("R_fr_fixing"); status.textContent = "";
    for (var k = 0; k < bad.length; k++) {
      var j = bad[k]; draw(j); status.textContent = T.fix; await play("R_fr_fix"); await play(S[j].a); await play("R_fr_again"); status.textContent = "";
      var g2 = await readOnce(S[j].t, bar, status, 40000); if (g2) { sc[j] = Math.max(sc[j], g2.v); marks[j] = g2.marks; }
    }
    draw(-1);
  } else { status.textContent = T.perfect; await play("R_fr_perfect"); }
  var avg = Math.round(sc.reduce(function(a, b) { return a + b; }, 0) / sc.length);
  el.querySelector("#rdBarC").innerHTML = '<p class="sub">' + T.overall + '</p><div class="big">' + avg + '%</div>' + S.map(function(s, i) { return '<div class="row"><span>' + esc(s.t.length > 54 ? s.t.slice(0, 54) + "…" : s.t) + "</span><b>" + sc[i] + '%</b></div>'; }).join("") + '<div class="bar" style="margin-top:12px"><button id="rdAg">' + T.again + '</button><button class="pri" id="rdNx">' + T.fin + "</button></div>";
  var act = await new Promise(function(r) { el.querySelector("#rdAg").onclick = function() { r("again"); }; el.querySelector("#rdNx").onclick = function() { r("next"); }; });
  if (act === "again") { location.reload(); return; }
  complete();
}
(async function() {
  try { READ = await (await fetch("/levels/reading-data.json?t=" + Date.now())).json(); C = READ[KEY]; } catch (e) {}
  if (!C) { root.innerHTML = '<div class="rd"><div class="card">' + (EN ? "This reading lesson is not ready yet." : "Cette leçon de lecture n'est pas encore prête.") + "</div></div>"; return; }
  await intro();
  if (C.mode === "guided") await guided(); else await full();
})();
