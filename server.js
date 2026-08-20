
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

function deriveNameFromEmail(email){

const localPart=(email||"").split("@")[0] || ""
const cleaned=localPart.replace(/[._0-9]+/g," ").trim()

if(!cleaned) return ""

return cleaned
.split(/\s+/)
.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase())
.join(" ")

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

const {jobId,passkey,translation,keystrokeCount,timeTakenSeconds,tabSwitches,pasteAttempts}=req.body

if(!jobId || !passkey){

return res.status(400).json({error:"Job ID and passkey are required"})

}

const existing=await db.collection("jobSubmissions")
.where("jobId","==",jobId)
.where("translator","==",passkey)
.get()

if(!existing.empty){

return res.status(400).json({error:"You have already submitted work for this job"})

}

// NOTE: job status is governed by the 3-slot participant
// system (open/closed) and is intentionally NOT changed here.
// A single submission must not close the job for the other
// participants still working on it. The job is marked done
// through the admin review process instead.

await db.collection("jobSubmissions").add({

jobId,
translator:passkey,
translation,
keystrokeCount:Number(keystrokeCount)||0,
timeTakenSeconds:Number(timeTakenSeconds)||0,
tabSwitches:Number(tabSwitches)||0,
pasteAttempts:Number(pasteAttempts)||0,
submitted:new Date()

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

// ------------------------------------------------
// SAVE TRANSLATOR PAYMENT METHOD (bank or mobile money)
// ------------------------------------------------

app.post("/api/savePaymentMethod", async(req,res)=>{

try{

const {passkey,method,bankRegion,bankName,accountNumber,accountName,routingNumber,sortCode,iban,swiftBic,momoNetwork,momoNumber}=req.body

if(!passkey || !method){

return res.status(400).json({error:"Passkey and payment method type are required"})

}

const translatorSnapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(translatorSnapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

if(method==="bank"){

if(!bankName || !accountName){

return res.status(400).json({error:"Bank name and account name are required"})

}

if(bankRegion==="us" && (!accountNumber || !routingNumber)){

return res.status(400).json({error:"Account number and routing number are required for US banks"})

}

if(bankRegion==="uk" && (!accountNumber || !sortCode)){

return res.status(400).json({error:"Account number and sort code are required for UK banks"})

}

if(bankRegion==="international" && (!iban || !swiftBic)){

return res.status(400).json({error:"IBAN and SWIFT/BIC code are required for international banks"})

}

if((!bankRegion || bankRegion==="ghana") && !accountNumber){

return res.status(400).json({error:"Account number is required"})

}

}

if(method==="momo" && (!momoNetwork || !momoNumber)){

return res.status(400).json({error:"Mobile money network and number are required"})

}

await db.collection("translatorPaymentMethods").doc(passkey).set({

passkey,
method,
bankRegion:bankRegion||"ghana",
bankName:bankName||"",
accountNumber:accountNumber||"",
accountName:accountName||"",
routingNumber:routingNumber||"",
sortCode:sortCode||"",
iban:iban||"",
swiftBic:swiftBic||"",
momoNetwork:momoNetwork||"",
momoNumber:momoNumber||"",
updatedAt:new Date()

})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not save payment method"})

}

})

// ------------------------------------------------
// GET TRANSLATOR PAYMENT METHOD (pre-fill on return visits)
// ------------------------------------------------

app.get("/api/paymentMethod", async(req,res)=>{

try{

const passkey=req.query.key

const doc=await db.collection("translatorPaymentMethods").doc(passkey).get()

if(!doc.exists){

return res.json({exists:false})

}

res.json({exists:true,...doc.data()})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load payment method"})

}

})

// ------------------------------------------------
// ADMIN: LIST SUBMISSIONS FOR REVIEW
// ------------------------------------------------

app.get("/api/adminSubmissions", async(req,res)=>{

try{

const snapshot=await db.collection("jobSubmissions").orderBy("submitted","desc").get()

const submissions=[]

for(const doc of snapshot.docs){

const data=doc.data()

let jobPrice=0
let jobFile=""
let jobWordCount=0

try{

const jobDoc=await db.collection("translationJobs").doc(data.jobId).get()

if(jobDoc.exists){

jobPrice=jobDoc.data().price||0
jobFile=jobDoc.data().clientFile||""
jobWordCount=jobDoc.data().wordCount||0

}

}catch(e){}

submissions.push({

id:doc.id,
jobId:data.jobId,
jobFile,
jobPrice,
jobWordCount,
translator:data.translator,
translation:data.translation,
submitted:data.submitted,
reviewed:data.reviewed||false,
rank:data.rank||null,
passed:data.passed!==undefined ? data.passed : null,
keystrokeCount:data.keystrokeCount||0,
timeTakenSeconds:data.timeTakenSeconds||0,
tabSwitches:data.tabSwitches||0,
pasteAttempts:data.pasteAttempts||0

})

}

res.json(submissions)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load submissions"})

}

})

// ------------------------------------------------
// ADMIN: REVIEW A SUBMISSION (manual human review step)
// Assigns rank + pass/fail, computes the real payout
// amount from the job's actual price using the 100/40/20
// split, and creates or updates the payout entry.
// ------------------------------------------------

const PAYOUT_PERCENTAGES={1:100,2:40,3:20}

app.post("/api/reviewSubmission", async(req,res)=>{

try{

const {submissionId,rank,passed}=req.body

if(!submissionId || ![1,2,3].includes(Number(rank))){

return res.status(400).json({error:"A valid submission and rank (1, 2, or 3) are required"})

}

const subRef=db.collection("jobSubmissions").doc(submissionId)
const subDoc=await subRef.get()

if(!subDoc.exists){

return res.status(404).json({error:"Submission not found"})

}

const submission=subDoc.data()

const jobDoc=await db.collection("translationJobs").doc(submission.jobId).get()
const jobPrice=jobDoc.exists ? Number(jobDoc.data().price||0) : 0

const percentage=passed ? (PAYOUT_PERCENTAGES[Number(rank)]||0) : 0
const amountOwed=Math.round(jobPrice*percentage/100*100)/100

await subRef.update({

reviewed:true,
rank:Number(rank),
passed:passed===true

})

const payoutQuery=await db.collection("payouts")
.where("jobId","==",submission.jobId)
.where("translatorPasskey","==",submission.translator)
.limit(1)
.get()

const payoutData={

jobId:submission.jobId,
translatorPasskey:submission.translator,
rank:Number(rank),
passed:passed===true,
percentage,
amountOwed,
status:"pending",
updatedAt:new Date()

}

if(payoutQuery.empty){

payoutData.createdAt=new Date()
await db.collection("payouts").add(payoutData)

}else{

await payoutQuery.docs[0].ref.update(payoutData)

}

res.json({success:true,amountOwed})

}catch(err){

console.error(err);

res.status(500).json({error:"could not review submission"})

}

})

// ------------------------------------------------
// ADMIN: LIST PAYOUTS (with translator payment details)
// ------------------------------------------------

app.get("/api/adminPayouts", async(req,res)=>{

try{

const snapshot=await db.collection("payouts").orderBy("createdAt","desc").get()

const payouts=[]

for(const doc of snapshot.docs){

const data=doc.data()

let paymentMethod=null

try{

const pmDoc=await db.collection("translatorPaymentMethods").doc(data.translatorPasskey).get()

if(pmDoc.exists){

paymentMethod=pmDoc.data()

}

}catch(e){}

payouts.push({

id:doc.id,
...data,
paymentMethod

})

}

res.json(payouts)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load payouts"})

}

})

// ------------------------------------------------
// ADMIN: MARK PAYOUT AS PAID (after manual bank/MoMo transfer)
// ------------------------------------------------

app.post("/api/markPayoutPaid", async(req,res)=>{

try{

const {payoutId}=req.body

if(!payoutId){

return res.status(400).json({error:"Payout ID is required"})

}

await db.collection("payouts").doc(payoutId).update({

status:"paid",
paidAt:new Date()

})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not mark payout as paid"})

}

})

// ------------------------------------------------
// TRANSLATOR TRACK RECORD (real, from reviewed submissions)
// ------------------------------------------------

// ------------------------------------------------
// TRANSLATOR ENTRY TEST - fixed passages, real
// Azure-backed reference translation scoring.
// ------------------------------------------------

const TRANSLATOR_TEST_PASSAGES={

frToEn:{
source:"Toute utilisation non autorisée de ce document est strictement interdite et peut entraîner des poursuites judiciaires conformément à la législation en vigueur. Les informations contenues dans ce rapport sont confidentielles et ne doivent être divulguées à aucun tiers sans le consentement écrit préalable de l'entreprise.",
sourceLang:"fr",
targetLang:"en"
},

enToFr:{
source:"The system automatically encrypts all sensitive information before it is transmitted to the server. Any attempt to bypass this security protocol will be logged and reported to the compliance department for further investigation.",
sourceLang:"en",
targetLang:"fr"
}

}

function normalizeWords(text){

return (text||"")
.toLowerCase()
.replace(/[.,;:!?"'""«»]/g,"")
.split(/\s+/)
.filter(w=>w.length>2)

}

function computeOverlapScore(userText,referenceText){

const refWords=normalizeWords(referenceText)

if(!refWords.length) return 0

const uniqueRefWords=[...new Set(refWords)]
const userWordSet=new Set(normalizeWords(userText))

let matched=0

uniqueRefWords.forEach(w=>{
if(userWordSet.has(w)) matched++
})

return Math.round((matched/uniqueRefWords.length)*100)

}

function checkCompleteness(userText,sourceText){

const trimmed=(userText||"").trim()

if(trimmed.length<20) return false

if(trimmed.toLowerCase()===sourceText.toLowerCase()) return false

const wordCount=trimmed.split(/\s+/).length
const sourceWordCount=sourceText.split(/\s+/).length

if(wordCount < sourceWordCount*0.5) return false

return true

}

app.get("/api/translatorTestPassages", async(req,res)=>{

res.json({

frToEnSource:TRANSLATOR_TEST_PASSAGES.frToEn.source,
enToFrSource:TRANSLATOR_TEST_PASSAGES.enToFr.source

})

})

app.post("/api/submitTranslatorTest", async(req,res)=>{

try{

const {frToEnAnswer,enToFrAnswer,tabSwitches,timeTakenSeconds}=req.body

if(!frToEnAnswer || !enToFrAnswer){

return res.status(400).json({error:"Both translations are required"})

}

const frToEnRef=await translateSegmentsWithAzure(
[TRANSLATOR_TEST_PASSAGES.frToEn.source],
TRANSLATOR_TEST_PASSAGES.frToEn.sourceLang,
TRANSLATOR_TEST_PASSAGES.frToEn.targetLang
)

const enToFrRef=await translateSegmentsWithAzure(
[TRANSLATOR_TEST_PASSAGES.enToFr.source],
TRANSLATOR_TEST_PASSAGES.enToFr.sourceLang,
TRANSLATOR_TEST_PASSAGES.enToFr.targetLang
)

const accuracy=computeOverlapScore(frToEnAnswer,frToEnRef[0]||"")
const terminology=computeOverlapScore(enToFrAnswer,enToFrRef[0]||"")

const completenessOk=
checkCompleteness(frToEnAnswer,TRANSLATOR_TEST_PASSAGES.frToEn.source) &&
checkCompleteness(enToFrAnswer,TRANSLATOR_TEST_PASSAGES.enToFr.source)

let finalScore=Math.round((accuracy+terminology)/2)

if(!completenessOk){
finalScore=Math.min(finalScore,50)
}

const passed=finalScore>=75

const testId=generateKey()

await db.collection("translatorTests").doc(testId).set({

testId,
frToEnAnswer,
enToFrAnswer,
accuracy,
terminology,
completenessOk,
finalScore,
passed,
tabSwitches:Number(tabSwitches)||0,
timeTakenSeconds:Number(timeTakenSeconds)||0,
used:false,
submittedAt:new Date()

})

res.json({testId,accuracy,terminology,completenessOk,finalScore,passed})

}catch(err){

console.error(err);

res.status(500).json({error:"could not score test"})

}

})

// ------------------------------------------------
// COMPLETE TRANSLATOR APPLICATION
// Combines the real test score with registration
// details into one application record. Only issues
// a real passkey if the test was genuinely passed.
// ------------------------------------------------

app.post("/api/completeTranslatorApplication", async(req,res)=>{

try{

const {testId,name,email,phone,country,experience,idUrl,certUrls,cvUrls}=req.body

if(!testId || !email){

return res.status(400).json({error:"Test ID and email are required"})

}

const testDoc=await db.collection("translatorTests").doc(testId).get()

if(!testDoc.exists){

return res.status(404).json({error:"Test result not found"})

}

const test=testDoc.data()

if(test.used){

return res.status(400).json({error:"This test has already been used for an application"})

}

const applicationId=generateKey()
const passkey=test.passed ? generateKey() : null

await db.collection("translatorApplications").doc(applicationId).set({

name:name||"",
email,
phone:phone||"",
country:country||"",
experience:experience||"",

accuracy:test.accuracy,
terminology:test.terminology,
completenessOk:test.completenessOk,
finalScore:test.finalScore,
passed:test.passed,

passkey,

documents:{
id:idUrl||"",
certifications:certUrls||[],
cv:cvUrls||[]
},

testId,
created:new Date()

})

await db.collection("translatorTests").doc(testId).update({used:true})

res.json({applicationId,passed:test.passed})

}catch(err){

console.error(err);

res.status(500).json({error:"could not complete application"})

}

})

app.get("/api/translatorTrackRecord", async(req,res)=>{

try{

const passkey=req.query.key

if(!passkey){

return res.status(400).json({error:"Passkey is required"})

}

const translatorSnapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(translatorSnapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

const translatorData=translatorSnapshot.docs[0].data()
const translatorName=(translatorData.name && translatorData.name.trim())
? translatorData.name
: deriveNameFromEmail(translatorData.email)

const submissionsSnapshot=await db.collection("jobSubmissions")
.where("translator","==",passkey)
.where("reviewed","==",true)
.get()

let passedCount=0
let totalReviewed=0

submissionsSnapshot.forEach(doc=>{

totalReviewed++

if(doc.data().passed===true){

passedCount++

}

})

const passRate=totalReviewed>0 ? Math.round((passedCount/totalReviewed)*100) : 0

res.json({

passedCount,
totalReviewed,
passRate,
name:translatorName

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load track record"})

}

})

// ------------------------------------------------
// TRANSLATOR WALLET (real balances from payouts)
// Available Balance = earnings that have cleared the
// waiting period after being marked passed.
// Pending Clearance = earnings still within the window.
// Paid Out = amount already manually transferred.
// ------------------------------------------------

const CLEARANCE_DAYS=3
const MIN_CASH_OUT=10

app.get("/api/translatorWallet", async(req,res)=>{

try{

const passkey=req.query.key

if(!passkey){

return res.status(400).json({error:"Passkey is required"})

}

const translatorSnapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(translatorSnapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

const payoutsSnapshot=await db.collection("payouts")
.where("translatorPasskey","==",passkey)
.get()

const now=Date.now()

let pendingClearance=0
let availableBalance=0
let paidOut=0

payoutsSnapshot.forEach(doc=>{

const p=doc.data()
const amount=Number(p.amountOwed||0)

if(p.status==="paid"){

paidOut+=amount

}else{

const createdMs=p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().getTime() : now
const daysElapsed=(now-createdMs)/(1000*60*60*24)

if(daysElapsed>=CLEARANCE_DAYS){

availableBalance+=amount

}else{

pendingClearance+=amount

}

}

})

res.json({

pendingClearance:Math.round(pendingClearance*100)/100,
availableBalance:Math.round(availableBalance*100)/100,
paidOut:Math.round(paidOut*100)/100,
totalBalance:Math.round((pendingClearance+availableBalance)*100)/100,
minCashOut:MIN_CASH_OUT,
clearanceDays:CLEARANCE_DAYS

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load wallet"})

}

})

app.get("/api/translatorProfile", async(req,res)=>{

try{

const passkey=req.query.key

if(!passkey){

return res.status(400).json({error:"Passkey is required"})

}

const snapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(snapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

const data=snapshot.docs[0].data()

res.json({

name:data.name||"",
defaultName:deriveNameFromEmail(data.email),
photoUrl:data.photoUrl||"",
email:data.email||""

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load profile"})

}

})

app.post("/api/updateTranslatorProfile", async(req,res)=>{

try{

const {passkey,name,photoUrl}=req.body

if(!passkey){

return res.status(400).json({error:"Passkey is required"})

}

const snapshot=await db.collection("translatorApplications")
.where("passkey","==",passkey)
.get()

if(snapshot.empty){

return res.status(400).json({error:"Invalid translator passkey"})

}

const updates={}

if(name!==undefined) updates.name=name
if(photoUrl!==undefined) updates.photoUrl=photoUrl

await snapshot.docs[0].ref.update(updates)

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not update profile"})

}

})

// ------------------------------------------------
// ADMIN: OVERVIEW STATS (real aggregates)
// ------------------------------------------------

app.get("/api/adminOverview", async(req,res)=>{

try{

const jobsSnapshot=await db.collection("translationJobs").get()

let totalRevenue=0
let openJobs=0
let totalJobs=0

jobsSnapshot.forEach(doc=>{

const job=doc.data()
totalJobs++

if(job.paid===true){
totalRevenue+=Number(job.price||0)
}

if(job.status==="open"){
openJobs++
}

})

const submissionsSnapshot=await db.collection("jobSubmissions").get()

let awaitingReview=0

submissionsSnapshot.forEach(doc=>{
if(!doc.data().reviewed){
awaitingReview++
}
})

const applicationsSnapshot=await db.collection("translatorApplications").get()

let totalTranslators=0
let approvedTranslators=0

applicationsSnapshot.forEach(doc=>{
totalTranslators++
if(doc.data().passed===true){
approvedTranslators++
}
})

const payoutsSnapshot=await db.collection("payouts").get()

let pendingPayoutTotal=0
let paidPayoutTotal=0

payoutsSnapshot.forEach(doc=>{

const p=doc.data()
const amount=Number(p.amountOwed||0)

if(p.status==="paid"){
paidPayoutTotal+=amount
}else{
pendingPayoutTotal+=amount
}

})

res.json({

totalRevenue:Math.round(totalRevenue*100)/100,
totalJobs,
openJobs,
awaitingReview,
totalTranslators,
approvedTranslators,
pendingPayoutTotal:Math.round(pendingPayoutTotal*100)/100,
paidPayoutTotal:Math.round(paidPayoutTotal*100)/100

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load overview"})

}

})

// ------------------------------------------------
// ADMIN: LIST ALL TRANSLATOR APPLICATIONS
// ------------------------------------------------

app.get("/api/adminTranslators", async(req,res)=>{

try{

const snapshot=await db.collection("translatorApplications").orderBy("created","desc").get()

const translators=[]

snapshot.forEach(doc=>{

const data=doc.data()

translators.push({

id:doc.id,
name:data.name||"",
email:data.email||"",
phone:data.phone||"",
country:data.country||"",
experience:data.experience||"",
accuracy:data.accuracy,
terminology:data.terminology,
finalScore:data.finalScore,
passed:data.passed,
passkey:data.passkey||null,
photoUrl:data.photoUrl||"",
documents:data.documents||{},
created:data.created

})

})

res.json(translators)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load translators"})

}

})

// ================================================================
// SAYBON MUSIC
// ================================================================

app.get("/api/musicVideos", async(req,res)=>{

try{

const genre=req.query.genre

let query=db.collection("musicVideos").orderBy("createdAt","desc")

if(genre && genre!=="All"){
query=query.where("genre","==",genre)
}

const snapshot=await query.get()

const videos=[]

snapshot.forEach(doc=>{
const d=doc.data()
videos.push({
id:doc.id,
title:d.title,
artist:d.artist,
genre:d.genre,
youtubeId:d.youtubeId||null,
fileUrl:d.fileUrl||null,
thumbnailUrl:d.thumbnailUrl||null,
views:d.views||0,
likeCount:d.likeCount||0,
createdAt:d.createdAt
})
})

res.json(videos)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load videos"})

}

})

app.get("/api/musicVideo", async(req,res)=>{

try{

const id=req.query.id
const userId=req.query.userId

const doc=await db.collection("musicVideos").doc(id).get()

if(!doc.exists){

return res.status(404).json({error:"Video not found"})

}

const d=doc.data()

let userHasLiked=false

if(userId){

const reactionDoc=await db.collection("musicReactions").doc(id+"_"+userId).get()
userHasLiked=reactionDoc.exists

}

res.json({

id:doc.id,
title:d.title,
artist:d.artist,
genre:d.genre,
youtubeId:d.youtubeId||null,
fileUrl:d.fileUrl||null,
thumbnailUrl:d.thumbnailUrl||null,
description:d.description||"",
views:d.views||0,
likeCount:d.likeCount||0,
userHasLiked

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load video"})

}

})

app.post("/api/musicIncrementView", async(req,res)=>{

try{

const {videoId}=req.body

if(!videoId){
return res.status(400).json({error:"Video ID is required"})
}

await db.collection("musicVideos").doc(videoId).update({

views:admin.firestore.FieldValue.increment(1)

})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not record view"})

}

})

app.post("/api/musicToggleReaction", async(req,res)=>{

try{

const {videoId,userId}=req.body

if(!videoId || !userId){
return res.status(400).json({error:"Video ID and user ID are required"})
}

const reactionRef=db.collection("musicReactions").doc(videoId+"_"+userId)
const reactionDoc=await reactionRef.get()

const videoRef=db.collection("musicVideos").doc(videoId)

let liked

if(reactionDoc.exists){

await reactionRef.delete()
await videoRef.update({likeCount:admin.firestore.FieldValue.increment(-1)})
liked=false

}else{

await reactionRef.set({videoId,userId,createdAt:new Date()})
await videoRef.update({likeCount:admin.firestore.FieldValue.increment(1)})
liked=true

}

res.json({success:true,liked})

}catch(err){

console.error(err);

res.status(500).json({error:"could not update reaction"})

}

})

app.get("/api/musicComments", async(req,res)=>{

try{

const videoId=req.query.videoId

// NOTE: sorting happens in JS below rather than via .orderBy()
// in the query, since combining .where() on one field with
// .orderBy() on a different field requires a manually-created
// Firestore composite index. Without that index, this exact
// query silently throws every time, which was why comments
// could be posted successfully but never appeared when loaded.
const snapshot=await db.collection("musicComments")
.where("videoId","==",videoId)
.get()

const comments=[]

snapshot.forEach(doc=>{
const d=doc.data()
comments.push({
id:doc.id,
userId:d.userId,
userName:d.userName,
userPhoto:d.userPhoto||"",
text:d.text,
createdAt:d.createdAt
})
})

comments.sort((a,b) => {
const aTime = a.createdAt && a.createdAt._seconds ? a.createdAt._seconds : (a.createdAt ? new Date(a.createdAt).getTime()/1000 : 0)
const bTime = b.createdAt && b.createdAt._seconds ? b.createdAt._seconds : (b.createdAt ? new Date(b.createdAt).getTime()/1000 : 0)
return bTime - aTime
})

res.json(comments)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load comments"})

}

})

app.post("/api/musicAddComment", async(req,res)=>{

try{

const {videoId,userId,userName,userPhoto,text}=req.body

if(!videoId || !userId || !text || !text.trim()){
return res.status(400).json({error:"Video ID, user, and comment text are required"})
}

const ref=await db.collection("musicComments").add({

videoId,
userId,
userName:userName||"SayBon User",
userPhoto:userPhoto||"",
text:text.trim(),
createdAt:new Date()

})

res.json({success:true,id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"could not add comment"})

}

})

app.post("/api/musicDeleteComment", async(req,res)=>{

try{

const {commentId}=req.body

if(!commentId){
return res.status(400).json({error:"Comment ID is required"})
}

await db.collection("musicComments").doc(commentId).delete()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not delete comment"})

}

})

app.get("/api/musicPlaylists", async(req,res)=>{

try{

const userId=req.query.userId

if(!userId){
return res.status(400).json({error:"User ID is required"})
}

// NOTE: sorting in JS below instead of via .orderBy(), same
// fix as musicComments - .where() on one field combined with
// .orderBy() on a different field requires a Firestore
// composite index that doesn't exist here, causing this exact
// query to silently fail every time.
const snapshot=await db.collection("musicPlaylists")
.where("userId","==",userId)
.get()

const playlists=[]

snapshot.forEach(doc=>{
const d=doc.data()
playlists.push({
id:doc.id,
name:d.name,
videoIds:d.videoIds||[],
createdAt:d.createdAt
})
})

playlists.sort((a,b) => {
const aTime = a.createdAt && a.createdAt._seconds ? a.createdAt._seconds : (a.createdAt ? new Date(a.createdAt).getTime()/1000 : 0)
const bTime = b.createdAt && b.createdAt._seconds ? b.createdAt._seconds : (b.createdAt ? new Date(b.createdAt).getTime()/1000 : 0)
return bTime - aTime
})

res.json(playlists)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load playlists"})

}

})

app.post("/api/musicCreatePlaylist", async(req,res)=>{

try{

const {userId,name}=req.body

if(!userId || !name || !name.trim()){
return res.status(400).json({error:"User ID and playlist name are required"})
}

const ref=await db.collection("musicPlaylists").add({

userId,
name:name.trim(),
videoIds:[],
createdAt:new Date()

})

res.json({success:true,id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"could not create playlist"})

}

})

app.post("/api/musicAddToPlaylist", async(req,res)=>{

try{

const {playlistId,videoId}=req.body

if(!playlistId || !videoId){
return res.status(400).json({error:"Playlist ID and video ID are required"})
}

const ref=db.collection("musicPlaylists").doc(playlistId)
const doc=await ref.get()

if(!doc.exists){
return res.status(404).json({error:"Playlist not found"})
}

const videoIds=doc.data().videoIds||[]

if(!videoIds.includes(videoId)){
videoIds.push(videoId)
await ref.update({videoIds})
}

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not add video to playlist"})

}

})

app.get("/api/musicPlaylistDetail", async(req,res)=>{

try{

const id=req.query.id

const doc=await db.collection("musicPlaylists").doc(id).get()

if(!doc.exists){
return res.status(404).json({error:"Playlist not found"})
}

const data=doc.data()
const videoIds=data.videoIds||[]

const videos=[]

for(const vid of videoIds){

const vDoc=await db.collection("musicVideos").doc(vid).get()

if(vDoc.exists){
const d=vDoc.data()
videos.push({id:vDoc.id,title:d.title,artist:d.artist,genre:d.genre,youtubeId:d.youtubeId,thumbnailUrl:d.thumbnailUrl||null,views:d.views||0})
}

}

res.json({id:doc.id,name:data.name,videos})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load playlist"})

}

})

app.post("/api/adminAddMusicVideo", async(req,res)=>{

try{

const {title,artist,genre,youtubeId,fileUrl,thumbnailUrl,description}=req.body

if(!title || !genre || (!youtubeId && !fileUrl)){
return res.status(400).json({error:"Title, genre, and either a YouTube ID or an uploaded file are required"})
}

const ref=await db.collection("musicVideos").add({

title,
artist:artist||"",
genre,
youtubeId:youtubeId||null,
fileUrl:fileUrl||null,
thumbnailUrl:thumbnailUrl||null,
description:description||"",
views:0,
likeCount:0,
createdAt:new Date()

})

res.json({success:true,id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"could not add video"})

}

})

app.post("/api/adminDeleteMusicVideo", async(req,res)=>{

try{

const {videoId}=req.body

if(!videoId){
return res.status(400).json({error:"Video ID is required"})
}

await db.collection("musicVideos").doc(videoId).delete()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not delete video"})

}

})

// ================================================================
// CHAT MODERATION SYSTEM
// ================================================================

const CHAT_BANNED_TERMS = [
"fuck","shit","bitch","asshole","cunt","nigger","nigga","faggot","retard",
"kill yourself","kys"
]

const CHAT_VIOLATION_BLOCK_THRESHOLD = 3

function checkChatContent(text){

const lower = (text||"").toLowerCase()

for(const term of CHAT_BANNED_TERMS){
if(lower.includes(term)){
return {allowed:false, matchedTerm:term}
}
}

return {allowed:true, matchedTerm:null}

}

app.post("/api/chatCheckContent", (req,res)=>{

try{

const {text}=req.body

if(typeof text !== "string"){
return res.status(400).json({error:"Text is required"})
}

const result = checkChatContent(text)

res.json(result)

}catch(err){

console.error(err);

res.status(500).json({error:"could not check content"})

}

})

app.get("/api/chatUserStatus", async(req,res)=>{

try{

const uid=req.query.uid

if(!uid){
return res.status(400).json({error:"UID is required"})
}

const docSnap = await db.collection("chatUserStatus").doc(uid).get()

if(!docSnap.exists){
return res.json({blocked:false, flagged:false, violationCount:0})
}

const d = docSnap.data()

res.json({
blocked: d.blocked||false,
flagged: d.flagged||false,
violationCount: d.violationCount||0
})

}catch(err){

console.error(err);

res.status(500).json({error:"could not get user status"})

}

})

app.post("/api/chatRecordViolation", async(req,res)=>{

try{

const {uid,displayName,roomId,messageText,matchedTerm}=req.body

if(!uid || !roomId){
return res.status(400).json({error:"UID and room are required"})
}

await db.collection("chatViolations").add({
uid,
displayName: displayName||"Unknown",
roomId,
messageText: messageText||"",
matchedTerm: matchedTerm||"",
createdAt: new Date()
})

const statusRef = db.collection("chatUserStatus").doc(uid)
const statusSnap = await statusRef.get()

const currentCount = statusSnap.exists ? (statusSnap.data().violationCount||0) : 0
const newCount = currentCount + 1
const shouldBlock = newCount >= CHAT_VIOLATION_BLOCK_THRESHOLD

await statusRef.set({
uid,
displayName: displayName||"Unknown",
violationCount: newCount,
blocked: shouldBlock,
lastViolationAt: new Date()
}, {merge:true})

res.json({violationCount:newCount, blocked:shouldBlock})

}catch(err){

console.error(err);

res.status(500).json({error:"could not record violation"})

}

})

app.get("/api/adminChatUsers", async(req,res)=>{

try{

const snapshot = await db.collection("chatUserStatus").get()

const users = []

snapshot.forEach(doc=>{
const d = doc.data()
users.push({
uid: doc.id,
displayName: d.displayName||"Unknown",
violationCount: d.violationCount||0,
blocked: d.blocked||false,
flagged: d.flagged||false
})
})

users.sort((a,b) => b.violationCount - a.violationCount)

res.json(users)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load users"})

}

})

app.post("/api/adminBlockUser", async(req,res)=>{

try{

const {uid,displayName}=req.body

if(!uid){
return res.status(400).json({error:"UID is required"})
}

await db.collection("chatUserStatus").doc(uid).set({
uid, displayName: displayName||"Unknown", blocked:true
}, {merge:true})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not block user"})

}

})

app.post("/api/adminUnblockUser", async(req,res)=>{

try{

const {uid}=req.body

if(!uid){
return res.status(400).json({error:"UID is required"})
}

await db.collection("chatUserStatus").doc(uid).set({blocked:false}, {merge:true})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not unblock user"})

}

})

app.post("/api/adminFlagUser", async(req,res)=>{

try{

const {uid,displayName,flagged}=req.body

if(!uid){
return res.status(400).json({error:"UID is required"})
}

await db.collection("chatUserStatus").doc(uid).set({
uid, displayName: displayName||"Unknown", flagged: !!flagged
}, {merge:true})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not update flag"})

}

})

app.get("/api/adminChatViolations", async(req,res)=>{

try{

const snapshot = await db.collection("chatViolations").get()

const violations = []

snapshot.forEach(doc=>{
const d = doc.data()
violations.push({
id: doc.id,
uid: d.uid,
displayName: d.displayName,
roomId: d.roomId,
messageText: d.messageText,
matchedTerm: d.matchedTerm,
createdAt: d.createdAt
})
})

violations.sort((a,b) => {
const aT = a.createdAt && a.createdAt._seconds ? a.createdAt._seconds : 0
const bT = b.createdAt && b.createdAt._seconds ? b.createdAt._seconds : 0
return bT - aT
})

res.json(violations)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load violations"})

}

})

app.get("/api/adminChatCustomRooms", async(req,res)=>{

try{

const snapshot = await db.collection("chatRooms").where("isCustom","==",true).get()

const rooms = []

snapshot.forEach(doc=>{
const d = doc.data()
rooms.push({
id: doc.id,
name: d.name,
createdBy: d.createdBy,
lastMessage: d.lastMessage||""
})
})

res.json(rooms)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load custom rooms"})

}

})

app.post("/api/adminDeleteChatRoom", async(req,res)=>{

try{

const {roomId}=req.body

if(!roomId){
return res.status(400).json({error:"Room ID is required"})
}

await db.collection("chatRooms").doc(roomId).delete()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not delete room"})

}

})

app.post("/api/adminUpdateMusicThumbnail", async(req,res)=>{

try{

const {videoId,thumbnailUrl}=req.body

if(!videoId || !thumbnailUrl){
return res.status(400).json({error:"Video ID and thumbnail URL are required"})
}

await db.collection("musicVideos").doc(videoId).update({thumbnailUrl})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not update thumbnail"})

}

})

// ================================================================
// AZURE SPEECH PRONUNCIATION ASSESSMENT
// Scores a recorded response against a reference text.
// Weighted per requirements: content accuracy matters most,
// but fluency and completeness are also factored in.
// ================================================================

app.post("/api/assessPronunciation", express.raw({type: () => true, limit: "10mb"}), async(req,res)=>{

try{

const referenceText = req.query.referenceText
const audioBuffer = req.body

if(!referenceText || !audioBuffer || !audioBuffer.length){

return res.status(400).json({error:"Reference text and audio are required"})

}

const pronunciationConfig = {

ReferenceText: referenceText,
GradingSystem: "HundredMark",
Granularity: "Word",
EnableMiscue: true

}

const pronunciationAssessmentHeader = Buffer.from(JSON.stringify(pronunciationConfig)).toString("base64")

const azureRegion = process.env.AZURE_SPEECH_REGION
const azureKey = process.env.AZURE_SPEECH_KEY

if(!azureRegion || !azureKey){

return res.status(500).json({error:"Azure Speech is not configured on the server yet"})

}

const azureUrl = "https://" + azureRegion + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=fr-FR&format=detailed"

const azureRes = await fetch(azureUrl, {

method: "POST",
headers: {
"Ocp-Apim-Subscription-Key": azureKey,
"Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
"Accept": "application/json",
"Pronunciation-Assessment": pronunciationAssessmentHeader
},
body: audioBuffer

})

const azureData = await azureRes.json()

if(!azureRes.ok){

console.error("Azure Speech error:", azureData)
return res.status(500).json({error:"Speech assessment failed", details: azureData})

}

const best = azureData.NBest && azureData.NBest[0]

if(!best){

return res.status(400).json({error:"Could not assess this recording. Please try again, speaking clearly.", raw: azureData})

}

const accuracyScore = best.AccuracyScore || 0
const fluencyScore = best.FluencyScore || 0
const completenessScore = best.CompletenessScore || 0

const finalScore = Math.round(

accuracyScore * 0.5 +
completenessScore * 0.2 +
fluencyScore * 0.3

)

const wordFeedback = (best.Words||[]).map(w => ({

word: w.Word,
accuracyScore: w.AccuracyScore != null ? w.AccuracyScore : null,
errorType: w.ErrorType || null

}))

res.json({

recognizedText: best.Display || best.Lexical || "",
accuracyScore,
fluencyScore,
completenessScore,
finalScore,
words: wordFeedback,
_debugRawAzureResponse: azureData

})

}catch(err){

console.error(err);

res.status(500).json({error:"could not assess pronunciation"})

}

})

app.get("/api/adminMusicOverview", async(req,res)=>{

try{

const videosSnapshot=await db.collection("musicVideos").get()

let totalViews=0
let totalLikes=0
let totalVideos=0

videosSnapshot.forEach(doc=>{
const d=doc.data()
totalVideos++
totalViews+=d.views||0
totalLikes+=d.likeCount||0
})

const commentsSnapshot=await db.collection("musicComments").get()
const totalComments=commentsSnapshot.size

const playlistsSnapshot=await db.collection("musicPlaylists").get()
const totalPlaylists=playlistsSnapshot.size

res.json({totalVideos,totalViews,totalLikes,totalComments,totalPlaylists})

}catch(err){

console.error(err);

res.status(500).json({error:"could not load music overview"})

}

})

// ================================================================
// TALKLETICS LOCATIONS (World Map)
// ================================================================

app.get("/api/locations", async(req,res)=>{

try{

const snapshot=await db.collection("talkleticsLocations").orderBy("order","asc").get()

let locations=[]

snapshot.forEach(doc=>{

locations.push({

id:doc.id,
...doc.data()

})

})

res.json(locations)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load locations"})

}

})

app.post("/api/adminAddLocation", async(req,res)=>{

try{

const {name,imageUrl}=req.body

if(!name || !imageUrl){
return res.status(400).json({error:"Name and image are required"})
}

const existingSnapshot=await db.collection("talkleticsLocations").get()
const order=existingSnapshot.size+1
const unlocked=order===1

const ref=db.collection("talkleticsLocations").doc()

await ref.set({

name,
imageUrl,
order,
unlocked,
created:new Date()

})

res.json({id:ref.id,order,unlocked})

}catch(err){

console.error(err);

res.status(500).json({error:"could not add location"})

}

})

app.post("/api/adminDeleteLocation", async(req,res)=>{

try{

const {locationId}=req.body

if(!locationId){
return res.status(400).json({error:"Location ID is required"})
}

await db.collection("talkleticsLocations").doc(locationId).delete()

const snapshot=await db.collection("talkleticsLocations").orderBy("order","asc").get()

const batch=db.batch()

let i=0

snapshot.forEach(doc=>{

i++

batch.update(doc.ref,{

order:i,
unlocked:i===1

})

})

await batch.commit()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not delete location"})

}

})

app.post("/api/adminMoveLocation", async(req,res)=>{

try{

const {locationId,direction}=req.body

if(!locationId || (direction!=="up" && direction!=="down")){
return res.status(400).json({error:"Location ID and a valid direction are required"})
}

const snapshot=await db.collection("talkleticsLocations").orderBy("order","asc").get()

let docs=[]

snapshot.forEach(doc=>{

docs.push({

id:doc.id,
ref:doc.ref,
...doc.data()

})

})

const index=docs.findIndex(d=>d.id===locationId)

if(index===-1){
return res.status(404).json({error:"Location not found"})
}

const swapIndex=direction==="up" ? index-1 : index+1

if(swapIndex<0 || swapIndex>=docs.length){
return res.json({success:true})
}

const currentOrder=docs[index].order
const swapOrder=docs[swapIndex].order

const batch=db.batch()

batch.update(docs[index].ref,{

order:swapOrder,
unlocked:swapOrder===1

})

batch.update(docs[swapIndex].ref,{

order:currentOrder,
unlocked:currentOrder===1

})

await batch.commit()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not reorder location"})

}

})

// ================================================================
// TALKLETICS ASSETS (general media: video, audio, images)
// ================================================================

app.get("/api/assets", async(req,res)=>{

try{

const snapshot=await db.collection("talkleticsAssets").orderBy("created","desc").get()

let assets=[]

snapshot.forEach(doc=>{

assets.push({

id:doc.id,
...doc.data()

})

})

res.json(assets)

}catch(err){

console.error(err);

res.status(500).json({error:"could not load assets"})

}

})

app.post("/api/adminAddAsset", async(req,res)=>{

try{

const {name,type,url}=req.body

if(!name || !type || !url){
return res.status(400).json({error:"Name, type, and URL are required"})
}

const ref=db.collection("talkleticsAssets").doc()

await ref.set({

name,
type,
url,
created:new Date()

})

res.json({id:ref.id})

}catch(err){

console.error(err);

res.status(500).json({error:"could not add asset"})

}

})

app.post("/api/adminDeleteAsset", async(req,res)=>{

try{

const {assetId}=req.body

if(!assetId){
return res.status(400).json({error:"Asset ID is required"})
}

await db.collection("talkleticsAssets").doc(assetId).delete()

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not delete asset"})

}

})

app.post("/api/adminRenameAsset", async(req,res)=>{

try{

const {assetId,newName}=req.body

if(!assetId || !newName){
return res.status(400).json({error:"Asset ID and new name are required"})
}

await db.collection("talkleticsAssets").doc(assetId).update({name:newName})

res.json({success:true})

}catch(err){

console.error(err);

res.status(500).json({error:"could not rename asset"})

}

})

// ================================================================
// DELF AI GRADING (Writing / Speaking, scored against DELF rubric)
// ================================================================

app.post("/api/gradeDelfResponse", express.json(), async(req,res)=>{

try{

const {skill, level, prompt, response} = req.body

if(!skill || !level || !prompt || !response){
return res.status(400).json({error:"skill, level, prompt, and response are all required"})
}

if(skill !== "writing" && skill !== "speaking"){
return res.status(400).json({error:"skill must be either writing or speaking"})
}

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT
const azureKey = process.env.AZURE_OPENAI_KEY
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT

if(!azureEndpoint || !azureKey || !azureDeployment){
return res.status(500).json({error:"Azure OpenAI is not configured on the server yet"})
}

const systemPrompt =
"You are an official DELF examiner grading French language exam responses. " +
"You grade strictly according to real DELF assessment criteria for the " + skill + " section at level " + level + ". " +
"Score out of 25, matching the real DELF's per-skill scoring. " +
"Respond ONLY with valid JSON in this exact shape, no markdown, no extra text: " +
'{"score": <number 0-25>, "strengths": "<2-3 sentences>", "improvements": "<2-3 sentences>", "corrected_example": "<one short corrected phrase from their response, or empty string if not applicable>"}'

const userPrompt =
"DELF Level: " + level + "\n" +
"Skill: " + skill + "\n" +
"Task prompt given to the candidate: " + prompt + "\n\n" +
"Candidate's response:\n" + response

const azureUrl = azureEndpoint.replace(/\/$/, "") +
"/openai/deployments/" + azureDeployment +
"/chat/completions?api-version=2024-08-01-preview"

const azureRes = await fetch(azureUrl, {

method: "POST",
headers: {
"Content-Type": "application/json",
"api-key": azureKey
},
body: JSON.stringify({
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: userPrompt }
],
temperature: 0.3,
max_tokens: 500
})

})

const azureData = await azureRes.json()

if(!azureRes.ok){

console.error("Azure OpenAI error:", azureData)
return res.status(500).json({error:"Grading request failed", details: azureData})

}

const rawText = azureData.choices && azureData.choices[0] && azureData.choices[0].message
? azureData.choices[0].message.content
: null

if(!rawText){
return res.status(500).json({error:"No grading response received"})
}

let parsed

try{
parsed = JSON.parse(rawText)
}catch(parseErr){
console.error("Could not parse grading JSON:", rawText)
return res.status(500).json({error:"Could not parse grading result", raw: rawText})
}

res.json(parsed)

}catch(err){

console.error(err);

res.status(500).json({error:"could not grade DELF response"})

}

})