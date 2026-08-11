const level =
  sessionStorage.getItem("saybon_level") || "Absolute Beginner";

const levelText = document.getElementById("levelText");
levelText.textContent = level;


document.getElementById("startJourney").onclick = () => {
  sessionStorage.setItem("saybon_next", "/auth/login.html");
  window.location.href = "/loader.html";
};

document.getElementById("backHome").onclick = () => {
  window.location.href = "/";
};