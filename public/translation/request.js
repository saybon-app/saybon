async function getQuote(){

const file=document.getElementById("fileInput").files[0];

if(!file){

alert("Please select a file");

return;

}


// ============================================
// WORD COUNT
// ============================================

let words=0;

if(file.name.toLowerCase().endsWith(".txt")){

const text=await file.text();

words=text.trim().split(/\s+/).length;

}

else{

words=Math.round(file.size/6);

}


// ============================================
// PRICE
// ============================================

const standardPrice=(words*0.025).toFixed(2);

const expressPrice=(words*0.05).toFixed(2);


// ============================================
// DELIVERY TIMELINES (WITH SPACED HYPHENS)
// ============================================

function getStandardTimeline(words){

if(words<=300) return "1 - 3 hours";

if(words<=1000) return "3 - 6 hours";

if(words<=3000) return "6 - 12 hours";

if(words<=6000) return "12 - 24 hours";

if(words<=10000) return "24 - 48 hours";

if(words<=20000) return "2 - 4 days";

return "Custom timeline";

}


function getExpressTimeline(words){

if(words<=300) return "30 - 60 minutes";

if(words<=1000) return "1 - 3 hours";

if(words<=3000) return "3 - 6 hours";

if(words<=6000) return "6 - 12 hours";

if(words<=10000) return "12 - 24 hours";

if(words<=20000) return "24 - 48 hours";

return "Custom timeline";

}


const standardTimeline=getStandardTimeline(words);

const expressTimeline=getExpressTimeline(words);


// ============================================
// DISPLAY
// ============================================

document.getElementById("wordCount").innerHTML=

"<br>"+words+" words";


document.getElementById("quote").innerHTML=`

<br>

<button onclick="location.href='/translation/payment.html?type=standard&price=${standardPrice}&words=${words}&delivery=${standardTimeline}'">

STANDARD — $${standardPrice} — ${standardTimeline}

</button>


<br><br>


<button onclick="location.href='/translation/payment.html?type=express&price=${expressPrice}&words=${words}&delivery=${expressTimeline}'">

EXPRESS — $${expressPrice} — ${expressTimeline}

</button>

`;

}
