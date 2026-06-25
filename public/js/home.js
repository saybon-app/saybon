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
let overlayTimers = [];

/* =========================================================
   HOMEPAGE REVEAL
========================================================= */
function runHomepageReveal() {
  document.body.classList.add("home-preload");

  const bgImg = document.querySelector(".background-layer img");
  const teacherImg = document.querySelector(".teacher-img");

  const waitForImage = (img) => {
    return new Promise((resolve) => {
      if (!img) return resolve();
      if (img.complete && img.naturalWidth > 0) return resolve();
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  };

  Promise.all([
    waitForImage(bgImg),
    waitForImage(teacherImg)
  ]).then(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("home-bg-in");

      window.setTimeout(() => {
        document.body.classList.add("home-teacher-in");
      }, 220);

      window.setTimeout(() => {
        document.body.classList.add("home-ui-in");
        document.body.classList.remove("home-preload");
      }, 430);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runHomepageReveal, { once: true });
} else {
  runHomepageReveal();
}

/* =========================================================
   INTERVENTION HELPERS
========================================================= */
function addTimer(fn, delay) {
  const id = window.setTimeout(fn, delay);
  overlayTimers.push(id);
  return id;
}

function clearOverlayTimers() {
  overlayTimers.forEach((id) => window.clearTimeout(id));
  overlayTimers = [];
}

function resetPills() {
  [pill1, pill2, pill3, pill4].forEach((pill) => {
    if (!pill) return;
    pill.classList.remove(
      "show",
      "slot-1",
      "slot-2",
      "slot-3",
      "slot-4",
      "parked",
      "exit",
      "exit-left",
      "exit-right"
    );
  });
}

function openOverlay() {
  document.body.classList.add("intervention-running");
  resetPills();

  overlay.classList.remove("hidden", "active", "closing");
  overlay.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function finishOverlay() {
  overlay.classList.remove("active", "closing");
  overlay.classList.add("hidden");
  overlay.style.pointerEvents = "none";
  document.body.classList.remove("intervention-running");
  resetPills();
  clearOverlayTimers();
  started = false;
}

function closeOverlay() {
  overlay.classList.add("closing");
  addTimer(() => {
    finishOverlay();
  }, 1200);
}

function launchPill(pill, slotClass) {
  if (!pill) return;

  // launch from the base state first
  pill.classList.remove(
    "show",
    "parked",
    "exit",
    "exit-left",
    "exit-right",
    "slot-1",
    "slot-2",
    "slot-3",
    "slot-4"
  );

  // show at launch point
  pill.classList.add("show");

  // next paint: add parked slot so it visibly travels upward
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pill.classList.add(slotClass);
    });
  });
}

function parkPill(pill) {
  if (!pill) return;
  pill.classList.add("parked");
}

function exitPill(pill, direction) {
  if (!pill) return;

  // IMPORTANT:
  // remove show + parked so slot/show transform no longer pins the pill
  pill.classList.remove("parked", "show");
  pill.classList.add("exit");

  if (direction === "left") {
    pill.classList.add("exit-left");
    pill.classList.remove("exit-right");
  } else {
    pill.classList.add("exit-right");
    pill.classList.remove("exit-left");
  }
}

/* =========================================================
   INTERVENTION SEQUENCE
   TOTAL ≈ 28s
   EXIT ORDER = 1, 2, 3, 4
========================================================= */
function runInterventionSequence() {
  clearOverlayTimers();
  openOverlay();

  /*
    0.0   overlay starts
    1.4   pill 1 launch
    2.6   pill 1 parked

    4.6   pill 2 launch
    5.8   pill 2 parked

    7.8   pill 3 launch
    9.0   pill 3 parked

    11.0  pill 4 launch
    12.2  pill 4 parked

    18.2  pill 1 exits RIGHT
    20.0  pill 2 exits LEFT
    21.8  pill 3 exits RIGHT
    23.6  pill 4 exits LEFT

    26.8  overlay closing
    28.0  cleanup
  */

  addTimer(() => launchPill(pill1, "slot-1"), 1400);
  addTimer(() => parkPill(pill1), 2600);

  addTimer(() => launchPill(pill2, "slot-2"), 4600);
  addTimer(() => parkPill(pill2), 5800);

  addTimer(() => launchPill(pill3, "slot-3"), 7800);
  addTimer(() => parkPill(pill3), 9000);

  addTimer(() => launchPill(pill4, "slot-4"), 11000);
  addTimer(() => parkPill(pill4), 12200);

  addTimer(() => exitPill(pill1, "right"), 18200);
  addTimer(() => exitPill(pill2, "left"), 20000);
  addTimer(() => exitPill(pill3, "right"), 21800);
  addTimer(() => exitPill(pill4, "left"), 23600);

  addTimer(() => closeOverlay(), 26800);
}

/* =========================================================
   INTERACTION
========================================================= */
teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;
  runInterventionSequence();
});

/* =========================================================
   NAVIGATION
========================================================= */
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
