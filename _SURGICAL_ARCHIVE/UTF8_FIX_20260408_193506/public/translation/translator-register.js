import { db } from "../js/firebase-config.js";
import {
addDoc,
collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.startTest = async function(){

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const languages = document.getElementById("languages").value;

if(!name || !email){

alert("Please complete the form first");
return;

}

const docRef = await addDoc(
collection(db,"translatorApplications"),
{

name,
email,
languages,

createdAt: Date.now(),
testCompleted:false

});

window.location.href =
"/translation/translator-test.html?applicant=" + docRef.id;

}