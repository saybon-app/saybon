import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer();

/*
POST /request
Handles file upload and returns word count
*/

router.post("/", upload.single("file"), async (req, res) => {

try {

if (!req.file) {

return res.status(400).json({
success:false,
message:"No file uploaded"
});

}

const text = req.file.buffer.toString("utf8");

const words = text.trim().split(/\s+/).length;

res.json({
success:true,
words
});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

});


/*
GET fallback
*/

router.get("/", (req,res)=>{

res.json({
success:false,
message:"Endpoint not found"
});

});

export default router;