import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.lsCurrentUid = null;
onAuthStateChanged(auth, function(user){
  window.lsCurrentUid = user ? user.uid : null;
});
const API_BASE = "https://saybonapp-server.onrender.com";

var pathParts = location.pathname.split("/").filter(Boolean);
var LEVEL;
if(pathParts.indexOf("tout-public") !== -1){ LEVEL = "a0-tout-public"; }
else { LEVEL = pathParts[1].toLowerCase(); }
const LESSON = parseInt((location.pathname.match(/lesson(\d+)\.html/) || [null, "1"])[1]);

var root = document.getElementById("lsRoot");
var allAssets = [];
var currentPart = 1;
var recordedBlob = null;
var mediaRecorder = null;
var recordedChunks = [];
var currentStream = null;
var lsAudioCtx = null;
var lsWaveAnimId = null;

function render(html){ root.innerHTML = html; }

function renderBlock(block){
  var sizeClass = block.size ? "ls-size-" + block.size : "ls-size-large";
  if(block.type === "text") return '<div class="ls-block ls-block-text">' + block.content + '</div>';
  if(block.type === "image") return '<div class="ls-block ' + sizeClass + '"><img src="' + block.url + '"></div>';
  if(block.type === "audio") return '<div class="ls-block"><audio controls src="' + block.url + '"></audio></div>';
  if(block.type === "video") return '<div class="ls-block ' + sizeClass + '"><video controls src="' + block.url + '"></video></div>';
  return "";
}

function getPartAssets(partNum){
  return allAssets.filter(function(a){ return a.part === partNum; });
}

function renderPart(partNum, label){
  var blocks = getPartAssets(partNum);
  var promptBlock = blocks.find(function(b){ return b.recordPrompt; });
  var needsRecording = partNum === 2 || partNum === 3;

  var blocksHtml = blocks.map(renderBlock).join("");

  var recordSection = "";
  if(needsRecording){
    var promptText = promptBlock ? promptBlock.recordPrompt : "Record your answer";
    recordSection =
      '<div class="ls-prompt-bubble">' + promptText + '</div>' +
      '<canvas id="lsWaveCanvas" class="ls-wave-canvas" width="280" height="56" style="display:none;"></canvas>' +
      '<div class="ls-record-row">' +
      '<button class="ls-record-btn" id="lsRecordBtn">● Record</button>' +
      '<span class="ls-record-status" id="lsRecordStatus">' + (recordedBlob ? "Recorded" : "Not recorded yet") + '</span>' +
      '</div>' +
      '<div class="ls-playback-row" id="lsPlaybackRow" style="display:none;">' +
      '<button class="ls-btn ls-btn-secondary" id="lsPlayBtn">&#9658; Play My Recording</button>' +
      '<button class="ls-btn ls-btn-secondary" id="lsRerecordBtn">&#8635; Re-record</button>' +
      '</div>' +
      '<audio id="lsPlaybackAudio" style="display:none;"></audio>' +
      '<div id="lsScoreDisplay"></div>' +
      '<div class="ls-btn-row"><button class="ls-btn ls-btn-primary" id="lsSubmitBtn" disabled>Submit</button></div>';
  }

  var continueBtn = needsRecording ? "" :
    '<div class="ls-btn-row"><button class="ls-btn ls-btn-primary" onclick="window.lsGoNext()">Continue</button></div>';

  render(
    '<p class="ls-part-label">' + label + '</p>' +
    '<div class="ls-card">' + blocksHtml + recordSection + '</div>' +
    continueBtn
  );

  if(needsRecording){
    document.getElementById("lsRecordBtn").addEventListener("click", toggleRecording);
    document.getElementById("lsPlayBtn").addEventListener("click", playRecording);
    document.getElementById("lsRerecordBtn").addEventListener("click", reRecord);
    var expectedText = promptBlock ? promptBlock.expectedText : "";
    document.getElementById("lsSubmitBtn").addEventListener("click", function(){ submitRecording(expectedText, partNum); });
  }
}

function startWave(streamOrElement, isElement){
  var canvas = document.getElementById("lsWaveCanvas");
  var ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  if(!lsAudioCtx){
    lsAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var analyser = lsAudioCtx.createAnalyser();
  analyser.fftSize = 64;

  if(isElement){
    if(!streamOrElement._lsWaveSource){
      streamOrElement._lsWaveSource = lsAudioCtx.createMediaElementSource(streamOrElement);
      streamOrElement._lsWaveSource.connect(lsAudioCtx.destination);
    }
    streamOrElement._lsWaveSource.connect(analyser);
  } else {
    var source = lsAudioCtx.createMediaStreamSource(streamOrElement);
    source.connect(analyser);
  }

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  function draw(){
    lsWaveAnimId = requestAnimationFrame(draw);
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
  if(lsWaveAnimId){
    cancelAnimationFrame(lsWaveAnimId);
    lsWaveAnimId = null;
  }
  var canvas = document.getElementById("lsWaveCanvas");
  if(canvas){
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
}

function toggleRecording(){
  var btn = document.getElementById("lsRecordBtn");
  var status = document.getElementById("lsRecordStatus");

  if(!mediaRecorder || mediaRecorder.state === "inactive"){
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      currentStream = stream;
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function(e){ recordedChunks.push(e.data); };
      mediaRecorder.onstop = function(){ if(window.resumeAppBgMusicAfterRecording){ window.resumeAppBgMusicAfterRecording(); }
        recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });
        stopWave();
        document.getElementById("lsRecordBtn").style.display = "none";
        document.getElementById("lsPlaybackRow").style.display = "flex";
        document.getElementById("lsSubmitBtn").disabled = false;
        currentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      if(window.pauseAppBgMusicForRecording){ window.pauseAppBgMusicForRecording(); } mediaRecorder.start();
      startWave(stream, false);
      btn.textContent = "■ Stop";
      btn.classList.add("ls-recording");
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    mediaRecorder.stop();
  }
}

function playRecording(){
  var playBtn = document.getElementById("lsPlayBtn");
  var audioEl = document.getElementById("lsPlaybackAudio");
  var originalLabel = playBtn.innerHTML;
  playBtn.innerHTML = '<span class="ls-loading-pulse"></span>Loading...';
  playBtn.disabled = true;

  audioEl.src = URL.createObjectURL(recordedBlob);

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

function reRecord(){
  recordedBlob = null;
  document.getElementById("lsPlaybackRow").style.display = "none";
  var btn = document.getElementById("lsRecordBtn");
  btn.style.display = "inline-block";
  btn.textContent = "● Record";
  btn.classList.remove("ls-recording");
  document.getElementById("lsRecordStatus").textContent = "Not recorded yet";
  document.getElementById("lsSubmitBtn").disabled = true;
  document.getElementById("lsScoreDisplay").innerHTML = "";
}

function submitRecording(expectedText, partNum){
  var scoreDisplay = document.getElementById("lsScoreDisplay");
  scoreDisplay.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.7);">Scoring...</p>';

  fetch(API_BASE + "/api/assessPronunciation?referenceText=" + encodeURIComponent(expectedText || ""), {
    method: "POST",
    body: recordedBlob
  }).then(function(res){ return res.json(); }).then(function(data){
    var score = data.finalScore ?? data.score ?? data.AccuracyScore ?? data.accuracyScore ?? 0;
    score = Math.round(score);
    scoreDisplay.innerHTML =
      '<div class="ls-score">' + score + '%</div>' +
      '<div class="ls-btn-row">' +
      '<button class="ls-btn ls-btn-secondary" onclick="window.lsRetryRecording()">Try Again</button>' +
      '<button class="ls-btn ls-btn-primary" onclick="window.lsGoNext()">Continue</button>' +
      '</div>';
  }).catch(function(err){
    console.error(err);
    scoreDisplay.innerHTML = '<p style="text-align:center;color:#ff8a8a;">Could not score - please try again.</p>' +
      '<div class="ls-btn-row"><button class="ls-btn ls-btn-secondary" onclick="window.lsRetryRecording()">Try Again</button></div>';
  });
}

window.lsRetryRecording = function(){
  recordedBlob = null;
  renderPart(currentPart, currentPart === 2 ? "Part 2 - Activity" : "Part 3 - Scenario Practice");
};

window.lsGoNext = function(){
  recordedBlob = null;
  if(currentPart === 1){ currentPart = 2; renderPart(2, "Part 2 - Activity"); }
  else if(currentPart === 2){ currentPart = 3; renderPart(3, "Part 3 - Scenario Practice"); }
  else {
    markLessonComplete();
    render(
      '<div class="ls-card" style="text-align:center;">' +
      '<p class="ls-part-label">Lesson Complete</p>' +
      '<p style="color:#fff;font-size:1.1rem;margin-bottom:20px;">Well done.</p>' +
      '<button class="ls-btn ls-btn-primary" onclick="window.location.href=\'./\'">Back to Lessons</button>' +
      '</div>'
    );
  }
};

function markLessonComplete(){
  var uid = window.lsCurrentUid;
  if(!uid) return;
  fetch(API_BASE + "/api/levelProgressComplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: uid, level: LEVEL, lesson: LESSON })
  }).catch(function(err){ console.error("Could not save progress:", err); });
}

fetch(API_BASE + "/api/levelAssets?level=" + LEVEL + "&lesson=" + LESSON)
  .then(function(res){ return res.json(); })
  .then(function(assets){
    allAssets = assets || [];
    if(allAssets.length === 0){
      render('<div class="ls-card" style="text-align:center;"><p style="color:#fff;">This lesson\'s content hasn\'t been added yet.</p></div>');
      return;
    }
    renderPart(1, "Part 1 - Teaching");
  })
  .catch(function(err){
    console.error(err);
    render('<div class="ls-card" style="text-align:center;"><p style="color:#ff8a8a;">Could not load this lesson.</p></div>');
  });



