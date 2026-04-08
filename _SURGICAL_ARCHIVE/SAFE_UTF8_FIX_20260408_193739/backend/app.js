import dotenv from "dotenv";

/*
========================================
LOAD ENV FIRST (ABSOLUTE TOP)
========================================
*/
dotenv.config({ path: "./.env" });

/*
========================================
IMPORTS
========================================
*/
import express from "express";
import cors from "cors";

import requestRoutes from "./routes/requestRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";

/*
========================================
INIT
========================================
*/
const app = express();

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
HEALTH CHECK
========================================
*/
app.get("/", (req, res) => {
  res.send("SayBon Backend Running");
});

/*
========================================
ROUTES (CANONICAL API)
========================================
- Quote upload + word count:
  POST /api/quote   (multipart form-data "file")

- Stripe session:
  POST /api/stripe/create-stripe-session  (json {amount})

- Paystack init:
  POST /api/paystack/initialize           (json {amount, email})
========================================
*/
app.use("/api/quote", requestRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/paystack", paystackRoutes);

/*
========================================
LEGACY ALIASES (so old frontend links still work)
========================================
*/
app.use("/request", requestRoutes);
app.use("/stripe", stripeRoutes);
app.use("/paystack", paystackRoutes);

/*
========================================
404
========================================
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

/*
========================================
SERVER
========================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SayBon backend running on port " + PORT);
});