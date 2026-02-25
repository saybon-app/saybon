console.log('[SayBon] requestTranslation.js loaded');
/* =========================================================
   SayBon — Request Quote (Robust Renderer)
   - No design changes
   - Works even if IDs/classes change
   - Renders quote cards reliably
========================================================= */

(function () {
  "use strict";

  const PRICING = {
    standard: { rate: 0.025, tiers: [
      { min: 0,    max: 300,  eta: "1–3 hrs" },
      { min: 301,  max: 1000, eta: "3–6 hrs" },
      { min: 1001, max: 3000, eta: "6–12 hrs" },
      { min: 3001, max: 5000, eta: "12–24 hrs" },
    ]},
    express: { rate: 0.05, tiers: [
      { min: 0,    max: 300,  eta: "30–60 mins" },
      { min: 301,  max: 1000, eta: "1–3 hrs" },
      { min: 1001, max: 3000, eta: "3–6 hrs" },
      { min: 3001, max: 5000, eta: "6–12 hrs" },
    ]},
  };

  function money(n) {
    // keep clean formatting; adjust currency display on payment page if needed
    return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
  }

  function pickTier(tiers, words) {
    for (const t of tiers) {
      if (words >= t.min && words <= t.max) return t;
    }
    // If beyond table, keep last tier messaging but still compute
    return tiers[tiers.length - 1];
  }

  function countWords(text) {
    if (!text) return 0;
    // Unicode-friendly word match
    const m = text.trim().match(/[\p{L}\p{N}’']+/gu);
    return m ? m.length : 0;
  }

  function findUploadButton() {
    return (
      document.getElementById("uploadBtn") ||
      document.querySelector('[data-action="get-quote"]') ||
      Array.from(document.querySelectorAll("button, a"))
        .find(el => (el.textContent || "").trim().toLowerCase() === "upload document to get quote")
    );
  }

  function findFileInput() {
    return (
      document.getElementById("fileInput") ||
      document.querySelector('input[type="file"]') ||
      document.querySelector('input[type="file"][name="file"]')
    );
  }

  function findQuoteMount(uploadBtn) {
    return (
      document.getElementById("quoteMount") ||
      document.getElementById("quoteSection") ||
      document.getElementById("pricingSection") ||
      document.querySelector('[data-quote-mount="true"]') ||
      // If you have "Quote Ready Below" text, mount right under its container
      (function () {
        const el = Array.from(document.querySelectorAll("*"))
          .find(n => (n.textContent || "").trim() === "Quote Ready Below");
        return el ? (el.parentElement || el) : null;
      })() ||
      // fallback: create mount right after the upload button
      (function () {
        if (!uploadBtn) return null;
        const wrap = document.createElement("div");
        wrap.id = "quoteMount";
        wrap.style.marginTop = "14px";
        uploadBtn.insertAdjacentElement("afterend", wrap);
        return wrap;
      })()
    );
  }

  function setIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderQuoteUI(mount, words, standardPrice, expressPrice, standardEta, expressEta) {
    if (!mount) return;

    // If mount was your "Quote Ready Below" container, clear it but keep container element
    mount.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "sb-quote-wrap";

    // Word count line (minimal — your CSS can style if you want)
    const meta = document.createElement("div");
    meta.className = "sb-quote-meta";
    meta.innerHTML = `<div class="sb-quote-words">Word count: <strong>${words}</strong></div>`;
    wrapper.appendChild(meta);

    // Cards
    const cards = document.createElement("div");
    cards.className = "sb-quote-cards";
    cards.style.display = "grid";
    cards.style.gap = "12px";
    cards.style.marginTop = "12px";

    const standardBtn = document.createElement("button");
    standardBtn.type = "button";
    standardBtn.className = "sb-quote-card sb-quote-standard";
    standardBtn.setAttribute("data-service", "standard");
    standardBtn.innerHTML = `
      <div class="sb-quote-title">Standard Quote</div>
      <div class="sb-quote-price">${money(standardPrice)}</div>
      <div class="sb-quote-eta">${standardEta}</div>
    `;

    const expressBtn = document.createElement("button");
    expressBtn.type = "button";
    expressBtn.className = "sb-quote-card sb-quote-express";
    expressBtn.setAttribute("data-service", "express");
    expressBtn.innerHTML = `
      <div class="sb-quote-title">Express Quote</div>
      <div class="sb-quote-price">${money(expressPrice)}</div>
      <div class="sb-quote-eta">${expressEta}</div>
    `;

    // Make them feel reactive without changing your CSS:
    [standardBtn, expressBtn].forEach(b => {
      b.style.cursor = "pointer";
      b.style.border = "none";
      b.style.background = "transparent";
      b.addEventListener("mouseenter", () => b.style.transform = "translateY(-1px)");
      b.addEventListener("mouseleave", () => b.style.transform = "");
      b.addEventListener("mousedown", () => b.style.transform = "translateY(0px)");
      b.addEventListener("mouseup", () => b.style.transform = "translateY(-1px)");
    });

    cards.appendChild(standardBtn);
    cards.appendChild(expressBtn);

    wrapper.appendChild(cards);
    mount.appendChild(wrapper);

    // navigation + persist quote for payment page
    function go(service) {
      const payload = {
        service,
        words,
        price: service === "standard" ? money(standardPrice) : money(expressPrice),
        eta: service === "standard" ? standardEta : expressEta
      };
      try { sessionStorage.setItem("sb_translation_quote", JSON.stringify(payload)); } catch (e) {}
      const qs = new URLSearchParams(payload).toString();
      window.location.href = `/translation/payment.html?${qs}`;
    }

    standardBtn.addEventListener("click", () => go("standard"));
    expressBtn.addEventListener("click", () => go("express"));
  }

  async function handleQuote() {
    const fileInput = findFileInput();
    const uploadBtn = findUploadButton();

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      alert("Please choose a file first.");
      return;
    }

    const file = fileInput.files[0];

    // Read as text (your current test.txt scenario works perfectly)
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });

    const words = countWords(text);

    const stTier = pickTier(PRICING.standard.tiers, words);
    const exTier = pickTier(PRICING.express.tiers, words);

    const standardPrice = words * PRICING.standard.rate;
    const expressPrice = words * PRICING.express.rate;

    // Fill old placeholders if they exist (no design changes)
    setIfExists("wordCount", String(words));
    setIfExists("standardPrice", money(standardPrice));
    setIfExists("expressPrice", money(expressPrice));

    const mount = findQuoteMount(uploadBtn);
    renderQuoteUI(mount, words, standardPrice, expressPrice, stTier.eta, exTier.eta);

    // If you still have a "Quote Ready Below" text element somewhere, leave it alone visually
    // (your mount will now show the cards)
  }

  function init() {
    const uploadBtn = findUploadButton();
    const fileInput = findFileInput();

    // if the upload button exists, use click (your intended behavior)
    if (uploadBtn) {
      uploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleQuote();
      });
    }

    // also allow auto-refresh quote when selecting a file (safe)
    if (fileInput) {
      fileInput.addEventListener("change", () => {
        // do nothing if you strictly want button-only
        // (keep this silent to avoid unexpected UI changes)
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

