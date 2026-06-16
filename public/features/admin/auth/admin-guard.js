import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
  authDomain: "saybon-3e3c2.firebaseapp.com",
  projectId: "saybon-3e3c2",
  storageBucket: "saybon-3e3c2.appspot.com",
  messagingSenderId: "75085012344",
  appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAILS = [
  "saybon.fr@gmail.com"
];

onAuthStateChanged(auth, (user) => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    alert("Admin access only.");
    window.location.href = "/index.html";
  }
});
