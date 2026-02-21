import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

function countWordsFromText(text) {
  if (!text) return 0;
  const cleaned = text
    .replace(/\u00A0/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

async function parseTxt(filePath) {
  const buf = await fs.readFile(filePath);
  // handle utf8 + remove BOM if present
  let text = buf.toString("utf8").replace(/^\uFEFF/, "");
  return { text, words: countWordsFromText(text) };
}

async function parsePdf(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  const text = (data && data.text) ? data.text : "";
  return { text, words: countWordsFromText(text) };
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = (result && result.value) ? result.value : "";
  return { text, words: countWordsFromText(text) };
}

export async function parseFileToWordCount(file) {
  // file can be from multer: { path, originalname, mimetype }
  const filePath = file?.path;
  const original = (file?.originalname || "").toLowerCase();
  const ext = path.extname(original);

  if (!filePath) return { words: 0, text: "" };

  // prefer extension, fallback to mimetype
  if (ext === ".txt") return await parseTxt(filePath);
  if (ext === ".pdf") return await parsePdf(filePath);
  if (ext === ".docx") return await parseDocx(filePath);

  // fallback by mimetype
  const mt = (file?.mimetype || "").toLowerCase();
  if (mt.includes("text/plain")) return await parseTxt(filePath);
  if (mt.includes("pdf")) return await parsePdf(filePath);
  if (mt.includes("word") || mt.includes("officedocument")) return await parseDocx(filePath);

  // last resort: try utf8 text
  return await parseTxt(filePath);
}
