const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.api = functions.onRequest(async (req, res) => {

  try {

    // Health test
    if (req.method === "GET") {
      res.json({ status: "SayBon API running" });
      return;
    }

    // Order creation
    if (req.body.type === "order") {

      const order = {

        email: req.body.email,
        amount: req.body.amount,
        currency: req.body.currency,
        status: "paid",
        created: Date.now()

      };

      await admin.firestore()
        .collection("translationOrders")
        .add(order);

      res.json({
        ok: true
      });

      return;

    }

    res.status(400).json({
      error: "Invalid request"
    });

  }

  catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});