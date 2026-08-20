(function(){

  var API_BASE = "https://saybonapp-server.onrender.com";
  var TIME_KEY = "tkAudioTime";
  var MUTED_KEY = "tkAudioMuted";
  var UNLOCKED_KEY = "tkAudioUnlocked";

  var audio = document.createElement("audio");
  audio.loop = true;
  audio.style.display = "none";
  document.body.appendChild(audio);

  var muteBtn = document.createElement("button");
  muteBtn.setAttribute("aria-label", "Toggle music");
  muteBtn.style.cssText = "position:fixed;bottom:14px;right:14px;width:42px;height:42px;border-radius:50%;background:rgba(20,30,50,.55);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.3);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:999;font-size:18px;";

  function updateMuteIcon(){
    muteBtn.textContent = audio.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
  }

  function findBackgroundMusic(){
    return fetch(API_BASE + "/api/assets")
      .then(function(res){ return res.json(); })
      .then(function(assets){
        return assets.find(function(a){
          return a.type === "audio" && a.name.toLowerCase() === "background-music";
        });
      })
      .catch(function(){ return null; });
  }

  function attemptPlay(){
    var playPromise = audio.play();
    if(playPromise !== undefined){
      playPromise.catch(function(){
        // autoplay blocked - wait for the mute button tap to unlock
      });
    }
  }

  findBackgroundMusic().then(function(asset){

    if(!asset) return;

    audio.src = asset.url;

    var savedTime = parseFloat(sessionStorage.getItem(TIME_KEY) || "0");
    var savedMuted = sessionStorage.getItem(MUTED_KEY) === "true";
    var unlocked = sessionStorage.getItem(UNLOCKED_KEY) === "true";

    audio.muted = savedMuted;
    updateMuteIcon();

    audio.addEventListener("loadedmetadata", function(){
      if(savedTime > 0 && savedTime < audio.duration){
        audio.currentTime = savedTime;
      }
      if(unlocked){
        attemptPlay();
      }
    });

    setInterval(function(){
      if(!audio.paused){
        sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
      }
    }, 2000);

    window.addEventListener("pagehide", function(){
      sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    });

    muteBtn.addEventListener("click", function(){
      sessionStorage.setItem(UNLOCKED_KEY, "true");
      if(audio.paused){
        attemptPlay();
      }
      audio.muted = !audio.muted;
      sessionStorage.setItem(MUTED_KEY, String(audio.muted));
      updateMuteIcon();
    });

    document.body.appendChild(muteBtn);

  });

})();