export const queue=[]

export function addJob(job){
queue.push(job)
processQueue()
}

async function processQueue(){

if(queue.length===0) return

const job=queue.shift()

await fetch("/api/job",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(job)
})

processQueue()

}
