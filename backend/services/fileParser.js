import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdf = require("pdf-parse");

import mammoth from "mammoth";


export async function extractText(file){

const name = file.originalname.toLowerCase();


/* PDF */

if(name.endsWith(".pdf")){

const data = await pdf(file.buffer);

return data.text;

}


/* DOCX */

if(name.endsWith(".docx")){

const data = await mammoth.extractRawText({

buffer:file.buffer

});

return data.value;

}


/* TXT */

return file.buffer.toString("utf8");

}