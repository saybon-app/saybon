import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
authDomain: "saybon-3e3c2.firebaseapp.com",
projectId: "saybon-3e3c2",
storageBucket: "saybon-3e3c2.firebasestorage.app",
messagingSenderId: "75085012344",
appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);