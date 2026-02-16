
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
});


let jobs = [];



// ----------------------------
// PHASE 1 TRANSLATION
// ----------------------------

app.post("/phase1/upload", upload.single("file"), async (req, res) => {

 try {

  const text = fs.readFileSync(req.file.path, "utf8");

  const completion = await openai.chat.completions.create({

   model: "gpt-4o-mini",

   messages: [

    {
     role: "system",
     content:
      "Translate to French professionally.",
    },

    {
     role: "user",
     content: text,
    },

   ],

  });

  const translation =
   completion.choices[0].message.content;


  const job = {

   id: Date.now(),

   phase1Result: translation,

   status: "OPEN",

   translators: [],

   created: new Date(),

   payout: 50,

   deadlineHours: 24,

  };


  jobs.push(job);


  res.json({

   message: "Phase 1 complete",

   job,

  });

 } catch (err) {

  console.log(err);

  res.status(500).json({

   error: err.message,

  });

 }

});



// ----------------------------
// GET JOBS FOR TRANSLATORS
// ----------------------------

app.get("/translator/jobs", (req, res) => {

 res.json(jobs);

});




// ----------------------------

app.get("/", (req, res) => {

 res.send("SayBon Backend Running");

});



const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {

 console.log("Server running on port " + PORT);

});



