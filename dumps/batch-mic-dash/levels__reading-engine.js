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
var T = EN ? { title: "Reading practice", intro: "Reading", dir0: "Listen carefully while I read aloud.", dirNow: "Now you read it aloud. I am listening.", dirSlow: "Listen again, slowly. Repeat each line after me.", dirWhole: "Now read the whole text again.",
  start: "Tap to begin", skip: "Skip", again: "Read again", next: "Next text", fin: "Finish", redo: "Redo lesson", back: "Back to lessons", done: "Lesson complete", well: "Well done.",
  listening: "Listening", hear: "I could not hear you. Let's try once more.", err: "I could not score that. Let's try once more.", scoring: "Evaluating", teacher: "Listen", points: "Let's polish a few things", heard: "I heard \u201c{h}\u201d instead of \u201c{w}\u201d.", notheard: "I did not hear this word.", first: "First reading", last: "Second reading",
  perfect: "Nothing to correct. Excellent.", perfectGo: "Very good. Nothing to correct. Read it one more time and we move on.", okderived: "I understood every word. I cannot judge the finer sounds this time, so we will go through it line by line.", okish: "Clear enough, but not quite smooth yet. We will repeat the lines that need it.", nodet: "I could not check the sounds in detail this time, so we will go through it line by line.", dirFew: "Let's work on the lines that need it. Repeat after me.", mic: "The microphone is blocked. Allow it, then reload the page.", miss: "skipped", weak: "to rework", close: "almost", text: "Text", tip: "Say it slowly, then at normal speed.", general: "Your reading needs more clarity overall. We will go through it line by line.", sec1: "Words and sounds", sec2: "Liaisons", sec3: "Pauses inside a phrase", sound: "work on this sound", linkLab: "link the words", linkTip: "No pause between these words: the final letter is carried over and sounds like \"{c}\". We measured a gap of {g}.", pauseTip: "Keep the phrase flowing: do not stop between these words.", finalPts: "Still to work on", n1: "1 thing to work on", nn: "{n} things to work on", see: "See details", hide: "Hide details", pauseNote: "Keep these phrases flowing, without stopping between the words." }
 : { title: "Lecture à voix haute", intro: "La lecture", dir0: "Écoutez attentivement pendant que je lis à voix haute.", dirNow: "À vous de lire à voix haute. Je vous écoute.", dirSlow: "Écoutons encore, lentement. Répétez chaque ligne après moi.", dirWhole: "Lisez maintenant tout le texte une dernière fois.",
  start: "Touchez pour commencer", skip: "Passer", again: "Lire encore", next: "Texte suivant", fin: "Terminer", redo: "Refaire la leçon", back: "Retour aux leçons", done: "Leçon terminée", well: "Bien joué.",
  listening: "Je vous écoute", hear: "Je ne vous ai pas entendu. Essayons encore.", err: "Évaluation impossible. Essayons encore.", scoring: "Évaluation en cours", teacher: "Écoutez", points: "Polissons quelques points", heard: "J'ai entendu \u00ab {h} \u00bb au lieu de \u00ab {w} \u00bb.", notheard: "Je n'ai pas entendu ce mot.", first: "Première lecture", last: "Seconde lecture",
  perfect: "Rien à corriger. Excellent.", perfectGo: "Très bien. Rien à corriger. Relisez-le une fois et on passe à la suite.", okderived: "J'ai compris tous les mots. Je ne peux pas juger les sons plus fins cette fois : nous reprenons ligne par ligne.", okish: "C'est clair, mais pas encore fluide. Nous reprendrons les lignes qui en ont besoin.", nodet: "Je n'ai pas pu vérifier les sons en détail cette fois : nous passons ligne par ligne.", dirFew: "Travaillons les lignes qui en ont besoin. Répétez après moi.", mic: "Micro bloqué. Autorisez-le, puis rechargez la page.", miss: "oublié", weak: "à retravailler", close: "presque", text: "Texte", tip: "Dites-le lentement, puis à vitesse normale.", general: "Votre lecture manque encore de clarté dans l'ensemble. Reprenons-la ligne par ligne.", sec1: "Mots et sons", sec2: "Liaisons", sec3: "Pauses à l'intérieur d'un groupe", sound: "son à travailler", linkLab: "liez les mots", linkTip: "Pas de pause entre ces mots : la lettre finale se prononce et fait le son « {c} ». Écart mesuré : {g}.", pauseTip: "Gardez le groupe fluide : ne vous arrêtez pas entre ces mots.", finalPts: "À travailler encore", n1: "1 point à travailler", nn: "{n} points à travailler", see: "Voir le détail", hide: "Masquer le détail", pauseNote: "Gardez ces groupes fluides, sans vous arrêter entre les mots." };
var DEBUG = /[?&]rdebug=1/.test(location.search);
var LEN = { a1: { g: .77, f: 28 }, a2: { g: .86, f: 17 } }[LEVEL] || null;
var THR = { a1: 60, a2: 65, b1: 70, b2: 75, c1: 80, c2: 82 }[LEVEL] || 70;
var SLOW = EN ? .78 : .82, SLOWREAD = EN ? .84 : .88;
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
.rd2 .ln.cur,.rd2 .ln.seen{color:#2c6e49}
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
.rd2 .pg{text-align:left;margin-top:12px}
.rd2 .psum{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.rd2 .psum span{font-size:1rem;opacity:.92}
.rd2 .pbtn{background:none;border:1px solid rgba(232,194,122,.55);color:#e8c27a;font:500 .85rem Poppins,sans-serif;padding:7px 16px;border-radius:20px;cursor:pointer}
.rd2 .pdet{display:none;max-height:42vh;overflow:auto;text-align:left;margin-top:8px}
.rd2 .pdet.on{display:block}
.rd2 .pl{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;opacity:.65;margin-bottom:2px}
.rd2 .pn{font-size:.9rem;line-height:1.5;opacity:.85;margin:0 0 8px;padding-left:2px}
.rd2 .pn em{font-style:normal;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;color:#e8c27a;margin-right:4px}
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
var SH = new Audio(), gateOn = false, gateQ = [];
/* iPhones refuse sound that no tap has started: ask for one tap, then the same (now unlocked) player is used for everything */
function tapGate() { return new Promise(function(res) { gateQ.push(res); if (gateOn) return; gateOn = true;
  var b = document.createElement("button"); b.type = "button"; b.textContent = EN ? "Tap to hear the teacher" : "Touchez pour \u00e9couter";
  b.style.cssText = "position:fixed;left:50%;bottom:9vh;transform:translateX(-50%);z-index:99999;background:#e8c27a;color:#2b1d0e;border:0;border-radius:26px;padding:14px 26px;font:600 1rem Poppins,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.4);cursor:pointer";
  document.body.appendChild(b); var go = function() { b.remove(); gateOn = false; var q = gateQ; gateQ = []; q.forEach(function(f) { f(); }); }; b.onclick = go; }); }
function play(name, rate) { return new Promise(function(res) { try { var a = SH; curAudio = a; a.onended = a.onerror = null; try { a.pause(); } catch (e) {} a.src = AU + name + ".mp3?v=1"; a.playbackRate = rate || 1; if (rate) a.preservesPitch = true; a.onended = a.onerror = function() { res(); };
  var p = a.play(); if (p && p.catch) p.catch(function(e) { if (e && e.name === "NotAllowedError") { blocked = true; tapGate().then(function() { var q = a.play(); if (q && q.catch) q.catch(function() { res(); }); }); } else res(); }); } catch (e) { res(); } }); }
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
/* grade -> {v, det:[per reference word {w,s,e,ph,st,en}] or null, ws (compat), quiet, err} */
function azWords(j) {
  var raw = j && (j.detail || (j._debugRawAzureResponse && j._debugRawAzureResponse.NBest && j._debugRawAzureResponse.NBest[0] && j._debugRawAzureResponse.NBest[0].Words));
  return (raw && raw.length) ? raw : null;
}
/* what the recogniser heard, lined up with the text: matched words, replaced words ("heard X"), and words never said */
function diffDet(rw, heardText) {
  function nz(t) { return String(t || "").toLowerCase().replace(/[’']/g, "'").replace(/[^\p{L}']/gu, ""); }
  var H = heardText.split(/\s+/).map(function(w) { return { raw: w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""), n: nz(w) }; }).filter(function(x) { return x.n; }), R = rw.map(nz), n = R.length, m = H.length, i, j, D = [];
  if (!m) return null;
  for (i = 0; i <= n; i++) { D.push([]); for (j = 0; j <= m; j++) D[i].push(i === 0 ? j : (j === 0 ? i : 0)); }
  function sim(a, b) { return a === b ? 0 : 1; }
  for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + sim(R[i - 1], H[j - 1].n));
  var out = new Array(n), a = n, b = m;
  while (a > 0 || b > 0) {
    if (a > 0 && b > 0 && D[a][b] === D[a - 1][b - 1] + sim(R[a - 1], H[b - 1].n)) { out[a - 1] = R[a - 1] === H[b - 1].n ? { s: 92, e: "" } : { s: 35, e: "m", heard: H[b - 1].raw }; a--; b--; }
    else if (a > 0 && D[a][b] === D[a - 1][b] + 1) { out[a - 1] = { s: 0, e: "o" }; a--; }
    else b--;
  }
  return out.map(function(o, k) { return { w: rw[k], s: o.s, e: o.e, heard: o.heard || "", st: null, en: null, ph: [] }; });
}
function gradeWav(wb, ref) {
  return Promise.resolve(wb).then(function(wb) {
    if (wb.pk < 0.012) return { quiet: true };
    return fetch(API + "/api/assessPronunciation?referenceText=" + encodeURIComponent(ref), { method: "POST", body: wb }).then(function(r) { return r.json(); }).then(function(j) {
      var rw = ref.split(/\s+/).filter(Boolean), raw, ws = null, det = null, az = azWords(j), items, src = "none", nAz = 0;
      function acc(x) { return typeof x.AccuracyScore === "number" ? x.AccuracyScore : (x.PronunciationAssessment && typeof x.PronunciationAssessment.AccuracyScore === "number" ? x.PronunciationAssessment.AccuracyScore : (typeof x.accuracyScore === "number" ? x.accuracyScore : 0)); }
      function err(x) { return x.ErrorType || (x.PronunciationAssessment && x.PronunciationAssessment.ErrorType) || x.errorType || ""; }
      function nz(t) { return String(t || "").toLowerCase().replace(/[^\p{L}]/gu, ""); }
      items = (az || (j && (j.wordFeedback || j.words)) || []).filter(function(x) { return x && err(x) !== "Insertion"; }); nAz = items.length; if (az) src = "azure";
      /* line the measured words up with the reference words (Azure may split or join some of them) */
      var groups = null;
      if (items.length === rw.length) groups = items.map(function(x) { return [x]; });
      else if (items.length) { groups = []; var p = 0, okAl = true;
        for (var ri = 0; ri < rw.length && okAl; ri++) { var want = nz(rw[ri]), got = "", gr = [];
          while (p < items.length && got.length < want.length) { gr.push(items[p]); got += nz(items[p].Word || items[p].word || items[p].text || ""); p++; }
          if (!gr.length || got !== want) okAl = false; else groups.push(gr); }
        if (!okAl || p !== items.length) groups = null; }
      if (groups) {
        det = groups.map(function(gr, i) { var om = gr.every(function(x) { return err(x) === "Omission"; }), mis = gr.some(function(x) { return err(x) === "Mispronunciation"; }), first = gr[0], lastW = gr[gr.length - 1],
            t0 = typeof first.Offset === "number" ? first.Offset / 10000 : null, d = typeof lastW.Offset === "number" && typeof lastW.Duration === "number" ? (lastW.Offset + lastW.Duration) / 10000 : null,
            ph = [].concat.apply([], gr.map(function(x) { return (x.Phonemes || []).map(function(q) { return { p: q.Phoneme || q.phoneme || "", s: acc(q) }; }); })),
            s0 = om ? 0 : gr.reduce(function(a, x) { return a + acc(x); }, 0) / gr.length;
          if (!om) { var pm = ph.length ? Math.min.apply(null, ph.map(function(q) { return q.s; })) : 100; s0 = Math.min(s0, 40 + pm * 0.6); if (mis) s0 = Math.min(s0, 55); }
          return { w: rw[i], s: Math.round(s0), e: om ? "o" : (mis ? "m" : ""), st: om ? null : t0, en: (om || t0 === null || d === null) ? null : d, ph: ph }; });
        ws = det.map(function(d) { return { s: d.s, e: d.e === "o" ? "o" : "" }; });
        raw = ws.reduce(function(a, b) { return a + b.s; }, 0) / ws.length;
      } else { raw = pickScore(j); if (raw === null) raw = 0; raw = Math.min(raw, 60); }
      if (!det) { var ht = j && (j.recognizedText || j.recognized || j.text || j.DisplayText || j.displayText || j.transcript); if (typeof ht === "string" && ht.trim()) { var dd = diffDet(rw, ht); if (dd) { det = dd; src = "heard"; ws = det.map(function(d) { return { s: d.s, e: d.e === "o" ? "o" : "" }; }); raw = ws.reduce(function(a, b) { return a + b.s; }, 0) / ws.length; } } }
      try { window.__rdLast = { src: src, nRef: rw.length, nAz: nAz, det: !!det, raw: Math.round(raw), keys: j ? Object.keys(j) : [], words: det ? det.map(function(d) { return d.w + ":" + d.s + (d.e ? d.e : ""); }) : (items || []).map(function(x) { return (x.Word || x.word || "?") + ":" + acc(x) + err(x); }) }; } catch (e) {}
      if (raw < 8) return { quiet: true };
      var v = Math.round(raw); if (LEN) v = Math.max(Math.round(100 * Math.pow(Math.min(100, raw) / 100, LEN.g)), LEN.f);
      return { v: Math.min(100, v), raw: raw, ws: ws, det: det, derived: src === "heard" };
    });
  }).catch(function() { return { err: true }; });
}
/* The speech service can stop listening at a long pause and ignore the rest of a multi-line reading. When the words at the end come back "not heard"
   but the recording goes on, grade the remaining audio against the remaining words and join the results. */
function grade(blob, ref) {
  return decode16(blob).then(function(pcm) {
    var rw = ref.split(/\s+/).filter(Boolean), SR = 16000, pk = 0, i;
    for (i = 0; i < pcm.length; i += 7) { var a = Math.abs(pcm[i]); if (a > pk) pk = a; }
    function voiced(from) { var w = SR * 0.12, hits = 0; for (var o = from; o + w < pcm.length; o += w) { var sm = 0; for (var q = 0; q < w; q += 4) sm += pcm[o + q] * pcm[o + q]; if (Math.sqrt(sm / (w / 4)) > Math.max(0.012, pk * 0.1)) { hits++; if (hits >= 4) return true; } else hits = Math.max(0, hits - 1); } return false; }
    var parts = [], start = 0, from = 0, segs = 0, first = null;
    function loop() {
      var seg = pcm.subarray(from), wb = pcmToWav(seg), sub = rw.slice(start).join(" ");
      return gradeWav(wb, sub).then(function(g) {
        segs++; if (!first) first = g;
        if (g.quiet || g.err || !g.det) { if (!parts.length) return g; return parts; }
        var offMs = from / SR * 1000, det = g.det.map(function(d) { return { w: d.w, s: d.s, e: d.e, heard: d.heard, ph: d.ph, st: d.st === null ? null : d.st + offMs, en: d.en === null ? null : d.en + offMs }; });
        var L = -1; for (var k = det.length - 1; k >= 0; k--) { if (det[k].e !== "o") { L = k; break; } }
        var tail = det.length - 1 - L;
        if (!g.derived && L >= 0 && tail >= 1 && segs < 5 && det[L].en !== null) { var nf = Math.max(from, Math.round((det[L].en - 120) / 1000 * SR));
          if (voiced(nf)) { parts = parts.concat(det.slice(0, L + 1)); start += L + 1; from = nf; return loop(); } }
        parts = parts.concat(det); return parts;
      });
    }
    return loop().then(function(r) {
      if (!Array.isArray(r)) return r;
      var det = r; if (det.length !== rw.length) return first;
      var ws = det.map(function(d) { return { s: d.s, e: d.e === "o" ? "o" : "" }; }), raw = ws.reduce(function(a, b) { return a + b.s; }, 0) / ws.length, v = Math.round(raw);
      if (LEN) v = Math.max(Math.round(100 * Math.pow(Math.min(100, raw) / 100, LEN.g)), LEN.f);
      try { if (window.__rdLast) window.__rdLast.segments = segs; } catch (e) {}
      return { v: Math.min(100, v), raw: raw, ws: ws, det: det, derived: false };
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

/* ---------------- coaching: words, sounds, liaisons, pauses (all from the measured data) ---------------- */
var TIPS = EN ? {
  "ʁ": "the French r sits at the back of the throat, like a soft gargle", "y": "round your lips as for \"oo\" but say \"ee\"", "u": "\"ou\": lips rounded and pushed forward", "ø": "\"eu\" as in peu: lips rounded, mouth half closed", "œ": "\"eu\" as in peur: rounded and more open",
  "ə": "the light \"e\": short and soft, often barely heard", "ɑ̃": "nasal \"an\": let the air through the nose, no n at the end", "ɔ̃": "nasal \"on\": rounded lips, air through the nose, no n", "ɛ̃": "nasal \"in\": air through the nose, no n", "œ̃": "nasal \"un\": air through the nose, no n",
  "ɥ": "the quick \"u\" glide, as in huit", "ʒ": "\"j\" as in je: like the s in measure", "ʃ": "\"ch\" as in chat", "ɲ": "\"gn\" as in montagne", "e": "closed \"é\": keep it steady, do not glide into \"ay\"", "ɛ": "open \"è\": mouth a little wider than for é", "o": "closed \"o\": lips rounded, no glide to \"w\"", "ɔ": "open \"o\" as in porte", "i": "short \"i\": spread lips, no glide", "a": "\"a\": open, flat and short", "z": "a voiced \"z\"; the s between vowels is a z", "t": "a crisp \"t\" with no puff of air", "ɡ": "hard \"g\" as in gare"
} : {
  "ʁ": "le r français se prononce au fond de la gorge, comme un léger gargarisme", "y": "arrondissez les lèvres comme pour « ou » mais dites « i »", "u": "« ou » : lèvres arrondies et projetées en avant", "ø": "« eu » de peu : lèvres arrondies, bouche mi-fermée", "œ": "« eu » de peur : arrondi et plus ouvert",
  "ə": "le « e » léger : bref et doux, souvent à peine audible", "ɑ̃": "nasale « an » : l'air passe par le nez, sans n final", "ɔ̃": "nasale « on » : lèvres arrondies, l'air passe par le nez, sans n", "ɛ̃": "nasale « in » : l'air passe par le nez, sans n", "œ̃": "nasale « un » : l'air passe par le nez, sans n",
  "ɥ": "le « u » glissé de huit", "ʒ": "« j » de je : comme le s de « mesure »", "ʃ": "« ch » de chat", "ɲ": "« gn » de montagne", "e": "« é » fermé : gardez-le stable, sans glisser vers « èy »", "ɛ": "« è » ouvert : bouche un peu plus ouverte que pour é", "o": "« o » fermé : lèvres arrondies, sans glisser vers « w »", "ɔ": "« o » ouvert de porte", "i": "« i » bref : lèvres étirées, sans glissement", "a": "« a » : ouvert, plat et bref", "z": "un « z » sonore ; le s entre deux voyelles se prononce z", "t": "un « t » net, sans souffle", "ɡ": "« g » dur de gare"
};
var LIA1 = "les des mes tes ses ces nos vos leurs aux un mon ton son aucun quels quelles deux trois six dix petit grand bon mauvais gros nous vous ils elles on en est sont ont suis sommes êtes es avez avons était étaient dans chez sans sous très bien moins comment".split(" ");
var HMUET = "heure homme hôtel histoire hôpital habite habiter habitude hiver huile humain honneur herbe hier".split(" ");
function cleanTok(w) { return w.toLowerCase().replace(/^[^\p{L}']+|[^\p{L}']+$/gu, ""); }
function liaisonOf(w1, w2) {
  var a = cleanTok(w1), b = cleanTok(w2); if (!a || !b || LIA1.indexOf(a) < 0) return null;
  if (!/^[aeiouyàâéèêëîïôûù]/.test(b) && HMUET.indexOf(b) < 0) return null; if (b === "oui" || b === "onze" || b === "et") return null;
  var l = a.slice(-1), m = { s: "z", x: "z", z: "z", t: "t", d: "t", n: "n", p: "p", g: "k" }[l]; if (!m) return null;
  return { cons: m, was: l };
}
function coach(det, S) {
  if (!det) return null; var flat = [], end = [];
  S.forEach(function(s) { var ts = s.t.split(/\s+/).filter(Boolean); ts.forEach(function(w, i) { flat.push(w); end.push(i === ts.length - 1); }); });
  var words = [], links = [], pauses = [], i, sid = [], lines = {};
  S.forEach(function(s, si) { s.t.split(/\s+/).filter(Boolean).forEach(function() { sid.push(si); }); });
  for (i = 0; i < det.length; i++) { var d = det[i]; if (d.e === "o") { words.push({ w: d.w, kind: "miss", s: 0, sounds: [], heard: "" }); lines[sid[i]] = 1; continue; }
    var snd = d.ph.filter(function(q) { return q.s < 60 && q.p; }).sort(function(a, b) { return a.s - b.s; }).slice(0, 2).map(function(q) { return { p: q.p, tip: TIPS[q.p] || "" }; });
    if (d.s < 60) { words.push({ w: d.w, kind: d.s < 45 ? "weak" : "close", s: d.s, sounds: snd, heard: d.heard || "" }); lines[sid[i]] = 1; } }
  for (i = 0; i + 1 < det.length; i++) { var x = det[i], y = det[i + 1]; if (end[i] || x.en === null || y.st === null || x.e === "o" || y.e === "o") continue;
    var gap = Math.round(y.st - x.en), lia = liaisonOf(flat[i], flat[i + 1]), punct = /[,;:.!?…]$/.test(flat[i]);
    if (lia && gap > 260 && !punct) { links.push({ a: cleanTok(flat[i]), b: cleanTok(flat[i + 1]), gap: gap, cons: lia.cons, was: lia.was }); lines[sid[i]] = 1; }
    else if (!punct && gap > 900) { pauses.push({ a: cleanTok(flat[i]), b: cleanTok(flat[i + 1]), gap: gap }); lines[sid[i]] = 1; } }
  words.sort(function(a, b) { return a.s - b.s; });
  return { words: words, links: links, pauses: pauses, lines: Object.keys(lines).map(Number) };
}
function secs(ms) { return (ms / 1000).toFixed(1) + " s"; }
function coachCount(c) { return c.words.length + c.links.length + c.pauses.length; }
function coachHtml(c) {
  var h = "";
  if (c.words.length) { h += '<div class="pg"><div class="pl">' + T.sec1 + "</div>"; c.words.forEach(function(w) {
    var nm = esc(w.w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""));
    h += '<div class="pw"><b>' + nm + "</b></div>";
    if (w.heard) h += '<div class="pn">' + T.heard.replace("{h}", esc(w.heard)).replace("{w}", nm) + "</div>"; else if (w.kind === "miss") h += '<div class="pn">' + T.notheard + "</div>";
    w.sounds.forEach(function(q) { h += '<div class="pn"><em>/' + esc(q.p) + "/</em> " + esc(q.tip || T.sound) + "</div>"; }); }); h += "</div>"; }
  if (c.links.length) { h += '<div class="pg"><div class="pl">' + T.sec2 + "</div>"; c.links.forEach(function(l) {
    h += '<div class="pw"><b>' + esc(l.a) + " \u203f " + esc(l.b) + '</b></div><div class="pn">' + T.linkTip.replace("{c}", l.cons).replace("{g}", secs(l.gap)) + "</div>"; }); h += "</div>"; }
  if (c.pauses.length) { h += '<div class="pg"><div class="pl">' + T.sec3 + '</div><div class="pn">' + T.pauseNote + "</div>"; c.pauses.forEach(function(l) {
    h += '<div class="pw"><b>' + esc(l.a) + " | " + esc(l.b) + '</b><i>' + secs(l.gap) + "</i></div>"; }); h += "</div>"; }
  return h;
}
/* one short line + a button that opens the full list */
function sumHtml(c, title) { var n = coachCount(c); return (title ? "<h3>" + title + "</h3>" : "") + '<div class="psum"><span>' + (n === 1 ? T.n1 : T.nn.replace("{n}", n)) + '</span><button class="pbtn" type="button" data-pd="1">' + T.see + '</button></div><div class="pdet">' + coachHtml(c) + "</div>"; }
function bindDet(root) { var bt = root.querySelector("[data-pd]"); if (!bt) return; bt.onclick = function() { var d = root.querySelector(".pdet"), on = d.classList.toggle("on"); bt.textContent = on ? T.hide : T.see; if (on) { try { d.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {} } }; }
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
function cur(i) { [].forEach.call(ui.txt.querySelectorAll(".ln"), function(l) { var on = +l.dataset.i === i; l.classList.toggle("cur", on); if (on) l.classList.add("seen"); }); }
function clearSeen() { [].forEach.call(ui.txt.querySelectorAll(".ln"), function(l) { l.classList.remove("seen", "cur"); }); }
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
function isPerfect(res, c) { return !!(res && res.det && !res.derived && c && !c.words.length && !c.links.length && !c.pauses.length && res.raw >= 78); }
async function showPoints(res, S) {
  var c = coach(res.det, S), has = c && (c.words.length || c.links.length || c.pauses.length), good = isPerfect(res, c);
  var h = '<div class="pc">' + (has ? "" : "<h3>" + (good ? T.perfectGo : T.points) + "</h3>");
  if (has) h += sumHtml(c, T.points); else if (!good) h += '<p class="sc" style="margin:4px 0 0">' + (res.derived ? T.okderived : (res.det ? T.okish : T.nodet)) + "</p>";
  if (DEBUG && window.__rdLast) h += '<pre style="text-align:left;white-space:pre-wrap;font-size:.7rem;opacity:.8;margin-top:10px">' + JSON.stringify(window.__rdLast) + "</pre>";
  ui.pt.innerHTML = h + "</div>"; bindDet(ui.pt); ui.pt.classList.add("on"); await wait(900); try { ui.pt.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
}
function hidePoints() { ui.pt.classList.remove("on"); }
async function unit(U, idx, total) {
  var S = U.sents, whole = S.map(function(s) { return s.t; }).join(" "), last = idx === total - 1;
  var capWhole = Math.max(30000, whole.split(/\s+/).length * 1900 + 9000);
  hidePoints(); ui.btns.innerHTML = ""; ui.stt.textContent = "";
  if (idx > 0) { await rollUp(); }
  if (total > 1) { var lvEl = root.querySelector(".lv"); if (lvEl) lvEl.textContent = LEVEL.toUpperCase() + " · " + (EN ? "Lesson" : "Leçon") + " " + LESSON + " · " + T.text + " " + (idx + 1) + "/" + total; }
  await setDir(T.dir0);
  await rollDown(S);
  /* 1. the teacher reads once */
  ui.stt.textContent = T.teacher; await play(PFX + "listen");
  if (U.audio) await play(U.audio, SLOWREAD); else { for (var i = 0; i < S.length; i++) { cur(i); await play(S[i].a, SLOWREAD); await wait(450); } cur(-1); }
  ui.stt.textContent = "";
  /* 2. the learner reads, recorded automatically */
  clearSeen(); await setDir(T.dirNow); await play(PFX + "now");
  var r1 = await attempt(ui, whole, { sil: 2300, wait: 11000, cap: capWhole }, 2);
  if (r1) { drawBoard(S, r1.ws, -1, null); await showPoints(r1, S); }
  /* 3. slowly, line by line: only the lines that need it (none if the first reading was clean) */
  clearSeen(); var need = [], rc1 = r1 ? coach(r1.det, S) : null, clean = isPerfect(r1, rc1);
  if (!clean) { if (r1 && r1.det && rc1) need = rc1.lines.slice().sort(function(x, y) { return x - y; }); else need = S.map(function(_, k) { return k; }); if (!need.length) need = S.map(function(_, k) { return k; }); }
  if (need.length) await setDir(need.length < S.length ? T.dirFew : T.dirSlow), await play(PFX + "slow");
  var oks = [], off = 0;
  for (var jj = 0; jj < need.length; jj++) {
    var j = need[jj];
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
    var rc = r2 ? coach(r2.det, S) : null, rem = rc && (rc.words.length || rc.links.length) ? '<div style="margin-top:16px">' + sumHtml({ words: rc.words, links: rc.links, pauses: [] }, T.finalPts) + "</div>" : "";
    var cmp = '<div class="pc" style="text-align:center">' + (r2 ? '<div class="big">' + r2.v + '%</div>' : "") + '<div class="cmp">' + (r1 ? "<div>" + T.first + " · " + r1.v + "%</div>" : "") + (r2 ? "<div>" + T.last + " · " + r2.v + "%</div>" : "") + "</div>" + rem + "</div>";
    ui.pt.innerHTML = cmp; bindDet(ui.pt); ui.pt.classList.add("on"); try { ui.btns.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    ui.btns.innerHTML = '<button id="rdAg">' + T.again + '</button><button class="pri" id="rdNx">' + (last ? T.fin : T.next) + "</button>";
    var act = await new Promise(function(r) { ui.btns.querySelector("#rdAg").onclick = function() { r("again"); }; ui.btns.querySelector("#rdNx").onclick = function() { r("next"); }; });
    ui.btns.innerHTML = ""; if (act === "next") break; hidePoints();
  }
}

var MIC = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="10.5" y="2.5" width="11" height="17" rx="5.5" fill="currentColor" stroke="none"/><path d="M11.6 7.2h8.8M11 10.4h10M11 13.6h10M11.6 16.6h8.8" stroke="rgba(40,14,0,.55)" stroke-width="1.15"/><path d="M6.6 14v1.2a9.4 9.4 0 0 0 18.8 0V14"/><path d="M16 24.6v3.4M11.2 28.4h9.6"/></svg>';
function sceneDo(m) { try { var sc = window.__psScene; if (sc && sc[m]) sc[m](); } catch (e) {} }
function musicOff() { try { if (window.pauseAppBgMusicForRecording) window.pauseAppBgMusicForRecording(); } catch (e) {} }
function musicOn() { try { if (window.resumeAppBgMusicAfterRecording) window.resumeAppBgMusicAfterRecording(); } catch (e) {} }
function introCard() {
  return new Promise(function(resolve) {
    root.innerHTML = '<div class="pc"><div class="pc-h"><div class="pc-lv">' + LEVEL.toUpperCase() + " &middot; " + (EN ? "Lesson" : "Le\u00e7on") + " " + LESSON + '</div><h2 class="pc-t">' + T.intro + '</h2><i class="pc-ln"></i></div><div class="pc-b"></div><button type="button" class="pc-skip" aria-label="Skip"><span>' + T.skip + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg></button></div>';
    var card = root.firstChild, b = card.querySelector(".pc-b"), p = document.createElement("div"); p.className = "pc-pn first";
    p.innerHTML = '<button type="button" class="pc-teach" aria-label="Teacher">' + MIC + '</button><div class="pc-st"></div>'; b.appendChild(p); void p.offsetWidth; p.classList.remove("first");
    var btn = p.querySelector(".pc-teach"), media = new Audio(), done = false;
    function end() { if (done) return; done = true; try { media.pause(); } catch (e) {} btn.classList.remove("on"); sceneDo("calm"); musicOn(); card.style.transition = "opacity .7s"; card.style.opacity = 0; setTimeout(resolve, 750); }
    card.querySelector(".pc-skip").onclick = end;
    media.preload = "auto"; media.src = AU + C.intro + ".mp3?v=2";
    media.addEventListener("play", function() { var h = p.querySelector(".pc-hint"); if (h) h.remove(); btn.classList.add("on"); sceneDo("listen"); musicOff(); });
    media.addEventListener("pause", function() { if (!media.ended) btn.classList.remove("on"); });
    media.addEventListener("ended", end); media.addEventListener("error", end);
    var pp = media.play();
    if (pp && pp.catch) pp.catch(function() {
      var hint = document.createElement("div"); hint.className = "pc-hint"; hint.textContent = EN ? "tap to listen" : "touchez pour \u00e9couter"; p.appendChild(hint);
      var kick = function() { document.removeEventListener("pointerdown", kick, true); document.removeEventListener("keydown", kick, true); if (!done && media.paused && !media.ended) { var q = media.play(); if (q && q.catch) q.catch(function() {}); } };
      document.addEventListener("pointerdown", kick, true); document.addEventListener("keydown", kick, true);
    });
    btn.onclick = function() { if (media.paused) { var q = media.play(); if (q && q.catch) q.catch(function() {}); } else media.pause(); };
  });
}
(async function() {
  try { var D = await (await fetch("/levels/reading-data.json?t=" + Date.now())).json(); C = D[KEY]; } catch (e) {}
  if (!C) { root.innerHTML = '<div class="rd2"><p class="dir on">' + (EN ? "This reading lesson is not ready yet." : "Cette leçon de lecture n'est pas encore prête.") + "</p></div>"; return; }
  bootScene();
  /* intro page: the same teacher card as every other lesson (scenery, speaker card, no board) */
  if (C.intro) await introCard(); else { await wait(300); }
  build();
  await typeHeading(T.title);
  var units = C.mode === "guided" ? C.passages.map(function(p) { return { sents: p.sents, audio: p.audio }; }) : [{ sents: C.sents, audio: null }];
  for (var i = 0; i < units.length; i++) await unit(units[i], i, units.length);
  complete();
})();
