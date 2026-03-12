/* force redeploy 11 Mar */

import express from "express";
import cors from "cors";
import Stripe from "stripe";
import admin from "firebase-admin";
import OpenAI from "openai";

const app = express();

/* ==========================================
FIREBASE ADMIN
========================================== */

admin.initializeApp();
const db = admin.firestore();

/* ==========================================
OPENAI INITIALIZATION
========================================== */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
MIDDLEWARE (AFTER WEBHOOK)
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
AI TRANSLATION TEST GRADING
========================================== */

app.post("/api/gradeTranslationTest", async (req,res)=>{

  try{

    const { englishAnswer, frenchAnswer } = req.body;

    const prompt = `
You are a professional translation examiner.

Evaluate the quality of these translations.

Original French:
"La croissance économique dépend fortement de la stabilité politique et de la capacité des institutions à maintenir un environnement favorable aux investissements."

Translator English:
${englishAnswer}

Original English:
"Economic growth depends strongly on political stability and the ability of institutions to maintain a favorable environment for investment."

Translator French:
${frenchAnswer}

Score accuracy, grammar, meaning and fluency.

Return JSON only:

{
"score": number,
"feedback": "short explanation"
}
`;

    const completion = await openai.chat.completions.create({
      model:"gpt-4o-mini",
      messages:[{role:"user",content:prompt}],
      temperature:0.2
    });

    const responseText = completion.choices[0].message.content;

    const result = JSON.parse(responseText);

    res.json(result);

  }catch(err){

    console.error("AI grading failed:",err);

    res.status(500).json({
      score:0,
      feedback:"AI grading failed"
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
START SERVER (RENDER)
========================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("SayBon payment server running on port", PORT);
});
