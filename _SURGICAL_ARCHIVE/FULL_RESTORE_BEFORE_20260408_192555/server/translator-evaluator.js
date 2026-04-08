import admin from "firebase-admin";
import OpenAI from "openai";

const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function evaluateTranslator(applicationId){

try{

const doc = await db.collection("translatorApplications")
.doc(applicationId)
.get();

if(!doc.exists){
console.log("Application not found");
return;
}

const data = doc.data();

const english = data.englishTranslation;
const french = data.frenchTranslation;

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
{role:"system",content:"You evaluate translation tests."},
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

console.log("Evaluation complete");

}catch(err){

console.error("Evaluation error:",err);

}

}
