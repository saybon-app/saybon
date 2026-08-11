function typeTitle(el, onDone){
  if(!el) return;
  const text = el.getAttribute("data-text") || "";
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "start-title-cursor";
  el.appendChild(cursor);
  let i = 0;
  const speed = 38;
  function step(){
    if(i < text.length){
      cursor.insertAdjacentText("beforebegin", text.charAt(i));
      i++;
      setTimeout(step, speed);
    } else {
      setTimeout(() => {
        cursor.remove();
        if(typeof onDone === "function") onDone();
      }, 900);
    }
  }
  step();
}

const shell = document.querySelector(".start-shell");

document.querySelectorAll(".start-title").forEach(titleEl => {
  const textEl = titleEl.querySelector(".start-title-text");
  titleEl.addEventListener("animationend", (e) => {
    if(e.target === titleEl){
      typeTitle(textEl, () => { shell?.classList.add("start-cards-ready"); });
    }
  }, { once:true });
});

document.getElementById("startHomeBtn")?.addEventListener("click", () => {
  window.location.href = "/";
});

(function repairLoaderHistoryOnStart() {
  const prev = sessionStorage.getItem("saybon_prev");
  if (!prev) return;
  try {
    history.replaceState({ ...(history.state || {}), saybonLoaderPrev: prev }, "", window.location.href);
  } catch (_) {}
  let repaired = false;
  window.addEventListener("popstate", () => {
    if (repaired) return;
    repaired = true;
    window.location.replace(prev);
  }, { once: true });
})();

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
      const heroTransform = \	ranslate(\px,\px)\;
      card.style.setProperty("--start-transform", heroTransform);
      card.style.transition = "transform 1.5s cubic-bezier(.22,1,.36,1)";
      card.style.transform = \\ scale(1.06)\;

      setTimeout(() => { card.classList.add("start-bounce"); }, 1550);
      setTimeout(() => {
        card.classList.remove("start-bounce");
        card.classList.add("start-floating");
      }, 2600);
      setTimeout(() => { shell.classList.add("start-shell-exit"); }, 4250);
      setTimeout(() => {
        sessionStorage.setItem("saybon_prev", "/start.html");
        sessionStorage.setItem("saybon_next", destinations[card.id]);
        window.location.href = "/loader.html";
      }, 5000);

    }, 280);
  });
});