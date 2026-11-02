const API_BASE = "https://saybonapp-server.onrender.com";
import { app, auth, db } from "/js/firebase-init.js";
import { getStorage, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { PLACEMENT_CONTENT } from "/delf/placement-content.js?v=1";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

var storage = getStorage(app, "gs://saybon-3e3c2.firebasestorage.app");
signInAnonymously(auth).catch(function(e){ console.warn("Anon auth failed:", e); });

// ================================================================
// DELF PLACEMENT ENGINE
// Staircase: start at chosen level, must clear 70% (Listening+Reading
// combined) to climb one level up. Writing/Speaking are captured and
// saved, but scored as "pending" until AI grading is live.
// ================================================================

var LEVELS = {};
["a1","a2","b1","b2","c1","c2"].forEach(function(id){ LEVELS[id] = PLACEMENT_CONTENT[id]; });
LEVELS.prim = { id: "prim", label: "DELF Prim", group: "Kids", hasContent: false };
LEVELS.junior = { id: "junior", label: "DELF Junior", group: "Kids", hasContent: false };

var LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"];
var PASS_THRESHOLD = 0.70;

var accentChars = ["É","è","é","ê","à","â","Ç","ù","û","ô","î","ï","œ","«","»"];

function buildAccentKeyboard(targetInput){
  var wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.gap = "6px";
  wrap.style.marginBottom = "20px";

  accentChars.forEach(function(ch){
    var key = document.createElement("span");
    key.textContent = ch;
    key.style.display = "inline-block";
    key.style.padding = "6px 11px";
    key.style.borderRadius = "7px";
    key.style.cursor = "pointer";
    key.style.background = "rgba(212,175,106,.12)";
    key.style.color = "#d4af6a";
    key.style.fontSize = "15px";
    key.style.border = "1px solid rgba(212,175,106,.25)";
    key.onclick = function(){
      var start = targetInput.selectionStart;
      var end = targetInput.selectionEnd;
      var val = targetInput.value;
      targetInput.value = val.slice(0, start) + ch + val.slice(end);
      targetInput.selectionStart = targetInput.selectionEnd = start + ch.length;
      targetInput.focus();
    };
    wrap.appendChild(key);
  });

  return wrap;
}

var root = document.getElementById("plRoot");

var state = {
  currentLevelId: null,
  listeningAnswers: [],
  readingAnswers: [],
  writingText: "",
  speakingBlob: null,
  clearedLevels: [],
  built: null,
  ttsPlays: {},
  audio: {}
};

var delfAssetsMap = {};

function loadDelfAssets(){
  return fetch(API_BASE + "/api/delfAssets").then(function(res){ return res.json(); }).then(function(assets){
    delfAssetsMap = {};
    (assets || []).forEach(function(a){ delfAssetsMap[a.name] = a.url; });
  }).catch(function(err){
    console.warn("Could not load DELF assets:", err);
  });
}

function render(html){
  root.innerHTML = html;
}

// ---------------- LEVEL PICKER ----------------

function renderLevelPicker(){
  var toutPublic = LEVEL_ORDER.map(function(id){
    var lvl = LEVELS[id];
    return '<button class="pl-level-btn" onclick="startLevel(\'' + id + '\')">' +
      '<div><h3>' + lvl.label + '</h3><p>' + (lvl.hasContent ? "Ready" : "Content coming soon") + '</p></div>' +
      '<span class="pl-arrow">→</span></button>';
  }).join("");

  var kids = ["prim", "junior"].map(function(id){
    var lvl = LEVELS[id];
    return '<button class="pl-level-btn" onclick="startLevel(\'' + id + '\')">' +
      '<div><h3>' + lvl.label + '</h3><p>' + (lvl.hasContent ? "Ready" : "Content coming soon") + '</p></div>' +
      '<span class="pl-arrow">→</span></button>';
  }).join("");

  render(
    '<p class="pl-eyebrow">DELF Placement</p>' +
    '<h1 class="pl-title">Choose the level you\'d like to test into</h1>' +
    '<p class="pl-subtitle">Pick whichever level feels right to you. We\'ll score you honestly and share what we find - the choice of what to do with it is always yours.</p>' +
    '<div class="pl-group-label">Tout Public</div>' +
    '<div class="pl-level-grid">' + toutPublic + '</div>' +
    '<div class="pl-group-label">DELF Prim &amp; Junior</div>' +
    '<div class="pl-level-grid">' + kids + '</div>'
  );
}

function startLevel(levelId){
  var lvl = LEVELS[levelId];
  if(!lvl.hasContent){
    render(
      '<p class="pl-eyebrow">DELF Placement</p>' +
      '<h1 class="pl-title">' + lvl.label + ' is on its way</h1>' +
      '<p class="pl-subtitle">This level\'s content is still being added. You\'re welcome to start your placement at A1 for now.</p>' +
      '<div class="pl-btn-row">' +
      '<button class="pl-btn pl-btn-secondary" onclick="renderLevelPicker()">Back to Levels</button>' +
      '<button class="pl-btn pl-btn-primary" onclick="startLevel(\'a1\')">Start at A1</button>' +
      '</div>'
    );
    return;
  }

  state.currentLevelId = levelId;
  state.listeningAnswers = [];
  state.readingAnswers = [];
  state.writingText = "";
  state.speakingBlob = null;
  state.ttsPlays = {};
  state.built = buildTest(levelId);

  root.innerHTML = '<p class="pl-loading">Loading...</p>';
  loadDelfAssets().then(function(){
    renderListening();
  });
}

// ---------------- TEST BUILD (shuffle options once per attempt) ----------------

function shuffled(n){
  var a = []; for(var i = 0; i < n; i++) a.push(i);
  for(var j = n - 1; j > 0; j--){ var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; }
  return a;
}

function buildSkill(docs, bodyKey){
  var flat = [];
  var built = docs.map(function(d, di){
    var qs = d.questions.map(function(q){
      var order = shuffled(q.options.length);
      var item = { q: q.q, options: order.map(function(o){ return q.options[o]; }), correct: order.indexOf(q.correct), gi: flat.length };
      flat.push(item);
      return item;
    });
    return { title: d.title, body: d[bodyKey], voice: d.voice, questions: qs };
  });
  return { docs: built, flat: flat };
}

function buildTest(levelId){
  var lvl = LEVELS[levelId];
  return { listening: buildSkill(lvl.listening.docs, "script"), reading: buildSkill(lvl.reading.texts, "passage") };
}

function esc(t){ return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function questionBlock(item, n, skill){
  var answers = skill === "listening" ? state.listeningAnswers : state.readingAnswers;
  var opts = item.options.map(function(opt, oi){
    var sel = "";
    return '<button class="pl-option' + sel + '" data-skill="' + skill + '" data-gi="' + item.gi + '" data-oi="' + oi + '" onclick="' + (skill === "listening" ? "selectListening" : "selectReading") + '(' + item.gi + ',' + oi + ')">' + esc(opt) + '</button>';
  }).join("");
  return '<div class="pl-qblock"><p class="pl-question">' + n + '. ' + esc(item.q) + '</p><div class="pl-options" data-qgi="' + item.gi + '">' + opts + '</div></div>';
}

function allDone(skill){
  var flat = state.built[skill].flat;
  var answers = skill === "listening" ? state.listeningAnswers : state.readingAnswers;
  for(var i = 0; i < flat.length; i++){ if(answers[i] === undefined) return false; }
  return true;
}

function markSelected(skill, gi, oi){
  var flat = state.built[skill].flat;
  var answers = skill === "listening" ? state.listeningAnswers : state.readingAnswers;
  if(gi >= 0){
    var item = flat[gi];
    var btns = document.querySelectorAll('.pl-option[data-skill="' + skill + '"][data-gi="' + gi + '"]');
    for(var i = 0; i < btns.length; i++){
      var idx = Number(btns[i].getAttribute("data-oi"));
      btns[i].disabled = true;
      btns[i].classList.add("pl-locked");
      if(idx === oi) btns[i].classList.add(oi === item.correct ? "pl-correct" : "pl-wrong");
      else if(idx === item.correct && oi !== item.correct) btns[i].classList.add("pl-correct");
    }
  }
  var cont = document.getElementById("plContinue");
  if(cont) cont.disabled = !allDone(skill);
  var left = document.getElementById("plLeft");
  if(left){
    var c = 0;
    for(var k = 0; k < flat.length; k++){ if(answers[k] !== undefined) c++; }
    left.textContent = c + " of " + flat.length + " answered";
  }
}

// ---------------- LISTENING ----------------

function audioUrlFor(levelId, docIndex){
  // Uploaded audio is ignored on purpose: every recording is built from the exact script of its own document.
  return null;
}

function renderListening(){
  var lvl = LEVELS[state.currentLevelId];
  var docs = state.built.listening.docs;
  var n = 0;
  state.audio = {};
  var html = docs.map(function(d, di){
    var url = audioUrlFor(state.currentLevelId, di);
    var player;
    if(url){
      player = '<audio controls preload="none" style="width:100%;margin-bottom:14px;" src="' + url + '"></audio>';
    } else {
      var left = 2 - (state.ttsPlays[di] || 0);
      player = '<div class="pl-tts"><button class="pl-btn pl-btn-secondary pl-tts-btn" id="plTts' + di + '" onclick="playListeningDoc(' + di + ')" disabled>Preparing audio...</button>' +
        '<span class="pl-tts-left" id="plTtsLeft' + di + '">' + left + ' ' + (left === 1 ? "play" : "plays") + ' left</span></div>';
    }
    var qs = d.questions.map(function(q){ n++; return questionBlock(q, n, "listening"); }).join("");
    return '<div class="pl-doc"><h3 class="pl-doc-title">Document ' + (di + 1) + ' of ' + docs.length + '</h3>' + player + qs + '</div>';
  }).join("");

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Listening</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Listen &amp; Answer</span>' +
    '<p class="pl-hint">Listen to each document, then answer its questions. You may listen twice.</p>' +
    html +
    '<div class="pl-btn-row"><span class="pl-count" id="plLeft"></span><button class="pl-btn pl-btn-primary" id="plContinue" disabled onclick="renderReading()">Continue to Reading</button></div>' +
    '</div>'
  );
  markSelected("listening", -1, -1);
  docs.forEach(function(d, di){ if(!audioUrlFor(state.currentLevelId, di)) prepareAudio(di); });
}

function ttsSetBtn(di, html, disabled){
  var b = document.getElementById("plTts" + di);
  if(b){ b.innerHTML = html; b.disabled = !!disabled; }
}
function ttsSetLeft(di){
  var left = 2 - (state.ttsPlays[di] || 0);
  var lab = document.getElementById("plTtsLeft" + di);
  if(lab) lab.textContent = left + ' ' + (left === 1 ? "play" : "plays") + ' left';
  return left;
}
function ttsIdle(di){
  var a = state.audio && state.audio[di];
  var left = ttsSetLeft(di);
  if(a && a.status === "failed" && !window.speechSynthesis){ ttsSetBtn(di, "Retry audio", false); return; }
  ttsSetBtn(di, "&#9658; Listen", left <= 0);
}

// Fetch a real French neural-voice recording for this document from the server.
function prepareAudio(di){
  var a = state.audio[di] = { status: "loading", el: null };
  var text = state.built.listening.docs[di].body;
  var levelId = state.currentLevelId;
  var voice = state.built.listening.docs[di].voice || "f";
  var user = auth.currentUser;
  var ctl = (typeof AbortController !== "undefined") ? new AbortController() : null;
  var timer = setTimeout(function(){ if(ctl) ctl.abort(); }, 45000);
  var tokenP = user ? user.getIdToken() : Promise.reject(new Error("not signed in"));
  tokenP.then(function(token){
    return fetch(API_BASE + "/api/delf/tts", {
      method: "POST", signal: ctl ? ctl.signal : undefined,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ text: text, level: levelId, voice: voice })
    });
  }).then(function(res){
    if(!res.ok) throw new Error("tts " + res.status);
    return res.blob();
  }).then(function(blob){
    clearTimeout(timer);
    if(!blob || blob.size < 1000) throw new Error("empty audio");
    if(state.audio[di] !== a) return;               // page moved on
    var el = new Audio();
    el.preload = "auto";
    el.src = URL.createObjectURL(blob);
    a.el = el; a.status = "ready";
    ttsIdle(di);
  }).catch(function(e){
    clearTimeout(timer);
    console.warn("DELF audio unavailable, using device voice:", e);
    if(state.audio[di] !== a) return;
    a.status = "failed";
    ttsIdle(di);
  });
}

function stopAllListening(){
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
  var all = state.audio || {};
  Object.keys(all).forEach(function(k){ try{ if(all[k].el){ all[k].el.pause(); } }catch(e){} });
}

function playListeningDoc(di){
  if((state.ttsPlays[di] || 0) >= 2) return;
  var a = state.audio && state.audio[di];
  if(!a) return;
  if(a.status === "failed" && !window.speechSynthesis){ prepareAudio(di); ttsSetBtn(di, "Preparing audio...", true); return; }
  stopAllListening();
  var counted = false;
  var count = function(){
    if(counted) return; counted = true;
    state.ttsPlays[di] = (state.ttsPlays[di] || 0) + 1;
    ttsSetLeft(di);
    ttsSetBtn(di, "Playing...", true);
  };
  var finish = function(){ ttsIdle(di); };
  var problem = function(){ if(!counted){ ttsSetBtn(di, "&#9658; Listen again", false); } else { finish(); } };

  if(a.status === "ready" && a.el){
    var el = a.el;
    el.onplaying = count; el.onended = finish; el.onerror = problem;
    try{ el.currentTime = 0; }catch(e){}
    var p = el.play();
    if(p && p.catch){ p.catch(function(){ problem(); }); }
    return;
  }

  // Fallback: the device's own voice (only if the server audio could not be loaded).
  if(!window.speechSynthesis){ problem(); return; }
  var text = state.built.listening.docs[di].body.replace(/(^|\s)[–—-]\s/g, "$1");
  var u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR"; u.rate = 0.85;
  var voices = window.speechSynthesis.getVoices();
  for(var i = 0; i < voices.length; i++){ if(voices[i].lang && voices[i].lang.toLowerCase().replace("_","-").indexOf("fr") === 0){ u.voice = voices[i]; break; } }
  var done = false;
  var end = function(){ if(done) return; done = true; clearTimeout(starter); clearTimeout(cap); finish(); };
  u.onstart = count; u.onend = end;
  u.onerror = function(){ if(done) return; done = true; clearTimeout(starter); clearTimeout(cap); problem(); };
  var starter = setTimeout(function(){ if(!counted && !done){ done = true; try{ window.speechSynthesis.cancel(); }catch(e){} problem(); } }, 6000);
  var cap = setTimeout(end, 180000);
  window.speechSynthesis.speak(u);
}

function selectListening(gi, oi){
  if(state.listeningAnswers[gi] !== undefined) return;
  state.listeningAnswers[gi] = oi;
  markSelected("listening", gi, oi);
}

// ---------------- READING ----------------

function renderReading(){
  stopAllListening();
  var lvl = LEVELS[state.currentLevelId];
  var texts = state.built.reading.docs;
  var n = 0;
  var html = texts.map(function(d, di){
    var qs = d.questions.map(function(q){ n++; return questionBlock(q, n, "reading"); }).join("");
    return '<div class="pl-doc"><h3 class="pl-doc-title">' + esc(d.title) + '</h3><p class="pl-passage">' + esc(d.body) + '</p>' + qs + '</div>';
  }).join("");

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Reading</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Read &amp; Answer</span>' +
    html +
    '<div class="pl-btn-row"><span class="pl-count" id="plLeft"></span><button class="pl-btn pl-btn-primary" id="plContinue" disabled onclick="renderWriting()">Continue to Writing</button></div>' +
    '</div>'
  );
  markSelected("reading", -1, -1);
  window.scrollTo(0, 0);
}

function selectReading(gi, oi){
  if(state.readingAnswers[gi] !== undefined) return;
  state.readingAnswers[gi] = oi;
  markSelected("reading", gi, oi);
}

// ---------------- WRITING ----------------

function renderWriting(){
  var lvl = LEVELS[state.currentLevelId];

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Writing</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Written Response</span>' +
    '<p class="pl-question">' + lvl.writing.prompt + '</p>' +
    '<textarea class="pl-textarea" id="plWritingInput" placeholder="Écrivez votre réponse ici...">' + state.writingText + '</textarea>' +
    '<div class="pl-accent-row" id="plAccentRow"></div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="submitWriting()">Continue to Speaking</button></div>' +
    '</div>'
  );

  var accentTarget = document.getElementById("plWritingInput");
  var accentRow = document.getElementById("plAccentRow");
  accentRow.appendChild(buildAccentKeyboard(accentTarget));
}

function submitWriting(){
  state.writingText = document.getElementById("plWritingInput").value;
  renderSpeaking();
}

// ---------------- SPEAKING ----------------

var mediaRecorder = null;
var recordedChunks = [];
var currentStream = null;

function renderSpeaking(){
  var lvl = LEVELS[state.currentLevelId];

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Speaking</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Spoken Response</span>' +
    '<p class="pl-question">' + lvl.speaking.prompt + '</p>' +
    '<canvas id="plWaveCanvas" class="pl-wave-canvas" width="280" height="56" style="display:none;"></canvas>' +
    '<div class="pl-record-row">' +
    '<button class="pl-record-btn" id="plRecordBtn" onclick="toggleRecording()">● Record</button>' +
    '<span class="pl-record-status" id="plRecordStatus">' + (state.speakingBlob ? "Recording captured" : "Not recorded yet") + '</span>' +
    '</div>' +
    '<div class="pl-playback-row" id="plPlaybackRow" style="display:none;">' +
    '<button class="pl-btn pl-btn-secondary" id="plPlayBtn">&#9658; Play My Recording</button>' +
    '<button class="pl-btn pl-btn-secondary" id="plRerecordBtn">&#8635; Re-record</button>' +
    '</div>' +
    '<audio id="plPlaybackAudio" style="display:none;"></audio>' +
    '<div class="pl-pending-note">Your recording is saved and will be scored shortly.</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finishLevel()">See My Result</button></div>' +
    '</div>'
  );

  document.getElementById("plPlayBtn").addEventListener("click", playRecording);
  document.getElementById("plRerecordBtn").addEventListener("click", reRecordSpeaking);
}

var plAudioCtx = null;
var plWaveAnimId = null;

function startWave(streamOrElement, isElement){
  var canvas = document.getElementById("plWaveCanvas");
  var ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  if(!plAudioCtx){
    plAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var analyser = plAudioCtx.createAnalyser();
  analyser.fftSize = 64;

  if(isElement){
    if(!streamOrElement._plWaveSource){
      streamOrElement._plWaveSource = plAudioCtx.createMediaElementSource(streamOrElement);
      streamOrElement._plWaveSource.connect(plAudioCtx.destination);
    }
    streamOrElement._plWaveSource.connect(analyser);
  } else {
    var source = plAudioCtx.createMediaStreamSource(streamOrElement);
    source.connect(analyser);
  }

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  function draw(){
    plWaveAnimId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var barWidth = (canvas.width / bufferLength) * 1.8;
    var x = 0;
    for(var i = 0; i < bufferLength; i++){
      var barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = "#d4af6a";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 2;
    }
  }
  draw();
}

function stopWave(){
  if(plWaveAnimId){
    cancelAnimationFrame(plWaveAnimId);
    plWaveAnimId = null;
  }
  var canvas = document.getElementById("plWaveCanvas");
  if(canvas){
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
}

function playRecording(){
  var playBtn = document.getElementById("plPlayBtn");
  var audioEl = document.getElementById("plPlaybackAudio");
  var originalLabel = playBtn.innerHTML;
  playBtn.innerHTML = '<span class="pl-loading-pulse"></span>Loading...';
  playBtn.disabled = true;

  audioEl.src = URL.createObjectURL(state.speakingBlob);

  var onReady = function(){
    playBtn.innerHTML = originalLabel;
    playBtn.disabled = false;
    startWave(audioEl, true);
    audioEl.currentTime = 0;
    audioEl.play();
  };

  audioEl.addEventListener("canplay", onReady, { once: true });
  audioEl.addEventListener("ended", stopWave, { once: true });
}

function reRecordSpeaking(){
  state.speakingBlob = null;
  document.getElementById("plPlaybackRow").style.display = "none";
  var btn = document.getElementById("plRecordBtn");
  btn.style.display = "inline-block";
  btn.textContent = "● Record";
  btn.classList.remove("pl-recording");
  document.getElementById("plRecordStatus").textContent = "Not recorded yet";
}

function toggleRecording(){
  var btn = document.getElementById("plRecordBtn");
  var status = document.getElementById("plRecordStatus");

  if(!mediaRecorder || mediaRecorder.state === "inactive"){
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      currentStream = stream;
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function(e){ recordedChunks.push(e.data); };
      mediaRecorder.onstop = function(){ if(window.resumeAppBgMusicAfterRecording){ window.resumeAppBgMusicAfterRecording(); }
        state.speakingBlob = new Blob(recordedChunks, { type: "audio/webm" });
        stopWave();
        document.getElementById("plRecordBtn").style.display = "none";
        document.getElementById("plPlaybackRow").style.display = "flex";
        currentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      if(window.pauseAppBgMusicForRecording){ window.pauseAppBgMusicForRecording(); } mediaRecorder.start();
      startWave(stream, false);
      btn.textContent = "■ Stop";
      btn.classList.add("pl-recording");
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    mediaRecorder.stop();
  }
}

// ---------------- SCORING + LEVEL RESULT ----------------

function scoreLevel(){
  var lq = state.built.listening.flat, rq = state.built.reading.flat;
  var lc = 0, rc = 0;
  lq.forEach(function(item, i){ if(state.listeningAnswers[i] === item.correct) lc++; });
  rq.forEach(function(item, i){ if(state.readingAnswers[i] === item.correct) rc++; });
  var total = lq.length + rq.length, correct = lc + rc;
  return { correct: correct, total: total, pct: correct / total,
    listening: { correct: lc, total: lq.length },
    reading: { correct: rc, total: rq.length } };
}

function finishLevel(){
  var result = scoreLevel();
  var passed = result.pct >= PASS_THRESHOLD;
  var lvl = LEVELS[state.currentLevelId];

  if(passed) state.clearedLevels.push(state.currentLevelId);

  saveResultToFirestore(state.currentLevelId, result, passed);

  var nextIdx = LEVEL_ORDER.indexOf(state.currentLevelId) + 1;
  var nextLevelId = LEVEL_ORDER[nextIdx];
  var canClimb = passed && nextLevelId && LEVELS[nextLevelId].hasContent;
  var nextLevelExistsButLocked = passed && nextLevelId && !LEVELS[nextLevelId].hasContent;

  var pctDisplay = Math.round(result.pct * 100);

  var msg, buttons;

  if(passed && canClimb){
    msg = "Well done - you cleared " + lvl.label + " with " + pctDisplay + "%. Let's see how you do at " + LEVELS[nextLevelId].label + ".";
    buttons = '<div class="pl-btn-row">' +
      '<button class="pl-btn pl-btn-secondary" onclick="finalizeResult()">Stop Here</button>' +
      '<button class="pl-btn pl-btn-primary" onclick="startLevel(\'' + nextLevelId + '\')">Try ' + LEVELS[nextLevelId].label + '</button>' +
      '</div>';
  } else if(passed && nextLevelExistsButLocked){
    msg = "Well done - you cleared " + lvl.label + " with " + pctDisplay + "%. The next level's content is still being added, so this is where your placement stands for now.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else if(passed && !nextLevelId){
    msg = "Excellent - you cleared " + lvl.label + " with " + pctDisplay + "%, the highest level we currently test.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else {
    msg = "You scored " + pctDisplay + "% at " + lvl.label + " - just under our 70% threshold to climb further. That's completely alright, and this gives us an honest picture of where to begin.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  }

  render(
    '<div class="pl-card">' +
    '<div class="pl-result-score">' + pctDisplay + '%</div>' +
    '<p class="pl-result-msg">' + msg + '</p>' +
    buttons +
    '</div>'
  );
}

function finalizeResult(){
  var highestCleared = state.clearedLevels.length > 0
    ? LEVELS[state.clearedLevels[state.clearedLevels.length - 1]].label
    : "Below A1";

  render(
    '<p class="pl-eyebrow">Your Placement</p>' +
    '<h1 class="pl-title">You\'re placed at ' + highestCleared + '</h1>' +
    '<p class="pl-subtitle">This is saved as your baseline on your DELF dashboard. Every test score from your preparation will be added right alongside it, so you can watch your progress from here.</p>' +
    '<div class="pl-btn-row">' +
    '<button class="pl-btn pl-btn-secondary" onclick="renderLevelPicker()">Test Another Level</button>' +
    '<button class="pl-btn pl-btn-primary" onclick="location.href=\'/delf/tout-public/\'">Begin Your Preparation</button>' +
    '</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-secondary" onclick="location.href=\'/delf/dashboard.html\'">See My DELF Results</button></div>'
  );
}

// ---------------- FIRESTORE SAVE ----------------

function saveResultToFirestore(levelId, result, passed){
  if(!auth.currentUser){
    console.warn("Not saving placement result - no authenticated user");
    return;
  }
  var user = auth.currentUser;
  var speakingBlob = state.speakingBlob;
  user.getIdToken().then(function(token){
    return fetch(API_BASE + "/api/delf/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({
        level: levelId,
        listening: result.listening,
        reading: result.reading,
        writingResponse: state.writingText || null,
        speakingRecorded: !!speakingBlob
      })
    });
  }).then(function(res){
    if(!res.ok) throw new Error("save failed " + res.status);
    if(speakingBlob){
      var speakingRef = storageRef(storage, "delfPlacements/" + user.uid + "/" + levelId + "-speaking-" + Date.now() + ".webm");
      uploadBytes(speakingRef, speakingBlob).catch(function(err){
        console.error("Speaking upload failed:", err);
      });
    }
  }).catch(function(err){
    console.error("Could not save placement result:", err);
  });
}

// ---------------- INIT ----------------

renderLevelPicker();


// Expose functions referenced by dynamically-generated HTML onclick attributes,
// since module scope does not attach them to window automatically.
window.renderLevelPicker = renderLevelPicker;
window.renderReading = renderReading;
window.renderWriting = renderWriting;
window.renderReading = renderReading;
window.renderWriting = renderWriting;
window.startLevel = startLevel;
window.selectListening = selectListening;
window.playListeningDoc = playListeningDoc;
window.selectReading = selectReading;
window.submitWriting = submitWriting;
window.toggleRecording = toggleRecording;
window.finishLevel = finishLevel;
window.finalizeResult = finalizeResult;









