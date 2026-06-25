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

function addTimer(fn, delay) {
  const id = window.setTimeout(fn, delay);
  timers.push(id);
  return id;
}

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function resetPills() {
  pill1?.classList.remove("show", "exit");
  pill2?.classList.remove("show", "exit");
  pill3?.classList.remove("show", "exit");
  pill4?.classList.remove("show", "exit");

  pill1?.classList.add("slot-1");
  pill2?.classList.add("slot-2");
  pill3?.classList.add("slot-3");
  pill4?.classList.add("slot-4");
}

function finishIntervention() {
  clearTimers();
  resetPills();

  overlay.classList.remove("active", "closing");
  overlay.classList.add("hidden");
  overlay.style.pointerEvents = "none";
  overlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("intervention-running", "intervention-closing");
  started = false;
}

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

  clearTimers();
  resetPills();

  document.body.classList.remove("intervention-closing");
  document.body.classList.add("intervention-running");

  overlay.classList.remove("hidden", "active", "closing");
  overlay.setAttribute("aria-hidden", "false");
  overlay.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });
  });

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  /* ---------------------------------------------------
     TIMING PLAN
     0s    overlay starts appearing
     0-2s  overlay sharpens
     2s    pill 1 appears at bottom
     4s    pill 1 climbs to slot 1
     5s    pill 2 appears at bottom
     7s    pill 2 climbs to slot 2
     8s    pill 3 appears at bottom
     10s   pill 3 climbs to slot 3
     11s   pill 4 appears at bottom
     13s   pill 4 climbs to slot 4
     18s   exit pill 4
     19s   exit pill 3
     20s   exit pill 2
     21s   exit pill 1
     22s   overlay closing starts
     25s   overlay removed
  --------------------------------------------------- */

  addTimer(() => {
    pill1?.classList.add("show");
  }, 2000);

  addTimer(() => {
    pill1?.classList.add("slot-1");
  }, 4000);

  addTimer(() => {
    pill2?.classList.add("show");
  }, 5000);

  addTimer(() => {
    pill2?.classList.add("slot-2");
  }, 7000);

  addTimer(() => {
    pill3?.classList.add("show");
  }, 8000);

  addTimer(() => {
    pill3?.classList.add("slot-3");
  }, 10000);

  addTimer(() => {
    pill4?.classList.add("show");
  }, 11000);

  addTimer(() => {
    pill4?.classList.add("slot-4");
  }, 13000);

  addTimer(() => {
    pill4?.classList.add("exit");
  }, 18000);

  addTimer(() => {
    pill3?.classList.add("exit");
  }, 19000);

  addTimer(() => {
    pill2?.classList.add("exit");
  }, 20000);

  addTimer(() => {
    pill1?.classList.add("exit");
  }, 21000);

  addTimer(() => {
    overlay.classList.add("closing");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    document.body.classList.add("intervention-closing");
  }, 22000);

  addTimer(() => {
    finishIntervention();
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