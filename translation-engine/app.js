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


    // ✅ CORRECT OPENAI CALL

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: [

          {
            role: "system",
            content:
              "Translate the following text to French only.",
          },

          {
            role: "user",
            content: text,
          },

        ],

      });


    res.json({

      translation:
        completion.choices[0].message.content,

    });


  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Translation failed",

    });

  }

});


// -----------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
