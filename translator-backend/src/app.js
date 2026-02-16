require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());


// -----------------------------
// ROOT PAGE
// -----------------------------

app.get("/", (req, res) => {

res.send("SayBon Production Backend Running");

});


// -----------------------------
// JOB STORAGE
// -----------------------------

const jobs = [];


// -----------------------------
// OPENAI
// -----------------------------

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});



// =====================================================
// CREATE JOB
// =====================================================

app.post("/upload", async (req, res) => {

try {

const { text } = req.body;

if (!text) {

return res.status(400).json({
error: "No text provided"
});

}


// -----------------------------
// PHASE 1 TRANSLATION
// -----------------------------

const completion =
await openai.chat.completions.create({

model: "gpt-4o-mini",

messages: [

{
role: "system",
content:
"Translate to French. This is Phase 1. Preserve formatting."
},

{
role: "user",
content: text
}

]

});


const phase1 =
completion.choices[0].message.content;


// -----------------------------
// CREATE JOB OBJECT
// -----------------------------

const job = {

id: Date.now().toString(),

originalText: text,

phase1: phase1,

status: "OPEN",

accepted: [],

submissions: [],

created: Date.now(),

deadline: Date.now() + 24*60*60*1000,

payment: 120

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




// =====================================================
// VIEW JOBS
// =====================================================

app.get("/jobs", (req, res) => {

res.json({

jobs

});

});




// =====================================================
// ACCEPT JOB
// =====================================================

app.post("/accept", (req, res) => {

const { jobId, translator } = req.body;


const job = jobs.find(j => j.id === jobId);


if(!job){

return res.status(404).json({
error:"Job not found"
});

}


// LIMIT TO 3

if(job.accepted.length >=3){

return res.json({

error:"Job already closed"

});

}


// PREVENT DUPLICATE

if(job.accepted.find(t=>t.name===translator)){

return res.json({

error:"Already accepted"

});

}


// ADD TRANSLATOR

job.accepted.push({

name:translator,

acceptedAt:Date.now()

});


// CLOSE JOB IF 3

if(job.accepted.length===3){

job.status="IN_PROGRESS";

}


res.json({

success:true

});

});





// =====================================================
// SUBMIT TRANSLATION
// =====================================================

app.post("/submit", (req, res) => {

const {

jobId,

translator,

text,

ndaSigned=true

} = req.body;


const job = jobs.find(j => j.id === jobId);


if(!job){

return res.status(404).json({
error:"Job not found"
});

}


// NDA REQUIRED

if(!ndaSigned){

return res.json({

error:"NDA required"

});

}


// FIND ACCEPT RECORD

const accepted =
job.accepted.find(t=>t.name===translator);


if(!accepted){

return res.json({

error:"Translator did not accept job"

});

}


// MINIMUM TIME CHECK
// prevents instant submit fraud

const minTime=2*60*1000;


if(Date.now()-accepted.acceptedAt < minTime){

return res.json({

error:"Submission too fast. Rejected."

});

}



// DETERMINE POSITION

let position="bonus";


if(job.submissions.length===0){

position="winner";

job.status="COMPLETED";

}

else if(job.submissions.length===1){

position="second";

}

else{

position="third";

}




job.submissions.push({

translator,

text,

time:Date.now(),

position,

payment:

position==="winner" ? job.payment :

position==="second" ? job.payment*0.3 :

job.payment*0.2

});



res.json({

success:true,

position

});

});




// =====================================================
// START SERVER
// =====================================================

const PORT = 4000;


app.listen(PORT, () => {

console.log("SayBon Production Running");

});