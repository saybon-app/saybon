import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import Stripe from "stripe";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();


/* =========================================
CONFIG
========================================= */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;


/* =========================================
TRANSLATION QUOTE ENDPOINT
========================================= */

app.post("/request", upload.single("file"), async (req, res) => {

try{

if(!req.file){

return res.status(400).json({
success:false,
message:"No file uploaded"
});

}

const text = req.file.buffer.toString("utf8");

const words = text.trim().split(/\s+/).length;

res.json({

success:true,

words

});

}
catch(error){

res.status(500).json({

success:false,

message:"Server error"

});

}

});


/* =========================================
STRIPE PAYMENT SESSION
========================================= */

app.post("/create-stripe-session", async (req,res)=>{

try{

const { amount, type, currency } = req.body;

if(!amount){

return res.status(400).json({
error:"Amount required"
});

}

const session = await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[{

price_data:{

currency: currency || "usd",

product_data:{

name:`SayBon Translation (${type})`

},

unit_amount:Math.round(amount*100)

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

}
catch(error){

res.status(500).json({

error:error.message

});

}

});


/* =========================================
PAYSTACK PAYMENT INITIALIZE
========================================= */

app.post("/create-paystack-session", async (req,res)=>{

try{

const { amount, email, currency } = req.body;

if(!amount){

return res.status(400).json({
error:"Amount required"
});

}

const response = await fetch(

"https://api.paystack.co/transaction/initialize",

{

method:"POST",

headers:{

Authorization:`Bearer ${PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

email: email || "customer@saybonapp.com",

amount: Math.round(amount*100),

currency: currency || "USD",

callback_url:

"https://saybonapp.com/success.html"

})

}

);

const data = await response.json();

res.json({

url:data.data.authorization_url

});

}
catch(error){

res.status(500).json({

error:error.message

});

}

});


/* =========================================
HEALTH CHECK
========================================= */

app.get("/", (req,res)=>{

res.send("SayBon Backend Running");

});


/* =========================================
START SERVER
========================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

console.log("SayBon backend running on port " + PORT);

}); I’ll
