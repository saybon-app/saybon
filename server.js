const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore()

app.get("/", (req,res)=>{
  res.send("SayBon Root API Running");
});

app.get("/health", (req,res)=>{
  res.json({
    ok:true,
    service:"saybon-root-api",
    timestamp:new Date().toISOString()
  });
});
;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function generateKey() {
  return "SB-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function safeLower(v) {
  return String(v || "").toLowerCase();
}

// ----------------------------------------------
// EVALUATE TRANSLATOR TEST
// ----------------------------------------------
app.post("/api/evaluateTranslator", async (req, res) => {
  try {
    const { accuracy, terminology, grammar, tone, email } = req.body;

    const finalScore = Math.round(
      (Number(accuracy || 0) + Number(terminology || 0) + Number(grammar || 0) + Number(tone || 0)) / 4
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
      applicationId: ref.id
    });
  } catch (err) {
    console.error("evaluateTranslator error:", err);
    res.status(500).json({ error: "evaluation failed" });
  }
});

// ----------------------------------------------
// GET RESULT
// ----------------------------------------------
app.get("/api/applicationResult", async (req, res) => {
  try {
    const id = req.query.id;
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

// ----------------------------------------------
// VERIFY TRANSLATOR KEY
// ----------------------------------------------
app.post("/api/verifyTranslatorKey", async (req, res) => {
  try {
    const key = req.body.key;

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

// ----------------------------------------------
// CREATE TRANSLATION JOB
// ----------------------------------------------
app.post("/api/createJob", async (req, res) => {
  try {
    const { clientEmail, sourceLanguage, targetLanguage, wordCount, price } = req.body;

    const ref = db.collection("translationJobs").doc();

    await ref.set({
      clientEmail,
      sourceLanguage,
      targetLanguage,
      wordCount,
      price,
      status: "open",
      translator: null,
      created: new Date()
    });

    res.json({ jobId: ref.id });
  } catch (err) {
    console.error("createJob error:", err);
    res.status(500).json({ error: "job creation failed" });
  }
});

// ----------------------------------------------
// GET JOB BOARD
// ----------------------------------------------
app.get("/api/jobs", async (req, res) => {
  try {
    const snapshot = await db.collection("translationJobs")
      .where("status", "==", "open")
      .get();

    const jobs = [];

    snapshot.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(jobs);
  } catch (err) {
    console.error("jobs error:", err);
    res.status(500).json({ error: "failed" });
  }
});

// ----------------------------------------------
// CLAIM JOB
// ----------------------------------------------
app.post("/api/claimJob", async (req, res) => {
  try {
    const { jobId, passkey } = req.body;

    const translatorSnapshot = await db.collection("translatorApplications")
      .where("passkey", "==", passkey)
      .get();

    if (translatorSnapshot.empty) {
      return res.json({ error: "invalid translator" });
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

// ----------------------------------------------
// SUBMIT TRANSLATION
// ----------------------------------------------
app.post("/api/submitTranslation", async (req, res) => {
  try {
    const { jobId, passkey, translation } = req.body;

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

// ----------------------------------------------
// TRANSLATOR STATS
// ----------------------------------------------
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

    res.json({
      jobsCompleted: completed
    });
  } catch (err) {
    console.error("translatorStats error:", err);
    res.status(500).json({ error: "stats failed" });
  }
});

// ----------------------------------------------
// CREATE TRANSLATION JOB AUTOMATICALLY
// ----------------------------------------------
app.post("/api/createTranslationJob", async (req, res) => {
  try {
    const { clientEmail, wordCount, service } = req.body;

    let price = 0;

    if (service === "standard") {
      price = Number(wordCount || 0) * 0.025;
    } else {
      price = Number(wordCount || 0) * 0.05;
    }

    const ref = db.collection("translationJobs").doc();

    await ref.set({
      clientEmail,
      wordCount,
      service,
      price,
      status: "open",
      translator: null,
      created: new Date()
    });

    res.json({
      jobId: ref.id,
      price
    });
  } catch (err) {
    console.error("createTranslationJob error:", err);
    res.status(500).json({ error: "job creation failed" });
  }
});

// ----------------------------------------------
// EVALUATE TRANSLATION TEST
// ----------------------------------------------
app.post("/api/evaluateTranslatorTest", async (req, res) => {
  try {
    const { testId, email } = req.body;

    const testDoc = await db.collection("translatorTests").doc(testId).get();

    if (!testDoc.exists) {
      return res.status(404).json({ error: "test not found" });
    }

    const test = testDoc.data();

    const english = safeLower(test.englishTranslation);
    const french = safeLower(test.frenchTranslation);

    let accuracy = 0;
    let terminology = 0;
    let grammar = 0;
    let tone = 0;

    const englishKeywords = [
      "unauthorized",
      "use",
      "document",
      "strictly",
      "prohibited",
      "legal"
    ];

    englishKeywords.forEach(k => {
      if (english.includes(k)) accuracy += 8;
    });

    accuracy = Math.min(accuracy, 40);

    const frenchKeywords = [
      "système",
      "chiffre",
      "informations",
      "sensibles",
      "serveur"
    ];

    frenchKeywords.forEach(k => {
      if (french.includes(k)) terminology += 5;
    });

    terminology = Math.min(terminology, 25);

    grammar = 18;
    tone = 12;

    const finalScore = Math.round(accuracy + terminology + grammar + tone);
    const passkey = generateKey();
    const applicationId = crypto.randomUUID();

    await db.collection("translatorApplications").doc(applicationId).set({
      email,
      englishTranslation: test.englishTranslation,
      frenchTranslation: test.frenchTranslation,
      accuracy,
      terminology,
      grammar,
      tone,
      finalScore,
      passkey,
      created: new Date()
    });

    res.json({
      applicationId,
      finalScore
    });
  } catch (err) {
    console.error("evaluateTranslatorTest error:", err);
    res.status(500).json({ error: "evaluation failed" });
  }
});

// ----------------------------------------------
// HELPERS FOR DELF AI ENGINE
// ----------------------------------------------
function scoreObjectiveAnswers(questions = [], answers = {}) {
  let score = 0;
  let total = 0;

  questions.forEach((q, index) => {
    if ((q.type === "listening" || q.type === "reading") && typeof q.answer !== "undefined") {
      total += 1;
      if (String(answers[index] ?? "") === String(q.answer)) {
        score += 1;
      }
    }
  });

  return { score, total };
}

function estimatePlacementLevel(testType, objectivePercent, writingScore, speakingScore) {
  const combined = Math.round((objectivePercent * 0.5) + (writingScore * 5 * 0.25) + (speakingScore * 5 * 0.25));

  if (testType === "prim") {
    if (combined >= 85) return "DELF Prim A1.1+";
    if (combined >= 70) return "DELF Prim A1.1";
    if (combined >= 55) return "DELF Prim Pré-A1 / A1 bridge";
    return "DELF Prim Pré-A1";
  }

  if (combined >= 88) return "B2";
  if (combined >= 78) return "B1";
  if (combined >= 65) return "A2";
  if (combined >= 50) return "A1";
  return "Below A1";
}

async function scoreWritingWithAI(questionText, answerText, testType) {
  if (!answerText || !answerText.trim()) {
    return {
      score: 0,
      feedback: "No written response submitted."
    };
  }

  const prompt = `
You are a DELF examiner.
Score this learner's WRITING response for a ${testType} French placement test.

Question:
${questionText}

Student response:
${answerText}

Return ONLY valid JSON:
{
  "score": 0-10,
  "feedback": "short teacher-style feedback"
}
`;

  const resp = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const text = resp.output_text || "{}";

  try {
    const parsed = JSON.parse(text);
    return {
      score: Number(parsed.score || 0),
      feedback: parsed.feedback || "No writing feedback returned."
    };
  } catch {
    return {
      score: 5,
      feedback: "Writing reviewed, but feedback formatting was imperfect."
    };
  }
}

async function transcribeSpeech(base64Audio) {
  if (!base64Audio) {
    return "";
  }

  const buffer = Buffer.from(base64Audio, "base64");

  const file = new File([buffer], "speech.webm", { type: "audio/webm" });

  const transcript = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe"
  });

  return transcript.text || "";
}

async function scoreSpeakingWithAI(questionText, transcriptText, testType) {
  if (!transcriptText || !transcriptText.trim()) {
    return {
      score: 0,
      feedback: "No spoken response captured."
    };
  }

  const prompt = `
You are a DELF examiner.
Score this learner's SPEAKING response for a ${testType} French placement test.

Question:
${questionText}

Speech transcript:
${transcriptText}

Return ONLY valid JSON:
{
  "score": 0-10,
  "feedback": "short teacher-style feedback"
}
`;

  const resp = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const text = resp.output_text || "{}";

  try {
    const parsed = JSON.parse(text);
    return {
      score: Number(parsed.score || 0),
      feedback: parsed.feedback || "No speaking feedback returned."
    };
  } catch {
    return {
      score: 5,
      feedback: "Speaking reviewed, but feedback formatting was imperfect."
    };
  }
}

// ----------------------------------------------
// DELF AI PLACEMENT TEST EVALUATION
// ----------------------------------------------
app.post("/api/evaluatePlacementTest", async (req, res) => {
  try {
    const { testType, testTitle, questions, answers } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: "questions missing" });
    }

    const safeAnswers = answers || {};

    const objective = scoreObjectiveAnswers(questions, safeAnswers);
    const objectivePercent = objective.total > 0
      ? Math.round((objective.score / objective.total) * 100)
      : 0;

    const writingQuestion = questions.find(q => q.type === "writing");
    const writingIndex = questions.findIndex(q => q.type === "writing");
    const writingAnswer = writingIndex >= 0 ? String(safeAnswers[writingIndex] || "") : "";

    const speakingQuestion = questions.find(q => q.type === "speaking");
    const speakingIndex = questions.findIndex(q => q.type === "speaking");
    const speakingAudioBase64 = speakingIndex >= 0 ? String(safeAnswers[speakingIndex] || "") : "";

    let writingResult = { score: 0, feedback: "No writing task found." };
    let speakingTranscript = "";
    let speakingResult = { score: 0, feedback: "No speaking task found." };

    if (writingQuestion) {
      writingResult = await scoreWritingWithAI(
        writingQuestion.question || writingQuestion.prompt || "",
        writingAnswer,
        testType || "general"
      );
    }

    if (speakingQuestion && speakingAudioBase64) {
      speakingTranscript = await transcribeSpeech(speakingAudioBase64);
      speakingResult = await scoreSpeakingWithAI(
        speakingQuestion.question || speakingQuestion.prompt || "",
        speakingTranscript,
        testType || "general"
      );
    }

    const estimatedLevel = estimatePlacementLevel(
      testType || "general",
      objectivePercent,
      Number(writingResult.score || 0),
      Number(speakingResult.score || 0)
    );

    const summary = {
      testType: testType || "general",
      title: testTitle || "Placement Test",
      objectiveScore: objective.score,
      objectiveTotal: objective.total,
      objectivePercent,
      writingScore: Number(writingResult.score || 0),
      writingFeedback: writingResult.feedback || "",
      speakingScore: Number(speakingResult.score || 0),
      speakingFeedback: speakingResult.feedback || "",
      speakingTranscript,
      estimatedLevel,
      created: new Date()
    };

    const ref = await db.collection("placementResults").add(summary);

    res.json({
      success: true,
      resultId: ref.id,
      ...summary
    });
  } catch (err) {
    console.error("evaluatePlacementTest error:", err);
    res.status(500).json({
      error: "placement evaluation failed",
      message: err.message || "unknown error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SayBon API running on port " + PORT);
});


