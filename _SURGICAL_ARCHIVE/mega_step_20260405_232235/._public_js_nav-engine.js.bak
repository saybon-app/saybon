document.addEventListener("DOMContentLoaded",()=>{

document.body.classList.add("loaded")

})


export function go(url){

document.body.classList.remove("loaded")
document.body.classList.add("fade-out")

setTimeout(()=>{

window.location.href=url

},250)

}


export function prefetch(url){

const link=document.createElement("link")

link.rel="prefetch"
link.href=url

document.head.appendChild(link)

}


/* PREFETCH ON HOVER */

document.querySelectorAll("a, .card, button").forEach(el=>{

el.addEventListener("mouseenter",()=>{

const href = el.getAttribute("href")

if(href){

prefetch(href)

}

})

})
