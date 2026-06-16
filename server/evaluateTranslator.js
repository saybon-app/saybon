import express from "express";
import admin from "firebase-admin";
import OpenAI from "openai";

const router = express.Router();
const db = admin.firestore();

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

router.post("/evaluateApplication", async (req,res)=>{

try{

const { applicationId } = req.body;

const doc = await db.collection("translatorApplications")
.doc(applicationId)
.get();

if(!doc.exists){
return res.status(404).json({error:"Application not found"});
}

const data = doc.data();

const english = data.test.englishAnswer;
const french = data.test.frenchAnswer;

const prompt = `
You are a professional translation evaluator.

Score the translation across:
Accuracy
Grammar
Fluency
Terminology

Return JSON only with:

accuracy
grammar
fluency
terminology
overallScore

English translation:
${english}

French translation:
${french}
`;

const completion = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You evaluate translations."},
{role:"user",content:prompt}
],

temperature:0

});

const result = JSON.parse(completion.choices[0].message.content);

const admitted = result.overallScore >= 80;

await db.collection("translatorApplications")
.doc(applicationId)
.update({

aiEvaluation: result,

status:{
approved: admitted,
rejected: !admitted,
evaluated: true
}

});

res.json({
status:"evaluated",
admitted
});

}catch(err){

console.error(err);
res.status(500).json({error:"Evaluation failed"});

}

});

export default router;
