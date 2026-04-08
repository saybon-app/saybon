(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const jobIdEl = document.getElementById("jobId");
  const wordsEl = document.getElementById("words");
  const planEl = document.getElementById("plan");
  const priceEl = document.getElementById("price");
  const timelineEl = document.getElementById("timeline");
  const payBtn = document.getElementById("payBtn");
  const status = document.getElementById("status");

  async function loadJob() {
    if (!jobId) {
      status.textContent = "Missing job.";
      return;
    }

    try {
      const res = await fetch(${BACKEND}/api/job/);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load job");
      }

      const job = data.job;
      jobIdEl.textContent = job.jobId;
      wordsEl.textContent = job.words;
      planEl.textContent = job.plan;
      priceEl.textContent = job.price;
      timelineEl.textContent = job.deliveryTimeline;
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  }

  payBtn.onclick = async () => {
    try {
      status.textContent = "Redirecting to Stripe...";

      const res = await fetch(${BACKEND}/api/createCheckout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "Failed to create checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  };

  loadJob();
})();
