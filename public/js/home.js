const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const overlay = document.getElementById("offerOverlay");

const pill1 = document.getElementById("pill1");
const pill2 = document.getElementById("pill2");
const pill3 = document.getElementById("pill3");
const pill4 = document.getElementById("pill4");

const startBtn = document.getElementById("startBtn");
const loginBtn = document.getElementById("loginBtn");
const settingsBtn = document.getElementById("settingsBtn");

let started = false;
let timers = [];

function clearAllTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function schedule(fn, delay) {
  const id = setTimeout(fn, delay);
  timers.push(id);
  return id;
}

function resetPills() {
  [pill1, pill2, pill3, pill4].forEach((pill) => {
    if (!pill) return;
    pill.classList.remove("show", "slot-1", "slot-2", "slot-3", "slot-4", "exit");
  });

  pill1?.classList.add("slot-1");
  pill2?.classList.add("slot-2");
  pill3?.classList.add("slot-3");
  pill4?.classList.add("slot-4");
}

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

  clearAllTimers();
  resetPills();

  overlay.classList.remove("hidden", "closing");
  overlay.classList.add("active");
  overlay.style.pointerEvents = "auto";

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  schedule(() => pill1?.classList.add("show"), 2000);
  schedule(() => pill2?.classList.add("show"), 5000);
  schedule(() => pill3?.classList.add("show"), 8000);
  schedule(() => pill4?.classList.add("show"), 11000);

  schedule(() => pill4?.classList.add("exit"), 18000);
  schedule(() => pill3?.classList.add("exit"), 19000);
  schedule(() => pill2?.classList.add("exit"), 20000);
  schedule(() => pill1?.classList.add("exit"), 21000);

  schedule(() => {
    overlay.classList.add("closing");
  }, 22000);

  schedule(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    clearAllTimers();
    resetPills();
    started = false;
  }, 25000);
});

/* NAVIGATION */
startBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  sessionStorage.setItem("saybon_next", "/why.html");
  window.location.href = "/loader.html";
});

loginBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "/auth/login.html";
});

settingsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "/admin/passkey/";
});
