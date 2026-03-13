
const express=require("express")
const cors=require("cors")
const bodyParser=require("body-parser")
const admin=require("firebase-admin")

const app=express()

app.use(cors())
app.use(bodyParser.json())

admin.initializeApp()

const db=admin.firestore()

function generateKey(){

return "SB-"+Math.random().toString(36).substring(2,10).toUpperCase()

}

# ----------------------------------------------
# EVALUATE TRANSLATOR TEST
# ----------------------------------------------

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

res.status(500).json({error:"evaluation failed"})

}

})

# ----------------------------------------------
# GET RESULT
# ----------------------------------------------

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

res.status(500).json({error:"failed"})

}

})

# ----------------------------------------------
# VERIFY TRANSLATOR KEY
# ----------------------------------------------

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

res.status(500).json({valid:false})

}

})

app.listen(3000,()=>{

console.log("Translator API running")

})


# ------------------------------------------------
# CREATE TRANSLATION JOB
# ------------------------------------------------

app.post("/api/createJob", async(req,res)=>{

try{

const {clientEmail,sourceLanguage,targetLanguage,wordCount,price}=req.body

const ref=db.collection("translationJobs").doc()

await ref.set({

clientEmail,
sourceLanguage,
targetLanguage,
wordCount,
price,
status:"open",
translator:null,
created:new Date()

})

res.json({jobId:ref.id})

}catch(err){

res.status(500).json({error:"job creation failed"})

}

})

# ------------------------------------------------
# GET JOB BOARD
# ------------------------------------------------

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

res.status(500).json({error:"failed"})

}

})

# ------------------------------------------------
# CLAIM JOB
# ------------------------------------------------

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

res.status(500).json({error:"claim failed"})

}

})

# ------------------------------------------------
# SUBMIT TRANSLATION
# ------------------------------------------------

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

res.status(500).json({error:"submission failed"})

}

})

# ------------------------------------------------
# TRANSLATOR STATS
# ------------------------------------------------

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

res.status(500).json({error:"stats failed"})

}

})


# ------------------------------------------------
# CREATE TRANSLATION JOB AUTOMATICALLY
# ------------------------------------------------

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

res.status(500).json({error:"job creation failed"})

}

})

