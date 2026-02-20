import { extractText } from "../services/fileParser.js";

export async function requestQuote(req,res){

try{

if(!req.file){

return res.status(400).json({
success:false,
error:"No file uploaded"
});

}

const text=await extractText(req.file);

const words=text.trim().split(/\s+/).length;

res.json({
success:true,
words
});

}catch(error){

console.log(error);

res.status(500).json({
success:false
});

}

}
