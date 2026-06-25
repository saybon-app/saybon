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
const teacherImg = teacher?.querySelector("img");

let started = false;

/* =========================================================
   HOMEPAGE REVEAL
   Goal:
   - no dead black waiting screen
   - background reveals quickly
   - all visible homepage elements fade in smoothly
   - no choppy pop-in even if images finish slightly later
========================================================= */

function waitForImage(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });

    // fallback so one slow image doesn't hold the page hostage
    setTimeout(finish, 1800);
  });
}

function revealHomepage() {
  document.body.classList.add("home-preload");

  const bgPromise = waitForImage(backgroundImg);
  const teacherPromise = waitForImage(teacherImg);

  // reveal background as soon as it is ready (or fallback timer hits)
  bgPromise.then(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("home-bg-ready");
    });
  });

  // reveal the rest shortly after background readiness OR teacher readiness,
  // whichever gives a smoother assembled feel first
  Promise.race([
    Promise.all([bgPromise, teacherPromise]),
    new Promise((resolve) => setTimeout(resolve, 320))
  ]).then(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("home-ui-ready");
        document.body.classList.remove("home-preload");
      });
    });
  });

  // absolute safety release in case browser is slow decoding assets
  setTimeout(() => {
    document.body.classList.add("home-bg-ready", "home-ui-ready");
    document.body.classList.remove("home-preload");
  }, 2200);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", revealHomepage, { once: true });
} else {
  revealHomepage();
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

  /* ---------------------------------------------------
     TIMING PLAN
     0s    overlay starts appearing
     0-2s  overlay sharpens
     2s    pill 1 appears at bottom
     4s    pill 1 climbs to slot 1
     5s    pill 2 appears at bottom
     7s    pill 2 climbs to slot 2
     8s    pill 3 appears at bottom
     10s   pill 3 climbs to slot 3
     11s   pill 4 appears at bottom
     13s   pill 4 climbs to slot 4
     18s   exit pill 4
     19s   exit pill 3
     20s   exit pill 2
     21s   exit pill 1
     22s   overlay closing starts
     25s   overlay removed
  --------------------------------------------------- */

  // PILL 1
  setTimeout(() => {
    pill1?.classList.add("show");
  }, 2000);

  setTimeout(() => {
    pill1?.classList.add("slot-1");
  }, 4000);

  // PILL 2
  setTimeout(() => {
    pill2?.classList.add("show");
  }, 5000);

  setTimeout(() => {
    pill2?.classList.add("slot-2");
  }, 7000);

  // PILL 3
  setTimeout(() => {
    pill3?.classList.add("show");
  }, 8000);

  setTimeout(() => {
    pill3?.classList.add("slot-3");
  }, 10000);

  // PILL 4
  setTimeout(() => {
    pill4?.classList.add("show");
  }, 11000);

  setTimeout(() => {
    pill4?.classList.add("slot-4");
  }, 13000);

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

/* NAVIGATION */
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
