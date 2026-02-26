document.getElementById('quoteBtn')

.addEventListener('click',getQuote)



async function getQuote(){


const file=document.getElementById('fileInput').files[0]


if(!file){

alert('Please select file')

return

}



let words=0



if(file.name.toLowerCase().endsWith('.txt')){


const text=await file.text()

words=text.trim().split(/\s+/).length


}


else{


words=Math.round(file.size/6)


}



const standardPrice=(words*0.025).toFixed(2)

const expressPrice=(words*0.05).toFixed(2)



const standardTime=getTimeline(words,false)

const expressTime=getTimeline(words,true)



document.getElementById('result').innerHTML=


"Word count: "+words+"<br><br>"+


"<button onclick='pay(""standard"","+standardPrice+",\""+standardTime+"\")'>"+

"Standard $"+standardPrice+" "+standardTime+

"</button><br><br>"+


"<button onclick='pay(""express"","+expressPrice+",\""+expressTime+"\")'>"+

"Express $"+expressPrice+" "+expressTime+

"</button>"


}



function getTimeline(words,express){


if(express){

if(words<=300)return "30 - 60 mins"

if(words<=1000)return "1 - 3 hrs"

if(words<=3000)return "3 - 6 hrs"

if(words<=5000)return "6 - 12 hrs"

return "12 - 24 hrs"

}


else{

if(words<=300)return "1 - 3 hrs"

if(words<=1000)return "3 - 6 hrs"

if(words<=3000)return "6 - 12 hrs"

if(words<=5000)return "12 - 24 hrs"

return "24 - 48 hrs"

}


}



function pay(type,price,time){

location.href="/translation/payment.html?type="+type+"&price="+price+"&time="+time

}
