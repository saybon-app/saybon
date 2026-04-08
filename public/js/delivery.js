(() => {
  "use strict";

  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const deliverBtn = document.getElementById("deliverBtn");
  const archiveBtn = document.getElementById("archiveBtn");
  const deliveryStatus = document.getElementById("deliveryStatus");
  const deliverySummary = document.getElementById("deliverySummary");

  function renderSummary(job) {
    deliverySummary.innerHTML = 
      <div class="panel">
        <h3 class="panel-title mono"></h3>
        <p class="panel-copy">Approved work prepared for client delivery and archival closure.</p>
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
          <div class="meta-label">Delivery Status</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta">
          <div class="meta-label">Archived</div>
          <div class="meta-value"></div>
        </div>
      </div>
    ;
  }

  async function loadJob() {
    if (!jobId) {
      deliveryStatus.textContent = "No job selected. Open a reviewed job to finalize it.";
      return;
    }

    try {
      const res = await fetch(${BACKEND}/api/job/);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load job");
      }

      renderSummary(data.job);
    } catch (err) {
      console.error(err);
      deliveryStatus.textContent = err.message;
    }
  }

  deliverBtn.onclick = async () => {
    try {
      if (!jobId) throw new Error("No job selected");

      const res = await fetch(${BACKEND}/api/deliverJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delivery failed");
      }

      deliveryStatus.textContent = "Job marked as delivered.";
      await loadJob();
    } catch (err) {
      console.error(err);
      deliveryStatus.textContent = err.message;
    }
  };

  archiveBtn.onclick = async () => {
    try {
      if (!jobId) throw new Error("No job selected");

      const res = await fetch(${BACKEND}/api/archiveJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Archive failed");
      }

      deliveryStatus.textContent = "Job archived successfully.";
      await loadJob();
    } catch (err) {
      console.error(err);
      deliveryStatus.textContent = err.message;
    }
  };

  loadJob();
})();
