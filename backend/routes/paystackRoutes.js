import express from "express";

import {

initializePayment,

verifyPayment

}

from "../controllers/paystackController.js";


const router=express.Router();


router.post("/",initializePayment);

router.get("/verify/:reference",verifyPayment);


export default router;
