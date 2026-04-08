// ===============================
// SAYBON PLACEMENT TEST
// ===============================

const questions = [
  {
    level: "A0",
    text: "What does “Bonjour” mean?",
    options: ["Good night", "Hello", "Thank you", "Goodbye"],
    correct: 1
  },
  {
    level: "A0",
    text: "Which sentence means “My name is Anna”?",
    options: [
      "Je suis Anna",
      "Je vais Anna",
      "Je m’appelle Anna",
      "J’aime Anna"
    ],
    correct: 2
  },
  {
    level: "A1",
    text: "Look at the image. What is happening?",
    image: "../assets/images/eating.png",
    options: [
      "He is sleeping",
      "He is eating",
      "He is running",
      "He is working"
    ],
    correct: 1
  },
  {
    level: "A1",
    text: "Listen and choose the correct meaning.",
    audio: "../assets/sounds/placement/listen-1.mp3",
    options: [
      "She lives in Paris",
      "She is hungry",
      "She is learning French",
      "She works in Paris"
    ],
    correct: 2
  },
  {
    level: "A2",
    text: "Which sentence is grammatically correct?",
    options: [
      "Je mange hier",
      "J’ai mangé hier",
      "Je mangé hier",
      "Je vais mangé hier"
    ],
    correct: 1
  },
  {
    level: "B1",
    text: "Listen and choose the correct meaning.",
    audio: "../assets/sounds/placement/listen-2.mp3",
    options: [
      "He is going to the market",
      "He likes the market",
      "He went to the market yesterday",
      "He works at the market"
    ],
    correct: 2
  },
  {
    level: "B2",
    text: "Which sentence expresses an opinion?",
    options: [
      "Il pleut aujourd’hui",
      "Je mange à midi",
      "À mon avis, cette idée est importante",
      "Il y a un café ici"
    ],
    correct: 2
  },
  {
    level: "C1",
    text: "Which sentence sounds the most natural?",
    options: [
      "Je suis très fatigué car j’ai trop travaillé",
      "Je suis fatigué parce que travail",
      "Fatigué je travaille trop",
      "Je fatigue travail"
    ],
    correct: 0
  }
];

let index = 0;
let score = 0;

// DOM
const questionText = document.getElementById("questionText");
const answersEl = document.getElementById("answers");
const imageEl = document.getElementById("questionImage");
const audioBtn = document.getElementById("audioBtn");
const progressBar = document.getElementById("progressBar");

function loadQuestion() {
  const q = questions[index];

  questionText.textContent = q.text;
  answersEl.innerHTML = "";

  // progress
  progressBar.style.width =
    ((index + 1) / questions.length) * 100 + "%";

  // image
  if (q.image) {
    imageEl.src = q.image;
    imageEl.classList.remove("hidden");
  } else {
    imageEl.classList.add("hidden");
  }

  // audio (IMPORTANT FIX)
  if (q.audio) {
    audioBtn.classList.remove("hidden");

    audioBtn.onclick = () => {
      const audio = new Audio(q.audio);
      audio.load();
      audio.play();
    };

  } else {
    audioBtn.classList.add("hidden");
    audioBtn.onclick = null;
  }

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;

    btn.onclick = () => {
      if (i === q.correct) score++;
      index++;

      if (index < questions.length) {
        loadQuestion();
      } else {
        finishTest();
      }
    };

    answersEl.appendChild(btn);
  });
}

function finishTest() {
  let level;

  if (score <= 2) level = "Absolute Beginner";
  else if (score <= 4) level = "Beginner";
  else if (score <= 6) level = "Intermediate";
  else if (score === 7) level = "Semi-Advanced";
  else level = "Advanced";

  localStorage.setItem("saybon_level", level);

  // placement test → loader → dashboard
  sessionStorage.setItem("saybon_next", "../dashboard/index.html");
  window.location.href = "../loader.html";
}

loadQuestion();
