/*
============================
LOAD PAYMENT DATA
============================
*/

function loadPayment(){

const data = localStorage.getItem("saybon_payment");

if(!data){

alert("No payment data found");
return;

}

const payment = JSON.parse(data);


document.getElementById("payWords").innerText = payment.words;


document.getElementById("payDelivery").innerText = payment.delivery;


document.getElementById("payAmount").innerText =

payment.currency + " " + payment.amount.toFixed(2);


}


/*
============================
STRIPE
============================
*/


document.getElementById("stripeBtn").onclick = async () => {


const payment = JSON.parse(localStorage.getItem("saybon_payment"));


const res = await fetch("/api/stripe/create-stripe-session",{


method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

amount:payment.amount

})


});


const data = await res.json();


window.location = data.url;


};



/*
============================
PAYSTACK
============================
*/


document.getElementById("paystackBtn").onclick = async () => {


const payment = JSON.parse(localStorage.getItem("saybon_payment"));


const res = await fetch("/api/paystack/initialize",{


method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

amount:payment.amount,

email:"customer@saybon.com"

})


});


const data = await res.json();


window.location = data.url;


};



loadPayment();

