const roomButtons =
document.querySelectorAll(".room-btn")

const toggleBtn =
document.getElementById("toggleBtn")

const welcomeView =
document.getElementById("welcomeView")

const chatView =
document.getElementById("chatView")

const chatRoomTitle =
document.getElementById("chatRoomTitle")

const homeBtn =
document.getElementById("homeBtn")

const dashboardBtn =
document.getElementById("dashboardBtn")

const avatarInput =
document.getElementById("avatarInput")

const profileAvatar =
document.getElementById("profileAvatar")

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

const recordingMode =
document.getElementById("recordingMode")

const cancelRecording =
document.getElementById("cancelRecording")

const recordingTimer =
document.getElementById("recordingTimer")

let recordingInterval
let recordingSeconds = 0

# ============================================
# ROOM SWITCHING
# ============================================

roomButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

document
.querySelectorAll(".sidebar-btn")
.forEach(b=>b.classList.remove("active"))

btn.classList.add("active")

welcomeView.classList.add("hidden")

chatView.classList.remove("hidden")

chatRoomTitle.textContent =
btn.dataset.room

})

})

# ============================================
# TOGGLE
# ============================================

toggleBtn.addEventListener("click",()=>{

document
.querySelectorAll(".sidebar-btn")
.forEach(b=>b.classList.remove("active"))

toggleBtn.classList.add("active")

chatView.classList.add("hidden")

welcomeView.classList.remove("hidden")

})

# ============================================
# HOME
# ============================================

homeBtn.addEventListener("click",()=>{

window.location.href="/"

})

# ============================================
# DASHBOARD
# ============================================

dashboardBtn.addEventListener("click",()=>{

window.location.href="/dashboard/"

})

# ============================================
# AVATAR
# ============================================

avatarInput.addEventListener("change",(e)=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = function(event){

profileAvatar.src =
event.target.result

}

reader.readAsDataURL(file)

})

# ============================================
# MEDIA
# ============================================

mediaBtn.addEventListener("click",()=>{

mediaInput.click()

})

mediaInput.addEventListener("change",(e)=>{

mediaPreview.innerHTML = ""

const files = [...e.target.files]

if(!files.length){
return
}

mediaPreview.classList.remove("hidden")

files.forEach(file=>{

const card =
document.createElement("div")

card.className = "media-card"

card.innerHTML =
file.name

mediaPreview.appendChild(card)

})

})

# ============================================
# VOICE RECORDING
# ============================================

voiceBtn.addEventListener("click",()=>{

composer.classList.add("hidden")

recordingMode.classList.remove("hidden")

recordingSeconds = 0

recordingTimer.innerHTML = "0:00"

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

recordingMode.classList.add("hidden")

composer.classList.remove("hidden")

})

document
.getElementById("sendRecording")
.addEventListener("click",()=>{

clearInterval(recordingInterval)

recordingMode.classList.add("hidden")

composer.classList.remove("hidden")

})
