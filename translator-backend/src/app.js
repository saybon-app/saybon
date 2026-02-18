const express = require("express");
const cors = require("cors");
const multer = require("multer");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());



/* ROOT ROUTE — FIXES "Cannot GET /" */

app.get("/", (req, res) => {

res.send("SayBon Translator System Running");

});



/* MULTER SETUP */

const upload = multer({

dest: "uploads/"

});



/* WORD COUNT FUNCTION */

function countWords(text){

return text
.replace(/\s+/g," ")
.trim()
.split(" ")
.filter(word => word.length > 0)
.length;

}



/* DELIVERY TIME CALCULATOR */

function getDeliveryTimes(words){

let standard = "";
let express = "";


/* STANDARD */

if(words <= 300){

standard = "1–3 hrs";

}
else if(words <= 1000){

standard = "3–6 hrs";

}
else if(words <= 3000){

standard = "6–12 hrs";

}
else if(words <= 5000){

standard = "12–24 hrs";

}
else{

standard = "24–48 hrs";

}



/* EXPRESS */

if(words <= 300){

express = "30–60 mins";

}
else if(words <= 1000){

express = "1–3 hrs";

}
else if(words <= 3000){

express = "3–6 hrs";

}
else if(words <= 5000){

express = "6–12 hrs";

}
else{

express = "12–24 hrs";

}


return {

standard,
express

};

}



/* REQUEST ENDPOINT */

app.post("/request", upload.single("file"), async (req, res) => {

try{


if(!req.file){

return res.status(400).json({

error: "No file uploaded"

});

}


const filePath = req.file.path;

const ext = req.file.originalname.split(".").pop().toLowerCase();


let text = "";



/* PDF */

if(ext === "pdf"){

const dataBuffer = fs.readFileSync(filePath);

const pdfData = await pdfParse(dataBuffer);

text = pdfData.text;

}



/* DOCX */

else if(ext === "docx"){

const result = await mammoth.extractRawText({

path: filePath

});

text = result.value;

}



/* TXT */

else if(ext === "txt"){

text = fs.readFileSync(filePath,"utf8");

}



else{

return res.status(400).json({

error: "Unsupported file type"

});

}



/* WORD COUNT */

const words = countWords(text);



/* PRICING */

const standardPrice = words * 0.025;

const expressPrice = words * 0.05;



/* DELIVERY */

const times = getDeliveryTimes(words);



/* DELETE FILE AFTER PROCESS */

fs.unlinkSync(filePath);



/* RESPONSE */

res.json({

job: {

words,

standardPrice,

expressPrice,

standardTime: times.standard,

expressTime: times.express

}

});


}
catch(error){

console.log(error);

res.status(500).json({

error: "Processing failed"

});

}


});



/* START SERVER */

const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {

console.log("Server running on port " + PORT);

});
