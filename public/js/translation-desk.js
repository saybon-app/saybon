(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const translatorName = document.getElementById("translatorName");
  const claimBtn = document.getElementById("claimBtn");
  const translationText = document.getElementById("translationText");
  const submitBtn = document.getElementById("submitBtn");
  const status = document.getElementById("status");

  claimBtn.onclick = async () => {
    try {
      const res = await fetch(${BACKEND}/api/claimJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          translator: translatorName.value.trim() || "translator"
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Claim failed");

      status.textContent = "Job claimed.";
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  };

  submitBtn.onclick = async () => {
    try {
      const res = await fetch(${BACKEND}/api/submitTranslation, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          translation: translationText.value.trim()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Submit failed");

      window.location.href = /translation/review.html?job=;
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  };
})();
