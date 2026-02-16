import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;


// ROOT TEST ROUTE
app.get("/", (req, res) => {

  res.send("SayBon Translation Engine is running");

});


// TRANSLATE ROUTE
app.post("/api/translate", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: "No file uploaded"
      });

    }

    const text = req.file.buffer.toString("utf8");


    // TEMP translation simulation
    const translation = "TRANSLATED:\n\n" + text;


    res.json({
      translation
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Translation failed"
    });

  }

});



app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
