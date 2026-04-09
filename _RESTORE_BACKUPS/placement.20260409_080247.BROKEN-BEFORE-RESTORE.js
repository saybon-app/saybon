let currentQuestionIndex = 0;
let score = 0;
let wrongStreak = 0;
let interventionShown = false;
let placementQuestions = [];

const questionPrompt = document.getElementById("questionPrompt");
const mediaArea = document.getElementById("mediaArea");
const optionsContainer = document.getElementById("options");
const interventionOverlay = document.getElementById("interventionOverlay");
const interventionText = document.getElementById("interventionText");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");
const interventionAudio = document.getElementById("interventionAudio");

async function loadQuestions() {
  try {
    const res = await fetch("/placement/questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load placement questions");
    placementQuestions = await res.json();

    if (!Array.isArray(placementQuestions) || placementQuestions.length === 0) {
      throw new Error("Questions file is empty or invalid");
    }

    renderQuestion();
  } catch (err) {
    console.error("Placement load error:", err);
    if (questionPrompt) questionPrompt.textContent = "Could not load placement test.";
    if (optionsContainer) optionsContainer.innerHTML = "";
  }
}

function clearMedia() {
  if (!mediaArea) return;
  mediaArea.innerHTML = "";
}

function renderQuestion() {
  try {
    if (!placementQuestions[currentQuestionIndex]) {
      finishPlacement();
      return;
    }

    const q = placementQuestions[currentQuestionIndex];

    if (!questionPrompt || !optionsContainer) {
      console.error("Missing required placement DOM");
      return;
    }

    questionPrompt.textContent = q.prompt || "Choose the correct answer";
    optionsContainer.innerHTML = "";
    clearMedia();

    // Audio support
    if (q.audio) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = q.audio;
      audio.style.marginBottom = "24px";
      mediaArea.appendChild(audio);
    }

    // Image support
    if (q.image) {
      const img = document.createElement("img");
      img.src = q.image;
      img.alt = "Question image";
      img.style.maxWidth = "260px";
      img.style.display = "block";
      img.style.margin = "0 auto 24px";
      img.style.borderRadius = "16px";
      mediaArea.appendChild(img);
    }

    // Text support
    if (q.text) {
      const textBlock = document.createElement("div");
      textBlock.textContent = q.text;
      textBlock.style.marginBottom = "24px";
      textBlock.style.fontSize = "1.1rem";
      textBlock.style.lineHeight = "1.6";
      textBlock.style.textAlign = "center";
      mediaArea.appendChild(textBlock);
    }

    const opts = Array.isArray(q.options) ? q.options : [];

    if (opts.length === 0) {
      console.warn("Question has no options:", q);
      const fallback = document.createElement("button");
      fallback.className = "answer-btn";
      fallback.textContent = "Continue";
      fallback.onclick = () => {
        currentQuestionIndex++;
        renderQuestion();
      };
      optionsContainer.appendChild(fallback);
      return;
    }

    opts.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = option;
      btn.onclick = () => handleAnswer(index);
      optionsContainer.appendChild(btn);
    });

  } catch (err) {
    console.error("Render question error:", err);
    finishPlacement();
  }
}

function handleAnswer(selectedIndex) {
  try {
    const q = placementQuestions[currentQuestionIndex];
    if (!q) {
      finishPlacement();
      return;
    }

    const correct = Number(q.correct);

    if (selectedIndex === correct) {
      score++;
      wrongStreak = 0;
    } else {
      wrongStreak++;
    }

    currentQuestionIndex++;

    if (wrongStreak >= 3 && !interventionShown) {
      showIntervention();
      return;
    }

    renderQuestion();
  } catch (err) {
    console.error("Handle answer error:", err);
    finishPlacement();
  }
}

function showIntervention() {
  interventionShown = true;

  if (interventionText) {
    interventionText.textContent =
      "You may need a gentler starting point. We can still help you build up confidently.";
  }

  if (interventionOverlay) {
    interventionOverlay.classList.remove("hidden");
  }

  if (interventionAudio) {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(() => {});
  }
}

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    if (interventionOverlay) {
      interventionOverlay.classList.add("hidden");
    }
    wrongStreak = 0;
    renderQuestion();
  });
}

if (revealBtn) {
  revealBtn.addEventListener("click", () => {
    finishPlacement();
  });
}

function finishPlacement() {
  const total = placementQuestions.length || 1;
  const ratio = score / total;

  let level = "A1";
  if (ratio >= 0.8) level = "B1";
  else if (ratio >= 0.6) level = "A2";
  else level = "A1";

  sessionStorage.setItem("saybon_level", level);
  sessionStorage.setItem("saybon_next", "/reveal/");
  window.location.href = "/loader.html";
}

loadQuestions();
