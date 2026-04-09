console.log("🔥 DELF-style General Placement loaded");

/* ==================================================
   QUESTION SET — GENERAL PLACEMENT (15)
================================================== */

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
    expectedHint: "",
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
    expectedHint: "",
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
    expectedHint: "",
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
    expectedHint: "",
    level: "B2"
  },
  {
    id: 15,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Selon toi, quels sont les avantages et les inconvénients des réseaux sociaux ?",
    expectedHint: "",
    level: "B2"
  }
];

/* ==================================================
   STATE
================================================== */

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;
let spokenAnswers = [];
let writtenAnswers = [];

/* ==================================================
   DOM
================================================== */

const app = document.getElementById("app");
const questionText = document.getElementById("questionText");
const mediaArea = document.getElementById("mediaArea");
const answers = document.getElementById("answers");
const progressBar = document.getElementById("progressBar");

const intervention = document.getElementById("intervention");
const interventionAudio = document.getElementById("interventionAudio");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");

/* ==================================================
   SAFETY RESET ON LOAD
================================================== */

function resetInterventionState() {
  if (intervention) {
    intervention.classList.add("hidden");
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

/* ==================================================
   HELPERS
================================================== */

function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function clearUI() {
  mediaArea.innerHTML = "";
  answers.innerHTML = "";
}

function makePillButton(text, onClick) {
  const btn = document.createElement("button");
  btn.className = "answer-pill";
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

/* ==================================================
   RENDER
================================================== */

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

  const categoryBadge = document.querySelector(".placement-category");
  if (categoryBadge) {
    categoryBadge.textContent = q.category || "";
  }

  const questionCount = document.querySelector(".question-count");
  if (questionCount) {
    questionCount.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  }

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
    card.className = "response-card";
    card.innerHTML = `
      <p class="response-prompt">${q.speakingPrompt}</p>
      <button class="record-btn" id="startRecordingBtn" type="button">🎤 Start Recording</button>
      <button class="stop-btn" id="stopRecordingBtn" type="button">Stop Recording</button>
      <p class="record-instruction">Tap Start Recording and answer in French.</p>
      <button class="answer-pill submit-pill" id="submitSpeaking">Submit Answer</button>
    `;
    answers.appendChild(card);

    document.getElementById("submitSpeaking").onclick = () => {
      spokenAnswers.push({
        id: q.id,
        level: q.level,
        prompt: q.speakingPrompt,
        answer: "Recorded response"
      });
      currentQuestion++;
      renderQuestion();
    };
  }

  if (q.type === "writing") {
    const card = document.createElement("div");
    card.className = "response-card";
    card.innerHTML = `
      <p class="response-prompt">${q.writingPrompt}</p>
      <textarea id="writtenResponse" class="response-box" placeholder=""></textarea>
      <button class="answer-pill submit-pill" id="submitWriting">Submit Answer</button>
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

/* ==================================================
   ANSWER HANDLER
================================================== */

function handleAnswer(selectedIndex) {
  const q = questions[currentQuestion];

  if (selectedIndex === q.correct) {
    score++;
  } else {
    wrongAnswers++;
  }

  currentQuestion++;

  // ONLY TRIGGER HERE. NOWHERE ELSE.
  if (!interventionShown && wrongAnswers >= 3 && currentQuestion < questions.length) {
    showIntervention();
    return;
  }

  renderQuestion();
}

/* ==================================================
   INTERVENTION
================================================== */

function showIntervention() {
  // HARD LOCK: ONLY ALLOW AFTER 3 WRONG ANSWERS
  if (wrongAnswers < 3 || interventionShown === true) return;

  interventionShown = true;

  if (app) {
    app.classList.add("hidden");
    app.style.display = "none";
    app.style.pointerEvents = "none";
  }

  if (intervention) {
    intervention.classList.remove("hidden");
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
  }

  interventionAudio.onended = () => {
    continueBtn.style.opacity = "1";
    revealBtn.style.opacity = "1";

    continueBtn.classList.add("slide-in-left");
    revealBtn.classList.add("slide-in-right");
  };
}

continueBtn.onclick = () => {
  if (intervention) {
    intervention.classList.add("hidden");
    intervention.style.display = "none";
    intervention.style.opacity = "0";
    intervention.style.pointerEvents = "none";
  }

  if (app) {
    app.classList.remove("hidden");
    app.style.display = "";
    app.style.pointerEvents = "auto";
  }

  renderQuestion();
};

revealBtn.onclick = () => {
  finishPlacement();
};

/* ==================================================
   RESULT LOGIC
================================================== */

function calculateLevel() {
  const percent = Math.round((score / 12) * 100);

  if (percent < 25) return "A0";
  if (percent < 45) return "A1";
  if (percent < 65) return "A2";
  if (percent < 80) return "B1";
  return "B2";
}

function finishPlacement() {
  const level = calculateLevel();

  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", "15");
  sessionStorage.setItem("placement_level", level);
  sessionStorage.setItem("placement_spoken_answers", JSON.stringify(spokenAnswers));
  sessionStorage.setItem("placement_written_answers", JSON.stringify(writtenAnswers));

  window.location.href = "/placement/result.html";
}

/* ==================================================
   START
================================================== */

resetInterventionState();
renderQuestion();
