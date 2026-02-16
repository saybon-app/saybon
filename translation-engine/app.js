require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const OpenAI = require("openai");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// -----------------------------
// FILE TEXT EXTRACTION
// -----------------------------

async function extractText(filePath, originalName) {

  if (originalName.endsWith(".txt")) {
    return fs.readFileSync(filePath, "utf8");
  }

  if (originalName.endsWith(".pdf")) {
    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;
  }

  if (originalName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file type");

}


// -----------------------------
// TEXT CHUNKER (prevents overload)
// -----------------------------

function splitText(text, maxLength = 3000) {

  const chunks = [];

  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }

  return chunks;

}


// -----------------------------
// TRANSLATE ROUTE
// -----------------------------

app.post("/api/translate", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const text = await extractText(
      req.file.path,
      req.file.originalname
    );


    const chunks = splitText(text);

let fullTranslation = "";

for (const chunk of chunks) {

  const completion =
    await openai.chat.completions.create({

      model: "gpt-4o-mini",

      temperature: 0,

      messages: [

        {
          role: "system",
          content:
            `You are an elite legal translator.

Translate EVERYTHING to French.

Rules:

- Output ONLY French
- Never output English
- Preserve formatting
- Preserve line breaks
- Preserve structure
- Translate fully
- Never skip anything

French translation:`,
        },

        {
          role: "user",
          content: chunk,
        },

      ],

    });

  fullTranslation += completion.choices[0].message.content + "\n";

}

    res.json({

      translation: fullTranslation,

    });


  }

  catch (error) {

    console.error("FULL ERROR:", error);

    res.status(500).json({

      error: error.message,

      details: error.response?.data || null

    });

  }

});


// -----------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
