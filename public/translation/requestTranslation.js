// SayBon Translation Request
// - Computes word count (best-effort client-side)
// - Shows word count line first
// - Renders 2 quote option cards (Standard / Express) as clickable buttons
// - Redirects to /translation/payment.html with query params

(() => {
  const fileInput = document.getElementById("fileInput");
  const fileName = document.getElementById("fileName");
  const uploadBtn = document.getElementById("uploadBtn");
  const quoteCards = document.getElementById("quoteCards");
  const wordCountLine = document.getElementById("wordCountLine");

  if (!fileInput || !fileName || !uploadBtn || !quoteCards || !wordCountLine) {
    // If markup is missing, fail silently (prevents breaking page rendering).
    return;
  }

  // Pricing tiers are inclusive on the upper bound.
  const STANDARD_RATE = 0.025;
  const EXPRESS_RATE = 0.05;

  const STANDARD_TIERS = [
    { max: 300, timeline: "1-3 hrs" },
    { max: 1000, timeline: "3-6 hrs" },
    { max: 3000, timeline: "6-12 hrs" },
    { max: 5000, timeline: "12-24 hrs" },
  ];

  const EXPRESS_TIERS = [
    { max: 300, timeline: "30-60 mins" },
    { max: 1000, timeline: "1-3 hrs" },
    { max: 3000, timeline: "3-6 hrs" },
    { max: 5000, timeline: "6-12 hrs" },
  ];

  const setButtonIdle = () => {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Document To Get Quote";
  };

  const setButtonLoading = () => {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `
      <span class="btn-inline">
        Getting quote
        <span class="spinner-emoji" aria-hidden="true">\u23F3</span>
      </span>
    `;
  };

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    fileName.textContent = file ? file.name : "No file chosen";

    // Reset quote UI when choosing a new file.
    wordCountLine.style.display = "none";
    wordCountLine.textContent = "";
    quoteCards.style.display = "none";
    quoteCards.innerHTML = "";
    setButtonIdle();
  });

  const getTierTimeline = (tiers, wordCount) => {
    for (const t of tiers) {
      if (wordCount <= t.max) return t.timeline;
    }
    // If larger than our table, use the last tier as a safe fallback.
    return tiers[tiers.length - 1].timeline;
  };

  // Best-effort word counting for:
  // - .txt (exact)
  // - other formats: fallback estimate (keeps UI fast + reliable)
  const countWordsFromText = (text) => {
    const cleaned = String(text).replace(/\s+/g, " ").trim();
    if (!cleaned) return 0;
    return cleaned.split(" ").filter(Boolean).length;
  };

  const estimateWordsFallback = (file) => {
    // Rough heuristic for non-text: keeps experience consistent.
    const approx = Math.max(1, Math.round(file.size / 10));
    return approx;
  };

  const countWords = async (file) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();

    if (ext === "txt") {
      const text = await file.text();
      return countWordsFromText(text);
    }

    return estimateWordsFallback(file);
  };

  const renderQuoteCards = ({ wordCount, standardPrice, expressPrice, standardTimeline, expressTimeline }) => {
    quoteCards.innerHTML = "";

    const makeCard = ({ kind, title, price, timeline }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `quote-card ${kind}`;
      btn.innerHTML = `
        <h4>${escapeHtml(title)}</h4>
        <div class="quote-meta">
          <div class="quote-price">$${Number(price).toFixed(2)}</div>
          <div class="quote-time">${escapeHtml(timeline)}</div>
        </div>
      `;

      btn.addEventListener("click", () => {
        const url = new URL("/translation/payment.html", window.location.origin);
        url.searchParams.set("plan", kind);
        url.searchParams.set("words", String(wordCount));
        url.searchParams.set("price", String(Number(price).toFixed(2)));
        url.searchParams.set("timeline", timeline);
        window.location.href = url.toString();
      });

      return btn;
    };

    quoteCards.appendChild(
      makeCard({
        kind: "standard",
        title: "Standard",
        price: standardPrice,
        timeline: standardTimeline,
      })
    );

    quoteCards.appendChild(
      makeCard({
        kind: "express",
        title: "Express",
        price: expressPrice,
        timeline: expressTimeline,
      })
    );

    quoteCards.style.display = "grid";
  };

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert("Please choose a file first.");
      return;
    }

    setButtonLoading();

    try {
      const wordCount = await countWords(file);

      // Always show word count FIRST.
      wordCountLine.textContent = `${wordCount.toLocaleString()} words detected`;
      wordCountLine.style.display = "block";

      const standardTimeline = getTierTimeline(STANDARD_TIERS, wordCount);
      const expressTimeline = getTierTimeline(EXPRESS_TIERS, wordCount);

      const standardPrice = wordCount * STANDARD_RATE;
      const expressPrice = wordCount * EXPRESS_RATE;

      renderQuoteCards({
        wordCount,
        standardPrice,
        expressPrice,
        standardTimeline,
        expressTimeline,
      });
    } catch (err) {
      console.error(err);
      alert("Sorry — we couldn't read that file. Please try another file.");
    } finally {
      // Button returns to idle once quote options are ready.
      setButtonIdle();
    }
  });
})();
