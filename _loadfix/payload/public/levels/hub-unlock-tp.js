const API_BASE = "https://saybonapp-server.onrender.com";

var pathParts = location.pathname.split("/").filter(Boolean);
var LEVEL;
if(pathParts.indexOf("tout-public") !== -1){ LEVEL = "a0-tout-public"; }
else { LEVEL = pathParts[1].toLowerCase(); }

// Sets every lesson tile to the right state in one pass (unlock AND lock), so it can be called twice
// (saved copy first, live answer second) without ever flipping a tile back and forth.
function applyUnlocks(maxUnlocked){
  var buttons = document.querySelectorAll(".lesson");
  buttons.forEach(function(btn){
    var numSpan = btn.querySelector(".tp-num");
    if(!numSpan) return;
    var num = parseInt(numSpan.textContent);
    var lockIcon = btn.querySelector(".tp-lock");
    if(num <= maxUnlocked){
      btn.classList.remove("locked");
      btn.classList.add("unlocked");
      if(lockIcon) lockIcon.style.display = "none";
      btn.onclick = function(){ window.location.href = "lesson" + num + ".html"; };
    } else {
      btn.classList.remove("unlocked");
      btn.classList.add("locked");
      if(lockIcon) lockIcon.style.display = "";
      btn.onclick = null;
    }
  });
}

function ckey(uid){ return "sb_unlock_" + uid + "_" + LEVEL; }

var appliedFromSaved = false;
var isAdmin = false;
try{ isAdmin = sessionStorage.getItem("saybon_admin_unlocked") === "true"; }catch(e){}

if(isAdmin){
  applyUnlocks(25);
} else {
  // 1) Show the last known state immediately (no waiting for Firebase or the server).
  try{
    var lastUid = localStorage.getItem("sb_uid");
    var saved = lastUid ? parseInt(localStorage.getItem(ckey(lastUid))) : NaN;
    if(saved > 0){ applyUnlocks(saved); appliedFromSaved = true; }
  }catch(e){}

  // 2) Confirm with the live answer; this only changes the page if something really changed.
  import("/js/firebase-core.js").then(function(core){
    core.onAuthStateChanged(core.auth, function(user){
      if(!user){ applyUnlocks(1); return; }
      if(String(user.email||'').toLowerCase()==='saybon.fr@gmail.com'){ applyUnlocks(100); return; }
      fetch(API_BASE + "/api/levelProgress?uid=" + user.uid + "&level=" + LEVEL)
        .then(function(res){ return res.json(); })
        .then(function(data){
          var completed = data.completedLessons || [];
          var maxCompleted = completed.length ? Math.max.apply(null, completed) : 0;
          var max = maxCompleted + 1;
          try{ localStorage.setItem(ckey(user.uid), String(max)); }catch(e){}
          applyUnlocks(max);
        })
        .catch(function(){ if(!appliedFromSaved) applyUnlocks(1); });
    });
  }).catch(function(){ applyUnlocks(1); });
}
