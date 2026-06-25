(function () {
  const HOME_URL = "/";
  const LOADER_URL = "/loader.html";
  const NEXT_URL = "/placement.html";

  const reasonMap = {
    personal: "personal",
    school: "school",
    travel: "travel",
    career: "career"
  };

  function saveReason(reason) {
    if (!reason) return;
    sessionStorage.setItem("saybon_reason", reason);
    localStorage.setItem("saybon_reason", reason);
  }

  function goToLoader(nextUrl) {
    sessionStorage.setItem("saybon_next", nextUrl);
    window.location.href = LOADER_URL;
  }

  function bindReasonOptions() {
    const options = document.querySelectorAll("[data-reason]");
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const raw = option.getAttribute("data-reason") || "";
        const reason = reasonMap[raw] || raw;
        saveReason(reason);
        goToLoader(NEXT_URL);
      });
    });
  }

  function bindHomeButton() {
    const btn = document.getElementById("whyHomeBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.location.href = HOME_URL;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindHomeButton();
    bindReasonOptions();
  });
})();
