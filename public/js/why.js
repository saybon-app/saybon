(function () {
  const HOME_URL = "/";
  const NEXT_URL = "/loader.html";

  const reasonMap = {
    personal: "personal",
    school: "school",
    travel: "travel",
    career: "career"
  };

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

  function bindReasonButtons() {
    const buttons = document.querySelectorAll("[data-reason]");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const raw = button.getAttribute("data-reason") || "";
        const reason = reasonMap[raw] || raw;
        goNext(reason);
      });
    });
  }

  function bindHomeButton() {
    const btn = document.getElementById("whyHomeBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.location.href = HOME_URL;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindHomeButton();
    bindReasonButtons();
  });
})();
