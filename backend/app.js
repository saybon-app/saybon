import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import requestRoutes from "./routes/requestRoutes.js";
import stripeRoute from "./routes/stripeRoutes.js";


/*
========================================
INIT
========================================
*/

dotenv.config();

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
ROUTES
========================================
*/


// Translation quote endpoint

app.use("/request", requestRoutes);


// Stripe checkout endpoint

app.use("/create-stripe-session", stripeRoute);




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
ERROR HANDLER
========================================
*/

app.use((error, req, res, next) => {

    console.error(error);

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

    console.log(

        "SayBon backend running on port " + PORT

    );

});
