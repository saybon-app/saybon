
const fileInput = document.getElementById("fileInput");

const quoteBtn = document.getElementById("quoteBtn");

const quoteCards = document.getElementById("quoteCards");


quoteBtn.onclick = function(){


const words = 800;


const standard = words * 0.025;

const express = words * 0.05;



document.getElementById("standardPrice").innerText = "$" + standard;

document.getElementById("expressPrice").innerText = "$" + express;



document.getElementById("standardTime").innerText = "3–6 hrs";

document.getElementById("expressTime").innerText = "1–3 hrs";


quoteCards.classList.remove("hidden");



};



document.getElementById("standardQuote").onclick = function(){

window.location.href = "/translation/payment.html";

};



document.getElementById("expressQuote").onclick = function(){

window.location.href = "/translation/payment.html";

};

