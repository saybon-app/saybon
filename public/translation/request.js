
const btn=document.getElementById("uploadBtn");

const text=document.getElementById("btnText");

const quotes=document.getElementById("quotes");

const wordDisplay=document.getElementById("wordCount");



btn.onclick=async()=>{


const file=document.getElementById("fileInput").files[0];

if(!file){

alert("Select file first");

return;

}


text.innerHTML="Getting Quote ⏳";


let words=0;


// exact txt word count

if(file.name.endsWith(".txt")){

const content=await file.text();

words=content.split(/\s+/).length;

}else{

// fallback estimate

words=Math.round(file.size/6);

}


wordDisplay.innerHTML=words+" words detected";


const standard=(words*.025).toFixed(2);

const express=(words*.05).toFixed(2);


let standardTime="";

let expressTime="";


if(words<=300){

standardTime="1–3 hrs";

expressTime="30–60 mins";

}

else if(words<=1000){

standardTime="3–6 hrs";

expressTime="1–3 hrs";

}

else if(words<=3000){

standardTime="6–12 hrs";

expressTime="3–6 hrs";

}

else{

standardTime="12–24 hrs";

expressTime="6–12 hrs";

}



quotes.innerHTML=

`<div class="quote standard"

onclick="location.href='/translation/payment.html?price=${standard}&type=standard'">

Standard<br>

$${standard}<br>

${standardTime}

</div>



<div class="quote express"

onclick="location.href='/translation/payment.html?price=${express}&type=express'">

Express<br>

$${express}<br>

${expressTime}

</div>`;


text.innerHTML="Upload Document To Get Quote";


};

