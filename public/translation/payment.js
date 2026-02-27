/* =========================================================
   SayBon Payment Page (Stripe + Paystack)
   URL format: /translation/payment.html?plan=standard&words=172
   IMPORTANT: backend expects amounts in MINOR units (cents)
========================================================= */

(function () {
  const qs = new URLSearchParams(window.location.search);

  const plan = (qs.get("plan") || "standard").toLowerCase();
  const words = Math.max(0, parseInt(qs.get("words") || "0", 10));

  const rateStandard = 0.025;
  const rateExpress = 0.05;

  const rate = plan === "express" ? rateExpress : rateStandard;

  const totalUSD = words * rate;
  const totalCents = Math.round(totalUSD * 100); // ✅ integer cents

  const elPlan = document.getElementById("planText");
  const elWords = document.getElementById("wordsText");
  const elTotal = document.getElementById("totalText");

  const emailEl = document.getElementById("email");
  const currencyEl = document.getElementById("currency");

  const btnStripe = document.getElementById("btnStripe");
  const btnPaystack = document.getElementById("btnPaystack");

  function fmtMoneyUSD(v) {
    return "US$" + (Math.round(v * 100) / 100).toFixed(2);
  }

  function setUI() {
    if (elPlan) elPlan.textContent = plan;
    if (elWords) elWords.textContent = String(words);
    if (elTotal) elTotal.textContent = fmtMoneyUSD(totalUSD);
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      const msg = (json && (json.error || json.message)) ? (json.error || json.message) : text;
      throw new Error(msg || ("HTTP " + res.status));
    }

    return json;
  }

  async function onStripe() {
    try {
      btnStripe.disabled = true;
      btnStripe.textContent = "Redirecting…";

      const currency = (currencyEl && currencyEl.value) ? currencyEl.value : "USD";

      const data = await postJson("/api/pay/stripe", {
        amount: totalCents,          // ✅ cents
        currency: currency,
        plan: plan,
        words: words
      });

      if (!data.url) throw new Error("Stripe did not return a checkout URL.");
      window.location.href = data.url;

    } catch (e) {
      alert("Stripe error: " + e.message);
      btnStripe.disabled = false;
      btnStripe.textContent = "Pay with Stripe";
    }
  }

  async function onPaystack() {
    try {
      const email = (emailEl && emailEl.value) ? emailEl.value.trim() : "";
      if (!email) {
        alert("Please enter your email (required for Paystack).");
        return;
      }

      btnPaystack.disabled = true;
      btnPaystack.textContent = "Redirecting…";

      const data = await postJson("/api/pay/paystack", {
        amount: totalCents,          // ✅ cents
        email: email,
        plan: plan,
        words: words
      });

      if (!data.url) throw new Error("Paystack did not return an authorization URL.");
      window.location.href = data.url;

    } catch (e) {
      alert("Paystack error: " + e.message);
      btnPaystack.disabled = false;
      btnPaystack.textContent = "Pay with Paystack";
    }
  }

  if (btnStripe) btnStripe.addEventListener("click", onStripe);
  if (btnPaystack) btnPaystack.addEventListener("click", onPaystack);

  document.addEventListener("DOMContentLoaded", setUI);
  setUI();
})();
