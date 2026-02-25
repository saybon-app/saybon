
const btn = document.getElementById("quoteBtn");

const text = document.getElementById("quoteText");

const result = document.getElementById("quoteResult");


btn.onclick = ()=>{


text.innerHTML="Getting Quote ⏳";


setTimeout(()=>{


const words = 1200;

const standard = words*.025;

const express = words*.05;


result.innerHTML=`

<div class="quote-option standard glass"

onclick="location.href='/translation/payment.html?type=standard&price=${standard}'">

Standard

$${standard}

6–12 hrs

</div>


<div class="quote-option express glass"

onclick="location.href='/translation/payment.html?type=express&price=${express}'">

Express

$${express}

3–6 hrs

</div>

`;


text.innerHTML="Upload Document To Get Quote";


},1500);


};

