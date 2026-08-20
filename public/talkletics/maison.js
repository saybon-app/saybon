(function(){

  var API_BASE = "https://saybonapp-server.onrender.com";
  var PASS_MARK = 70;

  var CURRICULUM = [
    { french:"Bonjour", english:"Hello", asset:"mission1-item1", tier:"Words" },
    { french:"Salut", english:"Hi", asset:"mission1-item2", tier:"Words" },
    { french:"Merci", english:"Thanks", asset:"mission1-item3", tier:"Words" },
    { french:"Bonsoir", english:"Good evening", asset:"mission1-item4", tier:"Words" },
    { french:"Pardon", english:"Excuse me", asset:"mission1-item5", tier:"Words" },
    { french:"Comment ça va ?", english:"How are you?", asset:"mission1-item6", tier:"Phrases" },
    { french:"Très bien, merci", english:"Very well, thanks", asset:"mission1-item7", tier:"Phrases" },
    { french:"À bientôt", english:"See you soon", asset:"mission1-item8", tier:"Phrases" },
    { french:"Enchanté", english:"Nice to meet you", asset:"mission1-item9", tier:"Phrases" },
    { french:"Je m'appelle Marie", english:"My name is Marie", asset:"mission1-item10", tier:"Sentences" },
    { french:"Comment vous appelez-vous ?", english:"What is your name?", asset:"mission1-item11", tier:"Sentences" },
    { french:"Bonjour, comment allez-vous aujourd'hui ?", english:"Hello, how are you today?", asset:"mission1-item12", tier:"Sentences" }
  ];

  var assetMap = {};
  var currentIndex = 0;
  var listenCount = 0;
  var scores = new Array(CURRICULUM.length).fill(0);
  var mediaRecorder = null;
  var recordedChunks = [];
  var currentStream = null;
  var sequenceToken = 0;

  var refAudio = document.getElementById("msRefAudio");
  var listenBtn = document.getElementById("msListenBtn");
  var recordBtn = document.getElementById("msRecordBtn");
  var stopBtn = document.getElementById("msStopBtn");
  var submitBtn = document.getElementById("msSubmitBtn");
  var statusEl = document.getElementById("msStatus");
  var frenchEl = document.getElementById("msFrench");
  var englishEl = document.getElementById("msEnglish");
  var itemCounterEl = document.getElementById("msItemCounter");
  var tierLabelEl = document.getElementById("msTierLabel");
  var phaseLabelEl = document.getElementById("msPhaseLabel");
  var dots = document.querySelectorAll(".ms-dot");
  var missionEl = document.getElementById("msMission");
  var feedbackEl = document.getElementById("msFeedback");
  var feedbackScoreEl = document.getElementById("msFeedbackScore");
  var feedbackMsgEl = document.getElementById("msFeedbackMsg");
  var tryAgainBtn = document.getElementById("msTryAgainBtn");
  var nextBtn = document.getElementById("msNextBtn");
  var finalEl = document.getElementById("msFinal");
  var finalScoreEl = document.getElementById("msFinalScore");
  var finalPassEl = document.getElementById("msFinalPass");
  var retakeBtn = document.getElementById("msRetakeBtn");
  var continueBtn = document.getElementById("msContinueBtn");
  var preloaderEl = document.getElementById("msPreloader");
  var preloaderVideo = document.getElementById("msPreloaderVideo");
  var preloaderNote = document.getElementById("msPreloaderNote");
  var cardEl = document.querySelector(".ms-card");
  var preSkipBtn = document.getElementById("msPreSkipBtn");
  var confirmOverlay = document.getElementById("msConfirmOverlay");
  var confirmCancel = document.getElementById("msConfirmCancel");
  var confirmYes = document.getElementById("msConfirmYes");
  var playRecordingBtn = document.getElementById("msPlayRecordingBtn");
  var rerecordBtn = document.getElementById("msRerecordBtn");
  var playbackAudioEl = new Audio();
  var recordedBlobUrl = null;

  var encourageMessages = [
    "So close! Give it another go.",
    "Nice try — let's polish it up.",
    "Almost there, you've got this.",
    "Good effort! One more attempt?"
  ];
  var passMessages = [
    "Beautifully done!",
    "That was great!",
    "Parfait !",
    "You nailed it!"
  ];

  // ===== WAV encoding (proven pattern from Levels prototype) =====
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

  async function convertBlobToWav(blob){
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
    return wavBuffer;
  }

  function updateDots(){
    dots.forEach(function(d, i){
      d.classList.toggle("ms-dot-filled", i < listenCount);
    });
  }

  function resetItemUI(){
    listenCount = 0;
    updateDots();
    listenBtn.style.display = "inline-block";
    listenBtn.disabled = false;
    listenBtn.textContent = "▶ Listen";
    recordBtn.style.display = "none";
    stopBtn.style.display = "none";
    submitBtn.style.display = "none";
    playRecordingBtn.style.display = "none";
    rerecordBtn.style.display = "none";
    statusEl.textContent = "";
    feedbackEl.style.display = "none";
    cardEl.style.display = "block";
    preSkipBtn.style.display = "block";
    phaseLabelEl.textContent = "Tap Listen to begin";
  }

  function renderItem(index){
    sequenceToken++;
    var item = CURRICULUM[index];
    frenchEl.textContent = item.french;
    englishEl.textContent = item.english;
    itemCounterEl.textContent = "Item " + (index+1) + " of " + CURRICULUM.length;
    tierLabelEl.textContent = item.tier;
    refAudio.src = assetMap[item.asset] || "";
    resetItemUI();
  }

  // ===== Locked auto-play sequence: one click starts everything =====
  listenBtn.addEventListener("click", function(){
    if(!refAudio.src){
      statusEl.textContent = "Reference audio not uploaded yet for this item.";
      return;
    }
    listenBtn.style.display = "none";
    phaseLabelEl.textContent = "Listen intently...";
    runAutoSequence(sequenceToken);
  });

  function runAutoSequence(token){
    if(token !== sequenceToken) return;
    refAudio.currentTime = 0;
    refAudio.play();
  }

  refAudio.addEventListener("ended", function(){
    var token = sequenceToken;

    listenCount++;
    updateDots();

    if(listenCount === 3){
      phaseLabelEl.textContent = "Get ready — you'll record exactly what you hear once the audio stops.";
    }

    if(listenCount >= 6){
      phaseLabelEl.textContent = "Record a replica — the closer, the higher your score!";
      recordBtn.style.display = "inline-block";
      return;
    }

    setTimeout(function(){
      runAutoSequence(token);
    }, 500);
  });

  recordBtn.addEventListener("click", async function(){
    try{
      currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }catch(err){
      statusEl.textContent = "Microphone access is needed to record.";
      return;
    }
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(currentStream);
    mediaRecorder.ondataavailable = function(e){ recordedChunks.push(e.data); };
    mediaRecorder.start();
    recordBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
    statusEl.textContent = "Recording...";
  });

  stopBtn.addEventListener("click", function(){
    mediaRecorder.stop();
    currentStream.getTracks().forEach(function(t){ t.stop(); });
    stopBtn.style.display = "none";

    mediaRecorder.addEventListener("stop", function(){
      var blob = new Blob(recordedChunks);
      if(recordedBlobUrl){
        URL.revokeObjectURL(recordedBlobUrl);
      }
      recordedBlobUrl = URL.createObjectURL(blob);
      playbackAudioEl.src = recordedBlobUrl;

      playRecordingBtn.style.display = "inline-block";
      rerecordBtn.style.display = "inline-block";
      submitBtn.style.display = "inline-block";
      statusEl.textContent = "Listen back, re-record, or submit when ready.";
    }, { once: true });
  });

  playRecordingBtn.addEventListener("click", function(){
    playbackAudioEl.currentTime = 0;
    playbackAudioEl.play();
  });

  rerecordBtn.addEventListener("click", function(){
    playRecordingBtn.style.display = "none";
    rerecordBtn.style.display = "none";
    submitBtn.style.display = "none";
    recordBtn.style.display = "inline-block";
    statusEl.textContent = "";
  });

  submitBtn.addEventListener("click", async function(){

    submitBtn.disabled = true;
    preSkipBtn.style.display = "none";
    statusEl.textContent = "Analyzing your pronunciation...";

    try{

      var blob = new Blob(recordedChunks);
      var wavBuffer = await convertBlobToWav(blob);
      var item = CURRICULUM[currentIndex];

      var res = await fetch(API_BASE + "/api/assessPronunciation?referenceText=" + encodeURIComponent(item.french), {
        method: "POST",
        headers: { "Content-Type": "audio/wav" },
        body: wavBuffer
      });

      var data = await res.json();

      if(!res.ok){
        statusEl.textContent = "Could not assess that recording. Please try again.";
        submitBtn.disabled = false;
        preSkipBtn.style.display = "block";
        return;
      }

      var score = Math.round(data.finalScore || 0);
      if(score > scores[currentIndex]) scores[currentIndex] = score;

      showFeedback(score);

    }catch(err){
      console.error(err);
      statusEl.textContent = "Something went wrong. Please try again.";
      submitBtn.disabled = false;
      preSkipBtn.style.display = "block";
    }

  });

  function showFeedback(score){
    cardEl.style.display = "none";
    feedbackEl.style.display = "block";
    feedbackScoreEl.textContent = score + "%";

    var passed = score >= PASS_MARK;
    feedbackMsgEl.textContent = passed
      ? passMessages[Math.floor(Math.random()*passMessages.length)]
      : encourageMessages[Math.floor(Math.random()*encourageMessages.length)];

    tryAgainBtn.style.display = "inline-block";
    nextBtn.textContent = passed ? "Next" : "Skip";
  }

  tryAgainBtn.addEventListener("click", function(){
    submitBtn.disabled = false;
    renderItem(currentIndex);
  });

  function advanceItem(){
    submitBtn.disabled = false;
    currentIndex++;
    if(currentIndex >= CURRICULUM.length){
      showFinal();
    } else {
      renderItem(currentIndex);
    }
  }

  nextBtn.addEventListener("click", advanceItem);

  // ===== Pre-submit skip, with confirmation =====
  preSkipBtn.addEventListener("click", function(){
    confirmOverlay.style.display = "flex";
  });
  confirmCancel.addEventListener("click", function(){
    confirmOverlay.style.display = "none";
  });
  confirmYes.addEventListener("click", function(){
    confirmOverlay.style.display = "none";
    sequenceToken++;
    refAudio.pause();
    advanceItem();
  });

  function showFinal(){
    missionEl.querySelector(".ms-topbar").style.display = "none";
    cardEl.style.display = "none";
    feedbackEl.style.display = "none";
    finalEl.style.display = "block";

    var avg = Math.round(scores.reduce(function(a,b){return a+b;},0) / scores.length);
    var passed = avg >= PASS_MARK;

    finalScoreEl.textContent = avg + "%";
    finalPassEl.textContent = passed
      ? "Pass mark: " + PASS_MARK + "% — You passed!"
      : "Pass mark: " + PASS_MARK + "% — Not quite yet.";
    finalPassEl.style.color = passed ? "#3f9f3f" : "#c23e3e";

    playHypeVideo();
  }

  function playHypeVideo(){
    var lastShown = localStorage.getItem("tkHypeLastShown");
    var nextAsset = lastShown === "1" ? "mission-complete-hype-2" : "mission-complete-hype-1";
    var nextFlag = lastShown === "1" ? "2" : "1";

    var url = assetMap[nextAsset];
    if(!url) return;

    var hypeWrap = document.getElementById("msHypeVideo");
    var hypeVideo = document.getElementById("msHypeVideoEl");
    var hypeClose = document.getElementById("msHypeClose");

    hypeVideo.src = url;
    hypeWrap.style.display = "block";
    hypeVideo.play().catch(function(){});

    hypeVideo.addEventListener("click", function(){
      hypeVideo.muted = !hypeVideo.muted;
    });
    hypeClose.addEventListener("click", function(){
      hypeVideo.pause();
      hypeWrap.style.display = "none";
    });
    hypeVideo.addEventListener("ended", function(){
      hypeWrap.style.display = "none";
    });

    localStorage.setItem("tkHypeLastShown", nextFlag);
  }

  retakeBtn.addEventListener("click", function(){
    currentIndex = 0;
    scores = new Array(CURRICULUM.length).fill(0);
    missionEl.querySelector(".ms-topbar").style.display = "flex";
    finalEl.style.display = "none";
    renderItem(0);
  });

  continueBtn.addEventListener("click", function(){
    window.location.href = "mission2.html";
  });

  // ===== Guide intro screen =====
  function startMission(){
    var guideAudio = document.getElementById("msGuideAudio");
    guideAudio.pause();
    document.getElementById("msGuideAvatarBtn").classList.remove("ms-guide-active");

    document.getElementById("msGuideIntro").style.display = "none";
    missionEl.style.display = "flex";
    missionEl.style.flexDirection = "column";
    missionEl.style.alignItems = "center";
    renderItem(0);
  }

  function showGuideIntro(){
    preloaderEl.classList.add("ms-preloader-fadeout");
    setTimeout(function(){
      preloaderEl.style.display = "none";
      document.getElementById("msGuideIntro").style.display = "flex";
    }, 600);
  }

  function setupGuideHelp(){
    var avatarImg = document.getElementById("msGuideAvatarImg");
    var avatarBtn = document.getElementById("msGuideAvatarBtn");
    var guideAudio = document.getElementById("msGuideAudio");
    var startBtn = document.getElementById("msGuideStartBtn");
    var skipBtn = document.getElementById("msGuideSkipBtn");

    if(assetMap["guide-photo"]){
      avatarImg.src = assetMap["guide-photo"];
    }
    if(assetMap["guide-instructions"]){
      guideAudio.src = assetMap["guide-instructions"];
    }

    avatarBtn.addEventListener("click", function(){
      if(!guideAudio.src) return;
      if(guideAudio.paused){
        guideAudio.currentTime = 0;
        guideAudio.play();
        avatarBtn.classList.add("ms-guide-active");
      } else {
        guideAudio.pause();
        avatarBtn.classList.remove("ms-guide-active");
      }
    });
    guideAudio.addEventListener("ended", function(){
      avatarBtn.classList.remove("ms-guide-active");
    });

    startBtn.addEventListener("click", startMission);
    skipBtn.addEventListener("click", startMission);
  }

  // ===== Init: load assets, run preloader with mobile-safe fallback =====
  async function init(){

    try{
      var res = await fetch(API_BASE + "/api/assets");
      var assets = await res.json();
      assets.forEach(function(a){ assetMap[a.name] = a.url; });
    }catch(err){
      console.error(err);
    }

    if(assetMap["mission-preloader"]){
      preloaderVideo.src = assetMap["mission-preloader"];
      preloaderVideo.muted = true;
      preloaderVideo.defaultMuted = true;
      preloaderNote.style.display = "none";
      preloaderVideo.load();

      var advanced = false;
      var safeAdvance = function(){
        if(advanced) return;
        advanced = true;
        showGuideIntro();
      };

      var attemptPlay = function(){
        preloaderVideo.play().catch(function(){});
      };
      attemptPlay();
      preloaderVideo.addEventListener("canplay", attemptPlay);
      preloaderVideo.addEventListener("ended", safeAdvance);

      setTimeout(function(){
        if(preloaderVideo.paused){
          safeAdvance();
        }
      }, 1800);

    } else {
      preloaderNote.style.display = "block";
      preloaderNote.textContent = "Preloader video not uploaded yet — continuing…";
      setTimeout(showGuideIntro, 1500);
    }

    setupGuideHelp();

  }

  init();

})();