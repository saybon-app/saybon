import fs from "fs/promises";
import { getWordCountFromFile } from "../services/fileParser.js";

function getDelivery(wordCount, tier) {
  if (tier === "standard") {
    if (wordCount <= 300) return "1–3 hrs";
    if (wordCount <= 1000) return "3–6 hrs";
    if (wordCount <= 3000) return "6–12 hrs";
    if (wordCount <= 5000) return "12–24 hrs";
    return "24+ hrs";
  }

  // express
  if (wordCount <= 300) return "30–60 mins";
  if (wordCount <= 1000) return "1–3 hrs";
  if (wordCount <= 3000) return "3–6 hrs";
  if (wordCount <= 5000) return "6–12 hrs";
  return "12+ hrs";
}

export async function handleQuoteRequest(req, res) {
  const uploadedPath = req.file?.path;
  const mimeType = req.file?.mimetype || "";
  const originalName = req.file?.originalname || "";

  if (!uploadedPath) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const wordCount = await getWordCountFromFile(uploadedPath, mimeType, originalName);

    const standardRate = 0.025;
    const expressRate = 0.05;

    const standardPrice = +(wordCount * standardRate).toFixed(2);
    const expressPrice = +(wordCount * expressRate).toFixed(2);

    return res.json({
      success: true,
      wordCount,
      standard: {
        rate: standardRate,
        price: standardPrice,
        delivery: getDelivery(wordCount, "standard"),
      },
      express: {
        rate: expressRate,
        price: expressPrice,
        delivery: getDelivery(wordCount, "express"),
      },
    });
  } catch (err) {
    console.error("❌ Quote error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to extract text / count words",
    });
  } finally {
    try {
      await fs.unlink(uploadedPath);
    } catch {}
  }
}
