// force redeploy 10 Mar

import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { onRequest } from "firebase-functions/v2/https";

const app = express();

/* ==========================================
MIDDLEWARE
========================================== */

app.use(cors({
  origin: [
    "https://saybonapp.com",
    "http://localhost:5500"
  ],
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ==========================================
STRIPE INITIALIZATION
========================================== */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
  apiVersion:"2023-10-16"
});

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

    const { words, plan } = req.body;

    /* VALIDATION */

    if(!words || !plan){
      return res.status(400).json({
        error:"Missing words or plan"
      });
    }

    /* PRICE CALCULATION */

    let price = 0;

    if(plan==="express"){
      price = words * 0.05;
    }else{
      price = words * 0.025;
    }

    /* CREATE CHECKOUT SESSION */

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

      metadata:{
        words:String(words),
        plan:String(plan)
      },

      success_url:
      "https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",

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
