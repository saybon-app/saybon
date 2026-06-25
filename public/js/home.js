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
   Stable polished reveal:
   - background in
   - teacher in
   - tap/logo/buttons/settings in as premium grouped sequence
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
      "hold",
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

function closeOverlay() {
  overlay.classList.add("closing");

  addTimer(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    resetPills();
    clearOverlayTimers();
    started = false;
  }, 1200);
}

function showAndPark(pill, slotClass) {
  if (!pill) return;
  pill.classList.add("show");
  addTimer(() => {
    pill.classList.add(slotClass);
  }, 100);
}

function exitPill(pill, direction) {
  if (!pill) return;
  pill.classList.remove("hold");
  pill.classList.add("exit");
  pill.classList.add(direction === "left" ? "exit-left" : "exit-right");
}

/* =========================================================
   INTERVENTION SEQUENCE
   28 seconds total
   Exit order: 1 → 2 → 3 → 4
========================================================= */

function runInterventionSequence() {
  clearOverlayTimers();
  openOverlay();

  /* --------------------------------------------
     TIMELINE (28s total)

     0.0   overlay starts
     1.4   pill 1 enters + parks
     4.6   pill 2 enters + parks
     7.8   pill 3 enters + parks
     11.0  pill 4 enters + parks

     hold / presence / subtle movement handled by CSS

     18.2  pill 1 exits RIGHT
     20.0  pill 2 exits LEFT
     21.8  pill 3 exits RIGHT
     23.6  pill 4 exits LEFT

     26.8  overlay closes
     28.0  fully reset
  --------------------------------------------- */

  addTimer(() => {
    showAndPark(pill1, "slot-1");
  }, 1400);

  addTimer(() => {
    showAndPark(pill2, "slot-2");
  }, 4600);

  addTimer(() => {
    showAndPark(pill3, "slot-3");
  }, 7800);

  addTimer(() => {
    showAndPark(pill4, "slot-4");
  }, 11000);

  /* give each pill a hold state once parked */
  addTimer(() => pill1?.classList.add("hold"), 2500);
  addTimer(() => pill2?.classList.add("hold"), 5700);
  addTimer(() => pill3?.classList.add("hold"), 8900);
  addTimer(() => pill4?.classList.add("hold"), 12100);

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

  /* overlay out */
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
