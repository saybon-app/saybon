
let quoteData={};


function generateQuote(){

const btn=document.getElementById('uploadBtn');

btn.innerText='Getting Quote...';

btn.disabled=true;


setTimeout(()=>{


const words=Math.floor(Math.random()*4000)+100;


const standardPrice=(words*0.025).toFixed(2);

const expressPrice=(words*0.05).toFixed(2);


let standardTime='1-3 hrs';

let expressTime='30-60 mins';


quoteData={

words,

standardPrice,

expressPrice,

standardTime,

expressTime

};


document.getElementById('wordCount').innerText=

words+' words';


document.getElementById('standardCard').innerHTML=

'<b>Standard</b><br>$'+standardPrice+'<br>'+standardTime;


document.getElementById('expressCard').innerHTML=

'<b>Express</b><br>$'+expressPrice+'<br>'+expressTime;


document.getElementById('quoteArea').classList.remove('hidden');


btn.innerText='See Quote 👇';

setTimeout(()=>{

btn.innerText='Upload Document To Get Quote';

btn.disabled=false;

},5000);


},2000);

}



function goPay(type){

let delivery,amount;


if(type=='standard'){

delivery=quoteData.standardTime;

amount=quoteData.standardPrice;

}else{

delivery=quoteData.expressTime;

amount=quoteData.expressPrice;

}


document.getElementById('payWords').innerText=quoteData.words;

document.getElementById('payDelivery').innerText=delivery;

document.getElementById('payAmount').innerText=amount;


document.getElementById('paymentArea').classList.remove('hidden');


}



function payStripe(){

alert('Stripe Connected');

}


function payPaystack(){

alert('Paystack Connected');

}

