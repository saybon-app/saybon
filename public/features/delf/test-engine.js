const stage = document.getElementById("stage");
const titleEl = document.getElementById("title");
const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");
const centerNote = document.getElementById("centerNote");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const candidateLine = document.getElementById("candidateCodeLine");

let test = null;
let index = 0;
let answers = [];
let candidateId = "C-" + Math.floor(100000 + Math.random() * 900000);

let recorder = null;
let chunks = [];
let currentStream = null;
let waveformInterval = null;

// ==========================================
// BOOTSTRAP
// ==========================================
(async function bootstrap() {
  try {
    const params = new URLSearchParams(location.search);
    const slug = params.get("test") || "prim";

    titleEl.textContent = "Loading test...";
    candidateLine.textContent = `Candidate ID: ${candidateId}`;
    centerNote.textContent = "Loading test...";

    const res = await fetch(`/features/delf/tests/${slug}.json?v=${Date.now()}`, {
      cache: "no-store"
    });

    if (!res.ok) throw new Error(`Could not load test file (${res.status})`);

    const raw = await res.text();
    test = JSON.parse(raw);

    if (!test || !Array.isArray(test.questions) || !test.questions.length) {
      throw new Error("Test file has no questions.");
    }

    titleEl.textContent = test.title || "Placement Test";
    candidateLine.textContent = `Candidate ID: ${candidateId}`;

    answers = new Array(test.questions.length).fill(null);

    bindNav();
    render();

  } catch (err) {
    console.error("BOOTSTRAP ERROR:", err);
    titleEl.textContent = "Test unavailable";
    centerNote.textContent = "Failed to load test.";

    stage.innerHTML = `
      <div class="errorBox" style="background:#fff5f7;border:1px solid #f2c7d0;color:#8a2d3b;">
        <h3 style="margin-top:0;">We couldn’t load this test.</h3>
        <p style="margin-bottom:0;"><strong>REAL ERROR:</strong><br>${escapeHtml(String(err.message || err))}</p>
      </div>
    `;
  }
})();

// ==========================================
// NAV
// ==========================================
function bindNav() {
  nextBtn.onclick = () => {
    saveCurrentAnswer();

    if (!canProceed()) return;

    if (index < test.questions.length - 1) {
      index++;
      render();
    } else {
      finish();
    }
  };

  backBtn.onclick = () => {
    saveCurrentAnswer();
    if (index > 0) {
      index--;
      render();
    }
  };
}

function canProceed() {
  const q = test.questions[index];
  const current = answers[index];

  if (q.type === "reading" || q.type === "listening") {
    return current !== null && current !== undefined;
  }

  if (q.type === "writing") {
    return typeof current === "string" && current.trim().length > 0;
  }

  if (q.type === "speaking") {
    return !!current;
  }

  return true;
}

// ==========================================
// RENDER
// ==========================================
function render() {
  stopWaveform();
  const q = test.questions[index];

  progressLabel.textContent = `${index + 1} / ${test.questions.length}`;
  progressFill.style.width = `${((index + 1) / test.questions.length) * 100}%`;

  backBtn.style.visibility = index === 0 ? "hidden" : "visible";
  nextBtn.textContent = index === test.questions.length - 1 ? "Finish" : "Next";

  if (q.type === "reading") renderChoiceQuestion(q, "READING");
  else if (q.type === "listening") renderListeningQuestion(q);
  else if (q.type === "writing") renderWritingQuestion(q);
  else if (q.type === "speaking") renderSpeakingQuestion(q);
  else renderUnknown(q);
}

// ==========================================
// QUESTION TYPES
// ==========================================
function renderChoiceQuestion(q, label) {
  centerNote.textContent = "Choose an answer, then continue.";

  stage.innerHTML = `
    <div class="pill">${label}</div>
    <h2 class="questionText">${escapeHtml(q.question)}</h2>

    <div class="answerGrid">
      ${q.options.map((opt, i) => {
        const checked = answers[index] === i ? "checked" : "";
        const letter = ["A", "B", "C", "D"][i] || (i + 1);
        return `
          <label class="option">
            <input type="radio" name="choice" value="${i}" ${checked}>
            <div class="optionCard">
              <div class="badge">${letter}</div>
              <div>${escapeHtml(opt)}</div>
            </div>
          </label>
        `;
      }).join("")}
    </div>
  `;

  stage.querySelectorAll('input[name="choice"]').forEach(el => {
    el.addEventListener("change", e => {
      answers[index] = Number(e.target.value);
    });
  });
}

function renderListeningQuestion(q) {
  centerNote.textContent = "Listen carefully, then choose the correct answer.";

  stage.innerHTML = `
    <div class="pill">LISTENING</div>
    <h2 class="questionText">${escapeHtml(q.question)}</h2>

    <div class="passageBox">
      <audio controls preload="metadata" style="width:100%;">
        <source src="${escapeHtml(q.audio || "")}" type="audio/mpeg">
        Your browser does not support audio playback.
      </audio>
    </div>

    <div class="answerGrid">
      ${q.options.map((opt, i) => {
        const checked = answers[index] === i ? "checked" : "";
        const letter = ["A", "B", "C", "D"][i] || (i + 1);
        return `
          <label class="option">
            <input type="radio" name="choice" value="${i}" ${checked}>
            <div class="optionCard">
              <div class="badge">${letter}</div>
              <div>${escapeHtml(opt)}</div>
            </div>
          </label>
        `;
      }).join("")}
    </div>
  `;

  stage.querySelectorAll('input[name="choice"]').forEach(el => {
    el.addEventListener("change", e => {
      answers[index] = Number(e.target.value);
    });
  });
}

function renderWritingQuestion(q) {
  centerNote.textContent = "Write your answer, then continue.";

  const existing = typeof answers[index] === "string" ? answers[index] : "";

  stage.innerHTML = `
    <div class="pill">WRITING</div>
    <h2 class="questionText">${escapeHtml(q.question)}</h2>

    <div class="answerBox">
      <textarea id="writingInput" placeholder="${escapeHtml(q.placeholder || "Type your answer here...")}">${escapeHtml(existing)}</textarea>
      <div class="helper">Write naturally in French.</div>
    </div>
  `;
}

function renderSpeakingQuestion(q) {
  centerNote.textContent = "Record your answer, replay it, or replace it before continuing.";

  const existing = answers[index];
  const existingUrl = existing && existing.url ? existing.url : "";

  stage.innerHTML = `
    <div class="pill">SPEAKING</div>
    <h2 class="questionText">${escapeHtml(q.question)}</h2>

    <div class="answerBox" style="padding:22px;">
      <div id="recTop" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
        <div id="recStatus" style="font-weight:700;color:#356fdf;">Ready to record</div>
        <div id="recHint" style="font-size:14px;color:#6c7b90;">Speak clearly and naturally.</div>
      </div>

      <div id="waveWrap" style="
        display:flex;
        align-items:flex-end;
        gap:6px;
        height:68px;
        padding:16px 14px;
        border:1px solid #dbe6f3;
        border-radius:18px;
        background:linear-gradient(180deg,#f9fbff,#f2f7ff);
        margin-bottom:18px;
        overflow:hidden;
      ">
        ${Array.from({length: 28}).map((_, i) => `
          <div class="waveBar" data-i="${i}" style="
            width:8px;
            height:12px;
            border-radius:999px;
            background:linear-gradient(180deg,#8db7ff,#4f8cff);
            opacity:.45;
            transition:height .14s ease, opacity .14s ease, transform .14s ease;
          "></div>
        `).join("")}
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
        <button id="startRecBtn" class="btn btnPrimary" type="button">Start Recording</button>
        <button id="stopRecBtn" class="btn btnMuted" type="button" disabled>Stop</button>
        <button id="replaceRecBtn" class="btn btnMuted" type="button" ${existingUrl ? "" : "disabled"}>Replace Recording</button>
      </div>

      <div id="playbackWrap" class="${existingUrl ? "" : "hidden"}">
        <audio id="playbackAudio" controls style="width:100%;" ${existingUrl ? `src="${existingUrl}"` : ""}></audio>
        <div class="helper" style="margin-top:10px;">You can replay this or replace it with a new recording.</div>
      </div>
    </div>
  `;

  const startBtn = document.getElementById("startRecBtn");
  const stopBtn = document.getElementById("stopRecBtn");
  const replaceBtn = document.getElementById("replaceRecBtn");

  startBtn.onclick = startRecording;
  stopBtn.onclick = stopRecording;
  replaceBtn.onclick = replaceRecording;
}

function renderUnknown(q) {
  centerNote.textContent = "Unsupported question type.";
  stage.innerHTML = `
    <div class="errorBox">
      <h3 style="margin-top:0;">Unsupported question type</h3>
      <p style="margin-bottom:0;">Type: <strong>${escapeHtml(q.type || "unknown")}</strong></p>
    </div>
  `;
}

// ==========================================
// SAVE CURRENT
// ==========================================
function saveCurrentAnswer() {
  if (!test) return;
  const q = test.questions[index];
  if (!q) return;

  if (q.type === "writing") {
    const input = document.getElementById("writingInput");
    if (input) answers[index] = input.value.trim();
  }
}

// ==========================================
// SPEAKING LOGIC
// ==========================================
async function startRecording() {
  try {
    const status = document.getElementById("recStatus");
    const startBtn = document.getElementById("startRecBtn");
    const stopBtn = document.getElementById("stopRecBtn");
    const replaceBtn = document.getElementById("replaceRecBtn");
    const playbackWrap = document.getElementById("playbackWrap");
    const playbackAudio = document.getElementById("playbackAudio");

    if (playbackAudio) playbackAudio.pause();
    if (playbackWrap) playbackWrap.classList.add("hidden");

    chunks = [];
    currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(currentStream);

    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      answers[index] = { blob, url };

      const playbackWrap2 = document.getElementById("playbackWrap");
      const playbackAudio2 = document.getElementById("playbackAudio");
      const replaceBtn2 = document.getElementById("replaceRecBtn");
      const status2 = document.getElementById("recStatus");
      const startBtn2 = document.getElementById("startRecBtn");
      const stopBtn2 = document.getElementById("stopRecBtn");

      if (playbackAudio2) playbackAudio2.src = url;
      if (playbackWrap2) playbackWrap2.classList.remove("hidden");
      if (replaceBtn2) replaceBtn2.disabled = false;
      if (status2) status2.textContent = "Recording saved";
      if (startBtn2) startBtn2.disabled = false;
      if (stopBtn2) stopBtn2.disabled = true;

      stopWaveform();

      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
      }
    };

    recorder.start();

    if (status) status.textContent = "Recording...";
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (replaceBtn) replaceBtn.disabled = true;

    startWaveform();

  } catch (err) {
    console.error("Recording failed:", err);
    const status = document.getElementById("recStatus");
    if (status) status.textContent = "Microphone access failed";
    alert("Microphone access was blocked or unavailable.");
  }
}

function stopRecording() {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
  }
}

function replaceRecording() {
  answers[index] = null;

  const playbackWrap = document.getElementById("playbackWrap");
  const playbackAudio = document.getElementById("playbackAudio");
  const replaceBtn = document.getElementById("replaceRecBtn");
  const status = document.getElementById("recStatus");

  if (playbackAudio) {
    playbackAudio.pause();
    playbackAudio.removeAttribute("src");
    playbackAudio.load();
  }

  if (playbackWrap) playbackWrap.classList.add("hidden");
  if (replaceBtn) replaceBtn.disabled = true;
  if (status) status.textContent = "Ready to record";

  stopWaveform();
  resetWaveform();
}

// ==========================================
// WAVEFORM
// ==========================================
function startWaveform() {
  stopWaveform();
  const bars = [...document.querySelectorAll(".waveBar")];
  if (!bars.length) return;

  waveformInterval = setInterval(() => {
    bars.forEach(bar => {
      const h = 10 + Math.floor(Math.random() * 42);
      const o = 0.45 + Math.random() * 0.55;
      bar.style.height = `${h}px`;
      bar.style.opacity = `${o}`;
      bar.style.transform = `translateY(${Math.random() > 0.5 ? "-1px" : "0"})`;
    });
  }, 120);
}

function stopWaveform() {
  if (waveformInterval) {
    clearInterval(waveformInterval);
    waveformInterval = null;
  }
  resetWaveform();
}

function resetWaveform() {
  document.querySelectorAll(".waveBar").forEach(bar => {
    bar.style.height = "12px";
    bar.style.opacity = ".45";
    bar.style.transform = "translateY(0)";
  });
}

// ==========================================
// FINISH
// ==========================================
function finish() {
  saveCurrentAnswer();

  let objectiveScore = 0;
  let objectiveTotal = 0;

  test.questions.forEach((q, i) => {
    if (typeof q.answer === "number") {
      objectiveTotal++;
      if (answers[i] === q.answer) objectiveScore++;
    }
  });

  const percent = objectiveTotal ? Math.round((objectiveScore / objectiveTotal) * 100) : 0;
  const estimated = estimateLevel(percent);

  centerNote.textContent = "Placement complete.";
  nextBtn.classList.add("hidden");
  backBtn.classList.add("hidden");

  stage.innerHTML = `
    <div class="pill">COMPLETED</div>
    <h2 class="questionText">Placement complete</h2>

    <div class="resultBox">
      <div style="display:grid;gap:10px;font-size:18px;">
        <div><strong>Candidate ID:</strong> ${escapeHtml(candidateId)}</div>
        <div><strong>Estimated Level:</strong> ${escapeHtml(estimated)}</div>
        <div><strong>Objective Score:</strong> ${objectiveScore} / ${objectiveTotal}</div>
        <div><strong>Objective Percent:</strong> ${percent}%</div>
      </div>
    </div>

    <div class="helper" style="font-size:15px;">
      Your objective score reflects only auto-marked questions. Writing and speaking should be reviewed separately.
    </div>
  `;
}

function estimateLevel(percent) {
  if (percent >= 85) return "A2";
  if (percent >= 65) return "A1";
  if (percent >= 40) return "Pre-A1";
  return "Starter";
}

// ==========================================
// UTILS
// ==========================================
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
