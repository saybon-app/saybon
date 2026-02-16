const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());


// OpenAI

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// storage

const upload = multer({
  dest: "storage/"
});


// test route

app.get("/", (req, res) => {

  res.send("SayBon Translation Engine Running");

});


// TRANSLATE ROUTE

app.post("/translate", upload.single("file"), async (req, res) => {

  try {

    const filePath = req.file.path;

    const text = fs.readFileSync(filePath, "utf8");


    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content:
            "You are a professional French-English translator. Translate perfectly."
        },

        {
          role: "user",
          content: text
        }
      ]
    });


    const translation =
      completion.choices[0].message.content;


    res.json({

      success: true,

      translation: translation

    });


  } catch (error) {

    console.log(error);

    res.json({

      success: false

    });

  }

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SayBon Engine running on port " + PORT);
});
