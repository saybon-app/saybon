(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const queueList = document.getElementById("queueList");

  async function loadQueue() {
    const res = await fetch(${BACKEND}/api/queue);
    const data = await res.json();

    if (!data.success) {
      queueList.innerHTML = "<p>Failed to load queue.</p>";
      return;
    }

    if (!data.jobs.length) {
      queueList.innerHTML = "<p>No jobs in queue.</p>";
      return;
    }

    queueList.innerHTML = data.jobs.map(job => 
      <div style="padding:20px;margin:16px 0;background:#fff;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <p><strong>Job:</strong> </p>
        <p><strong>Words:</strong> </p>
        <p><strong>Plan:</strong> </p>
        <p><strong>Price:</strong> UTF8{job.price}</p>
        <a href="/translation/translation-desk.html?job=">Open Desk</a>
      </div>
    ).join("");
  }

  loadQueue();
})();
