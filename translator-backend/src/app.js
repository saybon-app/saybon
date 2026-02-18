const express = require("express");
const cors = require("cors");
const multer = require("multer");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());



/* ROOT ROUTE */

app.get("/", (req, res) => {

res.send("SayBon Translator System Running");

});



/* MULTER */

const upload = multer({

dest: "uploads/"

});



/* WORD COUNT FUNCTION */

async function extractText(filePath, mime){

if(mime === "application/pdf"){

const buffer = fs.readFileSync(filePath);

const data = await pdfParse(buffer);

return data.text;

}


if(mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){

const result = await mammoth.extractRawText({

path: filePath

});

return result.value;

}


return fs.readFileSync(filePath,"utf8");

}



/* DELIVERY TIME */

function getDelivery(words,type){

if(type==="standard"){

if(words<=300) return "1–3 hrs";

if(words<=1000) return "3–6 hrs";

if(words<=3000) return "6–12 hrs";

return "12–24 hrs";

}


if(type==="express"){

if(words<=300) return "30–60 mins";

if(words<=1000) return "1–3 hrs";

if(words<=3000) return "3–6 hrs";

return "6–12 hrs";

}

}



/* REQUEST ENDPOINT */

app.post("/request", upload.single("file"), async (req,res)=>{

try{

const text = await extractText(

req.file.path,

req.file.mimetype

);


const words = text.trim().split(/\s+/).length;


const standardPrice = words * 0.025;

const expressPrice = words * 0.05;


res.json({

job:{

words,

standardPrice,

expressPrice,

standardTime:

getDelivery(words,"standard"),

expressTime:

getDelivery(words,"express")

}

});



}catch(e){

console.log(e);

res.status(500).json({

error:"Processing failed"

});

}

});



/* IMPORTANT — THIS FIXES RAILWAY */

const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{

console.log("Server running on port",PORT);

});