import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import pdf from "pdf-parse";

const router = express.Router();


/*
========================================
MULTER CONFIG
========================================
*/

const storage = multer.memoryStorage();

const upload = multer({

    storage,

    limits: {

        fileSize: 10 * 1024 * 1024

    }

});


/*
========================================
WORD COUNT FUNCTION
========================================
*/

function countWords(text){

return text
.trim()
.split(/\s+/)
.length;

}


/*
========================================
REQUEST ENDPOINT
========================================
*/

router.post("/", upload.single("file"), async (req, res) => {

try{

if(!req.file){

return res.status(400).json({

success:false,
message:"No file uploaded"

});

}


let text = "";


/*
========================================
DOCX
========================================
*/

if(

req.file.mimetype ===
"application/vnd.openxmlformats-officedocument.wordprocessingml.document"

){

const result = await mammoth.extractRawText({

buffer:req.file.buffer

});

text = result.value;

}


/*
========================================
PDF
========================================
*/

else if(req.file.mimetype === "application/pdf"){

const result = await pdf(req.file.buffer);

text = result.text;

}


/*
========================================
UNSUPPORTED
========================================
*/

else{

return res.status(400).json({

success:false,
message:"Unsupported file type"

});

}


const words = countWords(text);


res.json({

success:true,
words

});


}
catch(error){

console.error(error);

res.status(500).json({

success:false,
message:"Server error"

});

}

});


export default router;
