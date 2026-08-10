
const express=require("express")
const cors=require("cors")
const bodyParser=require("body-parser")
const admin=require("firebase-admin")
const stripe=require("stripe")(process.env.STRIPE_SECRET_KEY)

const app=express()

app.use(cors())
app.use(bodyParser.json())

admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))})

const db=admin.firestore()

function generateKey(){

return "SB-"+Math.random().toString(36).substring(2,10).toUpperCase()

}

// ----------------------------------------------
// EVALUATE TRANSLATOR TEST
// ----------------------------------------------

app.post("/api/evaluateTranslator", async(req,res)=>{

try{

const {accuracy,terminology,grammar,tone,email}=req.body

const finalScore=Math.round(
(accuracy+terminology+grammar+tone)/4
)

const passkey=generateKey()

const ref=db.collection("translatorApplications").doc()

await ref.set({

accuracy,
terminology,
grammar,
tone,
finalScore,
passkey,
email,
created:new Date()

})

res.json({

applicationId:ref.id

})

}catch(err){

console.error(err);

res.status(500).json({error:"evaluation failed"})

}

})

// ----------------------------------------------
// GET RESULT
// ----------------------------------------------

app.get("/api/applicationResult", async(req,res)=>{

try{

const id=req.query.id

const doc=await db.collection("translatorApplications")
.doc(id)
.get()

if(!doc.exists){

return res.status(404).json({error:"not found"})

}

res.json(doc.data())

}catch(err){

console.error(err);

res.status(500).json({error:"failed"})

}

})

// ----------------------------------------------
// VERIFY TRANSLATOR KEY
// ----------------------------------------------

app.post("/api/verifyTranslatorKey", async(req,res)=>{

try{

const key=req.body.key

const snapshot=await db.collection("translatorApplications")
.where("passkey","==",key)
.get()

if(snapshot.empty){

return res.json({valid:false})

}

res.json({valid:true})

}catch(err){

console.error(err);

res.status(500).json({valid:false})

}

})

app.listen(process.env.PORT || 3000,()=>{

console.log("Translator API running")

})


// ------------------------------------------------
// CREATE TRANSLATION JOB
// ------------------------------------------------

app.post("/api/createJob", async(req,res)=>{

try{

const {words,plan}=req.body

const wordCount=Number(words)||0
const rate=plan==="express" ? 0.05 : 0.025
const price=Math.round(wordCount*rate*100)/100

const ref=db.collection("translationJobs").doc()

await ref.set({

wordCount,
plan,
price,
status:"open",
translator:null,
created:new Date()

})

res.json({id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"job creation failed"})

}

})

// ------------------------------------------------
// GET JOB BOARD
// ------------------------------------------------

app.get("/api/jobs", async(req,res)=>{

try{

const snapshot=await db.collection("translationJobs")
.where("status","==","open")
.get()

let jobs=[]

snapshot.forEach(doc=>{

jobs.push({

id:doc.id,
...doc.data()

})

})

res.json(jobs)

}catch(err){

console.error(err);

res.status(500).json({error:"failed"})

}

})

// ------------------------------------------------
// CLAIM JOB
// ------------------------------------------------

app.post("/api/claimJob", async(req,res)=>{

try{

const {jobId,passkey}=req.body

const translatorSnapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(translatorSnapshot.empty){

return res.json({error:"invalid translator"})

}

await db.collection("translationJobs")
.doc(jobId)
.update({

status:"claimed",
translator:passkey

})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"claim failed"})

}

})

// ------------------------------------------------
// SUBMIT TRANSLATION
// ------------------------------------------------

app.post("/api/submitTranslation", async(req,res)=>{

try{

const {jobId,passkey,translation}=req.body

await db.collection("jobSubmissions").add({

jobId,
translator:passkey,
translation,
submitted:new Date()

})

await db.collection("translationJobs")
.doc(jobId)
.update({

status:"completed"

})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"submission failed"})

}

})

// ------------------------------------------------
// TRANSLATOR STATS
// ------------------------------------------------

app.get("/api/translatorStats", async(req,res)=>{

try{

const passkey=req.query.key

const jobs=await db.collection("translationJobs")
.where("translator","==",passkey)
.get()

let completed=0

jobs.forEach(j=>{

if(j.data().status==="completed"){

completed++

}

})

res.json({

jobsCompleted:completed

})

}catch(err){

console.error(err);

res.status(500).json({error:"stats failed"})

}

})


// ------------------------------------------------
// CREATE TRANSLATION JOB AUTOMATICALLY
// ------------------------------------------------

app.post("/api/createTranslationJob", async(req,res)=>{

try{

const {clientEmail,wordCount,service}=req.body

let price=0

if(service==="standard"){

price=wordCount*0.025

}else{

price=wordCount*0.05

}

const ref=db.collection("translationJobs").doc()

await ref.set({

clientEmail,
wordCount,
service,
price,
status:"open",
translator:null,
created:new Date()

})

res.json({

jobId:ref.id,
price:price

})

}catch(err){

console.error(err);

res.status(500).json({error:"job creation failed"})

}

})


// ------------------------------------------------
// EVALUATE TRANSLATION TEST
// ------------------------------------------------

app.post("/api/evaluateTranslatorTest", async(req,res)=>{

try{

const {testId,email}=req.body

const testDoc=await db.collection("translatorTests")
.doc(testId)
.get()

if(!testDoc.exists){

return res.status(404).json({error:"test not found"})

}

const test=testDoc.data()

const english=test.englishTranslation.toLowerCase()
const french=test.frenchTranslation.toLowerCase()

// --------------------------------------------
// SIMPLE AI SCORING LOGIC
// (can later be replaced with GPT evaluation)
// --------------------------------------------

let accuracy=0
let terminology=0
let grammar=0
let tone=0

// expected keywords

const englishKeywords=[
"unauthorized",
"use",
"document",
"strictly",
"prohibited",
"legal"
]

englishKeywords.forEach(k=>{
if(english.includes(k)) accuracy+=8
})

accuracy=Math.min(accuracy,40)

const frenchKeywords=[
"système",
"chiffre",
"informations",
"sensibles",
"serveur"
]

frenchKeywords.forEach(k=>{
if(french.includes(k)) terminology+=5
})

terminology=Math.min(terminology,25)

grammar=15+Math.random()*5
tone=10+Math.random()*5

const finalScore=Math.round(
accuracy+terminology+grammar+tone
)

const passkey="SB-"+Math.random().toString(36)
.substring(2,10).toUpperCase()

const applicationId=crypto.randomUUID()

await db.collection("translatorApplications")
.doc(applicationId)
.set({

email,
englishTranslation:test.englishTranslation,
frenchTranslation:test.frenchTranslation,

accuracy,
terminology,
grammar,
tone,
finalScore,

passkey,

created:new Date()

})

res.json({

applicationId,
finalScore

})

}catch(err){

console.error(err);

res.status(500).json({error:"evaluation failed"})

}

})



// ------------------------------------------------
// CREATE CHECKOUT (translation job payment)
// ------------------------------------------------

app.post("/api/createCheckout", async(req,res)=>{

try{

const {id}=req.body

const jobDoc=await db.collection("translationJobs").doc(id).get()

if(!jobDoc.exists){

return res.status(404).json({error:"job not found"})

}

const job=jobDoc.data()
const amount=Math.round(Number(job.price||0)*100)

const session=await stripe.checkout.sessions.create({

mode:"payment",
payment_method_types:["card"],
line_items:[{

price_data:{

currency:"usd",
product_data:{name:"SayBon Translation Job"},
unit_amount:amount

},
quantity:1

}],
metadata:{jobId:id},
success_url:"https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",
cancel_url:"https://saybonapp.com/translation/job.html?id="+id

})

res.json({url:session.url})

}catch(err){

console.error(err);

res.status(500).json({error:"checkout creation failed"})

}

})

// ------------------------------------------------
// SESSION -> JOB LOOKUP (after Stripe redirect)
// ------------------------------------------------

app.get("/api/session-job", async(req,res)=>{

try{

const sessionId=req.query.session_id

const session=await stripe.checkout.sessions.retrieve(sessionId)
const jobId=session.metadata && session.metadata.jobId

if(!jobId){

return res.status(404).json({error:"job reference not found"})

}

if(session.payment_status==="paid"){

await db.collection("translationJobs").doc(jobId).update({status:"paid"})

}

res.json({jobId})

}catch(err){

console.error(err);

res.status(500).json({error:"session lookup failed"})

}

})

// ------------------------------------------------
// CREATE DELF CHECKOUT
// ------------------------------------------------

app.post("/api/createDelfCheckout", async(req,res)=>{

try{

const {category,level,price}=req.body

const amount=Math.round(Number(price||0)*100)

const session=await stripe.checkout.sessions.create({

mode:"payment",
payment_method_types:["card"],
line_items:[{

price_data:{

currency:"usd",
product_data:{name:"DELF "+category+" "+level},
unit_amount:amount

},
quantity:1

}],
success_url:"https://saybonapp.com/features/delf/success.html?category="+encodeURIComponent(category)+"&level="+encodeURIComponent(level),
cancel_url:"https://saybonapp.com/features/delf/payment.html?category="+encodeURIComponent(category)+"&level="+encodeURIComponent(level)+"&price="+encodeURIComponent(price)

})

res.json({url:session.url})

}catch(err){

console.error(err);

res.status(500).json({error:"delf checkout creation failed"})

}

})