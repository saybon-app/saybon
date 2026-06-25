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
   OPTION A + SILK EXIT
========================================================= */

const pills = [pill1, pill2, pill3, pill4];
let interventionTimers = [];

function schedule(fn, delay) {
  const id = window.setTimeout(fn, delay);
  interventionTimers.push(id);
  return id;
}

function clearInterventionTimers() {
  interventionTimers.forEach((id) => clearTimeout(id));
  interventionTimers = [];
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
      "exit-left",
      "exit-right"
    );
  });
}

function showPill(pill, slotClass) {
  if (!pill) return;

  pill.classList.remove("parked", "exit-left", "exit-right");
  pill.classList.add("show");

  requestAnimationFrame(() => {
    pill.classList.add(slotClass);
  });

  /* after the lift/settle finishes, let it breathe */
  schedule(() => {
    pill.classList.add("parked");
  }, 1150);
}

function exitPill(pill, directionClass) {
  if (!pill) return;
  pill.classList.remove("parked");
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
     OPTION A + SILK EXIT CHOREOGRAPHY

     0ms    overlay opens / art begins sharpening
     1500   pill 1 lift-in
     3400   pill 2 lift-in
     5300   pill 3 lift-in
     7200   pill 4 lift-in

     9800   stack is fully built and breathes / glosses
     13800  silk exit starts
     15850  overlay closes
     17200  cleanup
  --------------------------------------------------- */

  schedule(() => {
    showPill(pill1, "slot-1");
  }, 1500);

  schedule(() => {
    showPill(pill2, "slot-2");
  }, 3400);

  schedule(() => {
    showPill(pill3, "slot-3");
  }, 5300);

  schedule(() => {
    showPill(pill4, "slot-4");
  }, 7200);

  /* silk release */
  schedule(() => {
    exitPill(pill4, "exit-right");
  }, 13800);

  schedule(() => {
    exitPill(pill3, "exit-left");
  }, 14020);

  schedule(() => {
    exitPill(pill2, "exit-right");
  }, 14240);

  schedule(() => {
    exitPill(pill1, "exit-left");
  }, 14460);

  schedule(() => {
    overlay.classList.add("closing");
  }, 15850);

  schedule(() => {
    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    clearInterventionTimers();
    resetPills();
    started = false;
  }, 17200);
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
