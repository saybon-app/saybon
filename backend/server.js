import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ==========================================
SERVER HEALTH CHECK
========================================== */

app.get("/", (req,res)=>{
res.send("SayBon server running");
});

/* ==========================================
CREATE STRIPE CHECKOUT
========================================== */

app.post("/api/createCheckout", async (req,res)=>{

try{

const { words, plan } = req.body;

if(!words || !plan){
return res.status(400).json({
error:"Missing words or plan"
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

line_items:[{

price_data:{

currency:"usd",

product_data:{
name:"SayBon Translation Service"
},

unit_amount: Math.round(price * 100)

},

quantity:1

}],

mode:"payment",

success_url:
"https://saybonapp.com/translation/success.html",

cancel_url:
"https://saybonapp.com/translation/request.html"

});

res.json({
url: session.url
});

}catch(err){

console.error(err);

res.status(500).json({
error:"Stripe checkout failed"
});

}

});

/* ==========================================
START SERVER
========================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("SayBon server running on port",PORT);
});
