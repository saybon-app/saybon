const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(bodyParser.json());

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

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

app.get("/", (req, res) => {
  res.send("SayBon Clean Evaluation Server Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "CLEAN-EVALUATION-SERVER-LIVE",
    routes: [
      "/",
      "/api/health",
      "/api/evaluateTranslatorTest",
      "/api/applicationResult",
      "/api/verifyTranslatorKey"
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

    console.log("🔥 CLEAN EVALUATOR ROUTE HIT");

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
            content: "You are a strict JSON-only evaluator."
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
      console.error("OpenAI API error:", aiData);
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
      console.error("OpenAI JSON parse failed:", raw);
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
    console.error("evaluateTranslatorTest error:", err);
    return res.status(500).json({
      error: "AI evaluation failed",
      details: err.message
    });
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

    return res.json(doc.data());

  } catch (err) {
    console.error("applicationResult error:", err);
    return res.status(500).json({ error: "failed" });
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

    return res.json({ valid: true });

  } catch (err) {
    console.error("verifyTranslatorKey error:", err);
    return res.status(500).json({ valid: false });
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
  console.log("✅ SayBon clean evaluation server running on port " + PORT);
});