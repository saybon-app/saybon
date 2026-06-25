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
  clearOverlayTimers();
  resetPills();
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

/* =========================================================
   INTERVENTION TIMELINE
========================================================= */
function runInterventionSequence() {
  clearOverlayTimers();
  openOverlay();

  addTimer(() => launchPill(pill1, "slot-1"), 1200);
  addTimer(() => parkPill(pill1), 2300);

  addTimer(() => launchPill(pill2, "slot-2"), 3800);
  addTimer(() => parkPill(pill2), 4900);

  addTimer(() => launchPill(pill3, "slot-3"), 6400);
  addTimer(() => parkPill(pill3), 7500);

  addTimer(() => launchPill(pill4, "slot-4"), 9000);
  addTimer(() => parkPill(pill4), 10100);

  addTimer(() => exitPill(pill1, "right"), 15200);

  addTimer(() => movePillToSlot1(pill2, 2), 15800);
  addTimer(() => exitPill(pill2, "left"), 16600);

  addTimer(() => movePillToSlot1(pill3, 3), 17200);
  addTimer(() => exitPill(pill3, "right"), 18000);

  addTimer(() => movePillToSlot1(pill4, 4), 18600);
  addTimer(() => exitPill(pill4, "left"), 19400);

  addTimer(() => closeOverlay(), 22800);
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
