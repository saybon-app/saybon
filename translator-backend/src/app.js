require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const multer = require("multer");
const fs = require("fs");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();

app.use(cors());
app.use(express.json());



/* STORAGE */

const upload = multer({
dest:"uploads/"
});



/* ROOT */

app.get("/", (req,res)=>{

res.send("SayBon Backend Running");

});



/* DATABASE */

const jobs = [];



/* OPENAI */

const openai = new OpenAI({

apiKey:process.env.OPENAI_API_KEY

});



/* WORD COUNT FUNCTION */

async function getWordCount(path, type){

try{

if(type.includes("pdf")){

const data = await pdfParse(

fs.readFileSync(path)

);

return data.text.split(/\s+/).length;

}


if(type.includes("word")){

const result = await mammoth.extractRawText({

path

});

return result.value.split(/\s+/).length;

}


return 0;

}

catch{

return 0;

}

}



/* CREATE JOB FROM UPLOAD */

app.post("/request",

upload.single("file"),

async(req,res)=>{


try{


const file = req.file;


const words = await getWordCount(

file.path,

file.mimetype

);



const price = words * 0.025;



const job = {


id:Date.now(),

file:file.filename,

words,

price,

status:"OPEN",

accepted:[],

submissions:[],

winner:null

};



jobs.push(job);



res.json({

success:true,

job

});


}


catch(e){

res.status(500).json({

error:e.message

});

}


});



/* GET JOBS */

app.get("/jobs",(req,res)=>{

res.json({

jobs

});

});



/* ACCEPT */

app.post("/accept",(req,res)=>{


const {jobId, translator} = req.body;


const job = jobs.find(

j=>j.id==jobId

);


if(!job)

return res.status(404).json({

error:"Not found"

});


if(job.accepted.length>=3)

return res.json({

error:"Closed"

});


job.accepted.push({

name:translator,

time:Date.now()

});


if(job.accepted.length==3)

job.status="IN_PROGRESS";


res.json({

success:true

});


});



/* SUBMIT */

app.post("/submit", async(req,res)=>{


try{


const {

jobId,

translator,

translation,

ndaSigned

} = req.body;



const job = jobs.find(

j=>j.id==jobId

);



if(!job)

return res.status(404).json({

error:"Not found"

});


if(!ndaSigned)

return res.status(400).json({

error:"NDA required"

});


const quality = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{

role:"system",

content:"Score translation 0-100 number only"

},

{

role:"user",

content:

"Original words:"+job.words+

"\n\nTranslation:"+translation

}

]

});


const score = parseInt(

quality.choices[0].message.content

);



const submission = {

translator,

translation,

score

};


job.submissions.push(submission);



if(score>=85 && !job.winner){

job.winner=translator;

job.status="COMPLETED";

}


res.json({

score,

winner:job.winner

});


}


catch(e){

res.status(500).json({

error:e.message

});

}


});



/* SERVER */

const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{

console.log("SayBon Production Running");

});
