const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

router.post("/stripe-webhook", async (req, res) => {

    try {

        const event = req.body;

        if (event.type === "checkout.session.completed") {

            const session = event.data.object;

            const jobId = session.client_reference_id;

            if (!jobId) {
                console.log("No job ID found");
                return res.json({received:true});
            }

            const db = admin.firestore();

            await db.collection("translation_jobs")
                .doc(jobId)
                .update({
                    status: "paid",
                    paidAt: Date.now()
                });

            console.log("Job marked paid:", jobId);

        }

        res.json({received:true});

    } catch (err) {

        console.error("Webhook error:", err);
        res.status(500).send("Webhook failed");

    }

});

module.exports = router;