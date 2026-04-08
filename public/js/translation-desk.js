(() => {
  "use strict";

  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const translatorName = document.getElementById("translatorName");
  const claimBtn = document.getElementById("claimBtn");
  const submitBtn = document.getElementById("submitBtn");
  const translationText = document.getElementById("translationText");
  const deskStatus = document.getElementById("deskStatus");
  const jobSummary = document.getElementById("jobSummary");
  const openReviewLink = document.getElementById("openReviewLink");

  if (jobId) {
    openReviewLink.href = /translation/review.html?job=;
  }

  function renderSummary(job) {
    jobSummary.innerHTML = 
      <div class="panel">
        <h3 class="panel-title mono"></h3>
        <p class="panel-copy">Translation desk entry for the selected job.</p>
      </div>

      <div class="meta-grid">
        <div class="meta">
          <div class="meta-label">Stage</div>
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
          <div class="meta-label">Price</div>
          <div class="meta-value">UTF8{job.price ?? "-"}</div>
        </div>
        <div class="meta">
          <div class="meta-label">Plan</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Timeline</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Languages</div>
          <div class="meta-value"> → </div>
        </div>
        <div class="meta">
          <div class="meta-label">Translator</div>
          <div class="meta-value"></div>
        </div>
      </div>
    ;
  }

  async function loadJob() {
    if (!jobId) {
      deskStatus.textContent = "No job selected. Open a job from the queue.";
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
      if (job.submittedTranslation) {
        translationText.value = job.submittedTranslation;
      }
      if (job.assignedTranslator) {
        translatorName.value = job.assignedTranslator;
      }
    } catch (err) {
      console.error(err);
      deskStatus.textContent = err.message;
    }
  }

  claimBtn.onclick = async () => {
    try {
      if (!jobId) throw new Error("No job selected");

      const res = await fetch(${BACKEND}/api/claimJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          translator: translatorName.value.trim() || "translator"
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Claim failed");
      }

      deskStatus.textContent = "Job claimed successfully.";
      await loadJob();
    } catch (err) {
      console.error(err);
      deskStatus.textContent = err.message;
    }
  };

  submitBtn.onclick = async () => {
    try {
      if (!jobId) throw new Error("No job selected");
      if (!translationText.value.trim()) throw new Error("Translation content is required");

      const res = await fetch(${BACKEND}/api/submitTranslation, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          translation: translationText.value.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      window.location.href = /translation/review.html?job=;
    } catch (err) {
      console.error(err);
      deskStatus.textContent = err.message;
    }
  };

  loadJob();
})();
