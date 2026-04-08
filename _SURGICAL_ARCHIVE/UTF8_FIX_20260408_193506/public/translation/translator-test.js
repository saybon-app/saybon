import { db } from "../js/firebase-config.js";

import {
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


function getApplicantId(){

const params = new URLSearchParams(window.location.search);
return params.get("applicant");

}


window.submitTest = async function(){

try{

const english =
document.getElementById("englishBox")?.value || "";

const french =
document.getElementById("frenchBox")?.value || "";

const applicantId = getApplicantId();


/* ==========================================
IF APPLICANT EXISTS → SAVE TEST
========================================== */

if(applicantId){

await updateDoc(
doc(db,"translatorApplications", applicantId),
{

englishTranslation: english,
frenchTranslation: french,
testCompleted:true,
submittedAt: Date.now()

});

}


/* ==========================================
ALWAYS REDIRECT
========================================== */

window.location.href =
"/translation/translator-register.html";


}catch(err){

console.error("Submit error:",err);

/* still redirect even if error */

window.location.href =
"/translation/translator-register.html";

}

}