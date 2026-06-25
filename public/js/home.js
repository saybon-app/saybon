/* =========================================================
   SAYBON INTERVENTION SURGICAL FIX
   TARGET = PHOTO 7
========================================================= */

(function () {
  const teacher = document.getElementById("teacher");
  const audio = document.getElementById("introAudio");
  const overlay = document.getElementById("offerOverlay");

  const pill1 = document.getElementById("pill1");
  const pill2 = document.getElementById("pill2");
  const pill3 = document.getElementById("pill3");
  const pill4 = document.getElementById("pill4");

  if (!teacher || !overlay || !pill1 || !pill2 || !pill3 || !pill4) {
    return;
  }

  const pills = [pill1, pill2, pill3, pill4];
  let running = false;
  let timers = [];

  function addTimer(fn, ms) {
    const id = window.setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach(id => clearTimeout(id));
    timers = [];
  }

  function resetPills() {
    pills.forEach(pill => {
      pill.classList.remove("show", "exit");
    });
  }

  function openOverlay() {
    overlay.classList.remove("hidden", "closing");
    overlay.setAttribute("aria-hidden", "false");
    overlay.style.pointerEvents = "auto";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add("active");
      });
    });
  }

  function closeOverlay() {
    overlay.classList.remove("active");
    overlay.classList.add("closing");
    overlay.style.pointerEvents = "none";
    document.body.classList.remove("intervention-running");
    document.body.classList.add("intervention-closing");
  }

  function finishIntervention() {
    clearTimers();
    resetPills();

    overlay.classList.remove("active", "closing");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.pointerEvents = "none";

    document.body.classList.remove("intervention-running", "intervention-closing");
    running = false;
  }

  function startIntervention() {
    if (running) return;
    running = true;

    clearTimers();
    resetPills();

    document.body.classList.remove("intervention-closing");
    document.body.classList.add("intervention-running");

    openOverlay();

    if (audio) {
      try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (_) {}
    }

    /* -----------------------------------------------------
       TARGET TIMING
       - pills start early enough
       - full sequence ~22 sec
       - mobile layout matches Photo 7
    ----------------------------------------------------- */

    addTimer(() => pill1.classList.add("show"), 1700);
    addTimer(() => pill2.classList.add("show"), 4700);
    addTimer(() => pill3.classList.add("show"), 7700);
    addTimer(() => pill4.classList.add("show"), 10700);

    addTimer(() => pill4.classList.add("exit"), 17300);
    addTimer(() => pill3.classList.add("exit"), 18100);
    addTimer(() => pill2.classList.add("exit"), 18900);
    addTimer(() => pill1.classList.add("exit"), 19700);

    addTimer(() => closeOverlay(), 20400);
    addTimer(() => finishIntervention(), 22000);
  }

  teacher.addEventListener("click", startIntervention);
})();
[
        pill1,
        pill2,
        pill3,
        pill4
    ].forEach(p => {
        p.classList.remove("show");
    });

    requestAnimationFrame(() => {
        overlay.classList.add("active");
    });

    audio.currentTime = 0;
    audio.play().catch(()=>{});

    /* 3s */
    setTimeout(() => {
        pill1.classList.add("show");
    }, 3000);

    /* 6s */
    setTimeout(() => {
        pill2.classList.add("show");
    }, 6000);

    /* 9s */
    setTimeout(() => {
        pill3.classList.add("show");
    }, 9000);

    /* 12s */
    setTimeout(() => {
        pill4.classList.add("show");
    }, 12000);

    /* Outro begins */
    setTimeout(() => {
        overlay.classList.add("closing");
    }, 20000);

    /* Hide */
    setTimeout(() => {

        overlay.classList.remove(
            "active",
            "closing"
        );

        overlay.classList.add("hidden");

        [
            pill1,
            pill2,
            pill3,
            pill4
        ].forEach(p => {
            p.classList.remove("show");
        });

        started = false;

    }, 25000);

});

document.getElementById("startBtn").onclick = (e) => {
    e.stopPropagation();
    sessionStorage.setItem("saybon_next", "/why.html");
    window.location.href = "/loader.html";
};

document.getElementById("loginBtn").onclick = (e) => {
    e.stopPropagation();
    window.location.href = "/auth/login.html";
};

document.getElementById("settingsBtn").onclick = (e) => {
    e.stopPropagation();
    window.location.href = "/admin/passkey/";
};
