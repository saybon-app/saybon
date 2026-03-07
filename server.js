import express from "express";
import Stripe from "stripe";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const jobs = {};

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

 jobs[jobCode] = {

 jobCode,
 words,
 plan,
 amount:amount/100,
 status:"awaiting_payment",
 stage:"Waiting for payment",
 progress:0,
 createdAt:new Date()

 };

 const session = await stripe.checkout.sessions.create({

 payment_method_types:["card"],

 mode:"payment",

 line_items:[{

 price_data:{
 currency:"usd",
 product_data:{
 name:"SayBon Translation",
 description:words+" words"
 },
 unit_amount:amount
 },

 quantity:1

 }],

 metadata:{
 jobCode:jobCode
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
   CONFIRM PAYMENT
=========================== */

app.get("/api/confirmPayment/:session", async(req,res)=>{

 try{

 const session = await stripe.checkout.sessions.retrieve(req.params.session);

 const jobCode = session.metadata.jobCode;

 if(!jobs[jobCode]){

 return res.status(404).json({error:"Job not found"});

 }

 if(session.payment_status==="paid"){

 jobs[jobCode].status="Payment received";
 jobs[jobCode].stage="Queued for Phase-1";
 jobs[jobCode].progress=5;

 }

 res.json(jobs[jobCode]);

 }catch(err){

 res.status(500).json({error:"Payment verification failed"});

 }

});

/* ===========================
   GET JOB
=========================== */

app.get("/api/job/:code",(req,res)=>{

 const job = jobs[req.params.code];

 if(!job){

 return res.status(404).json({error:"Job not found"});

 }

 res.json(job);

});

app.listen(process.env.PORT || 3000,()=>{

 console.log("SayBon server running");

});
