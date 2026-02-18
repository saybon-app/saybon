require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();

app.use(cors());
app.use(express.json());


// STORAGE

const storage = multer.memoryStorage();

const upload = multer({
storage: storage
});


// ROOT

app.get("/", (req, res) => {

res.send("SayBon Translator System Running");

});




// WORD COUNT FUNCTION

function countWords(text){

return text
.trim()
.split(/\s+/)
.length;

}




// DELIVERY CALCULATOR

function getDelivery(words){

if(words <= 300){

return {

standard:"1–3 hrs",
express:"30–60 mins"

};

}

if(words <= 1000){

return {

standard:"3–6 hrs",
express:"1–3 hrs"

};

}

if(words <= 3000){

return {

standard:"6–12 hrs",
express:"3–6 hrs"

};

}

return {

standard:"12–24 hrs",
express:"6–12 hrs"

};

}




// REQUEST ENDPOINT

app.post("/request", upload.single("file"), async (req,res)=>{


try{


if(!req.file){

return res.status(400).json({

error:"No file uploaded"

});

}


let text = "";



// PDF

if(req.file.mimetype === "application/pdf"){

const data = await pdfParse(req.file.buffer);

text = data.text;

}



// DOCX

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



// TXT

else{

text =
req.file.buffer.toString();

}




const words =
countWords(text);



const standardPrice =
words * 0.025;

const expressPrice =
words * 0.05;



const delivery =
getDelivery(words);




res.json({

success:true,

job:{

words,

standardPrice,

expressPrice,

standardTime:delivery.standard,

expressTime:delivery.express

}

});




}
catch(error){

console.log(error);

res.status(500).json({

error:error.message

});

}


});





// SERVER

const PORT =
process.env.PORT || 4000;



app.listen(PORT, ()=>{

console.log(

"SayBon Translator System Running on port",
PORT

);

});