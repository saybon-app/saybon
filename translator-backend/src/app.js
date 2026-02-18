require("dotenv").config();

const express = require("express");
const cors = require("cors");

const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();

app.use(cors());
app.use(express.json());



/* =========================
   MULTER CONFIG
========================= */

const upload = multer({

storage: multer.memoryStorage(),

limits:{
fileSize: 10 * 1024 * 1024
}

});



/* =========================
   ROOT
========================= */

app.get("/", (req,res)=>{

res.send("SayBon Backend Running");

});



/* =========================
   REQUEST QUOTE
========================= */

app.post("/request", upload.single("file"), async (req,res)=>{

try{


if(!req.file){

return res.status(400).json({
error:"NO_FILE"
});

}


let text = "";


/* =========================
   READ FILE
========================= */


if(req.file.mimetype === "application/pdf"){

const data = await pdfParse(req.file.buffer);

text = data.text;

}


else if(

req.file.mimetype ===
"application/vnd.openxmlformats-officedocument.wordprocessingml.document"

){

const result =
await mammoth.extractRawText({

buffer:req.file.buffer

});

text = result.value;

}


else{

text = req.file.buffer.toString();

}



/* =========================
   WORD COUNT
========================= */


const words =
text.trim().split(/\s+/).length;



/* =========================
   PRICING
========================= */


const standardPrice =
words * 0.025;


const expressPrice =
words * 0.05;



/* =========================
   TIME CALC
========================= */


function standardTime(words){

if(words<=300)
return "1–3 hrs";

if(words<=1000)
return "3–6 hrs";

if(words<=3000)
return "6–12 hrs";

return "12–24 hrs";

}


function expressTime(words){

if(words<=300)
return "30–60 mins";

if(words<=1000)
return "1–3 hrs";

if(words<=3000)
return "3–6 hrs";

return "6–12 hrs";

}



/* =========================
   RESPONSE
========================= */


const job = {

words,

standardPrice,

expressPrice,

standardTime:
standardTime(words),

expressTime:
expressTime(words)

};



res.json({

success:true,

job

});


}
catch(err){

console.log(err);

res.status(500).json({

error:"SERVER_ERROR"

});

}


});



/* =========================
   SERVER
========================= */


const PORT =
process.env.PORT || 4000;


app.listen(PORT, ()=>{

console.log("Server running");

});

