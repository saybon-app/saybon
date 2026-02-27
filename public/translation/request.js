let words=0


function getQuote(){

let file=document.getElementById('file').files[0]

if(!file){

alert('Upload file')
return

}


let reader=new FileReader()

reader.onload=function(e){

let text=e.target.result

words=text.split(/\s+/).length

let standard=words*0.025
let express=words*0.05

document.getElementById('standardPrice').innerText='$'+standard.toFixed(2)
document.getElementById('expressPrice').innerText='$'+express.toFixed(2)

document.getElementById('quoteArea').style.display='block'

}

reader.readAsText(file)

}



function selectPlan(plan){

location.href='payment.html?plan='+plan+'&words='+words

}
