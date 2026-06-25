(function () {
  const HOME_URL = "/";
  const NEXT_URL = "/loader.html";

  const reasonToLevel = {
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

  function goNext(reason) {
    saveReason(reason);
    window.location.href = NEXT_URL;
  }

  function bindReasonCards() {
    const cards = document.querySelectorAll("[data-reason]");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const reason = card.getAttribute("data-reason");
        goNext(reasonToLevel[reason] || reason);
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
    bindReasonCards();
  });
})();
