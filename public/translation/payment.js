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
"https://saybon-server.onrender.com/api/stripe",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
amount: price,
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
alert("err.message");

}

};
