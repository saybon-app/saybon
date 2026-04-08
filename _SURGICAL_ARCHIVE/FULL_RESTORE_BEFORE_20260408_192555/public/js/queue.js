(() => {
  "use strict";

  const BACKEND = "https://saybon-server.onrender.com";
  const queueList = document.getElementById("queueList");
  const kpiQueueCount = document.getElementById("kpiQueueCount");
  const kpiTotalWords = document.getElementById("kpiTotalWords");
  const kpiStandardCount = document.getElementById("kpiStandardCount");
  const kpiExpressCount = document.getElementById("kpiExpressCount");

  function number(value) {
    return Number(value || 0).toLocaleString();
  }

  function badgeForPlan(plan) {
    return plan === "express"
      ? '<span class="badge badge-amber">Express</span>'
      : '<span class="badge badge-blue">Standard</span>';
  }

  async function loadQueue() {
    try {
      const res = await fetch(${BACKEND}/api/queue);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load queue");
      }

      const jobs = Array.isArray(data.jobs) ? data.jobs : [];

      kpiQueueCount.textContent = number(jobs.length);
      kpiTotalWords.textContent = number(jobs.reduce((sum, job) => sum + Number(job.words || 0), 0));
      kpiStandardCount.textContent = number(jobs.filter(job => job.plan !== "express").length);
      kpiExpressCount.textContent = number(jobs.filter(job => job.plan === "express").length);

      if (!jobs.length) {
        queueList.innerHTML = '<div class="empty">No jobs are currently waiting in the queue.</div>';
        return;
      }

      queueList.innerHTML = jobs.map(job => 
        <article class="job-card">
          <div class="job-top">
            <div>
              <div class="job-code mono"></div>
              <div class="section-subtitle">Ready to move into the translation desk.</div>
            </div>

            <div class="badge-row">
              
              <span class="badge badge-green">Paid</span>
              <span class="badge badge-blue">Queue</span>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta">
              <div class="meta-label">Words</div>
              <div class="meta-value"></div>
            </div>
            <div class="meta">
              <div class="meta-label">Price</div>
              <div class="meta-value">UTF8{job.price ?? "-"}</div>
            </div>
            <div class="meta">
              <div class="meta-label">Timeline</div>
              <div class="meta-value"></div>
            </div>
            <div class="meta">
              <div class="meta-label">Languages</div>
              <div class="meta-value"> → </div>
            </div>
          </div>

          <div class="actions">
            <a class="btn btn-primary" href="/translation/translation-desk.html?job=">Open Translation Desk</a>
            <a class="btn btn-secondary" href="/translation/review.html?job=">Open Review</a>
          </div>
        </article>
      ).join("");
    } catch (err) {
      console.error(err);
      queueList.innerHTML = <div class="empty"></div>;
    }
  }

  loadQueue();
})();
