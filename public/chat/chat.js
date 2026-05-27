const chatItems = document.querySelectorAll(".chat-item");
const sideIcons = document.querySelectorAll(".side-icon[data-chat]");

const welcomeScreen = document.getElementById("welcomeScreen");
const liveChat = document.getElementById("liveChat");
const liveChatName = document.getElementById("liveChatName");

chatItems.forEach(item => {

    item.addEventListener("click", () => {

        chatItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

        welcomeScreen.classList.add("hidden");
        liveChat.classList.remove("hidden");

        liveChatName.textContent =
            item.querySelector(".chat-name").textContent;

    });

});

sideIcons.forEach(icon => {

    icon.addEventListener("click", () => {

        sideIcons.forEach(i => i.classList.remove("active"));

        icon.classList.add("active");

        const room =
            icon.getAttribute("data-chat");

        welcomeScreen.classList.add("hidden");
        liveChat.classList.remove("hidden");

        liveChatName.textContent =
            room.charAt(0).toUpperCase() + room.slice(1);

    });

});

const avatarUpload =
document.getElementById("avatarUpload");

const profilePreview =
document.getElementById("profilePreview");

profilePreview.addEventListener("click", () => {
    avatarUpload.click();
});

avatarUpload.addEventListener("change", e => {

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = event => {
        profilePreview.src = event.target.result;
    };

    reader.readAsDataURL(file);

});


// =====================================================
// TOGGLE WELCOME SCREEN
// =====================================================

const homeToggle =
document.querySelector('[data-chat="home"]');

if(homeToggle){

homeToggle.addEventListener("click",()=>{

welcomeScreen.classList.remove("hidden");
liveChat.classList.add("hidden");

});

}

// =====================================================
// DASHBOARD BUTTON
// =====================================================

const dashboardBtn =
document.getElementById("dashboardBtn");

if(dashboardBtn){

dashboardBtn.addEventListener("click",()=>{

window.location.href = "/dashboard/";

});

}

// =====================================================
// SAYBON HOME BUTTON
// =====================================================

const homeBtn =
document.getElementById("homeBtn");

if(homeBtn){

homeBtn.addEventListener("click",()=>{

window.location.href = "/";

});

}





// ======================================================
// SIDEBAR TOGGLE RETURNS TO WELCOME PANEL
// ======================================================

const sidebarToggle =
document.getElementById('sidebarToggle')

if(sidebarToggle){

sidebarToggle.addEventListener('click',()=>{

const welcome =
document.querySelector('.welcome-screen')

const liveChat =
document.querySelector('.live-chat')

if(welcome && liveChat){

welcome.classList.remove('hidden')

liveChat.classList.add('hidden')

}

})

}

// ======================================================
// DASHBOARD BUTTON
// ======================================================

const dashboardButton =
document.getElementById('dashboardButton')

if(dashboardButton){

dashboardButton.addEventListener('click',()=>{

window.location.href='/dashboard/'

})

}

// ======================================================
// HOME BUTTON
// ======================================================

const homeButton =
document.getElementById('homeButton')

if(homeButton){

homeButton.addEventListener('click',()=>{

window.location.href='/'

})

}

