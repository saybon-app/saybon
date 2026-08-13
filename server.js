
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

// ------------------------------------------------
// AZURE TRANSLATION HELPERS
// ------------------------------------------------

const LANG_CODES={

English:"en",
French:"fr"

}

function toLangCode(name){

return LANG_CODES[name] || (name||"en").slice(0,2).toLowerCase()

}

function splitIntoSentences(text){

return (text||"")
.replace(/\n+/g," ")
.split(/(?<=[.!?])\s+/)
.map(s=>s.trim())
.filter(s=>s.length>0)

}

async function translateSegmentsWithAzure(sentences,fromLang,toLang){

if(!sentences.length) return []

const key=process.env.AZURE_TRANSLATOR_KEY
const endpoint=process.env.AZURE_TRANSLATOR_ENDPOINT
const region=process.env.AZURE_TRANSLATOR_REGION

if(!key || !endpoint || !region){

throw new Error("Azure Translator environment variables are not configured")

}

const results=[]
const batchSize=50

for(let i=0;i<sentences.length;i+=batchSize){

const batch=sentences.slice(i,i+batchSize)

const url=endpoint.replace(/\/$/,"")+"/translate?api-version=3.0&from="+fromLang+"&to="+toLang

const res=await fetch(url,{

method:"POST",
headers:{

"Ocp-Apim-Subscription-Key":key,
"Ocp-Apim-Subscription-Region":region,
"Content-Type":"application/json"

},
body:JSON.stringify(batch.map(text=>({Text:text})))

})

if(!res.ok){

const errText=await res.text()
throw new Error("Azure Translator request failed: "+res.status+" "+errText)

}

const data=await res.json()

data.forEach(item=>{

results.push(item.translations && item.translations[0] ? item.translations[0].text : "")

})

}

return results

}

async function generateAiDraftSegments(documentText,sourceLanguage,targetLanguage){

const sentences=splitIntoSentences(documentText)

if(!sentences.length) return []

const fromCode=toLangCode(sourceLanguage)
const toCode=toLangCode(targetLanguage)

const translations=await translateSegmentsWithAzure(sentences,fromCode,toCode)

return sentences.map((source,i)=>({

id:i+1,
source,
translation:translations[i]||""

}))

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

const jobDoc=await db.collection("translationJobs").doc(jobId).get()
const jobData=jobDoc.exists ? jobDoc.data() : {}

let aiSegments=[]
let aiTranslationStatus="skipped"

try{

aiSegments=await generateAiDraftSegments(

jobData.documentText||"",
jobData.sourceLanguage||"English",
jobData.targetLanguage||"French"

)

aiTranslationStatus=aiSegments.length ? "completed" : "empty_document"

}catch(aiErr){

console.error("AZURE TRANSLATION ERROR:",aiErr)
aiTranslationStatus="failed"

}

await db.collection("translationJobs").doc(jobId).update({

status:"open",
paid:true,
aiSegments,
aiTranslationStatus

})

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

// ------------------------------------------------
// CREATE DONATION CHECKOUT (USD, via Stripe)
// GHS donations stay on Paystack - this route only
// handles the USD branch from the donate form.
// ------------------------------------------------

app.post("/api/createDonationCheckout", async(req,res)=>{

try{

const {firstName,lastName,email,amount,message}=req.body

const cents=Math.round(Number(amount||0)*100)

if(!email || !cents || cents<=0){

return res.status(400).json({error:"invalid donation amount"})

}

const session=await stripe.checkout.sessions.create({

mode:"payment",
payment_method_types:["card"],
customer_email:email,
line_items:[{

price_data:{

currency:"usd",
product_data:{name:"SayBon Donation"},
unit_amount:cents

},
quantity:1

}],
metadata:{

donorFirstName:firstName||"",
donorLastName:lastName||"",
donorMessage:message||""

},
success_url:"https://saybonapp.com/support/thank-you.html",
cancel_url:"https://saybonapp.com/support/donate.html"

})

res.json({url:session.url})

}catch(err){

console.error(err);

res.status(500).json({error:"donation checkout creation failed"})

}

})

// ------------------------------------------------
// SUBMIT FEEDBACK
// ------------------------------------------------

app.post("/api/submitFeedback", async(req,res)=>{

try{

const {name,email,type,message}=req.body

if(!email || !message){

return res.status(400).json({error:"email and message are required"})

}

const ref=db.collection("feedbackSubmissions").doc()

await ref.set({

name:name||"",
email,
type:type||"Other",
message,
created:new Date()

})

res.json({success:true,id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"feedback submission failed"})

}

})

// ------------------------------------------------
// CREATE TRANSLATION REQUEST CHECKOUT
// (real dynamic price from the tiered package system
// on request.html - creates the job doc server-side,
// since client writes to translationJobs are not
// permitted by the Firestore rules.)
// ------------------------------------------------

app.post("/api/createTranslationRequestCheckout", async(req,res)=>{

try{

const {email,plan,wordCount,targetLanguage,sourceLanguage,clientFile,documentText,price}=req.body

const amountNum=Number(price)
const cents=Math.round(amountNum*100)

if(!email || !cents || cents<=0){

return res.status(400).json({error:"invalid translation request"})

}

const rand=Math.random().toString(36).substring(2,6).toUpperCase()
const jobId="SB-"+Date.now()+"-"+rand

await db.collection("translationJobs").doc(jobId).set({

jobId,
email,
plan:plan||"standard",
wordCount:Number(wordCount)||0,
targetLanguage:targetLanguage||"",
sourceLanguage:sourceLanguage||"",
clientFile:clientFile||"Untitled document",
documentText:documentText||"",
price:amountNum,
paid:false,
status:"awaiting_payment",
translator:null,
createdAt:new Date()

})

const session=await stripe.checkout.sessions.create({

mode:"payment",
payment_method_types:["card"],
customer_email:email,
line_items:[{

price_data:{

currency:"usd",
product_data:{name:"SayBon Translation - "+(plan||"standard")+" ("+wordCount+" words)"},
unit_amount:cents

},
quantity:1

}],
metadata:{jobId},
success_url:"https://saybonapp.com/translation/success.html?session_id={CHECKOUT_SESSION_ID}",
cancel_url:"https://saybonapp.com/translation/payment.html?plan="+encodeURIComponent(plan)+"&words="+encodeURIComponent(wordCount)+"&language="+encodeURIComponent(targetLanguage)+"&email="+encodeURIComponent(email)+"&price="+encodeURIComponent(price)

})

res.json({url:session.url,jobId:jobId})

}catch(err){

console.error(err);

res.status(500).json({error:"translation checkout creation failed"})

}

})

// ------------------------------------------------
// ACCEPT JOB WITH NDA (three-slot competitive model)
// Verifies the translator's passkey, atomically adds them
// to the job's participants array (max 3, using a Firestore
// transaction so two people can never both take the last
// slot), closes the job once full, and records a separate
// NDA acceptance audit entry.
// ------------------------------------------------

const NDA_VERSION="1.0"

app.post("/api/acceptJobWithNda", async(req,res)=>{

try{

const {jobId,passkey,agreedToTerms,confirmedOriginalWork}=req.body

if(!jobId || !passkey){

return res.status(400).json({error:"Job ID and passkey are required"})

}

if(agreedToTerms!==true || confirmedOriginalWork!==true){

return res.status(400).json({error:"You must agree to the NDA terms and confirm the work will be your own"})

}

const translatorSnapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(translatorSnapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

const jobRef=db.collection("translationJobs").doc(jobId)

let finalParticipantCount=0

await db.runTransaction(async(t)=>{

const jobDoc=await t.get(jobRef)

if(!jobDoc.exists){

throw new Error("JOB_NOT_FOUND")

}

const job=jobDoc.data()

if(job.status!=="open"){

throw new Error("JOB_NOT_OPEN")

}

const participants=job.participants||[]

if(participants.includes(passkey)){

throw new Error("ALREADY_ACCEPTED")

}

if(participants.length>=3){

throw new Error("JOB_FULL")

}

const newParticipants=[...participants,passkey]
finalParticipantCount=newParticipants.length

const newStatus=newParticipants.length>=3 ? "closed" : "open"

t.update(jobRef,{

participants:newParticipants,
status:newStatus

})

})

await db.collection("ndaAcceptances").add({

translatorId:passkey,
jobId,
ndaVersion:NDA_VERSION,
agreedToTerms:true,
confirmedOriginalWork:true,
acceptedAt:new Date(),
status:"accepted"

})

res.json({success:true,slotsFilled:finalParticipantCount})

}catch(err){

if(err.message==="JOB_NOT_FOUND"){
return res.status(404).json({error:"Job not found"})
}

if(err.message==="JOB_NOT_OPEN"){
return res.status(400).json({error:"This job is no longer accepting participants"})
}

if(err.message==="ALREADY_ACCEPTED"){
return res.status(400).json({error:"You have already accepted this job"})
}

if(err.message==="JOB_FULL"){
return res.status(400).json({error:"This job is full"})
}

console.error(err);

res.status(500).json({error:"job acceptance failed"})

}

})