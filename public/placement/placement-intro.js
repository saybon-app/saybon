const teacherBtn = document.getElementById("teacherBtn");
const audio = document.getElementById("placementAudio");
const startBtn = document.getElementById("startTestBtn");

teacherBtn.addEventListener("click", () => {
  audio.currentTime = 0;
  audio.play();
});

// start test → placement test placeholder
startBtn.addEventListener("click", () => {
  sessionStorage.setItem("saybon_next", "placement/test.html");
  window.location.href = "../loader.html";
});
