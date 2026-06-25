(function () {
  const HOME_URL = "/";
  const NEXT_URL = "/loader.html";

  function saveReason(reason) {
    if (!reason) return;
    try {
      sessionStorage.setItem("saybon_reason", reason);
      localStorage.setItem("saybon_reason", reason);
    } catch (_) {}
  }

  function goNext(reason) {
    saveReason(reason);
    window.location.href = NEXT_URL;
  }

  function bindReasons() {
    document.querySelectorAll("[data-reason]").forEach((button) => {
      button.addEventListener("click", function () {
        const reason = button.getAttribute("data-reason");
        goNext(reason);
      });
    });
  }

  function bindHome() {
    const btn = document.getElementById("whyHomeBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.location.href = HOME_URL;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindHome();
    bindReasons();
  });
})();
