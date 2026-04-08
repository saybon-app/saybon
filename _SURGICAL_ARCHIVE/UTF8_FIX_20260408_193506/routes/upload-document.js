const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-document", upload.single("file"), async (req,res)=>{

    try{

        const file = req.file;

        if(!file){
            return res.status(400).json({error:"no file uploaded"});
        }

        const bucket = admin.storage().bucket();

        const fileName = Date.now() + "_" + file.originalname;

        const fileUpload = bucket.file("translation_docs/" + fileName);

        const stream = fileUpload.createWriteStream({
            metadata:{contentType:file.mimetype}
        });

        stream.on("error",err=>{
            console.error(err);
            res.status(500).json({error:"upload failed"});
        });

        stream.on("finish", async ()=>{

            const publicUrl =
            "https://storage.googleapis.com/" +
            bucket.name +
            "/translation_docs/" +
            fileName;

            res.json({
                success:true,
                fileUrl:publicUrl
            });

        });

        stream.end(file.buffer);

    }catch(err){

        console.error(err);
        res.status(500).json({error:"server error"});

    }

});

module.exports = router;