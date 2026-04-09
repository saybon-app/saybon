console.log("🔥 placement.js loaded");

/* ==================================================
   SAYBON 15-QUESTION PLACEMENT ENGINE
   DELF-STYLE SPEAKING CAPTURE FOUNDATION
   LOCKED ORDER:
   A0 -> A1 -> A2 -> B1 -> B2
================================================== */

const questions = [
  /* ==================================================
     A0 (Q1–Q3)
  ================================================== */
  {
    id: 1,
    type: "mcq",
    skill: "listening",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q1_bonjour.mp3",
    options: ["Merci", "Bonjour", "Pardon", "Bonsoir"],
    correct: 1,
    level: "A0"
  },
  {
    id: 2,
    type: "mcq",
    skill: "response",
    prompt: "Someone says « Merci ». Choose the best response.",
    options: ["Bonsoir", "Salut", "De rien", "Bonjour"],
    correct: 2,
    level: "A0"
  },
  {
    id: 3,
    type: "mcq",
    skill: "basic-understanding",
    prompt: "What do you say to greet someone in the morning?",
    options: ["Bonsoir", "Merci", "Bonjour", "Pardon"],
    correct: 2,
    level: "A0"
  },

  /* ==================================================
     A1 (Q4–Q6)
  ================================================== */
  {
    id: 4,
    type: "mcq",
    skill: "listening",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Salut", "Bonjour", "Au revoir", "Merci"],
    correct: 2,
    level: "A1"
  },
  {
    id: 5,
    type: "mcq",
    skill: "reading",
    prompt: "Read and answer the question.",
    text: "Je m’appelle Paul. J’habite à Accra.",
    question: "Which statement is true?",
    options: [
      "Paul lives in Ghana.",
      "Paul is introducing his brother.",
      "Paul is saying goodbye.",
      "Paul lives in Paris."
    ],
    correct: 0,
    level: "A1"
  },
  {
    id: 6,
    type: "speaking_record",
    skill: "speaking",
    prompt: "Answer in French: What is your name?",
    speakingPrompt: "Réponds en français : Comment tu t’appelles ?",
    expectedHint: "Exemple : Je m’appelle …",
    level: "A1"
  },

  /* ==================================================
     A2 (Q7–Q9)
  ================================================== */
  {
    id: 7,
    type: "mcq",
    skill: "response",
    prompt: "Choose the best response to this question: « Tu fais quoi le week-end ? »",
    options: [
      "Il fait beau aujourd’hui.",
      "Je joue au football le samedi.",
      "Merci beaucoup.",
      "J’ai deux frères."
    ],
    correct: 1,
    level: "A2"
  },
  {
    id: 8,
    type: "mcq",
    skill: "reading",
    prompt: "Read and answer the question.",
    text: "Le dimanche, je me repose et je regarde la télévision.",
    question: "Which statement is true?",
    options: [
      "This person usually has a very busy Sunday.",
      "This person goes shopping every Sunday.",
      "This person spends Sunday resting at home.",
      "This person usually plays sports on Sunday."
    ],
    correct: 2,
    level: "A2"
  },
  {
    id: 9,
    type: "writing",
    skill: "writing",
    prompt: "Write 1 or 2 simple sentences in French about your daily routine.",
    writingPrompt: "Écris 1 ou 2 phrases simples en français sur ta routine quotidienne.",
    expectedHint: "Exemple : Je me réveille à 6 heures. Je vais à l’école.",
    level: "A2"
  },

  /* ==================================================
     B1 (Q10–Q12)
  ================================================== */
  {
    id: 10,
    type: "mcq",
    skill: "reading",
    prompt: "Read and answer the question.",
    text: "Je suis arrivé en retard parce que le bus est tombé en panne. Heureusement, le professeur a compris la situation.",
    question: "What can we understand from the text?",
    options: [
      "The teacher refused to listen.",
      "The student was late because of transport trouble.",
      "The student missed school on purpose.",
      "The bus arrived earlier than expected."
    ],
    correct: 1,
    level: "B1"
  },
  {
    id: 11,
    type: "mcq",
    skill: "usage",
    prompt: "Choose the most natural answer.",
    options: [
      "À mon avis, apprendre le français peut offrir plus d’opportunités.",
      "À mon avis, le français est apprend opportunités.",
      "Le français opinion plus opportunité est.",
      "Je opinion apprendre français très possibilité."
    ],
    correct: 0,
    level: "B1"
  },
  {
    id: 12,
    type: "speaking_record",
    skill: "speaking",
    prompt: "Answer in French: Describe your day in 2 or 3 sentences.",
    speakingPrompt: "Décris ta journée en français en 2 ou 3 phrases.",
    expectedHint: "Exemple : Le matin, je travaille. L’après-midi, j’étudie. Le soir, je me repose.",
    level: "B1"
  },

  /* ==================================================
     B2 (Q13–Q15)
  ================================================== */
  {
    id: 13,
    type: "mcq",
    skill: "reading",
    prompt: "Read and answer the question.",
    text: "Je pense que voyager est essentiel, non seulement pour découvrir d’autres cultures, mais aussi pour remettre en question ses propres habitudes et élargir sa vision du monde.",
    question: "What is the writer mainly saying?",
    options: [
      "Travelling can broaden the way a person thinks.",
      "Travelling is mostly useful for entertainment.",
      "Travelling should only be done during holidays.",
      "Travelling has little effect on personal growth."
    ],
    correct: 0,
    level: "B2"
  },
  {
    id: 14,
    type: "writing",
    skill: "writing",
    prompt: "Write 3 to 5 sentences in French giving your opinion on why learning French can be useful.",
    writingPrompt: "Écris 3 à 5 phrases en français pour donner ton opinion sur l’utilité d’apprendre le français.",
    expectedHint: "Donne ton opinion et une ou deux raisons.",
    level: "B2"
  },
  {
    id: 15,
    type: "speaking_record",
    skill: "speaking",
    prompt: "Answer in French: Is learning French important? Why?",
    speakingPrompt: "Réponds en français : Est-ce qu’apprendre le français est important ? Pourquoi ?",
    expectedHint: "Donne ton avis et explique pourquoi.",
    level: "B2"
  }
];

/* ==================================================
   APP STATE
================================================== */

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;
const responses = [];

const attemptId = "placement_" + Date.now();

/* ==================================================
   SPEAKING CAPTURE STATE
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
   DOM
================================================== */

const app = document.getElementById("app");
const questionPrompt = document.getElementById("questionPrompt");
const mediaArea = document.getElementById("mediaArea");
const optionsBox = document.getElementById("options");

const intervention = document.getElementById("intervention");
const interventionAudio = document.getElementById("interventionAudio");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");

/* ==================================================
   INDEXEDDB FOR RECORDED ANSWERS
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

function createActionButton(label, onClick) {
  const btn = document.createElement("button");
  btn.className = "option-btn";
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function saveResponse(q, data) {
  const existingIndex = responses.findIndex(r => r.id === q.id);
  const payload = {
    id: q.id,
    level: q.level,
    type: q.type,
    skill: q.skill,
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

function clearQuestionArea() {
  questionPrompt.textContent = "";
  mediaArea.innerHTML = "";
  optionsBox.innerHTML = "";
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

function cleanupMediaStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
}

/* ==================================================
   RENDER QUESTION
================================================== */

function renderQuestion() {
  const q = questions[currentQuestion];

  if (!q) {
    finishPlacement();
    return;
  }

  clearQuestionArea();
  questionPrompt.textContent = q.prompt;

  if (q.audio) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = q.audio;
    audio.preload = "auto";
    audio.style.display = "block";
    audio.style.margin = "0 auto 24px";
    mediaArea.appendChild(audio);
  }

  if (q.image) {
    const img = document.createElement("img");
    img.src = q.image;
    img.alt = "question visual";
    img.style.maxWidth = "320px";
    img.style.width = "100%";
    img.style.borderRadius = "18px";
    img.style.display = "block";
    img.style.margin = "0 auto 20px";
    mediaArea.appendChild(img);
  }

  if (q.text) {
    const textLabel = document.createElement("div");
    textLabel.style.maxWidth = "720px";
    textLabel.style.margin = "0 auto 10px";
    textLabel.style.fontWeight = "600";
    textLabel.style.textAlign = "left";
    textLabel.textContent = "Text:";
    mediaArea.appendChild(textLabel);

    const textBlock = document.createElement("div");
    textBlock.className = "question-text-block";
    textBlock.textContent = q.text;
    textBlock.style.maxWidth = "720px";
    textBlock.style.margin = "0 auto 20px";
    textBlock.style.lineHeight = "1.75";
    textBlock.style.fontSize = "1.06rem";
    textBlock.style.textAlign = "left";
    textBlock.style.padding = "16px 18px";
    textBlock.style.borderRadius = "18px";
    textBlock.style.background = "rgba(255,255,255,0.12)";
    textBlock.style.backdropFilter = "blur(10px)";
    mediaArea.appendChild(textBlock);
  }

  if (q.question) {
    const questionLabel = document.createElement("div");
    questionLabel.style.maxWidth = "720px";
    questionLabel.style.margin = "0 auto 10px";
    questionLabel.style.fontWeight = "600";
    questionLabel.style.textAlign = "left";
    questionLabel.textContent = "Question:";
    mediaArea.appendChild(questionLabel);

    const questionLine = document.createElement("div");
    questionLine.style.maxWidth = "720px";
    questionLine.style.margin = "0 auto 22px";
    questionLine.style.fontWeight = "500";
    questionLine.style.textAlign = "left";
    questionLine.style.lineHeight = "1.6";
    questionLine.textContent = q.question;
    mediaArea.appendChild(questionLine);
  }

  if (q.type === "mcq") {
    q.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = option;
      btn.onclick = () => handleMCQ(index);
      optionsBox.appendChild(btn);
    });
    return;
  }

  if (q.type === "writing") {
    const prompt = document.createElement("div");
    prompt.style.maxWidth = "720px";
    prompt.style.margin = "0 auto 16px";
    prompt.style.textAlign = "left";
    prompt.style.lineHeight = "1.6";
    prompt.innerHTML = "<strong>Task:</strong> " + q.writingPrompt;
    mediaArea.appendChild(prompt);

    const hint = document.createElement("div");
    hint.style.maxWidth = "720px";
    hint.style.margin = "0 auto 14px";
    hint.style.opacity = "0.85";
    hint.style.textAlign = "left";
    hint.textContent = q.expectedHint || "";
    mediaArea.appendChild(hint);

    const textarea = document.createElement("textarea");
    textarea.id = "writingResponse";
    textarea.placeholder = "Write your answer here in French...";
    textarea.style.width = "100%";
    textarea.style.maxWidth = "720px";
    textarea.style.minHeight = "160px";
    textarea.style.display = "block";
    textarea.style.margin = "0 auto 18px";
    textarea.style.padding = "16px";
    textarea.style.borderRadius = "18px";
    textarea.style.border = "none";
    textarea.style.fontSize = "1rem";
    textarea.style.fontFamily = "inherit";
    optionsBox.appendChild(textarea);

    const submitBtn = createActionButton("Continue", handleWriting);
    optionsBox.appendChild(submitBtn);
    return;
  }

  if (q.type === "speaking_record") {
    renderSpeakingRecorder(q);
    return;
  }
}

/* ==================================================
   SPEAKING RECORDER UI
================================================== */

function renderSpeakingRecorder(q) {
  resetRecordingState();
  cleanupMediaStream();

  const prompt = document.createElement("div");
  prompt.style.maxWidth = "720px";
  prompt.style.margin = "0 auto 16px";
  prompt.style.textAlign = "left";
  prompt.style.lineHeight = "1.6";
  prompt.innerHTML = "<strong>Speaking task:</strong> " + q.speakingPrompt;
  mediaArea.appendChild(prompt);

  const hint = document.createElement("div");
  hint.style.maxWidth = "720px";
  hint.style.margin = "0 auto 18px";
  hint.style.opacity = "0.85";
  hint.style.textAlign = "left";
  hint.textContent = q.expectedHint || "";
  mediaArea.appendChild(hint);

  const recorderCard = document.createElement("div");
  recorderCard.style.maxWidth = "720px";
  recorderCard.style.margin = "0 auto 18px";
  recorderCard.style.padding = "18px";
  recorderCard.style.borderRadius = "20px";
  recorderCard.style.background = "rgba(255,255,255,0.12)";
  recorderCard.style.backdropFilter = "blur(10px)";
  recorderCard.style.textAlign = "left";

  const status = document.createElement("div");
  status.id = "recordingStatus";
  status.textContent = "Recorder ready.";
  status.style.marginBottom = "12px";
  status.style.fontWeight = "600";

  const timer = document.createElement("div");
  timer.id = "recordingTimer";
  timer.textContent = "00:00";
  timer.style.marginBottom = "16px";
  timer.style.opacity = "0.9";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "12px";
  controls.style.marginBottom = "16px";

  const startBtn = createActionButton("Start Recording", () => startRecording(status, timer, playback));
  const stopBtn = createActionButton("Stop Recording", () => stopRecording(status, timer, playback));
  const rerecordBtn = createActionButton("Re-record", () => rerecord(status, timer, playback));
  const continueBtnSpeaking = createActionButton("Continue", () => handleSpeakingRecorded(q, note, status));

  stopBtn.disabled = true;
  rerecordBtn.disabled = true;
  continueBtnSpeaking.disabled = true;

  controls.appendChild(startBtn);
  controls.appendChild(stopBtn);
  controls.appendChild(rerecordBtn);
  controls.appendChild(continueBtnSpeaking);

  const playback = document.createElement("audio");
  playback.controls = true;
  playback.style.display = "none";
  playback.style.width = "100%";
  playback.style.marginBottom = "14px";

  const note = document.createElement("textarea");
  note.id = "speakingNote";
  note.placeholder = "Optional: type a short note about what you said...";
  note.style.width = "100%";
  note.style.minHeight = "110px";
  note.style.display = "block";
  note.style.padding = "16px";
  note.style.borderRadius = "18px";
  note.style.border = "none";
  note.style.fontSize = "1rem";
  note.style.fontFamily = "inherit";

  recorderCard.appendChild(status);
  recorderCard.appendChild(timer);
  recorderCard.appendChild(controls);
  recorderCard.appendChild(playback);
  recorderCard.appendChild(note);
  optionsBox.appendChild(recorderCard);

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
        continueBtnSpeaking.disabled = false;

        cleanupMediaStream();
      };

      mediaRecorder.start();
      statusEl.textContent = "Recording...";
      startBtn.disabled = true;
      stopBtn.disabled = false;
      rerecordBtn.disabled = true;
      continueBtnSpeaking.disabled = true;
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

  function rerecord(statusEl, timerEl, playbackEl) {
    resetRecordingState();
    playbackEl.removeAttribute("src");
    playbackEl.style.display = "none";
    statusEl.textContent = "Recorder reset. Start again.";
    timerEl.textContent = "00:00";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    rerecordBtn.disabled = true;
    continueBtnSpeaking.disabled = true;
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
    showIntervention();
    return;
  }

  renderQuestion();
}

function handleWriting() {
  const q = questions[currentQuestion];
  const textarea = document.getElementById("writingResponse");
  const text = textarea ? textarea.value.trim() : "";

  saveResponse(q, {
    text,
    completed: text.length > 0,
    length: text.length
  });

  currentQuestion++;
  renderQuestion();
}

async function handleSpeakingRecorded(q, noteEl, statusEl) {
  try {
    const note = noteEl ? noteEl.value.trim() : "";

    if (!currentRecordingBlob || currentRecordingBlob.size === 0) {
      if (statusEl) statusEl.textContent = "Please record your spoken answer before continuing.";
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
      recordingId,
      recordingDuration: recordingSeconds,
      hasRecording: true
    });

    currentQuestion++;
    renderQuestion();
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "Could not save recording locally. Please try again.";
  }
}

/* ==================================================
   INTERVENTION
================================================== */

function showIntervention() {
  interventionShown = true;
  app.classList.add("hidden");
  intervention.classList.remove("hidden");

  if (interventionAudio) {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(() => {});
  }

  if (continueBtn) {
    continueBtn.classList.add("slide-in-left", "shimmer");
  }

  if (revealBtn) {
    revealBtn.classList.add("slide-in-right", "shimmer");
  }
}

continueBtn.onclick = () => {
  intervention.classList.add("hidden");
  app.classList.remove("hidden");
  renderQuestion();
};

revealBtn.onclick = () => {
  finishPlacement();
};

/* ==================================================
   LEVEL SCORING
================================================== */

function calculateBaseLevel() {
  const autoQuestionsByLevel = {
    A0: questions.filter(q => q.level === "A0" && q.type === "mcq"),
    A1: questions.filter(q => q.level === "A1" && q.type === "mcq"),
    A2: questions.filter(q => q.level === "A2" && q.type === "mcq"),
    B1: questions.filter(q => q.level === "B1" && q.type === "mcq"),
    B2: questions.filter(q => q.level === "B2" && q.type === "mcq")
  };

  const correctByLevel = {
    A0: 0,
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0
  };

  responses.forEach(r => {
    if (r.type === "mcq" && r.isCorrect && correctByLevel.hasOwnProperty(r.level)) {
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

  if (level === "A2" || level === "B1" || level === "B2") {
    const a2WritingWeak = !a2Writing || !a2Writing.completed || (a2Writing.length || 0) < 12;
    if (a2WritingWeak) {
      level = capLevel(level, "A1");
    }
  }

  if (level === "B1" || level === "B2") {
    const b1SpeakingWeak = !b1Speaking || !b1Speaking.completed || !b1Speaking.hasRecording;
    if (b1SpeakingWeak) {
      level = capLevel(level, "A2");
    }
  }

  if (level === "B2") {
    const b2WritingWeak = !b2Writing || !b2Writing.completed || (b2Writing.length || 0) < 35;
    if (b2WritingWeak) {
      level = capLevel(level, "B1");
    }
  }

  if (level === "B2") {
    const b2SpeakingWeak = !b2Speaking || !b2Speaking.completed || !b2Speaking.hasRecording;
    if (b2SpeakingWeak) {
      level = capLevel(level, "B1");
    }
  }

  return level;
}

function buildRecommendation(level) {
  const writingResponses = responses.filter(r => r.type === "writing");
  const speakingResponses = responses.filter(r => r.type === "speaking_record");

  const writingCompleted = writingResponses.some(r => r.completed);
  const speakingCompleted = speakingResponses.some(r => r.completed && r.hasRecording);

  let note = "";

  if (!writingCompleted && !speakingCompleted) {
    note = "Assessment completed mainly through listening, reading, and response tasks.";
  } else if (!writingCompleted) {
    note = "Writing still needs to be observed more fully.";
  } else if (!speakingCompleted) {
    note = "Speaking still needs to be observed more fully.";
  } else {
    note = "Listening, reading, writing, and speaking tasks were all attempted.";
  }

  return note;
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
