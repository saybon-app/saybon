import express from "express"
import Stripe from "stripe"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

############################################
# CREATE STRIPE SESSION
############################################

app.post("/api/stripe", async (req,res)=>{

try{

const { amount, words, plan } = req.body

const session = await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[
{
price_data:{
currency:"usd",
product_data:{
name:"SayBon Translation"
},
unit_amount: amount * 100
},
quantity:1
}
],

metadata:{
words,
plan
},

success_url:
"https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",

cancel_url:
"https://saybonapp.com/translation/payment.html"

})

res.json({url:session.url})

}catch(err){

console.log(err)

res.status(500).json({
error:"stripe session error"
})

}

})

############################################
# GET SESSION DATA
############################################

app.get("/api/stripeSession/:id", async (req,res)=>{

try{

const session = await stripe.checkout.sessions.retrieve(req.params.id)

res.json({

amount: session.amount_total,
metadata: session.metadata

})

}catch(err){

res.status(500).json({
error:"session fetch error"
})

}

})

############################################

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{

console.log("SayBon server running")

})
