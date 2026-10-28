/*
============================================================

 SayBon Asset Manager

 page-assets.js

 Every page in SayBon declares its assets here.

 Nothing else in the application should hardcode
 image paths.

============================================================
*/

export const PageAssets = {

    home: {

        critical: [

            "/assets/home/desktop-background.webp",
            "/assets/home/mobile-background.webp",

            "/assets/home/teacher.webp",

            "/assets/home/saybon-logo.webp",

            "/assets/home/get-started-button.webp",
            "/assets/home/login-button.webp",
            "/assets/home/admin-button.webp",

            "/assets/home/IMG_6479.webp"

        ],

        lazy: [

            "/assets/home/overlay-desktop.webp",
            "/assets/home/overlay-mobile.webp",

            "/assets/home/pill-1.webp",
            "/assets/home/pill-2.webp",
            "/assets/home/pill-3.webp",
            "/assets/home/pill-4.webp"

        ]

    },



    why: {

        critical: [

        ],

        lazy: [

        ]

    },



    talkletics: {

        critical: [

        ],

        lazy: [

        ]

    },



    placement: {

        critical: [

        ],

        lazy: [

        ]

    },



    translation: {

        critical: [

        ],

        lazy: [

        ]

    },



    dashboard: {

        critical: [

        ],

        lazy: [

        ]

    }

};



export function getPageAssets(pageName){

    return PageAssets[pageName] || {

        critical: [],

        lazy: []

    };

}



export function getCriticalAssets(pageName){

    return getPageAssets(pageName).critical;

}



export function getLazyAssets(pageName){

    return getPageAssets(pageName).lazy;

}



export default PageAssets;
