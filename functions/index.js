const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health",(req,res)=>{
res.json({ok:true});
});

app.post("/create-stripe-session", async (req,res)=>{
try{

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const amount = Number(req.body.amount || 0);
const currency = (req.body.currency || "USD").toLowerCase();
const words = Number(req.body.words || 0);
const plan = req.body.plan === "express" ? "express" : "standard";

const session = await stripe.checkout.sessions.create({
mode:"payment",
line_items:[
{
price_data:{
currency:currency,
product_data:{
name: plan==="express" ? "Express Translation" : "Standard Translation",
description: words + " words"
},
unit_amount: Math.round(amount*100)
},
quantity:1
}
],
success_url:"https://saybonapp.com/translation/payment.html?status=success",
cancel_url:"https://saybonapp.com/translation/payment.html?status=cancel"
});

res.json({url:session.url});

}catch(e){
console.error(e);
res.status(500).json({error:e.message});
}
});

exports.api = onRequest({ region:"us-central1" }, app);
