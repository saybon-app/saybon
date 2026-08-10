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

const pills = [pill1, pill2, pill3, pill4];

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
  pills.forEach((pill) => {
    if (!pill) return;
    pill.classList.remove(
      "show",
      "parked",
      "slot-1",
      "slot-2",
      "slot-3",
      "slot-4",
      "relay-to-1",
      "relay-to-2",
      "relay-to-3",
      "relay-to-4",
      "exit",
      "exit-left",
      "exit-right"
    );
  });
}

function resetDesktopCards() {
  getDesktopCards().forEach((card) => {
    card.classList.remove("exit-left", "exit-right");
  });
}

function isDesktopViewport() {
  return window.matchMedia("(min-width:901px)").matches;
}

function openOverlay() {
  document.body.classList.add("intervention-running");
  resetPills();
  resetDesktopCards();

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
  clearOverlayTimers();
  resetPills();
  resetDesktopCards();
  started = false;
}

function closeOverlay() {
  overlay.classList.add("closing");
  addTimer(() => finishOverlay(), 1200);
}

function launchPill(pill, slotClass) {
  if (!pill) return;

  pill.classList.remove(
    "show",
    "parked",
    "slot-1",
    "slot-2",
    "slot-3",
    "slot-4",
    "relay-to-1",
    "relay-to-2",
    "relay-to-3",
    "relay-to-4",
    "exit",
    "exit-left",
    "exit-right"
  );

  pill.classList.add("show");

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

function movePillToSlot1(pill, fromIndex) {
  if (!pill) return;

  pill.classList.remove("parked");
  pill.classList.remove("slot-1", "slot-2", "slot-3", "slot-4");

  if (fromIndex === 2) pill.classList.add("relay-to-1");
  if (fromIndex === 3) pill.classList.add("relay-to-1");
  if (fromIndex === 4) pill.classList.add("relay-to-1");
}

function exitPill(pill, direction) {
    if (!pill) return;

    pill.classList.remove("parked");
    pill.classList.add("exit");

    if (direction === "left") {
        pill.classList.remove("exit-right");
        pill.classList.add("exit-left");
    } else {
        pill.classList.remove("exit-left");
        pill.classList.add("exit-right");
    }
}

/* ==========================
   DESKTOP CARD HELPERS
========================== */

function getDesktopCards() {
    return [...document.querySelectorAll(".desk-pill-card")];
}

function exitDesktopCard(index, direction) {

    const cards = getDesktopCards();

    if (!cards[index]) return;

    cards[index].classList.remove("exit-left", "exit-right");

    cards[index].classList.add(
        direction === "left"
            ? "exit-left"
            : "exit-right"
    );
}

/* =========================================================
   DESKTOP SEQUENCE
   Entrance is driven by pure CSS (transition-delay on
   .desk-pill-card, staggered 2s / 4.5s / 7s / 9.5s, each
   taking 1.2s to land — so the last card lands at 10.7s).
   This function drives what happens AFTER that: a 2s hold,
   then each card exits one at a time (not together), and
   only once every card has fully left does the overlay
   itself fade out.
========================================================= */
function runDesktopSequence() {
  // All 4 cards exit to the right, one at a time. Each card must
  // fully finish its exit animation before a 1s pause, THEN the
  // next card begins. Total open-to-closed run time is ~27s.
  const lastCardLandTime = 10700;   // 9500ms delay + 1200ms transition
  const holdAfterLastCard = 7300;   // hold once all 4 are visible, before exits begin
  const exitDuration = 1150;        // matches deskCardExitLeft/Right keyframe duration
  const pauseAfterExit = 1000;      // gap AFTER a card is fully gone, before the next starts

  const exit1 = lastCardLandTime + holdAfterLastCard;       // 18000
  const exit2 = exit1 + exitDuration + pauseAfterExit;      // 20150
  const exit3 = exit2 + exitDuration + pauseAfterExit;      // 22300
  const exit4 = exit3 + exitDuration + pauseAfterExit;      // 24450

  addTimer(() => exitDesktopCard(0, "right"), exit1);
  addTimer(() => exitDesktopCard(1, "right"), exit2);
  addTimer(() => exitDesktopCard(2, "right"), exit3);
  addTimer(() => exitDesktopCard(3, "right"), exit4);

  // Fade the overlay only once the last card has fully finished leaving
  addTimer(() => closeOverlay(), exit4 + exitDuration + 150);
}

function runInterventionSequence() {

    clearOverlayTimers();
    openOverlay();

    if (isDesktopViewport()) {
        runDesktopSequence();
        return;
    }

    /* ==========================================
       MOBILE ENTRANCE
       Premium overlapping relay
       ========================================== */

    // Pill 1
    addTimer(() => launchPill(pill1, "slot-1"), 1200);
    addTimer(() => parkPill(pill1), 2300);

    // Pill 2 begins while Pill 1 is still settling
    addTimer(() => launchPill(pill2, "slot-2"), 2200);
    addTimer(() => parkPill(pill2), 3300);

    // Pill 3
    addTimer(() => launchPill(pill3, "slot-3"), 3200);
    addTimer(() => parkPill(pill3), 4300);

    // Pill 4
    addTimer(() => launchPill(pill4, "slot-4"), 4200);
    addTimer(() => parkPill(pill4), 5300);



    /* ==========================================
   HOLD
   Wait 2 seconds after Pill 4 lands
========================================== */

const holdAfterLastPill = 2000;

/* Pill 1 leaves */
addTimer(() => exitPill(pill1, "right"), 5300 + holdAfterLastPill);

/* Pill 2 leaves */
addTimer(() => exitPill(pill2, "left"), 9300);

/* Pill 3 leaves */
addTimer(() => exitPill(pill3, "right"), 11300);

/* Pill 4 leaves */
addTimer(() => exitPill(pill4, "left"), 13300);

/* Fade overlay after every pill has gone */
addTimer(() => closeOverlay(), 15300);
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

  // store page before loader
  sessionStorage.setItem("saybon_prev", window.location.pathname);

  // loader destination
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

/* ===== SAYBON HOMEPAGE PRESS SYSTEM ===== */

const homepagePressTargets = [
  startBtn,
  loginBtn,
  settingsBtn,
  document.querySelector(".tap-icon"),
  document.querySelector(".saybon-logo")
].filter(Boolean);

function attachPressFeedback(el) {
  const pressOn = () => el.classList.add("is-pressed");
  const pressOff = () => el.classList.remove("is-pressed");

  el.addEventListener("pointerdown", pressOn, { passive: true });
  el.addEventListener("pointerup", pressOff, { passive: true });
  el.addEventListener("pointercancel", pressOff, { passive: true });
  el.addEventListener("pointerleave", pressOff, { passive: true });

  el.addEventListener("touchstart", pressOn, { passive: true });
  el.addEventListener("touchend", pressOff, { passive: true });
  el.addEventListener("touchcancel", pressOff, { passive: true });

  el.addEventListener("mousedown", pressOn);
  el.addEventListener("mouseup", pressOff);
  el.addEventListener("mouseleave", pressOff);
}

homepagePressTargets.forEach(attachPressFeedback);

/* ===== END SAYBON HOMEPAGE PRESS SYSTEM ===== */

/* ===== SAYBON HOMEPAGE PRESS FEEDBACK SYSTEM ===== */

function bindPressFeedback(el) {
  if (!el) return;

  const pressOn = () => el.classList.add("is-pressed");
  const pressOff = () => el.classList.remove("is-pressed");

  el.addEventListener("mousedown", pressOn);
  el.addEventListener("mouseup", pressOff);
  el.addEventListener("mouseleave", pressOff);

  el.addEventListener("touchstart", pressOn, { passive: true });
  el.addEventListener("touchend", pressOff);
  el.addEventListener("touchcancel", pressOff);
}

[teacher, startBtn, loginBtn, settingsBtn].forEach(bindPressFeedback);

/* ===== END SAYBON HOMEPAGE PRESS FEEDBACK SYSTEM ===== */
