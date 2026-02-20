import express from "express";
import multer from "multer";

import {uploadRequest} from "../controllers/requestController.js";


const router = express.Router();


const upload = multer({

dest:"uploads/"

});


router.post("/", upload.single("file"), uploadRequest);


export default router;