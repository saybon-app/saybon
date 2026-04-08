const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

function generateJobId(){
    const rand = Math.random().toString(36).substring(2,6).toUpperCase();
    return `JOB-${Date.now()}-${rand}`;
}

router.post("/create-job", async (req,res)=>{

    try{

        const {email,language,words,price,service} = req.body;

        const jobId = generateJobId();

        const db = admin.firestore();

        await db.collection("translation_jobs").doc(jobId).set({

            email,
            language,
            words,
            price,
            service,

            status:"pending_payment",
            createdAt: Date.now()

        });

        res.json({
            success:true,
            jobId
        });

    }catch(err){

        console.error(err);
        res.status(500).json({error:"job creation failed"});

    }

});

module.exports = router;
