/**
 * SayBon Payments API (Firebase Functions v2)
 * Route:
 * POST /api/create-stripe-session
 */

const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

try { require("dotenv").config(); } catch (e) {}

const Stripe = require("stripe");

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
  if (["USD","GBP","EUR"].includes(c)) return c;
  return "USD";
}

function formatPlan(plan) {
  const p = String(plan || "").toLowerCase();
  return p === "express" ? "express" : "standard";
}

/* ===============================
   STRIPE CHECKOUT
================================ */

app.post("/create-stripe-session", async (req,res) => {

  try {

    const stripe = new Stripe(mustEnv("STRIPE_SECRET_KEY"));

    const currency = normalizeCurrency(req.body.currency);
    const plan = formatPlan(req.body.plan);

    const words = clampInt(req.body.words,1,5000000);
    const amount = safeNumber(req.body.amount,0);

    const amountCents = clampInt(amount * 100,50,500000000);

    const origin = req.headers.origin || "https://saybonapp.com";

    const session = await stripe.checkout.sessions.create({

      mode:"payment",

      line_items:[{
        price_data:{
          currency:currency.toLowerCase(),
          product_data:{
            name: plan === "express" ? "Express Translation" : "Standard Translation",
            description:`${words} words`
          },
          unit_amount:amountCents
        },
        quantity:1
      }],

      success_url:`${origin}/translation/success.html?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:`${origin}/translation/request.html`

    });

    res.json({ url: session.url });

  }

  catch(err){

    console.error("Stripe error:",err);

    res.status(400).json({
      error:"stripe_error",
      message:err.message
    });

  }

});

/* ===============================
   HEALTH CHECK
================================ */

app.get("/health",(req,res)=>{
  res.json({ ok:true });
});

/* ===============================
   EXPORT API
================================ */

exports.api = onRequest({

  region:"us-central1",

  secrets:[
    "STRIPE_SECRET_KEY"
  ]

},app);
