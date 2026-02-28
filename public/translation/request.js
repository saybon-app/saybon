
const fileInput =
document.getElementById("fileInput")

const uploadBtn =
document.getElementById("uploadBtn")

const wordLabel =
document.getElementById("wordCount")

const standardCard =
document.getElementById("standardCard")

const expressCard =
document.getElementById("expressCard")

const standardPrice =
standardCard.querySelector(".quote-price")

const expressPrice =
expressCard.querySelector(".quote-price")

const standardDelivery =
standardCard.querySelector(".quote-delivery")

const expressDelivery =
expressCard.querySelector(".quote-delivery")

let WORDS = 0



function normalize(text){

return text.replace(/\s+/g," ").trim()

}



function countWords(text){

if(!text) return 0

return normalize(text).split(" ").length

}



function getDelivery(words){

if(words<=300)return["1 - 3 hrs","30 - 60 mins"]

if(words<=1000)return["3 - 6 hrs","1 - 3 hrs"]

if(words<=3000)return["6 - 12 hrs","3 - 6 hrs"]

if(words<=6000)return["12 - 24 hrs","6 - 12 hrs"]

if(words<=10000)return["24 - 48 hrs","12 - 24 hrs"]

if(words<=20000)return["2 - 4 days","24 - 48 hrs"]

return["Custom","Custom"]

}



function update(words){

WORDS=words

wordLabel.textContent="WORDS: "+words


let standard=words*0.025

let express=words*0.05


standardPrice.textContent=
"STANDARD $" + standard.toFixed(2)

expressPrice.textContent=
"EXPRESS $" + express.toFixed(2)


let d=getDelivery(words)


standardDelivery.textContent=
"Delivery: "+d[0]

expressDelivery.textContent=
"Delivery: "+d[1]

}



async function readDocx(file){

let r=
await mammoth.extractRawText({
arrayBuffer:
await file.arrayBuffer()
})

return r.value

}



async function readPDF(file){

pdfjsLib.GlobalWorkerOptions.workerSrc=
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"


let pdf=
await pdfjsLib.getDocument({
data:await file.arrayBuffer()
}).promise


let text=""


for(let i=1;i<=pdf.numPages;i++){

let page=
await pdf.getPage(i)

let content=
await page.getTextContent()

text+=
content.items.map(x=>x.str).join(" ")

}


return text

}



uploadBtn.onclick=async()=>{

let file=fileInput.files[0]

if(!file){
alert("Choose file")
return
}


uploadBtn.textContent="⏳"


let text=""


if(file.name.endsWith(".txt"))
text=await file.text()

else if(file.name.endsWith(".docx"))
text=await readDocx(file)

else if(file.name.endsWith(".pdf"))
text=await readPDF(file)

else{
alert("Unsupported file")
return
}


let words=countWords(text)


update(words)


uploadBtn.textContent="UPLOAD"

}



standardCard.onclick=()=>{

if(WORDS==0)return

location=
"/translation/payment.html?plan=standard&words="+WORDS

}



expressCard.onclick=()=>{

if(WORDS==0)return

location=
"/translation/payment.html?plan=express&words="+WORDS

}

