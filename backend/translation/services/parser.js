import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export async function extractText(filePath, mimeType, originalName){

    const ext = path.extname(originalName || "").toLowerCase();

    if(mimeType.includes("text") || ext === ".txt"){

        return await fs.readFile(filePath,"utf8");

    }

    if(mimeType.includes("pdf") || ext === ".pdf"){

        const pdfParse = require("pdf-parse");

        const buffer = await fs.readFile(filePath);

        const data = await pdfParse(buffer);

        return data.text;

    }

    if(ext === ".docx"){

        const result = await mammoth.extractRawText({path:filePath});

        return result.value;

    }

    return await fs.readFile(filePath,"utf8");

}

export function countWords(text){

    if(!text) return 0;

    return text
    .replace(/\s+/g," ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .length;

}
