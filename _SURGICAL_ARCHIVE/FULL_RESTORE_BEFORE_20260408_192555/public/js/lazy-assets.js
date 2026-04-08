document.querySelectorAll("img").forEach(img=>{
img.loading="lazy"
})

document.querySelectorAll("audio").forEach(a=>{
a.preload="metadata"
})
