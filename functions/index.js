const {onRequest} = require("firebase-functions/v2/https")
const admin = require("firebase-admin")
const Stripe = require("stripe")
const nodemailer = require("nodemailer")

admin.initializeApp()
const db = admin.firestore()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function generateJobCode(){
  return "SB-" + Math.floor(1000 + Math.random() * 9000)
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "saybon.fr@gmail.com",
    pass: process.env.EMAIL_PASS
  }
})

exports.stripeWebhook = onRequest(async (req,res)=>{

try{

const event = req.body

if(event.type==="checkout.session.completed"){

const session = event.data.object

const jobCode = generateJobCode()

const job = {
jobCode: jobCode,
email: session.customer_email,
amount: session.amount_total/100,
status: "Queued",
createdAt: new Date()
}

await db.collection("jobs").doc(jobCode).set(job)

await transporter.sendMail({
from:"saybon.fr@gmail.com",
to:"saybon.fr@gmail.com",
subject:"New SayBon Translation Order",
text:
"Job: "+jobCode+
"\nCustomer: "+session.customer_email+
"\nAmount: $"+job.amount
})

}

res.send({received:true})

}catch(e){
console.error(e)
res.status(500).send("Webhook error")
}

})
