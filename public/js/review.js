(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const reviewedTranslation = document.getElementById("reviewedTranslation");
  const reviewFeedback = document.getElementById("reviewFeedback");
  const reviewScore = document.getElementById("reviewScore");
  const approveBtn = document.getElementById("approveBtn");
  const reviseBtn = document.getElementById("reviseBtn");
  const status = document.getElementById("status");

  async function sendReview(approved) {
    try {
      const res = await fetch(${BACKEND}/api/reviewJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          approved,
          reviewedTranslation: reviewedTranslation.value.trim(),
          reviewFeedback: reviewFeedback.value.trim(),
          reviewScore: Number(reviewScore.value || 0)
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Review failed");

      if (approved) {
        window.location.href = /translation/delivery.html?job=;
      } else {
        status.textContent = "Returned for revision.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  }

  approveBtn.onclick = () => sendReview(true);
  reviseBtn.onclick = () => sendReview(false);
})();
