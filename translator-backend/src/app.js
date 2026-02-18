const express = require("express");
const cors = require("cors");
const multer = require("multer");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


// VERY IMPORTANT FOR RAILWAY
const PORT = process.env.PORT || 3000;



/*
ROOT ROUTE
*/
app.get("/", (req, res) => {

res.send("SayBon Translator Backend Running");

});



/*
UPLOAD SETUP
*/
const upload = multer({

dest: "uploads/"

});



/*
FILE PARSING FUNCTION
*/
async function extractText(filePath, mimetype) {

if (mimetype === "application/pdf") {

const data = await pdfParse(fs.readFileSync(filePath));
return data.text;

}

if (
mimetype ===
"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {

const result = await mammoth.extractRawText({

path: filePath

});

return result.value;

}

return fs.readFileSync(filePath, "utf8");

}



/*
REQUEST ENDPOINT
*/
app.post("/request", upload.single("file"), async (req, res) => {

try {

if (!req.file) {

return res.status(400).json({

error: "No file uploaded"

});

}

const text = await extractText(

req.file.path,
req.file.mimetype
);

const words = text.trim().split(/\s+/).length;



/*
PRICING
*/

const standardPrice = words * 0.03;
const expressPrice = words * 0.05;



res.json({

success: true,
words,
standardPrice,
expressPrice

});

} catch (error) {

console.log(error);

res.status(500).json({

error: "Parsing failed"

});

}

});



/*
START SERVER
*/
app.listen(PORT, () => {

console.log("Server running on port " + PORT);

});
