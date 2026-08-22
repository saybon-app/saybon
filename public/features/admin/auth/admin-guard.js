import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const API_BASE = "https://saybonapp-server.onrender.com";

document.body.style.visibility = "hidden";

onAuthStateChanged(auth, async function(user){
  if(!user){
    window.location.href = "/auth/login.html";
    return;
  }

  try{
    const res = await fetch(API_BASE + "/api/accessControlCheck?email=" + encodeURIComponent(user.email || ""));
    const data = await res.json();

    if(data.authorized){
      document.body.style.visibility = "visible";
    } else {
      document.body.innerHTML = "<div style='font-family:sans-serif;color:#fff;background:#0c1016;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;'><div><h1>Access Denied</h1><p>Your account is not authorized for Business Admin.</p></div></div>";
      document.body.style.visibility = "visible";
    }
  }catch(err){
    console.error("Access check failed:", err);
    document.body.innerHTML = "<div style='font-family:sans-serif;color:#fff;background:#0c1016;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;'><div><h1>Could not verify access</h1><p>Please try again shortly.</p></div></div>";
    document.body.style.visibility = "visible";
  }
});