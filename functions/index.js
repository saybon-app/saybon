const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const axios = require("axios");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


# ============================================
# STRIPE ROUTE
# ============================================

app.post("/stripe", async (req, res) => {

try {

const { amount, currency } = req.body;

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

line_items: [

{

price_data: {

currency: currency,

product_data: {

name: "SayBon Translation Service"

},

unit_amount: amount

},

quantity: 1

}

],

mode: "payment",

success_url: "https://saybonapp.com/success.html",

cancel_url: "https://saybonapp.com/translation/payment.html"

});

res.json({ url: session.url });

}

catch (error){

console.error(error);

res.status(500).send(error);

}

});


# ============================================
# PAYSTACK ROUTE
# ============================================

app.post("/paystack", async (req, res) => {

try{

const response = await axios.post(

"https://api.paystack.co/transaction/initialize",

req.body,

{

headers: {

Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

"Content-Type": "application/json"

}

}

);

res.json(response.data);

}

catch(error){

console.error(error);

res.status(500).send(error);

}

});


# ============================================

exports.api = functions.https.onRequest(app);
