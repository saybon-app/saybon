/*
=====================================
CONNECT QUOTE BUTTONS TO PAYMENT
=====================================
*/

function goToPayment(type){

const words = window.currentWords;


let price = 0;
let delivery = "";


if(type==="standard"){

price = words * 0.025;
delivery = getStandardDelivery(words);

}


if(type==="express"){

price = words * 0.05;
delivery = getExpressDelivery(words);

}


const payment = {

words:words,

amount:price,

delivery:delivery,

currency:"USD",

type:type

};


localStorage.setItem(

"saybon_payment",

JSON.stringify(payment)

);


window.location.href="payment.html";


}
