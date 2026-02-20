import mammoth from "mammoth";
import pdf from "pdf-parse";
import fs from "fs";

export const extractText = async(filePath)=>{


const buffer = fs.readFileSync(filePath);


if(filePath.endsWith(".docx")){

const result = await mammoth.extractRawText({buffer});

return result.value;

}


if(filePath.endsWith(".pdf")){

const result = await pdf(buffer);

return result.text;

}


throw new Error("Unsupported file");


}