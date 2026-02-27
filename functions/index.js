const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

/*
========================================
CREATE ORDER
========================================
*/

app.post("/create-order", async (req, res) => {

try {

const {
email,
filename,
wordCount,
price,
provider,
reference
} = req.body;

const orderRef = db.collection("translationOrders").doc();

await orderRef.set({

email,
filename,
wordCount,
price,
provider,
reference,
status: "pending",
createdAt: admin.firestore.FieldValue.serverTimestamp()

});

res.json({

success: true,
orderId: orderRef.id

});

} catch (error) {

res.status(500).json({
error: error.message
});

}

});


/*
========================================
VERIFY PAYSTACK
========================================
*/

app.post("/verify-paystack", async (req, res) => {

try {

const { reference } = req.body;

const verify = await axios.get(

"https://api.paystack.co/transaction/verify/" + reference,

{
headers: {
Authorization:
"Bearer " + process.env.PAYSTACK_SECRET_KEY
}
}

);

if (verify.data.data.status === "success") {

const orders = await db
.collection("translationOrders")
.where("reference", "==", reference)
.get();

orders.forEach(async doc => {

await doc.ref.update({
status: "paid"
});

});

res.json({ success: true });

}

} catch (error) {

res.status(500).json({
error: error.message
});

}

});


/*
========================================
VERIFY STRIPE
========================================
*/

app.post("/verify-stripe", async (req, res) => {

try {

const { sessionId } = req.body;

const session = await stripe.checkout.sessions.retrieve(sessionId);

if (session.payment_status === "paid") {

const orders = await db
.collection("translationOrders")
.where("reference", "==", sessionId)
.get();

orders.forEach(async doc => {

await doc.ref.update({
status: "paid"
});

});

res.json({ success: true });

}

} catch (error) {

res.status(500).json({
error: error.message
});

}

});


exports.api = functions.https.onRequest(app);

