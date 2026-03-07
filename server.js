import express from "express";
import Stripe from "stripe";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===========================
   GENERATE JOB CODE
=========================== */

function generateJobCode(){
 return "SB-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

/* ===========================
   CREATE CHECKOUT
=========================== */

app.post("/api/createCheckout", async(req,res)=>{

 try{

 const {words,plan} = req.body;

 const rate = plan==="express"?0.05:0.025;

 const amount = Math.round(words*rate*100);

 const jobCode = generateJobCode();

 const session = await stripe.checkout.sessions.create({

 payment_method_types:["card"],

 mode:"payment",

 line_items:[{

 price_data:{
 currency:"usd",
 product_data:{
 name:"SayBon Translation",
 description:words + " words"
 },
 unit_amount:amount
 },

 quantity:1

 }],

 metadata:{
 jobCode:jobCode,
 words:String(words),
 plan:String(plan),
 amount:String(amount/100)
 },

 success_url:
 "https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",

 cancel_url:
 "https://saybonapp.com/translation/payment.html"

 });

 res.json({url:session.url});

 }catch(err){

 res.status(500).json({error:err.message});

 }

});

/* ===========================
   RETRIEVE STRIPE SESSION
=========================== */

app.get("/api/stripeSession/:id", async(req,res)=>{

 try{

 const session = await stripe.checkout.sessions.retrieve(req.params.id);

 res.json({
 amount:session.amount_total,
 metadata:session.metadata,
 status:session.payment_status
 });

 }catch(err){

 res.status(400).json({error:"Invalid session"});

 }

});

app.listen(process.env.PORT || 3000,()=>{

 console.log("SayBon server running");

});
