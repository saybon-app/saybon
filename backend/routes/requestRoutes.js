﻿import express from "express";
import multer from "multer";
import path from "path";
import { uploadRequest } from "../controllers/requestController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB safety limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const ok = [".pdf", ".docx", ".txt"].includes(ext);
    if (!ok) {
      return cb(new Error("Unsupported file type. Please upload PDF, DOCX, or TXT."));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("file"), uploadRequest);

export default router;
