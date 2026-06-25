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

  pill.classList.add("show");

  /* next frame so the browser sees a real transition
     from launch position -> parked slot */
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

  pill.classList.remove("parked");
  pill.classList.add("exit");

  if (direction === "left") {
    pill.classList.add("exit-left");
  } else {
    pill.classList.add("exit-right");
  }
}

/* =========================================================
   INTERVENTION SEQUENCE
   TOTAL = 28s
   EXIT ORDER = 1, 2, 3, 4
========================================================= */
function runInterventionSequence() {
  clearOverlayTimers();
  openOverlay();

  /* -----------------------------------------
     0.0   overlay starts
     1.4   pill 1 launches
     2.5   pill 1 becomes parked / alive

     4.6   pill 2 launches
     5.7   pill 2 becomes parked

     7.8   pill 3 launches
     8.9   pill 3 becomes parked

     11.0  pill 4 launches
     12.1  pill 4 becomes parked

     18.2  pill 1 exits RIGHT
     20.0  pill 2 exits LEFT
     21.8  pill 3 exits RIGHT
     23.6  pill 4 exits LEFT

     26.8  overlay closes
     28.0  reset finished
  ------------------------------------------ */

  /* PILL 1 */
  addTimer(() => {
    launchPill(pill1, "slot-1");
  }, 1400);

  addTimer(() => {
    parkPill(pill1);
  }, 2500);

  /* PILL 2 */
  addTimer(() => {
    launchPill(pill2, "slot-2");
  }, 4600);

  addTimer(() => {
    parkPill(pill2);
  }, 5700);

  /* PILL 3 */
  addTimer(() => {
    launchPill(pill3, "slot-3");
  }, 7800);

  addTimer(() => {
    parkPill(pill3);
  }, 8900);

  /* PILL 4 */
  addTimer(() => {
    launchPill(pill4, "slot-4");
  }, 11000);

  addTimer(() => {
    parkPill(pill4);
  }, 12100);

  /* EXIT ORDER: 1 -> 2 -> 3 -> 4 */
  addTimer(() => {
    exitPill(pill1, "right");
  }, 18200);

  addTimer(() => {
    exitPill(pill2, "left");
  }, 20000);

  addTimer(() => {
    exitPill(pill3, "right");
  }, 21800);

  addTimer(() => {
    exitPill(pill4, "left");
  }, 23600);

  /* overlay close */
  addTimer(() => {
    closeOverlay();
  }, 26800);
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
