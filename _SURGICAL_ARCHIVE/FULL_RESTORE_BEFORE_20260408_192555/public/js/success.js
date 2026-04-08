(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  async function load() {
    if (!jobId) return;

    const res = await fetch(${BACKEND}/api/job/);
    const data = await res.json();

    if (!data.success) return;

    const job = data.job;
    document.getElementById("jobId").textContent = job.jobId;
    document.getElementById("statusLabel").textContent = job.status || "-";
    document.getElementById("stageLabel").textContent = job.stage || "-";
    document.getElementById("planLabel").textContent = job.plan || "-";
    document.getElementById("priceLabel").textContent = job.price || "-";
  }

  load();
})();
