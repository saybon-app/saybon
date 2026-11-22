/*startfix*/
function typeTitle(el, onDone){
  if(!el) return;
  const text = el.getAttribute("data-text") || "";
  const speed = 38;
  const cursor = document.createElement("span");
  cursor.className = "start-title-cursor";
  el.textContent = "";
  el.appendChild(cursor);
  const t0 = performance.now();
  let shown = 0, done = false;
  function finish(){
    if(done) return;
    done = true;
    el.textContent = text;
    shell?.classList.add("start-cards-ready");
    if(typeof onDone === "function") onDone();
  }
  // Time-based, so a throttled or backgrounded tab jumps to the right letter instead of freezing.
  function tick(){
    if(done) return;
    const n = Math.min(text.length, Math.floor((performance.now() - t0) / speed));
    if(n !== shown){ shown = n; cursor.previousSibling && cursor.previousSibling.remove(); cursor.insertAdjacentText("beforebegin", text.slice(0, n)); }
    if(n >= text.length){ setTimeout(finish, 500); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => { if(!document.hidden) tick(); });
  setTimeout(finish, text.length * speed + 1800); // safety net: always show the full line
}

const shell = document.querySelector(".start-shell");

document.querySelectorAll(".start-title").forEach(titleEl => {
  const textEl = titleEl.querySelector(".start-title-text");
  let started = false;
  function go(){ if(started) return; started = true; typeTitle(textEl); }
  titleEl.addEventListener("animationend", (e) => { if(e.target === titleEl) go(); }, { once:true });
  setTimeout(go, 1500); // if the entrance animation never reports back, start anyway
});

document.getElementById("startHomeBtn")?.addEventListener("click", () => {
  if(window.stopAppBgMusic){ window.stopAppBgMusic(); } window.location.href = "/";
});

const paths = [...document.querySelectorAll(".start-path")];
let busy = false;

const destinations = {
  findLevel: "/placement/",
  startScratch: "/auth/login.html"
};

paths.forEach(card => {
  card.addEventListener("click", () => {
    if(busy) return;
    busy = true;

    card.classList.add("start-just-selected");

    const other = paths.find(c => c !== card);
    if(other){
      other.style.animation = "none";
      other.style.transform = "translateY(0)";
      other.style.opacity = "1";
      other.style.filter = "blur(0)";
      void other.offsetWidth;
      other.classList.add("start-fall-out");
      requestAnimationFrame(() => {
        other.style.transform = "translateY(150px) rotate(-7deg)";
        other.style.opacity = "0";
        other.style.filter = "blur(3px)";
      });
    }

    setTimeout(() => {
      card.classList.remove("start-just-selected");

      const cardRect = card.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const cardCenterX = cardRect.left + (cardRect.width / 2);
      const cardCenterY = cardRect.top + (cardRect.height / 2);
      const shellCenterX = shellRect.left + (shellRect.width / 2);
      const shellCenterY = shellRect.top + (shellRect.height / 2);
      const moveX = shellCenterX - cardCenterX;
      const moveY = shellCenterY - cardCenterY;

      card.style.zIndex = "9999";
      const heroTransform = "translate(" + moveX + "px," + moveY + "px)";
      card.style.setProperty("--start-transform", heroTransform);
      card.style.transition = "transform .85s cubic-bezier(.22,1,.36,1)";
      card.style.transform = heroTransform + " scale(1.06)";

      setTimeout(() => { card.classList.add("start-bounce"); }, 550);
      setTimeout(() => {
        card.classList.remove("start-bounce");
        card.classList.add("start-floating");
      }, 900);
      setTimeout(() => { shell.classList.add("start-shell-exit"); }, 1400);
      setTimeout(() => {
        try { if(card.id === "startScratch"){ localStorage.setItem("saybon_start_scratch","1"); } else { localStorage.removeItem("saybon_start_scratch"); } } catch(e){} window.location.href = destinations[card.id];
      }, 1700);

    }, 160);
  });
});




