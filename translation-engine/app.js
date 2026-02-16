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


// -----------------------------
// FILE UPLOAD CONFIG
// -----------------------------

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});


// -----------------------------
// OPENAI INIT
// -----------------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// -----------------------------
// FILE TEXT EXTRACTION
// -----------------------------

async function extractText(filePath, originalName) {

  const lower = originalName.toLowerCase();

  if (lower.endsWith(".txt")) {

    return fs.readFileSync(filePath, "utf8");

  }

  if (lower.endsWith(".pdf")) {

    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;

  }

  if (lower.endsWith(".docx")) {

    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;

  }

  throw new Error("Unsupported file type");

}


// -----------------------------
// SAFE CHUNK TRANSLATION ENGINE
// -----------------------------

async function translateText(text) {

  const MAX_CHARS = 4000;

  const chunks = [];

  for (let i = 0; i < text.length; i += MAX_CHARS) {

    chunks.push(text.slice(i, i + MAX_CHARS));

  }

  let finalTranslation = "";

  for (const chunk of chunks) {

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: [

          {
            role: "system",
            content:
              "Translate the following text to French only. Preserve formatting exactly.",
          },

          {
            role: "user",
            content: chunk,
          },

        ],

      });

    finalTranslation +=
      completion.choices[0].message.content;

  }

  return finalTranslation;

}


// -----------------------------
// TRANSLATE ROUTE
// -----------------------------

app.post(
  "/api/translate",
  upload.single("file"),
  async (req, res) => {

    let filePath = null;

    try {

      if (!req.file) {

        return res.status(400).json({
          error: "No file uploaded",
        });

      }

      filePath = req.file.path;

      const text =
        await extractText(
          filePath,
          req.file.originalname
        );


      if (!text || text.trim() === "") {

        throw new Error(
          "File contains no readable text"
        );

      }


      const translation =
        await translateText(text);


      res.json({

        translation: translation,

      });

    }

    catch (error) {

      console.error("FULL ERROR:", error);

      res.status(500).json({

        error: error.message,

        details:
          error.response?.data || null,

      });

    }

    finally {

      // cleanup uploaded file

      if (filePath && fs.existsSync(filePath)) {

        fs.unlinkSync(filePath);

      }

    }

  }
);


// -----------------------------
// HEALTH CHECK ROUTE
// -----------------------------

app.get("/", (req, res) => {

  res.send("SayBon Translation Engine Running");

});


// -----------------------------
// START SERVER
// -----------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "SayBon Translation Engine running on port " + PORT
  );

});
