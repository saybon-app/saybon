import dotenv from "dotenv";

/*
========================================
LOAD ENV FIRST (ABSOLUTE TOP)
========================================
*/

dotenv.config({ path: "./.env" });

if (!process.env.STRIPE_SECRET_KEY) {

console.error("❌ STRIPE_SECRET_KEY missing from .env");

}

if (!process.env.PAYSTACK_SECRET_KEY) {

console.error("❌ PAYSTACK_SECRET_KEY missing from .env");

}


/*
========================================
IMPORTS
========================================
*/

import express from "express";
import cors from "cors";

import requestRoutes from "./routes/requestRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
// future ready
// import paystackRoutes from "./routes/paystackRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";


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

app.use(cors({

origin: "*",

methods: ["GET","POST"],

allowedHeaders: ["Content-Type"]

}));

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
ROUTES
========================================
*/

/*

FRONTEND CALLS:

POST

https://saybon-backend.onrender.com/request

*/

app.use("/request", requestRoutes);


/*

FRONTEND CALLS:

POST

https://saybon-backend.onrender.com/stripe/create-stripe-session

*/

app.use("/stripe", stripeRoutes);


/*

FUTURE READY

*/

// app.use("/paystack", paystackRoutes);

// app.use("/admin", adminRoutes);



/*
========================================
404 HANDLER
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
GLOBAL ERROR HANDLER
========================================
*/

app.use((error, req, res, next) => {

console.error("SERVER ERROR:", error);

res.status(500).json({

success: false,

message: "Server error"

});

});


/*
========================================
SERVER
========================================
*/

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

console.log("");

console.log("================================");

console.log("🚀 SayBon Backend Running");

console.log("🌍 Port:", PORT);

console.log("================================");

console.log("");

});