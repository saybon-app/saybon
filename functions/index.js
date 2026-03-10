const {onRequest} = require("firebase-functions/v2/https")
const admin = require("firebase-admin")
const Stripe = require("stripe")
const nodemailer = require("nodemailer")

admin.initializeApp()
const db = admin.firestore()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function generateJobCode(){
    const num = Math.floor(1000 + Math.random() * 9000)
    return "SB-" + num
}

const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:"saybon.fr@gmail.com",
pass:process.env.EMAIL_PASS
}
})

exports.stripeWebhook = onRequest(async (req,res)=>{

try{

const event=req.body

if(event.type==="checkout.session.completed"){

const session=event.data.object

const jobCode=generateJobCode()

const job={
jobCode:jobCode,
email:session.customer_email,
amount:session.amount_total/100,
createdAt:new Date(),
status:"Queued",
progress:0
}

await db.collection("jobs").doc(jobCode).set(job)

await transporter.sendMail({
from:"saybon.fr@gmail.com",
to:"saybon.fr@gmail.com",
subject:"New SayBon Translation Job",
text:
"New translation order received.\n\n"+
"Job Code: "+jobCode+"\n"+
"Customer: "+session.customer_email+"\n"+
"Amount: $"+job.amount
})

}

res.send({received:true})

}catch(e){
console.error(e)
res.status(500).send("Webhook error")
}

})
