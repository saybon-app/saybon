require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();



/* =====================================
ROOT
===================================== */

app.get("/", (req, res) => {

res.send("SayBon Production Backend Running");

});



/* =====================================
STORAGE
===================================== */

const jobs = [];



/* =====================================
OPENAI
===================================== */

const openai = new OpenAI({

apiKey: process.env.OPENAI_API_KEY,

});



/* =====================================
REQUEST QUOTE (FILE UPLOAD)
===================================== */

app.post("/request", upload.single("file"), async (req, res) => {

try{

if(!req.file){

return res.status(400).json({
error:"No file uploaded"
});

}


let text = "";


/* PDF */

if(req.file.originalname.endsWith(".pdf")){

const data =
await pdfParse(req.file.buffer);

text = data.text;

}


/* DOCX */

else if(req.file.originalname.endsWith(".docx")){

const result =
await mammoth.extractRawText({
buffer:req.file.buffer
});

text = result.value;

}


/* TXT */

else{

text =
req.file.buffer.toString();

}



/* WORD COUNT */

const words =
text.trim().split(/\s+/).length;



/* PRICES */

const standardPrice =
words * 0.025;

const expressPrice =
words * 0.05;



/* DELIVERY TIME */

function getStandardTime(words){

if(words <= 300)
return "1–3 hrs";

if(words <= 1000)
return "3–6 hrs";

if(words <= 3000)
return "6–12 hrs";

return "12–24 hrs";

}


function getExpressTime(words){

if(words <= 300)
return "30–60 mins";

if(words <= 1000)
return "1–3 hrs";

if(words <= 3000)
return "3–6 hrs";

return "6–12 hrs";

}



/* CREATE JOB */

const job = {

id: Date.now(),

originalText: text,

words,

standardPrice,

expressPrice,

standardTime:
getStandardTime(words),

expressTime:
getExpressTime(words),

status:"QUOTE",

accepted:[],

submissions:[],

winner:null,

created:Date.now()

};


jobs.push(job);



res.json({

success:true,

job

});


}
catch(error){

console.log(error);

res.status(500).json({
error:error.message
});

}

});



/* =====================================
GET JOBS
===================================== */

app.get("/jobs", (req, res) => {

res.json({

jobs

});

});



/* =====================================
ACCEPT JOB
===================================== */

app.post("/accept", (req, res) => {

const { jobId, translator } = req.body;

const job =
jobs.find(j => j.id == jobId);


if(!job){

return res.status(404).json({
error:"Job not found"
});

}


if(job.accepted.length >= 3){

return res.json({
error:"Already full"
});

}


job.accepted.push({

name:translator,

time:Date.now()

});


job.status="IN_PROGRESS";


res.json({

success:true

});

});



/* =====================================
SUBMIT TRANSLATION
===================================== */

app.post("/submit", async (req, res) => {

try{

const {

jobId,
translator,
translation,
ndaSigned

} = req.body;


const job =
jobs.find(j => j.id == jobId);


if(!job){

return res.status(404).json({
error:"Job not found"
});

}


if(!ndaSigned){

return res.status(400).json({
error:"NDA required"
});

}



/* QUALITY CHECK */

const quality =
await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{
role:"system",
content:
"Score translation 0 to 100. Reply number only."
},

{
role:"user",
content:

"Original:\n"+
job.originalText+

"\n\nTranslation:\n"+
translation

}

]

});


const score =
parseInt(
quality.choices[0]
.message.content
);



const submission = {

translator,

translation,

score,

time:Date.now(),

accepted:score>=85

};


job.submissions.push(submission);



/* WINNER */

if(submission.accepted && !job.winner){

job.winner = translator;

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

console.log(error);

res.status(500).json({
error:error.message
});

}

});



/* =====================================
GET JOB DETAILS
===================================== */

app.get("/job/:id", (req, res) => {

const job =
jobs.find(j => j.id == req.params.id);


res.json({

job

});

});



/* =====================================
SERVER
===================================== */

const PORT =
process.env.PORT || 4000;


app.listen(PORT, () => {

console.log(

"SayBon Production Running on port " + PORT

);

});