import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("SayBon Translation Engine is running");
});

app.post("/api/translate", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // fake translation test
    res.json({
      translation: "Translation successful. Engine is working."
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Engine running on port " + PORT);
});

