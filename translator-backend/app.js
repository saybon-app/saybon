const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("SayBon Backend Running");
});

app.post("/request", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const pdfData = await pdfParse(req.file.buffer);

    const words = pdfData.text.trim().split(/\s+/).length;

    const standardPrice = words * 0.12;
    const expressPrice = words * 0.18;

    res.json({
      success: true,
      words,
      standardPrice,
      expressPrice
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
