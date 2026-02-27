(function () {

const qs = new URLSearchParams(window.location.search);

const plan = (qs.get("plan") || "standard").toLowerCase();

const words = Math.max(0, parseInt(qs.get("words") || "0", 10));

const rateStandard = 0.025;
const rateExpress = 0.05;

const rate = plan === "express" ? rateExpress : rateStandard;

const totalUSD = words * rate;
const totalCents = Math.round(totalUSD * 100);

const elPlan = document.getElementById("planText");
const elWords = document.getElementById("wordsText");
const elTotal = document.getElementById("totalText");

const emailEl = document.getElementById("email");
const currencyEl = document.getElementById("currency");

const btnStripe = document.getElementById("btnStripe");
const btnPaystack = document.getElementById("btnPaystack");

function fmtMoneyUSD(v) {

return "US$" + (Math.round(v * 100) / 100).toFixed(2);

}

function setUI() {

if (elPlan) elPlan.textContent = plan;
if (elWords) elWords.textContent = words;
if (elTotal) elTotal.textContent = fmtMoneyUSD(totalUSD);

}

async function postJson(url, body) {

const res = await fetch(url, {

method: "POST",

headers: {

"Content-Type": "application/json"

},

body: JSON.stringify(body)

});

const json = await res.json();

if (!res.ok) throw new Error(json.error || "Payment error");

return json;

}

async function onStripe() {

try {

btnStripe.disabled = true;
btnStripe.textContent = "Redirecting...";

const currency = currencyEl.value || "USD";

const data = await postJson("/api/pay/stripe", {

amount: totalCents,
currency: currency,
plan: plan,
words: words

});

window.location.href = data.url;

}

catch (e) {

alert("Stripe error: " + e.message);

btnStripe.disabled = false;
btnStripe.textContent = "Pay with Stripe";

}

}

async function onPaystack() {

try {

const email = emailEl.value.trim();

if (!email) {

alert("Enter email first");

return;

}

btnPaystack.disabled = true;
btnPaystack.textContent = "Redirecting...";

const currency = currencyEl.value || "GHS";

const data = await postJson("/api/pay/paystack", {

amount: totalCents,
email: email,
currency: currency,
plan: plan,
words: words

});

window.location.href = data.url;

}

catch (e) {

alert("Paystack error: " + e.message);

btnPaystack.disabled = false;
btnPaystack.textContent = "Pay with Paystack";

}

}

btnStripe.onclick = onStripe;
btnPaystack.onclick = onPaystack;

setUI();

})();
