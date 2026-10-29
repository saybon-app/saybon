const API_BASE = "https://saybonapp-server.onrender.com";

var pathParts = location.pathname.split("/").filter(Boolean);
var LEVEL;
if(pathParts.indexOf("tout-public") !== -1){ LEVEL = "a0-tout-public"; }
else { LEVEL = pathParts[1].toLowerCase(); }

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

function applyUnlocks(maxUnlocked){
  var buttons = document.querySelectorAll(".lesson");
  buttons.forEach(function(btn){
    var numSpan = btn.querySelector(".tp-num");
    if(!numSpan) return;
    var num = parseInt(numSpan.textContent);
    if(num <= maxUnlocked){
      btn.classList.remove("locked");
      btn.classList.add("unlocked");
      var lockIcon = btn.querySelector(".tp-lock");
      if(lockIcon) lockIcon.style.display = "none";
      btn.onclick = function(){ window.location.href = "lesson" + num + ".html"; };
    }
  });
}

var isAdmin = sessionStorage.getItem("saybon_admin_unlocked") === "true";
if(isAdmin){
  applyUnlocks(25);
} else {
  onAuthStateChanged(auth, function(user){
    if(!user){ applyUnlocks(1); return; }
    fetch(API_BASE + "/api/levelProgress?uid=" + user.uid + "&level=" + LEVEL)
      .then(function(res){ return res.json(); })
      .then(function(data){
        var completed = data.completedLessons || [];
        var maxCompleted = completed.length ? Math.max.apply(null, completed) : 0;
        applyUnlocks(maxCompleted + 1);
      })
      .catch(function(){ applyUnlocks(1); });
  });
}