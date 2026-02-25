
const uploadBtn = document.getElementById("uploadBtn");

const fileInput = document.getElementById("fileInput");

const wordCountDiv = document.getElementById("wordCount");

const quoteArea = document.getElementById("quoteArea");



uploadBtn.onclick=()=>{

fileInput.click();

};



fileInput.onchange=()=>{

const file=fileInput.files[0];

if(!file)return;



uploadBtn.innerText="Getting Quote ?";



const reader=new FileReader();



reader.onload=function(e){



const text=e.target.result;



const words=text.split(/\s+/).length;



wordCountDiv.innerText="Words: "+words;



createQuote(words);



};



reader.readAsText(file);



};



function createQuote(words){



quoteArea.innerHTML="";



const standard=words*0.025;

const express=words*0.05;



const sCard=document.createElement("div");

sCard.className="quoteCard standard";

sCard.innerText="Standard $"+standard.toFixed(2);



const eCard=document.createElement("div");

eCard.className="quoteCard express";

eCard.innerText="Express $"+express.toFixed(2);



quoteArea.appendChild(sCard);

quoteArea.appendChild(eCard);



uploadBtn.innerText="See ???? Quote";



setTimeout(()=>{

uploadBtn.innerText="Upload Document To Get Quote";
},5000);



sCard.onclick=()=>goPay(standard,"standard");

eCard.onclick=()=>goPay(express,"express");



}



function goPay(amount,type){

localStorage.setItem("amount",amount);

localStorage.setItem("type",type);

window.location="payment.html";

}

