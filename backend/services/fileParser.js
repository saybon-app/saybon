import pdfParse from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";

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
