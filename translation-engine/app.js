import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();

app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {

  res.send("SayBon Translation Engine is running");

});


app.post("/api/translate", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: "No file uploaded"
      });

    }

    const text = req.file.buffer.toString();

    const translation = text;

    res.json({
      translation
    });

  }

  catch (err) {

    res.status(500).json({
      error: "Translation failed"
    });

  }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});

