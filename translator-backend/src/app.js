const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* ROOT ROUTE — REQUIRED FOR RAILWAY */

app.get("/", (req, res) => {

    res.send("SayBon Translator Backend Running");

});


/* MULTER SETUP */

const upload = multer({
    dest: "uploads/"
});


/* WORD COUNT FUNCTION */

function countWords(text){

    return text
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .length;

}


/* DELIVERY TIME CALCULATOR */

function getDelivery(words, speed){

    if(speed === "standard"){

        if(words <= 300) return "1–3 hrs";
        if(words <= 1000) return "3–6 hrs";
        if(words <= 3000) return "6–12 hrs";
        if(words <= 5000) return "12–24 hrs";

    }

    if(speed === "express"){

        if(words <= 300) return "30–60 mins";
        if(words <= 1000) return "1–3 hrs";
        if(words <= 3000) return "3–6 hrs";
        if(words <= 5000) return "6–12 hrs";

    }

}


/* REQUEST ENDPOINT */

app.post("/request", upload.single("file"), async (req, res) => {

    try{

        const filePath = req.file.path;

        let text = "";

        if(req.file.mimetype === "application/pdf"){

            const dataBuffer = fs.readFileSync(filePath);

            const pdf = await pdfParse(dataBuffer);

            text = pdf.text;

        }

        else if(
            req.file.mimetype.includes("word")
        ){

            const result =
            await mammoth.extractRawText({
                path: filePath
            });

            text = result.value;

        }

        else{

            text = fs.readFileSync(filePath, "utf8");

        }


        const words = countWords(text);

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


    }

    catch(error){

        console.log(error);

        res.status(500).json({
            error:"Parsing failed"
        });

    }

});



/* CRITICAL — THIS FIXES RAILWAY */

const PORT =
process.env.PORT || 4000;


app.listen(PORT, () => {

    console.log(
        "Server running on port " + PORT
    );

});