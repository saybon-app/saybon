import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.documentElement.style.display = "none";

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "/auth/login.html";
  } else {
    document.documentElement.style.display = "block";
  }
});