import express from "express";

import {createStripeSession} from "../controllers/stripeController.js";

const router = express.Router();

router.post("/", createStripeSession);

export default router;
