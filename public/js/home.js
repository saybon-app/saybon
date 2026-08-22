const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const bgLayer = document.querySelector(".background-layer");
const logo = document.querySelector(".saybon-logo");

const startBtn = document.getElementById("startBtn");
const loginBtn = document.getElementById("loginBtn");
const settingsBtn = document.getElementById("settingsBtn");

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

const DURATIONS = {
  bgZoom: 1900,
  elementsStartOffset: 1500,
  fadeSettle: 1000
};

function runEntrance() {
  playIntroAudio();

  if (bgLayer) bgLayer.classList.add("sb-bg-zoom-in");

  window.setTimeout(() => {
    [teacher, logo, startBtn, loginBtn, settingsBtn].forEach(function(el){
      if (el) el.classList.add("sb-visible");
    });

    window.setTimeout(() => {
      if (teacher) teacher.classList.add("sb-teacher-idle");
      if (startBtn) startBtn.classList.add("sb-btn-idle");
      if (loginBtn) loginBtn.classList.add("sb-btn-idle");
    }, DURATIONS.fadeSettle);

  }, DURATIONS.bgZoom - DURATIONS.elementsStartOffset);
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