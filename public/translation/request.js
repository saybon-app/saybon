
async function getQuote(){

const file=document.getElementById("fileInput").files[0];

if(!file){

alert("Select file");

return;

}

let words=0;


// exact txt count

if(file.name.endsWith(".txt")){

const text=await file.text();

words=text.trim().split(/\s+/).length;

}

else{

words=Math.round(file.size/6);

}


document.getElementById("wordCount").innerHTML=

words+" words detected";


const standardPrice=(words*0.025).toFixed(2);

const expressPrice=(words*0.05).toFixed(2);



let standardTime="";
let expressTime="";


if(words<=300){

standardTime="1-3 hrs";
expressTime="30-60 mins";

}

else if(words<=1000){

standardTime="3-6 hrs";
expressTime="1-3 hrs";

}

else if(words<=3000){

standardTime="6-12 hrs";
expressTime="3-6 hrs";

}

else{

standardTime="12-24 hrs";
expressTime="6-12 hrs";

}


document.getElementById("quote").innerHTML=

`
<br>

<button onclick="location.href='/translation/payment.html?type=standard&price=${standardPrice}&words=${words}&delivery=${standardTime}'">

STANDARD — $${standardPrice} — ${standardTime}

</button>


<br><br>


<button onclick="location.href='/translation/payment.html?type=express&price=${expressPrice}&words=${words}&delivery=${expressTime}'">

EXPRESS — $${expressPrice} — ${expressTime}

</button>

`;

}

