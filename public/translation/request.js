function getQuote(){

const file = document.getElementById("fileInput").files[0];

if(!file){

alert("Please select file");

return;

}

const words = 1000;

window.location.href =
"/translation/payment.html?plan=standard&words=" + words;

}
