import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const router=express.Router();

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/",async(req,res)=>{

try{

const {amount}=req.body;

const session=await stripe.checkout.sessions.create({

mode:"payment",

payment_method_types:["card"],

line_items:[{

price_data:{

currency:"usd",

product_data:{
name:"SayBon Translation"
},

unit_amount:amount

},

quantity:1

}],

success_url:

"https://saybonapp.com/translation/success.html",

cancel_url:

"https://saybonapp.com/translation/payment.html"

});

res.json({

url:session.url

});

}

catch(e){

res.status(500).json({

error:e.message

});

}

});

export default router;
