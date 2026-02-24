/*
========================================
SAYBON REQUEST PAGE SCRIPT FINAL
========================================
*/

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const quoteCard = document.getElementById("quoteCard");

const wordCountText = document.getElementById("wordCount");
const standardBtn = document.getElementById("standardQuoteBtn");
const expressBtn = document.getElementById("expressQuoteBtn");

let originalBtnText = "Upload Document To Get Quote";


/*
========================================
BUTTON LOADING ANIMATION
========================================
*/

let dots = 0;
let loadingInterval;

function startLoadingAnimation(){

uploadBtn.disabled = true;

loadingInterval = setInterval(()=>{

dots++;

if(dots>3) dots=1;

uploadBtn.innerText =
"Getting quote " + ".".repeat(dots);

},400);

}

function stopLoadingAnimation(){

clearInterval(loadingInterval);

dots=0;

uploadBtn.disabled=false;

}



/*
========================================
WORD COUNT SIMULATION / API
========================================
*/

uploadBtn.onclick = async function(){

if(!fileInput.files.length){

alert("Select a file first");

return;

}

startLoadingAnimation();


/*
SIMULATE BACKEND CALL
Replace with real API if needed
*/

setTimeout(()=>{

const words = Math.floor(Math.random()*4000)+10;

showQuote(words);

},1500);

};



/*
========================================
SHOW QUOTE CARD
========================================
*/

function showQuote(words){

stopLoadingAnimation();


uploadBtn.innerText = "See quote 👇🏽";


setTimeout(()=>{

uploadBtn.innerText = originalBtnText;

},5000);



quoteCard.style.display="block";


quoteCard.style.opacity="0";

quoteCard.style.transform="translateY(20px)";


setTimeout(()=>{

quoteCard.style.transition="all .4s ease";

quoteCard.style.opacity="1";

quoteCard.style.transform="translateY(0)";

},50);



wordCountText.innerText = words + " words";



/*
CALCULATIONS
*/

const standardPrice =
(words * 0.025).toFixed(2);

const expressPrice =
(words * 0.05).toFixed(2);



const standardDelivery =
getStandardDelivery(words);

const expressDelivery =
getExpressDelivery(words);



standardBtn.innerHTML =
"Standard — $" +
standardPrice +
"<br>" +
standardDelivery;



expressBtn.innerHTML =
"Express — $" +
expressPrice +
"<br>" +
expressDelivery;



/*
SAVE DATA FOR PAYMENT PAGE
*/

standardBtn.onclick = function(){

saveAndGo(words,standardPrice,standardDelivery);

};

expressBtn.onclick = function(){

saveAndGo(words,expressPrice,expressDelivery);

};


}



/*
========================================
DELIVERY LOGIC
========================================
*/

function getStandardDelivery(words){

if(words<=300) return "1–3 hrs";

if(words<=1000) return "3–6 hrs";

if(words<=3000) return "6–12 hrs";

return "12–24 hrs";

}

function getExpressDelivery(words){

if(words<=300) return "30–60 mins";

if(words<=1000) return "1–3 hrs";

if(words<=3000) return "3–6 hrs";

return "6–12 hrs";

}



/*
========================================
SAVE AND GO PAYMENT
========================================
*/

function saveAndGo(words,amount,delivery){

localStorage.setItem("saybon_words",words);

localStorage.setItem("saybon_amount",amount);

localStorage.setItem("saybon_delivery",delivery);

localStorage.setItem("saybon_currency","USD");


window.location.href="/translation/payment.html";

}


