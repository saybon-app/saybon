
let file


function chooseFile(){

document.getElementById('fileInput').click()

}


document.getElementById('fileInput').addEventListener('change',function(){

file=this.files[0]

document.getElementById('fileName').innerText=file.name

})


function startQuote(){

if(!file){

alert('Select file first')

return

}


const btn=document.getElementById('uploadBtn')

btn.innerText='Getting Quote ⏳'


setTimeout(()=>{

generateQuote()

},2000)


}


function generateQuote(){


let words=1200


document.getElementById('wordCount').innerHTML=

"<h3>"+words+" words</h3>"


let standardPrice=(words*0.025).toFixed(2)

let expressPrice=(words*0.05).toFixed(2)


document.getElementById('quoteCards').innerHTML=



<div class='quote-card'

onclick="pay(,'standard')">

Standard — public\translation\request.css{standardPrice}

</div>


<div class='quote-card'

onclick="pay(,'express')">

Express — public\translation\request.css{expressPrice}

</div>




}


function pay(amount,type){

localStorage.setItem('amount',amount)

localStorage.setItem('type',type)

location.href='payment.html'

}

