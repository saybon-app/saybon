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
   Matches the CSS block currently at the bottom of home.css:
   - home-preload
   - home-bg-in
   - home-teacher-in
   - home-ui-in
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
========================================================= */

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

teacher?.addEventListener("click", () => {
  if (started) return;
  started = true;

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
     TIMING PLAN
     0s    overlay starts appearing
     0-2s  overlay sharpens
     2s    pill 1 appears
     4s    pill 1 lands
     5s    pill 2 appears
     7s    pill 2 lands
     8s    pill 3 appears
     10s   pill 3 lands
     11s   pill 4 appears
     13s   pill 4 lands
     18s   exit pill 4
     19s   exit pill 3
     20s   exit pill 2
     21s   exit pill 1
     22s   overlay closes
     25s   overlay removed
  --------------------------------------------------- */

  setTimeout(() => {
    pill1?.classList.add("show");
  }, 2000);

  setTimeout(() => {
    pill1?.classList.add("slot-1");
  }, 4000);

  setTimeout(() => {
    pill2?.classList.add("show");
  }, 5000);

  setTimeout(() => {
    pill2?.classList.add("slot-2");
  }, 7000);

  setTimeout(() => {
    pill3?.classList.add("show");
  }, 8000);

  setTimeout(() => {
    pill3?.classList.add("slot-3");
  }, 10000);

  setTimeout(() => {
    pill4?.classList.add("show");
  }, 11000);

  setTimeout(() => {
    pill4?.classList.add("slot-4");
  }, 13000);

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
    document.body.classList.remove("intervention-running");
    resetPills();
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
