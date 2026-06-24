const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const overlay = document.getElementById("offerOverlay");

const pill1 = document.getElementById("pill1");
const pill2 = document.getElementById("pill2");
const pill3 = document.getElementById("pill3");
const pill4 = document.getElementById("pill4");

let started = false;

teacher.addEventListener("click", () => {

    if (started) return;
    started = true;

    overlay.classList.remove("hidden","active","closing");

    [
        pill1,
        pill2,
        pill3,
        pill4
    ].forEach(p => {
        p.classList.remove("show");
    });

    requestAnimationFrame(() => {
        overlay.classList.add("active");
    });

    audio.currentTime = 0;
    audio.play().catch(()=>{});

    /* 3s */
    setTimeout(() => {
        pill1.classList.add("show");
    }, 3000);

    /* 6s */
    setTimeout(() => {
        pill2.classList.add("show");
    }, 6000);

    /* 9s */
    setTimeout(() => {
        pill3.classList.add("show");
    }, 9000);

    /* 12s */
    setTimeout(() => {
        pill4.classList.add("show");
    }, 12000);

    /* Outro begins */
    setTimeout(() => {
        overlay.classList.add("closing");
    }, 20000);

    /* Hide */
    setTimeout(() => {

        overlay.classList.remove(
            "active",
            "closing"
        );

        overlay.classList.add("hidden");

        [
            pill1,
            pill2,
            pill3,
            pill4
        ].forEach(p => {
            p.classList.remove("show");
        });

        started = false;

    }, 25000);

});

document.getElementById("startBtn").onclick = (e) => {
    e.stopPropagation();
    sessionStorage.setItem("saybon_next", "/why.html");
    window.location.href = "/loader.html";
};

document.getElementById("loginBtn").onclick = (e) => {
    e.stopPropagation();
    window.location.href = "/auth/login.html";
};

document.getElementById("settingsBtn").onclick = (e) => {
    e.stopPropagation();
    window.location.href = "/admin/passkey/";
};
