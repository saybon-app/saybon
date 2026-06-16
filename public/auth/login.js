import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
  authDomain: "saybon-3e3c2.firebaseapp.com",
  projectId: "saybon-3e3c2",
  appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);

    // 🔒 LOCKED BEHAVIOR:
    // Always → loader → dashboard
    sessionStorage.setItem("saybon_next", "/dashboard/");
    window.location.href = "/loader.html";

  } catch (err) {
    alert("Login cancelled or failed.");
  }
});

