(() => {
  "use strict";
  const BACKEND = "https://saybon-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");

  const deliverBtn = document.getElementById("deliverBtn");
  const archiveBtn = document.getElementById("archiveBtn");
  const status = document.getElementById("status");

  deliverBtn.onclick = async () => {
    try {
      const res = await fetch(${BACKEND}/api/deliverJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delivery failed");

      status.textContent = "Marked delivered.";
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  };

  archiveBtn.onclick = async () => {
    try {
      const res = await fetch(${BACKEND}/api/archiveJob, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Archive failed");

      status.textContent = "Archived.";
    } catch (err) {
      console.error(err);
      status.textContent = err.message;
    }
  };
})();
