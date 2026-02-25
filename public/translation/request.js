
function getQuote(){

let file=document.getElementById("fileInput").files[0];

if(!file){

alert("Please select file");

return;

}


let btn=document.getElementById("quoteBtn");


btn.innerText="Getting Quote...";


setTimeout(()=>{


let words=1000;

let price=words*0.025;


localStorage.setItem("paymentData",

JSON.stringify({

words:words,

price:price,

delivery:"3–6 hrs"

})

);


window.location.href="payment.html";


},1200);


}

