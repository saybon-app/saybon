import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import stripeRoutes from "./routes/stripeRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

import quoteRoute from "./translation/routes/quoteRoute.js";

// CORS
const allowedOrigins = [
  "https://saybonapp.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (curl, server-to-server, etc.)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // keep permissive for now (prevents blocking if you use a new domain)
      return cb(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).send("SayBon backend is running.");
});

// Routes
app.use("/", adminRoutes); // includes POST /request
app.use("/stripe", stripeRoutes);
app.use("/paystack", paystackRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`? Server running on port ${PORT}`);
});
app.use("/",quoteRoute);
