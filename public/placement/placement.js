console.log("🔥 placement.js loaded");

/* ==================================================
   🔒 LOCKED QUESTION SET — DO NOT MODIFY
================================================== */

const questions = [
  {
    id: 1,
    prompt: "Listen and choose.",
    audio: "/assets/sounds/placement/a0_q1_bonjour.mp3",
    options: ["Bonjour", "Merci", "Bonsoir", "Pardon"],
    correct: 0,
    level: "A0"
  },
  {
    id: 2,
    prompt: "Which word means morning?",
    options: ["Le matin", "Le soir", "La nuit", "L’après-midi"],
    correct: 0,
    level: "A0"
  },
  {
    id: 3,
    prompt: "What does « merci » mean?",
    options: ["Thank you", "Hello", "Sorry", "Bye"],
    correct: 0,
    level: "A0"
  },
  {
    id: 4,
    prompt: "Listen and choose.",
    audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3",
    options: ["Au revoir", "Bonjour", "Merci", "Salut"],
    correct: 0,
    level: "A0"
  },
  { id: 5, prompt: "Choose the correct sentence.",
    options: [
      "Je suis étudiant.",
      "Je être étudiant.",
      "Je suis être étudiant.",
      "Je étudiant suis."
    ],
    correct: 0, level: "A1" },

  { id: 6, prompt: "What does « j’ai 10 ans » mean?",
    options: [
      "I am 10 years old",
      "I have 10 years",
      "I had 10 years",
      "I am ten years"
    ],
    correct: 0, level: "A1" },

  { id: 7, prompt: "Choose the correct article.",
    options: ["une maison", "un maison", "le maison", "des maison"],
    correct: 0, level: "A1" },

  { id: 8, prompt: "Il pleut. Choisis l’image correcte.",
    image: "/assets/images/a1_q8_weather_collage.png",
    options: ["A","B","C","D"],
    correct: 0, level: "A1" },

  { id: 9, prompt: "Choisis la bonne réponse.",
    options: [
      "Je vais au travail.",
      "Je va travail.",
      "Je vais travail.",
      "Je allé travail."
    ],
    correct: 0, level: "A2" },

  { id: 10, prompt: "Quel est le passé correct ?",
    options: ["J’ai mangé","Je mange","Je manger","Je mangé"],
    correct: 0, level: "A2" },

  { id: 11, prompt: "Choose the meaning of « souvent ».",
    options: ["Often","Never","Yesterday","Slowly"],
    correct: 0, level: "A2" },

  { id: 12, prompt: "Choisis la phrase correcte.",
    options: [
      "Il y a beaucoup de monde.",
      "Il est beaucoup monde.",
      "Il y a monde beaucoup.",
      "Il beaucoup y a monde."
    ],
    correct: 0, level: "A2" },

  { id: 13, prompt: "Choisis la bonne structure.",
    options: [
      "Je le lui ai donné.",
      "Je lui le ai donné.",
      "Je ai le lui donné.",
      "Je donné le lui ai."
    ],
    correct: 0, level: "B1" },

  { id: 14, prompt: "Écoute et choisis.",
    audio: "/assets/sounds/placement/b1_q10_bus.mp3",
    options: ["Prendre le bus","Acheter une maison","Cuisiner","Dormir"],
    correct: 0, level: "B1" },

  { id: 15, prompt: "Pourquoi est-il parti ?",
    options: [
      "Parce qu’il était fatigué.",
      "Parce qu’il fatigue.",
      "Parce qu’il fatigué.",
      "Parce fatigue."
    ],
    correct: 0, level: "B1" },

  { id: 16, prompt: "Choisis la phrase la plus naturelle.",
    options: [
      "Ça dépend de la situation.",
      "Ça dépend la situation.",
      "Ça dépend pour la situation.",
      "Ça dépend à la situation."
    ],
    correct: 0, level: "B1" },

  { id: 17, prompt: "Quelle formulation est la plus diplomatique ?",
    options: [
      "Je comprends votre point de vue.",
      "Vous avez tort.",
      "C’est faux.",
      "Impossible."
    ],
    correct: 0, level: "B2" },

  { id: 18, prompt: "Choisis la formulation la plus formelle.",
    audio: "/assets/sounds/placement/c1_q18_formel.mp3",
    options: [
      "Je vous saurais gré de bien vouloir…",
      "Tu peux faire ça ?",
      "Fais-le.",
      "Dis-moi."
    ],
    correct: 0, level: "C1" },

  { id: 19, prompt: "Quelle phrase est stylistiquement correcte ?",
    options: [
      "N’eût-il pas été prévenu…",
      "Il n’a pas été prévenu pas.",
      "Il n’était pas prévenir.",
      "Pas été prévenu il."
    ],
    correct: 0, level: "C1" },

  { id: 20, prompt: "Choisis la nuance correcte.",
    options: [
      "Il semble que ce soit vrai.",
      "Il semble que c’est vrai.",
      "Il semble est vrai.",
      "Il semble vrai que."
    ],
    correct: 0, level: "C1" }
];

let index = 0;
let wrongStreak = 0;
const scores = { A0:0, A1:0, A2:0, B1:0, B2:0, C1:0 };

const promptEl = document.getElementById("questionPrompt");
const optionsEl = document.getElementById("options");
const mediaArea = document.getElementById("mediaArea");

const overlay = document.getElementById("intervention");
const teacherBox = document.querySelector(".teacher-box");
const actions = document.querySelector(".intervention-actions");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");
const interventionAudio = document.getElementById("interventionAudio");

function loadQuestion() {
  const q = questions[index];

  promptEl.textContent = q.prompt;
  optionsEl.innerHTML = "";
  mediaArea.innerHTML = "";

  if (q.audio) {
    const audio = document.createElement("audio");
    audio.src = q.audio;
    audio.controls = true;
    audio.preload = "metadata";
    audio.load();
    mediaArea.appendChild(audio);
  }

  if (q.image) {
    const img = document.createElement("img");
    img.src = q.image;
    img.className = "question-image";
    mediaArea.appendChild(img);
  }

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => answer(i);
    optionsEl.appendChild(btn);
  });
}

function answer(choice) {
  const q = questions[index];

  if (choice === q.correct) {
    wrongStreak = 0;
    scores[q.level]++;
  } else {
    wrongStreak++;
  }

  if (wrongStreak >= 3) {
    triggerIntervention();
    return;
  }

  index++;
  if (index >= questions.length) finish();
  else loadQuestion();
}

function triggerIntervention() {
  overlay.classList.remove("hidden");

  teacherBox.style.display = "flex";
  actions.style.display = "none";

  // reset previous animations
  continueBtn.classList.remove("slide-in-left", "shimmer");
  revealBtn.classList.remove("slide-in-right", "shimmer");
  continueBtn.style.opacity = "0";
  revealBtn.style.opacity = "0";

  // start slow vertical bounce
  teacherBox.classList.add("slow-bounce");

  setTimeout(() => {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(()=>{});
  }, 200);

  interventionAudio.onended = () => {
    // stop bounce when audio ends
    teacherBox.classList.remove("slow-bounce");

    actions.style.display = "flex";

    // First button slides + shimmers
    setTimeout(() => {
      continueBtn.classList.add("slide-in-left", "shimmer");
    }, 200);

    // Second button slides + shimmers
    setTimeout(() => {
      revealBtn.classList.add("slide-in-right", "shimmer");
    }, 900);
  };
}

continueBtn.onclick = () => {
  overlay.classList.add("hidden");
  wrongStreak = 0;
};

revealBtn.onclick = finish;

function finish() {
  let level = "Absolute Beginner";

  if (scores.C1 > 0) level = "Advanced";
  else if (scores.B2 > 0 || scores.B1 > 0) level = "Semi Advanced";
  else if (scores.A2 > 0) level = "Intermediate";
  else if (scores.A1 > 0) level = "Beginner";

  sessionStorage.setItem("saybon_level", level);
  sessionStorage.setItem("saybon_next", "/reveal/");
  window.location.href = "/loader.html"; // placement → loader → reveal
}

loadQuestion();
