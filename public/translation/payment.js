/*
========================================
SAYBON PAYMENT PAGE SCRIPT FINAL
========================================
*/


const wordsText =
document.getElementById("paymentWords");

const deliveryText =
document.getElementById("paymentDelivery");

const amountText =
document.getElementById("paymentAmount");

const currencyText =
document.getElementById("paymentCurrency");



/*
========================================
LOAD DATA
========================================
*/

function loadPaymentData(){


const words =
localStorage.getItem("saybon_words");

const amount =
localStorage.getItem("saybon_amount");

const delivery =
localStorage.getItem("saybon_delivery");

const currency =
localStorage.getItem("saybon_currency");



if(words){

wordsText.innerText = words;

}


if(amount){

amountText.innerText =
currency + " " + amount;

}


if(delivery){

deliveryText.innerText = delivery;

}


if(currency){

currencyText.innerText = currency;

}


}



loadPaymentData();


