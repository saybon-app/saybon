import { db } from "../js/firebase-config.js";

import {
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);
const applicantId = params.get("applicant");


window.submitTest = async function(){

const english =
document.getElementById("englishBox").value;

const french =
document.getElementById("frenchBox").value;

if(!english || !french){

alert("Please complete both translations");

return;

}

await updateDoc(
doc(db,"translatorApplications", applicantId),
{

englishTranslation: english,
frenchTranslation: french,

testCompleted:true,
submittedAt: Date.now()

});

window.location.href =
"/translation/translator-register.html";

}
