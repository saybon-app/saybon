let words=0;


document.getElementById("uploadBtn").onclick=function(){

let file=document.getElementById("fileInput").files[0];

if(!file)return;


let reader=new FileReader();

reader.onload=function(e){

let text=e.target.result;

words=text.split(/\s+/).length;

showQuote();

};

reader.readAsText(file);

};


function showQuote(){


document.getElementById("wordCount").innerText="WORDS: "+words;


let standardPrice=(words*0.025).toFixed(2);

let expressPrice=(words*0.05).toFixed(2);


document.querySelector(".standard .quote-price").innerText="STANDARD $"+standardPrice;

document.querySelector(".express .quote-price").innerText="EXPRESS $"+expressPrice;


document.querySelector(".standard .quote-delivery").innerText=

"Delivery: "+getDelivery(words,"standard");


document.querySelector(".express .quote-delivery").innerText=

"Delivery: "+getDelivery(words,"express");


document.getElementById("standardCard").onclick=function(){

window.location="payment.html?plan=standard&words="+words;

};


document.getElementById("expressCard").onclick=function(){

window.location="payment.html?plan=express&words="+words;

};


}


function getDelivery(w,type){

if(w<=300)return type=="standard"?"1 - 3 hrs":"30 - 60 mins";

if(w<=1000)return type=="standard"?"3 - 6 hrs":"1 - 3 hrs";

if(w<=3000)return type=="standard"?"6 - 12 hrs":"3 - 6 hrs";

if(w<=6000)return type=="standard"?"12 - 24 hrs":"6 - 12 hrs";

if(w<=10000)return type=="standard"?"24 - 48 hrs":"12 - 24 hrs";

if(w<=20000)return type=="standard"?"2 - 4 days":"24 - 48 hrs";

return "Custom";

}
