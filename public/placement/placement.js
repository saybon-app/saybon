console.log("🔥 placement.js loaded");

/* ==================================================
   SAYBON — REAL DELF-STYLE PLACEMENT ENGINE
   BUILT FOR CURRENT HTML DOM
================================================== */

const questions = [
  {
    id: 1,
    type: "mcq",
    level: "A0",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q1_bonjour.mp3",
    options: ["Merci", "Bonjour", "Pardon", "Bonsoir"],
    correct: 1
  },
  {
    id: 2,
    type: "mcq",
    level: "A0",
    prompt: "Someone says « Merci ». Choose the best response.",
    options: ["Bonsoir", "Salut", "De rien", "Bonjour"],
    correct: 2
  },
  {
    id: 3,
    type: "mcq",
    level: "A0",
    prompt: "What do you say to greet someone in the morning?",
    options: ["Bonsoir", "Merci", "Bonjour", "Pardon"],
    correct: 2
  },
  {
    id: 4,
    type: "mcq",
    level: "A1",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Salut", "Bonjour", "Au revoir", "Merci"],
    correct: 2
  },
  {
    id: 5,
    type: "reading",
    level: "A1",
    prompt: "Read and answer the question.",
    text: "Je m’appelle Paul. J’habite à Accra.",
    question: "Which statement is true?",
    options: [
      "Paul lives in Ghana.",
      "Paul is introducing his brother.",
      "Paul is saying goodbye.",
      "Paul lives in Paris."
    ],
    correct: 0
  },
  {
    id: 6,
    type: "speaking",
    level: "A1",
    prompt: "Réponds en français : Comment tu t’appelles ?",
    hint: "Exemple : Je m’appelle …"
  },
  {
    id: 7,
    type: "mcq",
    level: "A2",
    prompt: "Choose the best response to this question: « Tu fais quoi le week-end ? »",
    options: [
      "Il fait beau aujourd’hui.",
      "Je joue au football le samedi.",
      "Merci beaucoup.",
      "J’ai deux frères."
    ],
    correct: 1
  },
  {
    id: 8,
    type: "reading",
    level: "A2",
    prompt: "Read and answer the question.",
    text: "Le dimanche, je me repose et je regarde la télévision.",
    question: "Which statement is true?",
    options: [
      "This person usually has a very busy Sunday.",
      "This person goes shopping every Sunday.",
      "This person spends Sunday resting at home.",
      "This person usually plays sports on Sunday."
    ],
    correct: 2
  },
  {
    id: 9,
    type: "writing",
    level: "A2",
    prompt: "Écris 1 ou 2 phrases simples en français sur ta routine quotidienne.",
    hint: "Exemple : Je me réveille à 6 heures. Je vais à l’école."
  },
  {
    id: 10,
    type: "reading",
    level: "B1",
    prompt: "Read and answer the question.",
    text: "Je suis arrivé en retard parce que le bus est tombé en panne. Heureusement, le professeur a compris la situation.",
    question: "What can we understand from the text?",
    options: [
      "The teacher refused to listen.",
      "The student was late because of transport trouble.",
      "The student missed school on purpose.",
      "The bus arrived earlier than expected."
    ],
    correct: 1
  },
  {
    id: 11,
    type: "mcq",
    level: "B1",
    prompt: "Choose the most natural answer.",
    options: [
      "À mon avis, apprendre le français peut offrir plus d’opportunités.",
      "À mon avis, le français est apprend opportunités.",
      "Le français opinion plus opportunité est.",
      "Je opinion apprendre français très possibilité."
    ],
    correct: 0
  },
  {
    id: 12,
    type: "speaking",
    level: "B1",
    prompt: "Décris ta journée en français en 2 ou 3 phrases.",
    hint: "Exemple : Le matin, je travaille. L’après-midi, j’étudie. Le soir, je me repose."
  },
  {
    id: 13,
    type: "reading",
    level: "B2",
    prompt: "Read and answer the question.",
    text: "Je pense que voyager est essentiel, non seulement pour découvrir d’autres cultures, mais aussi pour remettre en question ses propres habitudes et élargir sa vision du monde.",
    question: "What is the writer mainly saying?",
    options: [
      "Travelling can broaden the way a person thinks.",
      "Travelling is mostly useful for entertainment.",
      "Travelling should only be done during holidays.",
      "Travelling has little effect on personal growth."
    ],
    correct: 0
  },
  {
    id: 14,
    type: "writing",
    level: "B2",
    prompt: "Écris 3 à 5 phrases en français pour donner ton opinion sur l’utilité d’apprendre le français.",
    hint: "Donne ton opinion et une ou deux raisons."
  },
  {
    id: 15,
    type: "speaking",
    level: "B2",
    prompt: "Réponds en français : Est-ce qu’apprendre le français est important ? Pourquoi ?",
    hint: "Donne ton avis et explique pourquoi."
  }
];

/* ==================================================
   STATE
================================================== */

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;
const responses = [];
const attemptId = "placement_" + Date.now();

/* ==================================================
   DOM
================================================== */

const questionText = document.getElementById("questionText");
const questionImage = document.getElementById("questionImage");
const audioBtn = document.getElementById("audioBtn");
const answers = document.getElementById("answers");
const progressBar = document.getElementById("progressBar");

/* ==================================================
   AUDIO PLAYBACK
================================================== */

let currentAudio = null;

/* ==================================================
   SPEAKING CAPTURE
================================================== */

let mediaRecorder = null;
let mediaStream = null;
let recordingChunks = [];
let currentRecordingBlob = null;
let currentRecordingUrl = null;
let recordingStartedAt = null;
let recordingSeconds = 0;
let recordingTimer = null;

/* ==================================================
   INDEXEDDB
================================================== */

function openPlacementDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SayBonPlacementDB", 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("spokenAnswers")) {
        const store = db.createObjectStore("spokenAnswers", { keyPath: "id" });
        store.createIndex("attemptId", "attemptId", { unique: false });
        store.createIndex("questionId", "questionId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSpokenAnswer({ questionId, blob, duration }) {
  const db = await openPlacementDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("spokenAnswers", "readwrite");
    const store = tx.objectStore("spokenAnswers");

    const record = {
      id: attemptId + "_q" + questionId,
      attemptId,
      questionId,
      createdAt: new Date().toISOString(),
      duration,
      mimeType: blob.type || "audio/webm",
      blob
    };

    const req = store.put(record);
    req.onsuccess = () => resolve(record.id);
    req.onerror = () => reject(req.error);
  });
}

/* ==================================================
   HELPERS
================================================== */

function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressBar.style.width = percent + "%";
}

function saveResponse(q, data) {
  const existingIndex = responses.findIndex(r => r.id === q.id);
  const payload = {
    id: q.id,
    level: q.level,
    type: q.type,
    ...data
  };

  if (existingIndex >= 0) {
    responses[existingIndex] = payload;
  } else {
    responses.push(payload);
  }
}

function getResponseById(id) {
  return responses.find(r => r.id === id) || null;
}

function clearUI() {
  questionText.innerHTML = "";
  answers.innerHTML = "";
  questionImage.classList.add("hidden");
  questionImage.removeAttribute("src");

  audioBtn.classList.add("hidden");
  audioBtn.onclick = null;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function makeButton(label, onClick, className = "answer-btn") {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function cleanupMediaStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

function resetRecordingState() {
  stopRecordingTimer();
  recordingChunks = [];
  currentRecordingBlob = null;
  if (currentRecordingUrl) {
    URL.revokeObjectURL(currentRecordingUrl);
  }
  currentRecordingUrl = null;
  recordingStartedAt = null;
  recordingSeconds = 0;
}

/* ==================================================
   RENDER
================================================== */

function renderQuestion() {
  updateProgress();
  clearUI();

  const q = questions[currentQuestion];
  if (!q) {
    finishPlacement();
    return;
  }

  questionText.textContent = q.prompt;

  if (q.audio) {
    currentAudio = new Audio(q.audio);
    audioBtn.classList.remove("hidden");
    audioBtn.textContent = "🔊 Play audio";
    audioBtn.onclick = () => {
      currentAudio.currentTime = 0;
      currentAudio.play().catch(() => {});
    };
  }

  if (q.image) {
    questionImage.src = q.image;
    questionImage.classList.remove("hidden");
  }

  if (q.type === "mcq") {
    q.options.forEach((option, index) => {
      answers.appendChild(
        makeButton(option, () => handleMCQ(index))
      );
    });
    return;
  }

  if (q.type === "reading") {
    const textBox = document.createElement("div");
    textBox.className = "reading-box";
    textBox.style.background = "rgba(255,255,255,0.10)";
    textBox.style.padding = "18px";
    textBox.style.borderRadius = "18px";
    textBox.style.marginBottom = "18px";
    textBox.style.lineHeight = "1.8";
    textBox.style.textAlign = "left";
    textBox.innerHTML = `<strong>Text:</strong><br><br>${q.text}<br><br><strong>Question:</strong><br>${q.question}`;
    answers.appendChild(textBox);

    q.options.forEach((option, index) => {
      answers.appendChild(
        makeButton(option, () => handleMCQ(index))
      );
    });
    return;
  }

  if (q.type === "writing") {
    const hint = document.createElement("div");
    hint.style.marginBottom = "14px";
    hint.style.opacity = "0.9";
    hint.style.lineHeight = "1.6";
    hint.textContent = q.hint || "";
    answers.appendChild(hint);

    const textarea = document.createElement("textarea");
    textarea.id = "writingResponse";
    textarea.placeholder = "Write your answer here in French...";
    textarea.style.width = "100%";
    textarea.style.minHeight = "170px";
    textarea.style.padding = "16px";
    textarea.style.borderRadius = "18px";
    textarea.style.border = "none";
    textarea.style.fontSize = "1rem";
    textarea.style.fontFamily = "inherit";
    textarea.style.marginBottom = "16px";
    answers.appendChild(textarea);

    answers.appendChild(
      makeButton("Continue", handleWriting)
    );
    return;
  }

  if (q.type === "speaking") {
    renderSpeakingQuestion(q);
    return;
  }
}

/* ==================================================
   SPEAKING UI
================================================== */

function renderSpeakingQuestion(q) {
  resetRecordingState();
  cleanupMediaStream();

  const hint = document.createElement("div");
  hint.style.marginBottom = "14px";
  hint.style.opacity = "0.9";
  hint.style.lineHeight = "1.6";
  hint.textContent = q.hint || "";
  answers.appendChild(hint);

  const recorderBox = document.createElement("div");
  recorderBox.style.background = "rgba(255,255,255,0.10)";
  recorderBox.style.padding = "18px";
  recorderBox.style.borderRadius = "18px";
  recorderBox.style.marginBottom = "18px";
  recorderBox.style.textAlign = "left";

  const status = document.createElement("div");
  status.textContent = "Recorder ready.";
  status.style.fontWeight = "600";
  status.style.marginBottom = "10px";

  const timer = document.createElement("div");
  timer.textContent = "00:00";
  timer.style.marginBottom = "14px";
  timer.style.opacity = "0.85";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "10px";
  controls.style.marginBottom = "14px";

  const startBtn = makeButton("Start Recording", () => startRecording(status, timer, playback));
  const stopBtn = makeButton("Stop Recording", () => stopRecording(status, timer));
  const rerecordBtn = makeButton("Re-record", () => rerecord(status, timer, playback, continueBtn));
  const continueBtn = makeButton("Continue", () => handleSpeaking(q, note, status));

  stopBtn.disabled = true;
  rerecordBtn.disabled = true;
  continueBtn.disabled = true;

  controls.appendChild(startBtn);
  controls.appendChild(stopBtn);
  controls.appendChild(rerecordBtn);
  controls.appendChild(continueBtn);

  const playback = document.createElement("audio");
  playback.controls = true;
  playback.style.display = "none";
  playback.style.width = "100%";
  playback.style.marginBottom = "14px";

  const note = document.createElement("textarea");
  note.placeholder = "Optional: type a short note about what you said...";
  note.style.width = "100%";
  note.style.minHeight = "110px";
  note.style.padding = "16px";
  note.style.borderRadius = "18px";
  note.style.border = "none";
  note.style.fontSize = "1rem";
  note.style.fontFamily = "inherit";

  recorderBox.appendChild(status);
  recorderBox.appendChild(timer);
  recorderBox.appendChild(controls);
  recorderBox.appendChild(playback);
  recorderBox.appendChild(note);
  answers.appendChild(recorderBox);

  async function startRecording(statusEl, timerEl, playbackEl) {
    try {
      resetRecordingState();
      cleanupMediaStream();

      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(mediaStream);
      recordingChunks = [];
      recordingStartedAt = Date.now();

      mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          recordingChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        currentRecordingBlob = new Blob(recordingChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        currentRecordingUrl = URL.createObjectURL(currentRecordingBlob);
        playbackEl.src = currentRecordingUrl;
        playbackEl.style.display = "block";

        recordingSeconds = Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000));
        statusEl.textContent = "Recording captured.";
        stopBtn.disabled = true;
        startBtn.disabled = true;
        rerecordBtn.disabled = false;
        continueBtn.disabled = false;

        cleanupMediaStream();
      };

      mediaRecorder.start();
      statusEl.textContent = "Recording...";
      startBtn.disabled = true;
      stopBtn.disabled = false;
      rerecordBtn.disabled = true;
      continueBtn.disabled = true;
      playbackEl.style.display = "none";

      recordingTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAt) / 1000);
        const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const ss = String(elapsed % 60).padStart(2, "0");
        timerEl.textContent = mm + ":" + ss;
      }, 250);

    } catch (err) {
      console.error(err);
      statusEl.textContent = "Microphone access failed. Please allow microphone access and try again.";
      cleanupMediaStream();
      stopRecordingTimer();
    }
  }

  function stopRecording(statusEl, timerEl) {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      stopRecordingTimer();
      statusEl.textContent = "Finalizing recording...";
      timerEl.textContent = "Saved";
    }
  }

  function rerecord(statusEl, timerEl, playbackEl, continueButton) {
    resetRecordingState();
    playbackEl.removeAttribute("src");
    playbackEl.style.display = "none";
    statusEl.textContent = "Recorder reset. Start again.";
    timerEl.textContent = "00:00";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    rerecordBtn.disabled = true;
    continueButton.disabled = true;
  }
}

/* ==================================================
   ANSWER HANDLERS
================================================== */

function handleMCQ(selectedIndex) {
  const q = questions[currentQuestion];
  const isCorrect = selectedIndex === q.correct;

  saveResponse(q, {
    selectedIndex,
    isCorrect
  });

  if (isCorrect) {
    score++;
  } else {
    wrongAnswers++;
  }

  currentQuestion++;

  if (!interventionShown && wrongAnswers >= 3 && currentQuestion < questions.length) {
    finishPlacement();
    return;
  }

  renderQuestion();
}

function handleWriting() {
  const q = questions[currentQuestion];
  const textarea = document.getElementById("writingResponse");
  const text = textarea ? textarea.value.trim() : "";

  saveResponse(q, {
    completed: text.length > 0,
    text,
    length: text.length
  });

  currentQuestion++;
  renderQuestion();
}

async function handleSpeaking(q, noteEl, statusEl) {
  try {
    const note = noteEl ? noteEl.value.trim() : "";

    if (!currentRecordingBlob || currentRecordingBlob.size === 0) {
      statusEl.textContent = "Please record your answer before continuing.";
      return;
    }

    const recordingId = await saveSpokenAnswer({
      questionId: q.id,
      blob: currentRecordingBlob,
      duration: recordingSeconds
    });

    saveResponse(q, {
      completed: true,
      note,
      length: note.length,
      hasRecording: true,
      recordingId,
      recordingDuration: recordingSeconds
    });

    currentQuestion++;
    renderQuestion();

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Could not save recording. Please try again.";
  }
}

/* ==================================================
   SCORING
================================================== */

function calculateBaseLevel() {
  const autoQuestionsByLevel = {
    A0: questions.filter(q => q.level === "A0" && (q.type === "mcq" || q.type === "reading")),
    A1: questions.filter(q => q.level === "A1" && (q.type === "mcq" || q.type === "reading")),
    A2: questions.filter(q => q.level === "A2" && (q.type === "mcq" || q.type === "reading")),
    B1: questions.filter(q => q.level === "B1" && (q.type === "mcq" || q.type === "reading")),
    B2: questions.filter(q => q.level === "B2" && (q.type === "mcq" || q.type === "reading"))
  };

  const correctByLevel = {
    A0: 0,
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0
  };

  responses.forEach(r => {
    if (r.isCorrect && correctByLevel.hasOwnProperty(r.level)) {
      correctByLevel[r.level]++;
    }
  });

  function passed(level) {
    const total = autoQuestionsByLevel[level].length;
    if (total === 0) return false;
    return correctByLevel[level] >= Math.ceil(total * 0.67);
  }

  if (passed("B2")) return "B2";
  if (passed("B1")) return "B1";
  if (passed("A2")) return "A2";
  if (passed("A1")) return "A1";
  return "A0";
}

function capLevel(level, maxLevel) {
  const rank = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4 };
  return rank[level] > rank[maxLevel] ? maxLevel : level;
}

function calculateLevel() {
  let level = calculateBaseLevel();

  const a2Writing = getResponseById(9);
  const b1Speaking = getResponseById(12);
  const b2Writing = getResponseById(14);
  const b2Speaking = getResponseById(15);

  if (["A2","B1","B2"].includes(level)) {
    const weak = !a2Writing || !a2Writing.completed || (a2Writing.length || 0) < 12;
    if (weak) level = capLevel(level, "A1");
  }

  if (["B1","B2"].includes(level)) {
    const weak = !b1Speaking || !b1Speaking.completed || !b1Speaking.hasRecording;
    if (weak) level = capLevel(level, "A2");
  }

  if (level === "B2") {
    const weakWriting = !b2Writing || !b2Writing.completed || (b2Writing.length || 0) < 35;
    if (weakWriting) level = capLevel(level, "B1");

    const weakSpeaking = !b2Speaking || !b2Speaking.completed || !b2Speaking.hasRecording;
    if (weakSpeaking) level = capLevel(level, "B1");
  }

  return level;
}

function buildRecommendation(level) {
  const writingDone = responses.some(r => r.type === "writing" && r.completed);
  const speakingDone = responses.some(r => r.type === "speaking" && r.completed && r.hasRecording);

  if (!writingDone && !speakingDone) {
    return "Assessment completed mainly through listening, reading, and response tasks.";
  }
  if (!writingDone) return "Writing still needs to be observed more fully.";
  if (!speakingDone) return "Speaking still needs to be observed more fully.";
  return "Listening, reading, writing, and speaking tasks were all attempted.";
}

function finishPlacement() {
  cleanupMediaStream();
  stopRecordingTimer();

  const level = calculateLevel();
  const recommendation = buildRecommendation(level);

  sessionStorage.setItem("placement_attempt_id", attemptId);
  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", String(questions.length));
  sessionStorage.setItem("placement_level", level);
  sessionStorage.setItem("placement_note", recommendation);
  sessionStorage.setItem("placement_responses", JSON.stringify(responses));

  window.location.href = "/placement/result.html";
}

/* ==================================================
   START
================================================== */

renderQuestion();
