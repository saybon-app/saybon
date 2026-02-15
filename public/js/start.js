// ================================
// SAYBON START PAGE ROUTING — FIXED
// ================================

const findLevel = document.getElementById("findLevel");
const startScratch = document.getElementById("startScratch");

// ================================
// FIND MY LEVEL
// start → loader → placement
// ================================
if (findLevel) {
  findLevel.addEventListener("click", () => {
    sessionStorage.setItem("saybon_next", "/placement/");
    window.location.href = "/loader.html";
  });
}

// ================================
// START FROM SCRATCH
// start → loader → login
// ================================
if (startScratch) {
  startScratch.addEventListener("click", () => {
    sessionStorage.setItem("saybon_next", "/login.html");
    window.location.href = "/loader.html";
  });
}
