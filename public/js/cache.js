export function cacheSet(key,data){

localStorage.setItem(key,JSON.stringify({
data,
time:Date.now()
}))

}

export function cacheGet(key,maxAge){

const item=localStorage.getItem(key)

if(!item) return null

const obj=JSON.parse(item)

if(Date.now()-obj.time>maxAge){
localStorage.removeItem(key)
return null
}

return obj.data

}