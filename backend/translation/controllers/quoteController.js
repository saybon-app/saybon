import fs from "fs/promises";

import {extractText,countWords} from "../services/parser.js";

import {calculateQuote} from "../services/pricing.js";

export async function createQuote(req,res){

try{

if(!req.file){

return res.status(400).json({error:"No file uploaded"});

}

const text = await extractText(

req.file.path,

req.file.mimetype,

req.file.originalname

);

const words = countWords(text);

const quote = calculateQuote(words);

await fs.unlink(req.file.path);

res.json({

success:true,

...quote

});

}

catch(err){

console.log(err);

res.status(500).json({

error:"Quote failed"

});

}

}
