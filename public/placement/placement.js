console.log("placement.js loaded");

/* ==================================================
   QUESTION BANK - grouped by CEFR level
   Staircase design: a level's questions only appear
   after the previous level has genuinely been passed.
   The test stops the moment a level is failed, so
   nobody is ever exposed to questions far above their
   real ability where a lucky guess could inflate the
   result. Multiple choice questions are auto-graded;
   typed questions require real recall and production,
   not just recognition.
================================================== */

const questions = [

  // ===== A0 - Absolute Beginner (3 questions, need 3/3) =====
  { id: 1, level: "A0", type: "mc", prompt: "Listen and choose.", audio: "/assets/sounds/placement/a0_q1_bonjour.mp3", options: ["Merci", "Bonsoir", "Bonjour", "Pardon"], correct: 2 },
  { id: 2, level: "A0", type: "mc", prompt: "What does « merci » mean?", options: ["Hello", "Thank you", "Sorry", "Bye"], correct: 1 },
  { id: 3, level: "A0", type: "mc", prompt: "Listen and choose.", audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3", options: ["Bonjour", "Merci", "Au revoir", "Salut"], correct: 2 },

  // ===== A1 - Beginner (4 MC + 2 typed = 6, need 5/6) =====
  { id: 4, level: "A1", type: "mc", prompt: "Complete the sentence correctly: « Mes parents ___ à Lyon, mais moi, j'habite à Marseille. »", options: ["habite", "habites", "habitent", "habitez"], correct: 2 },
  { id: 5, level: "A1", type: "mc", prompt: "Read: « Sophie a deux frères. Le plus jeune a 8 ans. Son frère aîné a 6 ans de plus que lui. » Quel âge a le frère aîné ?", options: ["8 ans", "2 ans", "6 ans", "14 ans"], correct: 3 },
  { id: 6, level: "A1", type: "mc", prompt: "Complete the sentence correctly: « Il n'y a pas ___ pain dans le frigo. »", options: ["le", "du", "des", "de"], correct: 3 },
  { id: 7, level: "A1", type: "mc", prompt: "Il pleut. Choisis l'image correcte.", image: "/assets/images/a1_q8_weather_collage.png", options: ["A","B","C","D"], correct: 0 },
  { id: 24, level: "A1", type: "typed", prompt: "Écris la forme correcte : « Je ___ (avoir) 20 ans. »", acceptableAnswers: ["ai"] },
  { id: 25, level: "A1", type: "typed", prompt: "Comment dit-on « Good evening » en français ?", acceptableAnswers: ["bonsoir"] },

  // ===== A2 - Elementary (4 MC + 2 typed = 6, need 5/6) =====
  { id: 8, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Hier, je ___ au cinéma quand il a commencé à pleuvoir. »", options: ["suis allé", "vais", "allais", "irai"], correct: 2 },
  { id: 9, level: "A2", type: "mc", prompt: "Read: « Le document a été rédigé lundi matin. Il a été envoyé le jour suivant, avant midi. » Que peut-on dire du document ?", options: ["Il a été envoyé le lundi.", "Il n'a jamais été envoyé.", "Il a été envoyé le vendredi.", "Il a été envoyé le mardi."], correct: 3 },
  { id: 10, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Elle travaille beaucoup, ___ elle réussit tous ses examens. »", options: ["mais", "ou", "donc", "si"], correct: 2 },
  { id: 11, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Tu as des questions ? Oui, j'___ ai plusieurs. »", options: ["y", "le", "en", "lui"], correct: 2 },
  { id: 26, level: "A2", type: "typed", prompt: "Complète au passé composé : « Hier, nous ___ (visiter) le musée. »", acceptableAnswers: ["avons visite", "avons visité"] },
  { id: 27, level: "A2", type: "typed", prompt: "Écris le contraire de « facile ».", acceptableAnswers: ["difficile"] },

  // ===== B1 - Intermediate (4 MC + 1 typed = 5, need 4/5) =====
  { id: 12, level: "B1", type: "mc", prompt: "Choisis la bonne structure.", options: ["Je lui le ai donné.", "Je le lui ai donné.", "Je ai le lui donné.", "Je donné le lui ai."], correct: 1 },
  { id: 13, level: "B1", type: "mc", prompt: "Écoute et choisis.", audio: "/assets/sounds/placement/b1_q10_bus.mp3", options: ["Acheter une maison", "Prendre le bus", "Cuisiner", "Dormir"], correct: 1 },
  { id: 14, level: "B1", type: "mc", prompt: "Pourquoi est-il parti ?", options: ["Parce qu'il fatigue.", "Parce qu'il est fatigué.", "Parce qu'il était fatigué.", "Parce fatigué."], correct: 2 },
  { id: 15, level: "B1", type: "mc", prompt: "Choisis la phrase la plus naturelle.", options: ["Ça dépend la situation.", "Ça dépend pour la situation.", "Ça dépend à la situation.", "Ça dépend de la situation."], correct: 3 },
  { id: 28, level: "B1", type: "typed", prompt: "Complète avec le bon pronom : « Je ne connais pas ce restaurant, je n'___ ai jamais mangé. »", acceptableAnswers: ["y"] },

  // ===== B2 - Upper Intermediate (4 MC + 1 typed = 5, need 4/5) =====
  { id: 16, level: "B2", type: "mc", prompt: "Quelle formulation est la plus diplomatique ?", options: ["Vous avez tort.", "C'est faux.", "Je comprends votre point de vue.", "Impossible."], correct: 2 },
  { id: 17, level: "B2", type: "mc", prompt: "Choisis la meilleure formulation pour exprimer un désaccord poli.", options: ["T'as tort.", "Je ne suis pas tout à fait d'accord, mais je comprends votre point.", "C'est n'importe quoi.", "Non."], correct: 1 },
  { id: 18, level: "B2", type: "mc", prompt: "Quelle phrase utilise correctement le conditionnel ?", options: ["Si j'ai le temps, je viendrais.", "Si j'avais le temps, je viens.", "Si j'avais le temps, je viendrais.", "Si j'aurais le temps, je viendrais."], correct: 2 },
  { id: 19, level: "B2", type: "mc", prompt: "Choisis la phrase qui exprime une nuance d'incertitude.", options: ["Il pleut demain.", "Il se peut qu'il pleuve demain.", "Il va pleuvoir demain, c'est sûr.", "Il pleuvra demain absolument."], correct: 1 },
  { id: 29, level: "B2", type: "typed", prompt: "Reformule au conditionnel pour être plus poli : « Je veux un café. »", acceptableAnswers: ["je voudrais un cafe", "je voudrais un café"] },

  // ===== C1 - Advanced (4 MC + 1 typed = 5, need 4/5) =====
  { id: 20, level: "C1", type: "mc", prompt: "Choisis la formulation la plus formelle.", audio: "/assets/sounds/placement/c1_q18_formel.mp3", options: ["Tu peux faire ça ?", "Fais-le.", "Je vous saurais gré de bien vouloir…", "Dis-moi."], correct: 2 },
  { id: 21, level: "C1", type: "mc", prompt: "Quelle phrase est stylistiquement correcte ?", options: ["Il n'a pas été prévenu pas.", "N'eût-il pas été prévenu…", "Il n'était pas prévenir.", "Pas été prévenu il."], correct: 1 },
  { id: 22, level: "C1", type: "mc", prompt: "Choisis la nuance correcte.", options: ["Il semble que c'est vrai.", "Il semble est vrai.", "Il semble que ce soit vrai.", "Il semble vrai que."], correct: 2 },
  { id: 23, level: "C1", type: "mc", prompt: "Quelle phrase illustre le mieux l'emploi du subjonctif passé ?", options: ["Bien qu'il a terminé son travail, il est resté tard.", "Bien qu'il termine son travail, il est resté tard.", "Bien qu'il terminait son travail, il est resté tard.", "Bien qu'il ait terminé son travail, il est resté tard."], correct: 3 },
  { id: 30, level: "C1", type: "typed", prompt: "Complète au subjonctif : « Il faut que tu ___ (être) à l'heure. »", acceptableAnswers: ["sois"] }

];

/* ==================================================
   SHUFFLE ANSWER ORDER (multiple choice only)
   Adds an extra layer of per-session randomization
   on top of the source already varying positions.
   Image-based questions are excluded since their
   options (A/B/C/D) refer to fixed regions in the image.
================================================== */
function shuffleOptions(q){
  const correctText = q.options[q.correct];
  for(let i = q.options.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = q.options[i];
    q.options[i] = q.options[j];
    q.options[j] = tmp;
  }
  q.correct = q.options.indexOf(correctText);
}

questions.forEach(q => {
  if (q.type === "mc" && !q.image) shuffleOptions(q);
});

/* ==================================================
   LEVEL STAIRCASE CONFIGURATION
   Threshold is roughly 75% correct, rounded up.
================================================== */

const levelOrder = ["A0","A1","A2","B1","B2","C1"];
const levelThreshold = { A0:3, A1:5, A2:5, B1:4, B2:4, C1:4 };

const accentChars = ["é","è","ê","à","ç","ù","ô","î","œ","«","»"];

let levelIdx = 0;
let levelQueue = [];
let levelPos = 0;
let levelCorrect = 0;
let wrongStreakInLevel = 0;
let confirmedLevel = null;

const promptEl = document.getElementById("questionPrompt");
const optionsEl = document.getElementById("options");
const mediaArea = document.getElementById("mediaArea");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

const overlay = document.getElementById("intervention");
const teacherBox = document.querySelector(".teacher-box");
const actions = document.querySelector(".intervention-actions");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");
const interventionAudio = document.getElementById("interventionAudio");

document.getElementById("placementHomeBtn")?.addEventListener("click", () => {
  window.location.href = "/start.html";
});

function typePrompt(text, onDone){
  promptEl.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "prompt-cursor";
  promptEl.appendChild(cursor);

  let i = 0;
  const speed = 28;

  function step(){
    if(i < text.length){
      cursor.insertAdjacentText("beforebegin", text.charAt(i));
      i++;
      setTimeout(step, speed);
    } else {
      setTimeout(() => {
        cursor.remove();
        if(typeof onDone === "function") onDone();
      }, 400);
    }
  }
  step();
}

function updateProgress(){
  const level = levelOrder[levelIdx];
  const pct = ((levelPos + 1) / levelQueue.length) * 100;
  progressBar.style.width = pct + "%";
  progressLabel.textContent = "Level " + level + " · Question " + (levelPos + 1) + " of " + levelQueue.length;
}

function startLevel(idx){
  levelIdx = idx;
  const level = levelOrder[levelIdx];
  levelQueue = questions.filter(q => q.level === level);
  levelPos = 0;
  levelCorrect = 0;
  wrongStreakInLevel = 0;
  loadQuestion();
}

function normalizeAnswer(str){
  return (str || "").trim().toLowerCase().replace(/[.!?]+$/, "");
}

function buildAccentKeyboard(targetInput){
  const wrap = document.createElement("div");
  wrap.style.marginTop = "10px";
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.gap = "6px";

  accentChars.forEach(ch => {
    const key = document.createElement("span");
    key.textContent = ch;
    key.style.display = "inline-block";
    key.style.padding = "6px 11px";
    key.style.borderRadius = "7px";
    key.style.cursor = "pointer";
    key.style.background = "rgba(0,0,0,.06)";
    key.style.fontSize = "15px";
    key.onclick = () => {
      const start = targetInput.selectionStart;
      const end = targetInput.selectionEnd;
      const val = targetInput.value;
      targetInput.value = val.slice(0, start) + ch + val.slice(end);
      targetInput.selectionStart = targetInput.selectionEnd = start + ch.length;
      targetInput.focus();
    };
    wrap.appendChild(key);
  });

  return wrap;
}

function loadQuestion() {
  const q = levelQueue[levelPos];

  optionsEl.innerHTML = "";
  optionsEl.classList.remove("options-ready");
  mediaArea.innerHTML = "";

  updateProgress();

  typePrompt(q.prompt, () => {

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

    if (q.type === "typed") {

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Type your answer";
      input.style.width = "100%";
      input.style.padding = "12px 14px";
      input.style.fontSize = "15px";
      input.style.borderRadius = "10px";
      input.style.border = "1px solid rgba(0,0,0,.2)";
      input.style.boxSizing = "border-box";
      optionsEl.appendChild(input);

      optionsEl.appendChild(buildAccentKeyboard(input));

      const submitBtn = document.createElement("button");
      submitBtn.className = "option";
      submitBtn.textContent = "Submit Answer";
      submitBtn.style.marginTop = "14px";
      submitBtn.onclick = () => answerTyped(input.value);
      optionsEl.appendChild(submitBtn);

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") answerTyped(input.value);
      });

      requestAnimationFrame(() => {
        optionsEl.classList.add("options-ready");
        input.focus();
      });

      return;

    }

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.style.animationDelay = (i * 0.12) + "s";
      btn.textContent = opt;
      btn.onclick = () => answer(i);
      optionsEl.appendChild(btn);
    });

    requestAnimationFrame(() => {
      optionsEl.classList.add("options-ready");
    });

  });
}

function registerResult(isCorrect){
  if (isCorrect) {
    wrongStreakInLevel = 0;
    levelCorrect++;
  } else {
    wrongStreakInLevel++;
  }

  if (wrongStreakInLevel >= 2) {
    triggerIntervention();
    return;
  }

  advance();
}

function answer(choice) {
  const q = levelQueue[levelPos];
  registerResult(choice === q.correct);
}

function answerTyped(userInput) {
  const q = levelQueue[levelPos];
  const normalized = normalizeAnswer(userInput);
  const isCorrect = q.acceptableAnswers.some(a => normalizeAnswer(a) === normalized);
  registerResult(isCorrect);
}

function advance(){
  levelPos++;

  if (levelPos >= levelQueue.length) {
    finishLevel();
    return;
  }

  loadQuestion();
}

function finishLevel(){
  const level = levelOrder[levelIdx];

  if (levelCorrect >= levelThreshold[level]) {

    confirmedLevel = level;

    if (levelIdx + 1 < levelOrder.length) {
      startLevel(levelIdx + 1);
    } else {
      finish();
    }

  } else {
    finish();
  }
}

function triggerIntervention() {
  overlay.classList.remove("hidden");

  teacherBox.style.display = "flex";
  actions.style.display = "none";

  continueBtn.classList.remove("slide-in-left", "shimmer");
  revealBtn.classList.remove("slide-in-right", "shimmer");
  continueBtn.style.opacity = "0";
  revealBtn.style.opacity = "0";

  teacherBox.classList.add("slow-bounce");

  setTimeout(() => {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(()=>{});
  }, 200);

  interventionAudio.onended = () => {
    teacherBox.classList.remove("slow-bounce");

    actions.style.display = "flex";

    setTimeout(() => {
      continueBtn.classList.add("slide-in-left", "shimmer");
    }, 200);

    setTimeout(() => {
      revealBtn.classList.add("slide-in-right", "shimmer");
    }, 900);
  };
}

continueBtn.onclick = () => {
  overlay.classList.add("hidden");
  wrongStreakInLevel = 0;
  advance();
};

revealBtn.onclick = () => {
  overlay.classList.add("hidden");
  finish();
};

function finish() {
  const level = confirmedLevel || "Pre-A0";

  sessionStorage.setItem("saybon_level", level);
  sessionStorage.setItem("saybon_next", "/reveal/");
  window.location.href = "/loader.html";
}

startLevel(0);