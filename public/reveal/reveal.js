const level =
  sessionStorage.getItem("saybon_level") || "Absolute Beginner";

const levelText = document.getElementById("levelText");
levelText.textContent = level;

const levelFriendlyLabels = {
  "A0": "Absolute Beginner",
  "A1": "Beginner",
  "A2": "Elementary",
  "B1": "Intermediate",
  "B2": "Upper Intermediate",
  "C1": "Advanced"
};

const friendlyLabelEl = document.getElementById("levelFriendlyLabel");
if(friendlyLabelEl && levelFriendlyLabels[level]){
  friendlyLabelEl.textContent = levelFriendlyLabels[level];
}


document.getElementById("startJourney").onclick = () => {
  sessionStorage.setItem("saybon_next", "/auth/login.html");
  window.location.href = "/loader.html";
};

document.getElementById("backHome").onclick = () => {
  if(window.stopAppBgMusic){ window.stopAppBgMusic(); } window.location.href = "/";
};

