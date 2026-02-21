import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


function normalizeText(input = "") {

  return String(input)

    .replace(/\r\n/g, " ")

    .replace(/\n/g, " ")

    .replace(/\s+/g, " ")

    .trim();

}


export function countWords(text) {

  if (!text) return 0;

  return normalizeText(text)

    .split(" ")

    .filter(Boolean).length;

}



export async function extractText(filePath, mimeType = "", originalName = "") {

  const ext = path.extname(originalName || "").toLowerCase();

  const buffer = await fs.readFile(filePath);



  if (mimeType.includes("text") || ext === ".txt")

    return buffer.toString("utf8");



  if (mimeType.includes("pdf") || ext === ".pdf") {

    const data = await pdfParse(buffer);

    return data.text;

  }



  if (

    mimeType.includes("word") ||

    ext === ".docx"

  ) {

    const result = await mammoth.extractRawText({ buffer });

    return result.value;

  }



  return buffer.toString("utf8");

}



export async function getWordCountFromFile(filePath, mimeType = "", originalName = "") {

  const text = await extractText(filePath, mimeType, originalName);

  return countWords(text);

}
