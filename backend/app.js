import dotenv from "dotenv";

/*
========================================
LOAD ENV FIRST (ABSOLUTE TOP)
========================================
*/
dotenv.config({ path: "./.env" });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing from .env");
}

/*
========================================
IMPORTS
========================================
*/
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import requestRoutes from "./routes/requestRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

/*
========================================
INIT
========================================
*/
const app = express();

/*
========================================
ABSOLUTE PATH HELPERS (ESM)
========================================
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
========================================
MIDDLEWARE
========================================
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
========================================
SERVE STATIC FRONTEND (PUBLIC FOLDER)
========================================
*/
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));

/*
========================================
HEALTH CHECK
========================================
*/
app.get("/", (req, res) => {
  res.send("SayBon Backend Running");
});

/*
========================================
API ROUTES
========================================
*/
app.use("/request", requestRoutes);
app.use("/stripe", stripeRoutes);

/*
========================================
404 (API + FILES)
========================================
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

/*
========================================
SERVER
========================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ SayBon backend running on port " + PORT);
  console.log("✅ Serving public folder from: " + PUBLIC_DIR);
});
