const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(bodyParser.json());

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function generateKey() {
  return "SB-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

app.get("/", (req, res) => {
  res.send("SayBon Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "SayBon API live - OPENAI SERVER CONFIRMED - APRIL 2",
    routes: [
      "/",
      "/api/health",
      "/api/evaluateTranslatorTest",
      "/api/evaluateTranslator",
      "/api/applicationResult",
      "/api/verifyTranslatorKey",
      "/api/createTranslationJob",
      "/api/jobs",
      "/api/claimJob",
      "/api/submitTranslation",
      "/api/translatorStats"
    ]
  });
});

app.post("/api/evaluateTranslatorTest", async (req, res) => {
  try {
    const { english, french, email } = req.body || {};

    if (!english || !french || !email) {
      return res.status(400).json({
        error: "english, french, and email are required"
      });
    }

    const prompt = `
You are a professional French-English translation examiner.

Evaluate the following translation.

SOURCE (English):
${english}

TRANSLATION (French):
${french}

Score out of 100 using:
- accuracy (40)
- terminology (25)
- grammar (20)
- tone (15)

Return STRICT JSON only in this exact format:
{
  "accuracy": number,
  "terminology": number,
  "grammar": number,
  "tone": number,
  "finalScore": number,
  "feedback": "short professional feedback"
}
`;

    console.log("🔥 OPENAI EVALUATOR ROUTE IS RUNNING");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";

    let result;
    try {
      result = JSON.parse(raw);
    } catch (parseErr) {
      console.error("OpenAI JSON parse failed:", raw);
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw
      });
    }

    const passkey = generateKey();
    const applicationId = crypto.randomUUID();

    await db.collection("translatorApplications").doc(applicationId).set({
      email,
      english,
      french,
      accuracy: result.accuracy ?? 0,
      terminology: result.terminology ?? 0,
      grammar: result.grammar ?? 0,
      tone: result.tone ?? 0,
      finalScore: result.finalScore ?? 0,
      feedback: result.feedback ?? "",
      passkey,
      created: new Date()
    });

    res.json({
      applicationId,
      passkey,
      ...result
    });

  } catch (err) {
    console.error("evaluateTranslatorTest error:", err);
    res.status(500).json({
      error: "AI evaluation failed",
      details: err.message
    });
  }
});

app.post("/api/evaluateTranslator", async (req, res) => {
  try {
    const { accuracy, terminology, grammar, tone, email } = req.body || {};

    const finalScore = Math.round(
      (
        Number(accuracy || 0) +
        Number(terminology || 0) +
        Number(grammar || 0) +
        Number(tone || 0)
      ) / 4
    );

    const passkey = generateKey();
    const ref = db.collection("translatorApplications").doc();

    await ref.set({
      accuracy,
      terminology,
      grammar,
      tone,
      finalScore,
      passkey,
      email,
      created: new Date()
    });

    res.json({
      applicationId: ref.id,
      finalScore,
      passkey
    });

  } catch (err) {
    console.error("evaluateTranslator error:", err);
    res.status(500).json({ error: "evaluation failed" });
  }
});

app.get("/api/applicationResult", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "missing id" });
    }

    const doc = await db.collection("translatorApplications").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "not found" });
    }

    res.json(doc.data());

  } catch (err) {
    console.error("applicationResult error:", err);
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/verifyTranslatorKey", async (req, res) => {
  try {
    const key = req.body?.key;

    if (!key) {
      return res.status(400).json({ valid: false, error: "missing key" });
    }

    const snapshot = await db.collection("translatorApplications")
      .where("passkey", "==", key)
      .get();

    if (snapshot.empty) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });

  } catch (err) {
    console.error("verifyTranslatorKey error:", err);
    res.status(500).json({ valid: false });
  }
});

app.post("/api/createTranslationJob", async (req, res) => {
  try {
    const { clientEmail, wordCount, service } = req.body || {};

    const wc = Number(wordCount || 0);

    let price = service === "standard"
      ? wc * 0.025
      : wc * 0.05;

    const ref = db.collection("translationJobs").doc();

    await ref.set({
      clientEmail,
      wordCount: wc,
      service,
      price,
      status: "open",
      translator: null,
      created: new Date()
    });

    res.json({ jobId: ref.id, price });

  } catch (err) {
    console.error("createTranslationJob error:", err);
    res.status(500).json({ error: "job creation failed" });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const snapshot = await db.collection("translationJobs")
      .where("status", "==", "open")
      .get();

    const jobs = [];
    snapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    res.json(jobs);

  } catch (err) {
    console.error("jobs error:", err);
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/claimJob", async (req, res) => {
  try {
    const { jobId, passkey } = req.body || {};

    const translatorSnapshot = await db.collection("translatorApplications")
      .where("passkey", "==", passkey)
      .get();

    if (translatorSnapshot.empty) {
      return res.status(400).json({ error: "invalid translator" });
    }

    await db.collection("translationJobs").doc(jobId).update({
      status: "claimed",
      translator: passkey
    });

    res.json({ success: true });

  } catch (err) {
    console.error("claimJob error:", err);
    res.status(500).json({ error: "claim failed" });
  }
});

app.post("/api/submitTranslation", async (req, res) => {
  try {
    const { jobId, passkey, translation } = req.body || {};

    await db.collection("jobSubmissions").add({
      jobId,
      translator: passkey,
      translation,
      submitted: new Date()
    });

    await db.collection("translationJobs").doc(jobId).update({
      status: "completed"
    });

    res.json({ success: true });

  } catch (err) {
    console.error("submitTranslation error:", err);
    res.status(500).json({ error: "submission failed" });
  }
});

app.get("/api/translatorStats", async (req, res) => {
  try {
    const passkey = req.query.key;

    const jobs = await db.collection("translationJobs")
      .where("translator", "==", passkey)
      .get();

    let completed = 0;

    jobs.forEach(j => {
      if (j.data().status === "completed") {
        completed++;
      }
    });

    res.json({ jobsCompleted: completed });

  } catch (err) {
    console.error("translatorStats error:", err);
    res.status(500).json({ error: "stats failed" });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("SayBon unified backend running on port " + PORT);
});