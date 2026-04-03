(() => {
  "use strict";

  // ==========================================
  // TEST MAP
  // ==========================================
  const TEST_MAP = {
    prim: "/features/delf/data/prim-placement.json"
  };

  // ==========================================
  // REAL FIREBASE CONFIG
  // ==========================================
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
    authDomain: "saybon-3e3c2.firebaseapp.com",
    projectId: "saybon-3e3c2",
    storageBucket: "saybon-3e3c2.firebasestorage.app",
    messagingSenderId: "75085012344",
    appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"
  };

  // ==========================================
  // DOM
  // ==========================================
  const titleEl = document.getElementById("title");
  const candidateCodeLineEl = document.getElementById("candidateCodeLine");
  const progressLabelEl = document.getElementById("progressLabel");
  const progressFillEl = document.getElementById("progressFill");
  const stageEl = document.getElementById("stage");
  const centerNoteEl = document.getElementById("centerNote");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  // ==========================================
  // STATE
  // ==========================================
  let testData = null;
  let questions = [];
  let currentIndex = 0;
  let answers = [];
  let candidateId = "";
  let mediaRecorder = null;
  let recordingChunks = [];
  let waveformInterval = null;

  // ==========================================
  // INIT
  // ==========================================
  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      setLoadingState("Loading test...");
      candidateId = getOrCreateCandidateId();
      candidateCodeLineEl.textContent = `Candidate ID: ${candidateId}`;

      const testKey = getTestKey();
      const testPath = TEST_MAP[testKey];

      if (!testPath) {
        throw new Error(`Unknown test key: ${testKey}`);
      }

      const response = await fetch(`${testPath}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not load test file: ${testPath}`);
      }

      testData = await response.json();

      if (!testData || !Array.isArray(testData.questions)) {
        throw new Error("Placement JSON is invalid.");
      }

      questions = testData.questions;

      if (!questions.length) {
        throw new Error("No questions found in placement JSON.");
      }

      titleEl.textContent = testData.title || "Placement Test";
      answers = new Array(questions.length).fill(null);

      bindNav();
      renderQuestion();
    } catch (err) {
      console.error("INIT ERROR:", err);
      renderError(err.message || "Failed to load test.");
    }
  }

  function bindNav() {
    nextBtn.onclick = async () => {
      if (!canProceed()) {
        centerNoteEl.textContent = "Choose or complete your answer, then continue.";
        return;
      }

      if (currentIndex < questions.length - 1) {
        currentIndex += 1;
        renderQuestion();
      } else {
        await finishTest();
      }
    };

    backBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderQuestion();
      }
    };
  }

  // ==========================================
  // RENDER QUESTION
  // ==========================================
  function renderQuestion() {
    stopWaveAnimation();
    stopRecorderIfNeeded();

    const q = questions[currentIndex];
    if (!q) return;

    stageEl.innerHTML = "";
    updateProgress();

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = (q.type || "question").toUpperCase();
    stageEl.appendChild(pill);

    if (q.passage) {
      const passage = document.createElement("div");
      passage.className = "passageBox";
      passage.textContent = q.passage;
      stageEl.appendChild(passage);
    }

    const question = document.createElement("h2");
    question.className = "questionText";
    question.textContent = q.question || "Question";
    stageEl.appendChild(question);

    if (q.type === "listening") {
      stageEl.appendChild(buildListeningBlock(q));
      stageEl.appendChild(buildOptionsBlock(q));
      centerNoteEl.textContent = "Listen, choose your answer, then continue.";
    }
    else if (q.type === "reading") {
      stageEl.appendChild(buildOptionsBlock(q));
      centerNoteEl.textContent = "Choose your answer, then continue.";
    }
    else if (q.type === "writing") {
      stageEl.appendChild(buildWritingBlock(q));
      centerNoteEl.textContent = "Write your answer, then continue.";
    }
    else if (q.type === "speaking") {
      stageEl.appendChild(buildSpeakingBlock(q));
      centerNoteEl.textContent = "Record your answer, then continue.";
    }

    backBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    nextBtn.textContent = currentIndex === questions.length - 1 ? "Finish" : "Next";
    nextBtn.classList.remove("hidden");
    backBtn.classList.remove("hidden");
  }

  // ==========================================
  // LISTENING
  // ==========================================
  function buildListeningBlock(q) {
    const wrap = document.createElement("div");
    wrap.className = "answerBox";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.style.width = "100%";
    audio.src = `${q.audio}?v=${Date.now()}`;

    const helper = document.createElement("div");
    helper.className = "helper";
    helper.textContent = "Play the audio, then answer the question.";

    wrap.appendChild(audio);
    wrap.appendChild(helper);
    return wrap;
  }

  // ==========================================
  // MCQ
  // ==========================================
  function buildOptionsBlock(q) {
    const grid = document.createElement("div");
    grid.className = "answerGrid";

    const letters = ["A", "B", "C", "D"];

    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${currentIndex}`;
      input.value = i;

      if (answers[currentIndex] === i) {
        input.checked = true;
      }

      input.addEventListener("change", () => {
        answers[currentIndex] = i;
      });

      const card = document.createElement("div");
      card.className = "optionCard";

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = letters[i] || "?";

      const text = document.createElement("div");
      text.textContent = opt;

      card.appendChild(badge);
      card.appendChild(text);

      label.appendChild(input);
      label.appendChild(card);
      grid.appendChild(label);
    });

    return grid;
  }

  // ==========================================
  // WRITING
  // ==========================================
  function buildWritingBlock(q) {
    const wrap = document.createElement("div");
    wrap.className = "answerBox";

    const textarea = document.createElement("textarea");
    textarea.placeholder = q.placeholder || "Type your answer here...";
    textarea.value = typeof answers[currentIndex] === "string" ? answers[currentIndex] : "";

    textarea.addEventListener("input", () => {
      answers[currentIndex] = textarea.value.trim();
    });

    wrap.appendChild(textarea);
    return wrap;
  }

  // ==========================================
  // SPEAKING
  // ==========================================
  function buildSpeakingBlock(q) {
    const wrap = document.createElement("div");
    wrap.className = "answerBox";

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "12px";
    controls.style.alignItems = "center";
    controls.style.marginBottom = "16px";

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn btnPrimary";
    startBtn.textContent = "Start Recording";

    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "btn btnMuted";
    stopBtn.textContent = "Stop";
    stopBtn.disabled = true;

    const replaceBtn = document.createElement("button");
    replaceBtn.type = "button";
    replaceBtn.className = "btn btnMuted";
    replaceBtn.textContent = "Replace Recording";
    replaceBtn.style.display = "none";

    const status = document.createElement("div");
    status.style.fontWeight = "600";
    status.style.color = "#356fdf";
    status.textContent = "Ready to record";

    controls.appendChild(startBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(replaceBtn);
    controls.appendChild(status);

    const waveWrap = document.createElement("div");
    waveWrap.style.display = "flex";
    waveWrap.style.alignItems = "flex-end";
    waveWrap.style.gap = "6px";
    waveWrap.style.height = "48px";
    waveWrap.style.marginBottom = "18px";

    const bars = [];
    for (let i = 0; i < 18; i++) {
      const bar = document.createElement("div");
      bar.style.width = "8px";
      bar.style.height = "10px";
      bar.style.borderRadius = "999px";
      bar.style.background = "#cfe0ff";
      bar.style.transition = "height .12s ease";
      bars.push(bar);
      waveWrap.appendChild(bar);
    }

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.style.width = "100%";
    audio.style.display = "none";

    const saved = answers[currentIndex];
    if (saved && saved.url) {
      audio.src = saved.url;
      audio.style.display = "block";
      replaceBtn.style.display = "inline-flex";
      status.textContent = "Recording saved";
    }

    startBtn.addEventListener("click", async () => {
      try {
        stopRecorderIfNeeded();
        recordingChunks = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordingChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordingChunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);

          answers[currentIndex] = {
            type: "speaking-recording",
            blob,
            url,
            mimeType: blob.type
          };

          audio.src = url;
          audio.style.display = "block";
          status.textContent = "Recording saved";
          replaceBtn.style.display = "inline-flex";
          startBtn.disabled = false;
          stopBtn.disabled = true;
          stopWaveAnimation();

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        status.textContent = "Recording...";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        replaceBtn.style.display = "none";
        startWaveAnimation(bars);

      } catch (err) {
        console.error("Mic error:", err);
        status.textContent = "Microphone access failed";
      }
    });

    stopBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    });

    replaceBtn.addEventListener("click", () => {
      answers[currentIndex] = null;
      audio.removeAttribute("src");
      audio.style.display = "none";
      replaceBtn.style.display = "none";
      status.textContent = "Ready to record";
      startBtn.disabled = false;
      stopBtn.disabled = true;
      stopWaveAnimation();
    });

    wrap.appendChild(controls);
    wrap.appendChild(waveWrap);
    wrap.appendChild(audio);

    return wrap;
  }

  // ==========================================
  // FINISH / SCORE
  // ==========================================
  async function finishTest() {
    try {
      const objectiveIndexes = questions
        .map((q, i) => ({ q, i }))
        .filter(item => item.q.type === "reading" || item.q.type === "listening");

      let objectiveCorrect = 0;

      objectiveIndexes.forEach(({ q, i }) => {
        if (typeof q.answer === "number" && answers[i] === q.answer) {
          objectiveCorrect += 1;
        }
      });

      const objectiveTotal = objectiveIndexes.length;
      const objectivePercent = objectiveTotal > 0
        ? Math.round((objectiveCorrect / objectiveTotal) * 100)
        : 0;

      const estimatedLevel = estimatePrimLevel(objectivePercent, answers);

      const payload = {
        candidateId,
        testKey: getTestKey(),
        title: testData?.title || "Placement Test",
        answers: serializeAnswers(answers),
        objectiveCorrect,
        objectiveTotal,
        objectivePercent,
        estimatedLevel,
        completedAt: new Date().toISOString()
      };

      await saveResult(payload);

      renderResult({
        candidateId,
        objectiveCorrect,
        objectiveTotal,
        objectivePercent,
        estimatedLevel
      });
    } catch (err) {
      console.error("FINISH ERROR:", err);
      renderError("Test finished, but result processing failed.");
    }
  }

  function estimatePrimLevel(objectivePercent, answers) {
    const writingResponses = answers.filter(a => typeof a === "string" && a.trim().length > 0);
    const speakingResponses = answers.filter(a => a && typeof a === "object" && a.type === "speaking-recording");

    const hasWriting = writingResponses.length > 0;
    const hasSpeaking = speakingResponses.length > 0;

    if (objectivePercent <= 20) return "Pre-A1";
    if (objectivePercent <= 45) return (hasWriting || hasSpeaking) ? "A1.1" : "Pre-A1";
    if (objectivePercent <= 70) return (hasWriting && hasSpeaking) ? "A1" : "A1.1";
    return (hasWriting && hasSpeaking) ? "A2" : "A1";
  }

  function renderResult(result) {
    updateProgress(true);

    stageEl.innerHTML = `
      <div class="pill">Completed</div>
      <h2 class="questionText">Placement complete</h2>
      <div class="resultBox">
        <p><strong>Candidate ID:</strong> ${escapeHtml(result.candidateId)}</p>
        <p><strong>Estimated Level:</strong> ${escapeHtml(result.estimatedLevel)}</p>
        <p><strong>Objective Score:</strong> ${result.objectiveCorrect} / ${result.objectiveTotal}</p>
        <p><strong>Objective Percent:</strong> ${result.objectivePercent}%</p>
      </div>
      <div class="helper">Your result has been saved.</div>
    `;

    centerNoteEl.textContent = "Placement complete.";
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");
  }

  // ==========================================
  // FIREBASE SAVE
  // ==========================================
  async function saveResult(payload) {
    try {
      if (!window.firebase) return;

      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }

      const db = firebase.firestore();
      await db.collection("delfPlacementResults").add(payload);
    } catch (err) {
      console.warn("Could not save placement result:", err);
    }
  }

  function serializeAnswers(rawAnswers) {
    return rawAnswers.map(a => {
      if (a && typeof a === "object" && a.type === "speaking-recording") {
        return {
          type: a.type,
          mimeType: a.mimeType || "audio/webm",
          note: "Browser audio recording captured."
        };
      }
      return a;
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================
  function updateProgress(forceComplete = false) {
    const total = questions.length || 0;
    const current = forceComplete ? total : currentIndex + 1;
    const pct = total ? Math.round((current / total) * 100) : 0;

    progressLabelEl.textContent = `${current} / ${total}`;
    progressFillEl.style.width = `${pct}%`;
  }

  function canProceed() {
    const q = questions[currentIndex];
    const a = answers[currentIndex];

    if (!q) return false;

    if (q.type === "reading" || q.type === "listening") {
      return typeof a === "number";
    }

    if (q.type === "writing") {
      return typeof a === "string" && a.trim().length > 0;
    }

    if (q.type === "speaking") {
      return !!(a && typeof a === "object" && a.type === "speaking-recording");
    }

    return false;
  }

  function getTestKey() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("test") || "prim").toLowerCase();
  }

  function getOrCreateCandidateId() {
    const params = new URLSearchParams(window.location.search);
    const existing = params.get("candidate");
    if (existing) return existing;

    return `C-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  function setLoadingState(text) {
    titleEl.textContent = text;
    centerNoteEl.textContent = text;
    progressLabelEl.textContent = "0 / 0";
    progressFillEl.style.width = "0%";
  }

  function renderError(message) {
    titleEl.textContent = "Test unavailable";
    stageEl.innerHTML = `
      <div class="errorBox">
        <strong>REAL ERROR:</strong><br><br>
        ${escapeHtml(message)}
      </div>
    `;
    centerNoteEl.textContent = "Could not load test.";
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");
  }

  function startWaveAnimation(bars) {
    stopWaveAnimation();
    waveformInterval = setInterval(() => {
      bars.forEach(bar => {
        const h = 10 + Math.floor(Math.random() * 36);
        bar.style.height = `${h}px`;
        bar.style.background = h > 28 ? "#4f8cff" : "#cfe0ff";
      });
    }, 120);
  }

  function stopWaveAnimation() {
    if (waveformInterval) {
      clearInterval(waveformInterval);
      waveformInterval = null;
    }
  }

  function stopRecorderIfNeeded() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
