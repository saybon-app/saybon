let currentWords = 0;



function uploadFile(){



const file = document.getElementById("fileInput").files[0];



if(!file){

alert("Select file");

return;

}



const btn = document.getElementById("uploadBtn");



btn.innerText="Getting Quote ⏳";



const reader = new FileReader();



reader.onload=function(e){

const text=e.target.result;



const words=text.split(/\s+/).length;



currentWords=words;



showQuote(words);



btn.innerText="See Quote 👇🏽";



setTimeout(()=>{

btn.innerText="Upload Document To Get Quote";

},5000);



};



reader.readAsText(file);



}



function showQuote(words){



const standardPrice=(words*0.025).toFixed(2);

const expressPrice=(words*0.05).toFixed(2);



const standardDelivery=getStandardDelivery(words);

const expressDelivery=getExpressDelivery(words);



const html=`



<div class="quoteCardContainer">



<div class="wordCount">

${words} words

</div>



<div class="directive">

Select preferred quote to proceed to payment

</div>



<div class="quoteOptions">



<div class="quoteCard standard"

onclick="goPayment('standard',${standardPrice},'${standardDelivery}')">

Standard — $${standardPrice}

<div class="delivery">

${standardDelivery}

</div>

</div>



<div class="quoteCard express"

onclick="goPayment('express',${expressPrice},'${expressDelivery}')">

Express — $${expressPrice}

<div class="delivery">

${expressDelivery}

</div>

</div>



</div>



</div>

`;



document.getElementById("quoteSection").innerHTML=html;



}



function goPayment(type,amount,delivery){



const payment={

words:currentWords,

amount:amount,

delivery:delivery,

currency:"USD",

type:type

};



localStorage.setItem(

"saybon_payment",

JSON.stringify(payment)

);



window.location.href="payment.html";



}



function getStandardDelivery(words){

if(words<=300)return "1–3 hrs";

if(words<=1000)return "3–6 hrs";

if(words<=3000)return "6–12 hrs";

return "12–24 hrs";

}



function getExpressDelivery(words){

if(words<=300)return "30–60 mins";

if(words<=1000)return "1–3 hrs";

if(words<=3000)return "3–6 hrs";

return "6–12 hrs";

}
