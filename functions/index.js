const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai.key
});


exports.evaluateTranslator = functions.firestore
.document("translatorApplications/{applicantId}")
.onCreate(async (snap, context) => {

const data = snap.data();

const english = data.englishTranslation || "";
const french = data.frenchTranslation || "";

try{

const prompt = `
You are evaluating a professional translator application.

Evaluate the following translations and return a score from 0 to 100.

English translation:
${english}

French translation:
${french}

Return JSON only:

{
 "accuracy": number,
 "grammar": number,
 "terminology": number,
 "fluency": number
}
`;

const response = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You are a professional translation evaluator."},
{role:"user",content:prompt}
]

});

const result = JSON.parse(response.choices[0].message.content);

const finalScore = Math.round(
(result.accuracy * 0.4) +
(result.grammar * 0.25) +
(result.terminology * 0.2) +
(result.fluency * 0.15)
);

let status = "rejected";

if(finalScore >= 80){
status = "approved";
}

await snap.ref.update({

accuracyScore: result.accuracy,
grammarScore: result.grammar,
terminologyScore: result.terminology,
fluencyScore: result.fluency,

finalScore: finalScore,
status: status,

evaluatedAt: Date.now()

});

}catch(err){

console.error("Evaluation error:",err);

await snap.ref.update({

status:"evaluation_failed"

});

}

});

