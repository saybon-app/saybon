/*
========================================
SAYBON REQUEST → PAYMENT LINK FINAL
LEDGER INFUSED
========================================
*/

function saveAndGo(words,amount,delivery){

localStorage.setItem("saybon_words",words);

localStorage.setItem("saybon_amount",amount);

localStorage.setItem("saybon_delivery",delivery);

localStorage.setItem("saybon_currency","USD");


window.location.href="/translation/payment.html";

}
