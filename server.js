
import express from "express"
import cors from "cors"
import Stripe from "stripe"
import admin from "firebase-admin"
import OpenAI from "openai"

const app = express()

/* ==========================================
FIREBASE
========================================== */

admin.initializeApp()
const db = admin.firestore()

/* ==========================================
OPENAI
========================================== */

const openai = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

/* ==========================================
STRIPE
========================================== */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
apiVersion:"2023-10-16"
})

/* ==========================================
ROTATING TEST BANK
========================================== */

const frenchToEnglishTests=[

`L’application doit pouvoir traiter les requêtes en temps réel tout en garantissant la sécurité des données et la conformité aux normes de protection de la vie privée.`,

`L’optimisation des processus internes a permis de réduire les coûts opérationnels tout en améliorant la qualité du service offert aux clients.`,

`Toute utilisation non autorisée de ce document est strictement interdite et peut entraîner des poursuites conformément aux lois applicables.`

]

const englishToFrenchTests=[

`The system automatically encrypts all sensitive information before it is transmitted to the server.`,

`Failure to comply with these guidelines may result in the suspension of the user's account.`,

`The success of the project depends largely on effective communication between the development team and the stakeholders.`

]

/* ==========================================
GET RANDOM TEST
========================================== */

app.get("/api/getTranslationTest",(req,res)=>{

const frenchTest=frenchToEnglishTests[
Math.floor(Math.random()*frenchToEnglishTests.length)
]

const englishTest=englishToFrenchTests[
Math.floor(Math.random()*englishToFrenchTests.length)
]

res.json({
frenchTest,
englishTest
})

})

/* ==========================================
WEBHOOK
========================================== */

app.post("/webhook",express.raw({type:"application/json"}),async(req,res)=>{

let event

try{

event=stripe.webhooks.constructEvent(
req.body,
req.headers["stripe-signature"],
process.env.STRIPE_WEBHOOK_SECRET
)

}catch(err){

console.log("Webhook error",err.message)
return res.status(400).send("Webhook error")

}

if(event.type==="checkout.session.completed"){

const session=event.data.object
const jobId=session.client_reference_id

if(jobId){

await db.collection("translationJobs")
.doc(jobId)
.update({
status:"paid",
paidAt:new Date()
})

}

}

res.json({received:true})

})

/* ==========================================
MIDDLEWARE
========================================== */

app.use(cors({
origin:[
"https://saybonapp.com",
"http://localhost:5500"
]
}))

app.use(express.json())

/* ==========================================
CREATE CHECKOUT
========================================== */

app.post("/api/createCheckout",async(req,res)=>{

try{

const {words,plan,jobId}=req.body

let price=plan==="express"
? words*0.05
: words*0.025

const session=await stripe.checkout.sessions.create({

payment_method_types:["card"],

mode:"payment",

line_items:[{
price_data:{
currency:"usd",
product_data:{
name:"SayBon Translation Service"
},
unit_amount:Math.round(price*100)
},
quantity:1
}],

client_reference_id:jobId,

success_url:
"https://saybonapp.com/translation/success.html?job="+jobId,

cancel_url:
"https://saybonapp.com/translation/request.html"

})

res.json({url:session.url})

}catch(err){

console.log(err)
res.status(500).json({error:"Stripe error"})

}

})

/* ==========================================
AI TEST GRADING
========================================== */

app.post("/api/gradeTranslationTest",async(req,res)=>{

try{

const {englishAnswer,frenchAnswer,frenchTest,englishTest}=req.body

const prompt=`

You are a professional translation examiner.

Evaluate these translations.

French source:
${frenchTest}

Translator English:
${englishAnswer}

English source:
${englishTest}

Translator French:
${frenchAnswer}

Score accuracy, grammar and meaning.

Return JSON only:

{
"score":number,
"feedback":"short explanation"
}

`

const completion=await openai.chat.completions.create({
model:"gpt-4o-mini",
messages:[{role:"user",content:prompt}],
temperature:0.2
})

const result=JSON.parse(completion.choices[0].message.content)

res.json(result)

}catch(err){

console.log(err)

res.status(500).json({
score:0,
feedback:"AI grading failed"
})

}

})

/* ==========================================
START SERVER
========================================== */

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
console.log("SayBon server running",PORT)
})


/* ==========================================
TRANSLATOR TEST EVALUATION
========================================== */

app.post("/api/evaluateTranslator", async (req,res)=>{

try{

const { frenchAnswer, englishAnswer, email } = req.body

if(!frenchAnswer || !englishAnswer){
return res.status(400).json({error:"Missing translation answers"})
}

const OpenAI = (await import("openai")).default

const openai = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

const prompt = `
You are a professional translation examiner.

Score the following translations out of 100.

Evaluate based on:
- accuracy
- terminology
- grammar
- sentence structure
- professional tone

Return JSON:

{
accuracy: number,
terminology: number,
grammar: number,
tone: number,
structure: number,
finalScore: number,
reason: "short explanation"
}

French ? English answer:
${frenchAnswer}

English ? French answer:
${englishAnswer}
`

const completion = await openai.chat.completions.create({
model:"gpt-4.1-mini",
messages:[
{role:"system",content:"You are a translation examiner."},
{role:"user",content:prompt}
],
temperature:0
})

let result = completion.choices[0].message.content

try{
result = JSON.parse(result)
}catch{
return res.status(500).json({error:"AI evaluation failed"})
}

/* STORE RESULT */

const doc = await db.collection("translatorApplications").add({

email:email || "unknown",

accuracy:result.accuracy,
terminology:result.terminology,
grammar:result.grammar,
tone:result.tone,
structure:result.structure,
finalScore:result.finalScore,
reason:result.reason,

createdAt:new Date()

})

res.json({
applicationId:doc.id,
score:result.finalScore
})

}catch(err){

console.error("Evaluation error:",err)

res.status(500).json({
error:"Translator evaluation failed"
})

}

})

