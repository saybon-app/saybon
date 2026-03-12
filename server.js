import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";

/* ==========================================
INITIALIZE FIREBASE ADMIN
========================================== */

admin.initializeApp();
const db = admin.firestore();

/* ==========================================
EXPRESS APP
========================================== */

const app = express();

/* ==========================================
CORS
========================================== */

app.use(cors({
  origin:[
    "https://saybonapp.com",
    "http://localhost:5500"
  ],
  methods:["GET","POST"],
  allowedHeaders:["Content-Type"]
}));

/* ==========================================
STRIPE INITIALIZATION
========================================== */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
  apiVersion:"2023-10-16"
});

/* ==========================================
SERVER CHECK
========================================== */

app.get("/",(req,res)=>{
  res.json({
    status:"SayBon payment server running"
  });
});

/* ==========================================
STRIPE WEBHOOK
========================================== */

app.post("/webhook",
express.raw({type:"application/json"}),
async(req,res)=>{

let event;

try{

event = stripe.webhooks.constructEvent(
req.body,
req.headers["stripe-signature"],
process.env.STRIPE_WEBHOOK_SECRET
);

}catch(err){

console.error("Webhook signature failed:",err.message);

return res.status(400).send(`Webhook Error: ${err.message}`);

}

if(event.type === "checkout.session.completed"){

const session = event.data.object;

const jobId = session.client_reference_id;

console.log("Payment completed for job:",jobId);

if(jobId){

await db.collection("translationJobs")
.doc(jobId)
.update({
status:"paid",
paidAt:new Date()
});

}

}

res.json({received:true});

});

/* ==========================================
CREATE CHECKOUT SESSION
========================================== */

app.use(express.json());

app.post("/api/createCheckout", async(req,res)=>{

try{

const {words,plan,jobId} = req.body;

if(!words || !plan || !jobId){

return res.status(400).json({
error:"Missing parameters"
});

}

let price = plan === "express"
? words * 0.05
: words * 0.025;

const session = await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[{

price_data:{

currency:"usd",

product_data:{
name:"SayBon Translation Service"
},

unit_amount:Math.round(price*100)

},

quantity:1

}],

client_reference_id:jobId,

success_url:
"https://saybonapp.com/translation/success.html",

cancel_url:
"https://saybonapp.com/translation/request.html"

});

res.json({
url:session.url
});

}catch(err){

console.error("Checkout error:",err);

res.status(500).json({
error:"Stripe checkout failed"
});

}

});

/* ==========================================
404
========================================== */

app.use((req,res)=>{

res.status(404).json({
error:"Route not found"
});

});

/* ==========================================
EXPORT FUNCTION
========================================== */

export const saybonApi = onRequest(app);








