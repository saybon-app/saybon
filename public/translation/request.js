let selectedPlan = null;

/* ELEMENTS */

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const continueBtn = document.getElementById("continueBtn");

/* UPLOAD BUTTON */

if(uploadBtn && fileInput){

uploadBtn.onclick = () => {
fileInput.click();
};

}

/* PLAN SELECTION */

document.getElementById("standardCard").onclick = () => {
selectedPlan = "standard";
if(continueBtn) continueBtn.style.display = "block";
};

document.getElementById("expressCard").onclick = () => {
selectedPlan = "express";
if(continueBtn) continueBtn.style.display = "block";
};

/* CONTINUE BUTTON */

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
