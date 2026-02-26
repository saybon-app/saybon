async function quote(){

let file=document.getElementById("file").files[0];

let text=await file.text();

let words=text.trim().split(/\s+/).length;



let standard=(words*0.025).toFixed(2);

let express=(words*0.05).toFixed(2);



document.getElementById("result").innerHTML=

"<div style='margin-top:12px'>Word count: "+words+"</div>"+

"<div class='quoteCard quoteStandard' onclick='pay("+standard+")'>STANDARD — $"+standard+"</div>"+

"<div class='quoteCard quoteExpress' onclick='pay("+express+")'>EXPRESS — $"+express+"</div>";

}



function pay(price){

location.href="payment.html?price="+price;

}

