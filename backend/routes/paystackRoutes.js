import express from "express";

import { createPaystackSession }
from "../controllers/paystackController.js";

const router = express.Router();

router.post("/",

createPaystackSession

);

export default router;
