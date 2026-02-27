const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const https = require("https");

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const STRIPE_SECRET = defineSecret("STRIPE_SECRET");
const PAYSTACK_SECRET = defineSecret("PAYSTACK_SECRET");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

function normalizeMinorAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

/*
STRIPE ROUTE
*/
app.post("/api/pay/stripe", async (req, res) => {
  try {
    const stripe = new Stripe(STRIPE_SECRET.value());

    const currency = (req.body.currency || "USD").toLowerCase();
    const amountMinor = normalizeMinorAmount(req.body.amount);

    // Stripe minimum 50 cents
    if (!amountMinor || amountMinor < 50) {
      return res.status(400).json({ error: "Stripe minimum is $0.50" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "SayBon Translation" },
            unit_amount: amountMinor,
          },
          quantity: 1,
        },
      ],
      success_url: "https://saybonapp.com/translation/success.html",
      cancel_url: "https://saybonapp.com/translation/payment.html",
    });

    res.json({ url: session.url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
PAYSTACK ROUTE
*/
app.post("/api/pay/paystack", async (req, res) => {
  try {

    const email = (req.body.email || "").trim();
    const amountMinor = normalizeMinorAmount(req.body.amount);

    if (!email)
      return res.status(400).json({ error: "Email required" });

    // Paystack minimum = 1
    if (!amountMinor || amountMinor < 1)
      return res.status(400).json({ error: "Invalid amount" });

    const data = JSON.stringify({
      amount: amountMinor,
      email: email,
      currency: req.body.currency || "GHS",
      callback_url: "https://saybonapp.com/translation/success.html",
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET.value()}`,
        "Content-Type": "application/json",
      },
    };

    const request = https.request(options, (response) => {

      let body = "";

      response.on("data", chunk => body += chunk);

      response.on("end", () => {

        const json = JSON.parse(body);

        if (!json.status)
          return res.status(400).json({ error: json.message });

        res.json({ url: json.data.authorization_url });

      });

    });

    request.on("error", e =>
      res.status(500).json({ error: e.message })
    );

    request.write(data);
    request.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = onRequest(
{
region: "us-central1",
secrets: [STRIPE_SECRET, PAYSTACK_SECRET],
},
app
);
