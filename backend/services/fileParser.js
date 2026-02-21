import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * Extract raw text from an uploaded file path.
 * Supports: txt, pdf, docx
 */
export async function extractText(filePath, mimeType = "", originalName = "") {
  const ext = (path.extname(originalName || filePath || "") || "").toLowerCase();

  // TXT (or unknown but mime says text)
  if (ext === ".txt" || mimeType.startsWith("text/")) {
    return await fs.readFile(filePath, "utf8");
  }

  // DOCX
  if (ext === ".docx" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result?.value || "";
  }

  // PDF
  if (ext === ".pdf" || mimeType === "application/pdf") {
    // pdf-parse is CommonJS; ESM-safe import via createRequire
    const pdfParse = require("pdf-parse");
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data?.text || "";
  }

  // Fallback: try reading as utf8 text
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

/**
 * Word counter that works reliably for normal docs.
 */
export function countWords(text = "") {
  const cleaned = String(text)
    .replace(/\u00A0/g, " ")     // nbsp
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return 0;

  // Count tokens that contain at least one letter/number
  const tokens = cleaned.split(" ").filter(t => /[A-Za-z0-9]/.test(t));
  return tokens.length;
}
