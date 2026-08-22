const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const bgLayer = document.querySelector(".background-layer");
const logo = document.querySelector(".saybon-logo");

const startBtn = document.getElementById("startBtn");
const loginBtn = document.getElementById("loginBtn");
const settingsBtn = document.getElementById("settingsBtn");

/* =========================================================
   INTRO AUDIO - plays immediately, with fallback if the
   browser blocks autoplay before any user interaction.
========================================================= */
function playIntroAudio() {
  if (!audio) return;
  audio.currentTime = 0;
  const p = audio.play();
  if (p && p.catch) {
    p.catch(() => {
      const retry = () => {
        audio.play().catch(() => {});
        document.removeEventListener("pointerdown", retry);
        document.removeEventListener("keydown", retry);
      };
      document.addEventListener("pointerdown", retry, { once: true });
      document.addEventListener("keydown", retry, { once: true });
    });
  }
}

/* =========================================================
   SEQUENTIAL ENTRANCE CHOREOGRAPHY
   Each step is hidden via an explicit inline style the moment
   the page loads, then revealed by adding a class that plays
   a dedicated keyframe animation - and the NEXT step only
   begins after the current one's animation duration has
   actually elapsed.
========================================================= */

const DURATIONS = {
  carpet: 900,
  teacherFall: 700,
  logo: 600,
  btn: 500
};

function hideInitially() {
  if (bgLayer) bgLayer.classList.add("sb-carpet-hidden");
  if (teacher) teacher.classList.add("sb-teacher-hidden");
  if (logo) logo.classList.add("sb-logo-hidden");
  if (startBtn) startBtn.classList.add("sb-btn-hidden");
  if (loginBtn) loginBtn.classList.add("sb-btn-hidden");
  if (settingsBtn) settingsBtn.classList.add("sb-btn-hidden");
}

function runEntrance() {
  playIntroAudio();

  if (bgLayer) {
    bgLayer.classList.remove("sb-carpet-hidden");
    bgLayer.classList.add("sb-carpet-reveal");
  }

  window.setTimeout(() => {
    if (teacher) {
      teacher.classList.remove("sb-teacher-hidden");
      teacher.classList.add("sb-teacher-fall");
    }

    window.setTimeout(() => {
      if (teacher) teacher.classList.add("sb-teacher-idle");

      if (logo) {
        logo.classList.remove("sb-logo-hidden");
        logo.classList.add("sb-logo-in");
      }

      window.setTimeout(() => {
        if (startBtn) {
          startBtn.classList.remove("sb-btn-hidden");
          startBtn.classList.add("sb-btn-in");
        }

        window.setTimeout(() => {
          if (loginBtn) {
            loginBtn.classList.remove("sb-btn-hidden");
            loginBtn.classList.add("sb-btn-in");
          }

          window.setTimeout(() => {
            if (settingsBtn) {
              settingsBtn.classList.remove("sb-btn-hidden");
              settingsBtn.classList.add("sb-btn-in");
            }
          }, DURATIONS.btn);

        }, DURATIONS.btn);

      }, DURATIONS.logo);

    }, DURATIONS.teacherFall);

  }, DURATIONS.carpet);
}

function waitForImage(img) {
  return new Promise((resolve) => {
    if (!img) return resolve();
    if (img.complete && img.naturalWidth > 0) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function init() {
  hideInitially();
  const bgImg = document.querySelector(".background-layer img");
  const teacherImg = document.querySelector(".teacher-img");
  Promise.all([waitForImage(bgImg), waitForImage(teacherImg)]).then(() => {
    requestAnimationFrame(() => { runEntrance(); });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

/* =========================================================
   NAVIGATION
========================================================= */
startBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  sessionStorage.setItem("saybon_prev", window.location.pathname);
  sessionStorage.setItem("saybon_next", "/why.html");
  window.location.href = "/loader.html";
});

loginBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "/auth/login.html";
});

settingsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "/admin/panel.html";
});

/* =========================================================
   PRESS FEEDBACK
========================================================= */
function bindPressFeedback(el) {
  if (!el) return;
  const pressOn = () => el.classList.add("is-pressed");
  const pressOff = () => el.classList.remove("is-pressed");
  el.addEventListener("pointerdown", pressOn, { passive: true });
  el.addEventListener("pointerup", pressOff, { passive: true });
  el.addEventListener("pointercancel", pressOff, { passive: true });
  el.addEventListener("pointerleave", pressOff, { passive: true });
  el.addEventListener("mousedown", pressOn);
  el.addEventListener("mouseup", pressOff);
  el.addEventListener("mouseleave", pressOff);
  el.addEventListener("touchstart", pressOn, { passive: true });
  el.addEventListener("touchend", pressOff);
  el.addEventListener("touchcancel", pressOff);
}
[startBtn, loginBtn, settingsBtn].forEach(bindPressFeedback);