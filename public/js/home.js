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

const pills = [pill1, pill2, pill3, pill4];
let interventionTimers = [];
let glossIntervals = [];

function schedule(fn, delay) {
  const id = window.setTimeout(fn, delay);
  interventionTimers.push(id);
  return id;
}

function clearInterventionTimers() {
  interventionTimers.forEach((id) => clearTimeout(id));
  interventionTimers = [];
  glossIntervals.forEach((id) => clearInterval(id));
  glossIntervals = [];
}

function resetPills() {
  pills.forEach((pill) => {
    if (!pill) return;
    pill.classList.remove(
      "show",
      "slot-1",
      "slot-2",
      "slot-3",
      "slot-4",
      "parked",
      "gloss",
      "exit",
      "exit-left",
      "exit-right"
    );
  });
}

function triggerGloss(pill) {
  if (!pill) return;

  pill.classList.remove("gloss");
  void pill.offsetWidth;
  pill.classList.add("gloss");

  window.setTimeout(() => {
    pill.classList.remove("gloss");
  }, 2200);
}

function startGlossLoop(pill, firstDelay = 650, interval = 4200) {
  if (!pill) return;

  const starter = window.setTimeout(() => {
    triggerGloss(pill);

    const loop = window.setInterval(() => {
      triggerGloss(pill);
    }, interval);

    glossIntervals.push(loop);
  }, firstDelay);

  interventionTimers.push(starter);
}

function showPill(pill, slotClass, glossDelay = 600) {
  if (!pill) return;

  pill.classList.remove(
    "parked",
    "gloss",
    "exit",
    "exit-left",
    "exit-right",
    "slot-1",
    "slot-2",
    "slot-3",
    "slot-4"
  );

  pill.classList.add("show");

  requestAnimationFrame(() => {
    pill.classList.add(slotClass);
  });

  schedule(() => {
    pill.classList.add("parked");
    startGlossLoop(pill, glossDelay, 4300);
  }, 1200);
}

function movePillToSlot(pill, fromSlot, toSlot) {
  if (!pill) return;
  pill.classList.remove(fromSlot);
  pill.classList.add(toSlot);
}

function exitPill(pill, directionClass) {
  if (!pill) return;
  pill.classList.remove("parked", "gloss");
  pill.classList.add(directionClass);
}

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

  clearInterventionTimers();
  resetPills();

  overlay.classList.remove("hidden", "active", "closing");
  overlay.style.pointerEvents = "auto";
  document.body.classList.add("intervention-running");

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  /* =====================================================
     28 SECOND CHOREOGRAPHY

     ENTRY
     2.0s   pill 1 enters
     5.0s   pill 2 enters
     8.0s   pill 3 enters
     11.0s  pill 4 enters

     STACK LIVES / GLOSSES

     EXIT ORDER
     21.6s  pill 1 exits LEFT
     22.35s pill 2 rises to slot-1
     23.15s pill 2 exits RIGHT
     23.90s pill 3 rises to slot-2
     24.70s pill 3 exits LEFT
     25.45s pill 4 rises to slot-3
     26.25s pill 4 exits RIGHT

     26.9s  overlay closing
     28.0s  cleanup
  ===================================================== */

  /* ---------- ENTRY ---------- */
  schedule(() => showPill(pill1, "slot-1", 300), 2000);
  schedule(() => showPill(pill2, "slot-2", 650), 5000);
  schedule(() => showPill(pill3, "slot-3", 950), 8000);
  schedule(() => showPill(pill4, "slot-4", 1250), 11000);

  /* ---------- EXIT SEQUENCE ---------- */

  /* 1 exits first */
  schedule(() => {
    exitPill(pill1, "exit-left");
  }, 21600);

  /* 2 rises into 1's slot, then exits */
  schedule(() => {
    movePillToSlot(pill2, "slot-2", "slot-1");
  }, 22350);

  schedule(() => {
    exitPill(pill2, "exit-right");
  }, 23150);

  /* 3 rises into 2's old slot, then exits */
  schedule(() => {
    movePillToSlot(pill3, "slot-3", "slot-2");
  }, 23900);

  schedule(() => {
    exitPill(pill3, "exit-left");
  }, 24700);

  /* 4 rises into 3's old slot, then exits */
  schedule(() => {
    movePillToSlot(pill4, "slot-4", "slot-3");
  }, 25450);

  schedule(() => {
    exitPill(pill4, "exit-right");
  }, 26250);

  /* ---------- OVERLAY OUT ---------- */
  schedule(() => {
    overlay.classList.add("closing");
  }, 26900);

  schedule(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    clearInterventionTimers();
    resetPills();
    started = false;
  }, 28000);
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
