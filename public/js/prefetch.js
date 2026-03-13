document.querySelectorAll(".card").forEach(card=>{

card.addEventListener("mouseenter",()=>{

const path = card.getAttribute("onclick")
if(!path) return

const url = path.replace("window.location.href=","").replace(/[();']/g,"")

const link=document.createElement("link")
link.rel="prefetch"
link.href=url

document.head.appendChild(link)

})

})
