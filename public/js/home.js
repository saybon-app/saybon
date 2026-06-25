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

const backgroundImg = document.querySelector(".background-layer img");
const teacherImg = document.querySelector(".teacher-img");
const tapIconImg = document.querySelector(".tap-icon");
const logoImg = document.querySelector(".saybon-logo");
const startBtnImg = document.querySelector("#startBtn img");
const loginBtnImg = document.querySelector("#loginBtn img");
const settingsBtnImg = document.querySelector("#settingsBtn img");

let started = false;

/* =========================================================
   HOMEPAGE REVEAL
========================================================= */

function waitForImage(img) {
  return new Promise((resolve) => {
    if (!img) return resolve();

    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }

    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

async function runHomepageReveal() {
  const body = document.body;
  body.classList.add("home-preload");

  const critical = [
    waitForImage(backgroundImg),
    waitForImage(teacherImg)
  ];

  const secondary = [
    waitForImage(tapIconImg),
    waitForImage(logoImg),
    waitForImage(startBtnImg),
    waitForImage(loginBtnImg),
    waitForImage(settingsBtnImg)
  ];

  // wait for background + teacher first
  await Promise.all(critical);

  // background first
  requestAnimationFrame(() => {
    body.classList.add("home-bg-in");
  });

  // teacher follows almost immediately
  setTimeout(() => {
    body.classList.add("home-teacher-in");
  }, 90);

  // wait for the rest of the UI assets, then bring them in
  Promise.all(secondary).then(() => {
    setTimeout(() => {
      body.classList.add("home-ui-in");
    }, 170);
  });

  // if one of the secondary assets is slow, don't let the page hang forever
  setTimeout(() => {
    body.classList.add("home-ui-in");
  }, 550);

  // clear preload after everything has had time to appear
  setTimeout(() => {
    body.classList.remove("home-preload");
    body.classList.add("home-ready");
  }, 1200);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runHomepageReveal, { once: true });
} else {
  runHomepageReveal();
}

/* =========================================================
   INTERVENTION
========================================================= */

function resetPills() {
  [pill1, pill2, pill3, pill4].forEach((pill) => {
    if (!pill) return;
    pill.classList.remove("show", "exit");
  });
}

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

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

  // PILL 1
  setTimeout(() => {
    pill1?.classList.add("show");
  }, 2000);

  // PILL 2
  setTimeout(() => {
    pill2?.classList.add("show");
  }, 5000);

  // PILL 3
  setTimeout(() => {
    pill3?.classList.add("show");
  }, 8000);

  // PILL 4
  setTimeout(() => {
    pill4?.classList.add("show");
  }, 11000);

  // EXIT
  setTimeout(() => {
    pill4?.classList.add("exit");
  }, 18000);

  setTimeout(() => {
    pill3?.classList.add("exit");
  }, 19000);

  setTimeout(() => {
    pill2?.classList.add("exit");
  }, 20000);

  setTimeout(() => {
    pill1?.classList.add("exit");
  }, 21000);

  setTimeout(() => {
    overlay.classList.add("closing");
  }, 22000);

  setTimeout(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    resetPills();
    document.body.classList.remove("intervention-running");
    started = false;
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
