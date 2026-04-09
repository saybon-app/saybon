console.log("🔥 placement.js loaded");

/* ==================================================
   🔒 LOCKED QUESTION SET — DO NOT MODIFY
================================================== */

const questions = [
  {
    id: 1,
    prompt: "Listen and choose.",
    audio: "/assets/sounds/placement/a0_q1_bonjour.mp3",
    options: ["Merci", "Bonjour", "Pardon", "Bonsoir"],
    correct: 1,
    level: "A0"
  },
  {
    id: 2,
    prompt: "Which word means morning?",
    options: ["Le soir", "L’après-midi", "Le matin", "La nuit"],
    correct: 2,
    level: "A0"
  },
  {
    id: 3,
    prompt: "What does « merci » mean?",
    options: ["Hello", "Bye", "Thank you", "Sorry"],
    correct: 2,
    level: "A0"
  },
  {
    id: 4,
    prompt: "Listen and choose.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Salut", "Merci", "Au revoir", "Bonjour"],
    correct: 2,
    level: "A0"
  },
  {
    id: 5,
    prompt: "Choose the correct sentence.",
    options: [
      "Je être étudiant.",
      "Je suis étudiant.",
      "Je étudiant suis.",
      "Je suis être étudiant."
    ],
    correct: 1,
    level: "A1"
  },
  {
    id: 6,
    prompt: "What does « j’ai 10 ans » mean?",
    options: [
      "I had 10 years",
      "I have 10 years",
      "I am 10 years old",
      "I am ten years"
    ],
    correct: 2,
    level: "A1"
  },
  {
    id: 7,
    prompt: "Choose the correct article.",
    options: ["le maison", "une maison", "des maison", "un maison"],
    correct: 1,
    level: "A1"
  },
  {
    id: 8,
    prompt: "Il pleut. Choisis l’image correcte.",
    image: "/assets/images/a1_q8_weather_collage.png",
    options: ["A", "B", "C", "D"],
    correct: 0,
    level: "A1"
  },
  {
    id: 9,
    prompt: "Choisis la bonne réponse.",
    options: [
      "Je vais travail.",
      "Je allé travail.",
      "Je vais au travail.",
      "Je va travail."
    ],
    correct: 2,
    level: "A2"
  },
  {
    id: 10,
    prompt: "Quel est le passé correct ?",
    options: ["Je mange", "Je manger", "J’ai mangé", "Je mangé"],
    correct: 2,
    level: "A2"
  },
  {
    id: 11,
    prompt: "Choose the meaning of « souvent ».",
    options: ["Yesterday", "Often", "Slowly", "Never"],
    correct: 1,
    level: "A2"
  },
  {
    id: 12,
    prompt: "Choisis la phrase correcte.",
    options: [
      "Il beaucoup y a monde.",
      "Il est beaucoup monde.",
      "Il y a monde beaucoup.",
      "Il y a beaucoup de monde."
    ],
    correct: 3,
    level: "A2"
  }
];

/* ==================================================
   APP STATE
================================================== */

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;

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
   RENDER QUESTION
================================================== */

function renderQuestion() {
  const q = questions[currentQuestion];

  if (!q) {
    finishPlacement();
    return;
  }

  questionPrompt.textContent = q.prompt;
  mediaArea.innerHTML = "";
  optionsBox.innerHTML = "";

  if (q.audio) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = q.audio;
    audio.preload = "auto";
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

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;
    btn.onclick = () => handleAnswer(index);
    optionsBox.appendChild(btn);
  });
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
   RESULT LOGIC
================================================== */

function calculateLevel() {
  const percent = Math.round((score / questions.length) * 100);

  if (percent < 25) return "A0";
  if (percent < 45) return "A1";
  if (percent < 65) return "A2";
  if (percent < 80) return "B1";
  if (percent < 92) return "B2";
  return "C1";
}

function finishPlacement() {
  const level = calculateLevel();

  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", String(questions.length));
  sessionStorage.setItem("placement_level", level);

  window.location.href = "/placement/result.html";
}

/* ==================================================
   START
================================================== */

renderQuestion();
