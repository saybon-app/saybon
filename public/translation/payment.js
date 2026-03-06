/* =====================================
   SAYBON PAYMENT SCRIPT
   Stripe Only (USD Default)
===================================== */

const qs = new URLSearchParams(location.search);

const plan = qs.get("plan");
const words = Number(qs.get("words"));

/* =========================
   PRICE CALCULATION
========================= */

const price = words * (plan === "express" ? 0.05 : 0.025);


/* =========================
   DISPLAY SUMMARY
========================= */

document.getElementById("summary").innerHTML =
plan.toUpperCase() + "<br>" +
words + " words<br>" +
"$" + price.toFixed(2);


/* =========================
   STRIPE PAYMENT
========================= */

document.getElementById("stripeBtn").onclick = async () => {

try{

const res = await fetch(
"https://saybon-server.onrender.com/api/stripePay",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
amount: Math.round(price * 100),
currency: "usd",
words: words,
plan: plan
})
}
);

const data = await res.json();

if(data.url){

/* Redirect to Stripe Checkout */
location = data.url;

}else{

alert("Stripe payment failed");

}

}catch(err){

console.error(err);
alert("Payment connection error");

}

};




/* ===========================
   STRIPE SESSION VERIFY
   (Secure invoice source)
=========================== */

app.get("/api/stripeSession/:id", async (req, res) => {
  try {
    const sessionId = req.params.id;

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Invalid Stripe session" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // PaymentIntent gives the definitive amount actually paid.
    let amount = session.amount_total ?? session.amount_subtotal ?? 0;
    let currency = session.currency ?? "usd";
    let status = session.payment_status ?? "unpaid";

    if (session.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent.toString());
      amount = pi.amount_received ?? pi.amount ?? amount;
      currency = pi.currency ?? currency;
      status = pi.status ?? status;
    }

    return res.json({
      ok: true,
      sessionId: session.id,
      status,
      amount,     // cents
      currency,   // "usd"
      customer_email: session.customer_details?.email || null,
      metadata: session.metadata || {}
    });

  } catch (err) {
    return res.status(400).json({ error: "Invalid Stripe session" });
  }
});

