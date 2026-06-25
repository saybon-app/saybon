document.body.classList.add("home-preload");

/* =========================================================
   HOMEPAGE REVEAL
   Faster blank-first reveal:
   - page starts on dark shell
   - wait ONLY for critical homepage images:
       1) background image
       2) teacher image
   - then reveal background + homepage elements together
========================================================= */

function waitForImage(img) {
  if (!img) return Promise.resolve();

  if (img.complete && img.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function revealHomepage() {
  requestAnimationFrame(() => {
    document.body.classList.add("home-ready");
    document.body.classList.remove("home-preload");
  });
}

function initHomepageReveal() {
  const backgroundImg = document.querySelector(".background-layer img");
  const teacherImg = document.querySelector(".teacher-img");

  Promise.all([
    waitForImage(backgroundImg),
    waitForImage(teacherImg)
  ]).then(revealHomepage);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomepageReveal, { once: true });
} else {
  initHomepageReveal();
}

/* =========================================================
   INTERVENTION
========================================================= */

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

function clearOverlayTimers() {
  overlayTimers.forEach((timerId) => clearTimeout(timerId));
  overlayTimers = [];
}

function queueOverlayTimer(callback, delay) {
  const timerId = window.setTimeout(callback, delay);
  overlayTimers.push(timerId);
  return timerId;
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
      "exit"
    );
  });
}

function endOverlay() {
  overlay?.classList.remove("active", "closing");
  overlay?.classList.add("hidden");
  if (overlay) overlay.style.pointerEvents = "none";
  document.body.classList.remove("intervention-running");
  clearOverlayTimers();
  resetPills();
  started = false;
}

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

  clearOverlayTimers();
  resetPills();

  document.body.classList.add("intervention-running");

  overlay.classList.remove("hidden", "active", "closing");
  overlay.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  /* ---------------------------------------------------
     TIMING PLAN
     0s    overlay starts appearing
     2s    pill 1 appears
     4s    pill 1 moves to slot 1
     5s    pill 2 appears
     7s    pill 2 moves to slot 2
     8s    pill 3 appears
     10s   pill 3 moves to slot 3
     11s   pill 4 appears
     13s   pill 4 moves to slot 4
     18s   pill 4 exits
     19s   pill 3 exits
     20s   pill 2 exits
     21s   pill 1 exits
     22s   overlay closing starts
     25s   overlay removed
  --------------------------------------------------- */

  queueOverlayTimer(() => { pill1?.classList.add("show"); }, 2000);
  queueOverlayTimer(() => { pill1?.classList.add("slot-1"); }, 4000);

  queueOverlayTimer(() => { pill2?.classList.add("show"); }, 5000);
  queueOverlayTimer(() => { pill2?.classList.add("slot-2"); }, 7000);

  queueOverlayTimer(() => { pill3?.classList.add("show"); }, 8000);
  queueOverlayTimer(() => { pill3?.classList.add("slot-3"); }, 10000);

  queueOverlayTimer(() => { pill4?.classList.add("show"); }, 11000);
  queueOverlayTimer(() => { pill4?.classList.add("slot-4"); }, 13000);

  queueOverlayTimer(() => { pill4?.classList.add("exit"); }, 18000);
  queueOverlayTimer(() => { pill3?.classList.add("exit"); }, 19000);
  queueOverlayTimer(() => { pill2?.classList.add("exit"); }, 20000);
  queueOverlayTimer(() => { pill1?.classList.add("exit"); }, 21000);

  queueOverlayTimer(() => {
    overlay?.classList.add("closing");
  }, 22000);

  queueOverlayTimer(() => {
    endOverlay();
  }, 25000);
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
