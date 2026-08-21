const API_BASE = "https://saybonapp-server.onrender.com";
const LEVEL = "a0-les-petits";
const LESSON = 1;

var root = document.getElementById("lsRoot");
var allAssets = [];
var currentPart = 1;
var recordedBlob = null;
var mediaRecorder = null;
var recordedChunks = [];
var currentStream = null;

function render(html){ root.innerHTML = html; }

function renderBlock(block){
  if(block.type === "text") return '<div class="ls-block ls-block-text">' + block.content + '</div>';
  if(block.type === "image") return '<div class="ls-block"><img src="' + block.url + '"></div>';
  if(block.type === "audio") return '<div class="ls-block"><audio controls src="' + block.url + '"></audio></div>';
  if(block.type === "video") return '<div class="ls-block"><video controls src="' + block.url + '"></video></div>';
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
      '<div class="ls-record-row">' +
      '<button class="ls-record-btn" id="lsRecordBtn">● Record</button>' +
      '<span class="ls-record-status" id="lsRecordStatus">' + (recordedBlob ? "Recorded" : "Not recorded yet") + '</span>' +
      '</div>' +
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
    var expectedText = promptBlock ? promptBlock.expectedText : "";
    document.getElementById("lsSubmitBtn").addEventListener("click", function(){ submitRecording(expectedText, partNum); });
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
      mediaRecorder.onstop = function(){
        recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });
        status.textContent = "Recorded";
        document.getElementById("lsSubmitBtn").disabled = false;
        currentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      mediaRecorder.start();
      btn.textContent = "■ Stop";
      btn.classList.add("ls-recording");
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    mediaRecorder.stop();
    btn.textContent = "● Record Again";
    btn.classList.remove("ls-recording");
  }
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
  renderPart(currentPart, currentPart === 2 ? "Part 2 — Activity" : "Part 3 — Scenario Practice");
};

window.lsGoNext = function(){
  recordedBlob = null;
  if(currentPart === 1){ currentPart = 2; renderPart(2, "Part 2 — Activity"); }
  else if(currentPart === 2){ currentPart = 3; renderPart(3, "Part 3 — Scenario Practice"); }
  else {
    render(
      '<div class="ls-card" style="text-align:center;">' +
      '<p class="ls-part-label">Lesson Complete!</p>' +
      '<p style="color:#fff;font-size:1.1rem;margin-bottom:20px;">You did it! 🎉</p>' +
      '<button class="ls-btn ls-btn-primary" onclick="window.location.href=\'./\'">Back to Lessons</button>' +
      '</div>'
    );
  }
};

fetch(API_BASE + "/api/levelAssets?level=" + LEVEL + "&lesson=" + LESSON)
  .then(function(res){ return res.json(); })
  .then(function(assets){
    allAssets = assets || [];
    if(allAssets.length === 0){
      render('<div class="ls-card" style="text-align:center;"><p style="color:#fff;">This lesson\'s content hasn\'t been added yet.</p></div>');
      return;
    }
    renderPart(1, "Part 1 — Teaching");
  })
  .catch(function(err){
    console.error(err);
    render('<div class="ls-card" style="text-align:center;"><p style="color:#ff8a8a;">Could not load this lesson.</p></div>');
  });