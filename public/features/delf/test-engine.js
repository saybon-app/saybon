const firebaseConfig = {
  apiKey:"AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
  authDomain:"saybon-3e3c2.firebaseapp.com",
  projectId:"saybon-3e3c2",
  storageBucket:"saybon-3e3c2.firebasestorage.app",
  messagingSenderId:"75085012344",
  appId:"1:75085012344:web:0b18581cb0a30c3df47c8d"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const test = params.get("test") || "prim";

let testData = null;
let current = 0;
let answers = {};
let submitting = false;

let recorder = null;
let recorderStream = null;
let recorderChunks = [];

function createCandidateId(){
  return "C-" + Math.floor(100000 + Math.random() * 900000);
}

function getCandidateId(){
  let stored = sessionStorage.getItem("saybon_candidate_id_v2");
  if(!stored){
    stored = createCandidateId();
    sessionStorage.setItem("saybon_candidate_id_v2", stored);
  }
  return stored;
}

const candidateId = getCandidateId();

function esc(v){
  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function saveCurrentAnswer(){
  if(!testData) return;
  const q = testData.questions[current];
  if(!q) return;

  if(q.type === "reading" || q.type === "listening"){
    const selected = document.querySelector('input[name="answer"]:checked');
    if(selected) answers[current] = selected.value;
  }

  if(q.type === "writing"){
    const textarea = $("writingAnswer");
    if(textarea) answers[current] = textarea.value.trim();
  }
}

function updateProgress(){
  if(!testData) return;
  $("progressLabel").innerText = `${current + 1} / ${testData.questions.length}`;
  $("progressFill").style.width = `${((current + 1) / testData.questions.length) * 100}%`;
  $("backBtn").style.visibility = current === 0 ? "hidden" : "visible";
}

function updateCenterNote(){
  if(!testData) return;
  const q = testData.questions[current];
  if(!q) return;

  if(q.type === "speaking"){
    $("centerNote").innerText = answers[current] ? "Recording saved. Continue when ready." : "Record your answer, then continue.";
    return;
  }

  $("centerNote").innerText = "Choose or complete your answer, then continue.";
}

function renderReadingOrListening(q){
  const options = (q.options || []).map((opt, i)=>{
    const letter = String.fromCharCode(65 + i);
    const checked = answers[current] === opt ? "checked" : "";
    return `
      <label class="option">
        <input type="radio" name="answer" value="${esc(opt)}" ${checked}>
        <div class="optionCard">
          <div class="badge">${letter}</div>
          <div>${esc(opt)}</div>
        </div>
      </label>
    `;
  }).join("");

  return `
    <div class="pill">${esc(q.skill || q.type)}</div>
    <h2 class="questionText">${esc(q.question)}</h2>
    ${q.audio ? `<div class="box"><audio controls src="${esc(q.audio)}"></audio></div>` : ""}
    <div class="answerGrid">${options}</div>
  `;
}

function renderWriting(q){
  return `
    <div class="pill">${esc(q.skill || q.type)}</div>
    <h2 class="questionText">${esc(q.question)}</h2>
    <div class="box">
      <textarea id="writingAnswer" placeholder="${esc(q.placeholder || "Type your answer here...")}">${esc(answers[current] || "")}</textarea>
    </div>
  `;
}

function renderSpeaking(q){
  return `
    <div class="pill">${esc(q.skill || q.type)}</div>
    <h2 class="questionText">${esc(q.question)}</h2>

    <div class="box">
      <div class="recordRow">
        <button class="btn btnPrimary" id="startRecBtn" type="button">Start Recording</button>
        <button class="btn btnDanger" id="stopRecBtn" type="button" disabled>Stop Recording</button>
      </div>

      <div id="recStatus" class="helper">Tap Start Recording and speak clearly.</div>

      <div id="recordingPreview" style="margin-top:16px;">
        ${
          answers[current]
            ? `
              <div class="helper" style="margin-bottom:10px;">Saved recording preview:</div>
              <audio controls src="data:audio/webm;base64,${answers[current]}"></audio>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function renderCurrentSlide(){
  if(!testData) return;
  const q = testData.questions[current];
  if(!q) return;

  let html = "";

  if(q.type === "reading" || q.type === "listening") html = renderReadingOrListening(q);
  if(q.type === "writing") html = renderWriting(q);
  if(q.type === "speaking") html = renderSpeaking(q);

  $("stage").innerHTML = html;
  updateProgress();
  updateCenterNote();

  if(q.type === "speaking"){
    $("startRecBtn")?.addEventListener("click", startRecording);
    $("stopRecBtn")?.addEventListener("click", stopRecording);
  }
}

function nextSlide(){
  saveCurrentAnswer();

  if(current >= testData.questions.length - 1){
    submitTest();
    return;
  }

  current++;
  renderCurrentSlide();
}

function prevSlide(){
  saveCurrentAnswer();
  if(current === 0) return;
  current--;
  renderCurrentSlide();
}

function blobToBase64(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onloadend = ()=>{
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function startRecording(){
  try{
    if(recorder) return;

    recorderChunks = [];
    $("startRecBtn").disabled = true;
    $("stopRecBtn").disabled = false;
    $("recStatus").innerText = "Recording... Speak now.";

    recorderStream = await navigator.mediaDevices.getUserMedia({ audio:true });
    recorder = new MediaRecorder(recorderStream);

    recorder.ondataavailable = (e)=>{
      if(e.data && e.data.size > 0) recorderChunks.push(e.data);
    };

    recorder.onstop = async ()=>{
      const blob = new Blob(recorderChunks, { type:"audio/webm" });
      const base64 = await blobToBase64(blob);
      answers[current] = base64;

      $("recordingPreview").innerHTML = `
        <div class="helper" style="margin-bottom:10px;">Saved recording preview:</div>
        <audio controls src="${URL.createObjectURL(blob)}"></audio>
      `;

      $("recStatus").innerText = "Recording saved.";
      $("startRecBtn").disabled = false;
      $("stopRecBtn").disabled = true;
      updateCenterNote();

      recorderStream.getTracks().forEach(track => track.stop());
      recorder = null;
      recorderStream = null;
      recorderChunks = [];
    };

    recorder.start();
  }catch(err){
    console.error(err);
    $("recStatus").innerText = "Microphone access failed.";
    $("startRecBtn").disabled = false;
    $("stopRecBtn").disabled = true;
  }
}

function stopRecording(){
  if(!recorder) return;
  $("recStatus").innerText = "Saving recording...";
  recorder.stop();
}

function scoreObjectiveAnswers(){
  let score = 0;
  let total = 0;

  testData.questions.forEach((q, i)=>{
    if((q.type === "reading" || q.type === "listening") && q.answer){
      total++;
      if(String(answers[i] || "") === String(q.answer)) score++;
    }
  });

  return { score, total };
}

function estimateLevel(percent){
  if(percent >= 85) return "A2";
  if(percent >= 60) return "A1";
  return "Pre-A1";
}

async function submitTest(){
  if(submitting) return;
  submitting = true;
  saveCurrentAnswer();

  $("nextBtn").disabled = true;
  $("backBtn").disabled = true;
  $("centerNote").innerText = "Saving placement result...";

  try{
    const objective = scoreObjectiveAnswers();
    const objectivePercent = objective.total ? Math.round((objective.score / objective.total) * 100) : 0;
    const estimatedLevel = estimateLevel(objectivePercent);

    const payload = {
      candidateId,
      testType: test,
      testTitle: testData.title,
      answers,
      objectiveScore: objective.score,
      objectiveTotal: objective.total,
      objectivePercent,
      estimatedLevel,
      createdAt: new Date().toISOString()
    };

    await db.collection("delfPlacements").doc(candidateId).set(payload, { merge:true });

    $("stage").innerHTML = `
      <div class="box">
        <div class="pill">Completed</div>
        <h2 class="questionText">Placement complete</h2>
        <div class="box">
          <div><strong>Candidate ID:</strong> ${esc(candidateId)}</div>
          <div><strong>Estimated Level:</strong> ${esc(estimatedLevel)}</div>
          <div><strong>Objective Score:</strong> ${esc(objective.score)} / ${esc(objective.total)}</div>
          <div><strong>Objective Percent:</strong> ${esc(objectivePercent)}%</div>
        </div>
        <div class="helper">Your result has been saved.</div>
      </div>
    `;

    $("nav").classList.add("hidden");
    $("progressFill").style.width = "100%";
    $("progressLabel").innerText = `${testData.questions.length} / ${testData.questions.length}`;
  }catch(err){
    console.error(err);
    $("centerNote").innerText = "Save failed. Please try again.";
    $("nextBtn").disabled = false;
    $("backBtn").disabled = false;
    submitting = false;
    alert("Failed to save placement result.");
  }
}

async function loadTest(){
  try{
    $("candidateCodeLine").innerText = "Candidate ID: " + candidateId;

    const res = await fetch(`/features/delf/tests/${test}.json?v=recording-upgrade-1`);
    if(!res.ok) throw new Error("Test file not found");

    testData = await res.json();
    $("title").innerText = testData.title || "Placement Test";

    $("nextBtn").addEventListener("click", nextSlide);
    $("backBtn").addEventListener("click", prevSlide);

    renderCurrentSlide();
  }catch(err){
    console.error(err);
    $("title").innerText = "Test unavailable";
    $("stage").innerHTML = `
      <div class="box">
        <div class="pill" style="background:#ffe7e7;color:#b24a4a;">Error</div>
        <h2 class="questionText">We couldn't load this test.</h2>
        <div class="helper">REAL ERROR: ${esc(err.message)}</div>
      </div>
    `;
    $("nav").classList.add("hidden");
  }
}

loadTest();
