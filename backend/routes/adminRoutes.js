import express from "express";
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";

import { handleQuoteRequest } from "../controllers/requestController.js";

const router = express.Router();

// Use /tmp on Render (safe + writable)
const uploadDir = path.join(os.tmpdir(), "saybon_uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext || "";
    const name = `upload_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

// Frontend calls:
// POST https://saybon-backend.onrender.com/request  (field name: "file")
router.post("/request", upload.single("file"), handleQuoteRequest);

export default router;
