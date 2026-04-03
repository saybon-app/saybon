const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* ==========================================
   FIREBASE ADMIN (EXPLICIT RENDER SAFE INIT)
========================================== */

let serviceAccount = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", err.message);
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin initialized with service account");
  } else {
    admin.initializeApp();
    console.log("⚠️ Firebase Admin initialized with default credentials");
  }
}

const db = admin.firestore();

/* ==========================================
   HELPERS
========================================== */

function generateKey() {
  return "SB-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function cleanJson(raw) {
  if (!raw) return "{}";

  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

/* ==========================================
   BASIC ROUTES
========================================== */

app.get("/", (req, res) => {
  res.send("SayBon Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "ROOT-SERVER-FILE-IS-LIVE-APRIL-2-TEST-1000",
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

/* ==========================================
   SELF EVALUATION TEST (MAIN FOCUS)
========================================== */

app.post("/api/evaluateTranslatorTest", async (req, res) => {
  try {
    const { english, french, email } = req.body || {};

    if (!english || !french || !email) {
      return res.status(400).json({
        error: "english, french, and email are required"
      });
    }

    console.log("🔥 SELF-EVALUATION ROUTE HIT");

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

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No explanation before or after
- No code block

Return this exact structure:
{
  "accuracy": number,
  "terminology": number,
  "grammar": number,
  "tone": number,
  "finalScore": number,
  "feedback": "short professional feedback"
}
`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a strict JSON-only translation evaluator."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      })
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("❌ OpenAI API error:", aiData);
      return res.status(500).json({
        error: "AI evaluation failed",
        details: aiData?.error?.message || "Unknown OpenAI error",
        raw: aiData
      });
    }

    const raw = aiData?.choices?.[0]?.message?.content?.trim() || "{}";
    const cleaned = cleanJson(raw);

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("❌ OpenAI JSON parse failed:", raw);
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw
      });
    }

    const accuracy = Number(result.accuracy ?? 0);
    const terminology = Number(result.terminology ?? 0);
    const grammar = Number(result.grammar ?? 0);
    const tone = Number(result.tone ?? 0);
    const finalScore = Number(result.finalScore ?? (accuracy + terminology + grammar + tone));
    const feedback = String(result.feedback ?? "").trim();

    const applicationId = crypto.randomUUID();
    const passkey = generateKey();

    console.log("📝 Saving evaluation to Firestore...");

    await db.collection("translatorApplications").doc(applicationId).set({
      email,
      english,
      french,
      accuracy,
      terminology,
      grammar,
      tone,
      finalScore,
      feedback,
      passkey,
      created: new Date()
    });

    console.log("✅ Saved to Firestore:", applicationId);

    return res.json({
      applicationId,
      passkey,
      accuracy,
      terminology,
      grammar,
      tone,
      finalScore,
      feedback
    });

  } catch (err) {
    console.error("❌ evaluateTranslatorTest error:", err);
    return res.status(500).json({
      error: "AI evaluation failed",
      details: err.message
    });
  }
});

/* ==========================================
   EXISTING SUPPORT ROUTES
========================================== */

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

/* ==========================================
   KEEP TRANSLATION ENGINE ROUTES (LATER)
========================================== */

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

/* ==========================================
   404
========================================== */


app.post("/api/evaluatePlacementTest", async (req, res) => {
  try {
    const { candidateCode, testType, testTitle, questions, answers } = req.body || {};

    if (!candidateCode || !testType || !Array.isArray(questions) || !answers) {
      return res.status(400).json({
        error: "candidateCode, testType, questions, and answers are required"
      });
    }

    let objectiveScore = 0;
    let objectiveTotal = 0;
    let writingScore = 0;
    let speakingScore = 0;
    let writingFeedback = "Pending manual or AI review.";
    let speakingFeedback = "Pending speaking review.";
    let speakingTranscript = "";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answers[i];

      if ((q.type === "reading" || q.type === "listening") && typeof q.answer !== "undefined") {
        objectiveTotal += 1;
        if (String(answer ?? "") === String(q.answer)) {
          objectiveScore += 1;
        }
      }

      if (q.type === "writing") {
        const text = String(answer || "").trim();
        if (text.length >= 120) {
          writingScore = 9;
          writingFeedback = "Strong written response with good detail and structure.";
        } else if (text.length >= 80) {
          writingScore = 7;
          writingFeedback = "Good response, but could use more detail and range.";
        } else if (text.length >= 40) {
          writingScore = 5;
          writingFeedback = "Basic response. More development is needed.";
        } else {
          writingScore = 3;
          writingFeedback = "Very limited writing sample.";
        }
      }

      if (q.type === "speaking") {
        const audio = String(answer || "").trim();
        if (audio.length > 1000) {
          speakingScore = 8;
          speakingFeedback = "Speaking response received successfully.";
          speakingTranscript = "Audio received and stored for review.";
        } else {
          speakingScore = 3;
          speakingFeedback = "Speaking response was too short or missing.";
          speakingTranscript = "";
        }
      }
    }

    const objectivePercent = objectiveTotal > 0
      ? Math.round((objectiveScore / objectiveTotal) * 100)
      : 0;

    const totalComposite = (
      (objectivePercent * 0.6) +
      (writingScore * 4 * 0.2) +
      (speakingScore * 4 * 0.2)
    );

    let estimatedLevel = "A0";
    if (totalComposite >= 85) estimatedLevel = "A2";
    else if (totalComposite >= 65) estimatedLevel = "A1+";
    else if (totalComposite >= 45) estimatedLevel = "A1";
    else estimatedLevel = "A0";

    const resultId = `${candidateCode}-${Date.now()}`;

    await db.collection("delfPlacementResults").doc(resultId).set({
      resultId,
      candidateCode,
      testType,
      testTitle: testTitle || "DELF Placement Test",
      objectiveScore,
      objectiveTotal,
      objectivePercent,
      writingScore,
      writingFeedback,
      speakingScore,
      speakingFeedback,
      speakingTranscript,
      answers,
      createdAt: new Date()
    });

    await db.collection("delfCandidates").doc(candidateCode).set({
      candidateCode,
      latestPlacementLevel: estimatedLevel,
      latestPlacementTest: testType,
      latestPlacementResultId: resultId,
      updatedAt: new Date()
    }, { merge: true });

    res.json({
      success: true,
      resultId,
      candidateCode,
      estimatedLevel,
      objectiveScore,
      objectiveTotal,
      objectivePercent,
      writingScore,
      writingFeedback,
      speakingScore,
      speakingFeedback,
      speakingTranscript
    });

  } catch (err) {
    console.error("evaluatePlacementTest error:", err);
    res.status(500).json({
      error: "Placement test evaluation failed",
      details: err.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

/* ==========================================
   START
========================================== */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 SayBon unified backend running on port " + PORT);
});

