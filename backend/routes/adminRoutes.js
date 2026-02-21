import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { extractText } from "../services/fileParser.js";
import { countWords } from "../utils/wordCounter.js";

const router = express.Router();

// local temp upload (keeps original extension)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, dmin_upload_);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.post("/request", upload.single("file"), async (req, res) => {
  const uploadedPath = req?.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const text = await extractText(req.file.path, req.file.originalname);
    const words = countWords(text);

    const standardPrice = Number((words * 0.025).toFixed(2));
    const expressPrice = Number((words * 0.05).toFixed(2));

    return res.json({
      success: true,
      words,
      standardPrice,
      expressPrice,
    });
  } catch (err) {
    console.error("admin /request error:", err);
    return res.status(500).json({ success: false, message: "Processing failed" });
  } finally {
    try {
      if (uploadedPath && fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    } catch (e) {
      console.error("cleanup error:", e);
    }
  }
});

export default router;

