import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.currentAuthUser = null;

onAuthStateChanged(auth, function(user){
  window.currentAuthUser = user;
});

function showUnauthorizedToast(){
  const toast = document.createElement("div");
  toast.textContent = "Sorry, unauthorized.";
  toast.style.cssText = "position:fixed;top:30px;left:50%;transform:translateX(-50%);background:rgba(20,20,20,.75);backdrop-filter:blur(16px);color:#fff;padding:14px 28px;border-radius:20px;font-family:inherit;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .3s ease;";
  document.body.appendChild(toast);
  requestAnimationFrame(function(){ toast.style.opacity = "1"; });
  setTimeout(function(){
    toast.style.opacity = "0";
    setTimeout(function(){ toast.remove(); }, 300);
  }, 2200);
}

window.checkAdminAccessAndNavigate = async function(){
  const user = window.currentAuthUser;
  if(!user){
    showUnauthorizedToast();
    return;
  }
  try{
    const res = await fetch("https://saybonapp-server.onrender.com/api/accessControlCheck?email=" + encodeURIComponent(user.email || ""));
    const data = await res.json();
    if(data.authorized){
      window.location.href = "/admin/panel.html";
    } else {
      showUnauthorizedToast();
    }
  }catch(err){
    console.error("ACCESS CHECK ERROR:", err);
    showUnauthorizedToast();
  }
};
