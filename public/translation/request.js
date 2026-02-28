const fileInput=document.getElementById("fileInput");

const wordCountDiv=document.getElementById("wordCount");

const standardCard=document.getElementById("standardCard");

const expressCard=document.getElementById("expressCard");

fileInput.onchange=async()=>{

const file=fileInput.files[0];

const text=await file.text();

const words=text.trim().split(/\s+/).length;

wordCountDiv.innerHTML="WORDS: "+words;

const standard=(words*0.025).toFixed(2);

const express=(words*0.05).toFixed(2);

standardCard.innerHTML="STANDARD $"+standard+" • timeline applies";

expressCard.innerHTML="EXPRESS $"+express+" • timeline applies";

};
