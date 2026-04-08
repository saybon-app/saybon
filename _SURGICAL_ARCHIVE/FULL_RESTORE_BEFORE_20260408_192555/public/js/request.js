(() => {
  "use strict";

  const BACKEND = "https://saybon-server.onrender.com";

  const fileInput = document.getElementById("fileInput");
  const clientEmail = document.getElementById("clientEmail");
  const sourceLanguage = document.getElementById("sourceLanguage");
  const targetLanguage = document.getElementById("targetLanguage");
  const standardBtn = document.getElementById("standardBtn");
  const expressBtn = document.getElementById("expressBtn");
  const quoteBox = document.getElementById("quoteBox");
  const wordCountEl = document.getElementById("wordCount");
  const planLabel = document.getElementById("planLabel");
  const priceLabel = document.getElementById("priceLabel");
  const timelineLabel = document.getElementById("timelineLabel");
  const continueBtn = document.getElementById("continueBtn");
  const status = document.getElementById("status");

  let selectedPlan = "standard";
  let currentWords = 0;
  let currentPrice = 0;
  let currentTimeline = "";
  let currentFileName = "";

  function countWords(text) {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function computePrice(words, plan) {
    return (words * (plan === "express" ? 0.05 : 0.025)).toFixed(2);
  }

  function computeTimeline(words, plan) {
    if (words <= 300) return plan === "express" ? "30–60 mins" : "1–3 hrs";
    if (words <= 1000) return plan === "express" ? "1–3 hrs" : "3–6 hrs";
    if (words <= 3000) return plan === "express" ? "3–6 hrs" : "6–12 hrs";
    if (words <= 6000) return plan === "express" ? "6–12 hrs" : "12–24 hrs";
    if (words <= 10000) return plan === "express" ? "12–24 hrs" : "24–48 hrs";
    if (words <= 20000) return plan === "express" ? "24–48 hrs" : "2–4 days";
    return "Custom";
  }

  async function extractText(file) {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "txt") {
      return await file.text();
    }

    // Basic fallback for now.
    // You can later replug mammoth/pdf.js if needed.
    return await file.text().catch(() => "");
  }

  function refreshQuote() {
    if (!currentWords) return;

    currentPrice = computePrice(currentWords, selectedPlan);
    currentTimeline = computeTimeline(currentWords, selectedPlan);

    wordCountEl.textContent = currentWords;
    planLabel.textContent = selectedPlan === "express" ? "Express" : "Standard";
    priceLabel.textContent = currentPrice;
    timelineLabel.textContent = currentTimeline;
    quoteBox.style.display = "block";
  }

  standardBtn.onclick = () => {
    selectedPlan = "standard";
    refreshQuote();
  };

  expressBtn.onclick = () => {
    selectedPlan = "express";
    refreshQuote();
  };

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    status.textContent = "Reading file...";
    currentFileName = file.name;

    const text = await extractText(file);
    currentWords = countWords(text);

    if (!currentWords) {
      status.textContent = "Could not extract words from this file.";
      return;
    }

    refreshQuote();
    status.textContent = "Quote ready.";
  });

  continueBtn.onclick = async () => {
    try {
      status.textContent = "Creating job...";

      const response = await fetch(${BACKEND}/api/createJob, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          words: currentWords,
          plan: selectedPlan,
          clientEmail: clientEmail.value.trim(),
          sourceLanguage: sourceLanguage.value.trim() || "English",
          targetLanguage: targetLanguage.value.trim() || "French",
          originalFileName: currentFileName
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Job creation failed");
      }

      window.location.href = /translation/payment.html?job=;
    } catch (err) {
      console.error(err);
      status.textContent = err.message || "Failed to create job.";
    }
  };
})();
