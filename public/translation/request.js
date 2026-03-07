document.addEventListener("DOMContentLoaded", () => {

let selectedPlan = null;

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const continueBtn = document.getElementById("continueBtn");

if(uploadBtn && fileInput){
uploadBtn.onclick = () => {
fileInput.click();
};
}

const standardCard = document.getElementById("standardCard");
const expressCard = document.getElementById("expressCard");

if(standardCard){
standardCard.onclick = () => {
selectedPlan = "standard";
if(continueBtn) continueBtn.style.display = "block";
};
}

if(expressCard){
expressCard.onclick = () => {
selectedPlan = "express";
if(continueBtn) continueBtn.style.display = "block";
};
}

if(continueBtn){

continueBtn.onclick = () => {

const words = parseInt(
document.getElementById("wordCount")
.innerText.replace(/\D/g,'')
);

window.location.href =
"/translation/job.html?plan=" + selectedPlan + "&words=" + words;

};

}

});
