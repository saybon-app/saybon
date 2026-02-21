import { extractText, countWords } from "../services/fileParser.js";

export async function handleQuoteRequest(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const text = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    const words = countWords(text);

    return res.json({
      success: true,
      words,
      filename: req.file.originalname,
      mimeType: req.file.mimetype
    });
  } catch (err) {
    console.error("Quote processing failed:", err);
    return res.status(500).json({ success: false, message: "Processing failed" });
  }
}
