const options = document.querySelectorAll(".why-option");
const affirmationBox = document.getElementById("affirmationBox");
const homeBtn = document.getElementById("whyHomeBtn");

/* =========================================================
   LOADER HISTORY REPAIR
========================================================= */
(function repairLoaderHistoryOnWhy() {
  const prev = sessionStorage.getItem("saybon_prev");
  if (!prev) return;

  try {
    history.replaceState(
      { ...(history.state || {}), saybonLoaderPrev: prev },
      "",
      window.location.href
    );
  } catch (_) {}

  let repaired = false;

  window.addEventListener("popstate", () => {
    if (repaired) return;
    repaired = true;
    window.location.replace(prev);
  }, { once: true });
})();

/* =========================================================
   HOME BUTTON
========================================================= */
if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    window.location.href = "/index.html";
  });

  const pressOn = () => homeBtn.classList.add("is-pressed");
  const pressOff = () => homeBtn.classList.remove("is-pressed");

  homeBtn.addEventListener("pointerdown", pressOn, { passive:true });
  homeBtn.addEventListener("pointerup", pressOff, { passive:true });
  homeBtn.addEventListener("pointercancel", pressOff, { passive:true });
  homeBtn.addEventListener("pointerleave", pressOff, { passive:true });
}

/* =========================================================
   AFFIRMATION TEXT
========================================================= */
const tags = {
  travel:
    "Better get your passport ready then… on y va ✈️🌍",

  career:
    "Ambition looks good on you… allez travailler 💼✨",

  school:
    "Brain glow activated… très studieux 📚✨",

  personal:
    "Whatever your reasons may be, we’ve got you covered. 💫"
};

/* =========================================================
   OPTION PRESS FEEDBACK
========================================================= */
function bindPressFeedback(el) {
  if (!el) return;

  const pressOn = () => el.classList.add("is-pressed");
  const pressOff = () => el.classList.remove("is-pressed");

  el.addEventListener("pointerdown", pressOn, { passive:true });
  el.addEventListener("pointerup", pressOff, { passive:true });
  el.addEventListener("pointercancel", pressOff, { passive:true });
  el.addEventListener("pointerleave", pressOff, { passive:true });
}

options.forEach(bindPressFeedback);

/* =========================================================
   OPTION SELECTION FLOW
========================================================= */
options.forEach(btn => {
  btn.addEventListener("click", () => {

    // Fade out all other options
    options.forEach(o => {
      if (o !== btn) o.classList.add("fade-out");
    });

    // Keep selected option visible and slightly emphasized
    btn.classList.add("selected");

    // Show affirmation
    const key = btn.dataset.reason;
    affirmationBox.textContent = tags[key] || "";
    affirmationBox.classList.remove("hidden");

    // Move to start page through loader
    setTimeout(() => {
      sessionStorage.setItem("saybon_prev", window.location.pathname);
      sessionStorage.setItem("saybon_next", "/start.html");
      window.location.href = "/loader.html";
    }, 2200);
  });
});
