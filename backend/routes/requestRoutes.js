import express from "express";
import multer from "multer";
import { handleRequest } from "../controllers/requestController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});


/*
POST /request
This is the exact endpoint your frontend calls
*/
router.post("/", upload.single("file"), handleRequest);


export default router;