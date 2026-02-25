
const btn = document.getElementById("quoteBtn");

const cards = document.getElementById("quoteCards");



btn.onclick = async function(){


btn.classList.add("loading");

btn.innerHTML = "Getting Quote ?";


await new Promise(r => setTimeout(r,1200));



const words = 1600;


const standardPrice = (words*0.025).toFixed(2);

const expressPrice = (words*0.05).toFixed(2);



document.getElementById("standardPrice").innerHTML = "$"+standardPrice;

document.getElementById("expressPrice").innerHTML = "$"+expressPrice;



document.getElementById("standardTime").innerHTML = "6–12 hrs";

document.getElementById("expressTime").innerHTML = "3–6 hrs";



cards.classList.remove("hidden");



btn.innerHTML = "Upload Document To Get Quote";

btn.classList.remove("loading");



};



document.getElementById("standardQuote").onclick=function(){

window.location.href="/translation/payment.html";

};



document.getElementById("expressQuote").onclick=function(){

window.location.href="/translation/payment.html";

};

