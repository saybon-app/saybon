import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import fetch from "node-fetch";
import multer from "multer";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;



app.get("/", (req,res)=>{

res.send("SayBon Backend Running");

});



app.post("/create-stripe-session", async (req,res)=>{

try{

const { amount, currency } = req.body;

const session = await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[{

price_data:{

currency: currency || "usd",

product_data:{
name:"SayBon Translation"
},

unit_amount: Math.round(amount*100)

},

quantity:1

}],

success_url:

"https://saybonapp.com/success.html",

cancel_url:

"https://saybonapp.com/translation/payment.html"

});

res.json({

url:session.url

});

}catch(e){

res.status(500).json({

error:e.message

});

}

});



app.post("/create-paystack-session", async (req,res)=>{

try{

const { amount, email, currency } = req.body;

const response = await fetch(

"https://api.paystack.co/transaction/initialize",

{

method:"POST",

headers:{

Authorization:

`Bearer ${PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"

},

body: JSON.stringify({

email: email || "customer@saybonapp.com",

amount: Math.round(amount*100),

currency: currency || "GHS",

callback_url:

"https://saybonapp.com/success.html"

})

}

);

const data = await response.json();

res.json({

url:data.data.authorization_url

});

}catch(e){

res.status(500).json({

error:e.message

});

}

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

console.log("SayBon backend running");

});
