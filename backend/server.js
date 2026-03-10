// force redeploy 10 Mar

import express from "express";
import cors from "cors";
import Stripe from "stripe";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

const app = express();

/* ==========================================
FIREBASE ADMIN
========================================== */

admin.initializeApp();
const db = admin.firestore();

/* ==========================================
STRIPE INITIALIZATION
========================================== */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
  apiVersion:"2023-10-16"
});

/* ==========================================
WEBHOOK (RAW BODY REQUIRED)
========================================== */

app.post("/webhook", express.raw({type:"application/json"}), async (req,res)=>{

  let event;

  try{

    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );

  }catch(err){

    console.error("Webhook signature verification failed:",err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);

  }

  /* ==========================================
  PAYMENT COMPLETED
  ========================================== */

  if(event.type === "checkout.session.completed"){

    const session = event.data.object;

    const jobId = session.client_reference_id;

    console.log("Stripe payment received for job:",jobId);

    if(jobId){

      try{

        await db.collection("translationJobs")
        .doc(jobId)
        .update({
          status:"paid",
          paidAt:new Date()
        });

        console.log("Firestore updated for:",jobId);

      }catch(err){

        console.error("Firestore update failed:",err);

      }

    }

  }

  res.json({received:true});

});

/* ==========================================
MIDDLEWARE
========================================== */

app.use(cors({
  origin:[
    "https://saybonapp.com",
    "http://localhost:5500"
  ],
  methods:["GET","POST"],
  allowedHeaders:["Content-Type"]
}));

app.use(express.json());

/* ==========================================
SERVER HEALTH CHECK
========================================== */

app.get("/", (req,res)=>{
  res.json({
    status:"SayBon server running"
  });
});

/* ==========================================
CREATE STRIPE CHECKOUT
========================================== */

app.post("/api/createCheckout", async (req,res)=>{

  try{

    const { words, plan, jobId } = req.body;

    if(!words || !plan || !jobId){
      return res.status(400).json({
        error:"Missing words, plan or jobId"
      });
    }

    let price = 0;

    if(plan==="express"){
      price = words * 0.05;
    }else{
      price = words * 0.025;
    }

    const session = await stripe.checkout.sessions.create({

      payment_method_types:["card"],

      mode:"payment",

      line_items:[{
        price_data:{
          currency:"usd",
          product_data:{
            name:"SayBon Translation Service"
          },
          unit_amount:Math.round(price * 100)
        },
        quantity:1
      }],

      client_reference_id: jobId,

      metadata:{
        words:String(words),
        plan:String(plan)
      },

      success_url:
      "https://saybonapp.com/translation/success.html?job="+jobId,

      cancel_url:
      "https://saybonapp.com/translation/request.html"

    });

    res.json({
      url:session.url
    });

  }catch(err){

    console.error("Stripe Checkout Error:",err);

    res.status(500).json({
      error:"Stripe checkout failed"
    });

  }

});

/* ==========================================
404 HANDLER
========================================== */

app.use((req,res)=>{
  res.status(404).json({
    error:"Route not found"
  });
});

/* ==========================================
EXPORT FIREBASE FUNCTION
========================================== */

export const saybonApi = onRequest(app);