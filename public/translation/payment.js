/*
========================================
SAYBON PAYMENT PAGE SCRIPT FINAL FIX
LEDGER INFUSED
========================================
*/

const wordsText =
document.getElementById("wordsText");

const amountText =
document.getElementById("amountText");

const deliveryText =
document.getElementById("deliveryText");

const currencySelect =
document.getElementById("currencySelect");


function loadPaymentData(){

const words =
localStorage.getItem("saybon_words");

const amount =
localStorage.getItem("saybon_amount");

const delivery =
localStorage.getItem("saybon_delivery");

const currency =
localStorage.getItem("saybon_currency") || "USD";



if(wordsText && words){

wordsText.innerText =
words + " words";

}


if(amountText && amount){

amountText.innerText =
currency + " " + amount;

}


if(deliveryText && delivery){

deliveryText.innerText =
delivery;

}


if(currencySelect && currency){

currencySelect.value =
currency;

}

}


loadPaymentData();

