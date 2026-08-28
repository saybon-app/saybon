import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.currentAuthUser = null;

onAuthStateChanged(auth, function(user){
  window.currentAuthUser = user;
});

window.checkAdminAccessAndNavigate = async function(){
  const user = window.currentAuthUser;
  if(!user){
    alert("Please log in first to access Business Admin.");
    return;
  }
  try{
    const res = await fetch("https://saybonapp-server.onrender.com/api/accessControlCheck?email=" + encodeURIComponent(user.email || ""));
    const data = await res.json();
    if(data.authorized){
      window.location.href = "/admin/panel.html";
    } else {
      alert("Your account is not authorized for Business Admin.");
    }
  }catch(err){
    console.error("ACCESS CHECK ERROR:", err);
    alert("Could not verify access. Please try again.");
  }
};
