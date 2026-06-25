const options = document.querySelectorAll(".why-option");
const affirmationBox = document.getElementById("affirmationBox");

/* =========================================================
   LOADER HISTORY REPAIR
   If we arrived here through loader, rewrite this history
   entry so Back skips loader and goes to the previous page.
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

options.forEach(btn => {
  btn.addEventListener("click", () => {

    // 1) Fade out all other options
    options.forEach(o => {
      if (o !== btn) o.classList.add("fade-out");
    });

    // 2) Center selected option
    btn.classList.add("selected");

    // 3) Show affirmation tag
    const key = btn.dataset.reason;
    affirmationBox.textContent = tags[key];
    affirmationBox.classList.remove("hidden");

    // 4) After 3 seconds → loader → start.html
    setTimeout(() => {
      // overwrite prev so the next hop knows it came from WHY
      sessionStorage.setItem("saybon_prev", window.location.pathname);
      sessionStorage.setItem("saybon_next", "/start.html");
      window.location.href = "/loader.html";
    }, 3000);
  });
});
