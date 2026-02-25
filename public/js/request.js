
const fileInput=document.getElementById("fileInput");

const uploadBtn=document.getElementById("uploadBtn");

const fileName=document.getElementById("fileName");

const wordCountBox=document.getElementById("wordCountBox");

const quoteBox=document.getElementById("quoteBox");



fileInput.onchange=()=>{

fileName.innerText=fileInput.files[0].name;

};



uploadBtn.onclick=()=>{


uploadBtn.innerText="Getting quote ⏳";



setTimeout(()=>{


let words= Math.floor(Math.random()*4000)+100;


wordCountBox.innerHTML="Word count: "+words;



let standard=words*0.025;

let express=words*0.05;



quoteBox.innerHTML=`

<div class="quote-card standard">

Standard — $${standard.toFixed(2)}

</div>



<div class="quote-card express">

Express — $${express.toFixed(2)}

</div>

`;



uploadBtn.innerText="Upload Document To Get Quote";



},2000);


};

