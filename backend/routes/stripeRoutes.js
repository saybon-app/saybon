import express from "express";

import {
    createStripeSession
} from "../controllers/stripeController.js";


const router = express.Router();



/*
========================================
CREATE STRIPE SESSION
POST /create-stripe-session
========================================
*/

router.post(
    "/",
    createStripeSession
);



export default router;