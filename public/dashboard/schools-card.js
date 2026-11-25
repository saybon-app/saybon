// "C'est bon for Schools" card: locked for everyone except the SayBon admin.
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { isSchoolsAdmin } from "/schools/schools-config.js";

const card = document.getElementById("schoolsCard");
const pill = card && card.querySelector(".sch-pill");
const icon = card && card.querySelector(".card-go svg");
const LOCK = '<path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2"/>';
const ARROW = '<path d="M9 6l6 6-6 6"/>';

let open = false;

function toast(msg){
  const t = document.createElement("div");
  t.className = "sb-toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 600); }, 3400);
}

window.goSchools = function(){
  if (open) { window.location.href = "/schools/"; return; }
  toast("C'est bon for Schools is offered strictly by invitation to partner schools.");
};

if (card) {
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.goSchools(); } });
  onAuthStateChanged(auth, (user) => {
    open = isSchoolsAdmin(user);
    card.classList.toggle("is-open", open);
    card.classList.toggle("is-locked", !open);
    card.setAttribute("aria-disabled", open ? "false" : "true");
    if (pill) pill.textContent = open ? "ADMIN ACCESS" : "BY INVITATION";
    if (icon) icon.innerHTML = open ? ARROW : LOCK;
  });
}
