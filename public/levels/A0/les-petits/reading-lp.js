import { auth } from "/js/firebase-core.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
/* Les Petits reading lesson (13, 19, 25). Mira reads a four-line talk; the child reads each line (graded very kindly, Mira says if it was
   right or what to fix), then Mira reads it all and the child reads it all (graded). Retry or skip at every step, as often as they like. */
var API = "https://saybonapp-server.onrender.com", AU = "/assets/audio/lp/";
var LESSON = parseInt((location.pathname.match(/lesson(\d+)\.html/) || [null, "13"])[1]);
var DATA = {
  13: [["Bonjour ! Ça va ?", "Hello! How are you?"], ["Ça va bien. Et toi ?", "I'm fine. And you?"], ["Je suis content. Merci, maman !", "I'm happy. Thank you, mom!"], ["De rien. Au revoir !", "You're welcome. Goodbye!"]],
  19: [["Bonjour ! Je m'appelle Sam. Et toi ?", "Hello! My name is Sam. And you?"], ["Enchanté, Sam ! La banane, s'il te plaît.", "Nice to meet you, Sam! The banana, please."], ["Oui ! Un, deux, trois ! Merci !", "Yes! One, two, three! Thank you!"], ["De rien ! La vache, le cheval ! Au revoir !", "You're welcome! The cow, the horse! Goodbye!"]],
  25: [["Bonjour ! Il fait chaud. Je danse !", "Hello! It is hot. I dance!"], ["Je saute ! Je chante ! Je suis content !", "I jump! I sing! I'm happy!"], ["J'ai sommeil. Merci, maman !", "I'm sleepy. Thank you, mom!"], ["Bonne nuit ! À demain !", "Good night! See you tomorrow!"]]
};
var LINES = DATA[LESSON] || DATA[13], ALLFR = LINES.map(function (l) { return l[0]; }).join(" ");
var PASS = 45, uid = null; onAuthStateChanged(auth, function (u) { uid = u ? u.uid : null; });
var root = document.getElementById("lsRoot");
var st = document.createElement("style");
st.textContent = `
.rl{max-width:640px;margin:0 auto;padding:74px 16px 30px;color:#fff;font-family:Manrope,system-ui,sans-serif;text-align:center}
.rl .card{background:rgba(20,30,50,.42);border:1px solid rgba(255,255,255,.28);border-radius:28px;padding:22px 18px 20px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 14px 40px rgba(0,0,0,.28)}
.rl .tag{font:800 .78rem 'Baloo 2',Manrope,sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.85;margin:0 0 4px}
.rl h2{font:800 clamp(1.5rem,5vw,2rem) 'Baloo 2',Manrope,sans-serif;margin:0 0 10px}
.rl .say{font-size:1rem;line-height:1.5;min-height:1.5em;margin:0 0 12px;opacity:.95}
.rl .ln{font:700 clamp(1.25rem,4.6vw,1.7rem) 'Baloo 2',Manrope,sans-serif;line-height:1.35;padding:8px 12px;margin:6px 0;border-radius:16px;background:rgba(255,255,255,.1);border:2px solid transparent;transition:all .3s}
.rl .ln small{display:block;font:500 .82rem Manrope,sans-serif;opacity:.75;margin-top:1px}
.rl .ln.cur{background:rgba(255,236,170,.2);border-color:rgba(255,224,130,.85)}
.rl .ln.ok{border-color:rgba(130,230,160,.9)}
.rl .ln.dim{opacity:.55}
.rl .w.bad{color:#ffb4a8;text-decoration:underline wavy rgba(255,150,130,.9);text-underline-offset:5px}
.rl .dots{display:flex;gap:8px;justify-content:center;margin:0 0 10px}
.rl .dots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.3)}
.rl .dots i.done{background:#7fe3a2}.rl .dots i.cur{background:#ffd666;transform:scale(1.25)}
.rl .ctl{min-height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;margin-top:10px}
.rl .stt{min-height:1.4em;font-size:.98rem;opacity:.95}
.rl .orb{width:20px;height:20px;border-radius:50%;background:#ffd666;transition:transform .08s linear}.rl .orb.idle{opacity:0}
.rl .btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.rl button{font:800 1rem 'Baloo 2',Manrope,sans-serif;border:0;border-radius:999px;padding:11px 26px;cursor:pointer;background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.35)}
.rl button.pri{background:linear-gradient(180deg,#ffe08a,#ffb94d);color:#3a2300;border:0;box-shadow:0 8px 22px rgba(255,170,60,.35)}
.rl button.lnk{background:none;border:0;font-weight:600;font-size:.9rem;opacity:.75;text-decoration:underline;padding:4px 8px}
.rl .stars{font-size:2.4rem;letter-spacing:6px;color:#ffd666;margin:6px 0}.rl .stars .off{opacity:.25}
@media (prefers-reduced-motion:reduce){.rl *{transition:none!important}}
`;
document.head.appendChild(st);
/* the same painted kids' background as the other Les Petits lessons */
(function () {
  document.body.classList.add("ps-wait"); function go() { document.body.classList.remove("ps-wait"); }
  try {
    function css(h) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = h; document.head.appendChild(l); }
    css("/levels/scene-paris/scene-paris.css?v=48"); css("/levels/scene-petits/scene-petits.css?v=3");
    function js(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }
    js("/levels/scene-petits/scene-petits.js?v=4", function () { js("/levels/scene-paris/scene-paris.js?v=48", function () { try { document.body.classList.add("ps-on"); window.__psScene = (window.PetitsScene ? PetitsScene.mount({ lesson: LESSON }) : (window.ParisScene ? ParisScene.mount({ mic: false, overlay: true, theme: 0, start: 0 }) : null)); } catch (e) {} go(); }); });
  } catch (e) { go(); }
  setTimeout(go, 6000);
})();
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function sceneDo(m) { try { var sc = window.__psScene; if (sc && sc[m]) sc[m](); } catch (e) {} }
function musicOff() { try { if (window.pauseAppBgMusicForRecording) window.pauseAppBgMusicForRecording(); } catch (e) {} }
function musicOn() { try { if (window.resumeAppBgMusicAfterRecording) window.resumeAppBgMusicAfterRecording(); } catch (e) {} }
/* one player for everything, started by the first tap so phones allow sound */
var SH = new Audio(), skipNow = null;
function play(name) { return new Promise(function (res) {
  var done = false; function fin() { if (done) return; done = true; skipNow = null; sceneDo("calm"); res("end"); }
  skipNow = function () { try { SH.pause(); } catch (e) {} if (!done) { done = true; skipNow = null; res("skip"); } };
  try { SH.onended = SH.onerror = null; SH.pause(); SH.src = AU + name + ".mp3?v=1"; SH.onended = SH.onerror = fin; sceneDo("listen"); var p = SH.play(); if (p && p.catch) p.catch(fin); } catch (e) { fin(); }
}); }
var ui = {}, stream = null;
function build() {
  root.innerHTML = '<div class="rl"><div class="card"><p class="tag">Les Petits · Lesson ' + LESSON + '</p><h2 id="rlH">Reading day</h2><p class="say" id="rlS"></p><div class="dots" id="rlD"></div><div id="rlL"></div><div class="ctl"><div class="stt" id="rlT"></div><div class="orb idle" id="rlO"></div><div class="btns" id="rlB"></div></div></div></div>';
  ui = { h: root.querySelector("#rlH"), say: root.querySelector("#rlS"), dots: root.querySelector("#rlD"), lines: root.querySelector("#rlL"), stt: root.querySelector("#rlT"), orb: root.querySelector("#rlO"), btns: root.querySelector("#rlB") };
  ui.dots.innerHTML = LINES.map(function () { return "<i></i>"; }).join("");
}
function drawLines(cur, weak, okSet) {
  ui.lines.innerHTML = LINES.map(function (l, i) {
    var words = l[0].split(/(\s+)/).map(function (w, k) { if (!w || /^\s+$/.test(w)) return w; var bad = weak && weak[i] && weak[i][Math.floor(k / 2)]; return '<span class="w' + (bad ? " bad" : "") + '">' + esc(w) + "</span>"; }).join("");
    return '<div class="ln' + (cur === i || cur === -1 ? " cur" : (cur >= 0 ? " dim" : "")) + (okSet && okSet[i] ? " ok" : "") + '">' + words + "<small>" + esc(l[1]) + "</small></div>";
  }).join("");
  [].forEach.call(ui.dots.children, function (d, i) { d.className = (okSet && okSet[i]) ? "done" : (cur === i ? "cur" : ""); });
}
function buttons(list) { return new Promise(function (res) { ui.btns.innerHTML = ""; list.forEach(function (b) { var e = document.createElement("button"); e.type = "button"; e.className = b[2] || ""; e.textContent = b[0]; e.onclick = function () { ui.btns.innerHTML = ""; res(b[1]); }; ui.btns.appendChild(e); }); }); }
/* plays a clip with a Skip link under it */
function playSkippable(name, label) { var sk = document.createElement("button"); sk.type = "button"; sk.className = "lnk"; sk.textContent = "Skip"; ui.btns.innerHTML = ""; ui.btns.appendChild(sk); sk.onclick = function () { if (skipNow) skipNow(); }; return play(name).then(function (r) { ui.btns.innerHTML = ""; return r; }); }
/* ---- microphone + automatic recorder ---- */
function getStream() { if (stream && stream.active) return Promise.resolve(stream); return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (s) { stream = s; return s; }); }
function stopStream() { try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} stream = null; }
function autoRecord(o) {
  return new Promise(function (resolve) {
    var done = false, mr = null, chunks = [], ac = null, raf = 0, spoke = false, lastVoice = 0, t0 = Date.now(), floor = 0, nf = 0;
    ui.orb.classList.remove("idle"); ui.stt.textContent = "I'm listening…"; musicOff(); sceneDo("micState");
    ui.btns.innerHTML = '<button class="lnk" id="rlSk">Skip</button>';
    function fin(v) { if (done) return; done = true; cancelAnimationFrame(raf); try { ac && ac.close(); } catch (e) {} ui.orb.classList.add("idle"); ui.orb.style.transform = ""; ui.btns.innerHTML = ""; musicOn(); resolve(v); }
    ui.btns.querySelector("#rlSk").onclick = function () { try { if (mr && mr.state === "recording") { mr.onstop = null; mr.stop(); } } catch (e) {} fin("skip"); };
    getStream().then(function (s) {
      var AC = window.AudioContext || window.webkitAudioContext; ac = new AC(); var an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(s).connect(an);
      var buf = new Float32Array(an.fftSize);
      mr = new MediaRecorder(s); mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () { fin(spoke ? new Blob(chunks, { type: mr.mimeType || "audio/webm" }) : "quiet"); };
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
    }).catch(function () { ui.stt.textContent = "Please allow the microphone, then try again."; fin("quiet"); });
  });
}
/* ---- grading (very kind): mean of the per-word scores the speech service measured ---- */
function decode16(blob) { return blob.arrayBuffer().then(function (ab) { var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); return new Promise(function (res, rej) { ac.decodeAudioData(ab, res, rej); }).then(function (buf) { try { ac.close(); } catch (e) {} var len = Math.max(1, Math.ceil(buf.duration * 16000)), oc = new OfflineAudioContext(1, len, 16000), src = oc.createBufferSource(); src.buffer = buf; src.connect(oc.destination); src.start(); return oc.startRendering(); }); }).then(function (o) { return o.getChannelData(0); }); }
function pcmToWav(d) { var n = d.length, pk = 0, i; for (i = 0; i < n; i++) { var a = Math.abs(d[i]); if (a > pk) pk = a; } var gain = (pk > 0.005 && pk < 0.7) ? 0.85 / pk : 1; var bf = new ArrayBuffer(44 + n * 2), v = new DataView(bf); function w(o, t) { for (var k = 0; k < t.length; k++) v.setUint8(o + k, t.charCodeAt(k)); } w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true); for (i = 0; i < n; i++) { var x = Math.max(-1, Math.min(1, d[i] * gain)); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); } var wb = new Blob([bf], { type: "audio/wav" }); wb.pk = pk; return wb; }
function acc(x) { return typeof x.AccuracyScore === "number" ? x.AccuracyScore : (x.PronunciationAssessment && typeof x.PronunciationAssessment.AccuracyScore === "number" ? x.PronunciationAssessment.AccuracyScore : (typeof x.accuracyScore === "number" ? x.accuracyScore : 0)); }
function errOf(x) { return x.ErrorType || (x.PronunciationAssessment && x.PronunciationAssessment.ErrorType) || x.errorType || ""; }
function pickScore(d) { var keys = ["finalScore", "score", "AccuracyScore", "accuracyScore", "pronunciationScore", "overallScore", "overall"]; for (var i = 0; i < keys.length; i++) { var v = d && d[keys[i]]; if (typeof v === "number" && isFinite(v)) return v; } return null; }
/* -> {quiet} | {err} | {mean, words:[score per reference word] or null} */
function grade(blob, ref) {
  return decode16(blob).then(pcmToWav).then(function (wb) {
    if (wb.pk < 0.012) return { quiet: true };
    return fetch(API + "/api/assessPronunciation?referenceText=" + encodeURIComponent(ref), { method: "POST", body: wb }).then(function (r) { return r.json(); }).then(function (j) {
      var rw = ref.split(/\s+/).filter(Boolean), raw = j && (j.detail || (j._debugRawAzureResponse && j._debugRawAzureResponse.NBest && j._debugRawAzureResponse.NBest[0] && j._debugRawAzureResponse.NBest[0].Words)),
        items = (raw || j.wordFeedback || j.words || []).filter(function (x) { return x && errOf(x) !== "Insertion"; }), words = null, mean;
      if (items.length && items.length === rw.length) { words = items.map(function (x) { return errOf(x) === "Omission" ? 0 : acc(x); }); mean = words.reduce(function (a, b) { return a + b; }, 0) / words.length; }
      else { mean = pickScore(j); if (mean === null) mean = items.length ? items.reduce(function (a, x) { return a + acc(x); }, 0) / items.length : 0; }
      if (mean < 8) return { quiet: true };
      return { mean: mean, words: words };
    });
  }).catch(function () { return { err: true }; });
}
var oks = {};
/* one line: child reads, Mira says if it was right or what to fix. resolves "next" or "skip" */
async function lineStep(i) {
  var tries = 0;
  drawLines(i, null, oks); ui.say.textContent = "Your turn!"; ui.stt.textContent = "";
  if (await playSkippable("readlp_yourturn") === "skip") return "skip";
  while (true) {
    var rec = await autoRecord({ sil: 1500, wait: 8000, cap: 14000 });
    if (rec === "skip") return "skip";
    if (rec === "quiet") { ui.stt.textContent = "I couldn't hear you."; if (await playSkippable("readlp_hear") === "skip") return "skip"; tries++; continue; }
    ui.stt.textContent = "Let me check…"; var g = await grade(rec, LINES[i][0]);
    if (g.quiet) { ui.stt.textContent = "I couldn't hear you."; if (await playSkippable("readlp_hear") === "skip") return "skip"; continue; }
    if (g.err) { ui.stt.textContent = "Hmm, that didn't work. Let's try again."; await wait(900); continue; }
    if (g.mean >= PASS) {
      oks[i] = true; drawLines(i, null, oks); ui.stt.textContent = ""; ui.say.textContent = "You read it!"; sceneDo("cheer");
      await playSkippable("readlp_ok" + (1 + (i % 3)));
      var c = await buttons([["Next", "next", "pri"], ["Say it again", "again", "lnk"]]);
      if (c === "again") { oks[i] = false; drawLines(i, null, oks); ui.say.textContent = "Your turn!"; continue; }
      return "next";
    }
    var weak = {}; if (g.words) { weak[i] = {}; g.words.forEach(function (s, k) { if (s < PASS) weak[i][k] = true; }); }
    drawLines(i, weak, oks); ui.say.textContent = g.words ? "Let's practise the red words." : "Almost! Listen to me."; ui.stt.textContent = "";
    if (await playSkippable("readlp_fix") === "skip") return "skip";
    if (await playSkippable("read" + LESSON + "_line" + (i + 1)) === "skip") return "skip";
    tries++; drawLines(i, null, oks); ui.say.textContent = "Try again!";
  }
}
async function finalStep() {
  while (true) {
    drawLines(-1, null, oks); ui.say.textContent = "Listen to the whole talk."; ui.stt.textContent = "";
    await playSkippable("read" + LESSON + "_all");
    ui.say.textContent = "Now you read it all!"; await playSkippable("readlp_youall");
    var rec = await autoRecord({ sil: 2400, wait: 10000, cap: 34000 });
    if (rec === "skip") return 0;
    if (rec === "quiet") { ui.stt.textContent = "I couldn't hear you."; if (await playSkippable("readlp_hear") === "skip") return 0; continue; }
    ui.stt.textContent = "Let me check…"; var g = await grade(rec, ALLFR);
    if (g.quiet || g.err) { ui.stt.textContent = g.err ? "Hmm, that didn't work. Let's try again." : "I couldn't hear you."; await wait(900); continue; }
    return g.mean;
  }
}
function markComplete() { if (!uid) return; fetch(API + "/api/levelProgressComplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: uid, level: "a0-les-petits", lesson: LESSON }) }).catch(function () {}); }
async function main() {
  build(); drawLines(-1, null, {});
  ui.h.textContent = "Reading day"; ui.say.textContent = "Tap to start. Mira will read with you!";
  await buttons([["Start", "go", "pri"]]);
  ui.say.textContent = ""; sceneDo("listen"); await playSkippable("read" + LESSON + "_intro");
  ui.h.textContent = "Let's read!"; ui.say.textContent = "Listen to the whole talk."; drawLines(-1, null, oks);
  await playSkippable("read" + LESSON + "_all");
  for (var i = 0; i < LINES.length; i++) await lineStep(i);
  var mean = await finalStep(); stopStream();
  var n = mean >= 60 ? 3 : (mean >= PASS ? 2 : 1), h = ""; for (var q = 0; q < 3; q++) h += '<span class="' + (q < n ? "" : "off") + '">★</span>';
  drawLines(-1, null, { 0: 1, 1: 1, 2: 1, 3: 1 });
  ui.h.textContent = n === 3 ? "Bravo !" : (n === 2 ? "Très bien !" : "Bon effort !");
  ui.say.innerHTML = '<span class="stars">' + h + "</span>"; ui.stt.textContent = ""; sceneDo("cheer"); markComplete();
  play("readlp_done");
  var c = await buttons([["Back to lessons", "back", "pri"], ["Read it again", "again", ""]]);
  if (c === "again") { oks = {}; return main(); } location.href = "./";
}
main();
