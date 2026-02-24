/* ============================================
SayBon Translation Request
FINAL LOCKED VERSION
Quote Cards → Payment Integration
============================================ */

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const quoteArea = document.getElementById("quoteArea");

let wordCount = 0;


/* =============================
WORD COUNT SIMULATION
(Replace later with backend)
============================= */

function calculateWords(file){

return new Promise(resolve=>{

setTimeout(()=>{

resolve( Math.floor(Math.random()*4000)+50 );

},1200);

});

}


/* =============================
PRICING ENGINE
============================= */

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

function getStandardPrice(words){

return (words*0.025).toFixed(2);

}

function getExpressPrice(words){

return (words*0.05).toFixed(2);

}


/* =============================
SEND TO PAYMENT PAGE
============================= */

function goToPayment(type, words, price, delivery){

const currency="USD";

localStorage.setItem("saybon_words",words);
localStorage.setItem("saybon_amount",price);
localStorage.setItem("saybon_delivery",delivery);
localStorage.setItem("saybon_currency",currency);

window.location.href=
`/translation/payment.html?words=${words}&amount=${price}&delivery=${encodeURIComponent(delivery)}&currency=${currency}`;

}


/* =============================
BUILD QUOTE CARD
============================= */

function showQuote(words){

const standardPrice=getStandardPrice(words);
const expressPrice=getExpressPrice(words);

const standardDelivery=getStandardDelivery(words);
const expressDelivery=getExpressDelivery(words);


quoteArea.innerHTML=`

<div class="quoteWords">

${words} words

</div>


<div class="quoteDirective">

Select your preferred quote to proceed to payment

</div>


<div class="quoteCards">


<div class="quoteCard standardCard">

<div class="quoteTitle">

Standard

</div>

<div class="quotePrice">

USD ${standardPrice}

</div>

<div class="quoteDelivery">

${standardDelivery}

</div>

</div>


<div class="quoteCard expressCard">

<div class="quoteTitle">

Express

</div>

<div class="quotePrice">

USD ${expressPrice}

</div>

<div class="quoteDelivery">

${expressDelivery}

</div>

</div>


</div>

`;



document.querySelector(".standardCard").onclick=()=>{

goToPayment(

"standard",

words,

standardPrice,

standardDelivery

);

};



document.querySelector(".expressCard").onclick=()=>{

goToPayment(

"express",

words,

expressPrice,

expressDelivery

);

};


}



/* =============================
UPLOAD BUTTON CLICK
============================= */

uploadBtn.onclick=async()=>{

const file=fileInput.files[0];

if(!file){

alert("Please select a file");

return;

}


uploadBtn.disabled=true;


uploadBtn.innerHTML=`

Getting quote

<span class="loader"></span>

`;


wordCount=await calculateWords(file);


uploadBtn.disabled=false;

uploadBtn.innerHTML="Upload Document To Get Quote";


showQuote(wordCount);


};

