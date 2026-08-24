console.log("placement.js loaded");

/* ==================================================
   QUESTION BANK - grouped by CEFR level
   The test now runs as ONE continuous sequence through
   all 30 questions - no visible pass/fail, no stopping.
   The test-taker just answers question after question
   with real-time right/wrong feedback and a running score.

   The actual confirmed level is calculated BACKSTAGE once
   the test ends (or is stopped early): it is the TOP of
   the longest unbroken run of consecutively PASSED levels
   (3/4-ish correct on that level's full question block).
   This is deliberately stricter than passing any single
   level - randomly guessing 3/4 on one level is roughly a
   5% chance, but doing it on three levels in a row by pure
   luck is closer to 1 in 7,700.
================================================== */

const questions = [

  // ===== A0 - Absolute Beginner (3 questions, need 3/3) =====
  { id: 1, level: "A0", type: "mc", prompt: "Listen and choose.", audio: "/assets/sounds/placement/a0_q1_bonjour.mp3", options: ["Merci", "Bonsoir", "Bonjour", "Pardon"], correct: 2 },
  { id: 2, level: "A0", type: "mc", prompt: "What does « merci » mean?", options: ["Hello", "Thank you", "Sorry", "Bye"], correct: 1 },
  { id: 3, level: "A0", type: "mc", prompt: "Listen and choose.", audio: "/assets/sounds/placement/a0_q4_aurevoir.mp3", options: ["Bonjour", "Merci", "Au revoir", "Salut"], correct: 2 },
  { id: 101, level: "A0", type: "oral", prompt: "Say: Bonjour", expectedText: "Bonjour" },

  // ===== A1 - Beginner (4 MC + 2 typed = 6, need 5/6) =====
  { id: 4, level: "A1", type: "mc", prompt: "Complete the sentence correctly: « Mes parents ___ à Lyon, mais moi, j'habite à Marseille. »", options: ["habite", "habites", "habitent", "habitez"], correct: 2 },
  { id: 5, level: "A1", type: "mc", prompt: "Read: « Sophie a deux frères. Le plus jeune a 8 ans. Son frère aîné a 6 ans de plus que lui. » Quel âge a le frère aîné ?", options: ["8 ans", "2 ans", "6 ans", "14 ans"], correct: 3 },
  { id: 6, level: "A1", type: "mc", prompt: "Complete the sentence correctly: « Il n'y a pas ___ pain dans le frigo. »", options: ["le", "du", "des", "de"], correct: 3 },
  { id: 7, level: "A1", type: "mc", prompt: "Il pleut. Choisis l'image correcte.", image: "/assets/images/a1_q8_weather_collage.png", options: ["A","B","C","D"], correct: 0 },
  { id: 24, level: "A1", type: "typed", prompt: "Écris la forme correcte : « Je ___ (avoir) 20 ans. »", acceptableAnswers: ["ai"] },
  { id: 25, level: "A1", type: "typed", prompt: "Comment dit-on « Good evening » en français ?", acceptableAnswers: ["bonsoir"] },
  { id: 102, level: "A1", type: "oral", prompt: "Say: J'ai vingt ans", expectedText: "J'ai vingt ans" },

  // ===== A2 - Elementary (4 MC + 2 typed = 6, need 5/6) =====
  { id: 8, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Hier, je ___ au cinéma quand il a commencé à pleuvoir. »", options: ["suis allé", "vais", "allais", "irai"], correct: 2 },
  { id: 9, level: "A2", type: "mc", prompt: "Read: « Le document a été rédigé lundi matin. Il a été envoyé le jour suivant, avant midi. » Que peut-on dire du document ?", options: ["Il a été envoyé le lundi.", "Il n'a jamais été envoyé.", "Il a été envoyé le vendredi.", "Il a été envoyé le mardi."], correct: 3 },
  { id: 10, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Elle travaille beaucoup, ___ elle réussit tous ses examens. »", options: ["mais", "ou", "donc", "si"], correct: 2 },
  { id: 11, level: "A2", type: "mc", prompt: "Complete the sentence correctly: « Tu as des questions ? Oui, j'___ ai plusieurs. »", options: ["y", "le", "en", "lui"], correct: 2 },
  { id: 26, level: "A2", type: "typed", prompt: "Complète au passé composé : « Hier, nous ___ (visiter) le musée. »", acceptableAnswers: ["avons visite", "avons visité"] },
  { id: 27, level: "A2", type: "typed", prompt: "Écris le contraire de « facile ».", acceptableAnswers: ["difficile"] },
  { id: 103, level: "A2", type: "oral", prompt: "Say: Nous avons visité le musée hier", expectedText: "Nous avons visité le musée hier" },

  // ===== B1 - Intermediate (4 MC + 1 typed = 5, need 4/5) =====
  { id: 12, level: "B1", type: "mc", prompt: "Choisis la bonne structure.", options: ["Je lui le ai donné.", "Je le lui ai donné.", "Je ai le lui donné.", "Je donné le lui ai."], correct: 1 },
  { id: 13, level: "B1", type: "mc", prompt: "Écoute et choisis.", audio: "/assets/sounds/placement/b1_q10_bus.mp3", options: ["Acheter une maison", "Prendre le bus", "Cuisiner", "Dormir"], correct: 1 },
  { id: 14, level: "B1", type: "mc", prompt: "Pourquoi est-il parti ?", options: ["Parce qu'il fatigue.", "Parce qu'il est fatigué.", "Parce qu'il était fatigué.", "Parce fatigué."], correct: 2 },
  { id: 15, level: "B1", type: "mc", prompt: "Choisis la phrase la plus naturelle.", options: ["Ça dépend la situation.", "Ça dépend pour la situation.", "Ça dépend à la situation.", "Ça dépend de la situation."], correct: 3 },
  { id: 28, level: "B1", type: "typed", prompt: "Complète avec le bon pronom : « Je ne connais pas ce restaurant, je n'___ ai jamais mangé. »", acceptableAnswers: ["y"] },
  { id: 104, level: "B1", type: "oral", prompt: "Say: Ça dépend de la situation", expectedText: "Ça dépend de la situation" },

  // ===== B2 - Upper Intermediate (4 MC + 1 typed = 5, need 4/5) =====
  { id: 16, level: "B2", type: "mc", prompt: "Quelle formulation est la plus diplomatique ?", options: ["Vous avez tort.", "C'est faux.", "Je comprends votre point de vue.", "Impossible."], correct: 2 },
  { id: 17, level: "B2", type: "mc", prompt: "Choisis la meilleure formulation pour exprimer un désaccord poli.", options: ["T'as tort.", "Je ne suis pas tout à fait d'accord, mais je comprends votre point.", "C'est n'importe quoi.", "Non."], correct: 1 },
  { id: 18, level: "B2", type: "mc", prompt: "Quelle phrase utilise correctement le conditionnel ?", options: ["Si j'ai le temps, je viendrais.", "Si j'avais le temps, je viens.", "Si j'avais le temps, je viendrais.", "Si j'aurais le temps, je viendrais."], correct: 2 },
  { id: 19, level: "B2", type: "mc", prompt: "Choisis la phrase qui exprime une nuance d'incertitude.", options: ["Il pleut demain.", "Il se peut qu'il pleuve demain.", "Il va pleuvoir demain, c'est sûr.", "Il pleuvra demain absolument."], correct: 1 },
  { id: 29, level: "B2", type: "typed", prompt: "Reformule au conditionnel pour être plus poli : « Je veux un café. »", acceptableAnswers: ["je voudrais un cafe", "je voudrais un café"] },
  { id: 105, level: "B2", type: "oral", prompt: "Say: Je ne suis pas tout à fait d'accord, mais je comprends votre point", expectedText: "Je ne suis pas tout à fait d'accord mais je comprends votre point" },

  // ===== C1 - Advanced (4 MC + 1 typed = 5, need 4/5) =====
  { id: 20, level: "C1", type: "mc", prompt: "Choisis la formulation la plus formelle.", audio: "/assets/sounds/placement/c1_q18_formel.mp3", options: ["Tu peux faire ça ?", "Fais-le.", "Je vous saurais gré de bien vouloir…", "Dis-moi."], correct: 2 },
  { id: 21, level: "C1", type: "mc", prompt: "Quelle phrase est stylistiquement correcte ?", options: ["Il n'a pas été prévenu pas.", "N'eût-il pas été prévenu…", "Il n'était pas prévenir.", "Pas été prévenu il."], correct: 1 },
  { id: 22, level: "C1", type: "mc", prompt: "Choisis la nuance correcte.", options: ["Il semble que c'est vrai.", "Il semble est vrai.", "Il semble que ce soit vrai.", "Il semble vrai que."], correct: 2 },
  { id: 23, level: "C1", type: "mc", prompt: "Quelle phrase illustre le mieux l'emploi du subjonctif passé ?", options: ["Bien qu'il a terminé son travail, il est resté tard.", "Bien qu'il termine son travail, il est resté tard.", "Bien qu'il terminait son travail, il est resté tard.", "Bien qu'il ait terminé son travail, il est resté tard."], correct: 3 },
  { id: 30, level: "C1", type: "typed", prompt: "Complète au subjonctif : « Il faut que tu ___ (être) à l'heure. »", acceptableAnswers: ["sois"] },
  { id: 106, level: "C1", type: "oral", prompt: "Say: Il faut que tu sois à l'heure", expectedText: "Il faut que tu sois à l'heure" }

];

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
   LEVEL CONFIGURATION (used only for backstage scoring)
================================================== */

const levelOrder = ["A0","A1","A2","B1","B2","C1"];
const levelThreshold = { A0:3, A1:5, A2:5, B1:4, B2:4, C1:4 };

const levelTotalQuestions = {};
levelOrder.forEach(lvl => {
  levelTotalQuestions[lvl] = questions.filter(q => q.level === lvl && q.type !== "oral").length;
});

const accentChars = ["é","è","ê","à","ç","ù","ô","î","œ","«","»"];

const FEEDBACK_PAUSE_MS = 1100;
const CONSECUTIVE_WRONG_THRESHOLD = 4;
const CUMULATIVE_WRONG_THRESHOLD = 7;

let currentIndex = 0;
let correctSoFar = 0;
let consecutiveWrong = 0;
let cumulativeWrong = 0;
let levelResults = {};

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

/* ==================================================
   RUNNING SCORE DISPLAY - injected next to the progress bar
================================================== */

const scoreDisplay = document.createElement("div");
scoreDisplay.id = "scoreDisplay";
scoreDisplay.className = "score-pill";
progressLabel.insertAdjacentElement("afterend", scoreDisplay);

function updateScoreDisplay(){
  scoreDisplay.textContent = "Score: " + correctSoFar + " / " + (currentIndex + 1);
}

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
  const pct = ((currentIndex + 1) / questions.length) * 100;
  progressBar.style.width = pct + "%";
  progressLabel.textContent = "Question " + (currentIndex + 1) + " of " + questions.length;
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
  const q = questions[currentIndex];

  optionsEl.innerHTML = "";
  optionsEl.classList.remove("options-ready");
  mediaArea.innerHTML = "";

  updateProgress();
  updateScoreDisplay();

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

    if (q.type === "oral") {

      const oralWrap = document.createElement("div");
      oralWrap.innerHTML =
        '<canvas id="oralWaveCanvas" class="oral-wave-canvas" width="280" height="56" style="display:none;"></canvas>' +
        '<div class="oral-record-row">' +
        '<button class="option oral-record-btn" id="oralRecordBtn">● Record</button>' +
        '<span class="oral-record-status" id="oralRecordStatus">Not recorded yet</span>' +
        '</div>' +
        '<div class="oral-playback-row" id="oralPlaybackRow" style="display:none;">' +
        '<button class="option oral-secondary-btn" id="oralPlayBtn">&#9658; Play My Recording</button>' +
        '<button class="option oral-secondary-btn" id="oralRerecordBtn">&#8635; Re-record</button>' +
        '</div>' +
        '<audio id="oralPlaybackAudio" style="display:none;"></audio>' +
        '<div id="oralFeedback" class="oral-feedback" style="display:none;"></div>' +
        '<div class="oral-btn-row"><button class="option" id="oralSubmitBtn" disabled>Submit</button></div>';
      optionsEl.appendChild(oralWrap);

      setupOralRecording();

      requestAnimationFrame(() => {
        optionsEl.classList.add("options-ready");
      });

      return;
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

      const feedbackMsg = document.createElement("div");
      feedbackMsg.id = "typedFeedbackMsg";
      feedbackMsg.style.cssText = "margin-top:8px;font-size:13px;font-weight:600;min-height:18px;";
      optionsEl.appendChild(feedbackMsg);

      const submitBtn = document.createElement("button");
      submitBtn.className = "option";
      submitBtn.id = "typedSubmitBtn";
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
      btn.onclick = () => answer(i, btn);
      optionsEl.appendChild(btn);
    });

    requestAnimationFrame(() => {
      optionsEl.classList.add("options-ready");
    });

  });
}

/* ==================================================
   REAL-TIME FEEDBACK + RESULT HANDLING
================================================== */

function recordLevelResult(level, isCorrect){
  if(!levelResults[level]) levelResults[level] = { correct: 0, total: 0 };
  levelResults[level].total++;
  if(isCorrect) levelResults[level].correct++;
}

function registerResult(isCorrect){

  const q = questions[currentIndex];
  recordLevelResult(q.level, isCorrect);

  if(isCorrect){
    correctSoFar++;
    consecutiveWrong = 0;
  }else{
    consecutiveWrong++;
    cumulativeWrong++;
  }

  updateScoreDisplay();

  const disableInputs = () => {
    optionsEl.querySelectorAll("button, input").forEach(el => el.disabled = true);
  };
  disableInputs();

  setTimeout(() => {

    if(consecutiveWrong >= CONSECUTIVE_WRONG_THRESHOLD || cumulativeWrong >= CUMULATIVE_WRONG_THRESHOLD){
      triggerIntervention();
      return;
    }

    advance();

  }, FEEDBACK_PAUSE_MS);

}

function celebrateAnswer(isCorrect, originEl){
  scoreDisplay.classList.remove("score-flash-correct", "score-flash-wrong");
  void scoreDisplay.offsetWidth;
  scoreDisplay.classList.add(isCorrect ? "score-flash-correct" : "score-flash-wrong");

  if(isCorrect && originEl){
    const originRect = originEl.getBoundingClientRect();
    const targetRect = scoreDisplay.getBoundingClientRect();

    const flyEl = document.createElement("div");
    flyEl.className = "score-fly-plus-one";
    flyEl.textContent = "+1";
    flyEl.style.left = (originRect.left + originRect.width / 2) + "px";
    flyEl.style.top = (originRect.top + originRect.height / 2) + "px";
    document.body.appendChild(flyEl);

    requestAnimationFrame(() => {
      flyEl.style.left = (targetRect.left + targetRect.width / 2) + "px";
      flyEl.style.top = (targetRect.top + targetRect.height / 2) + "px";
      flyEl.style.transform = "translate(-50%,-50%) scale(.6)";
      flyEl.style.opacity = "0";
    });

    setTimeout(() => flyEl.remove(), 850);
  }
}

function answer(choice, clickedBtn) {
  const q = questions[currentIndex];
  const isCorrect = choice === q.correct;

  const allButtons = optionsEl.querySelectorAll("button.option");
  if(isCorrect){
    clickedBtn.classList.add("option-correct");
  }else{
    clickedBtn.classList.add("option-wrong");
    allButtons.forEach((b, i) => {
      if(i === q.correct){
        b.classList.add("option-correct");
      }
    });
  }

  celebrateAnswer(isCorrect, clickedBtn);
  registerResult(isCorrect);
}

function answerTyped(userInput) {
  const q = questions[currentIndex];
  const normalized = normalizeAnswer(userInput);
  const isCorrect = q.acceptableAnswers.some(a => normalizeAnswer(a) === normalized);

  const msg = document.getElementById("typedFeedbackMsg");
  if(msg){
    if(isCorrect){
      msg.textContent = "Correct!";
      msg.style.color = "#22c55e";
    }else{
      msg.textContent = "Not quite - accepted answer: " + q.acceptableAnswers[0];
      msg.style.color = "#ef4444";
    }
  }

  const submitBtn = document.getElementById("typedSubmitBtn");
  if(submitBtn){
    submitBtn.classList.add(isCorrect ? "option-correct" : "option-wrong");
  }
  celebrateAnswer(isCorrect, submitBtn);

  registerResult(isCorrect);
}

var oralMediaRecorder = null;
var oralRecordedChunks = [];
var oralCurrentStream = null;
var oralAudioCtx = null;
var oralWaveAnimId = null;
var oralRecordedBlob = null;

var oralPassMessages = ["Beautifully done!", "That was great!", "Parfait !", "You nailed it!"];
var oralEncourageMessages = ["Good effort - keep going!", "Nice try - onward!", "That's alright, you're making progress!"];

// ===== WAV encoding (proven pattern already working in Talkletics) =====
function encodeWAV(samples, sampleRate){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);
  function writeString(offset, str){
    for(var i=0;i<str.length;i++) view.setUint8(offset+i, str.charCodeAt(i));
  }
  writeString(0,"RIFF");
  view.setUint32(4, 36 + samples.length*2, true);
  writeString(8,"WAVE");
  writeString(12,"fmt ");
  view.setUint32(16,16,true);
  view.setUint16(20,1,true);
  view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);
  view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true);
  view.setUint16(34,16,true);
  writeString(36,"data");
  view.setUint32(40, samples.length*2, true);
  var offset = 44;
  for(var i=0;i<samples.length;i++, offset+=2){
    var s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s<0 ? s*0x8000 : s*0x7FFF, true);
  }
  return buffer;
}

async function convertOralBlobToWav(blob){
  var arrayBuffer = await blob.arrayBuffer();
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var decoded = await audioCtx.decodeAudioData(arrayBuffer);
  var offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  var source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);
  var rendered = await offlineCtx.startRendering();
  var wavBuffer = encodeWAV(rendered.getChannelData(0), 16000);
  audioCtx.close();
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function setupOralRecording(){
  oralRecordedBlob = null;
  document.getElementById("oralRecordBtn").addEventListener("click", toggleOralRecording);
  document.getElementById("oralPlayBtn").addEventListener("click", playOralRecording);
  document.getElementById("oralRerecordBtn").addEventListener("click", reRecordOral);
  document.getElementById("oralSubmitBtn").addEventListener("click", submitOralRecording);
}

function startOralWave(streamOrElement, isElement){
  var canvas = document.getElementById("oralWaveCanvas");
  var ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  if(!oralAudioCtx){
    oralAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var analyser = oralAudioCtx.createAnalyser();
  analyser.fftSize = 64;

  if(isElement){
    if(!streamOrElement._oralWaveSource){
      streamOrElement._oralWaveSource = oralAudioCtx.createMediaElementSource(streamOrElement);
      streamOrElement._oralWaveSource.connect(oralAudioCtx.destination);
    }
    streamOrElement._oralWaveSource.connect(analyser);
  } else {
    var source = oralAudioCtx.createMediaStreamSource(streamOrElement);
    source.connect(analyser);
  }

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  function draw(){
    oralWaveAnimId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var barWidth = (canvas.width / bufferLength) * 1.8;
    var x = 0;
    for(var i = 0; i < bufferLength; i++){
      var barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = "#5fbf5f";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 2;
    }
  }
  draw();
}

function stopOralWave(){
  if(oralWaveAnimId){
    cancelAnimationFrame(oralWaveAnimId);
    oralWaveAnimId = null;
  }
  var canvas = document.getElementById("oralWaveCanvas");
  if(canvas){
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
}

function toggleOralRecording(){
  var btn = document.getElementById("oralRecordBtn");
  var status = document.getElementById("oralRecordStatus");

  if(!oralMediaRecorder || oralMediaRecorder.state === "inactive"){
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      oralCurrentStream = stream;
      oralRecordedChunks = [];
      oralMediaRecorder = new MediaRecorder(stream);
      oralMediaRecorder.ondataavailable = function(e){ oralRecordedChunks.push(e.data); };
      oralMediaRecorder.onstop = function(){
        var rawType = (oralMediaRecorder.mimeType) || "audio/webm";
        var rawBlob = new Blob(oralRecordedChunks, { type: rawType });
        stopOralWave();

        var submitBtn = document.getElementById("oralSubmitBtn");
        var status = document.getElementById("oralRecordStatus");
        status.textContent = "Processing recording...";

        convertOralBlobToWav(rawBlob).then(function(wavBlob){
          oralRecordedBlob = wavBlob;
          var rBtn = document.getElementById("oralRecordBtn");
          rBtn.style.display = "none";
          rBtn.disabled = false;
          document.getElementById("oralPlaybackRow").style.display = "flex";
          submitBtn.disabled = false;
          status.textContent = "Recording captured";
        }).catch(function(err){
          console.error("WAV conversion failed:", err);
          oralRecordedBlob = rawBlob;
          var rBtn2 = document.getElementById("oralRecordBtn");
          rBtn2.style.display = "none";
          rBtn2.disabled = false;
          document.getElementById("oralPlaybackRow").style.display = "flex";
          submitBtn.disabled = false;
          status.textContent = "Recording captured";
        });

        oralCurrentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      oralMediaRecorder.start();
      startOralWave(stream, false);
      btn.textContent = "■ Stop";
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    btn.textContent = "Processing...";
    btn.disabled = true;
    oralMediaRecorder.stop();
  }
}

function playOralRecording(){
  var playBtn = document.getElementById("oralPlayBtn");
  var audioEl = document.getElementById("oralPlaybackAudio");
  var originalLabel = playBtn.innerHTML;
  playBtn.innerHTML = "Loading...";
  playBtn.disabled = true;

  var settled = false;
  var fallbackTimer = setTimeout(function(){
    if(settled) return;
    settled = true;
    playBtn.innerHTML = originalLabel;
    playBtn.disabled = false;
    console.warn("Playback canplay event never fired - fallback triggered");
  }, 3000);

  audioEl.src = URL.createObjectURL(oralRecordedBlob);
  audioEl.load();

  var onReady = function(){
    if(settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    playBtn.innerHTML = originalLabel;
    playBtn.disabled = false;
    startOralWave(audioEl, true);
    audioEl.currentTime = 0;
    audioEl.play().catch(function(err){ console.error("Playback failed:", err); });
  };

  audioEl.addEventListener("canplay", onReady, { once: true });
  audioEl.addEventListener("loadeddata", onReady, { once: true });
  audioEl.addEventListener("ended", stopOralWave, { once: true });
}

function reRecordOral(){
  oralRecordedBlob = null;
  document.getElementById("oralPlaybackRow").style.display = "none";
  var btn = document.getElementById("oralRecordBtn");
  btn.style.display = "inline-block";
  btn.textContent = "● Record";
  btn.disabled = false;
  document.getElementById("oralRecordStatus").textContent = "Not recorded yet";
  document.getElementById("oralSubmitBtn").disabled = true;
}

function submitOralRecording(){
  var q = questions[currentIndex];
  var submitBtn = document.getElementById("oralSubmitBtn");
  var feedbackEl = document.getElementById("oralFeedback");

  submitBtn.disabled = true;
  submitBtn.textContent = "Scoring...";

  fetch("https://saybonapp-server.onrender.com/api/assessPronunciation?referenceText=" + encodeURIComponent(q.expectedText || ""), {
    method: "POST",
    body: oralRecordedBlob
  }).then(function(res){ return res.json(); }).then(function(data){
    var score = Math.round(data.finalScore ?? data.score ?? data.AccuracyScore ?? data.accuracyScore ?? 0);
    var passed = score >= 70;
    var msg = passed
      ? oralPassMessages[Math.floor(Math.random() * oralPassMessages.length)]
      : oralEncourageMessages[Math.floor(Math.random() * oralEncourageMessages.length)];

    document.querySelectorAll("#options button").forEach(function(b){ b.disabled = true; });

    feedbackEl.style.display = "block";
    feedbackEl.innerHTML =
      '<div style="font-size:1.6rem;font-weight:800;">' + score + '%</div>' +
      '<div style="font-size:.9rem;margin-top:4px;">' + msg + '</div>';

    setTimeout(function(){
      advance();
    }, 2500);
  }).catch(function(err){
    console.error(err);
    feedbackEl.style.display = "block";
    feedbackEl.textContent = "Could not score - moving on.";
    setTimeout(function(){ advance(); }, 1800);
  });
}

function advance(){
  currentIndex++;

  if (currentIndex >= questions.length) {
    finish();
    return;
  }

  loadQuestion();
}

/* ==================================================
   BACKSTAGE LEVEL CALCULATION
   The confirmed level is the TOP of the longest unbroken
   run of consecutively passed levels, based on whatever
   has actually been completed - works identically whether
   someone finishes all 30 questions or stops early via
   the intervention screen's Reveal option.
================================================== */

function computeConfirmedLevel(){

  let bestEndIdx = -1;
  let bestLength = 0;
  let curLength = 0;

  for(let i = 0; i < levelOrder.length; i++){

    const lvl = levelOrder[i];
    const r = levelResults[lvl];
    const passed = r && r.total === levelTotalQuestions[lvl] && r.correct >= levelThreshold[lvl];

    if(passed){
      curLength++;
      if(curLength > bestLength){
        bestLength = curLength;
        bestEndIdx = i;
      }
    }else{
      curLength = 0;
    }

  }

  if(bestEndIdx === -1) return "A0";
  return levelOrder[bestEndIdx];

}

/* ==================================================
   INTERVENTION (encouragement screen)
   Purely a supportive pause - has ZERO effect on the
   confirmed level either way. Continue resets only the
   consecutive-wrong counter (cumulative keeps counting)
   and resumes exactly where the test left off. Reveal
   ends the test early and runs the same backstage
   calculation on whatever was actually completed.
================================================== */

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
  consecutiveWrong = 0;
  advance();
};

revealBtn.onclick = () => {
  overlay.classList.add("hidden");
  finish();
};

function finish() {
  const level = computeConfirmedLevel();

  sessionStorage.setItem("saybon_level", level);
  sessionStorage.setItem("saybon_next", "/reveal/");
  window.location.href = "/loader.html";
}

loadQuestion();