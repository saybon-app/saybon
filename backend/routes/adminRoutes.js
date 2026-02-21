import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleQuoteRequest } from "../controllers/requestController.js";

const router = express.Router();

// Upload directory (Render supports /tmp)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = (file.originalname || "upload")
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120);
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

router.post("/request", upload.single("file"), handleQuoteRequest);

export default router;
