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
      script: "Bonjour, je m'appelle Claire Dubois. J'ai vingt-huit ans et j'habite à  Lyon avec mon frère Marc. Je travaille comme professeure dans une École primaire. Le matin, je me lève à  sept heures et je prends le bus pour aller au travail. Le week-end, j'aime lire des livres et faire du sport avec des amis.",
      questions: [
        { q: "Quel est le nom de famille de Claire ?", options: ["Dubois", "Dupont", "Durand"], correct: 0 },
        { q: "Quel âge a Claire ?", options: ["18 ans", "28 ans", "38 ans"], correct: 1 },
        { q: "Avec qui habite-t-elle ?", options: ["sa sÅ“ur", "son frère", "ses parents"], correct: 1 },
        { q: "Que fait Claire comme mÉtier ?", options: ["infirmière", "professeure", "vendeuse"], correct: 1 },
        { q: "Comment va-t-elle au travail ?", options: ["en voiture", "à  pied", "en bus"], correct: 2 }
      ]
    },
    reading: {
      passage: "Paul travaille dans un grand bureau au centre-ville. Il commence à  huit heures et demie et termine à  dix-sept heures trente. Le midi, il mange avec ses collègues dans un petit restaurant près du bureau. Il aime son travail parce que l'ambiance est agrÉable, même si parfois il trouve les journÉes un peu longues.",
      questions: [
        { q: "Où travaille Paul ?", options: ["dans une usine", "dans un bureau", "dans un magasin"], correct: 1 },
        { q: "Ã€ quelle heure commence-t-il ?", options: ["8h", "8h30", "9h"], correct: 1 },
        { q: "Où mange-t-il le midi ?", options: ["chez lui", "au bureau", "dans un restaurant"], correct: 2 },
        { q: "Pourquoi aime-t-il son travail ?", options: ["le bon salaire", "la bonne ambiance", "les horaires courts"], correct: 1 },
        { q: "Comment sont ses journÉes, parfois ?", options: ["courtes", "longues", "difficiles"], correct: 1 }
      ]
    },
    writing: { prompt: "PrÉsentez-vous en quelques phrases : votre nom, votre âge, et ce que vous aimez faire." },
    speaking: { prompt: "Parlez de votre famille pendant une minute." }
  },

  a2: {
    id: "a2", label: "A2", group: "Tout Public", hasContent: true,
    listening: {
      script: "Hier, Sophie a visitÉ le musÉe avec sa meilleure amie, LÉa. Elles sont arrivÉes à  dix heures du matin et sont restÉes jusqu'à  midi. Après la visite, elles ont dÉjeunÉ dans un cafÉ en face du musÉe. Sophie a achetÉ deux cartes postales pour sa grand-mère, qui habite en Belgique.",
      questions: [
        { q: "Avec qui Sophie a-t-elle visitÉ le musÉe ?", options: ["sa sÅ“ur", "sa meilleure amie", "sa grand-mère"], correct: 1 },
        { q: "Ã€ quelle heure sont-elles arrivÉes ?", options: ["9h", "10h", "11h"], correct: 1 },
        { q: "Où ont-elles dÉjeunÉ ?", options: ["au musÉe", "dans un cafÉ", "chez LÉa"], correct: 1 },
        { q: "Qu'est-ce que Sophie a achetÉ ?", options: ["un livre", "deux cartes postales", "un souvenir"], correct: 1 },
        { q: "Où habite la grand-mère de Sophie ?", options: ["en France", "en Belgique", "en Italie"], correct: 1 }
      ]
    },
    reading: {
      passage: "Un nouveau restaurant italien a ouvert ses portes le mois dernier au centre-ville. Le propriÉtaire, originaire de Naples, prÉpare chaque plat de faÇon traditionnelle, avec des ingrÉdients importÉs d'Italie. Les prix sont raisonnables pour la qualitÉ proposÉe. Cependant, plusieurs clients se plaignent que le service est parfois très lent, surtout le week-end.",
      questions: [
        { q: "Quand le restaurant a-t-il ouvert ?", options: ["la semaine dernière", "le mois dernier", "l'annÉe dernière"], correct: 1 },
        { q: "D'où vient le propriÉtaire ?", options: ["Rome", "Naples", "Milan"], correct: 1 },
        { q: "Comment sont prÉparÉs les plats ?", options: ["de faÇon moderne", "de faÇon traditionnelle", "de faÇon rapide"], correct: 1 },
        { q: "Que pensent les clients des prix ?", options: ["trop chers", "raisonnables", "trop bas"], correct: 1 },
        { q: "Quel est le problème principal signalÉ ?", options: ["la nourriture", "le service lent", "les prix"], correct: 1 }
      ]
    },
    writing: { prompt: "Racontez votre dernier week-end : où êtes-vous allÉ(e), avec qui, et qu'avez-vous fait ?" },
    speaking: { prompt: "DÉcrivez votre quartier pendant une minute : ce que vous aimez et ce que vous n'aimez pas." }
  },

  b1: {
    id: "b1", label: "B1", group: "Tout Public", hasContent: true,
    listening: {
      script: "Beaucoup de gens pensent que le tÉlÉtravail amÉliore la qualitÉ de vie parce qu'il permet d'Éviter les longs trajets et d'organiser sa journÉe plus librement. Cependant, certains employÉs trouvent qu'il est difficile de sÉparer vie professionnelle et vie personnelle, et ils se sentent parfois isolÉs sans contact rÉgulier avec leurs collègues. La plupart des experts s'accordent à  dire que le tÉlÉtravail fonctionne mieux quand il est combinÉ avec quelques jours au bureau chaque semaine.",
      questions: [
        { q: "Selon certains, quel est l'avantage du tÉlÉtravail ?", options: ["un meilleur salaire", "Éviter les trajets", "plus de vacances"], correct: 1 },
        { q: "Quelle difficultÉ certains employÉs rencontrent-ils ?", options: ["le manque d'Équipement", "sÉparer vie pro et vie perso", "trouver un emploi"], correct: 1 },
        { q: "Que ressentent parfois les employÉs en tÉlÉtravail ?", options: ["de la fatigue", "de l'isolement", "de l'ennui"], correct: 1 },
        { q: "Que recommandent la plupart des experts ?", options: ["tÉlÉtravail uniquement", "bureau uniquement", "un mÉlange des deux"], correct: 2 },
        { q: "Quel est le ton gÉnÉral de ce passage ?", options: ["entièrement positif", "entièrement nÉgatif", "nuancÉ"], correct: 2 }
      ]
    },
    reading: {
      passage: "L'utilisation des rÉseaux sociaux chez les adolescents suscite un dÉbat animÉ. D'un côtÉ, ces plateformes permettent de rester en contact avec des amis et de dÉcouvrir de nouvelles idÉes. De l'autre, certains chercheurs s'inquiètent de leur effet sur le sommeil et la concentration. MalgrÉ ces prÉoccupations, la plupart des parents choisissent de superviser l'utilisation plutôt que de l'interdire complètement.",
      questions: [
        { q: "Quel est un avantage mentionnÉ des rÉseaux sociaux ?", options: ["amÉliorer le sommeil", "rester en contact avec des amis", "gagner de l'argent"], correct: 1 },
        { q: "Quelle est une inquiÉtude des chercheurs ?", options: ["le coût", "l'effet sur le sommeil et la concentration", "la sÉcuritÉ des donnÉes"], correct: 1 },
        { q: "Que font la plupart des parents ?", options: ["ils interdisent tout", "ils supervisent l'utilisation", "ils ignorent le problème"], correct: 1 },
        { q: "Le ton du passage est-il...", options: ["pour l'interdiction totale", "entièrement favorable", "ÉquilibrÉ"], correct: 2 },
        { q: "Quel groupe est concernÉ par ce dÉbat ?", options: ["les adolescents", "les retraitÉs", "les enseignants"], correct: 0 }
      ]
    },
    writing: { prompt: "Donnez votre opinion sur l'effet des rÉseaux sociaux sur les jeunes, en justifiant votre point de vue." },
    speaking: { prompt: "Donnez votre opinion sur un sujet d'actualitÉ, avec au moins deux arguments." }
  },

  b2: {
    id: "b2", label: "B2", group: "Tout Public", hasContent: true,
    listening: {
      script: "La transition ÉnergÉtique fait l'objet de dÉbats intenses. Certains soulignent qu'elle crÉera de nombreux emplois dans les Énergies renouvelables et rÉduira notre dÉpendance aux combustibles fossiles. D'autres craignent que cette transition menace des milliers d'emplois dans les industries traditionnelles, notamment le charbon et le pÉtrole, sans offrir de reconversion suffisante aux travailleurs concernÉs. Les dÉcideurs politiques tentent de trouver un Équilibre entre ces deux rÉalitÉs.",
      questions: [
        { q: "Quel est un argument en faveur de la transition ÉnergÉtique ?", options: ["baisse des impôts", "crÉation d'emplois dans le renouvelable", "plus de vacances"], correct: 1 },
        { q: "Quelle est une crainte exprimÉe ?", options: ["la hausse des prix", "la perte d'emplois traditionnels", "le manque d'ÉlectricitÉ"], correct: 1 },
        { q: "Quel secteur est mentionnÉ comme menacÉ ?", options: ["l'agriculture", "le charbon et le pÉtrole", "la technologie"], correct: 1 },
        { q: "Que cherchent à  faire les dÉcideurs politiques ?", options: ["ignorer le problème", "trouver un Équilibre", "choisir un seul camp"], correct: 1 },
        { q: "Quel est le ton gÉnÉral de cet extrait ?", options: ["optimiste", "alarmiste", "ÉquilibrÉ"], correct: 2 }
      ]
    },
    reading: {
      passage: "La santÉ mentale occupe une place de plus en plus importante dans le dÉbat public, ce qui reprÉsente une avancÉe significative après des dÉcennies de silence. Toutefois, l'accès aux soins reste inÉgal : certaines personnes bÉnÉficient rapidement d'un accompagnement de qualitÉ, tandis que d'autres attendent des mois, faute de moyens ou de professionnels disponibles dans leur rÉgion. Ce système à  deux vitesses inquiète de nombreux spÉcialistes.",
      questions: [
        { q: "Comment la place de la santÉ mentale dans le dÉbat public a-t-elle ÉvoluÉ ?", options: ["elle a diminuÉ", "elle a augmentÉ", "elle est restÉe stable"], correct: 1 },
        { q: "Quel problème est mentionnÉ concernant l'accès aux soins ?", options: ["le coût uniquement", "l'inÉgalitÉ d'accès", "le manque d'intÉrêt du public"], correct: 1 },
        { q: "Pourquoi certaines personnes attendent-elles des mois ?", options: ["manque de moyens ou de professionnels", "manque d'intÉrêt", "trop de demandes urgentes"], correct: 0 },
        { q: "Comment est dÉcrit le système actuel ?", options: ["parfaitement Équitable", "à  deux vitesses", "entièrement gratuit"], correct: 1 },
        { q: "Qui s'inquiète de cette situation ?", options: ["les patients uniquement", "de nombreux spÉcialistes", "le gouvernement uniquement"], correct: 1 }
      ]
    },
    writing: { prompt: "RÉdigez un texte argumentÉ sur les avantages et les inconvÉnients du tÉlÉtravail gÉnÉralisÉ." },
    speaking: { prompt: "PrÉsentez et dÉfendez un point de vue sur un sujet de sociÉtÉ pendant deux minutes, en anticipant un argument contraire." }
  },

  c1: {
    id: "c1", label: "C1", group: "Tout Public", hasContent: true,
    listening: {
      script: "Dans le monde de l'artisanat, un dÉbat subtil oppose les dÉfenseurs de la tradition à  ceux qui prônent l'innovation. Certains artisans estiment que prÉserver des techniques ancestrales est essentiel pour ne pas perdre un savoir-faire unique, tandis que d'autres soutiennent que refuser toute Évolution condamne ces mÉtiers à  disparaître faute de rentabilitÉ. Il ne s'agit pas tant de choisir un camp que de trouver comment faire dialoguer hÉritage et modernitÉ sans que l'un n'efface l'autre.",
      questions: [
        { q: "Que dÉfendent certains artisans traditionalistes ?", options: ["la rentabilitÉ avant tout", "la prÉservation du savoir-faire ancestral", "l'abandon des mÉthodes anciennes"], correct: 1 },
        { q: "Quel risque Évoquent les partisans de l'innovation ?", options: ["la disparition des mÉtiers par manque de rentabilitÉ", "la perte de qualitÉ", "la concurrence Étrangère"], correct: 0 },
        { q: "Que suggère le passage comme solution ?", options: ["choisir dÉfinitivement un camp", "faire dialoguer hÉritage et modernitÉ", "abandonner l'artisanat"], correct: 1 },
        { q: "Quel est le ton de ce passage ?", options: ["tranchÉ", "nuancÉ", "indiffÉrent"], correct: 1 },
        { q: "Ce dÉbat concerne principalement...", options: ["l'industrie technologique", "l'artisanat", "l'agriculture"], correct: 1 }
      ]
    },
    reading: {
      passage: "La rÉgulation de l'intelligence artificielle soulève une tension difficile à  rÉsoudre. D'une part, une rÉgulation stricte pourrait freiner l'innovation et dÉsavantager les entreprises locales face à  une concurrence internationale moins contrainte. D'autre part, l'absence de cadre clair risque d'aggraver les inÉgalitÉs dÉjà  provoquÉes par l'automatisation, en laissant le champ libre aux acteurs les plus puissants. Aucune solution ne semble pleinement satisfaisante, et les experts eux-mêmes restent divisÉs.",
      questions: [
        { q: "Quel est un risque d'une rÉgulation stricte ?", options: ["freiner l'innovation", "trop de contrôle gouvernemental", "rien de spÉcifique"], correct: 0 },
        { q: "Quel est un risque de l'absence de rÉgulation ?", options: ["moins d'innovation", "aggravation des inÉgalitÉs", "hausse des impôts"], correct: 1 },
        { q: "Que dit le texte sur les experts ?", options: ["ils sont tous d'accord", "ils restent divisÉs", "ils n'ont pas d'opinion"], correct: 1 },
        { q: "Le texte prend-il position pour une solution ?", options: ["oui, clairement", "non, il reste neutre", "il ne mentionne pas ce sujet"], correct: 1 },
        { q: "Quel thème central traverse ce passage ?", options: ["la tension entre innovation et rÉgulation", "le coût de la technologie", "l'histoire de l'IA"], correct: 0 }
      ]
    },
    writing: { prompt: "RÉdigez un essai nuancÉ sur la nÉcessitÉ de rÉguler les technologies en Évolution rapide." },
    speaking: { prompt: "PrÉsentez un argument structurÉ sur un sujet complexe pendant deux à  trois minutes, en rÉpondant à  un point de vue opposÉ." }
  },

  prim: { id: "prim", label: "DELF Prim", group: "Kids", hasContent: false },
  junior: { id: "junior", label: "DELF Junior", group: "Kids", hasContent: false }

};

var LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1"];
var PASS_THRESHOLD = 0.70;

var accentChars = ["É","è","ê","à ","Ç","ù","ô","î","Å“","«","»"];

function buildAccentKeyboard(targetInput){
  var wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.gap = "6px";
  wrap.style.marginBottom = "20px";

  accentChars.forEach(function(ch){
    var key = document.createElement("span");
    key.textContent = ch;
    key.style.display = "inline-block";
    key.style.padding = "6px 11px";
    key.style.borderRadius = "7px";
    key.style.cursor = "pointer";
    key.style.background = "rgba(212,175,106,.12)";
    key.style.color = "#d4af6a";
    key.style.fontSize = "15px";
    key.style.border = "1px solid rgba(212,175,106,.25)";
    key.onclick = function(){
      var start = targetInput.selectionStart;
      var end = targetInput.selectionEnd;
      var val = targetInput.value;
      targetInput.value = val.slice(0, start) + ch + val.slice(end);
      targetInput.selectionStart = targetInput.selectionEnd = start + ch.length;
      targetInput.focus();
    };
    wrap.appendChild(key);
  });

  return wrap;
}

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
      '<span class="pl-arrow">â†’</span></button>';
  }).join("");

  var kids = ["prim", "junior"].map(function(id){
    var lvl = LEVELS[id];
    return '<button class="pl-level-btn" onclick="startLevel(\'' + id + '\')">' +
      '<div><h3>' + lvl.label + '</h3><p>' + (lvl.hasContent ? "Ready" : "Content coming soon") + '</p></div>' +
      '<span class="pl-arrow">â†’</span></button>';
  }).join("");

  render(
    '<p class="pl-eyebrow">DELF Placement</p>' +
    '<h1 class="pl-title">Choose the level you\'d like to test into</h1>' +
    '<p class="pl-subtitle">Pick whichever level feels right to you. We\'ll score you honestly and share what we find - the choice of what to do with it is always yours.</p>' +
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
    '<textarea class="pl-textarea" id="plWritingInput" placeholder="Écrivez votre rÉponse ici...">' + state.writingText + '</textarea>' +
    '<div class="pl-accent-row" id="plAccentRow"></div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="submitWriting()">Continue to Speaking</button></div>' +
    '</div>'
  );

  var accentTarget = document.getElementById("plWritingInput");
  var accentRow = document.getElementById("plAccentRow");
  accentRow.appendChild(buildAccentKeyboard(accentTarget));
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
    '<canvas id="plWaveCanvas" class="pl-wave-canvas" width="280" height="56" style="display:none;"></canvas>' +
    '<div class="pl-record-row">' +
    '<button class="pl-record-btn" id="plRecordBtn" onclick="toggleRecording()">â— Record</button>' +
    '<span class="pl-record-status" id="plRecordStatus">' + (state.speakingBlob ? "Recording captured" : "Not recorded yet") + '</span>' +
    '</div>' +
    '<div class="pl-playback-row" id="plPlaybackRow" style="display:none;">' +
    '<button class="pl-btn pl-btn-secondary" id="plPlayBtn">&#9658; Play My Recording</button>' +
    '<button class="pl-btn pl-btn-secondary" id="plRerecordBtn">&#8635; Re-record</button>' +
    '</div>' +
    '<audio id="plPlaybackAudio" style="display:none;"></audio>' +
    '<div class="pl-pending-note">Your recording is saved and will be scored shortly.</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finishLevel()">See My Result</button></div>' +
    '</div>'
  );

  document.getElementById("plPlayBtn").addEventListener("click", playRecording);
  document.getElementById("plRerecordBtn").addEventListener("click", reRecordSpeaking);
}

var plAudioCtx = null;
var plWaveAnimId = null;

function startWave(streamOrElement, isElement){
  var canvas = document.getElementById("plWaveCanvas");
  var ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  if(!plAudioCtx){
    plAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var analyser = plAudioCtx.createAnalyser();
  analyser.fftSize = 64;

  if(isElement){
    if(!streamOrElement._plWaveSource){
      streamOrElement._plWaveSource = plAudioCtx.createMediaElementSource(streamOrElement);
      streamOrElement._plWaveSource.connect(plAudioCtx.destination);
    }
    streamOrElement._plWaveSource.connect(analyser);
  } else {
    var source = plAudioCtx.createMediaStreamSource(streamOrElement);
    source.connect(analyser);
  }

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  function draw(){
    plWaveAnimId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var barWidth = (canvas.width / bufferLength) * 1.8;
    var x = 0;
    for(var i = 0; i < bufferLength; i++){
      var barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = "#d4af6a";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 2;
    }
  }
  draw();
}

function stopWave(){
  if(plWaveAnimId){
    cancelAnimationFrame(plWaveAnimId);
    plWaveAnimId = null;
  }
  var canvas = document.getElementById("plWaveCanvas");
  if(canvas){
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
}

function playRecording(){
  var playBtn = document.getElementById("plPlayBtn");
  var audioEl = document.getElementById("plPlaybackAudio");
  var originalLabel = playBtn.innerHTML;
  playBtn.innerHTML = '<span class="pl-loading-pulse"></span>Loading...';
  playBtn.disabled = true;

  audioEl.src = URL.createObjectURL(state.speakingBlob);

  var onReady = function(){
    playBtn.innerHTML = originalLabel;
    playBtn.disabled = false;
    startWave(audioEl, true);
    audioEl.currentTime = 0;
    audioEl.play();
  };

  audioEl.addEventListener("canplay", onReady, { once: true });
  audioEl.addEventListener("ended", stopWave, { once: true });
}

function reRecordSpeaking(){
  state.speakingBlob = null;
  document.getElementById("plPlaybackRow").style.display = "none";
  var btn = document.getElementById("plRecordBtn");
  btn.style.display = "inline-block";
  btn.textContent = "â— Record";
  btn.classList.remove("pl-recording");
  document.getElementById("plRecordStatus").textContent = "Not recorded yet";
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
        stopWave();
        document.getElementById("plRecordBtn").style.display = "none";
        document.getElementById("plPlaybackRow").style.display = "flex";
        currentStream.getTracks().forEach(function(t){ t.stop(); });
      };
      mediaRecorder.start();
      startWave(stream, false);
      btn.textContent = "â–  Stop";
      btn.classList.add("pl-recording");
      status.textContent = "Recording...";
    }).catch(function(err){
      status.textContent = "Microphone access denied";
      console.error(err);
    });
  } else {
    mediaRecorder.stop();
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
    msg = "Well done - you cleared " + lvl.label + " with " + pctDisplay + "%. Let's see how you do at " + LEVELS[nextLevelId].label + ".";
    buttons = '<div class="pl-btn-row">' +
      '<button class="pl-btn pl-btn-secondary" onclick="finalizeResult()">Stop Here</button>' +
      '<button class="pl-btn pl-btn-primary" onclick="startLevel(\'' + nextLevelId + '\')">Try ' + LEVELS[nextLevelId].label + '</button>' +
      '</div>';
  } else if(passed && nextLevelExistsButLocked){
    msg = "Well done - you cleared " + lvl.label + " with " + pctDisplay + "%. The next level's content is still being added, so this is where your placement stands for now.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else if(passed && !nextLevelId){
    msg = "Excellent - you cleared " + lvl.label + " with " + pctDisplay + "%, the highest level we currently test.";
    buttons = '<div class="pl-btn-row"><button class="pl-btn pl-btn-primary" onclick="finalizeResult()">See My Placement</button></div>';
  } else {
    msg = "You scored " + pctDisplay + "% at " + lvl.label + " - just under our 70% threshold to climb further. That's completely alright, and this gives us an honest picture of where to begin.";
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
    '<button class="pl-btn pl-btn-primary" onclick="location.href=\'/delf/tout-public/\'">Begin Your Preparation</button>' +
    '</div>' +
    '<div class="pl-btn-row"><button class="pl-btn pl-btn-secondary" onclick="location.href=\'/dashboard/\'">Go to Dashboard</button></div>'
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
window.renderReading = renderReading;
window.renderWriting = renderWriting;
window.startLevel = startLevel;
window.selectListening = selectListening;
window.selectReading = selectReading;
window.submitWriting = submitWriting;
window.toggleRecording = toggleRecording;
window.finishLevel = finishLevel;
window.finalizeResult = finalizeResult;



