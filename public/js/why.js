
function typeTitle(el, onDone){
  if(!el) return;
  const text = el.getAttribute("data-text") || "";
  el.textContent = "";

  const cursor = document.createElement("span");
  cursor.className = "why-title-cursor";
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

const shell = document.querySelector(".why-shell");

document.querySelectorAll(".why-title").forEach(titleEl => {
  const textEl = titleEl.querySelector(".why-title-text");
  titleEl.addEventListener("animationend", (e) => {
    if(e.target === titleEl){
      typeTitle(textEl, () => {
        shell?.classList.add("why-cards-ready");
      });
    }
  }, { once:true });
});

document.getElementById("whyHomeBtn")?.addEventListener("click", () => {
  window.location.href = "/";
});

const cards=[...document.querySelectorAll(".why-option")];

let busy=false;

cards.forEach((card, cardIndex)=>{

    card.addEventListener("click",()=>{

        if(busy) return;
        busy=true;

        card.classList.add("why-just-selected");

        const others = cards.filter(c => c !== card);

        others.forEach((other, i)=>{

            other.style.animation = "none";
            other.style.transform = "translateY(0)";
            other.style.opacity = "1";
            other.style.filter = "blur(0)";

            void other.offsetWidth;

            other.style.transitionDelay = `${i * 130}ms`;
            other.classList.add("why-fall-out");

            const rotateDeg = i % 2 === 0 ? "-7deg" : "7deg";

            requestAnimationFrame(()=>{
                other.style.transform = `translateY(150px) rotate(${rotateDeg})`;
                other.style.opacity = "0";
                other.style.filter = "blur(3px)";
            });

        });

        setTimeout(()=>{

            card.classList.remove("why-just-selected");

            const cardRect=card.getBoundingClientRect();
            const shellRect=shell.getBoundingClientRect();

            const cardCenterX=cardRect.left+(cardRect.width/2);
            const cardCenterY=cardRect.top+(cardRect.height/2);

            const shellCenterX=shellRect.left+(shellRect.width/2);
            const shellCenterY=shellRect.top+(shellRect.height/2);

            const moveX=shellCenterX-cardCenterX;
            const moveY=shellCenterY-cardCenterY;

            card.style.zIndex="9999";

            const heroTransform=
                `translate(${moveX}px,${moveY}px)`;

            card.style.setProperty(
                "--why-transform",
                heroTransform
            );

            card.style.transition=
                "transform .85s cubic-bezier(.22,1,.36,1)";

            card.style.transform=
                `${heroTransform} scale(1.08)`;

            setTimeout(()=>{

                card.classList.add("why-bounce");

            },550);

            setTimeout(()=>{

                card.classList.remove("why-bounce");
                card.classList.add("why-floating");

            },900);

            setTimeout(()=>{

                shell.classList.add("why-shell-exit");

            },1400);

            setTimeout(()=>{

                window.location.href="/start.html";

            },1700);

        }, 160);

    });

});




