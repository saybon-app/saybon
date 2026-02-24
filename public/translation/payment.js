/*
========================================
SayBon Payment Frontend
- Stripe:  POST /api/stripe/create-stripe-session
- Paystack: POST /api/paystack/initialize
========================================
*/

const BACKEND_BASE =
  window.SAYBON_BACKEND_BASE ||
  "https://saybon-backend.onrender.com"; // keep as canonical

const qs = new URLSearchParams(window.location.search);

function readParam(name, fallback = "") {
  const v = qs.get(name);
  if (v !== null && v !== "") return v;
  return fallback;
}

function setLocal(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}
function getLocal(key) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

function moneyLabel(currency, amountStr) {
  const c = (currency || "USD").toUpperCase();
  const n = Number.parseFloat(String(amountStr || "0"));
  const safe = Number.isFinite(n) ? n.toFixed(2) : "0.00";
  return `${c} ${safe}`;
}

function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.classList.add("show");
}

function clearError() {
  const box = document.getElementById("errorBox");
  box.textContent = "";
  box.classList.remove("show");
}

function setLoading(btn, isLoading, labelLoading) {
  const label = btn.querySelector(".btnlabel");
  if (!btn.dataset.originalLabel) btn.dataset.originalLabel = label.textContent;

  btn.classList.toggle("loading", isLoading);
  btn.disabled = isLoading;

  if (isLoading) {
    label.textContent = labelLoading;
  } else {
    label.textContent = btn.dataset.originalLabel;
  }
}

function animateDots(textBase) {
  // returns a controller for animated dots
  let i = 0;
  const states = ["", ".", "..", "..."];
  let timer = null;

  return {
    start(setter) {
      timer = setInterval(() => {
        i = (i + 1) % states.length;
        setter(`${textBase}${states[i]}`);
      }, 350);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
  };
}

function getState() {
  // Prefer URL params, fallback to localStorage
  const words = readParam("words", getLocal("saybon_words"));
  const delivery = readParam("delivery", getLocal("saybon_delivery"));
  const amount = readParam("amount", getLocal("saybon_amount"));
  const currency = readParam("currency", getLocal("saybon_currency") || "USD");
  const email = readParam("email", getLocal("saybon_email") || "customer@saybon.com");

  return { words, delivery, amount, currency, email };
}

function render() {
  const state = getState();

  document.getElementById("wordsText").textContent = state.words ? state.words : "—";
  document.getElementById("deliveryText").textContent = state.delivery ? state.delivery : "—";
  document.getElementById("amountText").textContent = state.amount ? moneyLabel(state.currency, state.amount) : "—";

  const currencySelect = document.getElementById("currencySelect");
  currencySelect.value = (state.currency || "USD").toUpperCase();

  // Save for future
  setLocal("saybon_words", state.words || "");
  setLocal("saybon_delivery", state.delivery || "");
  setLocal("saybon_amount", state.amount || "");
  setLocal("saybon_currency", state.currency || "USD");
  setLocal("saybon_email", state.email || "customer@saybon.com");
}

async function postJson(url, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data?.success) {
    const msg =
      data?.message ||
      data?.error ||
      `Request failed (${resp.status})`;
    throw new Error(msg);
  }

  return data;
}

async function startStripe() {
  clearError();

  const stripeBtn = document.getElementById("stripeBtn");
  const paystackBtn = document.getElementById("paystackBtn");

  const state = getState();
  const currency = document.getElementById("currencySelect").value.toUpperCase();

  if (!state.amount) {
    showError("Missing amount. Please go back and select a quote again.");
    return;
  }

  // lock both buttons
  const dots = animateDots("Getting quote");
  setLoading(stripeBtn, true, "Getting quote");
  paystackBtn.disabled = true;

  dots.start((t) => {
    const label = stripeBtn.querySelector(".btnlabel");
    label.textContent = t;
  });

  try {
    const data = await postJson(`${BACKEND_BASE}/api/stripe/create-stripe-session`, {
      amount: state.amount,
      currency
    });

    if (!data.url) throw new Error("Stripe did not return a payment URL.");

    window.location.href = data.url;
  } catch (e) {
    showError(e.message || "Stripe payment failed.");
    dots.stop();
    setLoading(stripeBtn, false);
    paystackBtn.disabled = false;
  }
}

async function startPaystack() {
  clearError();

  const stripeBtn = document.getElementById("stripeBtn");
  const paystackBtn = document.getElementById("paystackBtn");

  const state = getState();
  const currency = document.getElementById("currencySelect").value.toUpperCase();

  if (!state.amount) {
    showError("Missing amount. Please go back and select a quote again.");
    return;
  }

  const dots = animateDots("Getting quote");
  setLoading(paystackBtn, true, "Getting quote");
  stripeBtn.disabled = true;

  dots.start((t) => {
    const label = paystackBtn.querySelector(".btnlabel");
    label.textContent = t;
  });

  try {
    const data = await postJson(`${BACKEND_BASE}/api/paystack/initialize`, {
      amount: state.amount,
      currency,
      email: state.email || "customer@saybon.com"
    });

    if (!data.url) throw new Error("Paystack did not return a payment URL.");

    window.location.href = data.url;
  } catch (e) {
    showError(e.message || "Paystack payment failed.");
    dots.stop();
    setLoading(paystackBtn, false);
    stripeBtn.disabled = false;
  }
}

function wire() {
  render();

  document.getElementById("stripeBtn").addEventListener("click", startStripe);
  document.getElementById("paystackBtn").addEventListener("click", startPaystack);

  document.getElementById("currencySelect").addEventListener("change", () => {
    const c = document.getElementById("currencySelect").value.toUpperCase();
    setLocal("saybon_currency", c);

    // update URL param (no reload)
    const u = new URL(window.location.href);
    u.searchParams.set("currency", c);
    window.history.replaceState({}, "", u.toString());

    render();
  });
}

wire();
