const firebaseConfig = {
  apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
  authDomain: "saybon-3e3c2.firebaseapp.com",
  projectId: "saybon-3e3c2",
  storageBucket: "saybon-3e3c2.firebasestorage.app",
  messagingSenderId: "75085012344",
  appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const params = new URLSearchParams(window.location.search);
const testType = params.get("test") || "prim";

const titleEl = document.getElementById("title");
const candidateCodeLineEl = document.getElementById("candidateCodeLine");
const progressLabelEl = document.getElementById("progressLabel");
const progressFillEl = document.getElementById("progressFill");
const stageEl = document.getElementById("stage");
const centerNoteEl = document.getElementById("centerNote");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const navEl = document.getElementById("nav");

let testData = null;
let currentIndex = 0;
let answers = {};
let candidateCode = "";
let submitting = false;

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateCandidateCode() {
  return "CAND-" + Math.floor(100000 + Math.random() * 900000);
}

function getQuestionCount() {
  return Array.isArray(testData?.questions) ? testData.questions.length : 0;
}

function updateProgress() {
  const total = getQuestionCount();
  const shown = total === 0 ? 0 : currentIndex + 1;
  progressLabelEl.innerText = `${shown} / ${total}`;
  progressFillEl.style.width = total > 0 ? `${(shown / total) * 100}%` : "0%";
}

function setCenterNote(text) {
  centerNoteEl.innerText = text;
}

async function ensureCandidateRecord() {
  let stored = sessionStorage.getItem("saybon_candidate_code");
  if (!stored) {
    stored = generateCandidateCode();
    sessionStorage.setItem("saybon_candidate_code", stored);
  }

  candidateCode = stored;
  candidateCodeLineEl.innerText = `Candidate Code: ${candidateCode}`;

  await db.collection("placementCandidates").doc(candidateCode).set({
    candidateCode,
    testType,
    status: "in_progress",
    startedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function loadTestData() {
  const url = `/features/delf/tests/${testType}.json?ts=${Date.now()}`;
  const res = await fetch(url);
  const raw = await res.text();

  if (!res.ok) {
    throw new Error(`Could not load test file.\n\nURL: ${url}\nStatus: ${res.status}\n\nResponse:\n${raw}`);
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in test file.\n\nURL: ${url}\n\nResponse:\n${raw}`);
  }
}

function saveCurrentAnswer() {
  const q = testData?.questions?.[currentIndex];
  if (!q) return;

  if (q.type === "reading" || q.type === "listening") {
    const selected = document.querySelector(`input[name="question-${currentIndex}"]:checked`);
    if (selected) {
      answers[currentIndex] = selected.value;
    }
  }

  if (q.type === "writing" || q.type === "speaking") {
    const textArea = document.getElementById("textAnswer");
    if (textArea) {
      answers[currentIndex] = textArea.value.trim();
    }
  }
}

function getObjectiveScore() {
  let score = 0;
  let total = 0;

  testData.questions.forEach((q, index) => {
    if ((q.type === "reading" || q.type === "listening") && typeof q.answer !== "undefined") {
      total += 1;
      if (String(answers[index] ?? "") === String(q.answer)) {
        score += 1;
      }
    }
  });

  return { score, total };
}

function estimateLevel(percent) {
  if (percent >= 85) return "A2";
  if (percent >= 65) return "A1+";
  if (percent >= 40) return "A1";
  return "A0";
}

function renderQuestion() {
  const q = testData.questions[currentIndex];
  if (!q) return;

  titleEl.innerText = testData.title || "Placement Test";
  updateProgress();

  backBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
  nextBtn.innerText = currentIndex === testData.questions.length - 1 ? "Finish" : "Next";

  let html = `<div class="pill">${esc(q.type || "question")}</div>`;
  html += `<h2 class="questionText">${esc(q.question || "Untitled question")}</h2>`;

  if (q.passage) {
    html += `<div class="passageBox">${esc(q.passage)}</div>`;
  }

  if ((q.type === "reading" || q.type === "listening") && Array.isArray(q.options)) {
    html += `<div class="answerGrid">`;

    q.options.forEach((option, i) => {
      const letters = ["A", "B", "C", "D", "E", "F"];
      const checked = String(answers[currentIndex] ?? "") === String(option) ? "checked" : "";

      html += `
        <label class="option">
          <input type="radio" name="question-${currentIndex}" value="${esc(option)}" ${checked}>
          <div class="optionCard">
            <div class="badge">${letters[i] || i + 1}</div>
            <div>${esc(option)}</div>
          </div>
        </label>
      `;
    });

    html += `</div>`;
    setCenterNote("Choose an answer, then continue.");
  }

  if (q.type === "writing" || q.type === "speaking") {
    const placeholder = q.type === "writing"
      ? "Write your answer here..."
      : "Type the speaking response here for now...";

    const helper = q.type === "writing"
      ? "Write clearly and naturally."
      : "Temporary simple speaking capture for now.";

    html += `
      <div class="answerBox">
        <textarea id="textAnswer" placeholder="${esc(placeholder)}">${esc(answers[currentIndex] || "")}</textarea>
        <div class="helper">${esc(helper)}</div>
      </div>
    `;

    setCenterNote(q.type === "writing"
      ? "Write your answer, then continue."
      : "Enter the speaking response, then continue.");
  }

  stageEl.innerHTML = html;

  const radioButtons = document.querySelectorAll(`input[name="question-${currentIndex}"]`);
  radioButtons.forEach(radio => {
    radio.addEventListener("change", saveCurrentAnswer);
  });

  const textArea = document.getElementById("textAnswer");
  if (textArea) {
    textArea.addEventListener("input", saveCurrentAnswer);
  }
}

function renderError(message) {
  titleEl.innerText = "Test unavailable";
  stageEl.innerHTML = `
    <div class="errorBox">
      <div class="errorTitle">We couldn't load this test.</div>
      <div class="errorText">${esc(message)}</div>
    </div>
  `;
  navEl.classList.add("hidden");
  progressLabelEl.innerText = "0 / 0";
  progressFillEl.style.width = "0%";
}

function renderResult(attemptId, objectiveScore, objectiveTotal, percent, level) {
  titleEl.innerText = testData.title || "Placement Test";
  stageEl.innerHTML = `
    <div class="resultBox">
      <div class="resultTitle">Placement complete</div>
      <div class="resultLine"><strong>Candidate Code:</strong> ${esc(candidateCode)}</div>
      <div class="resultLine"><strong>Attempt ID:</strong> ${esc(attemptId)}</div>
      <div class="resultLine"><strong>Score:</strong> ${esc(objectiveScore)} / ${esc(objectiveTotal)}</div>
      <div class="resultLine"><strong>Percent:</strong> ${esc(percent)}%</div>
      <div class="resultLine"><strong>Estimated Level:</strong> ${esc(level)}</div>
    </div>
    <div class="resultBox">
      <div class="resultLine"><strong>Next step:</strong> Keep this candidate code. It remains the learner's DELF ID throughout the preparation journey.</div>
    </div>
  `;

  backBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  setCenterNote("Placement submitted successfully.");
  progressFillEl.style.width = "100%";
  progressLabelEl.innerText = `${getQuestionCount()} / ${getQuestionCount()}`;
}

async function submitAttempt() {
  if (submitting) return;
  submitting = true;

  saveCurrentAnswer();
  nextBtn.disabled = true;
  setCenterNote("Submitting and saving your placement result...");

  try {
    const { score, total } = getObjectiveScore();
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const level = estimateLevel(percent);
    const attemptId = `${candidateCode}-${Date.now()}`;

    await db.collection("placementAttempts").doc(attemptId).set({
      attemptId,
      candidateCode,
      testType,
      title: testData.title || "Placement Test",
      answers,
      objectiveScore: score,
      objectiveTotal: total,
      objectivePercent: percent,
      estimatedLevel: level,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("placementCandidates").doc(candidateCode).set({
      candidateCode,
      testType,
      status: "completed",
      latestAttemptId: attemptId,
      latestLevel: level,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    renderResult(attemptId, score, total, percent, level);
  } catch (err) {
    submitting = false;
    nextBtn.disabled = false;
    setCenterNote("Submission failed. Please try again.");
    alert("Submission failed: " + (err.message || "Unknown error"));
    console.error(err);
  }
}

function goNext() {
  saveCurrentAnswer();

  if (currentIndex === testData.questions.length - 1) {
    submitAttempt();
    return;
  }

  currentIndex += 1;
  renderQuestion();
}

function goBack() {
  if (currentIndex <= 0) return;
  saveCurrentAnswer();
  currentIndex -= 1;
  renderQuestion();
}

backBtn.addEventListener("click", goBack);
nextBtn.addEventListener("click", goNext);

async function init() {
  try {
    setCenterNote("Preparing your DELF placement test...");
    await ensureCandidateRecord();
    testData = await loadTestData();

    if (!Array.isArray(testData.questions) || testData.questions.length === 0) {
      throw new Error("This test contains no questions.");
    }

    renderQuestion();
  } catch (err) {
    console.error(err);
    renderError(err.message || String(err));
  }
}

init();
