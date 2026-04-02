const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(bodyParser.json());

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function generateKey(){
  return "SB-" + Math.random().toString(36).substring(2,10).toUpperCase();
}

app.get("/", (req,res)=>{
  res.send("SayBon Backend Running");
});

# ==========================================
# AI TRANSLATOR TEST EVALUATION
# ==========================================

app.post("/api/evaluateTranslatorTest", async(req,res)=>{
  try{

    const { english, french, email } = req.body;

    const prompt = `
You are a professional DELF examiner.

Evaluate this translation:

English: ${english}
French: ${french}

Score out of 100 across:
- accuracy (40)
- terminology (25)
- grammar (20)
- tone (15)

Return JSON only:
{
  "accuracy": number,
  "terminology": number,
  "grammar": number,
  "tone": number,
  "finalScore": number,
  "feedback": "short feedback"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const result = JSON.parse(completion.choices[0].message.content);

    const passkey = generateKey();
    const applicationId = crypto.randomUUID();

    await db.collection("translatorApplications")
    .doc(applicationId)
    .set({
      email,
      english,
      french,
      ...result,
      passkey,
      created: new Date()
    });

    res.json({
      applicationId,
      ...result
    });

  }catch(err){
    console.error(err);
    res.status(500).json({error:"AI evaluation failed"});
  }
});

# ==========================================
# EXISTING SYSTEM (PRESERVED)
# ==========================================

app.post("/api/evaluateTranslator", async(req,res)=>{
  try{
    const {accuracy,terminology,grammar,tone,email}=req.body;

    const finalScore=Math.round(
      (accuracy+terminology+grammar+tone)/4
    );

    const passkey=generateKey();

    const ref=db.collection("translatorApplications").doc();

    await ref.set({
      accuracy,
      terminology,
      grammar,
      tone,
      finalScore,
      passkey,
      email,
      created:new Date()
    });

    res.json({applicationId:ref.id});

  }catch(err){
    res.status(500).json({error:"evaluation failed"});
  }
});

app.get("/api/applicationResult", async(req,res)=>{
  try{
    const id=req.query.id;

    const doc=await db.collection("translatorApplications")
    .doc(id)
    .get();

    if(!doc.exists){
      return res.status(404).json({error:"not found"});
    }

    res.json(doc.data());

  }catch(err){
    res.status(500).json({error:"failed"});
  }
});

app.post("/api/verifyTranslatorKey", async(req,res)=>{
  try{
    const key=req.body.key;

    const snapshot=await db.collection("translatorApplications")
    .where("passkey","==",key)
    .get();

    if(snapshot.empty){
      return res.json({valid:false});
    }

    res.json({valid:true});

  }catch(err){
    res.status(500).json({valid:false});
  }
});

app.post("/api/createTranslationJob", async(req,res)=>{
  try{

    const {clientEmail,wordCount,service}=req.body;

    let price = service==="standard"
      ? wordCount * 0.025
      : wordCount * 0.05;

    const ref=db.collection("translationJobs").doc();

    await ref.set({
      clientEmail,
      wordCount,
      service,
      price,
      status:"open",
      translator:null,
      created:new Date()
    });

    res.json({jobId:ref.id, price});

  }catch(err){
    res.status(500).json({error:"job creation failed"});
  }
});

app.get("/api/jobs", async(req,res)=>{
  try{

    const snapshot=await db.collection("translationJobs")
    .where("status","==","open")
    .get();

    let jobs=[];

    snapshot.forEach(doc=>{
      jobs.push({id:doc.id,...doc.data()});
    });

    res.json(jobs);

  }catch(err){
    res.status(500).json({error:"failed"});
  }
});

app.post("/api/claimJob", async(req,res)=>{
  try{

    const {jobId,passkey}=req.body;

    const translatorSnapshot=await db.collection("translatorApplications")
    .where("passkey","==",passkey)
    .get();

    if(translatorSnapshot.empty){
      return res.json({error:"invalid translator"});
    }

    await db.collection("translationJobs")
    .doc(jobId)
    .update({
      status:"claimed",
      translator:passkey
    });

    res.json({success:true});

  }catch(err){
    res.status(500).json({error:"claim failed"});
  }
});

app.post("/api/submitTranslation", async(req,res)=>{
  try{

    const {jobId,passkey,translation}=req.body;

    await db.collection("jobSubmissions").add({
      jobId,
      translator:passkey,
      translation,
      submitted:new Date()
    });

    await db.collection("translationJobs")
    .doc(jobId)
    .update({
      status:"completed"
    });

    res.json({success:true});

  }catch(err){
    res.status(500).json({error:"submission failed"});
  }
});

app.get("/api/translatorStats", async(req,res)=>{
  try{

    const passkey=req.query.key;

    const jobs=await db.collection("translationJobs")
    .where("translator","==",passkey)
    .get();

    let completed=0;

    jobs.forEach(j=>{
      if(j.data().status==="completed"){
        completed++;
      }
    });

    res.json({jobsCompleted:completed});

  }catch(err){
    res.status(500).json({error:"stats failed"});
  }
});

# ==========================================
# START SERVER (RENDER COMPATIBLE)
# ==========================================

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
  console.log("SayBon unified backend running on port " + PORT);
});
