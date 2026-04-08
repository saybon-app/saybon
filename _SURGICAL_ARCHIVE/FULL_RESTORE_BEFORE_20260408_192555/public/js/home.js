const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const overlay = document.getElementById("offerOverlay");
const pills = document.querySelectorAll(".pill");

let started = false;

/* =====================================================
   TEACHER TAP — 25s CINEMATIC FLOW + CARPET EXIT
===================================================== */

teacher.addEventListener("click", () => {
  if (started) return;
  started = true;

  // HARD RESET
  overlay.classList.remove("hidden", "active", "closing");
  overlay.style.pointerEvents = "auto";

  // Show blank overlay first
  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  // Play audio
  audio.currentTime = 0;
  audio.play().catch(() => {
    console.log("Autoplay blocked — user tap allows playback.");
  });

  // Start closing (carpet roll) at 21s
  setTimeout(() => {
    overlay.classList.add("closing");
  }, 21000);

  // Fully remove overlay at 25s
  setTimeout(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    started = false;
  }, 25000);
});

/* =====================================================
   BUTTONS — NAVIGATION (UNCHANGED LOGIC)
===================================================== */

document.getElementById("startBtn").onclick = (e) => {
  e.stopPropagation();
  sessionStorage.setItem("saybon_next", "/why.html");
  window.location.href = "/loader.html";
};

document.getElementById("loginBtn").onclick = (e) => {
  e.stopPropagation();
  window.location.href = "/auth/login.html";
};

document.getElementById("settingsBtn").onclick = (e) => {
  e.stopPropagation();
  window.location.href = "/admin";
};
