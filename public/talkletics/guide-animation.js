const blink = document.querySelector(".blink");

function doBlink(){

    if(!blink) return;

    blink.style.opacity = "1";

    setTimeout(() => {
        blink.style.opacity = "0";
    }, 120);
}

setTimeout(doBlink, 2000);

setInterval(() => {

    const randomDelay =
        Math.floor(Math.random() * 4000) + 3000;

    setTimeout(doBlink, randomDelay);

}, 7000);

