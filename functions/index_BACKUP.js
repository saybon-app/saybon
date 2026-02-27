const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const axios = require("axios");

require("dotenv").config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());



app.post("/createStripeSession", async (req, res) => {

try {

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

mode: "payment",

line_items: [
{
price_data: {
currency: req.body.currency,
product_data: { name: "SayBon Translation" },
unit_amount: req.body.amount
},
quantity: 1
}
],

success_url: "https://saybonapp.com/translation/payment-success.html",

cancel_url: "https://saybonapp.com/translation/payment.html"

});

res.json({ url: session.url });

} catch (err) {

res.status(500).json({ error: err.message });

}

});




app.post("/createPaystackSession", async (req, res) => {

try {

const response = await axios.post(

"https://api.paystack.co/transaction/initialize",

{
amount: req.body.amount,
email: req.body.email,
currency: "GHS"
},

{
headers: {
Authorization: Bearer 
}
}

);

res.json(response.data);

} catch (err) {

res.status(500).json({ error: err.message });

}

});



exports.api = functions.https.onRequest(app);

