import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractText(filePath, mimeType) {

  if (mimeType === "text/plain") {
    return fs.readFileSync(filePath, "utf8");
  }

  if (mimeType === "application/pdf") {

    const buffer = fs.readFileSync(filePath);

    const data = await pdfParse(buffer);

    return data.text;
  }

  throw new Error("Unsupported file type");

}

export function countWords(text) {

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

}
