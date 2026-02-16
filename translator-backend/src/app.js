require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());


// -----------------------------
// ROOT PAGE (FIXES YOUR ERROR)
// -----------------------------

app.get("/", (req, res) => {

res.send("SayBon Production Backend Running");

});


// -----------------------------
// JOB STORAGE (temporary)
// -----------------------------

const jobs = [];


// -----------------------------
// OPENAI
// -----------------------------

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});


// -----------------------------
// CREATE JOB
// -----------------------------

app.post("/upload", async (req, res) => {

try {

const { text } = req.body;

if (!text) {

return res.status(400).json({
error: "No text provided"
});

}


// PHASE 1 TRANSLATION

const completion =
await openai.chat.completions.create({

model: "gpt-4o-mini",

messages: [

{
role: "system",
content: "Translate to French"
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

phase1: phase1,

status: "OPEN",

accepted: [],

submissions: [],

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



// -----------------------------
// VIEW JOBS
// -----------------------------

app.get("/jobs", (req, res) => {

res.json({

jobs

});

});




// -----------------------------

const PORT = 4000;


app.listen(PORT, () => {

console.log("SayBon Production Running");

});
