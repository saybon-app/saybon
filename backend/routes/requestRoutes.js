﻿import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadRequest } from "../controllers/requestController.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Keep original extension so parsers work (.pdf/.docx/.txt)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || "";
    cb(null, upload_);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const ok = [".pdf", ".docx", ".txt"].includes(ext);
    if (!ok) return cb(new Error("Unsupported file type. Upload PDF, DOCX, or TXT."));
    cb(null, true);
  },
});

router.post("/", upload.single("file"), uploadRequest);

export default router;
