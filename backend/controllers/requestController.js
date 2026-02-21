import fs from "fs";
import { extractText } from "../services/fileParser.js";
import { countWords } from "../utils/wordCounter.js";

export const uploadRequest = async (req, res) => {
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
  } catch (e) {
    console.error("uploadRequest error:", e);
    return res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  } finally {
    // cleanup uploaded file
    try {
      if (uploadedPath && fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    } catch (cleanupErr) {
      console.error("cleanup error:", cleanupErr);
    }
  }
};
