
/*
=====================================
LOAD PAYMENT DATA
=====================================
*/

const paymentRaw = localStorage.getItem("saybon_payment");


/*
=====================================
IF NO DATA — SILENTLY REDIRECT BACK
=====================================
*/

if(!paymentRaw){

window.location.href="request.html";

}



/*
=====================================
PARSE DATA
=====================================
*/

const payment = JSON.parse(paymentRaw);



/*
=====================================
DISPLAY DATA
=====================================
*/

document.getElementById("words").innerText =
payment.words || "-";


document.getElementById("delivery").innerText =
payment.delivery || "-";


document.getElementById("amount").innerText =
payment.amount || "-";



/*
=====================================
STRIPE
=====================================
*/

function payStripe(){

fetch("https://saybon-backend.onrender.com/api/stripe/create-stripe-session",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

amount: payment.amount,

currency: document.getElementById("currency").value

})

})

.then(res=>res.json())

.then(data=>{

window.location.href=data.url;

});

}



/*
=====================================
PAYSTACK
=====================================
*/

function payPaystack(){

fetch("https://saybon-backend.onrender.com/api/paystack/initialize",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

amount: payment.amount,

currency: document.getElementById("currency").value

})

})

.then(res=>res.json())

.then(data=>{

window.location.href=data.url;

});

}



