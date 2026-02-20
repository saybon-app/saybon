import express from "express";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



/* =================================
HEALTH CHECK
================================= */

app.get("/", (req,res)=>{

res.send("SayBon Backend Running");

});



/* =================================
TRANSLATION QUOTE
================================= */

app.post("/request", upload.single("file"), async (req, res) => {

try{

const text = req.file.buffer.toString("utf8");

const words = text.split(/\s+/).length;

res.json({
success:true,
words
});

}catch{

res.status(500).json({
success:false
});

}

});



/* =================================
CREATE STRIPE SESSION
================================= */

app.post("/create-stripe-session", async (req,res)=>{

try{

const { amount, type } = req.body;

const session = await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[{

price_data:{

currency:"usd",

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

}catch(e){

res.status(500).json({
error:e.message
});

}

});



/* =================================
CREATE PAYSTACK SESSION
================================= */

app.post("/create-paystack-session", async (req,res)=>{

try{

const { amount, email } = req.body;

const response = await fetch(

"https://api.paystack.co/transaction/initialize",

{

method:"POST",

headers:{

Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

email:email || "customer@saybonapp.com",

amount:Math.round(amount*100),

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



/* =================================
START SERVER
================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

console.log("Server running on port", PORT);

});
