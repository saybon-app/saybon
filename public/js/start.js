// ================================
// SAYBON START PAGE ROUTING — FIXED
// ================================

const findLevel = document.getElementById("findLevel");
const startScratch = document.getElementById("startScratch");

/* =========================================================
   LOADER HISTORY REPAIR
   If we arrived here through loader, rewrite this history
   behavior so Back skips loader and returns to WHY.
========================================================= */
(function repairLoaderHistoryOnStart() {
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

// ================================
// FIND MY LEVEL
// start → loader → placement
// ================================
if (findLevel) {
  findLevel.addEventListener("click", () => {
    sessionStorage.setItem("saybon_prev", window.location.pathname);
    sessionStorage.setItem("saybon_next", "/placement/");
    window.location.href = "/loader.html";
  });
}

// ================================
// START FROM SCRATCH
// start → loader → login
// ================================
if (startScratch) {
  startScratch.addEventListener("click", () => {
    sessionStorage.setItem("saybon_prev", window.location.pathname);
    sessionStorage.setItem("saybon_next", "/auth/login.html");
    window.location.href = "/loader.html";
  });
}
