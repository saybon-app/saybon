// SayBon Firebase core: app + auth ONLY (no Firestore). Light enough for every page to load quickly.
// Pages that need Firestore keep importing /js/firebase-init.js, which re-exports these.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2aKUdE1NSt0kN332BwTYSX52D0lxj1g0",
  authDomain: "saybon-3e3c2.firebaseapp.com",
  projectId: "saybon-3e3c2",
  storageBucket: "saybon-3e3c2.firebasestorage.app",
  messagingSenderId: "75085012344",
  appId: "1:75085012344:web:0b18581cb0a30c3df47c8d"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { onAuthStateChanged };

// Remember the signed-in state so the NEXT page can show instantly instead of waiting for Firebase.
onAuthStateChanged(auth, function (u) {
  try {
    localStorage.setItem("sb_auth", u ? "1" : "0");
    if (u) localStorage.setItem("sb_uid", u.uid);
  } catch (e) {}
});
