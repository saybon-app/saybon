import express from "express";
import { evaluateTranslator } from "../translator-evaluator.js";

const router = express.Router();

router.post("/evaluate", async (req,res)=>{

const { applicationId } = req.body;

await evaluateTranslator(applicationId);

res.json({
status:"evaluation started"
});

});

export default router;