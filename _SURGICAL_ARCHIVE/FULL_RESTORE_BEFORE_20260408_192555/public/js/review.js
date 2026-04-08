(() => {
  "use strict";

  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const reviewedTranslation = document.getElementById("reviewedTranslation");
  const reviewFeedback = document.getElementById("reviewFeedback");
  const reviewScore = document.getElementById("reviewScore");
  const reviewOutcomeHint = document.getElementById("reviewOutcomeHint");
  const approveBtn = document.getElementById("approveBtn");
  const reviseBtn = document.getElementById("reviseBtn");
  const reviewStatus = document.getElementById("reviewStatus");
  const reviewSummary = document.getElementById("reviewSummary");

  function renderSummary(job) {
    reviewSummary.innerHTML = 
      <div class="panel">
        <h3 class="panel-title mono"></h3>
        <p class="panel-copy">Submitted translation ready for editorial review.</p>
      </div>

      <div class="meta-grid">
        <div class="meta">
          <div class="meta-label">Current Stage</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Status</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Words</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Translator</div>
          <div class="meta-value"></div>
        </div>
      </div>

      <div class="panel">
        <h3 class="panel-title">Submitted Translation</h3>
        <p class="panel-copy"></p>
      </div>
    ;
  }

  async function loadJob() {
    if (!jobId) {
      reviewStatus.textContent = "No job selected. Open a job from the translation desk.";
      return;
    }

    try {
      const res = await fetch(${BACKEND}/api/job/);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load job");
      }

      const job = data.job;
      renderSummary(job);

      reviewedTranslation.value = job.reviewedTranslation || job.submittedTranslation || "";
      reviewFeedback.value = job.reviewFeedback || "";
      reviewScore.value = job.reviewScore || "";
    } catch (err) {
      console.error(err);
      reviewStatus.textContent = err.message;
    }
  }

  async function sendReview(approved) {
    try {
      if (!jobId) throw new Error("No job selected");

      const extraNote = reviewOutcomeHint.value.trim();
      const feedback = [reviewFeedback.value.trim(), extraNote].filter(Boolean).join(" | ");

      const res = await fetch(${BACKEND}/api/reviewJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          approved,
          reviewedTranslation: reviewedTranslation.value.trim(),
          reviewFeedback: feedback,
          reviewScore: Number(reviewScore.value || 0)
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Review failed");
      }

      if (approved) {
        window.location.href = /translation/delivery.html?job=;
      } else {
        reviewStatus.textContent = "Returned for revision successfully.";
      }
    } catch (err) {
      console.error(err);
      reviewStatus.textContent = err.message;
    }
  }

  approveBtn.onclick = () => sendReview(true);
  reviseBtn.onclick = () => sendReview(false);

  loadJob();
})();
