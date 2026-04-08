const qs = new URLSearchParams(location.search)

const plan = qs.get("plan")
const words = qs.get("words")

document.getElementById("continueBtn").onclick = async ()=>{

  const res = await fetch(
    "https://saybon-server.onrender.com/api/createJob",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        words,
        plan
      })
    }
  )

  const job = await res.json()

  location.href =
  "/translation/job.html?id="+job.id

}
