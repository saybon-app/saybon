
/*
=====================================
RUN ONLY ON PAYMENT PAGE
=====================================
*/

if(!window.location.pathname.includes("payment.html")){

throw new Error("Stop payment.js");

}


/*
=====================================
LOAD DATA
=====================================
*/

const paymentRaw =
localStorage.getItem("saybon_payment");


if(!paymentRaw){

window.location.href="request.html";

}


const payment = JSON.parse(paymentRaw);



/*
=====================================
DISPLAY
=====================================
*/

document.getElementById("words").innerText =
payment.words;

document.getElementById("delivery").innerText =
payment.delivery;

document.getElementById("amount").innerText =
payment.amount;



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

body:JSON.stringify(payment)

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

body:JSON.stringify(payment)

})

.then(res=>res.json())

.then(data=>{

window.location.href=data.url;

});

}

