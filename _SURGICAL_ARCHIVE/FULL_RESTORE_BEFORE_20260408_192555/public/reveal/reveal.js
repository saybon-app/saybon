const level =
  sessionStorage.getItem("saybon_level") || "Absolute Beginner";

const levelText = document.getElementById("levelText");
const buttons = document.getElementById("buttons");

levelText.textContent = level;

setTimeout(() => {
  buttons.classList.add("show");
}, 1700);

// START JOURNEY → loader → login
document.getElementById("startJourney").onclick = () => {
  sessionStorage.setItem("saybon_next", "/auth/login.html");
  window.location.href = "/loader.html";
};

// BACK HOME
document.getElementById("backHome").onclick = () => {
  window.location.href = "/";
};

