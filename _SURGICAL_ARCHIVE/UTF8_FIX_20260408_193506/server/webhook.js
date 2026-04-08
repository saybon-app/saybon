import express from "express"
import Stripe from "stripe"
import admin from "firebase-admin"

const stripe = new Stripe(process.env.STRIPE_SECRET)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

admin.initializeApp({
credential: admin.credential.applicationDefault()
})

const db = admin.firestore()

const app = express()

app.post("/stripe-webhook", express.raw({type:"application/json"}), async (req,res)=>{

const sig = req.headers["stripe-signature"]

let event

try{

event = stripe.webhooks.constructEvent(
req.body,
sig,
endpointSecret
)

}catch(err){

console.log("Webhook signature error",err.message)
return res.status(400).send()

}

if(event.type === "checkout.session.completed"){

const session = event.data.object

const jobId = session.client_reference_id

console.log("Payment received for job:",jobId)

await db.collection("translationJobs")
.doc(jobId)
.update({

status:"paid",
paidAt:new Date()

})

}

res.json({received:true})

})

app.listen(3000,()=>{

console.log("Stripe webhook running")

})