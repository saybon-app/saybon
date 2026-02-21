import fs from "fs";
import { extractText } from "../services/fileParser.js";
import { countWords } from "../utils/wordCounter.js";

export const uploadRequest = async (req, res) => {
  let uploadedPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    uploadedPath = req.file.path;

    const text = await extractText(uploadedPath, req.file.originalname);
    const words = countWords(text);

    const standardPrice = Number((words * 0.025).toFixed(2));
    const expressPrice = Number((words * 0.05).toFixed(2));

    return res.json({
      success: true,
      words,
      standardPrice,
      expressPrice,
    });
  } catch (e) {
    console.error("uploadRequest error:", e);

    return res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  } finally {
    // Always clean up uploads
    try {
      if (uploadedPath && fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    } catch (cleanupErr) {
      console.error("Upload cleanup error:", cleanupErr);
    }
  }
};
