// Every page in /schools/ imports this. Not signed in -> login. Signed in but not invited -> dashboard.
import "/js/usage-track.js";
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { isSchoolsAdmin, isSchoolsAllowed } from "/schools/schools-config.js";

document.documentElement.style.visibility = "hidden";

export const schoolsReady = new Promise(function(resolve){
  onAuthStateChanged(auth, function(user){
    if (!user) { window.location.replace("/auth/login.html"); return; }
    if (!isSchoolsAllowed(user)) { window.location.replace("/dashboard/"); return; }
    document.documentElement.style.visibility = "visible";
    resolve({ user: user, admin: isSchoolsAdmin(user) });
  });
});
