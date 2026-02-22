
const fileInput=document.getElementById("file");

const fileName=document.getElementById("fileName");

const uploadBtn=document.getElementById("uploadBtn");

const quoteCard=document.getElementById("quoteCard");

const quoteText=document.getElementById("quoteText");

fileInput.onchange=()=>{

fileName.innerText=fileInput.files[0].name;

};


uploadBtn.onclick=async()=>{

const file=fileInput.files[0];

if(!file)return;

const form=new FormData();

form.append("file",file);

const res=await fetch(

"https://saybon-backend.onrender.com/api/quote",

{

method:"POST",

body:form

}

);

const data=await res.json();

quoteCard.classList.remove("hidden");

quoteText.innerText=

"Words: "+data.wordCount+

" Standard: $"+data.standard+

" Express: $"+data.express;

};

