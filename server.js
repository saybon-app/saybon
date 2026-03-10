import express from "express";
import cors from "cors";
import Stripe from "stripe";
import admin from "firebase-admin";

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw))
  });
}

const db = admin.firestore();

function extractJobCode(session) {
  const fields = Array.isArray(session.custom_fields) ? session.custom_fields : [];

  const field = fields.find((f) => {
    const key = String(f?.key || "").toLowerCase();
    const label = String(f?.label?.custom || "").toLowerCase();
    return key.includes("job") || label.includes("job");
  });

  return (
    field?.text?.value ||
    field?.numeric?.value ||
    field?.dropdown?.value ||
    session?.client_reference_id ||
    session?.metadata?.jobId ||
    null
  );
}

/* ==========================================
STRIPE WEBHOOK
Must come BEFORE express.json()
========================================== */
app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const jobId = extractJobCode(session);

        if (!jobId) {
          console.error("No Job Code found in checkout.session.completed");
          return res.json({ received: true, updated: false });
        }

        await db.collection("translationJobs").doc(jobId).set(
          {
            status: "paid",
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeSessionId: session.id,
            stripePaymentStatus: session.payment_status || "paid",
            stripeCustomerEmail:
              session.customer_details?.email ||
              session.customer_email ||
              null
          },
          { merge: true }
        );

        console.log("Marked paid:", jobId);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

/* ==========================================
NORMAL MIDDLEWARE
========================================== */
app.use(
  cors({
    origin: [
      "https://saybonapp.com",
      "https://www.saybonapp.com",
      "http://localhost:5500"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

/* ==========================================
SERVER HEALTH CHECK
========================================== */
app.get("/", (req, res) => {
  res.json({
    status: "SayBon server running"
  });
});

/* ==========================================
LOOK UP SESSION -> JOB
Used by success.html
========================================== */
app.get("/api/session-job", async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || "").trim();

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const jobId = extractJobCode(session);

    if (!jobId) {
      return res.status(404).json({ error: "Job Code not found on session" });
    }

    return res.json({
      jobId,
      paymentStatus: session.payment_status || null
    });
  } catch (err) {
    console.error("Session lookup error:", err);
    return res.status(500).json({ error: "Session lookup failed" });
  }
});

/* ==========================================
404 HANDLER
========================================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* ==========================================
START SERVER (Render)
========================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SayBon server running on port", PORT);
});
