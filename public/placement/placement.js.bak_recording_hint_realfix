console.log("🔥 DELF-style General Placement loaded");

/* ==================================================
   QUESTION SET — GENERAL PLACEMENT (15)
================================================== */

const questions = [
  /* =========================
     A0 (Q1–Q3)
  ========================= */
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
    skill: "response",
    prompt: "What do you say to greet someone in the morning?",
    options: ["Bonsoir", "Bonjour", "Pardon", "Merci"],
    correct: 1,
    level: "A0"
  },

  /* =========================
     A1 (Q4–Q6)
  ========================= */
  {
    id: 4,
    type: "mcq",
    skill: "listening",
    prompt: "Listen and choose the best response.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Au revoir", "Merci", "Bonjour", "Salut"],
    correct: 0,
    level: "A1"
  },
  {
    id: 5,
    type: "mcq",
    skill: "reading",
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
    skill: "speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Comment tu t’appelles ?",

    level: "A1"
  },

  /* =========================
     A2 (Q7–Q9)
  ========================= */
  {
    id: 7,
    type: "mcq",
    skill: "response",
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
    skill: "reading",
    prompt: "Read and answer the question.",
    text: "Le dimanche, je me repose et je regarde la télévision.",
    readingQuestion: "Which statement is true about this person?",
    options: [
      "They work every Sunday morning.",
      "They usually relax and watch television on Sunday.",
      "They go to the market every Sunday.",
      "They play football with friends on Sunday."
    ],
    correct: 1,
    level: "A2"
  },
  {
    id: 9,
    type: "writing",
    skill: "writing",
    prompt: "Write 1 or 2 simple sentences in French.",
    writingPrompt: "Describe your usual Sunday in French.",

    level: "A2"
  },

  /* =========================
     B1 (Q10–Q12)
  ========================= */
  {
    id: 10,
    type: "mcq",
    skill: "reading",
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
    skill: "response",
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
    skill: "speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Pourquoi est-ce important d’apprendre une langue ?",

    level: "B1"
  },

  /* =========================
     B2 (Q13–Q15)
  ========================= */
  {
    id: 13,
    type: "mcq",
    skill: "reading",
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
    skill: "writing",
    prompt: "Write a short response in French.",
    writingPrompt: "Do you think online learning is better than classroom learning? Give your opinion in 2–4 sentences.",

    level: "B2"
  },
  {
    id: 15,
    type: "speaking",
    skill: "speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Selon toi, quels sont les avantages et les inconvénients des réseaux sociaux ?",

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
let objectiveResults = [];

let mediaRecorder = null;
let audioChunks = [];
let currentAudioBlob = null;

/* ==================================================
   DOM
================================================== */

const app = document.getElementById("app");
const questionText = document.getElementById("questionText");
const mediaArea = document.getElementById("mediaArea");
const answers = document.getElementById("answers");
const progressBar = document.getElementById("progressBar");
const levelBadge = document.getElementById("levelBadge");
const questionCounter = document.getElementById("questionCounter");
const skillTag = document.getElementById("skillTag");

const intervention = document.getElementById("intervention");
const interventionAudio = document.getElementById("interventionAudio");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");

/* ==================================================
   HELPERS
================================================== */

function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  if (progressBar) progressBar.style.width = `${progress}%`;

  if (questionCounter) {
    const displayNum = Math.min(currentQuestion + 1, questions.length);
    questionCounter.textContent = `Question ${displayNum} of ${questions.length}`;
  }

  if (levelBadge) {
    const q = questions[currentQuestion];
  }
}

function clearUI() {
  mediaArea.innerHTML = "";
  answers.innerHTML = "";
}

function makePillButton(text, onClick) {
  const btn = document.createElement("button");
  btn.className = "answer-pill";
  btn.type = "button";
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

function getSkillLabel(skill) {
  if (!skill) return "";
  const map = {
    listening: "Listening",
    reading: "Reading",
    response: "Understanding",
    speaking: "Speaking",
    writing: "Writing"
  };
  return map[skill] || skill;
}

function nextQuestion() {
  currentQuestion++;
  renderQuestion();
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

  updateProgress();
  clearUI();

  questionText.textContent = q.prompt;

  if (skillTag) {
    skillTag.textContent = getSkillLabel(q.skill);
    skillTag.classList.remove("hidden");
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
      <p class="reading-label">Text</p>
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
    renderSpeakingQuestion(q);
  }

  if (q.type === "writing") {
    renderWritingQuestion(q);
  }
}

/* ==================================================
   SPEAKING
================================================== */

function renderSpeakingQuestion(q) {
  const card = document.createElement("div");
  card.className = "response-card";
  card.innerHTML = `
    <div class="record-panel">
      <p class="response-prompt">${q.speakingPrompt}</p>

      <div class="record-actions">
        <button class="record-btn" id="startRecordingBtn" type="button">🎤 Start Recording</button>
        <button class="stop-btn" id="stopRecordingBtn" type="button" disabled>Stop Recording</button>
      </div>

      <p class="record-status" id="recordStatus">Tap Start Recording and answer in French.</p>

      <div id="recordingPreview"></div>

      <button class="answer-pill submit-pill" id="submitSpeaking" type="button" disabled>Submit Answer</button>
    </div>
  `;
  answers.appendChild(card);

  const startBtn = document.getElementById("startRecordingBtn");
  const stopBtn = document.getElementById("stopRecordingBtn");
  const submitBtn = document.getElementById("submitSpeaking");
  const recordStatus = document.getElementById("recordStatus");
  const recordingPreview = document.getElementById("recordingPreview");

  currentAudioBlob = null;

  startBtn.onclick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        currentAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(currentAudioBlob);

        recordingPreview.innerHTML = `
          <audio class="recorded-audio" controls src="${audioURL}"></audio>
        `;

        recordStatus.textContent = "Recording captured. You can review it, then submit.";
        submitBtn.disabled = false;

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      recordStatus.textContent = "Recording... speak now.";
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } catch (error) {
      console.error("Microphone error:", error);
      recordStatus.textContent = "Microphone access was blocked or unavailable.";
    }
  };

  stopBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      stopBtn.disabled = true;
    }
  };

  submitBtn.onclick = () => {
    spokenAnswers.push({
      id: q.id,
      level: q.level,
      prompt: q.speakingPrompt,
      hasAudio: !!currentAudioBlob,
      audioCapturedAt: new Date().toISOString()
    });
    nextQuestion();
  };
}

/* ==================================================
   WRITING
================================================== */

function renderWritingQuestion(q) {
  const card = document.createElement("div");
  card.className = "response-card";
  card.innerHTML = `
    <p class="response-prompt">${q.writingPrompt}</p>
    <textarea id="writtenResponse" class="response-box" placeholder="Write your answer here..."></textarea>
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
    nextQuestion();
  };
}

/* ==================================================
   ANSWER HANDLER
================================================== */

function handleAnswer(selectedIndex) {
  const q = questions[currentQuestion];
  const isCorrect = selectedIndex === q.correct;

  objectiveResults.push({
    id: q.id,
    level: q.level,
    skill: q.skill || "objective",
    correct: isCorrect
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
   RESULT LOGIC (LEVEL GATING)
================================================== */

function countLevelCorrect(level) {
  return objectiveResults.filter(x => x.level === level && x.correct).length;
}

function calculateLevel() {
  const a0 = countLevelCorrect("A0");
  const a1 = countLevelCorrect("A1");
  const a2 = countLevelCorrect("A2");
  const b1 = countLevelCorrect("B1");
  const b2 = countLevelCorrect("B2");

  if (a0 <= 1) return "A0";
  if (a1 <= 1) return "A1";
  if (a2 <= 1) return "A2";
  if (b1 <= 1) return "B1";
  return "B2";
}

function finishPlacement() {
  const level = calculateLevel();

  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", String(questions.length));
  sessionStorage.setItem("placement_level", level);
  sessionStorage.setItem("placement_spoken_answers", JSON.stringify(spokenAnswers));
  sessionStorage.setItem("placement_written_answers", JSON.stringify(writtenAnswers));
  sessionStorage.setItem("placement_objective_results", JSON.stringify(objectiveResults));

  window.location.href = "/placement/result.html";
}

/* ==================================================
   START
================================================== */

renderQuestion();




