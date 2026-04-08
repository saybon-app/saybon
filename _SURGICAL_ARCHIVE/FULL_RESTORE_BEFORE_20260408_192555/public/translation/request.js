let selectedPlan = null;

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const wordCountDisplay = document.getElementById("wordCount");

const standardCard = document.getElementById("standardCard");
const expressCard = document.getElementById("expressCard");
const continueBtn = document.getElementById("continueBtn");

standardCard.onclick = () => {
selectedPlan = "standard";
continueBtn.style.display = "block";
};

expressCard.onclick = () => {
selectedPlan = "express";
continueBtn.style.display = "block";
};

uploadBtn.onclick = async () => {

const file = fileInput.files[0];

if(!file){
alert("Please choose a file first.");
return;
}

let text = "";

if(file.name.endsWith(".txt")){
text = await file.text();
}

else if(file.name.endsWith(".docx")){
const arrayBuffer = await file.arrayBuffer();
const result = await mammoth.extractRawText({arrayBuffer});
text = result.value;
}

else if(file.name.endsWith(".pdf")){
const arrayBuffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({data:arrayBuffer}).promise;

for(let i=1;i<=pdf.numPages;i++){

const page = await pdf.getPage(i);
const content = await page.getTextContent();

content.items.forEach(item=>{
text += item.str + " ";
});

}
}

const words = text.trim().split(/\s+/).length;

wordCountDisplay.innerText = "WORDS: " + words;

const standardPrice = (words * 0.025).toFixed(2);
const expressPrice = (words * 0.05).toFixed(2);

document.querySelector("#standardCard .quote-price").innerText =
"STANDARD $" + standardPrice;

document.querySelector("#expressCard .quote-price").innerText =
"EXPRESS $" + expressPrice;

};

continueBtn.onclick = () => {

const words = parseInt(
wordCountDisplay.innerText.replace(/\D/g,'')
);

location.href =
"https://saybonapp.com/translation/job.html?plan="+selectedPlan+"&words="+words;

};
