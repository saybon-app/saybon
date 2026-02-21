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
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value);
  }

  if (ext === ".pdf") {
    const result = await pdf(buffer);
    return normalizeText(result.text);
  }

  if (ext === ".txt") {
    const txt = fs.readFileSync(filePath, "utf8");
    return normalizeText(txt);
  }

  throw new Error("Unsupported file");
};
