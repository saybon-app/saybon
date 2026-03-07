import express from "express";
import Stripe from "stripe";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET);

/* =====================================
   STRIPE PAYMENT
===================================== */

app.post("/api/stripe", async (req, res) => {

try {

const { amount, words, plan } = req.body;

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

mode: "payment",

line_items: [

{

price_data: {

currency: "usd",

product_data: {

name: `SayBon Translation (${plan})`,

description: `${words} words`

},

unit_amount: Math.round(amount * 100)

},

quantity: 1

}

],

metadata: {
words,
plan
},

success_url: `${process.env.DOMAIN}/translation/success.html?session_id={CHECKOUT_SESSION_ID}`,

cancel_url: `${process.env.DOMAIN}/translation/payment.html`

});

res.json({ url: session.url });

}

catch (err) {

res.status(500).json({ error: err.message });

}

});


/* =====================================
   PAYSTACK PAYMENT
===================================== */

app.post("/api/paystack", async (req, res) => {

try {

const { amount, email, words, plan } = req.body;

const response = await axios.post(

"https://api.paystack.co/transaction/initialize",

{

amount: Math.round(amount * 100),

email,

metadata: {
plan,
words
}

},

{

headers: {

Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,

"Content-Type": "application/json"

}

}

);

res.json({
url: response.data.data.authorization_url
});

}

catch (err) {

res.status(500).json({ error: err.message });

}

});


/* =====================================
   GET STRIPE SESSION
===================================== */

app.get("/api/stripeSession/:id", async (req, res) => {

try {

const session = await stripe.checkout.sessions.retrieve(req.params.id);

res.json({
amount: session.amount_total,
currency: session.currency,
metadata: session.metadata
});

}

catch (err) {

res.status(500).json({ error: err.message });

}

});


/* =====================================
   SERVER START
===================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

console.log(`SayBon payment server running on port ${PORT}`);

});
