// Verifies sign-in. The page is already showing for returning users (see auth-gate.js); this only
// redirects signed-out visitors, and reveals the page if the gate had hidden it.
import "./usage-track.js";
import { auth, onAuthStateChanged } from "./firebase-core.js";

onAuthStateChanged(auth, function (user) {
  if (!user) {
    window.location.replace("/auth/login.html");
  } else {
    document.documentElement.style.visibility = "";
  }
});
