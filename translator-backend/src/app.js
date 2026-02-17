require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());



// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {

res.send("SayBon Translator System Running");

});



// =====================================
// STORAGE
// =====================================

const jobs = [];

const translators = [];



// =====================================
// OPENAI
// =====================================

const openai = new OpenAI({

apiKey: process.env.OPENAI_API_KEY,

});



// =====================================
// CREATE JOB
// =====================================

app.post("/upload", async (req, res) => {

try {

const { text } = req.body;

if (!text) {

return res.status(400).json({

error: "No text provided"

});

}


const completion =
await openai.chat.completions.create({

model: "gpt-4o-mini",

messages: [

{

role: "system",

content:

"Translate to French professionally"

},

{

role: "user",

content: text

}

]

});


const phase1 =
completion.choices[0].message.content;



const job = {

id: Date.now(),

originalText: text,

phase1,

status: "OPEN",

accepted: [],

submissions: [],

winner: null,

created: Date.now()

};


jobs.push(job);


res.json({

success: true,

job

});


}

catch(error){

console.log(error);

res.status(500).json({

error: error.message

});

}

});



// =====================================
// GET JOBS
// =====================================

app.get("/jobs", (req,res)=>{

res.json({

jobs

});

});



// =====================================
// ACCEPT JOB
// =====================================

app.post("/accept",(req,res)=>{

const {

jobId,

translator

} = req.body;


const job =
jobs.find(j=>j.id==jobId);


if(!job)
return res.status(404).json({

error:"Job not found"

});


if(job.accepted.length>=3){

return res.json({

error:"Job already taken"

});

}


if(job.accepted.find(t=>t.name==translator)){

return res.json({

error:"Already accepted"

});

}



job.accepted.push({

name:translator,

time:Date.now()

});


if(job.accepted.length==3){

job.status="IN_PROGRESS";

}


res.json({

success:true

});

});



// =====================================
// SUBMIT TRANSLATION
// =====================================

app.post("/submit", async (req,res)=>{

try{


const {

jobId,

translator,

translation,

ndaSigned

} = req.body;



const job =
jobs.find(j=>j.id==jobId);



if(!job)
return res.status(404).json({

error:"Job not found"

});


if(!ndaSigned)
return res.status(400).json({

error:"NDA required"

});



const accepted =
job.accepted.find(t=>t.name==translator);


if(!accepted)
return res.status(400).json({

error:"Not accepted"

});



const timeSpent =
Date.now()-accepted.time;


if(timeSpent<60000)
return res.status(400).json({

error:"Submission too fast"

});



// AI QUALITY CHECK

const check =
await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{

role:"system",

content:

"Score translation from 0 to 100. Reply number only."

},

{

role:"user",

content:

"Original:\n"+job.originalText+

"\n\nTranslation:\n"+translation

}

]

});


const score =
parseInt(

check.choices[0].message.content

);



const submission={

translator,

translation,

score,

time:Date.now(),

accepted:score>=85

};



job.submissions.push(submission);



if(submission.accepted && !job.winner){

job.winner=translator;

job.status="COMPLETED";

}



res.json({

success:true,

score,

accepted:submission.accepted,

winner:job.winner

});


}

catch(error){

res.status(500).json({

error:error.message

});

}

});



// =====================================
// GET JOB DETAILS
// =====================================

app.get("/job/:id",(req,res)=>{

const job =
jobs.find(j=>j.id==req.params.id);

res.json({

job

});

});



// =====================================
// REGISTER TRANSLATOR
// =====================================

app.post("/api/register",(req,res)=>{

const translator={

id:Date.now(),

...req.body,

status:"PENDING",

created:Date.now()

};


translators.push(translator);


res.json({

success:true,

message:"Registration received"

});

});



// =====================================
// VIEW TRANSLATORS
// =====================================

app.get("/api/translators",(req,res)=>{

res.json({

translators

});

});



// =====================================
// AI EVALUATE TRANSLATOR
// =====================================

app.post("/api/admin/evaluate", async (req,res)=>{

try{


const { translator } = req.body;


const evaluation =
await openai.chat.completions.create({

model:"gpt-4o",

messages:[

{

role:"system",

content:

`
You are a professional translation examiner.

Score translator from 0 to 100.

Grade:

Accuracy
Fluency
Speed
Professional readiness
Risk level

Return full detailed report.

`

},

{

role:"user",

content:

JSON.stringify(translator)

}

]

});


res.json({

report:
evaluation.choices[0].message.content

});


}

catch(error){

res.status(500).json({

error:error.message

});

}

});



// =====================================
// APPROVE TRANSLATOR
// =====================================

app.post("/api/admin/approve",(req,res)=>{


const {

translatorId

}=req.body;



const translator=
translators.find(

t=>t.id==translatorId

);



if(!translator)
return res.json({

error:"Not found"

});



translator.status="APPROVED";

translator.passcode=

Math.random()

.toString(36)

.substring(2,8)

.toUpperCase();



res.json({

success:true,

passcode:translator.passcode

});



});



// =====================================
// SERVER
// =====================================

const PORT = 4000;

app.listen(PORT,()=>{

console.log(

"SayBon Translator Backend Running"

);

});