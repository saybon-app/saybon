const express = require("express");
const cors = require("cors");
const multer = require("multer");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;



/*
ROOT ROUTE
*/
app.get("/", (req, res) => {

  res.send("SayBon Translator Backend Running");

});



/*
UPLOAD SETUP
*/
const upload = multer({

  dest: "uploads/"

});



/*
TEXT EXTRACTION FUNCTION
*/
async function extractText(filePath, mimetype) {

  try {

    // PDF
    if (mimetype === "application/pdf") {

      const data = await pdfParse(fs.readFileSync(filePath));
      return data.text;

    }


    // DOCX
    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

      const result = await mammoth.extractRawText({

        path: filePath

      });

      return result.value;

    }


    // TXT and others
    return fs.readFileSync(filePath, "utf8");

  }

  catch (error) {

    console.log("Extraction error:", error);
    throw error;

  }

}



/*
REQUEST ENDPOINT
*/
app.post("/request", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({

        success: false,
        message: "No file uploaded"

      });

    }


    const text = await extractText(

      req.file.path,
      req.file.mimetype

    );


    if (!text || text.trim().length === 0) {

      return res.status(400).json({

        success: false,
        message: "File contains no readable text"

      });

    }



    const words = text.trim().split(/\s+/).length;



    /*
    PRICING
    */

    const standardPrice = Number((words * 0.12).toFixed(2));

    const expressPrice = Number((words * 0.18).toFixed(2));



    res.json({

      success: true,
      words,
      standardPrice,
      expressPrice

    });



  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: "Server error"

    });

  }

});



/*
START SERVER
*/
app.listen(PORT, "0.0.0.0", () => {

  console.log(`SayBon Translator running on port ${PORT}`);

});
