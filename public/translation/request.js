
document.getElementById("quoteBtn").onclick = async function(){

let file =
document.getElementById("file").files[0];

let text =
await file.text();

let words =
text.trim().split(/\s+/).length;



let standardPrice =
(words * 0.025).toFixed(2);

let expressPrice =
(words * 0.05).toFixed(2);



let standardTime = "Custom timeline";

if(words <= 300) standardTime = "1 – 3 hours";
else if(words <= 1000) standardTime = "3 – 6 hours";
else if(words <= 3000) standardTime = "6 – 12 hours";
else if(words <= 6000) standardTime = "12 – 24 hours";
else if(words <= 10000) standardTime = "24 – 48 hours";
else if(words <= 20000) standardTime = "2 – 4 days";



let expressTime = "Custom timeline";

if(words <= 300) expressTime = "30 – 60 minutes";
else if(words <= 1000) expressTime = "1 – 3 hours";
else if(words <= 3000) expressTime = "3 – 6 hours";
else if(words <= 6000) expressTime = "6 – 12 hours";
else if(words <= 10000) expressTime = "12 – 24 hours";
else if(words <= 20000) expressTime = "24 – 48 hours";




document.getElementById("result").innerHTML =

"<div>Word count: " + words + "</div>" +

"<div class='quoteCard quoteStandard' onclick='goPay("+standardPrice+","+standardTime+",standard)'>Standard $" + standardPrice + " — " + standardTime + "</div>" +

"<div class='quoteCard quoteExpress' onclick='goPay("+expressPrice+","+expressTime+",express)'>Express $" + expressPrice + " — " + expressTime + "</div>";


}



function goPay(price,time,type){

location.href=

"payment.html?price="+price+
"&time="+encodeURIComponent(time)+
"&type="+type;

}

