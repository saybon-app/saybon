function loadPayment(){

let data=sessionStorage.getItem("paymentData");

if(!data){

data=localStorage.getItem("paymentDataBackup");

}

if(!data){

return;

}

data=JSON.parse(data);

document.getElementById("words").innerText=data.words;

document.getElementById("delivery").innerText=data.delivery;

document.getElementById("amount").innerText=data.amount;

}

loadPayment();
