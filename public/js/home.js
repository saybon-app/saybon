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

/* =========================================================
   HOMEPAGE REVEAL
========================================================= */

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function getBackgroundImageSrc() {
  const bgPicture = document.querySelector(".background-layer");
  if (!bgPicture) return "";

  const mobileSource = bgPicture.querySelector('source[media*="max-width"]');
  const img = bgPicture.querySelector("img");

  if (window.matchMedia("(max-width: 900px)").matches && mobileSource?.srcset) {
    return mobileSource.srcset;
  }

  return img?.currentSrc || img?.src || "";
}

function getTeacherImageSrc() {
  const teacherImg = document.querySelector(".teacher-img");
  return teacherImg?.currentSrc || teacherImg?.src || "";
}

function runHomepageReveal() {
  const body = document.body;

  body.classList.remove(
    "home-bg-in",
    "home-teacher-in",
    "home-ui-in"
  );

  body.classList.add("home-preload");

  const bgSrc = getBackgroundImageSrc();
  const teacherSrc = getTeacherImageSrc();

  Promise.all([
    preloadImage(bgSrc),
    preloadImage(teacherSrc)
  ]).then(() => {
    requestAnimationFrame(() => {
      /* 1) background fades in */
      body.classList.add("home-bg-in");

      /* 2) teacher joins shortly after */
      setTimeout(() => {
        body.classList.add("home-teacher-in");
      }, 160);

      /* 3) premium UI group joins */
      setTimeout(() => {
        body.classList.add("home-ui-in");
      }, 320);

      /* remove preload state after animation has had time to finish */
      setTimeout(() => {
        body.classList.remove("home-preload");
      }, 1200);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runHomepageReveal, { once: true });
} else {
  runHomepageReveal();
}

/* =========================================================
   INTERVENTION / OFFER OVERLAY
   OPTION A + SILK EXIT — 30s VERSION
========================================================= */

const pills = [pill1, pill2, pill3, pill4];
let interventionTimers = [];
let glossTimers = [];

function schedule(fn, delay) {
  const id = window.setTimeout(fn, delay);
  interventionTimers.push(id);
  return id;
}

function clearInterventionTimers() {
  interventionTimers.forEach((id) => clearTimeout(id));
  interventionTimers = [];
  glossTimers.forEach((id) => clearInterval(id));
  glossTimers = [];
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
      "exit-left",
      "exit-right"
    );
  });
}

function pulseGloss(pill, initialDelay = 0, interval = 4200) {
  if (!pill) return;

  const trigger = () => {
    pill.classList.remove("gloss");
    void pill.offsetWidth;
    pill.classList.add("gloss");

    window.setTimeout(() => {
      pill.classList.remove("gloss");
    }, 2400);
  };

  const startId = window.setTimeout(() => {
    trigger();
    const intervalId = window.setInterval(trigger, interval);
    glossTimers.push(intervalId);
  }, initialDelay);

  interventionTimers.push(startId);
}

function showPill(pill, slotClass, glossDelay = 600) {
  if (!pill) return;

  pill.classList.remove("parked", "gloss", "exit-left", "exit-right");
  pill.classList.add("show");

  requestAnimationFrame(() => {
    pill.classList.add(slotClass);
  });

  /* after the lift/settle finishes, the pill becomes alive */
  schedule(() => {
    pill.classList.add("parked");
    pulseGloss(pill, glossDelay, 4300);
  }, 1150);
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

  /* ---------------------------------------------------
     30 SECOND CHOREOGRAPHY

     0.0s   overlay opens / art sharpens
     2.0s   pill 1 enters
     5.5s   pill 2 enters
     9.0s   pill 3 enters
     12.5s  pill 4 enters

     14s–24s parked phase:
            pills breathe gently + sheen pulses

     24.2s  exit pill 4
     25.0s  exit pill 3
     25.8s  exit pill 2
     26.6s  exit pill 1

     27.8s  overlay closing begins
     30.0s  cleanup
  --------------------------------------------------- */

  schedule(() => showPill(pill1, "slot-1", 350), 2000);
  schedule(() => showPill(pill2, "slot-2", 650), 5500);
  schedule(() => showPill(pill3, "slot-3", 950), 9000);
  schedule(() => showPill(pill4, "slot-4", 1250), 12500);

  /* silk exits */
  schedule(() => exitPill(pill4, "exit-right"), 24200);
  schedule(() => exitPill(pill3, "exit-left"), 25000);
  schedule(() => exitPill(pill2, "exit-right"), 25800);
  schedule(() => exitPill(pill1, "exit-left"), 26600);

  schedule(() => {
    overlay.classList.add("closing");
  }, 27800);

  schedule(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    clearInterventionTimers();
    resetPills();
    started = false;
  }, 30000);
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

