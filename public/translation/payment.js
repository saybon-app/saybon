const payment=JSON.parse(

localStorage.getItem("saybon_payment")

);



if(!payment){

alert("No payment data found");

}



document.getElementById("words").innerText=

payment.words;



document.getElementById("delivery").innerText=

payment.delivery;



document.getElementById("amount").innerText=

payment.amount;



function payStripe(){

window.location.href=

"https://saybon-backend.onrender.com/api/stripe/create-stripe-session";

}



function payPaystack(){

window.location.href=

"https://saybon-backend.onrender.com/api/paystack/initialize";

}
