import mammoth from "mammoth";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

function normalizeText(s) {
  if (!s) return "";
  return String(s)
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const extractText = async (filePath, originalName = "") => {
  const buffer = fs.readFileSync(filePath);

  // Prefer original filename extension; fall back to saved filename extension
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (ext === ".txt") {
    const txt = fs.readFileSync(filePath, "utf8");
    return normalizeText(txt);
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value);
  }

  if (ext === ".pdf") {
    const result = await pdf(buffer);
    return normalizeText(result.text);
  }

  throw new Error("Unsupported file type");
};
