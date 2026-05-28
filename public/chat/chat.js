const roomButtons =
document.querySelectorAll(".room-btn")

const toggleBtn =
document.getElementById("toggleBtn")

const welcomeWorkspace =
document.getElementById("welcomeWorkspace")

const chatWorkspace =
document.getElementById("chatWorkspace")

const roomTitle =
document.getElementById("roomTitle")

const homeBtn =
document.getElementById("homeBtn")

const dashboardBtn =
document.getElementById("dashboardBtn")

const avatarInput =
document.getElementById("avatarInput")

const avatarPreview =
document.getElementById("avatarPreview")

const mediaBtn =
document.getElementById("mediaBtn")

const mediaInput =
document.getElementById("mediaInput")

const mediaPreview =
document.getElementById("mediaPreview")

const voiceBtn =
document.getElementById("voiceBtn")

const composer =
document.getElementById("composer")

const recordingPanel =
document.getElementById("recordingPanel")

const cancelRecording =
document.getElementById("cancelRecording")

const recordingTimer =
document.getElementById("recordingTimer")

let recordingSeconds = 0
let recordingInterval

// =========================================================
// ROOM SWITCHING
// =========================================================

roomButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

document
.querySelectorAll(".sidebar-btn")
.forEach(b=>b.classList.remove("active"))

btn.classList.add("active")

welcomeWorkspace.classList.add("hidden")

chatWorkspace.classList.remove("hidden")

roomTitle.innerHTML =
btn.dataset.room

})

})

// =========================================================
// TOGGLE BUTTON
// =========================================================

toggleBtn.addEventListener("click",()=>{

document
.querySelectorAll(".sidebar-btn")
.forEach(b=>b.classList.remove("active"))

toggleBtn.classList.add("active")

chatWorkspace.classList.add("hidden")

welcomeWorkspace.classList.remove("hidden")

})

// =========================================================
// HOME
// =========================================================

homeBtn.addEventListener("click",()=>{

window.location.href="/"

})

// =========================================================
// DASHBOARD
// =========================================================

dashboardBtn.addEventListener("click",()=>{

window.location.href="/dashboard/"

})

// =========================================================
// AVATAR UPLOAD
// =========================================================

avatarInput.addEventListener("change",(e)=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = function(event){

avatarPreview.src =
event.target.result

}

reader.readAsDataURL(file)

})

// =========================================================
// MEDIA ATTACHMENTS
// =========================================================

mediaBtn.addEventListener("click",()=>{

mediaInput.click()

})

mediaInput.addEventListener("change",(e)=>{

mediaPreview.innerHTML = ""

const files =
[...e.target.files]

if(!files.length){
return
}

mediaPreview.classList.remove("hidden")

files.forEach(file=>{

const card =
document.createElement("div")

card.className =
"media-card"

card.innerHTML =
file.name

mediaPreview.appendChild(card)

})

})

// =========================================================
// VOICE NOTE SYSTEM
// =========================================================

voiceBtn.addEventListener("click",()=>{

composer.classList.add("hidden")

recordingPanel.classList.remove("hidden")

recordingSeconds = 0

recordingTimer.innerHTML =
"0:00"

recordingInterval =
setInterval(()=>{

recordingSeconds++

const mins =
Math.floor(recordingSeconds/60)

const secs =
recordingSeconds % 60

recordingTimer.innerHTML =
`${mins}:${secs.toString().padStart(2,"0")}`

},1000)

})

cancelRecording.addEventListener("click",()=>{

clearInterval(recordingInterval)

recordingPanel.classList.add("hidden")

composer.classList.remove("hidden")

})

document
.getElementById("sendRecording")
.addEventListener("click",()=>{

clearInterval(recordingInterval)

recordingPanel.classList.add("hidden")

composer.classList.remove("hidden")

})
