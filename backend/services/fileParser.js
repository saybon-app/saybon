import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export async function extractText(filePath, mimeType = "", originalName = "") {
  const ext = path.extname(originalName || filePath).toLowerCase();

  // TXT
  if (mimeType === "text/plain" || ext === ".txt" || mimeType.startsWith("text/")) {
    return await fs.readFile(filePath, "utf8");
  }

  // PDF
  if (mimeType === "application/pdf" || ext === ".pdf") {
    const pdfParse = require("pdf-parse"); // CommonJS -> ESM via createRequire
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data?.text || "";
  }

  // DOCX
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const mammoth = require("mammoth"); // CommonJS fallback safe
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || "";
  }

  // Fallback: try as utf8 text
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export function countWords(text = "") {
  const cleaned = String(text)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return 0;

  return cleaned.split(" ").filter(Boolean).length;
}

export async function getWordCountFromFile(filePath, mimeType = "", originalName = "") {
  const text = await extractText(filePath, mimeType, originalName);
  return countWords(text);
}
