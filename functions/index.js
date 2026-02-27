/* =========================================
   SayBon Functions — Payments + Verification + Orders
   - Stripe Checkout (with customer_email for receipts)
   - Paystack initialize (kept clean)
   - Verify endpoints write Firestore order records
========================================= */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const https = require("https");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/* -----------------------------------------
   STRIPE: expects amount in dollars from frontend (e.g. 0.10)
   Stripe needs minor units integer (cents). Convert safely.
----------------------------------------- */
function dollarsToMinor(amountDollars) {
  const n = safeNum(amountDollars, 0);
  return Math.round(n * 100);
}

/* ==========================
   STRIPE PAY
========================== */
app.post("/api/pay/stripe", async (req, res) => {
  try {
    const stripeSecret = functions.config().stripe && functions.config().stripe.secret;
    if (!stripeSecret) return res.status(500).json({ error: "Missing Stripe secret config." });

    const stripe = new Stripe(stripeSecret);

    const currency = String(req.body.currency || "USD").toLowerCase();
    const plan = String(req.body.plan || "");
    const words = String(req.body.words || "");
    const email = String(req.body.email || "").trim();

    const amountMinor = dollarsToMinor(req.body.amount);

    if (!amountMinor || amountMinor < 1) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    const successUrl =
      "https://saybonapp.com/translation/success.html" +
      "?provider=stripe" +
      "&session_id={CHECKOUT_SESSION_ID}" +
      (plan ? `&plan=${encodeURIComponent(plan)}` : "") +
      (words ? `&words=${encodeURIComponent(words)}` : "") +
      (email ? `&email=${encodeURIComponent(email)}` : "") +
      `&currency=${encodeURIComponent(currency)}` +
      `&amount=${encodeURIComponent(String(req.body.amount || ""))}`;

    const cancelUrl = "https://saybonapp.com/translation/payment.html";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email || undefined, // ✅ enables Stripe receipt emails when receipts are ON
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "SayBon Translation" },
            unit_amount: amountMinor
          },
          quantity: 1
        }
      ],
      metadata: {
        plan: plan || "",
        words: words || "",
        email: email || ""
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Stripe error." });
  }
});

/* ==========================
   PAYSTACK PAY (kept clean)
========================== */
app.post("/api/pay/paystack", async (req, res) => {
  try {
    const paystackSecret = functions.config().paystack && functions.config().paystack.secret;
    if (!paystackSecret) return res.status(500).json({ error: "Missing Paystack secret config." });

    const email = String(req.body.email || "").trim();
    const currency = String(req.body.currency || "GHS");
    const plan = String(req.body.plan || "");
    const words = String(req.body.words || "");

    const amountMinor = Math.round(safeNum(req.body.amount, 0)); // paystack expects minor units for the currency

    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!amountMinor || amountMinor < 1) return res.status(400).json({ error: "Invalid amount." });

    const callbackUrl =
      "https://saybonapp.com/translation/success.html" +
      "?provider=paystack" +
      (plan ? `&plan=${encodeURIComponent(plan)}` : "") +
      (words ? `&words=${encodeURIComponent(words)}` : "") +
      (email ? `&email=${encodeURIComponent(email)}` : "") +
      `&currency=${encodeURIComponent(currency)}` +
      `&amount=${encodeURIComponent(String(req.body.amount || ""))}`;

    const data = JSON.stringify({
      amount: amountMinor,
      email,
      currency,
      callback_url: callbackUrl
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json"
      }
    };

    const request = https.request(options, (response) => {
      let body = "";
      response.on("data", (chunk) => (body += chunk));
      response.on("end", () => {
        let json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          return res.status(500).json({ error: "Paystack returned invalid JSON." });
        }

        if (!json.status) {
          return res.status(400).json({ error: json.message || "Paystack init failed." });
        }

        return res.json({ url: json.data.authorization_url });
      });
    });

    request.on("error", (e) => res.status(500).json({ error: e.message }));
    request.write(data);
    request.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || "Paystack error." });
  }
});

/* ==========================
   VERIFY STRIPE + CREATE ORDER
========================== */
app.post("/api/verify/stripe", async (req, res) => {
  try {
    const stripeSecret = functions.config().stripe && functions.config().stripe.secret;
    if (!stripeSecret) return res.status(500).json({ error: "Missing Stripe secret config." });

    const stripe = new Stripe(stripeSecret);

    const session_id = String(req.body.session_id || "");
    if (!session_id) return res.status(400).json({ error: "Missing session_id." });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "payment_intent.latest_charge"]
    });

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not verified as paid yet." });
    }

    const plan = String(req.body.plan || session.metadata?.plan || "");
    const words = Number(req.body.words || session.metadata?.words || 0);
    const email = String(req.body.email || session.customer_details?.email || session.metadata?.email || "");
    const currency = String(req.body.currency || session.currency || "usd").toUpperCase();
    const amount = Number(req.body.amount || (session.amount_total ? session.amount_total / 100 : 0));

    const receiptUrl =
      session.payment_intent &&
      session.payment_intent.latest_charge &&
      session.payment_intent.latest_charge.receipt_url
        ? session.payment_intent.latest_charge.receipt_url
        : "";

    const order = {
      provider: "stripe",
      reference: session.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      plan,
      words: Number.isFinite(words) ? words : 0,
      email,
      currency,
      amount,
      receiptUrl,
      status: "paid"
    };

    await db.collection("translationOrders").add(order);

    return res.json({ ok: true, reference: session.id });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Stripe verify error." });
  }
});

/* ==========================
   VERIFY PAYSTACK + CREATE ORDER
========================== */
app.post("/api/verify/paystack", async (req, res) => {
  try {
    const paystackSecret = functions.config().paystack && functions.config().paystack.secret;
    if (!paystackSecret) return res.status(500).json({ error: "Missing Paystack secret config." });

    const reference = String(req.body.reference || "");
    if (!reference) return res.status(400).json({ error: "Missing reference." });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/verify/" + encodeURIComponent(reference),
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`
      }
    };

    const verifyReq = https.request(options, async (response) => {
      let body = "";
      response.on("data", (chunk) => (body += chunk));
      response.on("end", async () => {
        let json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          return res.status(500).json({ error: "Paystack verify returned invalid JSON." });
        }

        if (!json.status || !json.data || json.data.status !== "success") {
          return res.status(400).json({ error: json.message || "Payment not verified as successful yet." });
        }

        const plan = String(req.body.plan || "");
        const words = Number(req.body.words || 0);
        const email = String(req.body.email || json.data.customer?.email || "");
        const currency = String(req.body.currency || json.data.currency || "GHS");
        const amount = Number(req.body.amount || (json.data.amount ? json.data.amount / 100 : 0));

        const order = {
          provider: "paystack",
          reference,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          plan,
          words: Number.isFinite(words) ? words : 0,
          email,
          currency,
          amount,
          status: "paid"
        };

        await db.collection("translationOrders").add(order);

        return res.json({ ok: true, reference });
      });
    });

    verifyReq.on("error", (e) => res.status(500).json({ error: e.message }));
    verifyReq.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || "Paystack verify error." });
  }
});

exports.api = functions.https.onRequest(app);
