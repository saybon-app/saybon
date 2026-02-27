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

function toInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function normalizeMinorAmount(amount) {
  const n = toInt(amount, 0);
  return Math.round(n);
}


/*
========================================
STRIPE ROUTE (RECEIPTS FIXED)
========================================
*/

app.post("/api/pay/stripe", async (req, res) => {

  try {

    const stripe = new Stripe(STRIPE_SECRET.value());

    const currency = (req.body.currency || "USD").toLowerCase();

    const amountMinor = normalizeMinorAmount(req.body.amount);

    const email = (req.body.email || "").trim();


    if (!amountMinor) {

      return res.status(400).json({ error: "Invalid amount." });

    }


    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      mode: "payment",

      customer_email: email,   // ✅ THIS ENABLES RECEIPT


      line_items: [

        {

          price_data: {

            currency,

            product_data: {

              name: "SayBon Translation",

            },

            unit_amount: amountMinor,

          },

          quantity: 1,

        },

      ],


      success_url:

        "https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",


      cancel_url:

        "https://saybonapp.com/translation/payment.html",

    });


    res.json({ url: session.url });

  }

  catch (err) {

    res.status(500).json({ error: err.message });

  }

});



/*
========================================
PAYSTACK ROUTE (UNTOUCHED)
========================================
*/

app.post("/api/pay/paystack", async (req, res) => {

  try {

    const email = (req.body.email || "").trim();

    const amountMinor = normalizeMinorAmount(req.body.amount);


    if (!email)

      return res.status(400).json({ error: "Email is required." });


    if (!amountMinor)

      return res.status(400).json({ error: "Invalid amount." });


    const data = JSON.stringify({

      amount: amountMinor,

      email: email,

      currency: req.body.currency || "GHS",

      callback_url:

        "https://saybonapp.com/translation/success.html",

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


      response.on("data", (chunk) =>

        (body += chunk)

      );


      response.on("end", () => {

        let json;


        try {

          json = JSON.parse(body);

        }

        catch {

          return res.status(500).json({

            error:

              "Paystack returned invalid JSON.",

          });

        }


        if (!json.status)

          return res.status(400).json({

            error:

              json.message ||

              "Paystack init failed.",

          });


        res.json({

          url:

            json.data.authorization_url,

        });

      });

    });


    request.on("error", (e) => {

      res.status(500).json({

        error: e.message,

      });

    });


    request.write(data);

    request.end();

  }

  catch (err) {

    res.status(500).json({

      error: err.message,

    });

  }

});



exports.api = onRequest(

  {

    region: "us-central1",

    secrets: [

      STRIPE_SECRET,

      PAYSTACK_SECRET,

    ],

  },

  app

);
