export function go(path){
window.location.href = path
}

export function showLoader(){
const loader=document.getElementById("globalLoader")
if(loader) loader.style.display="flex"
}

export function hideLoader(){
const loader=document.getElementById("globalLoader")
if(loader) loader.style.display="none"
}

export async function api(url,data){

const res = await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
})

return res.json()

}

export function prefetch(url){

const link=document.createElement("link")
link.rel="prefetch"
link.href=url
document.head.appendChild(link)

}