const chatItems =
document.querySelectorAll(".chat-item")

const welcomeScreen =
document.getElementById("welcomeScreen")

const liveChat =
document.getElementById("liveChat")

const liveChatName =
document.getElementById("liveChatName")

chatItems.forEach(item=>{

item.addEventListener("click",()=>{

chatItems.forEach(i=>{
i.classList.remove("active")
})

item.classList.add("active")

welcomeScreen.classList.add("hidden")

liveChat.classList.remove("hidden")

const room =
item.getAttribute("data-room")

liveChatName.textContent =
room.charAt(0).toUpperCase() +
room.slice(1)

})

})

const avatarUpload =
document.getElementById("avatarUpload")

const profilePreview =
document.getElementById("profilePreview")

if(profilePreview){

profilePreview.addEventListener("click",()=>{

avatarUpload.click()

})

}

if(avatarUpload){

avatarUpload.addEventListener("change",e=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = event => {

profilePreview.src =
event.target.result

}

reader.readAsDataURL(file)

})

}
