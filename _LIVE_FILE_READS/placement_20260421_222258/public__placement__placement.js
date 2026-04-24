console.log("🔥 DELF-style General Placement loaded");

const questions = [
  {
    id: 1,
    type: "mcq",
    category: "Understanding",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q1_bonjour.mp3",
    options: ["Merci", "Bonjour", "Pardon", "Bonsoir"],
    correct: 1,
    level: "A0"
  },
  {
    id: 2,
    type: "mcq",
    category: "Understanding",
    prompt: "Someone says « Merci ». Choose the best response.",
    options: ["Bonsoir", "Salut", "De rien", "Bonjour"],
    correct: 2,
    level: "A0"
  },
  {
    id: 3,
    type: "mcq",
    category: "Understanding",
    prompt: "What do you say to greet someone in the morning?",
    options: ["Bonsoir", "Bonjour", "Pardon", "Merci"],
    correct: 1,
    level: "A0"
  },
  {
    id: 4,
    type: "mcq",
    category: "Listening",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Au revoir", "Merci", "Bonjour", "Salut"],
    correct: 0,
    level: "A1"
  },
  {
    id: 5,
    type: "mcq",
    category: "Reading",
    prompt: "Read and answer the question.",
    text: "Je m’appelle Paul. J’habite à Accra.",
    readingQuestion: "Where does Paul live?",
    options: [
      "He lives in Kumasi.",
      "He lives in Accra.",
      "He is 10 years old.",
      "He is a teacher."
    ],
    correct: 1,
    level: "A1"
  },
  {
    id: 6,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Comment tu t’appelles ?",
    level: "A1"
  },
  {
    id: 7,
    type: "mcq",
    category: "Understanding",
    prompt: "Choose the best response to this question: « Qu’est-ce que tu fais le samedi ? »",
    options: [
      "Je joue au football le samedi.",
      "J’ai deux frères.",
      "Il fait beau.",
      "Merci beaucoup."
    ],
    correct: 0,
    level: "A2"
  },
  {
    id: 8,
    type: "mcq",
    category: "Reading",
    prompt: "Read and answer the question.",
    text: "Le dimanche, je me repose et je regarde la télévision.",
    readingQuestion: "What does this person usually do on Sunday?",
    options: [
      "They work on Sunday.",
      "They play football on Sunday.",
      "They rest and watch television.",
      "They go to the market on Sunday."
    ],
    correct: 2,
    level: "A2"
  },
  {
    id: 9,
    type: "writing",
    category: "Writing",
    prompt: "Write 1 or 2 simple sentences in French.",
    writingPrompt: "Describe your usual Sunday in French.",
    level: "A2"
  },
  {
    id: 10,
    type: "mcq",
    category: "Reading",
    prompt: "Read and answer the question.",
    text: "Je suis arrivé en retard parce que le bus est parti avant mon arrivée.",
    readingQuestion: "Why was the person late?",
    options: [
      "Because they woke up late.",
      "Because the bus left before they arrived.",
      "Because they missed school.",
      "Because they forgot their bag."
    ],
    correct: 1,
    level: "B1"
  },
  {
    id: 11,
    type: "mcq",
    category: "Understanding",
    prompt: "Choose the best response: « Pourquoi apprends-tu le français ? »",
    options: [
      "Parce que j’aime voyager et communiquer avec plus de personnes.",
      "Je suis dans la cuisine.",
      "Il est trois heures.",
      "Merci beaucoup."
    ],
    correct: 0,
    level: "B1"
  },
  {
    id: 12,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Pourquoi est-ce important d’apprendre une langue ?",
    level: "B1"
  },
  {
    id: 13,
    type: "mcq",
    category: "Reading",
    prompt: "Read and answer the question.",
    text: "De plus en plus de jeunes préfèrent apprendre en ligne, car cela leur permet d’étudier à leur rythme et d’avoir accès à davantage de ressources.",
    readingQuestion: "Why do many young people prefer learning online?",
    options: [
      "Because school is closed.",
      "Because it lets them study at their own pace and access more resources.",
      "Because teachers are not useful.",
      "Because books are too expensive."
    ],
    correct: 1,
    level: "B2"
  },
  {
    id: 14,
    type: "writing",
    category: "Writing",
    prompt: "Write a short response in French.",
    writingPrompt: "Do you think online learning is better than classroom learning?",
    level: "B2"
  },
  {
    id: 15,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Selon toi, quels sont les avantages et les inconvénients des réseaux sociaux ?",
    level: "B2"
  }
];

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;
let spokenAnswers = [];
let writtenAnswers = [];
let mediaRecorder = null;
let recordedChunks = [];
let currentAudioBlob = null;
let pausedQuestionIndex = null;

const app = document.getElementById("app");
const questionText = document.getElementById("questionText");
const mediaArea = document.getElementById("mediaArea");
const answers = document.getElementById("answers");
const progressBar = document.getElementById("progressBar");
const questionCategory = document.getElementById("questionCategory");
const questionCounter = document.getElementById("questionCounter");

const intervention = document.getElementById("intervention");
const interventionAudio = document.getElementById("interventionAudio");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");

function resetInterventionState() {
  if (intervention) {
    intervention.classList.add("hidden");
    intervention.setAttribute("aria-hidden", "true");
    intervention.style.display = "none";
    intervention.style.opacity = "0";
    intervention.style.pointerEvents = "none";
  }

  if (app) {
    app.classList.remove("hidden");
    app.style.display = "";
    app.style.opacity = "1";
    app.style.pointerEvents = "auto";
  }

  if (continueBtn) {
    continueBtn.style.opacity = "0";
    continueBtn.classList.remove("slide-in-left");
  }

  if (revealBtn) {
    revealBtn.style.opacity = "0";
    revealBtn.classList.remove("slide-in-right");
  }

  if (interventionAudio) {
    interventionAudio.pause();
    interventionAudio.currentTime = 0;
    interventionAudio.onended = null;
  }
}

function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function clearUI() {
  mediaArea.innerHTML = "";
  answers.innerHTML = "";
  currentAudioBlob = null;
}

function makePillButton(text, onClick, extraClass = "") {
  const btn = document.createElement("button");
  btn.className = `answer-pill ${extraClass}`.trim();
  btn.textContent = text;
  btn.type = "button";
  btn.onclick = onClick;
  return btn;
}

function getEstimatedLevelByProgress() {
  if (score <= 1) return "A0";
  if (score <= 3) return "A1";
  if (score <= 5) return "A2";
  if (score <= 7) return "B1";
  return "B2";
}

function renderQuestion() {
  const q = questions[currentQuestion];

  if (!q) {
    finishPlacement();
    return;
  }

  resetInterventionState();
  updateProgress();
  clearUI();

  questionText.textContent = q.prompt;
  questionCategory.textContent = q.category || "Placement";
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;

  if (q.audio) {
    const audioWrap = document.createElement("div");
    audioWrap.className = "audio-wrap";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = q.audio;
    audio.preload = "auto";

    audioWrap.appendChild(audio);
    mediaArea.appendChild(audioWrap);
  }

  if (q.text) {
    const readingBlock = document.createElement("div");
    readingBlock.className = "reading-block";
    readingBlock.innerHTML = `
      <p class="reading-label">TEXT</p>
      <div class="reading-text">${q.text}</div>
    `;
    mediaArea.appendChild(readingBlock);
  }

  if (q.readingQuestion) {
    const rq = document.createElement("div");
    rq.className = "reading-question";
    rq.textContent = q.readingQuestion;
    mediaArea.appendChild(rq);
  }

  if (q.type === "mcq") {
    q.options.forEach((option, index) => {
      const btn = makePillButton(option, () => handleAnswer(index));
      answers.appendChild(btn);
    });
  }

  if (q.type === "speaking") {
    const card = document.createElement("div");
    card.className = "response-card speaking-card";
    card.innerHTML = `
      <p class="response-prompt speaking-prompt">${q.speakingPrompt}</p>

      <div class="speaking-recorder-shell">
        <div class="speaking-control-row">
          <button class="record-icon-btn record-icon-start" id="startRecordingBtn" type="button" aria-label="Start recording">
            <span class="record-icon-disc"></span>
          </button>

          <button class="record-icon-btn record-icon-stop" id="stopRecordingBtn" type="button" aria-label="Stop recording" disabled>
            <span class="record-icon-square"></span>
          </button>
        </div>

        <div class="speaking-status" id="recStatus">Tap record and answer in French.</div>

        <div class="wave-shell" id="waveShell">
          <canvas id="waveCanvas" width="760" height="90"></canvas>
        </div>

        <div class="audio-preview-wrap" id="audioPreviewWrap"></div>

        <div class="speaking-secondary-row" id="speakingSecondaryRow">
          <button class="secondary-rec-btn" id="reRecordBtn" type="button" disabled>Re-record</button>
        </div>

        <button class="answer-pill submit-pill speaking-submit-btn" id="submitSpeaking" type="button" disabled>
          Submit Answer
        </button>
      </div>
    `;
    answers.appendChild(card);

    const startBtn = document.getElementById("startRecordingBtn");
    const stopBtn = document.getElementById("stopRecordingBtn");
    const submitBtn = document.getElementById("submitSpeaking");
    const rerecordBtn = document.getElementById("reRecordBtn");

    startBtn.onclick = () => startRecording(q.id);
    stopBtn.onclick = stopRecording;
    rerecordBtn.onclick = () => reRecordSpeaking();

    submitBtn.onclick = () => {
      spokenAnswers.push({
        id: q.id,
        level: q.level,
        prompt: q.speakingPrompt,
        audioRecorded: !!currentAudioBlob
      });
      currentQuestion++;
      renderQuestion();
    };
  }

  if (q.type === "writing") { {
    const card = document.createElement("div");
    card.className = "response-card";
    card.innerHTML = `
      <p class="response-prompt">${q.writingPrompt}</p>
      <textarea id="writtenResponse" class="response-box" placeholder=""></textarea>
      <button class="answer-pill submit-pill" id="submitWriting" type="button">Submit Answer</button>
    `;
    answers.appendChild(card);

    document.getElementById("submitWriting").onclick = () => {
      const val = document.getElementById("writtenResponse").value.trim();
      writtenAnswers.push({
        id: q.id,
        level: q.level,
        prompt: q.writingPrompt,
        answer: val
      });
      currentQuestion++;
      renderQuestion();
    };
  }
}

async function startRecording(questionId) {
  try {
    if (mediaRecorder && mediaRecorder.state !== "inactive") return;

    const startBtn = document.getElementById("startRecordingBtn");
    const stopBtn = document.getElementById("stopRecordingBtn");
    const submitBtn = document.getElementById("submitSpeaking");
    const status = document.getElementById("recStatus");
    const previewWrap = document.getElementById("audioPreviewWrap");
    const reRecordBtn = document.getElementById("reRecordBtn");
    const waveCanvas = document.getElementById("waveCanvas");

    currentAudioBlob = null;
    recordedChunks = [];

    if (previewWrap) previewWrap.innerHTML = "";
    if (submitBtn) submitBtn.disabled = true;
    if (reRecordBtn) reRecordBtn.disabled = true;

    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(recordingStream);

    waveAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    waveSource = waveAudioContext.createMediaStreamSource(recordingStream);
    waveAnalyser = waveAudioContext.createAnalyser();
    waveAnalyser.fftSize = 2048;
    waveSource.connect(waveAnalyser);

    if (waveCanvas) {
      startWaveDraw(waveCanvas, waveAnalyser);
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        currentAudioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        renderSavedAudioPreview(currentAudioBlob);

        if (status) status.textContent = "Recording saved. You can replay, re-record, or submit.";
        if (submitBtn) submitBtn.disabled = false;
        if (reRecordBtn) reRecordBtn.disabled = false;
      } catch (err) {
        console.error(err);
        if (status) status.textContent = "Recording failed. Please try again.";
      } finally {
        stopWaveDraw();
        cleanupWaveRecorder();
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
      }
    };

    mediaRecorder.start();

    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (status) status.textContent = "Recording… speak now.";
  } catch (error) {
    console.error(error);
    const status = document.getElementById("recStatus");
    if (status) status.textContent = "Microphone access is required to record your answer.";
    cleanupWaveRecorder();
  }
}

function stopRecording() {
  const status = document.getElementById("recStatus");

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    if (status) status.textContent = "Finishing recording…";
  }
}

function handleAnswer(selectedIndex) {
  const q = questions[currentQuestion];

  if (selectedIndex === q.correct) {
    score++;
  } else {
    wrongAnswers++;
  }

  currentQuestion++;

  if (!interventionShown && wrongAnswers >= 3 && currentQuestion < questions.length) {
    pausedQuestionIndex = currentQuestion;
    showIntervention();
    return;
  }

  renderQuestion();
}

function showIntervention() {
  if (wrongAnswers < 3 || interventionShown === true) return;

  interventionShown = true;

  if (app) {
    app.classList.add("hidden");
    app.style.display = "none";
    app.style.pointerEvents = "none";
  }

  if (intervention) {
    intervention.classList.remove("hidden");
    intervention.setAttribute("aria-hidden", "false");
    intervention.style.display = "flex";
    intervention.style.opacity = "1";
    intervention.style.pointerEvents = "all";
  }

  continueBtn.style.opacity = "0";
  revealBtn.style.opacity = "0";
  continueBtn.classList.remove("slide-in-left");
  revealBtn.classList.remove("slide-in-right");

  if (interventionAudio) {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(() => {});
    interventionAudio.onended = () => {
      continueBtn.style.opacity = "1";
      revealBtn.style.opacity = "1";
      continueBtn.classList.add("slide-in-left");
      revealBtn.classList.add("slide-in-right");
    };
  }
}

continueBtn.onclick = () => {
  if (intervention) {
    intervention.classList.add("hidden");
    intervention.setAttribute("aria-hidden", "true");
    intervention.style.display = "none";
    intervention.style.opacity = "0";
    intervention.style.pointerEvents = "none";
  }

  if (app) {
    app.classList.remove("hidden");
    app.style.display = "";
    app.style.pointerEvents = "auto";
  }

  if (pausedQuestionIndex !== null) {
    currentQuestion = pausedQuestionIndex;
  }

  renderQuestion();
};

revealBtn.onclick = () => {
  finishPlacement(true);
};

function calculateLevel() {
  const percent = Math.round((score / 12) * 100);

  if (percent < 25) return "A0";
  if (percent < 45) return "A1";
  if (percent < 65) return "A2";
  if (percent < 80) return "B1";
  return "B2";
}

function finishPlacement(fromIntervention = false) {
  const level = fromIntervention ? getEstimatedLevelByProgress() : calculateLevel();

  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", "15");
  sessionStorage.setItem("placement_level", level);
  sessionStorage.setItem("placement_spoken_answers", JSON.stringify(spokenAnswers));
  sessionStorage.setItem("placement_written_answers", JSON.stringify(writtenAnswers));
  sessionStorage.setItem("placement_intervention_used", fromIntervention ? "yes" : "no");

  window.location.href = "/placement/result.html";
}

resetInterventionState();
renderQuestion();

/* ==========================================
   SPEAKING RECORDER UPGRADE HELPERS
========================================== */

let waveAnimation = null;
let recordingStream = null;
let waveAudioContext = null;
let waveAnalyser = null;
let waveSource = null;

function startWaveDraw(canvas, analyserNode) {
  if (!canvas || !analyserNode) return;

  const ctx = canvas.getContext("2d");
  const bufferLength = analyserNode.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    waveAnimation = requestAnimationFrame(draw);

    analyserNode.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "rgba(110,224,255,0.85)");
    grad.addColorStop(1, "rgba(67,154,255,0.95)");

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = grad;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  draw();
}

function stopWaveDraw() {
  if (waveAnimation) {
    cancelAnimationFrame(waveAnimation);
    waveAnimation = null;
  }

  const canvas = document.getElementById("waveCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function cleanupWaveRecorder() {
  try {
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop());
    }
  } catch (e) {}

  try {
    if (waveAudioContext && waveAudioContext.state !== "closed") {
      waveAudioContext.close();
    }
  } catch (e) {}

  recordingStream = null;
  waveAudioContext = null;
  waveAnalyser = null;
  waveSource = null;
  mediaRecorder = null;
}

function renderSavedAudioPreview(blob) {
  const previewWrap = document.getElementById("audioPreviewWrap");
  if (!previewWrap || !blob) return;

  const url = URL.createObjectURL(blob);

  previewWrap.innerHTML = `
    <div class="saved-audio-box">
      <audio id="savedAudioPlayer" controls src="${url}"></audio>
    </div>
  `;
}

function reRecordSpeaking() {
  currentAudioBlob = null;
  recordedChunks = [];

  const previewWrap = document.getElementById("audioPreviewWrap");
  const submitBtn = document.getElementById("submitSpeaking");
  const reRecordBtn = document.getElementById("reRecordBtn");
  const status = document.getElementById("recStatus");
  const startBtn = document.getElementById("startRecordingBtn");
  const stopBtn = document.getElementById("stopRecordingBtn");

  if (previewWrap) previewWrap.innerHTML = "";
  if (submitBtn) submitBtn.disabled = true;
  if (reRecordBtn) reRecordBtn.disabled = true;
  if (startBtn) startBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
  if (status) status.textContent = "Tap record and answer in French.";

  stopWaveDraw();
  cleanupWaveRecorder();
}

