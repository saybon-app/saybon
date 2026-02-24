function selectQuote(words,delivery,amount){

const paymentData={

words,

delivery,

amount

};

sessionStorage.setItem("paymentData",JSON.stringify(paymentData));

localStorage.setItem("paymentDataBackup",JSON.stringify(paymentData));

location.href="/translation/payment.html";

}
