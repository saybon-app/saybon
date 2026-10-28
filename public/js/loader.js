"use strict";

(() => {

    const overlay = document.getElementById("sb-welcome-overlay");

    if (!overlay) {
        return;
    }

    const assets = [

        "/assets/home/desktop-background.webp",
        "/assets/home/mobile-background.webp",
        "/assets/home/teacher.webp",
        "/assets/home/IMG_6479.webp",
        "/assets/home/get-started-button.webp",
        "/assets/home/login-button.webp",
        "/assets/home/admin-button.webp",
        "/assets/home/overlay-desktop.webp",
        "/assets/home/overlay-mobile.webp",
        "/assets/home/pill-1.webp",
        "/assets/home/pill-2.webp",
        "/assets/home/pill-3.webp",
        "/assets/home/pill-4.webp",
        "/assets/home/saybon-logo.PNG"

    ];

    function preload(src){

        return new Promise(resolve => {

            const img = new Image();

            img.onload = resolve;
            img.onerror = resolve;

            img.src = src;

        });

    }

    async function preloadAssets(){

        await Promise.all(

            assets.map(preload)

        );

    }

    function sleep(ms){

        return new Promise(resolve => {

            setTimeout(resolve, ms);

        });

    }

    async function reveal(){

        document.body.classList.add("sb-ready");

        await sleep(900);

        overlay.remove();

    }

    window.addEventListener("load", async () => {

        try{

            await preloadAssets();

        }
        catch(err){

            console.warn("Asset preload completed with warnings.", err);

        }

        await reveal();

    });

})();
