const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const Stripe = require("stripe");

const app = express();

const ALLOWED_ORIGINS = [
  "https://saybonapp.com",
  "https://www.saybonapp.com",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

function getEnv(name, fallback = "") {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : fallback;
}

const STRIPE_SECRET_KEY = getEnv("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = getEnv("STRIPE_WEBHOOK_SECRET");
const PUBLIC_APP_URL = getEnv("PUBLIC_APP_URL", "https://saybonapp.com");
const ADMIN_ACCESS_CODE = getEnv("ADMIN_ACCESS_CODE");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

/* ==========================================
   WEBHOOK FIRST
========================================== */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send("Stripe webhook not configured");
    }

    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const jobId =
        session.client_reference_id ||
        (session.metadata ? session.metadata.jobId : null);

      if (jobId) {
        await db.collection("translationJobs").doc(jobId).set(
          {
            paymentStatus: "paid",
            status: "paid",
            stage: "queue",
            stripeSessionId: session.id || null,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/* ==========================================
   STANDARD MIDDLEWARE
========================================== */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked for origin: " + origin));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json({ limit: "8mb" }));

/* ==========================================
   HELPERS
========================================== */
function normalizePlan(plan) {
  return String(plan || "").trim().toLowerCase() === "express"
    ? "express"
    : "standard";
}

function computePrice(words, plan) {
  const count = Number(words || 0);
  const cleanWords = Number.isFinite(count) && count > 0 ? Math.round(count) : 0;
  const rate = plan === "express" ? 0.05 : 0.025;
  return Number((cleanWords * rate).toFixed(2));
}

function computeTimeline(words, plan) {
  const count = Number(words || 0);

  if (count <= 0) return "Custom";
  if (count <= 300) return plan === "express" ? "30–60 mins" : "1–3 hrs";
  if (count <= 1000) return plan === "express" ? "1–3 hrs" : "3–6 hrs";
  if (count <= 3000) return plan === "express" ? "3–6 hrs" : "6–12 hrs";
  if (count <= 6000) return plan === "express" ? "6–12 hrs" : "12–24 hrs";
  if (count <= 10000) return plan === "express" ? "12–24 hrs" : "24–48 hrs";
  if (count <= 20000) return plan === "express" ? "24–48 hrs" : "2–4 days";
  return "Custom";
}

function sanitizeEmail(value) {
  const email = String(value || "").trim();
  return email.includes("@") ? email : "";
}

function sanitizeText(value, fallback = "") {
  return String(value || fallback).trim();
}

/* ==========================================
   HEALTH
========================================== */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "SayBon canonical backend",
    stripeConfigured: !!stripe,
    webhookConfigured: !!STRIPE_WEBHOOK_SECRET
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ==========================================
   SECURITY
========================================== */
app.post("/api/admin/verify", async (req, res) => {
  try {
    const code = String(req.body.code || "").trim();

    if (!ADMIN_ACCESS_CODE) {
      return res.status(500).json({ success: false, error: "Admin access code not configured" });
    }

    if (code && code === ADMIN_ACCESS_CODE) {
      return res.json({ success: true });
    }

    return res.status(401).json({ success: false });
  } catch (err) {
    console.error("admin verify error:", err);
    return res.status(500).json({ success: false });
  }
});

/* ==========================================
   TRANSLATION PIPELINE
   Upload → Quote → Job Creation → Payment → Queue → Translation Desk → Review → Delivery → Archive
========================================== */

/* CREATE JOB */
app.post("/api/createJob", async (req, res) => {
  try {
    const words = Number(req.body.words || req.body.wordCount || 0);
    const plan = normalizePlan(req.body.plan || req.body.service);
    const clientEmail = sanitizeEmail(req.body.clientEmail || req.body.email);
    const sourceLanguage = sanitizeText(req.body.sourceLanguage, "English");
    const targetLanguage = sanitizeText(req.body.targetLanguage, "French");
    const originalFileName = sanitizeText(req.body.originalFileName || req.body.fileName);

    if (!Number.isFinite(words) || words <= 0) {
      return res.status(400).json({ error: "Valid words are required" });
    }

    const price = computePrice(words, plan);
    const deliveryTimeline = computeTimeline(words, plan);

    const ref = db.collection("translationJobs").doc();

    const job = {
      jobId: ref.id,
      words: Math.round(words),
      plan,
      price,
      paymentStatus: "pending",
      status: "awaiting_payment",
      stage: "payment",
      clientEmail,
      sourceLanguage,
      targetLanguage,
      originalFileName,
      deliveryTimeline,
      assignedTranslator: null,
      submittedTranslation: "",
      reviewedTranslation: "",
      reviewFeedback: "",
      reviewScore: null,
      deliveryStatus: "pending",
      archived: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(job);

    return res.json({
      success: true,
      jobId: ref.id,
      words: job.words,
      plan: job.plan,
      price: job.price,
      deliveryTimeline: job.deliveryTimeline,
      stage: job.stage,
      status: job.status
    });
  } catch (err) {
    console.error("createJob error:", err);
    return res.status(500).json({ error: "Failed to create job" });
  }
});

/* GET JOB */
app.get("/api/job/:jobId", async (req, res) => {
  try {
    const jobId = String(req.params.jobId || "").trim();
    const doc = await db.collection("translationJobs").doc(jobId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({
      success: true,
      job: {
        jobId: doc.id,
        ...doc.data()
      }
    });
  } catch (err) {
    console.error("getJob error:", err);
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

/* CREATE CHECKOUT */
app.post("/api/createCheckout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const jobId = String(req.body.jobId || req.body.job || "").trim();

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    const doc = await db.collection("translationJobs").doc(jobId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = doc.data();
    const words = Number(job.words || 0);
    const plan = normalizePlan(job.plan);
    const price = computePrice(words, plan);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: jobId,
      metadata: {
        jobId,
        words: String(words),
        plan
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan === "express"
                ? "SayBon Express Translation"
                : "SayBon Standard Translation",
              description: `${words} words`
            },
            unit_amount: Math.round(price * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${PUBLIC_APP_URL}/translation/success.html?job=${jobId}`,
      cancel_url: `${PUBLIC_APP_URL}/translation/payment.html?job=${jobId}`
    });

    await db.collection("translationJobs").doc(jobId).set(
      {
        stripeSessionId: session.id,
        checkoutUrl: session.url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("createCheckout error:", err);
    return res.status(500).json({ error: "Stripe checkout failed", detail: err.message });
  }
});

/* QUEUE */
app.get("/api/queue", async (req, res) => {
  try {
    const snapshot = await db.collection("translationJobs").where("stage", "==", "queue").get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ jobId: doc.id, ...doc.data() }));
    return res.json({ success: true, jobs });
  } catch (err) {
    console.error("queue error:", err);
    return res.status(500).json({ error: "Failed to fetch queue" });
  }
});

/* CLAIM TO DESK */
app.post("/api/claimJob", async (req, res) => {
  try {
    const jobId = sanitizeText(req.body.jobId);
    const translator = sanitizeText(req.body.translator, "translator");

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    await db.collection("translationJobs").doc(jobId).set(
      {
        assignedTranslator: translator,
        stage: "translation_desk",
        status: "in_translation",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("claimJob error:", err);
    return res.status(500).json({ error: "Failed to claim job" });
  }
});

/* SUBMIT TRANSLATION */
app.post("/api/submitTranslation", async (req, res) => {
  try {
    const jobId = sanitizeText(req.body.jobId);
    const translation = String(req.body.translation || "").trim();

    if (!jobId || !translation) {
      return res.status(400).json({ error: "jobId and translation are required" });
    }

    await db.collection("translationJobs").doc(jobId).set(
      {
        submittedTranslation: translation,
        stage: "review",
        status: "submitted_for_review",
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("submitTranslation error:", err);
    return res.status(500).json({ error: "Failed to submit translation" });
  }
});

/* REVIEW */
app.post("/api/reviewJob", async (req, res) => {
  try {
    const jobId = sanitizeText(req.body.jobId);
    const approved = !!req.body.approved;
    const reviewFeedback = sanitizeText(req.body.reviewFeedback);
    const reviewedTranslation = String(req.body.reviewedTranslation || "").trim();
    const reviewScore = Number(req.body.reviewScore || 0);

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    await db.collection("translationJobs").doc(jobId).set(
      {
        reviewFeedback,
        reviewedTranslation,
        reviewScore,
        stage: approved ? "delivery" : "translation_desk",
        status: approved ? "approved" : "revision_required",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true, nextStage: approved ? "delivery" : "translation_desk" });
  } catch (err) {
    console.error("reviewJob error:", err);
    return res.status(500).json({ error: "Failed to review job" });
  }
});

/* DELIVERY */
app.post("/api/deliverJob", async (req, res) => {
  try {
    const jobId = sanitizeText(req.body.jobId);

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    await db.collection("translationJobs").doc(jobId).set(
      {
        stage: "delivered",
        status: "delivered",
        deliveryStatus: "delivered",
        deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("deliverJob error:", err);
    return res.status(500).json({ error: "Failed to deliver job" });
  }
});

/* ARCHIVE */
app.post("/api/archiveJob", async (req, res) => {
  try {
    const jobId = sanitizeText(req.body.jobId);

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    await db.collection("translationJobs").doc(jobId).set(
      {
        stage: "archived",
        status: "archived",
        archived: true,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("archiveJob error:", err);
    return res.status(500).json({ error: "Failed to archive job" });
  }
});

/* ==========================================
   DELF TIGHTENING FOUNDATION
========================================== */

/* DELF HEALTH */
app.get("/api/delf/health", async (req, res) => {
  return res.json({
    success: true,
    service: "SayBon DELF engine",
    status: "ready"
  });
});

/* DELF RESULT SUBMISSION */
app.post("/api/delf/submit", async (req, res) => {
  try {
    const candidateName = sanitizeText(req.body.candidateName);
    const examTrack = sanitizeText(req.body.examTrack);
    const levelEstimate = sanitizeText(req.body.levelEstimate);
    const score = Number(req.body.score || 0);

    const ref = db.collection("delfSubmissions").doc();

    await ref.set({
      submissionId: ref.id,
      candidateName,
      examTrack,
      levelEstimate,
      score,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({
      success: true,
      submissionId: ref.id
    });
  } catch (err) {
    console.error("DELF submit error:", err);
    return res.status(500).json({ error: "Failed to submit DELF result" });
  }
});

/* ==========================================
   404
========================================== */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ==========================================
   START
========================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SayBon canonical backend running on port " + PORT);
});
