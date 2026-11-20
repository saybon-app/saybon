import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
/* SayBon reading lesson engine v2 (A1-C2): typed heading, rolling whiteboard, teacher reads once, automatic recorder,
   written pointers, slow line-by-line repeat, final graded reading. Config: /levels/reading-data.json keyed "<level>-<lesson>". */
var uid = null; onAuthStateChanged(auth, function(u){ uid = u ? u.uid : null; });
var API = "https://saybonapp-server.onrender.com", AU = "/assets/audio/lessons/";
var pp = location.pathname.split("/").filter(Boolean), LEVEL = (pp[1] || "a1").toLowerCase();
var LESSON = parseInt((location.pathname.match(/lesson(\d+)\.html/) || [null, "6"])[1]);
var KEY = LEVEL + "-" + LESSON, C = null, root = document.getElementById("lsRoot");
var EN = (LEVEL === "a1" || LEVEL === "a2"), PFX = EN ? "R2_en_" : "R2_fr_", OLD = EN ? "R_en_" : "R_fr_";
var T = EN ? { title: "Reading practice", dir0: "I will read this out one time. Listen attentively, then you read.", dirNow: "Now you read it aloud. I am listening.", dirSlow: "Listen again, slowly. Repeat each line after me.", dirWhole: "Now read the whole text again.",
  start: "Tap to begin", skip: "Skip", again: "Read again", next: "Next text", fin: "Finish", redo: "Redo lesson", back: "Back to lessons", done: "Lesson complete", well: "Well done.",
  listening: "Listening", hear: "I could not hear you. Let's try once more.", err: "I could not score that. Let's try once more.", scoring: "Scoring", teacher: "Listen", points: "A few things to work on", first: "First reading", last: "Second reading",
  perfect: "Nothing to correct. Excellent.", mic: "The microphone is blocked. Allow it, then reload the page.", miss: "skipped", weak: "to rework", close: "almost", text: "Text", tip: "Say it slowly, then at normal speed." }
 : { title: "Lecture à voix haute", dir0: "Je vais lire ce texte une seule fois. Écoutez attentivement, puis vous lirez.", dirNow: "À vous de lire à voix haute. Je vous écoute.", dirSlow: "Écoutons encore, lentement. Répétez chaque ligne après moi.", dirWhole: "Lisez maintenant tout le texte une dernière fois.",
  start: "Touchez pour commencer", skip: "Passer", again: "Lire encore", next: "Texte suivant", fin: "Terminer", redo: "Refaire la leçon", back: "Retour aux leçons", done: "Leçon terminée", well: "Bien joué.",
  listening: "Je vous écoute", hear: "Je ne vous ai pas entendu. Essayons encore.", err: "Évaluation impossible. Essayons encore.", scoring: "Évaluation", teacher: "Écoutez", points: "Quelques points à travailler", first: "Première lecture", last: "Seconde lecture",
  perfect: "Rien à corriger. Excellent.", mic: "Micro bloqué. Autorisez-le, puis rechargez la page.", miss: "oublié", weak: "à retravailler", close: "presque", text: "Texte", tip: "Dites-le lentement, puis à vitesse normale." };
var LEN = { a1: { g: .77, f: 28 }, a2: { g: .86, f: 17 } }[LEVEL] || null;
var THR = { a1: 60, a2: 65, b1: 70, b2: 75, c1: 80, c2: 82 }[LEVEL] || 70;
var SLOW = EN ? .78 : .82;
var st = document.createElement("style");
st.textContent = `
.rd2{max-width:820px;margin:0 auto;padding:64px 18px 40px;color:#f4f1ea;font-family:Poppins,system-ui,sans-serif;text-align:center}
.rd2 .lv{font-family:Poppins,sans-serif;font-weight:500;font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;opacity:.8;margin:0 0 6px}
.rd2 h2{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.7rem,4.6vw,2.3rem);margin:0 0 10px;min-height:1.3em;letter-spacing:.005em}
.rd2 h2 .cr{display:inline-block;width:2px;height:1em;margin-left:3px;vertical-align:-.12em;background:currentColor;opacity:.7;animation:rdBl 1s steps(2) infinite}
@keyframes rdBl{50%{opacity:0}}
.rd2 .dir{margin:0 0 14px;font-size:1.02rem;line-height:1.55;opacity:0;transform:translateY(6px);transition:opacity .7s ease,transform .7s ease;min-height:3.1em;color:#d9d4c8}
.rd2 .dir.on{opacity:1;transform:none}
.rd2 .gate:empty{display:none}
.rd2 .gate{min-height:54px;display:flex;justify-content:center;margin:0 0 14px}
.rd2 .bd{position:relative;height:0;overflow:hidden;border-radius:14px;transition:height 1.25s cubic-bezier(.22,.8,.2,1)}
.rd2 .frame{border-radius:14px;padding:0;background:none;box-shadow:0 10px 30px rgba(0,0,0,.28)}
.rd2 .ledge{display:none}
.rd2 .bd-in{background:#fbfbf9;color:#23232b;padding:26px 30px 28px;border-radius:14px;box-shadow:none;text-align:center}
.rd2 .ln{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:clamp(1.35rem,3.6vw,1.8rem);line-height:1.5;padding:1px 8px;margin:2px -8px;border-radius:8px;opacity:0;transform:translateY(8px);transition:opacity .7s ease,transform .7s ease,background .35s ease,color .35s ease}
.rd2 .ln.in{opacity:1;transform:none}
.rd2 .ln.cur{background:rgba(255,205,90,.30)}
.rd2 .ln.ok{color:#2c6e49}
.rd2 .w.bad{color:#b0413c;text-decoration:underline dotted #b0413c;text-underline-offset:4px}
.rd2 .ctl{min-height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;margin:22px 0 6px;text-align:center}
.rd2 .stt{font-size:.98rem;color:#d9d4c8;min-height:1.3em;transition:opacity .4s}
.rd2 .orb{width:16px;height:16px;border-radius:50%;background:#e8c27a;opacity:.9;transition:transform .08s linear}
.rd2 .orb.idle{opacity:.0}
.rd2 button{font:inherit;font-weight:600;border:0;border-radius:999px;padding:11px 26px;cursor:pointer;background:rgba(255,255,255,.12);color:#f4f1ea;transition:background .25s,transform .25s}
.rd2 button:hover{background:rgba(255,255,255,.2)}
.rd2 button.pri{background:#f4f1ea;color:#1d1d26}
.rd2 button.lnk{background:none;padding:4px 8px;font-weight:500;font-size:.9rem;opacity:.65;text-decoration:underline;text-underline-offset:3px}
.rd2 .btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.rd2 .pt{margin-top:18px;max-height:0;overflow:hidden;opacity:0;transition:max-height .9s ease,opacity .9s ease}
.rd2 .pt.on{max-height:700px;opacity:1}
.rd2 .pc{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:16px;padding:20px 22px}
.rd2 .pc h3{font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:1.15rem;margin:0 0 4px}
.rd2 .pc .sc{font-size:.92rem;opacity:.7;margin:0 0 12px}
.rd2 .pw{display:flex;align-items:center;gap:14px;padding:9px 0;border-top:1px solid rgba(255,255,255,.09)}
.rd2 .pw b{font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:1.12rem;min-width:110px}
.rd2 .pw i{font-style:normal;font-size:.82rem;opacity:.75;min-width:92px}
.rd2 .pw span{flex:1;height:5px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden}
.rd2 .pw span u{display:block;height:100%;background:#e8c27a;border-radius:5px}
.rd2 .big{font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;margin:2px 0}
.rd2 .cmp{display:flex;gap:26px;justify-content:center;flex-wrap:wrap}
.rd2 .cmp div{font-size:.85rem;opacity:.85}
.rd2 .fin{max-width:780px;margin:0 auto;padding:110px 18px;text-align:center;color:#f4f1ea;font-family:Manrope,system-ui,sans-serif}
.rd2 .fin h2{min-height:0}
@media (prefers-reduced-motion:reduce){.rd2 *{transition:none!important;animation:none!important}}
`;
document.head.appendChild(st);
try { if (!document.getElementById('pc-fonts')) { var fl = document.createElement('link'); fl.id = 'pc-fonts'; fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Poppins:wght@500;600&display=swap'; document.head.appendChild(fl); } } catch (e) {}
function esc(s) { return String(s).replace(/[&<>"]/g, function(c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
var curAudio = null, blocked = false;
function play(name, rate) { return new Promise(function(res) { try { var a = new Audio(AU + name + ".mp3?v=1"); curAudio = a; if (rate) { a.playbackRate = rate; a.preservesPitch = true; } a.onended = a.onerror = function() { res(); }; var p = a.play(); if (p && p.catch) p.catch(function(e) { if (e && e.name === "NotAllowedError") blocked = true; res(); }); } catch (e) { res(); } }); }
/* ---- audio to 16 kHz wav ---- */
function decode16(blob) { return blob.arrayBuffer().then(function(ab) { var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); return new Promise(function(res, rej) { ac.decodeAudioData(ab, res, rej); }).then(function(buf) { try { ac.close(); } catch (e) {} var len = Math.max(1, Math.ceil(buf.duration * 16000)), oc = new OfflineAudioContext(1, len, 16000), src = oc.createBufferSource(); src.buffer = buf; src.connect(oc.destination); src.start(); return oc.startRendering(); }); }).then(function(o) { return o.getChannelData(0); }); }
function pcmToWav(d) { var n = d.length, pk = 0, i; for (i = 0; i < n; i++) { var a = Math.abs(d[i]); if (a > pk) pk = a; } var gain = (pk > 0.005 && pk < 0.7) ? 0.85 / pk : 1; var bf = new ArrayBuffer(44 + n * 2), v = new DataView(bf); function w(o, t) { for (var k = 0; k < t.length; k++) v.setUint8(o + k, t.charCodeAt(k)); } w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true); for (i = 0; i < n; i++) { var x = Math.max(-1, Math.min(1, d[i] * gain)); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); } var wb = new Blob([bf], { type: "audio/wav" }); wb.pk = pk; return wb; }
function pickScore(d) { var keys = ["finalScore", "score", "AccuracyScore", "accuracyScore", "pronunciationScore", "PronScore", "pronScore", "overallScore", "OverallScore", "overall", "total"]; function num(v) { return typeof v === "number" && isFinite(v) ? v : (typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : null); } function look(o, dep) { if (!o || typeof o !== "object" || dep > 4) return null; for (var i = 0; i < keys.length; i++) { var n = num(o[keys[i]]); if (n !== null) return n; } for (var k in o) { if (o[k] && typeof o[k] === "object") { var r = look(o[k], dep + 1); if (r !== null) return r; } } return null; } return look(d, 0); }
/* ---- microphone + automatic recorder ---- */
var stream = null;
function getStream() { if (stream && stream.active) return Promise.resolve(stream); return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function(s) { stream = s; return s; }); }
function stopStream() { try { if (stream) stream.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {} stream = null; }
var skipFlag = false;
/* records automatically: starts at once, ends after a pause once the learner has spoken. Resolves a Blob, "quiet" (nobody spoke), or null (skipped). */
function autoRecord(ui, o) {
  return new Promise(function(resolve) {
    var done = false, mr = null, chunks = [], ac = null, raf = 0, spoke = false, lastVoice = 0, t0 = Date.now(), floor = 0, nf = 0;
    ui.orb.classList.remove("idle"); ui.stt.textContent = T.listening;
    ui.btns.innerHTML = '<button class="lnk" id="rdSk">' + T.skip + "</button>";
    function fin(v) { if (done) return; done = true; cancelAnimationFrame(raf); try { ac && ac.close(); } catch (e) {} ui.orb.classList.add("idle"); ui.orb.style.transform = ""; ui.btns.innerHTML = ""; resolve(v); }
    ui.btns.querySelector("#rdSk").onclick = function() { try { if (mr && mr.state === "recording") { mr.onstop = null; mr.stop(); } } catch (e) {} fin(null); };
    getStream().then(function(s) {
      var AC = window.AudioContext || window.webkitAudioContext; ac = new AC(); var an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(s).connect(an);
      var buf = new Float32Array(an.fftSize);
      mr = new MediaRecorder(s); mr.ondataavailable = function(e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function() { fin(spoke ? new Blob(chunks, { type: mr.mimeType || "audio/webm" }) : "quiet"); };
      mr.start(); t0 = Date.now();
      (function tick() {
        if (done) return; an.getFloatTimeDomainData(buf); var sum = 0, i; for (i = 0; i < buf.length; i++) sum += buf[i] * buf[i]; var rms = Math.sqrt(sum / buf.length), now = Date.now(), el = now - t0;
        if (el < 600) { floor = nf ? Math.min(floor, rms) : rms; nf++; } else { var th = Math.min(0.045, Math.max(0.015, floor * 3));
          if (rms > th) { spoke = true; lastVoice = now; }
          ui.orb.style.transform = "scale(" + (1 + Math.min(1.6, rms * 14)).toFixed(2) + ")";
          if (spoke && now - lastVoice > o.sil && el > 1200) { try { mr.stop(); } catch (e) {} return; }
          if (!spoke && el > o.wait) { try { mr.stop(); } catch (e) {} return; }
          if (el > o.cap) { try { mr.stop(); } catch (e) {} return; } }
        raf = requestAnimationFrame(tick);
      })();
    }).catch(function() { ui.stt.textContent = T.mic; });
  });
}
/* grade -> {v, ws:[{s,e}] per reference word or null, quiet, err} */
function grade(blob, ref) {
  return decode16(blob).then(pcmToWav).then(function(wb) {
    if (wb.pk < 0.012) return { quiet: true };
    return fetch(API + "/api/assessPronunciation?referenceText=" + encodeURIComponent(ref), { method: "POST", body: wb }).then(function(r) { return r.json(); }).then(function(j) {
      var items = (j && j.wordFeedback) || [], non = items.filter(function(x) { return x && x.errorType !== "Insertion"; }), rw = ref.split(/\s+/).filter(Boolean), raw, ws = null;
      if (non.length && non.length === rw.length) {
        ws = non.map(function(x) { var om = x.errorType === "Omission"; return { s: om ? 0 : (typeof x.accuracyScore === "number" ? x.accuracyScore : 0), e: om ? "o" : "" }; });
        raw = ws.reduce(function(a, b) { return a + b.s; }, 0) / ws.length;
      } else { raw = pickScore(j); if (raw === null) raw = 0; }
      if (raw < 8) return { quiet: true };
      var v = Math.round(raw); if (LEN) v = Math.max(Math.round(100 * Math.pow(Math.min(100, raw) / 100, LEN.g)), LEN.f);
      return { v: Math.min(100, v), ws: ws };
    });
  }).catch(function() { return { err: true }; });
}
/* one automatic attempt, retried up to `tries` times when nothing was heard; resolves a grade or null */
async function attempt(ui, ref, o, tries) {
  for (var k = 0; k < tries; k++) {
    var b = await autoRecord(ui, o);
    if (b === null) return null;
    if (b === "quiet") { ui.stt.textContent = T.hear; await wait(1300); continue; }
    ui.stt.textContent = T.scoring;
    var g = await grade(b, ref);
    if (g.quiet) { ui.stt.textContent = T.hear; await wait(1300); continue; }
    if (g.err) { ui.stt.textContent = T.err; await wait(1300); continue; }
    ui.stt.textContent = ""; return g;
  }
  ui.stt.textContent = ""; return null;
}
function complete() {
  try { if (uid) fetch(API + "/api/levelProgressComplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: uid, level: LEVEL, lesson: LESSON }) }).catch(function() {}); } catch (e) {} stopStream();
  root.innerHTML = '<div class="rd2"><div class="fin"><h2>' + T.done + '</h2><p class="dir on" style="min-height:0">' + T.well + '</p><div class="btns"><button class="pri" id="rdRedo">' + T.redo + '</button><button id="rdBack">' + T.back + '</button></div></div></div>';
  document.getElementById("rdRedo").onclick = function() { location.reload(); }; document.getElementById("rdBack").onclick = function() { location.href = "./"; };
}

/* ---------------- scenery: same moving background as the other lessons ---------------- */
function bootScene() {
  try {
    var OFF = { a1: 2, a2: 0, b1: 1, b2: 2, c1: 0, c2: 0 }[LEVEL] || 0, N = LESSON || 6, th = (N - 1 + OFF) % 3, stt = (N - 1 + Math.floor((N - 1) / 3) + OFF) % 3;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "/levels/scene-paris/scene-paris.css?v=26"; document.head.appendChild(l);
    var sc = document.createElement("script"); sc.src = "/levels/scene-paris/scene-paris.js?v=26";
    sc.onload = function() { try { document.body.classList.add("ps-on"); window.__psScene = ParisScene.mount({ mic: false, overlay: true, theme: th, start: stt }); } catch (e) {} };
    document.head.appendChild(sc);
  } catch (e) {}
}
/* ---------------- page ---------------- */
var ui = {};
function build() {
  root.innerHTML = '<div class="rd2"><div class="lv">' + LEVEL.toUpperCase() + ' · ' + (EN ? 'Lesson' : 'Leçon') + ' ' + LESSON + '</div><h2 id="rdH"></h2><p class="dir" id="rdD"></p><div class="gate" id="rdG"></div><div class="bd" id="rdB"><div class="frame"><div class="bd-in" id="rdT"></div></div><div class="ledge"></div></div><div class="ctl"><div class="stt" id="rdS"></div><div class="orb idle" id="rdO"></div><div class="btns" id="rdBt"></div></div><div class="pt" id="rdP"></div></div>';
  ui = { g: root.querySelector("#rdG"), h: root.querySelector("#rdH"), dir: root.querySelector("#rdD"), bd: root.querySelector("#rdB"), txt: root.querySelector("#rdT"), stt: root.querySelector("#rdS"), orb: root.querySelector("#rdO"), btns: root.querySelector("#rdBt"), pt: root.querySelector("#rdP") };
}
async function typeHeading(txt) {
  ui.h.innerHTML = '<span id="rdHt"></span><span class="cr"></span>'; var t = ui.h.querySelector("#rdHt");
  for (var i = 1; i <= txt.length; i++) { t.textContent = txt.slice(0, i); await wait(62); }
  await wait(500); var c = ui.h.querySelector(".cr"); if (c) c.remove();
}
async function setDir(txt) { ui.dir.classList.remove("on"); await wait(380); ui.dir.textContent = txt; ui.dir.classList.add("on"); }
function wordsHtml(t, ws, off) { var parts = t.split(/(\s+)/), k = off || 0; return parts.map(function(p) { if (!p || /^\s+$/.test(p)) return p; var w = ws && ws[k], bad = w && (w.s < 60 || w.e === "o"); k++; return '<span class="w' + (bad ? " bad" : "") + '">' + esc(p) + "</span>"; }).join(""); }
function drawBoard(S, ws, cur, oks) {
  var off = 0; ui.txt.innerHTML = S.map(function(s, i) { var n = s.t.split(/\s+/).filter(Boolean).length, h = '<div class="ln in' + (i === cur ? " cur" : "") + (oks && oks[i] ? " ok" : "") + '" data-i="' + i + '">' + wordsHtml(s.t, ws, off) + "</div>"; off += n; return h; }).join("");
}
function cur(i) { [].forEach.call(ui.txt.querySelectorAll(".ln"), function(l) { l.classList.toggle("cur", +l.dataset.i === i); }); }
async function rollDown(S) {
  ui.bd.style.height = "0px"; ui.txt.innerHTML = S.map(function(s, i) { return '<div class="ln" data-i="' + i + '">' + wordsHtml(s.t, null) + "</div>"; }).join("");
  await wait(120); ui.bd.style.height = (ui.bd.scrollHeight) + "px"; await wait(650);
  var ls = ui.txt.querySelectorAll(".ln"); for (var i = 0; i < ls.length; i++) { ls[i].classList.add("in"); await wait(240); }
  await wait(700); ui.bd.style.height = "auto";
}
async function rollUp() { ui.bd.style.height = ui.bd.scrollHeight + "px"; await wait(30); ui.bd.style.height = "0px"; await wait(1250); }
function weakList(ws, S) {
  if (!ws) return []; var flat = [], k = 0; S.forEach(function(s) { s.t.split(/\s+/).filter(Boolean).forEach(function(w) { flat.push(w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")); }); });
  var arr = []; ws.forEach(function(x, i) { if (flat[i] && (x.s < 70 || x.e === "o")) arr.push({ w: flat[i], s: x.s, e: x.e }); });
  var seen = {}; arr = arr.filter(function(a) { var q = a.w.toLowerCase(); if (seen[q]) return false; seen[q] = 1; return true; });
  arr.sort(function(a, b) { return a.s - b.s; }); return arr.slice(0, 6);
}
async function showPoints(res, S) {
  var wl = weakList(res.ws, S), h = '<div class="pc"><h3>' + (wl.length ? T.points : T.perfect) + '</h3><p class="sc">' + T.first + " · " + res.v + "%</p>";
  wl.forEach(function(a) { var lab = a.e === "o" ? T.miss : (a.s < 40 ? T.weak : T.close); h += '<div class="pw"><b>' + esc(a.w) + "</b><i>" + lab + '</i><span><u style="width:' + Math.max(6, Math.round(a.s)) + '%"></u></span></div>'; });
  if (wl.length) h += '<p class="sc" style="margin:12px 0 0">' + T.tip + "</p>";
  ui.pt.innerHTML = h + "</div>"; ui.pt.classList.add("on"); await wait(900); try { ui.pt.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
}
function hidePoints() { ui.pt.classList.remove("on"); }
async function unit(U, idx, total) {
  var S = U.sents, whole = S.map(function(s) { return s.t; }).join(" "), last = idx === total - 1;
  var capWhole = Math.max(30000, whole.split(/\s+/).length * 1900 + 9000);
  hidePoints(); ui.btns.innerHTML = ""; ui.stt.textContent = "";
  if (idx > 0) { await rollUp(); }
  if (total > 1) { var lvEl = root.querySelector(".lv"); if (lvEl) lvEl.textContent = LEVEL.toUpperCase() + " · " + (EN ? "Lesson" : "Leçon") + " " + LESSON + " · " + T.text + " " + (idx + 1) + "/" + total; }
  await setDir(T.dir0);
  if (idx === 0) {
    var intro = Promise.all([rollDown(S), C.intro ? play(C.intro) : wait(0)]);
    await intro;
    if (blocked && C.intro) {
      blocked = false; ui.g.innerHTML = '<button class="pri" id="rdGo">' + T.start + "</button>";
      await new Promise(function(r) { ui.g.querySelector("#rdGo").onclick = r; }); ui.g.innerHTML = ""; await play(C.intro);
    }
  } else { await rollDown(S); }
  /* 1. the teacher reads once */
  ui.stt.textContent = T.teacher; await play(PFX + "listen");
  if (U.audio) await play(U.audio); else { for (var i = 0; i < S.length; i++) { cur(i); await play(S[i].a); await wait(350); } cur(-1); }
  ui.stt.textContent = "";
  /* 2. the learner reads, recorded automatically */
  await setDir(T.dirNow); await play(PFX + "now");
  var r1 = await attempt(ui, whole, { sil: 2300, wait: 11000, cap: capWhole }, 2);
  if (r1) { drawBoard(S, r1.ws, -1, null); await showPoints(r1, S); }
  /* 3. slowly, line by line */
  await setDir(T.dirSlow); await play(PFX + "slow");
  var oks = [], off = 0;
  for (var j = 0; j < S.length; j++) {
    cur(j); ui.stt.textContent = T.teacher; await play(S[j].a, SLOW); ui.stt.textContent = "";
    await play(OLD + "again");
    var g = await attempt(ui, S[j].t, { sil: 1500, wait: 9000, cap: Math.max(14000, S[j].t.split(/\s+/).length * 2200 + 6000) }, 2);
    if (g && g.v >= THR) { oks[j] = true; var l = ui.txt.querySelector('.ln[data-i="' + j + '"]'); if (l) l.classList.add("ok"); }
  }
  cur(-1);
  /* 4. the whole text again, graded */
  var r2 = null;
  for (;;) {
    await setDir(T.dirWhole); await play(PFX + "whole");
    r2 = await attempt(ui, whole, { sil: 2300, wait: 11000, cap: capWhole }, 2);
    if (r2) { drawBoard(S, r2.ws, -1, null); }
    hidePoints(); await wait(500);
    var cmp = '<div class="pc" style="text-align:center">' + (r2 ? '<div class="big">' + r2.v + '%</div>' : "") + '<div class="cmp">' + (r1 ? "<div>" + T.first + " · " + r1.v + "%</div>" : "") + (r2 ? "<div>" + T.last + " · " + r2.v + "%</div>" : "") + "</div></div>";
    ui.pt.innerHTML = cmp; ui.pt.classList.add("on"); try { ui.btns.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    ui.btns.innerHTML = '<button id="rdAg">' + T.again + '</button><button class="pri" id="rdNx">' + (last ? T.fin : T.next) + "</button>";
    var act = await new Promise(function(r) { ui.btns.querySelector("#rdAg").onclick = function() { r("again"); }; ui.btns.querySelector("#rdNx").onclick = function() { r("next"); }; });
    ui.btns.innerHTML = ""; if (act === "next") break; hidePoints();
  }
}
(async function() {
  try { var D = await (await fetch("/levels/reading-data.json?t=" + Date.now())).json(); C = D[KEY]; } catch (e) {}
  if (!C) { root.innerHTML = '<div class="rd2"><p class="dir on">' + (EN ? "This reading lesson is not ready yet." : "Cette leçon de lecture n'est pas encore prête.") + "</p></div>"; return; }
  bootScene(); build(); await typeHeading(T.title);
  var units = C.mode === "guided" ? C.passages.map(function(p) { return { sents: p.sents, audio: p.audio }; }) : [{ sents: C.sents, audio: null }];
  for (var i = 0; i < units.length; i++) await unit(units[i], i, units.length);
  complete();
})();
