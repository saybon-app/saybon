// "French for Schools" card: permanently locked. It never navigates anywhere for anyone.
const card = document.getElementById("schoolsCard");
const icon = card && card.querySelector(".card-go svg");
const LOCK = '<path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2"/>';

function toast(msg){
  const t = document.createElement("div");
  t.className = "sb-toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 600); }, 3400);
}

// Locked: a tap only shows a short note. No page change, no login, no link.
window.goSchools = function(){
  toast("C'est bon for Schools is offered strictly by invitation to partner schools.");
};

if (card) {
  card.classList.add("is-locked");
  card.classList.remove("is-open");
  card.setAttribute("aria-disabled", "true");
  if (icon) icon.innerHTML = LOCK;
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.goSchools(); } });
}
