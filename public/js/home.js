const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");

const startBtn = document.getElementById("startBtn");
const loginBtn = document.getElementById("loginBtn");
const settingsBtn = document.getElementById("settingsBtn");

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
        playIntroAudio();
        scheduleTeacherGreeting();
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
   INTRO AUDIO
   Plays once automatically on load. Browsers can block audio
   before any user interaction with the page - if that happens,
   we fall back to playing on the very first tap/click/key press.
========================================================= */
function playIntroAudio() {
  if (!audio) return;
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(() => {
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
   TEACHER GREETING
   A one-time gesture shortly after she settles in, then a
   slow, gentle idle breathing loop. Tapping her replays the
   gesture. Both apply to the wrapper (#teacher), never to
   .teacher-img itself, so nothing collides with her existing
   entrance animation.
========================================================= */
function scheduleTeacherGreeting() {
  window.setTimeout(() => {
    if (!teacher) return;
    teacher.classList.add("teacher-idle");
    playGreetingGesture();
  }, 500);

  const logo = document.querySelector(".saybon-logo");
  window.setTimeout(() => {
    if (!logo) return;
    logo.classList.add("logo-settled-glow");
  }, 700);
}

function playGreetingGesture() {
  if (!teacher) return;
  teacher.classList.remove("teacher-greet");
  void teacher.offsetWidth;
  teacher.classList.add("teacher-greet");
}

teacher?.addEventListener("click", () => {
  playGreetingGesture();
});

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
   PRESS FEEDBACK (consolidated - was duplicated across two
   near-identical implementations before)
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

[teacher, startBtn, loginBtn, settingsBtn, document.querySelector(".saybon-logo")]
  .forEach(bindPressFeedback);