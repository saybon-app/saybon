import express from "express";

import multer from "multer";

import {createQuote} from "../controllers/quoteController.js";

const router = express.Router();

const upload = multer({dest:"uploads/"});

router.post("/request",upload.single("file"),createQuote);

export default router;
