/**
 * SayBon Payments API (Firebase Functions v2)
 * Routes:
 *  POST /api/create-stripe-session
 *  POST /api/paystack/initialize
 */

const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

// Allow env locally (functions emulator). In production, use Firebase Secrets.
try { require("dotenv").config(); } catch (e) {}

const Stripe = require("stripe");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function clampInt(n, min, max) {
  const x = Math.round(safeNumber(n, min));
  return Math.max(min, Math.min(max, x));
}

function normalizeCurrency(cur) {
  const c = String(cur || "USD").trim().toUpperCase();
  // Supported: Stripe supports many; we keep a small safe set for UX.
  if (["USD", "GHS", "NGN", "GBP", "EUR"].includes(c)) return c;
  return "USD";
}

function formatPlan(plan) {
  const p = String(plan || "").toLowerCase();
  return p === "express" ? "express" : "standard";
}

function buildLineItem({ amountCents, currency, plan, words }) {
  const label = plan === "express" ? "Express Translation" : "Standard Translation";
  const desc = `${words} words • ${currency}`;
  return {
    price_data: {
      currency: currency.toLowerCase(),
      product_data: { name: label, description: desc },
      unit_amount: amountCents
    },
    quantity: 1
  };
}

/**
 * STRIPE
 * Body: { amount: number, currency: string, plan: "standard"|"express", words: number }
 * Returns: { url }
 */
app.post("/create-stripe-session", async (req, res) => {
  try {
    const stripeSecret = mustEnv("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeSecret);

    const currency = normalizeCurrency(req.body.currency);
    const plan = formatPlan(req.body.plan);

    const words = clampInt(req.body.words, 1, 5000000);
    const amount = safeNumber(req.body.amount, 0);
    const amountCents = clampInt(amount * 100, 50, 500000000); // min $0.50 equivalent, max large safe

    const origin = req.headers.origin || "https://saybonapp.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [buildLineItem({ amountCents, currency, plan, words })],
      success_url: `${origin}/translation/payment.html?status=success&plan=${plan}&words=${words}&currency=${currency}&amount=${amount}`,
      cancel_url: `${origin}/translation/payment.html?status=cancel&plan=${plan}&words=${words}&currency=${currency}&amount=${amount}`
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "stripe_error", message: err.message || "Stripe failed" });
  }
});

/**
 * PAYSTACK
 * Body: { amount: number, currency: "GHS"|"NGN", plan, words, email }
 * Returns: { authorization_url, reference, access_code }
 */
app.post("/paystack/initialize", async (req, res) => {
  try {
    const paystackSecret = mustEnv("PAYSTACK_SECRET_KEY");

    const currency = normalizeCurrency(req.body.currency);
    // Paystack commonly supports NGN/GHS. If user selects unsupported, reject cleanly.
    if (!["GHS", "NGN"].includes(currency)) {
      return res.status(400).json({
        error: "paystack_currency",
        message: "Paystack supports GHS or NGN here. Switch currency to GHS/NGN or use Stripe for USD."
      });
    }

    const plan = formatPlan(req.body.plan);
    const words = clampInt(req.body.words, 1, 5000000);

    const email = String(req.body.email || "").trim();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "email_required", message: "Valid email is required for Paystack." });
    }

    const amount = safeNumber(req.body.amount, 0);
    // Paystack expects amount in minor unit (kobo/pesewa)
    const amountMinor = clampInt(amount * 100, 50, 500000000);

    const origin = req.headers.origin || "https://saybonapp.com";

    const payload = {
      email,
      amount: amountMinor,
      currency,
      callback_url: `${origin}/translation/payment.html?status=success&provider=paystack&plan=${plan}&words=${words}&currency=${currency}&amount=${amount}`,
      metadata: {
        plan,
        words,
        currency,
        amount
      }
    };

    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!data || data.status !== true) {
      return res.status(400).json({
        error: "paystack_init_failed",
        message: (data && data.message) ? data.message : "Paystack initialize failed",
        raw: data
      });
    }

    return res.json(data.data);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "paystack_error", message: err.message || "Paystack failed" });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

exports.api = onRequest({ region: "us-central1" }, app);
