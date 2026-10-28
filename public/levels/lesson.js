import { API, META, esc, whenUser, token, loadAssets, loadProgress, loadTrackData, pad, isPreview } from "./lessons-common.js";

var q = new URLSearchParams(location.search);
var trackId = q.get("track"), N = parseInt(q.get("n"), 10) || 1, pv = isPreview();
var stage = document.getElementById("lsStage");
var track, lesson, assets = {}, best = {}, steps = [], si = 0;
var rec = null, chunks = [], stream = null, timer = null, startedAt = 0, busy = false, lastPraise = "";

document.getElementById("lsBack").onclick = function () { location.href = "track.html?track=" + trackId + (pv ? "&preview=1" : ""); };

// ---------- voice ----------
function speak(text, lang, o) {
  return new Promise(function (resolve) {
    if (!window.speechSynthesis) return resolve();
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "fr-FR"; u.rate = (o && o.rate) || 0.9; u.pitch = (o && o.pitch) || 1;
    u.onend = resolve; u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}
function playAsset(key, fallbackText, lang, o) {
  var a = assets[key];
  if (a && a.url) return new Promise(function (res) { var au = new Audio(a.url); au.onended = res; au.onerror = function () { speak(fallbackText, lang, o).then(res); }; au.play().catch(function () { speak(fallbackText, lang, o).then(res); }); });
  return speak(fallbackText, lang, o);
}
function key(suffix) { return trackId + "-l" + pad(N) + "-" + suffix; }
var introLang = function () { return (track.introLang === "fr" || track.introLang === "fr-en") ? "fr-FR" : "en-US"; };

// ---------- WAV ----------
function encodeWAV(samples, rate) {
  var b = new ArrayBuffer(44 + samples.length * 2), v = new DataView(b);
  function w(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (var i = 0, o = 44; i < samples.length; i++, o += 2) { var s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return b;
}
async function toWav(blob) {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var dec = await ctx.decodeAudioData(await blob.arrayBuffer());
  var off = new OfflineAudioContext(1, Math.ceil(dec.duration * 16000), 16000);
  var src = off.createBufferSource(); src.buffer = dec; src.connect(off.destination); src.start(0);
  var out = await off.startRendering(); ctx.close();
  return encodeWAV(out.getChannelData(0), 16000);
}

// ---------- praise ----------
var PRAISE_HI = ["Fantastic!", "Wow, that's wonderful!", "You've got it!", "Great job!", "Brilliant!", "You go!"];
var PRAISE_OK = ["Nice one!", "Great job!", "Well done!", "That's it!", "Good!"];
var PRAISE_TRY = ["Almost there. Listen once more, then try again.", "Close! Give it one more go.", "Good effort. Try again, a little slower."];
function pick(pool) {
  var p = pool.filter(function (x) { return x !== lastPraise; });
  lastPraise = p[Math.floor(Math.random() * p.length)]; return lastPraise;
}
function praiseFor(score) { return score >= 90 ? pick(PRAISE_HI) : score >= track.passMark ? pick(PRAISE_OK) : pick(PRAISE_TRY); }

// ---------- steps ----------
function buildSteps() {
  steps = [{ t: "intro" }];
  lesson.explain.forEach(function (e, i) { steps.push({ t: "explain", i: i }); });
  steps.push({ t: "listen" }); steps.push({ t: "role" }); steps.push({ t: "free" }); steps.push({ t: "recap" });
}
function progress() { document.getElementById("lsFill").style.width = (si / (steps.length - 1) * 100) + "%"; }
function teacherBox(extra) {
  var img = assets["teacher"] && assets["teacher"].url;
  return '<div class="ls-teacher">' + (img ? '<img src="' + esc(img) + '" alt="Teacher">' : '<span class="ic">🧑‍🏫</span>') + (extra || "") + "</div>";
}
function next() { speechSynthesis && speechSynthesis.cancel(); si++; render(); }

function render() {
  progress();
  var s = steps[si];
  ({ intro: rIntro, explain: rExplain, listen: rListen, role: rRole, free: rFree, recap: rRecap })[s.t](s);
}

// ----- intro (video placeholder: teacher icon + script) -----
function introText() { return typeof lesson.intro === "string" ? lesson.intro : lesson.intro.map(function (x) { return x.text; }).join(" "); }
function rIntro() {
  var k = key("intro");
  var vid = assets[k] && assets[k].url;
  stage.innerHTML = '<div class="ls-card ls-intro">' +
    (vid ? '<video src="' + esc(vid) + '" controls playsinline poster=""></video>' : teacherBox('<span class="ls-badge">Teacher intro (video)</span>')) +
    '<p class="ls-script">' + esc(introText()) + '</p><div class="ls-actions"><button class="ls-btn sec" id="lsPlay">▶ Play intro</button><button class="ls-btn" id="lsNext">Start the lesson</button></div></div>';
  document.getElementById("lsPlay").onclick = function () { playAsset(k, introText(), introLang(), { rate: 0.95 }); };
  document.getElementById("lsNext").onclick = next;
  if (!vid) setTimeout(function () { playAsset(k, introText(), introLang(), { rate: 0.95 }); }, 400);
}

// ----- recorder + attempt card -----
function attempt(box, stepId, expected, onResult, opts) {
  opts = opts || {};
  box.innerHTML = '<div class="ls-rec"><button class="ls-mic" id="lsMic" aria-label="Record">🎤</button><div class="ls-status" id="lsStatus">Tap and speak</div></div><div id="lsRes"></div>';
  var mic = box.querySelector("#lsMic"), st = box.querySelector("#lsStatus"), res = box.querySelector("#lsRes");
  mic.onclick = async function () {
    if (busy) return;
    if (rec && rec.state === "recording") { stopRec(); return; }
    try { speechSynthesis && speechSynthesis.cancel(); stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { st.textContent = "Microphone blocked. Please allow it in your browser."; return; }
    chunks = []; rec = new MediaRecorder(stream);
    rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
    rec.onstop = async function () {
      stream.getTracks().forEach(function (t) { t.stop(); });
      mic.classList.remove("rec"); mic.textContent = "🎤";
      if (Date.now() - startedAt < 600) { st.textContent = "Too short. Try again."; return; }
      busy = true; st.textContent = "Listening…";
      try {
        var wav = await toWav(new Blob(chunks));
        var r = await fetch(API + "/api/lessonGradeSpeaking?track=" + encodeURIComponent(trackId) + "&n=" + N + "&step=" + encodeURIComponent(stepId), {
          method: "POST", headers: { "Content-Type": "audio/wav", Authorization: "Bearer " + await token() }, body: wav });
        var d = await r.json();
        if (!r.ok) { st.textContent = d.error || "Please try again."; busy = false; return; }
        best[stepId] = Math.max(best[stepId] || 0, d.best != null ? d.best : d.score);
        st.textContent = "";
        var pass = d.score >= track.passMark;
        res.innerHTML = '<div class="ls-result ' + (pass ? "pass" : "try") + '"><b>' + d.score + '%</b><span>' + esc(praiseFor(d.score)) + '</span>' +
          (d.recognizedText ? '<em>“' + esc(d.recognizedText) + '”</em>' : "") + (d.tip ? "<small>💡 " + esc(d.tip) + "</small>" : "") + "</div>" +
          '<div class="ls-actions"><button class="ls-btn sec" id="lsAgain">Try again</button><button class="ls-btn" id="lsGo">Continue</button></div>';
        res.querySelector("#lsAgain").onclick = function () { res.innerHTML = ""; st.textContent = "Tap and speak"; };
        res.querySelector("#lsGo").onclick = function () { onResult(d); };
        if (pass && opts.auto) setTimeout(function () { if (res.querySelector("#lsGo")) onResult(d); }, 1100);
      } catch (e) { console.error(e); st.textContent = "Something went wrong. Try again."; }
      busy = false;
    };
    rec.start(); startedAt = Date.now(); mic.classList.add("rec"); mic.textContent = "⏹";
    var max = opts.max || 12;
    var tick = function () { var s = Math.round((Date.now() - startedAt) / 1000); st.textContent = "Recording… " + s + "s"; if (s >= max) stopRec(); };
    tick(); timer = setInterval(tick, 500);
  };
  function stopRec() { clearInterval(timer); if (rec && rec.state === "recording") rec.stop(); }
}

// ----- explain: teacher note, then repeat each phrase -----
function rExplain(s) {
  var e = lesson.explain[s.i], pi = 0;
  var k = key("explain" + (s.i + 1));
  function showNote() {
    stage.innerHTML = '<div class="ls-card">' + teacherBox() + '<p class="ls-script">' + esc(e.note) + '</p><ul class="ls-say">' +
      e.say.map(function (x) { return '<li><b>' + esc(x[0]) + "</b><i>" + esc(x[1]) + "</i></li>"; }).join("") + '</ul><div class="ls-actions"><button class="ls-btn sec" id="lsPlay">▶ Hear it</button><button class="ls-btn" id="lsGo">Now you say it</button></div></div>';
    document.getElementById("lsPlay").onclick = function () { playAsset(k, e.note, introLang()); };
    document.getElementById("lsGo").onclick = showPhrase;
    setTimeout(function () { playAsset(k, e.note, introLang()); }, 300);
  }
  function showPhrase() {
    var p = e.say[pi];
    stage.innerHTML = '<div class="ls-card"><p class="ls-count">' + (pi + 1) + " / " + e.say.length + '</p><p class="ls-fr">' + esc(p[0]) + '</p><p class="ls-en">' + esc(p[1]) + '</p>' +
      '<button class="ls-btn sec" id="lsHear">🔊 Listen</button><div id="lsBox"></div></div>';
    document.getElementById("lsHear").onclick = function () { speak(p[0]); };
    setTimeout(function () { speak(p[0]); }, 250);
    attempt(document.getElementById("lsBox"), "e" + s.i + "-" + pi, p[0], function () { pi++; if (pi < e.say.length) showPhrase(); else next(); }, { max: 10 });
  }
  showNote();
}

// ----- dialogue: listen -----
function bubble(l, cls) {
  var who = l.w === "t" ? "🧑‍🏫" : "You";
  return '<div class="ls-line ' + (l.w === "t" ? "t" : "y") + (cls || "") + '"><span class="who">' + who + '</span><div><b>' + esc(l.fr) + '</b><i>' + esc(l.en) + "</i></div></div>";
}
async function rListen() {
  stage.innerHTML = '<div class="ls-card"><p class="ls-script">Listen to the whole conversation first. You will play your part next.</p><div class="ls-dlg" id="lsDlg"></div><div class="ls-actions"><button class="ls-btn sec" id="lsRe">▶ Play</button><button class="ls-btn" id="lsGo">I\'m ready</button></div></div>';
  var box = document.getElementById("lsDlg");
  async function run() {
    var t = Date.now(); rListen.token = t; box.innerHTML = "";
    for (var i = 0; i < lesson.dialogue.length; i++) {
      if (rListen.token !== t) return;
      var l = lesson.dialogue[i];
      box.insertAdjacentHTML("beforeend", bubble(l)); box.scrollTop = box.scrollHeight;
      await playAsset(key("d" + i), l.fr, "fr-FR", l.w === "y" ? { pitch: 1.35, rate: 0.9 } : {});
    }
  }
  document.getElementById("lsRe").onclick = run;
  document.getElementById("lsGo").onclick = function () { rListen.token = 0; next(); };
  run();
}

// ----- dialogue: you play your part -----
function rRole() {
  var i = 0, L = lesson.dialogue, box;
  stage.innerHTML = '<div class="ls-card"><p class="ls-script">Now it\'s your turn. Answer in the conversation.</p><div class="ls-dlg" id="lsDlg"></div><div id="lsBox"></div></div>';
  box = document.getElementById("lsDlg");
  async function step() {
    while (i < L.length && L[i].w === "t") {
      box.insertAdjacentHTML("beforeend", bubble(L[i])); box.scrollTop = box.scrollHeight;
      await playAsset(key("d" + i), L[i].fr, "fr-FR"); i++;
    }
    if (i >= L.length) { document.getElementById("lsBox").innerHTML = '<div class="ls-actions"><button class="ls-btn" id="lsGo">Continue</button></div>'; document.getElementById("lsGo").onclick = next; return; }
    box.insertAdjacentHTML("beforeend", bubble(L[i], " is-active")); box.scrollTop = box.scrollHeight;
    var idx = i;
    attempt(document.getElementById("lsBox"), "d" + idx, L[idx].fr, function () {
      document.getElementById("lsBox").innerHTML = ""; i++; step();
    }, { max: 12, auto: true });
  }
  step();
}

// ----- free speaking task -----
function rFree() {
  var v = lesson.variation;
  stage.innerHTML = '<div class="ls-card">' + teacherBox('<span class="ls-badge">Your turn</span>') + '<p class="ls-fr">' + esc(v.voice) + '</p><p class="ls-en">' + esc(v.voiceEn) + '</p>' +
    '<p class="ls-task">' + esc(v.task) + '</p><button class="ls-btn sec" id="lsHear">🔊 Listen</button><div id="lsBox"></div></div>';
  document.getElementById("lsHear").onclick = function () { playAsset(key("free"), v.voice, "fr-FR"); };
  setTimeout(function () { playAsset(key("free"), v.voice, "fr-FR"); }, 300);
  attempt(document.getElementById("lsBox"), "v", v.sample, function () { next(); }, { max: v.max || 12 });
}

// ----- recap + result -----
function rRecap() {
  var ids = [];
  lesson.explain.forEach(function (e, i) { e.say.forEach(function (x, j) { ids.push("e" + i + "-" + j); }); });
  lesson.dialogue.forEach(function (d, k) { if (d.w === "y") ids.push("d" + k); });
  ids.push("v");
  var sum = 0; ids.forEach(function (id) { sum += best[id] || 0; });
  var avg = Math.round(sum / ids.length), done = avg >= track.passMark && ids.every(function (id) { return best[id] != null; });
  var nxt = lesson.n < 25 ? lesson.n + 1 : null;
  stage.innerHTML = '<div class="ls-card ls-recap">' + teacherBox() + '<p class="ls-script">' + esc(lesson.recap) + '</p>' +
    '<div class="ls-cele"><span class="ic">' + esc(lesson.celebrate.icon) + '</span><b>' + esc(lesson.celebrate.text) + '</b></div>' +
    '<div class="ls-result ' + (done ? "pass" : "try") + '"><b>' + avg + '%</b><span>' + (done ? "Lesson complete!" : "You need " + track.passMark + "% to unlock the next lesson. Replay the weaker parts.") + '</span></div>' +
    '<div class="ls-actions"><button class="ls-btn sec" id="lsAgain">Replay lesson</button>' +
    (done && nxt ? '<button class="ls-btn" id="lsNextL">Next lesson</button>' : '<button class="ls-btn" id="lsBack2">Back to lessons</button>') + '</div></div>';
  playAsset(key("recap"), lesson.recap, introLang());
  document.getElementById("lsAgain").onclick = function () { si = 0; render(); };
  var b = document.getElementById("lsNextL"); if (b) b.onclick = function () { location.href = "lesson.html?track=" + trackId + "&n=" + nxt + (pv ? "&preview=1" : ""); };
  var c = document.getElementById("lsBack2"); if (c) c.onclick = function () { location.href = "track.html?track=" + trackId + (pv ? "&preview=1" : ""); };
}

// ---------- start ----------
(async function () {
  track = await loadTrackData(trackId);
  lesson = track && track.lessons.filter(function (l) { return l.n === N; })[0];
  if (!lesson) { stage.innerHTML = '<p class="ls-note">This lesson is not ready yet.</p>'; return; }
  if (trackId === "ab-kids") document.body.classList.add("ls-kids-theme");
  document.getElementById("lsTitle").textContent = lesson.fr;
  document.getElementById("lsSub").textContent = track.name + " · Lesson " + N;
  var u = await whenUser();
  if (!u) { stage.innerHTML = '<p class="ls-note">Please sign in to start.</p>'; return; }
  var r = await Promise.all([loadAssets(), loadProgress()]);
  assets = r[0];
  var sc = ((r[1].scores || {})[trackId] || {})[N] || {};
  best = JSON.parse(JSON.stringify(sc));
  buildSteps(); si = 0; render();
})();
