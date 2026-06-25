document.body.classList.add("home-preload");

/* =========================================================
   HOMEPAGE REVEAL
   Strategy:
   - Wait only for critical blockers:
       1) background image
       2) teacher image
   - Reveal homepage shell quickly
   - For non-blocking assets (logo/buttons/settings/tap),
     reveal each one smoothly as soon as its own image is ready
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

function revealHomepageShell() {
  requestAnimationFrame(() => {
    document.body.classList.add("home-ready");
    document.body.classList.remove("home-preload");
  });
}

function revealAssetWhenReady(wrapperEl, imgEl) {
  if (!wrapperEl) return;

  const reveal = () => {
    requestAnimationFrame(() => {
      wrapperEl.classList.add("asset-ready");
    });
  };

  if (!imgEl) {
    reveal();
    return;
  }

  if (imgEl.complete && imgEl.naturalWidth > 0) {
    reveal();
    return;
  }

  waitForImage(imgEl).then(reveal);
}

function initHomepageReveal() {
  const backgroundImg = document.querySelector(".background-layer img");
  const teacherImg = document.querySelector(".teacher-img");

  const tapEl = document.querySelector(".tap-icon");
  const logoEl = document.querySelector(".saybon-logo");
  const startBtn = document.querySelector(".start-btn");
  const loginBtn = document.querySelector(".login-btn");
  const settingsBtn = document.querySelector(".settings-image-btn");

  const startImg = startBtn ? startBtn.querySelector("img") : null;
  const loginImg = loginBtn ? loginBtn.querySelector("img") : null;
  const settingsImg = settingsBtn ? settingsBtn.querySelector("img") : null;

  // Mark non-blocking homepage assets for smooth reveal handling
  [tapEl, logoEl, startBtn, loginBtn, settingsBtn].forEach((el) => {
    if (el) el.classList.add("home-asset");
  });

  Promise.all([
    waitForImage(backgroundImg),
    waitForImage(teacherImg)
  ]).then(() => {
    revealHomepageShell();

    // Smoothly reveal each remaining homepage element
    revealAssetWhenReady(tapEl, tapEl);
    revealAssetWhenReady(logoEl, logoEl);
    revealAssetWhenReady(startBtn, startImg);
    revealAssetWhenReady(loginBtn, loginImg);
    revealAssetWhenReady(settingsBtn, settingsImg);
  });
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
