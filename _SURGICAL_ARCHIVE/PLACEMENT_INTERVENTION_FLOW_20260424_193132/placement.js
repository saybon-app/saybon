console.log("SayBon DELF-style General Placement loaded");

/* ==================================================
   SAYBON DELF-STYLE 15-QUESTION PLACEMENT ENGINE
   LOCKED QUESTION SET
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
    level: "A2"
  },
  {
    id: 10,
    type: "mcq",
    category: "Reading",
    prompt: "Lis le texte et réponds à la question.",
    text: "Je suis arrivé en retard parce que le bus que je prends d’habitude était déjà parti quand je suis arrivé à l’arrêt.",
    readingQuestion: "Pourquoi la personne était-elle en retard ?",
    options: [
      "Parce qu’elle n’a pas trouvé l’arrêt de bus.",
      "Parce que son bus habituel était déjà parti.",
      "Parce qu’elle a changé d’itinéraire.",
      "Parce que le bus était plus lent que d’habitude."
    ],
    correct: 1,
    level: "B1"
  },
  {
    id: 11,
    type: "mcq",
    category: "Understanding",
    prompt: "Choisis la réponse la plus naturelle : « Pourquoi apprends-tu le français ? »",
    options: [
      "J’apprends le français depuis deux ans.",
      "J’apprends le français parce que cela peut m’aider dans mes études et mes voyages.",
      "J’apprends le français avec mon professeur le mercredi.",
      "J’apprends le français quand j’ai du temps libre."
    ],
    correct: 1,
    level: "B1"
  },
  {
    id: 12,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Pourquoi est-ce important d’apprendre une langue ?",
    level: "B1"
  },
  {
    id: 13,
    type: "mcq",
    category: "Reading",
    prompt: "Lis le texte et réponds à la question.",
    text: "De plus en plus de jeunes préfèrent apprendre en ligne. Cette méthode leur permet d’organiser leur temps plus librement, mais elle demande aussi beaucoup d’autonomie et de discipline.",
    readingQuestion: "Quelle idée résume le mieux le texte ?",
    options: [
      "L’apprentissage en ligne est pratique, mais il exige une grande responsabilité personnelle.",
      "L’apprentissage en ligne est toujours plus facile que l’apprentissage en classe.",
      "Les jeunes choisissent l’apprentissage en ligne uniquement parce qu’ils n’aiment pas les écoles.",
      "Les cours en ligne permettent d’apprendre sans effort ni organisation."
    ],
    correct: 0,
    level: "B2"
  },
  {
    id: 14,
    type: "writing",
    category: "Writing",
    prompt: "Écris une courte réponse en français.",
    writingPrompt: "Penses-tu que l’apprentissage en ligne est meilleur que l’apprentissage en classe ?",
    level: "B2"
  },
  {
    id: 15,
    type: "speaking",
    category: "Speaking",
    prompt: "Answer in French.",
    speakingPrompt: "Selon toi, quels sont les avantages et les inconvénients des réseaux sociaux ?",
    level: "B2"
  }
];

let currentQuestion = 0;
let score = 0;
let wrongAnswers = 0;
let interventionShown = false;

let spokenAnswers = [];
let writtenAnswers = [];
let responses = [];

let mediaRecorder = null;
let recordedChunks = [];
let currentAudioBlob = null;
let currentAudioUrl = null;
let currentStream = null;
let audioContext = null;
let analyser = null;
let animationId = null;

const app = document.getElementById("app");
const questionCategory = document.getElementById("questionCategory");
const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const mediaArea = document.getElementById("mediaArea");
const answers = document.getElementById("answers");
const progressBar = document.getElementById("progressBar");

const intervention = document.getElementById("intervention");
const interventionAudio = document.getElementById("interventionAudio");
const continueBtn = document.getElementById("continueBtn");
const revealBtn = document.getElementById("revealBtn");

function resetMediaRecorder() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(() => {});
  }

  currentStream = null;
  audioContext = null;
  analyser = null;
  mediaRecorder = null;
  recordedChunks = [];
}

function clearScreen() {
  resetMediaRecorder();
  mediaArea.innerHTML = "";
  answers.innerHTML = "";
  currentAudioBlob = null;
  currentAudioUrl = null;
}

function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressBar.style.width = `${percent}%`;
}

function renderQuestion() {
  const q = questions[currentQuestion];

  if (!q) {
    finishPlacement();
    return;
  }

  clearScreen();
  updateProgress();

  questionCategory.textContent = q.category || "Question";
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  questionText.textContent = q.prompt || "";

  if (q.audio) renderAudio(q.audio);
  if (q.image) renderImage(q.image);
  if (q.text) renderReading(q);

  if (q.type === "mcq") renderMcq(q);
  if (q.type === "writing") renderWriting(q);
  if (q.type === "speaking") renderSpeaking(q);
}

function renderAudio(src) {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "auto";
  audio.src = src;
  audio.className = "placement-audio";
  mediaArea.appendChild(audio);
}

function renderImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Question image";
  img.className = "question-image";
  mediaArea.appendChild(img);
}

function renderReading(q) {
  const block = document.createElement("div");
  block.className = "reading-block";
  block.innerHTML = `
    <div class="reading-text">${q.text}</div>
    ${q.readingQuestion ? `<div class="reading-question">${q.readingQuestion}</div>` : ""}
  `;
  mediaArea.appendChild(block);
}

function renderMcq(q) {
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-pill option-btn";
    btn.type = "button";
    btn.textContent = option;
    btn.onclick = () => handleMcqAnswer(q, index);
    answers.appendChild(btn);
  });
}

function handleMcqAnswer(q, selectedIndex) {
  responses.push({
    id: q.id,
    type: "mcq",
    level: q.level,
    selected: selectedIndex,
    correct: selectedIndex === q.correct
  });

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

function renderWriting(q) {
  const card = document.createElement("div");
  card.className = "response-card";
  card.innerHTML = `
    <p class="response-prompt">${q.writingPrompt}</p>
    <textarea id="writingResponse" class="response-box" placeholder="Write your answer here..."></textarea>
    <button id="submitWriting" class="submit-small-btn" type="button">Submit</button>
  `;
  answers.appendChild(card);

  document.getElementById("submitWriting").onclick = () => {
    const value = document.getElementById("writingResponse").value.trim();

    writtenAnswers.push({
      id: q.id,
      level: q.level,
      prompt: q.writingPrompt,
      answer: value
    });

    responses.push({
      id: q.id,
      type: "writing",
      level: q.level,
      completed: value.length > 0,
      length: value.length
    });

    currentQuestion++;
    renderQuestion();
  };
}

function renderSpeaking(q) {
  const card = document.createElement("div");
  card.className = "response-card speaking-card";
  card.innerHTML = `
    <p class="response-prompt speaking-prompt">${q.speakingPrompt}</p>

    <div class="speaking-control-row">
      <button id="recordBtn" class="record-icon-btn" type="button" aria-label="Record">
        <span class="record-dot"></span>
      </button>

      <button id="stopBtn" class="record-icon-btn" type="button" aria-label="Stop" disabled>
        <span class="stop-square"></span>
      </button>
    </div>

    <div id="recordingStatus" class="recording-status">Tap record and answer in French.</div>

    <canvas id="waveCanvas" class="wave-canvas" width="640" height="90"></canvas>

    <div id="audioPreview" class="audio-preview"></div>

    <div class="speaking-actions">
      <button id="rerecordBtn" class="secondary-small-btn" type="button" disabled>Re-record</button>
      <button id="submitSpeaking" class="submit-small-btn" type="button" disabled>Submit</button>
    </div>
  `;
  answers.appendChild(card);

  document.getElementById("recordBtn").onclick = startRecording;
  document.getElementById("stopBtn").onclick = stopRecording;
  document.getElementById("rerecordBtn").onclick = () => {
    resetMediaRecorder();
    currentAudioBlob = null;
    currentAudioUrl = null;
    document.getElementById("audioPreview").innerHTML = "";
    document.getElementById("submitSpeaking").disabled = true;
    document.getElementById("rerecordBtn").disabled = true;
    document.getElementById("recordBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("recordingStatus").textContent = "Tap record and answer in French.";
    clearWaveCanvas();
  };

  document.getElementById("submitSpeaking").onclick = () => {
    spokenAnswers.push({
      id: q.id,
      level: q.level,
      prompt: q.speakingPrompt,
      audioRecorded: !!currentAudioBlob
    });

    responses.push({
      id: q.id,
      type: "speaking",
      level: q.level,
      completed: !!currentAudioBlob
    });

    currentQuestion++;
    renderQuestion();
  };
}

async function startRecording() {
  try {
    resetMediaRecorder();

    const recordBtn = document.getElementById("recordBtn");
    const stopBtn = document.getElementById("stopBtn");
    const status = document.getElementById("recordingStatus");

    currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(currentStream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      currentAudioBlob = new Blob(recordedChunks, { type: "audio/webm" });
      currentAudioUrl = URL.createObjectURL(currentAudioBlob);

      const preview = document.getElementById("audioPreview");
      preview.innerHTML = `<audio controls src="${currentAudioUrl}"></audio>`;

      document.getElementById("submitSpeaking").disabled = false;
      document.getElementById("rerecordBtn").disabled = false;
      status.textContent = "Recording saved. Replay, re-record, or submit.";

      resetMediaRecorder();
    };

    mediaRecorder.start();
    startWave(currentStream);

    recordBtn.disabled = true;
    stopBtn.disabled = false;
    status.textContent = "Recording... speak now.";
  } catch (err) {
    document.getElementById("recordingStatus").textContent = "Microphone access is required.";
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("recordingStatus").textContent = "Saving recording...";
  }
}

function startWave(stream) {
  const canvas = document.getElementById("waveCanvas");
  const ctx = canvas.getContext("2d");

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 2048;

  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(99, 241, 255, 0.95)";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128;
      const y = (v * canvas.height) / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
  }

  draw();
}

function clearWaveCanvas() {
  const canvas = document.getElementById("waveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showIntervention() {
  interventionShown = true;
  app.classList.add("hidden");
  intervention.classList.remove("hidden");
  intervention.setAttribute("aria-hidden", "false");

  if (interventionAudio) {
    interventionAudio.currentTime = 0;
    interventionAudio.play().catch(() => {});
  }

  continueBtn.classList.add("slide-in-left", "shimmer");
  revealBtn.classList.add("slide-in-right", "shimmer");
}

continueBtn.onclick = () => {
  intervention.classList.add("hidden");
  intervention.setAttribute("aria-hidden", "true");
  app.classList.remove("hidden");
  renderQuestion();
};

revealBtn.onclick = () => {
  finishPlacement();
};

function calculateLevel() {
  const objectiveTotal = questions.filter(q => q.type === "mcq").length;
  const percent = objectiveTotal ? score / objectiveTotal : 0;

  let level = "A0";
  if (percent >= 0.2) level = "A1";
  if (percent >= 0.45) level = "A2";
  if (percent >= 0.68) level = "B1";
  if (percent >= 0.84) level = "B2";

  return level;
}

function finishPlacement() {
  const level = calculateLevel();

  sessionStorage.setItem("placement_score", String(score));
  sessionStorage.setItem("placement_total", String(questions.length));
  sessionStorage.setItem("placement_level", level);
  sessionStorage.setItem("placement_spoken_answers", JSON.stringify(spokenAnswers));
  sessionStorage.setItem("placement_written_answers", JSON.stringify(writtenAnswers));
  sessionStorage.setItem("placement_responses", JSON.stringify(responses));

  window.location.href = "/placement/result.html";
}

renderQuestion();


