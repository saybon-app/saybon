import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });


router.post("/", upload.single("file"), async (req, res) => {

try{

if(!req.file){

return res.status(400).json({

success:false,
message:"No file uploaded"

});

}


const fakeWordCount = 1200;


res.json({

success:true,
words:fakeWordCount

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
