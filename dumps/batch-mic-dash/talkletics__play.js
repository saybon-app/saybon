import { whenUser, token, loadAssets, loadProgress, gameAvg, gameDone, stars, nextGame, esc, API, CUR } from "./tk-common.js";

var q = new URLSearchParams(location.search);
var game = CUR.game(q.get("game") || "");
var main = document.getElementById("plMain");
var level, assets = {}, best = {}, idx = 0;
var rec = null, chunks = [], stream = null, timer = null, startedAt = 0, lastScore = null, busy = false;

document.getElementById("plBack").onclick = function () { location.href = "journey.html" + (q.get("preview") ? "?preview=1" : ""); };

// ---------- audio helpers ----------
function encodeWAV(samples, rate) {
  var b = new ArrayBuffer(44 + samples.length * 2), v = new DataView(b);
  function w(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (var i = 0, o = 44; i < samples.length; i++, o += 2) {
    var s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
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
function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = 0.9; speechSynthesis.speak(u);
}

// ---------- media ----------
function mediaHTML(item) {
  var m = item.media; if (!m) return "";
  var a = assets[m.key];
  var url = a && a.url;
  if (m.type === "audio") {
    return '<div class="pl-media"><button class="pl-play" data-say="' + esc(m.transcript) + '"' + (url ? ' data-url="' + esc(url) + '"' : "") + '>🔊 Écouter</button></div>';
  }
  if (m.type === "image") {
    if (url) return '<div class="pl-media"><img src="' + esc(url) + '" alt=""></div>';
    return '<div class="pl-media"><div class="pl-ph"><span class="ic">' + esc(m.icon || "🖼️") + '</span><small>' + esc(m.description) + '</small></div></div>';
  }
  if (m.type === "video") {
    var inner = url ? '<video src="' + esc(url) + '" controls playsinline></video>'
      : '<div class="pl-ph"><span class="ic">' + esc(m.icon || "🎬") + '</span><small>' + esc(m.description || "") + '</small></div>';
    return '<div class="pl-media">' + inner + (m.transcript ? '<button class="pl-play" data-say="' + esc(m.transcript) + '">🔊 Écouter</button>' : "") + "</div>";
  }
  return "";
}
function wirePlay(root) {
  root.querySelectorAll(".pl-play").forEach(function (b) {
    b.onclick = function () {
      if (b.dataset.url) { var au = new Audio(b.dataset.url); au.play().catch(function () { speak(b.dataset.say); }); }
      else speak(b.dataset.say);
    };
  });
}

// ---------- item screen ----------
function render() {
  var item = game.items[idx];
  document.getElementById("plCount").textContent = (idx + 1) + "/" + game.items.length;
  document.getElementById("plBarFill").style.width = (idx / game.items.length * 100) + "%";
  lastScore = null;
  var h = '<div class="pl-card">' + mediaHTML(item);
  if (item.mode === "ref") {
    h += '<p class="pl-fr">' + (item.showText !== false ? esc(item.expected) : "🎧") + '</p><p class="pl-en">' + esc(item.en) + "</p>";
    if (item.media && item.media.type === "image") h += '<p class="pl-task">Dites ce que vous voyez. <small>(' + esc(item.en) + ")</small></p>";
  } else {
    h += '<p class="pl-task">' + esc(item.task) + "</p>";
    if (item.en && item.media && item.media.type !== "image") h += '<p class="pl-en">' + esc(item.en) + "</p>";
    if (item.must && item.must.length) h += '<div class="pl-must">' + item.must.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div>";
    h += '<p class="pl-en" style="margin-top:8px"><small>' + item.min + "–" + item.max + " s</small></p>";
  }
  h += '</div><div class="pl-rec"><button class="pl-mic" id="plMic" aria-label="Record">🎤</button><div class="pl-status" id="plStatus">Appuyez pour parler</div></div><div id="plResult"></div>';
  main.innerHTML = h;
  wirePlay(main);
  document.getElementById("plMic").onclick = toggleRec;
  if (item.media && item.media.type === "audio" && !assets[item.media.key]) setTimeout(function () { speak(item.media.transcript); }, 400);
  else if (item.media && item.media.type === "video" && item.media.transcript) setTimeout(function () { speak(item.media.transcript); }, 400);
  else if (item.voice) setTimeout(function () { speak(item.voice); }, 400);
}

async function toggleRec() {
  if (busy) return;
  var mic = document.getElementById("plMic"), st = document.getElementById("plStatus");
  if (rec && rec.state === "recording") { stopRec(); return; }
  try {
    speechSynthesis && speechSynthesis.cancel();
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) { st.textContent = "Microphone bloqué - autorisez-le dans le navigateur."; return; }
  chunks = []; rec = new MediaRecorder(stream);
  rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
  rec.onstop = onStopped;
  rec.start(); startedAt = Date.now();
  mic.classList.add("rec"); mic.textContent = "⏹";
  var max = game.items[idx].mode === "free" ? game.items[idx].max : 15;
  var tick = function () {
    var s = Math.round((Date.now() - startedAt) / 1000);
    st.textContent = "Enregistrement… " + s + " s";
    if (s >= max) stopRec();
  };
  tick(); timer = setInterval(tick, 500);
}
function stopRec() {
  clearInterval(timer);
  if (rec && rec.state === "recording") rec.stop();
}
async function onStopped() {
  stream && stream.getTracks().forEach(function (t) { t.stop(); });
  var mic = document.getElementById("plMic"), st = document.getElementById("plStatus");
  mic.classList.remove("rec"); mic.textContent = "🎤";
  if (Date.now() - startedAt < 600) { st.textContent = "Trop court. Réessayez."; return; }
  busy = true; st.textContent = "Analyse en cours…";
  try {
    var wav = await toWav(new Blob(chunks));
    var item = game.items[idx];
    var r = await fetch(API + "/api/talkleticsGradeSpeaking?gameId=" + encodeURIComponent(game.id) + "&itemId=" + encodeURIComponent(item.id), {
      method: "POST", headers: { "Content-Type": "audio/wav", Authorization: "Bearer " + await token() }, body: wav
    });
    var d = await r.json();
    if (!r.ok) { st.textContent = d.error || "Erreur. Réessayez."; busy = false; return; }
    best[item.id] = Math.max(best[item.id] || 0, d.best != null ? d.best : d.score);
    lastScore = d; st.textContent = ""; showResult(d);
  } catch (e) { console.error(e); st.textContent = "Quelque chose a mal tourné. Réessayez."; }
  busy = false;
}

function showResult(d) {
  var pass = d.score >= game.passMark, last = idx === game.items.length - 1;
  var h = '<div class="pl-card"><div class="pl-score ' + (pass ? "pass" : "fail") + '">' + d.score + "%</div>" +
    '<p class="pl-said">« ' + esc(d.recognizedText) + " »</p>";
  if (d.tip) h += '<p class="pl-fb">💡 ' + esc(d.tip) + "</p>";
  if (d.missing && d.missing.length) h += '<p class="pl-fb">À ajouter : ' + d.missing.map(esc).join(" · ") + "</p>";
  if (d.note) h += '<p class="pl-fb">' + esc(d.note) + "</p>";
  h += '<div class="pl-actions"><button class="pl-btn sec" id="plRetry">Réessayer</button><button class="pl-btn" id="plNext">' +
    (last ? "Terminer" : "Suivant") + "</button></div></div>";
  document.getElementById("plResult").innerHTML = h;
  document.getElementById("plRetry").onclick = function () { document.getElementById("plResult").innerHTML = ""; document.getElementById("plStatus").textContent = "Appuyez pour parler"; };
  document.getElementById("plNext").onclick = function () { if (last) summary(); else { idx++; render(); } };
}

async function summary() {
  var scores = {}; scores[game.id] = best;
  var avg = gameAvg(game, scores), done = gameDone(game, scores), st = stars(game, scores);
  document.getElementById("plBarFill").style.width = "100%";
  var nx = nextGame(game);
  var h = '<div class="pl-card"><div class="pl-stars">' + (done ? "★".repeat(st) + "☆".repeat(3 - st) : "☆☆☆") + "</div>" +
    '<div class="pl-score ' + (done ? "pass" : "fail") + '">' + avg + '%</div><p class="pl-en">' +
    (done ? (game.isGraduation ? "🎓 Bravo ! Niveau validé !" : "Bravo ! Jeu réussi.") : "Il faut " + game.passMark + "% pour réussir. Refaites les réponses les plus faibles.") +
    '</p><ul class="pl-sum" style="list-style:none;padding:0">' +
    game.items.map(function (it, i) { return "<li><span>" + (i + 1) + ". " + esc((it.expected || it.task || "").slice(0, 38)) + "</span><b>" + (best[it.id] || 0) + "%</b></li>"; }).join("") +
    '</ul><div class="pl-actions"><button class="pl-btn sec" id="plAgain">Rejouer</button>' +
    (done && nx ? '<button class="pl-btn" id="plGo">Jeu suivant</button>' : '<button class="pl-btn" id="plMap">Le voyage</button>') + "</div></div>";
  main.innerHTML = h;
  document.getElementById("plAgain").onclick = function () { idx = 0; render(); };
  var go = document.getElementById("plGo");
  if (go) go.onclick = function () { location.href = "play.html?game=" + nx.id + (q.get("preview") ? "&preview=1" : ""); };
  var mp = document.getElementById("plMap");
  if (mp) mp.onclick = function () { location.href = "journey.html" + (q.get("preview") ? "?preview=1" : ""); };
}

// ---------- start ----------
(async function () {
  if (!game) { main.innerHTML = '<p class="pl-loading">Jeu introuvable.</p>'; return; }
  level = CUR.level(game.level);
  document.getElementById("plGame").textContent = game.title;
  document.getElementById("plPlace").textContent = level.place + " · " + level.cefr;
  var user = await whenUser();
  if (!user) { main.innerHTML = '<p class="pl-loading">Please sign in to play.</p>'; return; }
  var r = await Promise.all([loadAssets(), loadProgress()]);
  assets = r[0]; best = (r[1][game.id]) || {};
  render();
})();
