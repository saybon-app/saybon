// =======================================
// SAYBON START PAGE ROUTING (CORRECTED)
// =======================================

const findLevel = document.getElementById("findLevel");
const startScratch = document.getElementById("startScratch");

// -----------------------------
// FIND MY LEVEL
// → loader → placement
// -----------------------------
findLevel.addEventListener("click", () => {
  sessionStorage.setItem("saybon_next", "/placement/");
  window.location.href = "/loader.html";
});

// -----------------------------
// START FROM SCRATCH
// → loader → login
// -----------------------------
startScratch.addEventListener("click", () => {
  sessionStorage.setItem("saybon_next", "/login.html");
  window.location.href = "/loader.html";
});
