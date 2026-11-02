// DELF preparation payments: price list, checkout (Stripe in USD or Paystack in GHS) and verification.
//   GET  /api/delf/prices                  (optional Bearer token -> marks the levels you already own)
//   POST /api/delf/checkout  { exam, provider: "stripe" | "paystack" }   (Bearer token)
//   GET  /api/delf/verify?session_id=..  or  ?reference=..                (Bearer token)
// Access is recorded in Firestore delfAccess/{uid}.{exam}.granted, which the DELF dashboard already reads.
module.exports = function (app, ctx) {
  var admin = ctx.admin, db = ctx.db, express = ctx.express, logIncome = ctx.logIncome || null;
  var SITE = "https://saybonapp.com";
  var ADMINS = ["saybon.fr@gmail.com", "adlaideduah@gmail.com"];
  var isAdmin = function (who) { return !!(who && who.email && ADMINS.indexOf(String(who.email).toLowerCase()) >= 0); };
  // USD prices, as published on the DELF page
  var PRICES_USD = { a1: 12, a2: 17, b1: 25, b2: 29, c1: 34, prim: 12, junior: 12 };
  var LABELS = { a1: "DELF A1", a2: "DELF A2", b1: "DELF B1", b2: "DELF B2", c1: "DELF C1", prim: "DELF Prim", junior: "DELF Junior" };
  var ORDER = ["a1", "a2", "b1", "b2", "c1", "prim", "junior"];

  async function uidFrom(req, res, optional) {
    var h = req.headers.authorization || "";
    var t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) { if (optional) return { uid: null }; res.status(401).json({ error: "authentication required" }); return null; }
    try { var d = await admin.auth().verifyIdToken(t); return { uid: d.uid, email: d.email || null }; }
    catch (e) { if (optional) return { uid: null }; res.status(401).json({ error: "authentication failed" }); return null; }
  }

  var rateCache = { rate: null, at: 0 };
  async function ghsRate() {
    if (rateCache.rate && Date.now() - rateCache.at < 3600 * 1000) return rateCache.rate;
    try {
      var r = await fetch("https://open.er-api.com/v6/latest/USD");
      var d = await r.json();
      if (d && d.rates && d.rates.GHS) { rateCache = { rate: d.rates.GHS, at: Date.now() }; return rateCache.rate; }
    } catch (e) { console.error("delf prices: rate lookup failed", e.message); }
    return rateCache.rate;     // last known rate, or null
  }
  var ghsFor = function (usd, rate) { return rate ? Math.round(usd * rate) : null; };

  async function owned(uid) {
    if (!uid) return {};
    try { var s = await db.collection("delfAccess").doc(uid).get(); return s.exists ? s.data() : {}; } catch (e) { return {}; }
  }

  app.get("/api/delf/prices", async function (req, res) {
    try {
      var who = await uidFrom(req, res, true);
      var rate = await ghsRate(), acc = await owned(who.uid);
      res.json({
        rate: rate || null,
        admin: isAdmin(who),
        items: ORDER.map(function (k) { return { exam: k, label: LABELS[k], usd: PRICES_USD[k], ghs: ghsFor(PRICES_USD[k], rate), owned: !!(acc[k] && acc[k].granted) }; })
      });
    } catch (e) { console.error("delf prices", e); res.status(500).json({ error: "could not load prices" }); }
  });

  // Admin-only switch: unlock (or lock again) a level for yourself without paying, to test the mocks.
  app.post("/api/delf/admin-grant", express.json({ limit: "2kb" }), async function (req, res) {
    var who = await uidFrom(req, res); if (!who) return;
    if (!isAdmin(who)) return res.status(403).json({ error: "not allowed" });
    try {
      var exam = String((req.body && req.body.exam) || "").toLowerCase(), lock = !!(req.body && req.body.lock);
      if (!PRICES_USD[exam]) return res.status(400).json({ error: "unknown level" });
      var o = {};
      o[exam] = lock ? { granted: false, revokedAt: admin.firestore.FieldValue.serverTimestamp() } : { granted: true, provider: "admin", sessionId: "admin", purchasedAt: admin.firestore.FieldValue.serverTimestamp() };
      await db.collection("delfAccess").doc(who.uid).set(o, { merge: true });
      res.json({ ok: true, exam: exam, granted: !lock });
    } catch (e) { console.error("delf admin-grant", e); res.status(500).json({ error: "could not update access" }); }
  });

  app.post("/api/delf/checkout", express.json({ limit: "5kb" }), async function (req, res) {
    var who = await uidFrom(req, res); if (!who) return;
    try {
      var exam = String((req.body && req.body.exam) || "").toLowerCase(), provider = String((req.body && req.body.provider) || "");
      if (!PRICES_USD[exam]) return res.status(400).json({ error: "unknown exam" });
      var acc = await owned(who.uid);
      if (acc[exam] && acc[exam].granted) return res.status(409).json({ error: "you already have access to this level" });
      var usd = PRICES_USD[exam];

      if (provider === "stripe") {
        if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "card payments are not configured" });
        var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        var session = await stripe.checkout.sessions.create({
          mode: "payment", payment_method_types: ["card"],
          customer_email: who.email || undefined,
          line_items: [{ price_data: { currency: "usd", product_data: { name: LABELS[exam] + " preparation" }, unit_amount: usd * 100 }, quantity: 1 }],
          metadata: { uid: who.uid, exam: exam },
          success_url: SITE + "/delf/payment-success.html?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: SITE + "/delf/payment.html?exam=" + encodeURIComponent(exam)
        });
        return res.json({ url: session.url });
      }

      if (provider === "paystack") {
        var key = process.env.PAYSTACK_SECRET_KEY;
        if (!key) return res.status(500).json({ error: "cedi payments are not configured" });
        if (!who.email) return res.status(400).json({ error: "your account has no email address" });
        var rate = await ghsRate(), ghs = ghsFor(usd, rate);
        if (!ghs) return res.status(503).json({ error: "the cedi price is unavailable right now, please try again" });
        var ref = "delf_" + who.uid.slice(0, 8) + "_" + Date.now();
        var r = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
          body: JSON.stringify({ email: who.email, amount: ghs * 100, currency: "GHS", reference: ref, callback_url: SITE + "/delf/payment-success.html", metadata: { uid: who.uid, exam: exam } })
        });
        var d = await r.json();
        if (!r.ok || !d.status || !d.data || !d.data.authorization_url) { console.error("delf paystack init", r.status, JSON.stringify(d).slice(0, 200)); return res.status(502).json({ error: "could not start the cedi payment" }); }
        await db.collection("delfPayments").doc(ref).set({ uid: who.uid, exam: exam, currency: "GHS", amount: ghs, provider: "paystack", status: "pending", createdAt: admin.firestore.FieldValue.serverTimestamp() });
        return res.json({ url: d.data.authorization_url });
      }
      res.status(400).json({ error: "choose card or cedis" });
    } catch (e) { console.error("delf checkout", e); res.status(500).json({ error: "could not start payment" }); }
  });

  async function grant(uid, exam, ref, provider, amount, currency) {
    await db.collection("delfAccess").doc(uid).set(
      (function () { var o = {}; o[exam] = { granted: true, sessionId: ref, provider: provider, purchasedAt: admin.firestore.FieldValue.serverTimestamp() }; return o; })(),
      { merge: true });
    if (logIncome) { try { await logIncome("delf_" + provider + "_" + ref, amount, currency, "DELF Exam Prep", "Auto-logged DELF payment for " + LABELS[exam]); } catch (e) { console.error("delf income log", e.message); } }
  }

  app.get("/api/delf/verify", async function (req, res) {
    var who = await uidFrom(req, res); if (!who) return;
    try {
      if (req.query.session_id) {
        if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "card payments are not configured" });
        var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        var s = await stripe.checkout.sessions.retrieve(String(req.query.session_id));
        var md = s.metadata || {};
        if (s.payment_status !== "paid" || md.uid !== who.uid || !PRICES_USD[md.exam]) return res.json({ verified: false });
        await grant(who.uid, md.exam, s.id, "stripe", (s.amount_total || 0) / 100, (s.currency || "usd").toUpperCase());
        return res.json({ verified: true, exam: md.exam, examLabel: LABELS[md.exam] });
      }
      var ref = String(req.query.reference || req.query.trxref || "");
      if (ref) {
        var key = process.env.PAYSTACK_SECRET_KEY;
        if (!key) return res.status(500).json({ error: "cedi payments are not configured" });
        var doc = await db.collection("delfPayments").doc(ref).get();
        if (!doc.exists || doc.data().uid !== who.uid) return res.json({ verified: false });
        var pd = doc.data();
        var r = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref), { headers: { Authorization: "Bearer " + key } });
        var d = await r.json();
        var ok = d && d.status && d.data && d.data.status === "success" && d.data.amount >= pd.amount * 100;
        if (!ok) return res.json({ verified: false });
        await db.collection("delfPayments").doc(ref).update({ status: "paid" });
        await grant(who.uid, pd.exam, "paystack_" + ref, "paystack", d.data.amount / 100, d.data.currency || "GHS");
        return res.json({ verified: true, exam: pd.exam, examLabel: LABELS[pd.exam] });
      }
      res.status(400).json({ error: "no payment reference" });
    } catch (e) { console.error("delf verify", e); res.status(500).json({ error: "could not verify payment" }); }
  });
};
