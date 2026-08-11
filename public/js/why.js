
document.getElementById("whyHomeBtn")?.addEventListener("click", () => {
  window.location.href = "/";
});

const cards=[...document.querySelectorAll(".why-option")];
const shell=document.querySelector(".why-shell");

let busy=false;

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        if(busy) return;
        busy=true;

        const cardRect=card.getBoundingClientRect();
        const shellRect=shell.getBoundingClientRect();

        const cardCenterX=cardRect.left+(cardRect.width/2);
        const cardCenterY=cardRect.top+(cardRect.height/2);

        const shellCenterX=shellRect.left+(shellRect.width/2);
        const shellCenterY=shellRect.top+(shellRect.height/2);

        const moveX=shellCenterX-cardCenterX;
        const moveY=shellCenterY-cardCenterY;

        cards.forEach(other=>{

            if(other!==card){

                other.classList.add("why-fade-out");

            }

        });

        card.style.zIndex="9999";

        const heroTransform=
            `translate(${moveX}px,${moveY}px)`;

        card.style.setProperty(
            "--why-transform",
            heroTransform
        );

        card.style.transition=
            "transform 1.5s cubic-bezier(.22,1,.36,1)";

        card.style.transform=
            `${heroTransform} scale(1.08)`;

        setTimeout(()=>{

            card.classList.add("why-bounce");

        },1550);

        setTimeout(()=>{

            card.classList.remove("why-bounce");
            card.classList.add("why-floating");

        },2600);

        setTimeout(()=>{

            shell.classList.add("why-shell-exit");

        },4250);

        setTimeout(()=>{

            sessionStorage.setItem(
                "saybon_next",
                "/start.html"
            );

            window.location.href="/loader.html";

        },5000);

    });

});


