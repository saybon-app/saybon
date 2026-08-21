const API_BASE = "https://saybonapp-server.onrender.com";
import { app, auth, db } from "/js/firebase-init.js";
import { getStorage, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

var storage = getStorage(app, "gs://saybon-3e3c2.firebasestorage.app");
signInAnonymously(auth).catch(function(e){ console.warn("Anon auth failed:", e); });

// ================================================================
// DELF PLACEMENT ENGINE
// Staircase: start at chosen level, must clear 70% (Listening+Reading
// combined) to climb one level up. Writing/Speaking are captured and
// saved, but scored as "pending" until AI grading is live.
// ================================================================

var LEVELS = {

  a1: {
    id: "a1", label: "A1", group: "Tout Public", hasContent: true,
    listening: {
      script: "Bonjour, je m'appelle Claire Dubois. J'ai vingt-huit ans et j'habite à Lyon avec mon frère Marc. Je travaille comme professeure dans une école primaire. Le matin, je me lève à sept heures et je prends le bus pour aller au travail. Le week-end, j'aime lire des livres et faire du sport avec des amis.",
      questions: [
        { q: "Quel est le nom de famille de Claire ?", options: ["Dubois", "Dupont", "Durand"], correct: 0 },
        { q: "Quel âge a Claire ?", options: ["18 ans", "28 ans", "38 ans"], correct: 1 },
        { q: "Avec qui habite-t-elle ?", options: ["sa sœur", "son frère", "ses parents"], correct: 1 },
        { q: "Que fait Claire comme métier ?", options: ["infirmière", "professeure", "vendeuse"], correct: 1 },
        { q: "Comment va-t-elle au travail ?", options: ["en voiture", "à pied", "en bus"], correct: 2 }
      ]
    },
    reading: {
      passage: "Paul travaille dans un grand bureau au centre-ville. Il commence à huit heures et demie et termine à dix-sept heures trente. Le midi, il mange avec ses collègues dans un petit restaurant près du bureau. Il aime son travail parce que l'ambiance est agréable, même si parfois il trouve les journées un peu longues.",
      questions: [
        { q: "Où travaille Paul ?", options: ["dans une usine", "dans un bureau", "dans un magasin"], correct: 1 },
        { q: "À quelle heure commence-t-il ?", options: ["8h", "8h30", "9h"], correct: 1 },
        { q: "Où mange-t-il le midi ?", options: ["chez lui", "au bureau", "dans un restaurant"], correct: 2 },
        { q: "Pourquoi aime-t-il son travail ?", options: ["le bon salaire", "la bonne ambiance", "les horaires courts"], correct: 1 },
        { q: "Comment sont ses journées, parfois ?", options: ["courtes", "longues", "difficiles"], correct: 1 }
      ]
    },
    writing: { prompt: "Présentez-vous en quelques phrases : votre nom, votre âge, et ce que vous aimez faire." },
    speaking: { prompt: "Parlez de votre famille pendant une minute." }
  },

  a2: {
    id: "a2", label: "A2", group: "Tout Public", hasContent: true,
    listening: {
      script: "Hier, Sophie a visité le musée avec sa meilleure amie, Léa. Elles sont arrivées à dix heures du matin et sont restées jusqu'à midi. Après la visite, elles ont déjeuné dans un café en face du musée. Sophie a acheté deux cartes postales pour sa grand-mère, qui habite en Belgique.",
      questions: [
        { q: "Avec qui Sophie a-t-elle visité le musée ?", options: ["sa sœur", "sa meilleure amie", "sa grand-mère"], correct: 1 },
        { q: "À quelle heure sont-elles arrivées ?", options: ["9h", "10h", "11h"], correct: 1 },
        { q: "Où ont-elles déjeuné ?", options: ["au musée", "dans un café", "chez Léa"], correct: 1 },
        { q: "Qu'est-ce que Sophie a acheté ?", options: ["un livre", "deux cartes postales", "un souvenir"], correct: 1 },
        { q: "Où habite la grand-mère de Sophie ?", options: ["en France", "en Belgique", "en Italie"], correct: 1 }
      ]
    },
    reading: {
      passage: "Un nouveau restaurant italien a ouvert ses portes le mois dernier au centre-ville. Le propriétaire, originaire de Naples, prépare chaque plat de façon traditionnelle, avec des ingrédients importés d'Italie. Les prix sont raisonnables pour la qualité proposée. Cependant, plusieurs clients se plaignent que le service est parfois très lent, surtout le week-end.",
      questions: [
        { q: "Quand le restaurant a-t-il ouvert ?", options: ["la semaine dernière", "le mois dernier", "l'année dernière"], correct: 1 },
        { q: "D'où vient le propriétaire ?", options: ["Rome", "Naples", "Milan"], correct: 1 },
        { q: "Comment sont préparés les plats ?", options: ["de façon moderne", "de façon traditionnelle", "de façon rapide"], correct: 1 },
        { q: "Que pensent les clients des prix ?", options: ["trop chers", "raisonnables", "trop bas"], correct: 1 },
        { q: "Quel est le problème principal signalé ?", options: ["la nourriture", "le service lent", "les prix"], correct: 1 }
      ]
    },
    writing: { prompt: "Racontez votre dernier week-end : où êtes-vous allé(e), avec qui, et qu'avez-vous fait ?" },
    speaking: { prompt: "Décrivez votre quartier pendant une minute : ce que vous aimez et ce que vous n'aimez pas." }
  },

  b1: {
    id: "b1", label: "B1", group: "Tout Public", hasContent: true,
    listening: {
      script: "Beaucoup de gens pensent que le télétravail améliore la qualité de vie parce qu'il permet d'éviter les longs trajets et d'organiser sa journée plus librement. Cependant, certains employés trouvent qu'il est difficile de séparer vie professionnelle et vie personnelle, et ils se sentent parfois isolés sans contact régulier avec leurs collègues. La plupart des experts s'accordent à dire que le télétravail fonctionne mieux quand il est combiné avec quelques jours au bureau chaque semaine.",
      questions: [
        { q: "Selon certains, quel est l'avantage du télétravail ?", options: ["un meilleur salaire", "éviter les trajets", "plus de vacances"], correct: 1 },
        { q: "Quelle difficulté certains employés rencontrent-ils ?", options: ["le manque d'équipement", "séparer vie pro et vie perso", "trouver un emploi"], correct: 1 },
        { q: "Que ressentent parfois les employés en télétravail ?", options: ["de la fatigue", "de l'isolement", "de l'ennui"], correct: 1 },
        { q: "Que recommandent la plupart des experts ?", options: ["télétravail uniquement", "bureau uniquement", "un mélange des deux"], correct: 2 },
        { q: "Quel est le ton général de ce passage ?", options: ["entièrement positif", "entièrement négatif", "nuancé"], correct: 2 }
      ]
    },
    reading: {
      passage: "L'utilisation des réseaux sociaux chez les adolescents suscite un débat animé. D'un côté, ces plateformes permettent de rester en contact avec des amis et de découvrir de nouvelles idées. De l'autre, certains chercheurs s'inquiètent de leur effet sur le sommeil et la concentration. Malgré ces préoccupations, la plupart des parents choisissent de superviser l'utilisation plutôt que de l'interdire complètement.",
      questions: [
        { q: "Quel est un avantage mentionné des réseaux sociaux ?", options: ["améliorer le sommeil", "rester en contact avec des amis", "gagner de l'argent"], correct: 1 },
        { q: "Quelle est une inquiétude des chercheurs ?", options: ["le coût", "l'effet sur le sommeil et la concentration", "la sécurité des données"], correct: 1 },
        { q: "Que font la plupart des parents ?", options: ["ils interdisent tout", "ils supervisent l'utilisation", "ils ignorent le problème"], correct: 1 },
        { q: "Le ton du passage est-il...", options: ["pour l'interdiction totale", "entièrement favorable", "équilibré"], correct: 2 },
        { q: "Quel groupe est concerné par ce débat ?", options: ["les adolescents", "les retraités", "les enseignants"], correct: 0 }
      ]
    },
    writing: { prompt: "Donnez votre opinion sur l'effet des réseaux sociaux sur les jeunes, en justifiant votre point de vue." },
    speaking: { prompt: "Donnez votre opinion sur un sujet d'actualité, avec au moins deux arguments." }
  },

  b2: {
    id: "b2", label: "B2", group: "Tout Public", hasContent: true,
    listening: {
      script: "La transition énergétique fait l'objet de débats intenses. Certains soulignent qu'elle créera de nombreux emplois dans les énergies renouvelables et réduira notre dépendance aux combustibles fossiles. D'autres craignent que cette transition menace des milliers d'emplois dans les industries traditionnelles, notamment le charbon et le pétrole, sans offrir de reconversion suffisante aux travailleurs concernés. Les décideurs politiques tentent de trouver un équilibre entre ces deux réalités.",
      questions: [
        { q: "Quel est un argument en faveur de la transition énergétique ?", options: ["baisse des impôts", "création d'emplois dans le renouvelable", "plus de vacances"], correct: 1 },
        { q: "Quelle est une crainte exprimée ?", options: ["la hausse des prix", "la perte d'emplois traditionnels", "le manque d'électricité"], correct: 1 },
        { q: "Quel secteur est mentionné comme menacé ?", options: ["l'agriculture", "le charbon et le pétrole", "la technologie"], correct: 1 },
        { q: "Que cherchent à faire les décideurs politiques ?", options: ["ignorer le problème", "trouver un équilibre", "choisir un seul camp"], correct: 1 },
        { q: "Quel est le ton général de cet extrait ?", options: ["optimiste", "alarmiste", "équilibré"], correct: 2 }
      ]
    },
    reading: {
      passage: "La santé mentale occupe une place de plus en plus importante dans le débat public, ce qui représente une avancée significative après des décennies de silence. Toutefois, l'accès aux soins reste inégal : certaines personnes bénéficient rapidement d'un accompagnement de qualité, tandis que d'autres attendent des mois, faute de moyens ou de professionnels disponibles dans leur région. Ce système à deux vitesses inquiète de nombreux spécialistes.",
      questions: [
        { q: "Comment la place de la santé mentale dans le débat public a-t-elle évolué ?", options: ["elle a diminué", "elle a augmenté", "elle est restée stable"], correct: 1 },
        { q: "Quel problème est mentionné concernant l'accès aux soins ?", options: ["le coût uniquement", "l'inégalité d'accès", "le manque d'intérêt du public"], correct: 1 },
        { q: "Pourquoi certaines personnes attendent-elles des mois ?", options: ["manque de moyens ou de professionnels", "manque d'intérêt", "trop de demandes urgentes"], correct: 0 },
        { q: "Comment est décrit le système actuel ?", options: ["parfaitement équitable", "à deux vitesses", "entièrement gratuit"], correct: 1 },
        { q: "Qui s'inquiète de cette situation ?", options: ["les patients uniquement", "de nombreux spécialistes", "le gouvernement uniquement"], correct: 1 }
      ]
    },
    writing: { prompt: "Rédigez un texte argumenté sur les avantages et les inconvénients du télétravail généralisé." },
    speaking: { prompt: "Présentez et défendez un point de vue sur un sujet de société pendant deux minutes, en anticipant un argument contraire." }
  },

  c1: {
    id: "c1", label: "C1", group: "Tout Public", hasContent: true,
    listening: {
      script: "Dans le monde de l'artisanat, un débat subtil oppose les défenseurs de la tradition à ceux qui prônent l'innovation. Certains artisans estiment que préserver des techniques ancestrales est essentiel pour ne pas perdre un savoir-faire unique, tandis que d'autres soutiennent que refuser toute évolution condamne ces métiers à disparaître faute de rentabilité. Il ne s'agit pas tant de choisir un camp que de trouver comment faire dialoguer héritage et modernité sans que l'un n'efface l'autre.",
      questions: [
        { q: "Que défendent certains artisans traditionalistes ?", options: ["la rentabilité avant tout", "la préservation du savoir-faire ancestral", "l'abandon des méthodes anciennes"], correct: 1 },
        { q: "Quel risque évoquent les partisans de l'innovation ?", options: ["la disparition des métiers par manque de rentabilité", "la perte de qualité", "la concurrence étrangère"], correct: 0 },
        { q: "Que suggère le passage comme solution ?", options: ["choisir définitivement un camp", "faire dialoguer héritage et modernité", "abandonner l'artisanat"], correct: 1 },
        { q: "Quel est le ton de ce passage ?", options: ["tranché", "nuancé", "indifférent"], correct: 1 },
        { q: "Ce débat concerne principalement...", options: ["l'industrie technologique", "l'artisanat", "l'agriculture"], correct: 1 }
      ]
    },
    reading: {
      passage: "La régulation de l'intelligence artificielle soulève une tension difficile à résoudre. D'une part, une régulation stricte pourrait freiner l'innovation et désavantager les entreprises locales face à une concurrence internationale moins contrainte. D'autre part, l'absence de cadre clair risque d'aggraver les inégalités déjà provoquées par l'automatisation, en laissant le champ libre aux acteurs les plus puissants. Aucune solution ne semble pleinement satisfaisante, et les experts eux-mêmes restent divisés.",
      questions: [
        { q: "Quel est un risque d'une régulation stricte ?", options: ["freiner l'innovation", "trop de contrôle gouvernemental", "rien de spécifique"], correct: 0 },
        { q: "Quel est un risque de l'absence de régulation ?", options: ["moins d'innovation", "aggravation des inégalités", "hausse des impôts"], correct: 1 },
        { q: "Que dit le texte sur les experts ?", options: ["ils sont tous d'accord", "ils restent divisés", "ils n'ont pas d'opinion"], correct: 1 },
        { q: "Le texte prend-il position pour une solution ?", options: ["oui, clairement", "non, il reste neutre", "il ne mentionne pas ce sujet"], correct: 1 },
        { q: "Quel thème central traverse ce passage ?", options: ["la tension entre innovation et régulation", "le coût de la technologie", "l'histoire de l'IA"], correct: 0 }
      ]
    },
    writing: { prompt: "Rédigez un essai nuancé sur la nécessité de réguler les technologies en évolution rapide." },
    speaking: { prompt: "Présentez un argument structuré sur un sujet complexe pendant deux à trois minutes, en répondant à un point de vue opposé." }
  },

  prim: { id: "prim", label: "DELF Prim", group: "Kids", hasContent: false },
  junior: { id: "junior", label: "DELF Junior", group: "Kids", hasContent: false }

};

var LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1"];
var PASS_THRESHOLD = 0.70;

var root = document.getElementById("plRoot");

var state = {
  currentLevelId: null,
  listeningAnswers: [],
  readingAnswers: [],
  writingText: "",
  speakingBlob: null,
  clearedLevels: []
};

var delfAssetsMap = {};

function loadDelfAssets(){
  return fetch(API_BASE + "/api/delfAssets").then(function(res){ return res.json(); }).then(function(assets){
    delfAssetsMap = {};
    (assets || []).forEach(function(a){ delfAssetsMap[a.name] = a.url; });
  }).catch(function(err){
    console.warn("Could not load DELF assets:", err);
  });
}

function render(html){
  root.innerHTML = html;
}

// ---------------- LEVEL PICKER ----------------

function renderLevelPicker(){
  var toutPublic = LEVEL_ORDER.map(function(id){
    var lvl = LEVELS[id];
    return '<button class="pl-level-btn" onclick="startLevel(\'' + id + '\')">' +
      '<div><h3>' + lvl.label + '</h3><p>' + (lvl.hasContent ? "Ready" : "Content coming soon") + '</p></div>' +
      '<span class="pl-arrow">→</span></button>';
  }).join("");

  var kids = ["prim", "junior"].map(function(id){
    var lvl = LEVELS[id];
    return '<button class="pl-level-btn" onclick="startLevel(\'' + id + '\')">' +
      '<div><h3>' + lvl.label + '</h3><p>' + (lvl.hasContent ? "Ready" : "Content coming soon") + '</p></div>' +
      '<span class="pl-arrow">→</span></button>';
  }).join("");

  render(
    '<p class="pl-eyebrow">DELF Placement</p>' +
    '<h1 class="pl-title">Choose the level you\'d like to test into</h1>' +
    '<p class="pl-subtitle">Pick whichever level feels right to you. We\'ll score you honestly and share what we find — the choice of what to do with it is always yours.</p>' +
    '<div class="pl-group-label">Tout Public</div>' +
    '<div class="pl-level-grid">' + toutPublic + '</div>' +
    '<div class="pl-group-label">DELF Prim &amp; Junior</div>' +
    '<div class="pl-level-grid">' + kids + '</div>'
  );
}

function startLevel(levelId){
  var lvl = LEVELS[levelId];
  if(!lvl.hasContent){
    render(
      '<p class="pl-eyebrow">DELF Placement</p>' +
      '<h1 class="pl-title">' + lvl.label + ' is on its way</h1>' +
      '<p class="pl-subtitle">This level\'s content is still being added. You\'re welcome to start your placement at A1 for now.</p>' +
      '<div class="pl-btn-row">' +
      '<button class="pl-btn pl-btn-secondary" onclick="renderLevelPicker()">Back to Levels</button>' +
      '<button class="pl-btn pl-btn-primary" onclick="startLevel(\'a1\')">Start at A1</button>' +
      '</div>'
    );
    return;
  }

  state.currentLevelId = levelId;
  state.listeningAnswers = [];
  state.readingAnswers = [];
  state.writingText = "";
  state.speakingBlob = null;

  root.innerHTML = '<p class="pl-loading">Loading...</p>';
  loadDelfAssets().then(function(){
    renderListening();
  });
}

// ---------------- LISTENING ----------------

function renderListening(){
  var lvl = LEVELS[state.currentLevelId];
  var qs = lvl.listening.questions;

  var qHtml = qs.map(function(item, i){
    var opts = item.options.map(function(opt, oi){
      var selected = state.listeningAnswers[i] === oi ? " pl-selected" : "";
      return '<button class="pl-option' + selected + '" onclick="selectListening(' + i + ',' + oi + ')">' + opt + '</button>';
    }).join("");
    return '<div style="margin-bottom:26px;"><p class="pl-question">' + (i + 1) + '. ' + item.q + '</p><div class="pl-options">' + opts + '</div></div>';
  }).join("");

  var allAnswered = state.listeningAnswers.length === qs.length && state.listeningAnswers.every(function(a){ return a !== undefined; });

  var audioUrl = delfAssetsMap["delf-" + state.currentLevelId + "-listening"];
  var audioBlock;
  if(audioUrl){
    audioBlock = '<div style="margin-bottom:22px;"><audio controls style="width:100%;" src="' + audioUrl + '"></audio></div>';
  } else {
    audioBlock = '<p style="font-size:.85rem;color:#8b92a3;margin-bottom:22px;">Audio for this level has not been uploaded yet. You may still answer the questions below.</p>';
  }

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Listening</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Listen &amp; Answer</span>' +
    '<p style="font-size:.85rem;color:#8b92a3;margin-bottom:16px;">Listen carefully, then answer the questions below.</p>' +
    audioBlock +
    qHtml +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" ' + (allAnswered ? "" : "disabled") + ' onclick="renderReading()">Continue to Reading</button></div>' +
    '</div>'
  );
}

function selectListening(qIndex, optIndex){
  state.listeningAnswers[qIndex] = optIndex;
  renderListening();
}

// ---------------- READING ----------------

function renderReading(){
  var lvl = LEVELS[state.currentLevelId];
  var qs = lvl.reading.questions;

  var qHtml = qs.map(function(item, i){
    var opts = item.options.map(function(opt, oi){
      var selected = state.readingAnswers[i] === oi ? " pl-selected" : "";
      return '<button class="pl-option' + selected + '" onclick="selectReading(' + i + ',' + oi + ')">' + opt + '</button>';
    }).join("");
    return '<div style="margin-bottom:26px;"><p class="pl-question">' + (i + 1) + '. ' + item.q + '</p><div class="pl-options">' + opts + '</div></div>';
  }).join("");

  var allAnswered = state.readingAnswers.length === qs.length && state.readingAnswers.every(function(a){ return a !== undefined; });

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Reading</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Read &amp; Answer</span>' +
    '<p class="pl-passage">' + lvl.reading.passage + '</p>' +
    qHtml +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" ' + (allAnswered ? "" : "disabled") + ' onclick="renderWriting()">Continue to Writing</button></div>' +
    '</div>'
  );
}

function selectReading(qIndex, optIndex){
  state.readingAnswers[qIndex] = optIndex;
  renderReading();
}

// ---------------- WRITING ----------------

function renderWriting(){
  var lvl = LEVELS[state.currentLevelId];

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Writing</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Written Response</span>' +
    '<p class="pl-question">' + lvl.writing.prompt + '</p>' +
    '<textarea class="pl-textarea" id="plWritingInput" placeholder="Écrivez votre réponse ici...">' + state.writingText + '</textarea>' +
    '<div class="pl-pending-note">Your written response is saved. Scoring for Writing will appear once our AI grading feature is live — this does not block your placement result today.</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="submitWriting()">Continue to Speaking</button></div>' +
    '</div>'
  );
}

function submitWriting(){
  state.writingText = document.getElementById("plWritingInput").value;
  renderSpeaking();
}

// ---------------- SPEAKING ----------------

var mediaRecorder = null;
var recordedChunks = [];
var currentStream = null;

function renderSpeaking(){
  var lvl = LEVELS[state.currentLevelId];

  render(
    '<div class="pl-progress-row"><span class="pl-progress-label">Speaking</span><span class="pl-progress-level">Level ' + lvl.label + '</span></div>' +
    '<div class="pl-card">' +
    '<span class="pl-skill-pill">Spoken Response</span>' +
    '<p class="pl-question">' + lvl.speaking.prompt + '</p>' +
    '<div class="pl-record-row">' +
    '<button class="pl-record-btn" id="plRecordBtn" onclick="toggleRecording()">● Record</button>' +
    '<span class="pl-record-status" id="plRecordStatus">' + (state.speakingBlob ? "Recording captured" : "Not recorded yet") + '</span>' +
    '</div>' +
    '<div class="pl-pending-note">Your recording is saved. Scoring for Speaking will appear once our AI grading feature is live — this does not block your placement result today.</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finishLevel()">See My Result</button></div>' +
    '</div>'
  );
}

function toggleRecording(){
  var btn = document.getElementById("plRecordBtn");
  var status = document.getElementById("plRecordStatus");

  if(!mediaRecorder || mediaRecorder.state === "inactive"){
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      currentStream = stream;
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function(e){ recordedChunks.push(e.data); };
      mediaRecorder.onstop = function(){
        state.speakingBlob = new Blob(recordedChunks, { type: "audio/webm" });
        status.textContent = "Recording captured";
        currentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      mediaRecorder.start();
      btn.textContent = "■ Stop";
      btn.classList.add("pl-recording");
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    mediaRecorder.stop();
    btn.textContent = "● Record Again";
    btn.classList.remove("pl-recording");
  }
}

// ---------------- SCORING + LEVEL RESULT ----------------

function scoreLevel(){
  var lvl = LEVELS[state.currentLevelId];
  var total = lvl.listening.questions.length + lvl.reading.questions.length;
  var correct = 0;

  lvl.listening.questions.forEach(function(item, i){
    if(state.listeningAnswers[i] === item.correct) correct++;
  });
  lvl.reading.questions.forEach(function(item, i){
    if(state.readingAnswers[i] === item.correct) correct++;
  });

  return { correct: correct, total: total, pct: correct / total };
}

function finishLevel(){
  var result = scoreLevel();
  var passed = result.pct >= PASS_THRESHOLD;
  var lvl = LEVELS[state.currentLevelId];

  if(passed) state.clearedLevels.push(state.currentLevelId);

  saveResultToFirestore(state.currentLevelId, result, passed);

  var nextIdx = LEVEL_ORDER.indexOf(state.currentLevelId) + 1;
  var nextLevelId = LEVEL_ORDER[nextIdx];
  var canClimb = passed && nextLevelId && LEVELS[nextLevelId].hasContent;
  var nextLevelExistsButLocked = passed && nextLevelId && !LEVELS[nextLevelId].hasContent;

  var pctDisplay = Math.round(result.pct * 100);

  var msg, buttons;

  if(passed && canClimb){
    msg = "Well done — you cleared " + lvl.label + " with " + pctDisplay + "%. Let's see how you do at " + LEVELS[nextLevelId].label + ".";
    buttons = '<div class="pl-btn-row">' +
      '<button class="pl-btn pl-btn-secondary" onclick="finalizeResult()">Stop Here</button>' +
      '<button class="pl-btn pl-btn-primary" onclick="startLevel(\'' + nextLevelId + '\')">Try ' + LEVELS[nextLevelId].label + '</button>' +
      '</div>';
  } else if(passed && nextLevelExistsButLocked){
    msg = "Well done — you cleared " + lvl.label + " with " + pctDisplay + "%. The next level's content is still being added, so this is where your placement stands for now.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else if(passed && !nextLevelId){
    msg = "Excellent — you cleared " + lvl.label + " with " + pctDisplay + "%, the highest level we currently test.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else {
    msg = "You scored " + pctDisplay + "% at " + lvl.label + " — just under our 70% threshold to climb further. That's completely alright, and this gives us an honest picture of where to begin.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  }

  render(
    '<div class="pl-card">' +
    '<div class="pl-result-score">' + pctDisplay + '%</div>' +
    '<p class="pl-result-msg">' + msg + '</p>' +
    buttons +
    '</div>'
  );
}

function finalizeResult(){
  var highestCleared = state.clearedLevels.length > 0
    ? LEVELS[state.clearedLevels[state.clearedLevels.length - 1]].label
    : "Below A1";

  render(
    '<p class="pl-eyebrow">Your Placement</p>' +
    '<h1 class="pl-title">You\'re placed at ' + highestCleared + '</h1>' +
    '<p class="pl-subtitle">This is saved as your baseline on your DELF dashboard. Every test score from your preparation will be added right alongside it, so you can watch your progress from here.</p>' +
    '<div class="pl-btn-row">' +
    '<button class="pl-btn pl-btn-secondary" onclick="renderLevelPicker()">Test Another Level</button>' +
    '<button class="pl-btn pl-btn-primary" onclick="location.href=\'/dashboard/\'">Go to Dashboard</button>' +
    '</div>'
  );
}

// ---------------- FIRESTORE SAVE ----------------

function saveResultToFirestore(levelId, result, passed){
  if(!auth.currentUser){
    console.warn("Not saving placement result - no authenticated user");
    return;
  }

  var uid = auth.currentUser.uid;
  var docData = {
    level: levelId,
    correct: result.correct,
    total: result.total,
    pct: result.pct,
    passed: passed,
    writingResponse: state.writingText || null,
    writingStatus: "pending_ai_grading",
    speakingStatus: state.speakingBlob ? "recorded_pending_ai_grading" : "not_recorded",
    timestamp: serverTimestamp()
  };

  addDoc(collection(db, "delfPlacements", uid, "attempts"), docData)
    .then(function(){
      if(state.speakingBlob){
        var speakingRef = storageRef(storage, "delfPlacements/" + uid + "/" + levelId + "-speaking-" + Date.now() + ".webm");
        uploadBytes(speakingRef, state.speakingBlob).catch(function(err){
          console.error("Speaking upload failed:", err);
        });
      }
    })
    .catch(function(err){
      console.error("Could not save placement result:", err);
    });
}

// ---------------- INIT ----------------

renderLevelPicker();


// Expose functions referenced by dynamically-generated HTML onclick attributes,
// since module scope does not attach them to window automatically.
window.renderLevelPicker = renderLevelPicker;
window.renderReading = renderReading;
window.renderWriting = renderWriting;
window.startLevel = startLevel;
window.selectListening = selectListening;
window.selectReading = selectReading;
window.submitWriting = submitWriting;
window.toggleRecording = toggleRecording;
window.finishLevel = finishLevel;
window.finalizeResult = finalizeResult;
