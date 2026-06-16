const level = localStorage.getItem("saybon_level") || "Absolute Beginner";

const audioMap = {
  "Absolute Beginner": "assets/sounds/levels/level-absolute-beginner.mp3",
  "Beginner": "assets/sounds/levels/level-beginner.mp3",
  "Intermediate": "assets/sounds/levels/level-intermediate.mp3",
  "Semi-Advanced": "assets/sounds/levels/level-semi-advanced.mp3",
  "Advanced": "assets/sounds/levels/level-advanced.mp3"
};

const levelText = document.getElementById("levelText");
const audio = document.getElementById("levelAudio");
const actions = document.getElementById("actions");
const confettiBox = document.getElementById("confetti");

document.getElementById("teacherCircle").addEventListener("click", () => {

  levelText.textContent = level;
  levelText.classList.add("show");

  audio.src = audioMap[level];
  audio.play();

  launchConfetti();

  setTimeout(() => {
    actions.classList.add("show");
  }, 2600);
});

function launchConfetti() {
  for (let i = 0; i < 26; i++) {
    const piece = document.createElement("span");
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    confettiBox.appendChild(piece);

    setTimeout(() => piece.remove(), 2500);
  }
}

function startJourney() {
  // tell global loader where to go next
  sessionStorage.setItem("saybon_next", "/auth/login.html");

  // go through loader for emotional continuity
  window.location.href = "loader.html";
}

function goHome() {
  window.location.href = "index.html";
}
