import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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

document.getElementById("backBtn").addEventListener("click", () => {
  if(window.stopAppBgMusic){ window.stopAppBgMusic(); } window.location.href = "/";
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);

    // LOCKED BEHAVIOR:
    // Always goes directly to dashboard
    window.location.href = "/dashboard/";

  } catch (err) {
    alert("Login cancelled or failed.");
  }
});





let isSignUpMode = false;

document.getElementById("toggleModeBtn").addEventListener("click", () => {
  isSignUpMode = !isSignUpMode;
  document.getElementById("emailAuthBtn").textContent = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById("toggleModeText").textContent = isSignUpMode ? "Already have an account?" : "New here?";
  document.getElementById("toggleModeBtn").textContent = isSignUpMode ? "Sign In" : "Create Account";
  document.getElementById("emailAuthError").textContent = "";
});

document.getElementById("emailAuthForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const errorEl = document.getElementById("emailAuthError");
  errorEl.textContent = "";

  try {
    if (isSignUpMode) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    window.location.href = "/dashboard/";
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      errorEl.textContent = "That email is already registered. Try signing in instead.";
    } else if (err.code === "auth/weak-password") {
      errorEl.textContent = "Password should be at least 6 characters.";
    } else if (err.code === "auth/invalid-email") {
      errorEl.textContent = "Please enter a valid email address.";
    } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      errorEl.textContent = "Incorrect email or password.";
    } else if (err.code === "auth/user-not-found") {
      errorEl.textContent = "No account found with that email.";
    } else {
      errorEl.textContent = "Something went wrong. Please try again.";
    }
  }
});

document.getElementById("emailIconBtn").addEventListener("click", () => {
  const form = document.getElementById("emailAuthForm");
  const divider = document.querySelector(".email-divider");
  const isOpen = form.style.display === "flex";
  form.style.display = isOpen ? "none" : "flex";
  divider.style.display = isOpen ? "none" : "flex";
});

