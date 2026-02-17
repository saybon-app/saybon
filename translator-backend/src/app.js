require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// EMAIL SYSTEM
// =====================================

const transporter = nodemailer.createTransport({

service: "gmail",

auth: {

user: process.env.EMAIL_USER,

pass: process.env.EMAIL_PASS

}

});


// =====================================
// OPENAI
// =====================================

const openai = new OpenAI({

apiKey: process.env.OPENAI_API_KEY

});


// =====================================
// DATABASE (temporary memory)
// =====================================

const translators = [];

const jobs = [];


// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {

res.send("SayBon Translator System Running");

});


// =====================================
// GENERATE PASSCODE
// =====================================

function generatePasscode(){

return crypto.randomBytes(4).toString("hex");

}



// =====================================
// REGISTER TRANSLATOR
// =====================================

app.post("/api/register", async (req, res) => {

try{

const {

name,
email,
country,
background,
translation

} = req.body;



if(
!name ||
!email ||
!country ||
!background ||
!translation
){

return res.status(400).json({

error: "Missing fields"

});

}



// ============================
// QUALITY TEST
// ============================

const result =
await openai.chat.completions.create({

model: "gpt-4o-mini",

messages:[

{

role:"system",

content:

"Score this translation from 0 to 100. Reply number only."

},

{

role:"user",

content: translation

}

]

});



const score =
parseInt(
result.choices[0].message.content
);



// ============================
// QUALIFIED
// ============================

if(score >= 70){

const passcode =
generatePasscode();



translators.push({

name,
email,
passcode,
approved:true

});



await transporter.sendMail({

from: process.env.EMAIL_USER,

to: email,

subject: "SayBon Translator Approval",

html: `

<h2>Welcome to SayBon</h2>

<p>You have been approved.</p>

<p>Your passcode:</p>

<h1>${passcode}</h1>

<p>Use it to access jobs.</p>

`

});


res.json({

success:true

});



}else{


await transporter.sendMail({

from: process.env.EMAIL_USER,

to: email,

subject: "SayBon Translator Application Update",

html:

`

<p>Thank you for applying.</p>

<p>Unfortunately you were not approved.</p>

`

});


res.json({

success:true

});


}


}catch(error){

console.log(error);

res.status(500).json({

error:error.message

});

}


});




// =====================================
// LOGIN
// =====================================

app.post("/api/login", (req, res)=>{

const { passcode } = req.body;


const translator =
translators.find(

t => t.passcode == passcode

);


if(!translator){

return res.status(401).json({

error:"Invalid passcode"

});

}


res.json({

success:true,

translator:translator.name

});


});




// =====================================
// CREATE JOB
// =====================================

app.post("/upload", async (req, res)=>{

try{

const { text } = req.body;


const completion =
await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{

role:"system",

content:"Translate to French professionally"

},

{

role:"user",

content:text

}

]

});


const phase1 =
completion.choices[0].message.content;



const job = {

id: Date.now(),

originalText:text,

phase1:phase1,

accepted:[],

submissions:[],

winner:null,

status:"OPEN"

};


jobs.push(job);


res.json({

success:true,

job

});


}catch(error){

res.status(500).json({

error:error.message

});

}

});




// =====================================
// GET JOBS
// =====================================

app.get("/jobs",(req,res)=>{

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
jobs.find(

j=>j.id==jobId

);


if(job.accepted.length>=3){

return res.json({

error:"Full"

});

}


job.accepted.push({

name:translator,

time:Date.now()

});


res.json({

success:true

});


});




// =====================================
// SUBMIT
// =====================================

app.post("/submit", async (req,res)=>{

try{


const {

jobId,
translator,
translation,
ndaSigned

} = req.body;



if(!ndaSigned){

return res.json({

error:"NDA required"

});

}



const job =
jobs.find(

j=>j.id==jobId

);



// =================
// QUALITY
// =================

const quality =
await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{

role:"system",

content:"Score translation 0 to 100. Reply number only"

},

{

role:"user",

content:translation

}

]

});


const score =
parseInt(

quality.choices[0].message.content

);



// =================
// SAVE
// =================

job.submissions.push({

translator,
translation,
score

});



// =================
// WINNER
// =================

if(score>=85 && !job.winner){

job.winner=translator;

job.status="COMPLETED";

}



res.json({

success:true,

score,
winner:job.winner

});


}catch(error){

res.status(500).json({

error:error.message

});

}


});




// =====================================
// SERVER
// =====================================

const PORT =
process.env.PORT || 4000;


app.listen(PORT, ()=>{

console.log(

"SayBon Translator System Running"

);

});

