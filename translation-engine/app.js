// --------------------------------------------
// SAYBON TRANSLATION ENGINE
// File-only Translation Engine
// Supports: TXT, PDF, DOCX
// Railway Ready
// --------------------------------------------

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const fs = require("fs");
const path = require("path");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const OpenAI = require("openai");


// --------------------------------------------
// INIT
// --------------------------------------------

const app = express();

app.use(cors());


// --------------------------------------------
// OPENAI
// --------------------------------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// --------------------------------------------
// MULTER CONFIG
// --------------------------------------------

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});


// --------------------------------------------
// TEXT EXTRACTION
// --------------------------------------------

async function extractText(filePath, originalName) {

  const ext = path.extname(originalName).toLowerCase();


  // TXT
  if (ext === ".txt") {

    return fs.readFileSync(filePath, "utf8");

  }


  // PDF
  if (ext === ".pdf") {

    const buffer = fs.readFileSync(filePath);

    const data = await pdfParse(buffer);

    return data.text;

  }


  // DOCX
  if (ext === ".docx") {

    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;

  }


  throw new Error("Unsupported file type");

}



// --------------------------------------------
// TRANSLATION
// --------------------------------------------

async function translateText(text, target) {

  const response = await openai.chat.completions.create({

    model: "gpt-4o-mini",

    messages: [

      {
        role: "system",
        content: `Translate the following text into ${target}. Only return the translation.`,
      },

      {
        role: "user",
        content: text,
      },

    ],

  });

  return response.choices[0].message.content;

}



// --------------------------------------------
// ROUTE
// --------------------------------------------

app.post("/api/translate", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: "No file uploaded",
      });

    }


    const target = req.body.target || "fr";


    // extract text
    const text = await extractText(

      req.file.path,

      req.file.originalname

    );


    // translate
    const translation = await translateText(

      text,

      target

    );


    // delete uploaded file
    fs.unlinkSync(req.file.path);


    // return result
    res.json({

      translation,

    });


  } catch (err) {

    console.error(err);

    res.status(500).json({

      error: "Translation failed",

    });

  }

});




// --------------------------------------------
// HEALTH CHECK
// --------------------------------------------

app.get("/", (req, res) => {

  res.send("SayBon Translation Engine Running");

});




// --------------------------------------------
// START SERVER
// --------------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("SayBon Translation Engine running on port", PORT);

});
